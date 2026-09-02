import Link from "next/link";
import { LogoBrand } from "@/components/brand/logo";
import { SUBJECTS } from "@/lib/subjects";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-semibold">Product</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Get started
                </Link>
              </li>
              <li>
                <Link href="/chat" className="hover:text-foreground">
                  Chat workspace
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-foreground">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Subjects</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {SUBJECTS.slice(0, 4).map((s) => (
                <li key={s.id}>
                  <a href="#subjects" className="hover:text-foreground">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">More subjects</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {SUBJECTS.slice(4).map((s) => (
                <li key={s.id}>
                  <a href="#subjects" className="hover:text-foreground">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold">Built with</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>LangGraph agents</li>
              <li>pgvector RAG</li>
              <li>Neon + Redis + Mem0</li>
              <li>LaTeX & vision</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <LogoBrand size="sm" />
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} IntellectA · Agentic AI Tutor for students
          </p>
        </div>
      </div>
    </footer>
  );
}
