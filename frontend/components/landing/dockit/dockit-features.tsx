"use client";

import { motion } from "framer-motion";
import { FolderTree, Search, Zap, Wand2 } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const FEATURES = [
  {
    icon: FolderTree,
    title: "Well organized",
    description:
      "Eight dedicated subject agents — Math, Physics, Chemistry, Biology, History, Politics, Geography & Economics.",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description:
      "Groq-powered responses with Redis caching. Quick load, smooth multi-turn conversations.",
  },
  {
    icon: Search,
    title: "Powerful RAG",
    description:
      "pgvector curriculum search grounds every answer in real academic content — not hallucinated fluff.",
  },
  {
    icon: Wand2,
    title: "Fully adaptive",
    description:
      "Evaluator agent quizzes you and adjusts difficulty. Mem0 remembers weak topics across devices.",
  },
];

export function DockitFeatures() {
  return (
    <section id="features" className="border-y border-border/60 bg-card/30 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Powerful features for{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                learning
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Explore the tools that make IntellectA efficient — routing, RAG,
              quizzes, and persistent memory.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="h-full rounded-2xl border border-border/70 bg-card/80 p-6 transition-shadow hover:shadow-lg hover:shadow-violet-500/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
