"use client";

import { motion } from "framer-motion";
import { Cloud, Database, Laptop, Smartphone, Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const LAYERS = [
  {
    icon: Database,
    title: "Neon PostgreSQL",
    desc: "Full chat history & sessions — permanent, cross-device.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-950/50",
  },
  {
    icon: Cloud,
    title: "Redis cache",
    desc: "Fast short-term context for multi-turn conversations.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-950/50",
  },
  {
    icon: Sparkles,
    title: "Mem0 memory",
    desc: "Personalization — weak topics & learning insights over time.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-950/50",
  },
];

export function MemorySyncSection() {
  return (
    <section id="memory" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <p className="section-label">Persistent learning</p>
            <h2 className="section-heading mt-3 text-left">
              Your progress follows you{" "}
              <span className="brand-gradient-text">everywhere</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Sign in once. Chat on your laptop, continue on your phone. History
              syncs from the server — not trapped in one browser tab.
            </p>

            <div className="mt-8 space-y-4">
              {LAYERS.map((layer, i) => (
                <motion.div
                  key={layer.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-xl border border-border/60 bg-card/60 p-4"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${layer.bg}`}
                  >
                    <layer.icon className={`h-5 w-5 ${layer.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold">{layer.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {layer.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <div className="glass-panel relative overflow-hidden rounded-3xl p-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-teal-500/10" />

              <div className="relative flex items-center justify-center gap-6 py-6">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
                    <Laptop className="h-7 w-7 text-violet-600" />
                  </div>
                  <span className="text-xs text-muted-foreground">Laptop</span>
                </motion.div>

                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    className="h-px w-16 bg-gradient-to-r from-transparent via-violet-500 to-transparent sm:w-24"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300">
                    Synced
                  </span>
                </div>

                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-card shadow-lg">
                    <Smartphone className="h-7 w-7 text-teal-600" />
                  </div>
                  <span className="text-xs text-muted-foreground">Phone</span>
                </motion.div>
              </div>

              <div className="relative mt-4 space-y-2 rounded-xl border border-border/60 bg-muted/40 p-4 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">You:</span>{" "}
                  Explain photosynthesis step by step
                </p>
                <p>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    Biology Agent:
                  </span>{" "}
                  Light-dependent reactions capture energy in ATP and NADPH…
                </p>
                <p className="text-center text-[10px] text-muted-foreground pt-2">
                  Same conversation on any device after login
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
