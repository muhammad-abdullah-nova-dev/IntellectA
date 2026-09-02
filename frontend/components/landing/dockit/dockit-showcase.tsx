"use client";

import { motion } from "framer-motion";
import { Bot, Route, Shield, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { AgentBadge } from "@/components/agent-badge";

const AGENTS = ["Router", "Scope Guard", "Evaluator", "Memory Writer"];

export function DockitShowcase() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Multi-agent pipeline{" "}
              <span className="text-violet-400">under the hood</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Not one generic bot — LangGraph orchestrates specialists for
              routing, teaching, quizzing, and memory.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <ScrollReveal>
            <div className="space-y-4">
              {[
                {
                  icon: Route,
                  title: "Smart router",
                  text: "Detects subject & intent — learn vs quiz vs evaluate.",
                },
                {
                  icon: Shield,
                  title: "Scope guard",
                  text: "Declines off-topic requests. Academics only.",
                },
                {
                  icon: Bot,
                  title: "8 specialists",
                  text: "Each subject agent uses RAG + tailored prompts.",
                },
                {
                  icon: Sparkles,
                  title: "Memory writer",
                  text: "Persists insights to Mem0 & PostgreSQL.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-xl border border-border/70 bg-card/60 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-black/40"
            >
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs text-muted-foreground">
                  intellecta.app/chat
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground">
                  Explain redox reactions step by step
                </div>
                <div className="max-w-[90%] space-y-2 rounded-2xl rounded-bl-md border border-border/70 bg-muted/30 p-4">
                  <AgentBadge agent="chemistry" />
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    A redox reaction involves transfer of electrons. Let&apos;s
                    break it into oxidation and reduction half-reactions…
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  {AGENTS.map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
