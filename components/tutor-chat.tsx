'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, RotateCcw, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Message = { role: 'user' | 'assistant'; content: string };

const MAX_QUESTION_LENGTH = 500;
const DAILY_LIMIT = 10;
const CONVERSATION_LIMIT = 8;
const USAGE_KEY = 'quantprep-tutor-usage-v1';
const ID_KEY = 'quantprep-anonymous-id-v1';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadUsage() {
  try {
    const saved = JSON.parse(localStorage.getItem(USAGE_KEY) ?? '{}');
    return saved.date === today() && Number.isFinite(saved.count) ? Math.max(0, saved.count) : 0;
  } catch {
    return 0;
  }
}

function anonymousId() {
  const existing = localStorage.getItem(ID_KEY);
  if (existing && /^[a-zA-Z0-9-]{8,64}$/.test(existing)) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem(ID_KEY, next);
  return next;
}

export function TutorChat({ problemId, solutionVisible }: { problemId: string; solutionVisible: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [dailyUsed, setDailyUsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setDailyUsed(loadUsage());
    const syncUsage = () => setDailyUsed(loadUsage());
    window.addEventListener('storage', syncUsage);
    return () => window.removeEventListener('storage', syncUsage);
  }, []);
  useEffect(() => () => abortRef.current?.abort(), []);

  const userMessages = useMemo(() => messages.filter((message) => message.role === 'user').length, [messages]);
  const dailyRemaining = Math.max(0, DAILY_LIMIT - dailyUsed);
  const conversationRemaining = Math.max(0, CONVERSATION_LIMIT - userMessages);
  const blocked = loading || dailyRemaining === 0 || conversationRemaining === 0;

  async function ask(question = input) {
    const cleanQuestion = question.trim().slice(0, MAX_QUESTION_LENGTH);
    const currentUsage = loadUsage();
    if (currentUsage >= DAILY_LIMIT) {
      setDailyUsed(currentUsage);
      setNotice('Daily tutor limit reached. Try again tomorrow.');
      return;
    }
    if (!cleanQuestion || blocked) return;

    const priorMessages = messages.slice(-6);
    setInput('');
    setNotice(null);
    setLoading(true);
    setMessages((current) => [...current, { role: 'user', content: cleanQuestion }, { role: 'assistant', content: '' }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId,
          question: cleanQuestion,
          history: priorMessages,
          solutionVisible,
          anonymousId: anonymousId(),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(error?.message ?? 'The tutor could not answer right now.');
      }

      if (!response.body) throw new Error('The tutor returned an empty response.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages((current) => [...current.slice(0, -1), { role: 'assistant', content: answer }]);
      }

      const nextUsed = Math.min(DAILY_LIMIT, loadUsage() + 1);
      setDailyUsed(nextUsed);
      localStorage.setItem(USAGE_KEY, JSON.stringify({ date: today(), count: nextUsed }));
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : 'The tutor could not answer right now.';
      setMessages((current) => current.slice(0, -2));
      setNotice(message);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function resetConversation() {
    abortRef.current?.abort();
    setMessages([]);
    setInput('');
    setNotice(null);
    setLoading(false);
  }

  return (
    <section aria-labelledby="ai-tutor-title">
      <Card>
        <CardHeader className="gap-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle id="ai-tutor-title" className="flex items-center gap-2"><Bot className="size-5" /> AI problem tutor</CardTitle>
              <CardDescription className="mt-1">Ask for a nudge, an explanation, or help checking your approach. It knows this problem and its verified solution.</CardDescription>
            </div>
            {messages.length > 0 && <Button type="button" variant="ghost" size="sm" onClick={resetConversation}><RotateCcw /> Reset</Button>}
          </div>
          <p className="text-sm text-muted-foreground">{dailyRemaining} of {DAILY_LIMIT} questions left today · {conversationRemaining} left in this conversation</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {['Give me a small hint', 'Check my approach', 'Explain the key idea'].map((prompt) => (
                <Button key={prompt} type="button" variant="outline" size="sm" disabled={blocked} onClick={() => void ask(prompt)}>{prompt}</Button>
              ))}
            </div>
          )}

          {messages.length > 0 && <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-3" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'ml-auto max-w-[88%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground' : 'max-w-[92%] whitespace-pre-wrap rounded-lg bg-background px-3 py-2 text-sm leading-6 shadow-sm'}>
                {message.content || (loading ? 'Thinking…' : '')}
              </div>
            ))}
          </div>}

          {notice && <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">{notice}</p>}
          {dailyRemaining === 0 && <p className="text-sm text-muted-foreground">Daily limit reached. The tutor resets tomorrow; hints and solutions remain available.</p>}
          {conversationRemaining === 0 && dailyRemaining > 0 && <p className="text-sm text-muted-foreground">Conversation limit reached. Reset the chat to start a fresh thread.</p>}

          <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); void ask(); }}>
            <textarea
              className="min-h-24 w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={input}
              onChange={(event) => setInput(event.target.value.slice(0, MAX_QUESTION_LENGTH))}
              placeholder="What part are you stuck on?"
              maxLength={MAX_QUESTION_LENGTH}
              disabled={blocked}
              aria-label="Question for the AI tutor"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">{input.length}/{MAX_QUESTION_LENGTH} characters</span>
              <Button type="submit" disabled={blocked || !input.trim()}>{loading ? 'Answering…' : 'Ask tutor'} <Send /></Button>
            </div>
          </form>
          <p className="text-xs leading-5 text-muted-foreground">AI can make mistakes. Use the verified solution as the final reference.</p>
        </CardContent>
      </Card>
    </section>
  );
}
