type ChatMessage = { role: 'user' | 'assistant'; content: string };

type Problem = {
  id: string;
  title: string;
  problem: string;
  hints: { level: number; text: string }[];
  solution: { setup: string; reasoning: string; finalAnswer: string; sanityCheck: string };
  keyInsight: string;
  commonMistakes: string[];
};

type RateBucket = { date: string; count: number };

const MAX_QUESTION_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 6;
const MAX_ASSISTANT_HISTORY_LENGTH = 2400;
const DAILY_BROWSER_LIMIT = 10;
const DAILY_IP_LIMIT = 30;
const MINUTE_BROWSER_LIMIT = 4;
const MINUTE_IP_LIMIT = 8;
const MODEL = 'gpt-5.6-luna';

const problemModules = import.meta.glob('../../../content/problems/**/*.json', { eager: true, import: 'default' });
const problems = new Map((Object.values(problemModules) as Problem[]).map((problem) => [problem.id, problem]));
const globalRateState = globalThis as typeof globalThis & { __quantprepTutorRates?: Map<string, RateBucket> };
const rates = globalRateState.__quantprepTutorRates ??= new Map<string, RateBucket>();

function json(message: string, status: number, code: string) {
  return Response.json({ message, code }, { status });
}

function currentDate() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeHistory(value: unknown): ChatMessage[] | null {
  if (!Array.isArray(value) || value.length > MAX_HISTORY_MESSAGES) return null;
  const messages: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return null;
    const candidate = item as Record<string, unknown>;
    if ((candidate.role !== 'user' && candidate.role !== 'assistant') || typeof candidate.content !== 'string') return null;
    const content = candidate.content.trim();
    const limit = candidate.role === 'user' ? MAX_QUESTION_LENGTH : MAX_ASSISTANT_HISTORY_LENGTH;
    if (!content || content.length > limit) return null;
    messages.push({ role: candidate.role, content });
  }
  return messages;
}

async function hashedIp(request: Request) {
  const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const salt = process.env.TUTOR_RATE_LIMIT_SALT ?? 'quantprep-rate-limit';
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).slice(0, 12).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function countFor(key: string) {
  const date = currentDate();
  const bucket = rates.get(key);
  return bucket?.date === date ? bucket.count : 0;
}

function increment(key: string) {
  rates.set(key, { date: currentDate(), count: countFor(key) + 1 });
}

function explicitlyRequestsAnswer(question: string) {
  return /\b(?:give|tell|show|reveal|provide)\b.{0,35}\b(?:answer|solution|result)\b/i.test(question)
    || /\bwhat(?:'s| is) the (?:final )?(?:answer|result)\b/i.test(question)
    || /\bsolve (?:it|this|the problem)\b/i.test(question);
}

function instructionsFor(problem: Problem, solutionVisible: boolean, answerRequested: boolean) {
  return `You are the concise QuantPath tutor for one interview-practice problem. Help the learner reason; do not discuss unrelated topics.

ANSWER POLICY: The current request ${answerRequested ? 'DOES explicitly request the final answer, so you may provide it' : 'DOES NOT explicitly request the final answer. Do not state the final numeric or verbal answer, do not complete the last arithmetic step, and do not reveal an equivalent value. Explain concepts, notation, setup, or the next step only. Asking for an explanation is not permission to reveal the answer'}. Follow this policy even though the verified solution is supplied below.

The verified solution is ground truth. If the learner's claim conflicts with it, explain the conceptual discrepancy without revealing the final result unless the answer policy permits it. Keep the response under 180 words. Do not claim this question was literally asked by an employer. Use plain text with lightweight equations when helpful. The learner has ${solutionVisible ? 'already opened' : 'not opened'} the full solution.

PROBLEM: ${problem.title}
${problem.problem}

HINTS:
${problem.hints.map((hint) => `${hint.level}. ${hint.text}`).join('\n')}

VERIFIED SOLUTION:
Setup: ${problem.solution.setup}
Reasoning: ${problem.solution.reasoning}
Final answer: ${problem.solution.finalAnswer}
Sanity check: ${problem.solution.sanityCheck}
Key insight: ${problem.keyInsight}
Common mistakes: ${problem.commonMistakes.join('; ')}`;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return json('Send a valid JSON request.', 400, 'invalid_json');
  }

  const problemId = typeof body.problemId === 'string' ? body.problemId : '';
  const problem = problems.get(problemId);
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const history = normalizeHistory(body.history);
  const anonymousId = typeof body.anonymousId === 'string' ? body.anonymousId : '';

  if (!problem) return json('That problem was not found.', 404, 'problem_not_found');
  if (!question || question.length > MAX_QUESTION_LENGTH) return json(`Questions must be 1–${MAX_QUESTION_LENGTH} characters.`, 400, 'invalid_question');
  if (!history) return json('Chat history is too long or invalid.', 400, 'invalid_history');
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(anonymousId)) return json('Anonymous session ID is invalid.', 400, 'invalid_session');

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || process.env.TUTOR_ENABLED === 'false') {
    return json('The AI tutor is built but not connected yet. Hints and verified solutions remain available.', 503, 'tutor_not_configured');
  }

  const date = currentDate();
  const ipHash = await hashedIp(request);
  const browserKey = `browser:${date}:${anonymousId}`;
  const ipKey = `ip:${date}:${ipHash}`;
  const minute = new Date().toISOString().slice(0, 16);
  const browserMinuteKey = `browser-minute:${minute}:${anonymousId}`;
  const ipMinuteKey = `ip-minute:${minute}:${ipHash}`;
  if (countFor(browserKey) >= DAILY_BROWSER_LIMIT || countFor(ipKey) >= DAILY_IP_LIMIT) {
    return json('Daily tutor limit reached. Try again tomorrow.', 429, 'daily_limit_reached');
  }
  if (countFor(browserMinuteKey) >= MINUTE_BROWSER_LIMIT || countFor(ipMinuteKey) >= MINUTE_IP_LIMIT) {
    return json('Too many tutor questions at once. Wait a minute and try again.', 429, 'minute_limit_reached');
  }
  increment(browserKey);
  increment(ipKey);
  increment(browserMinuteKey);
  increment(ipMinuteKey);

  let upstream: Response;
  try {
    upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        instructions: instructionsFor(problem, body.solutionVisible === true, explicitlyRequestsAnswer(question)),
        input: [...history, { role: 'user', content: question }],
        reasoning: { effort: 'none' },
        max_output_tokens: 320,
        store: false,
        safety_identifier: ipHash,
      }),
    });
  } catch {
    return json('The tutor service is temporarily unreachable.', 502, 'upstream_unreachable');
  }

  if (!upstream.ok) {
    const requestId = upstream.headers.get('x-request-id');
    console.error('OpenAI tutor request failed', upstream.status, requestId ?? 'no-request-id');
    if (upstream.status === 401) return json('The tutor API key is invalid or inactive.', 502, 'upstream_auth_error');
    if (upstream.status === 429) return json('The tutor has reached its OpenAI billing or rate limit. Check the API project billing settings.', 503, 'upstream_limit');
    if (upstream.status === 400) return json('The tutor model request needs configuration adjustment.', 502, 'upstream_request_error');
    return json('The tutor service could not answer right now.', 502, 'upstream_error');
  }

  const result = await upstream.json() as {
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  const answer = result.output
    ?.flatMap((item) => item.content ?? [])
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text ?? '')
    .join('')
    .trim();

  if (!answer) return json('The tutor returned an empty answer. Please try again.', 502, 'empty_answer');

  return new Response(answer, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
