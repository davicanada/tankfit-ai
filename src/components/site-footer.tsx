import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p>© 2026 Davi Almeida. Independent portfolio project.</p>
        <div className="flex gap-5">
          <Link href="/catalog" className="hover:text-foreground">Fictional catalog</Link>
          <a
            href="https://github.com/davicanada/tankfit-ai"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            Source code
          </a>
        </div>
      </div>
    </footer>
  );
}
