'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Shuffle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import categories from '../content/categories.json';
import techniques from '../content/techniques.json';

type Problem = {
  id: string;
  title: string;
  difficulty: number;
  mode: 'learn' | 'practice';
  categories: string[];
  techniqueVisibility: 'shown' | 'hidden-until-solution';
  sequence: number;
  primaryTechnique: string;
  tags: string[];
  problem: string;
  hints: { level: number; text: string }[];
  solution: { setup: string; reasoning: string; finalAnswer: string; sanityCheck: string };
  keyInsight: string;
  recognitionCues: string[];
  commonMistakes: string[];
  followUps: string[];
};

const problemModules = import.meta.glob('../content/problems/**/*.json', { eager: true, import: 'default' });
const problems = (Object.values(problemModules) as Problem[]).sort((a, b) => a.id.localeCompare(b.id));
const learningCategories = categories.filter((category) => problems.some((problem) => problem.mode === 'learn' && problem.categories.includes(category.id)));

export default function Home() {
  const [view, setView] = useState<'learn' | 'practice'>('learn');
  const [categoryId, setCategoryId] = useState(learningCategories[0].id);
  const [problemId, setProblemId] = useState<string | null>(null);
  const [visibleHints, setVisibleHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const problem = problems.find((item) => item.id === problemId) ?? null;

  const visibleProblems = useMemo(() => {
    if (view === 'practice') return problems.filter((item) => item.mode === 'practice').sort((a, b) => a.sequence - b.sequence);
    return problems.filter((item) => item.mode === 'learn' && item.categories[0] === categoryId).sort((a, b) => a.sequence - b.sequence);
  }, [view, categoryId]);

  function goHome(nextView: 'learn' | 'practice' = view) {
    setProblemId(null);
    setView(nextView);
  }

  function openProblem(item: Problem) {
    setProblemId(item.id);
    setVisibleHints(0);
    setShowSolution(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (problem) {
    const navigationSet = problem.mode === 'practice'
      ? problems.filter((item) => item.mode === 'practice').sort((a, b) => a.sequence - b.sequence)
      : problems.filter((item) => item.mode === 'learn' && item.categories[0] === problem.categories[0]).sort((a, b) => a.sequence - b.sequence);
    const index = navigationSet.findIndex((item) => item.id === problem.id);
    const showTechnique = problem.techniqueVisibility === 'shown' || showSolution;

    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header onLearn={() => goHome('learn')} onPractice={() => goHome('practice')} />
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
          <Button variant="ghost" onClick={() => goHome(problem.mode)}><ArrowLeft /> Back to {problem.mode}</Button>
          <article className="mt-6 space-y-6">
            <header>
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge>Difficulty {problem.difficulty}</Badge>
                <Badge variant="outline">{problem.mode === 'learn' ? 'Learning track' : 'Mixed practice'}</Badge>
                {problem.categories.map((id) => <Badge key={id} variant="secondary">{categoryTitle(id)}</Badge>)}
                {showTechnique && <Badge variant="outline">Technique: {techniqueTitle(problem.primaryTechnique)}</Badge>}
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">{problem.title}</h1>
              {problem.mode === 'practice' && !showSolution && <p className="mt-2 text-muted-foreground">The technique is hidden. Decide what structure you notice before opening a hint.</p>}
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
                {problem.techniqueVisibility === 'hidden-until-solution' && <div><h3 className="font-semibold">Primary technique</h3><p className="mt-1 text-muted-foreground">{techniqueTitle(problem.primaryTechnique)}</p></div>}
                <Part title="Setup" text={problem.solution.setup} /><Part title="Reasoning" text={problem.solution.reasoning} /><Part title="Final answer" text={problem.solution.finalAnswer} /><Part title="Sanity check" text={problem.solution.sanityCheck} /><hr />
                <Part title="Key insight" text={problem.keyInsight} /><List title="Recognition cues" items={problem.recognitionCues} /><List title="Common mistakes" items={problem.commonMistakes} /><List title="Follow-up questions" items={problem.followUps} />
              </CardContent></Card>}
            </section>

            <nav className="flex items-center justify-between border-t pt-6" aria-label="Problem navigation">
              <Button variant="outline" disabled={index === 0} onClick={() => openProblem(navigationSet[index - 1])}><ArrowLeft /> Previous</Button>
              <span className="text-sm text-muted-foreground">{index + 1} of {navigationSet.length}</span>
              <Button variant="outline" disabled={index === navigationSet.length - 1} onClick={() => openProblem(navigationSet[index + 1])}>Next <ArrowRight /></Button>
            </nav>
          </article>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header onLearn={() => goHome('learn')} onPractice={() => goHome('practice')} />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-end">
          <div><h1 className="text-3xl font-semibold tracking-tight">QuantPrep curriculum</h1><p className="mt-2 max-w-2xl text-muted-foreground">Learn techniques directly, then test whether you can recognize them in mixed interview-style problems.</p></div>
          <span className="text-sm text-muted-foreground">{problems.length} problems · {learningCategories.length} active categories</span>
        </div>

        <Tabs value={view} onValueChange={(value) => setView(value as 'learn' | 'practice')} className="mt-6">
          <TabsList>
            <TabsTrigger value="learn"><BookOpen /> Learn</TabsTrigger>
            <TabsTrigger value="practice"><Shuffle /> Mixed practice</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === 'learn' ? <>
          <section className="mt-7" aria-labelledby="categories-title">
            <h2 id="categories-title" className="text-xl font-semibold">Choose a category</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {learningCategories.map((item) => <button key={item.id} type="button" onClick={() => setCategoryId(item.id)} className={`rounded-xl border p-4 text-left transition-colors hover:bg-muted ${categoryId === item.id ? 'border-primary bg-muted' : ''}`}><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-5 text-muted-foreground">{item.summary}</p></button>)}
            </div>
          </section>
          <ProblemList title={categoryTitle(categoryId)} description="Three guided problems that increase in difficulty." items={visibleProblems} onOpen={openProblem} revealTechnique />
        </> : <ProblemList title="Mixed interview practice" description="Categories are shown, but the primary technique stays hidden until you reveal the solution." items={visibleProblems} onOpen={openProblem} revealTechnique={false} />}
      </div>
    </main>
  );
}

function ProblemList({ title, description, items, onOpen, revealTechnique }: { title: string; description: string; items: Problem[]; onOpen: (problem: Problem) => void; revealTechnique: boolean }) {
  return <section className="mt-8"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-1 text-muted-foreground">{description}</p><div className="mt-5 grid gap-4">{items.map((item) => <Card key={item.id}><CardHeader><div className="flex flex-wrap gap-2"><Badge variant="outline">Difficulty {item.difficulty}</Badge>{item.categories.map((id) => <Badge key={id} variant="secondary">{categoryTitle(id)}</Badge>)}{revealTechnique && <Badge variant="outline">{techniqueTitle(item.primaryTechnique)}</Badge>}</div><CardTitle className="mt-2 text-lg">{item.title}</CardTitle><CardDescription>{item.problem}</CardDescription></CardHeader><CardContent className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4" /> Verified solution</span><Button onClick={() => onOpen(item)}>Practice <ArrowRight /></Button></CardContent></Card>)}</div></section>;
}

function Header({ onLearn, onPractice }: { onLearn: () => void; onPractice: () => void }) { return <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"><button type="button" onClick={onLearn} className="text-lg font-semibold">QuantPrep</button><nav className="flex gap-5 text-sm"><button type="button" onClick={onLearn} className="hover:underline">Learn</button><button type="button" onClick={onPractice} className="hover:underline">Mixed practice</button></nav></div></header>; }
function Part({ title, text }: { title: string; text: string }) { return <div><h3 className="font-semibold">{title}</h3><p className="mt-1 leading-7 text-muted-foreground">{text}</p></div>; }
function List({ title, items }: { title: string; items: readonly string[] }) { return <div><h3 className="font-semibold">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>; }
function techniqueTitle(id: string) { return techniques.find((item) => item.id === id)?.title ?? id; }
function categoryTitle(id: string) { return categories.find((item) => item.id === id)?.title ?? id; }
