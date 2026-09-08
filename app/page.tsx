'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import techniques from '../content/techniques.json';
import cp01 from '../content/problems/conditional-probability/cp-01.json';
import cp02 from '../content/problems/conditional-probability/cp-02.json';
import cp03 from '../content/problems/conditional-probability/cp-03.json';
import fsa01 from '../content/problems/first-step-analysis/fsa-01.json';
import fsa02 from '../content/problems/first-step-analysis/fsa-02.json';
import fsa03 from '../content/problems/first-step-analysis/fsa-03.json';
import loe01 from '../content/problems/linearity-of-expectation/loe-01.json';
import loe02 from '../content/problems/linearity-of-expectation/loe-02.json';
import loe03 from '../content/problems/linearity-of-expectation/loe-03.json';

const problems = [cp01, cp02, cp03, loe01, loe02, loe03, fsa01, fsa02, fsa03];
const activeTechniques = techniques.filter((technique) => technique.status === 'active');
type Problem = (typeof problems)[number];

export default function Home() {
  const [techniqueId, setTechniqueId] = useState(activeTechniques[0].id);
  const [problemId, setProblemId] = useState<string | null>(null);
  const [visibleHints, setVisibleHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const problem = problems.find((item) => item.id === problemId) ?? null;
  const techniqueProblems = useMemo(() => problems.filter((item) => item.primaryTechnique === techniqueId), [techniqueId]);
  const technique = activeTechniques.find((item) => item.id === techniqueId);

  function openProblem(item: Problem) {
    setTechniqueId(item.primaryTechnique);
    setProblemId(item.id);
    setVisibleHints(0);
    setShowSolution(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (problem) {
    const index = problems.findIndex((item) => item.id === problem.id);
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header onHome={() => setProblemId(null)} />
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <Button variant="ghost" onClick={() => setProblemId(null)}><ArrowLeft /> Back to curriculum</Button>
          <article className="mt-6 space-y-6">
            <header>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>Difficulty {problem.difficulty}</Badge>
                <Badge variant="outline">{techniqueTitle(problem.primaryTechnique)}</Badge>
                {problem.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">{problem.title}</h1>
            </header>
            <Card><CardHeader><CardTitle>Problem</CardTitle></CardHeader><CardContent><p className="text-base leading-7">{problem.problem}</p></CardContent></Card>
            <section>
              <h2 className="mb-3 text-xl font-semibold">Hints</h2>
              <div className="space-y-3">
                {problem.hints.slice(0, visibleHints).map((hint) => <Card key={hint.level} size="sm"><CardHeader><CardTitle>Hint {hint.level}</CardTitle></CardHeader><CardContent><p className="leading-6">{hint.text}</p></CardContent></Card>)}
                {visibleHints < 2 && <Button variant="outline" onClick={() => setVisibleHints(visibleHints + 1)}>Reveal hint {visibleHints + 1}</Button>}
              </div>
            </section>
            <section>
              <h2 className="mb-3 text-xl font-semibold">Solution</h2>
              {!showSolution ? <Button onClick={() => setShowSolution(true)}>Reveal full solution</Button> : <Card><CardContent className="space-y-5">
                <Part title="Setup" text={problem.solution.setup} /><Part title="Reasoning" text={problem.solution.reasoning} /><Part title="Final answer" text={problem.solution.finalAnswer} /><Part title="Sanity check" text={problem.solution.sanityCheck} /><hr /><Part title="Key insight" text={problem.keyInsight} />
                <List title="Recognition cues" items={problem.recognitionCues} /><List title="Common mistakes" items={problem.commonMistakes} /><List title="Follow-up questions" items={problem.followUps} />
              </CardContent></Card>}
            </section>
            <nav className="flex items-center justify-between border-t pt-6" aria-label="Problem navigation">
              <Button variant="outline" disabled={index === 0} onClick={() => openProblem(problems[index - 1])}><ArrowLeft /> Previous</Button>
              <span className="text-sm text-muted-foreground">{index + 1} of {problems.length}</span>
              <Button variant="outline" disabled={index === problems.length - 1} onClick={() => openProblem(problems[index + 1])}>Next <ArrowRight /></Button>
            </nav>
          </article>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header onHome={() => setProblemId(null)} />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <section className="max-w-3xl">
          <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">Technique-first practice</p>
          <h1 className="text-4xl font-semibold tracking-tight">Learn what to notice, then learn what to do.</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">QuantPrep teaches reusable quant interview techniques through progressively harder problems, guided hints, complete solutions, and recognition cues.</p>
        </section>
        <section className="mt-10" aria-labelledby="techniques-title">
          <div className="mb-4 flex items-end justify-between gap-4"><div><h2 id="techniques-title" className="text-2xl font-semibold">Techniques</h2><p className="mt-1 text-muted-foreground">Choose a technique to view its current problem set.</p></div><span className="text-sm text-muted-foreground">9 approved problems</span></div>
          <div className="grid gap-4 md:grid-cols-3">
            {activeTechniques.map((item) => <button key={item.id} type="button" onClick={() => setTechniqueId(item.id)} className={`rounded-xl border p-5 text-left transition-colors hover:bg-muted ${techniqueId === item.id ? 'border-primary bg-muted' : ''}`}><BookOpen className="mb-4 size-5" /><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{'summary' in item ? item.summary : ''}</p></button>)}
          </div>
        </section>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">{technique?.title}</h2>
          {'summary' in (technique ?? {}) && <p className="mt-2 max-w-3xl text-muted-foreground">{technique?.summary}</p>}
          <div className="mt-5 grid gap-4">
            {techniqueProblems.map((item) => <Card key={item.id}><CardHeader><div className="flex flex-wrap items-center gap-2"><Badge variant="outline">Difficulty {item.difficulty}</Badge>{item.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div><CardTitle className="mt-2 text-lg">{item.title}</CardTitle><CardDescription>{item.problem}</CardDescription></CardHeader><CardContent className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4" /> Verified solution</span><Button onClick={() => openProblem(item)}>Practice <ArrowRight /></Button></CardContent></Card>)}
          </div>
        </section>
        <section id="how-it-works" className="mt-12 border-t pt-8"><h2 className="text-xl font-semibold">How to use QuantPrep</h2><ol className="mt-3 list-decimal space-y-2 pl-5 text-muted-foreground"><li>Attempt the problem before revealing a hint.</li><li>Use hints one at a time when genuinely stuck.</li><li>Compare your reasoning—not only your answer—with the solution.</li><li>Study the recognition cue so you can identify the technique later.</li></ol></section>
      </div>
    </main>
  );
}

function Header({ onHome }: { onHome: () => void }) { return <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"><button type="button" onClick={onHome} className="text-lg font-semibold">QuantPrep</button><nav className="flex gap-5 text-sm"><button type="button" onClick={onHome} className="hover:underline">Curriculum</button><a href="#how-it-works" className="hover:underline">How it works</a></nav></div></header>; }
function Part({ title, text }: { title: string; text: string }) { return <div><h3 className="font-semibold">{title}</h3><p className="mt-1 leading-7 text-muted-foreground">{text}</p></div>; }
function List({ title, items }: { title: string; items: readonly string[] }) { return <div><h3 className="font-semibold">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>; }
function techniqueTitle(id: string) { return techniques.find((item) => item.id === id)?.title ?? id; }
