'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Search, Shuffle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
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
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [practiceCategory, setPracticeCategory] = useState('all');
  const [sortBy, setSortBy] = useState('sequence');
  const problem = problems.find((item) => item.id === problemId) ?? null;

  const visibleProblems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = problems.filter((item) => {
      if (item.mode !== view) return false;
      if (view === 'learn' && item.categories[0] !== categoryId) return false;
      if (view === 'practice' && practiceCategory !== 'all' && !item.categories.includes(practiceCategory)) return false;
      if (difficulty !== 'all' && item.difficulty !== Number(difficulty)) return false;
      if (!query) return true;
      const searchable = [item.title, item.problem, item.primaryTechnique, ...item.categories, ...item.tags]
        .map((value) => value.replaceAll('-', ' '))
        .join(' ')
        .toLowerCase();
      return searchable.includes(query);
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'difficulty-asc') return a.difficulty - b.difficulty || a.sequence - b.sequence;
      if (sortBy === 'difficulty-desc') return b.difficulty - a.difficulty || a.sequence - b.sequence;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return a.sequence - b.sequence;
    });
  }, [view, categoryId, practiceCategory, difficulty, search, sortBy]);

  const filtersActive = Boolean(search || difficulty !== 'all' || (view === 'practice' && practiceCategory !== 'all') || sortBy !== 'sequence');

  function clearFilters() {
    setSearch('');
    setDifficulty('all');
    setPracticeCategory('all');
    setSortBy('sequence');
  }

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

        <div className="mt-6 flex w-fit gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Practice mode">
          <Button variant={view === 'learn' ? 'default' : 'ghost'} role="tab" aria-selected={view === 'learn'} onClick={() => setView('learn')}><BookOpen /> Learn</Button>
          <Button variant={view === 'practice' ? 'default' : 'ghost'} role="tab" aria-selected={view === 'practice'} onClick={() => setView('practice')}><Shuffle /> Mixed practice</Button>
        </div>

        <section className="mt-6 rounded-xl border bg-card p-4" aria-label="Find and sort problems">
          <div className={`grid gap-3 ${view === 'practice' ? 'md:grid-cols-[minmax(15rem,1fr)_repeat(3,minmax(10rem,auto))]' : 'md:grid-cols-[minmax(15rem,1fr)_repeat(2,minmax(10rem,auto))]'}`}>
            <label className="relative block">
              <span className="sr-only">Search problems</span>
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input className="h-8 w-full rounded-lg border border-input bg-transparent py-1 pl-8 pr-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles, prompts, or topics" />
            </label>
            {view === 'practice' && <label><span className="sr-only">Problem category</span><NativeSelect className="w-full" value={practiceCategory} onChange={(event) => setPracticeCategory(event.target.value)}><NativeSelectOption value="all">All categories</NativeSelectOption>{learningCategories.map((item) => <NativeSelectOption key={item.id} value={item.id}>{item.title}</NativeSelectOption>)}</NativeSelect></label>}
            <label><span className="sr-only">Difficulty</span><NativeSelect className="w-full" value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><NativeSelectOption value="all">All difficulties</NativeSelectOption>{[1, 2, 3, 4, 5].map((level) => <NativeSelectOption key={level} value={level}>Difficulty {level}</NativeSelectOption>)}</NativeSelect></label>
            <label><span className="sr-only">Sort problems</span><NativeSelect className="w-full" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><NativeSelectOption value="sequence">Curriculum order</NativeSelectOption><NativeSelectOption value="difficulty-asc">Difficulty: low to high</NativeSelectOption><NativeSelectOption value="difficulty-desc">Difficulty: high to low</NativeSelectOption><NativeSelectOption value="title">Title: A to Z</NativeSelectOption></NativeSelect></label>
          </div>
          <div className="mt-3 flex min-h-8 items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>{visibleProblems.length} {visibleProblems.length === 1 ? 'problem' : 'problems'} shown</span>
            {filtersActive && <Button variant="ghost" size="sm" onClick={clearFilters}><X /> Clear filters</Button>}
          </div>
        </section>

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
  return <section className="mt-8"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-1 text-muted-foreground">{description}</p>{items.length === 0 ? <Card className="mt-5"><CardContent className="py-10 text-center"><p className="font-medium">No problems match these filters.</p><p className="mt-1 text-sm text-muted-foreground">Try a broader search or a different difficulty.</p></CardContent></Card> : <div className="mt-5 grid gap-4">{items.map((item) => <Card key={item.id}><CardHeader><div className="flex flex-wrap gap-2"><Badge variant="outline">Difficulty {item.difficulty}</Badge>{item.categories.map((id) => <Badge key={id} variant="secondary">{categoryTitle(id)}</Badge>)}{revealTechnique && <Badge variant="outline">{techniqueTitle(item.primaryTechnique)}</Badge>}</div><CardTitle className="mt-2 text-lg">{item.title}</CardTitle><CardDescription>{item.problem}</CardDescription></CardHeader><CardContent className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="size-4" /> Verified solution</span><Button onClick={() => onOpen(item)}>Practice <ArrowRight /></Button></CardContent></Card>)}</div>}</section>;
}

function Header({ onLearn, onPractice }: { onLearn: () => void; onPractice: () => void }) { return <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"><button type="button" onClick={onLearn} className="text-lg font-semibold">QuantPrep</button><nav className="flex gap-5 text-sm"><button type="button" onClick={onLearn} className="hover:underline">Learn</button><button type="button" onClick={onPractice} className="hover:underline">Mixed practice</button></nav></div></header>; }
function Part({ title, text }: { title: string; text: string }) { return <div><h3 className="font-semibold">{title}</h3><p className="mt-1 leading-7 text-muted-foreground">{text}</p></div>; }
function List({ title, items }: { title: string; items: readonly string[] }) { return <div><h3 className="font-semibold">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>; }
function techniqueTitle(id: string) { return techniques.find((item) => item.id === id)?.title ?? id; }
function categoryTitle(id: string) { return categories.find((item) => item.id === id)?.title ?? id; }
