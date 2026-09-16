export function SiteFooter() {
  return (
    <footer className="mt-12 border-t bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="max-w-2xl space-y-1">
          <p>QuantPath is independent educational practice, not financial or employment advice.</p>
          <p>Employer tags indicate practice themes, not verbatim, endorsed, or authenticated interview questions.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal and project information">
          <a className="hover:text-foreground hover:underline" href="/privacy">Privacy</a>
          <a className="hover:text-foreground hover:underline" href="/terms">Terms</a>
        </nav>
      </div>
    </footer>
  );
}
