"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAuthenticated } from "@/lib/auth";

const POPULAR = [
  "Explain Newton's laws",
  "Quiz me on organic chemistry",
  "What caused World War I?",
  "Photosynthesis steps",
];

export function DockitHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const goWithQuery = (text: string) => {
    const q = text.trim();
    if (q) sessionStorage.setItem("intellecta_seed_prompt", q);
    router.push(isAuthenticated() ? "/chat" : "/login");
  };

  return (
    <section className="relative mx-auto max-w-4xl px-6 pb-20 pt-16 text-center sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
      >
        <Sparkles className="h-4 w-4 text-violet-400" />
        Agentic AI tutor · 8 subjects only
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        Great learning{" "}
        <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          students love
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground"
      >
        Discover subject specialists, adaptive quizzes, and cloud-synced memory —
        built for focused academic help, not generic chat.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-auto mt-10 max-w-xl"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-border/80 bg-card/90 p-2 shadow-lg shadow-black/20 ring-1 ring-white/5">
          <Search className="ml-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goWithQuery(query)}
            placeholder="Ask anything academic…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground sm:inline">
            ↵
          </kbd>
          <Button
            size="sm"
            className="shrink-0 rounded-xl brand-gradient border-0 text-white"
            onClick={() => goWithQuery(query)}
          >
            Ask
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-muted-foreground">Popular:</span>
          {POPULAR.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                setQuery(tag);
                goWithQuery(tag);
              }}
              className="rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-violet-500/40 hover:text-foreground"
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-10"
      >
        <Button
          asChild
          size="lg"
          className="h-12 rounded-xl brand-gradient border-0 px-8 text-white shadow-lg shadow-violet-500/25"
        >
          <Link href="/login">
            Get started free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
