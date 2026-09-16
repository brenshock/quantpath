import type { ReactNode } from 'react';

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8"><a href="/" className="text-lg font-semibold">QuantPath</a><a href="/" className="text-sm hover:underline">Back to practice</a></div></header>
      <article className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {updated}</p>
        <div className="mt-8 space-y-7 text-base leading-7 [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-2 [&_ul]:mt-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6 [&_a]:underline">{children}</div>
      </article>
    </main>
  );
}
