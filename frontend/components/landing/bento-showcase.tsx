"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calculator,
  FlaskConical,
  ImagePlus,
  Orbit,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { ScrollReveal } from "./scroll-reveal";

const agents = [
  { label: "Math", icon: Calculator, color: "from-cyan-500 to-cyan-600" },
  { label: "Physics", icon: Orbit, color: "from-sky-500 to-indigo-600" },
  { label: "Chem", icon: FlaskConical, color: "from-indigo-500 to-violet-600" },
  { label: "History", icon: BookOpen, color: "from-cyan-600 to-indigo-600" },
];

function RoutingVisual() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % agents.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-5 space-y-3">
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">
        &ldquo;Explain redox reaction step by step&rdquo;
      </div>
      <div className="flex flex-wrap gap-2">
        {agents.map((a, i) => {
          const Icon = a.icon;
          const isActive = i === active;
          return (
            <motion.span
              key={a.label}
              animate={{
                scale: isActive ? 1.05 : 1,
                opacity: isActive ? 1 : 0.55,
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                isActive
                  ? "border-cyan-400/60 bg-gradient-to-r from-cyan-500/15 to-indigo-500/15 text-cyan-700 dark:border-cyan-500/40 dark:text-cyan-300"
                  : "border-slate-200/80 bg-white/50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-500"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${a.color} text-white`}
              >
                <Icon className="h-2.5 w-2.5" />
              </span>
              {a.label}
            </motion.span>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={active}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400"
        >
          → Routed to {agents[active].label} agent
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function LatexVisual() {
  return (
    <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-950 px-4 py-3 dark:border-slate-700">
      <p className="font-mono text-sm text-cyan-300">
        ∫<sub>0</sub>
        <sup>1</sup> x² dx = <span className="text-white">⅓</span>
      </p>
      <p className="mt-2 font-mono text-[11px] text-slate-500">
        {"\\frac{d}{dx}(x^n) = nx^{n-1}"}
      </p>
    </div>
  );
}

function PhotoVisual() {
  return (
    <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-cyan-400/40 bg-cyan-500/5 px-4 py-5 dark:border-cyan-500/30 dark:bg-cyan-950/20">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md">
        <ImagePlus className="h-5 w-5" />
      </div>
      <p className="mt-2 text-[11px] font-medium text-slate-600 dark:text-slate-400">
        Drop notebook photo
      </p>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">
        JPG · PNG · up to 5MB
      </p>
    </div>
  );
}

function RegenerateVisual() {
  return (
    <div className="mt-5 flex items-center gap-3">
      <div className="flex-1 space-y-2">
        <div className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Answer v1 — good
        </div>
        <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1.5 text-[10px] text-cyan-700 dark:text-cyan-300">
          Answer v2 — clearer steps ✓
        </div>
      </div>
      <motion.div
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <RotateCcw className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
      </motion.div>
    </div>
  );
}

function BentoCard({
  title,
  desc,
  children,
  className,
  delay = 0,
}: {
  title: string;
  desc: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <ScrollReveal delay={delay} className={className}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 380, damping: 24 }}
        className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/90 dark:bg-slate-900/90"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl transition-opacity group-hover:opacity-100 dark:bg-cyan-500/20" />
        <div className="relative">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
        <div className="relative flex-1">{children}</div>
      </motion.div>
    </ScrollReveal>
  );
}

export function BentoShowcase() {
  return (
    <section className="relative overflow-hidden py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent dark:via-cyan-500/[0.06]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">
            Why IntellectA
          </p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl dark:text-slate-100">
            Built for deep focus, not clutter
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">
            Everything in one calm workspace — routing, math, images, and retries.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          <BentoCard
            title="Smart routing"
            desc="The right subject agent, automatically."
            className="md:col-span-2"
            delay={0}
          >
            <RoutingVisual />
          </BentoCard>

          <BentoCard
            title="LaTeX math"
            desc="Readable formulas, every time."
            className="md:col-span-1"
            delay={0.06}
          >
            <LatexVisual />
          </BentoCard>

          <BentoCard
            title="Photo doubts"
            desc="Snap your notes, get answers."
            className="md:col-span-1"
            delay={0.12}
          >
            <PhotoVisual />
          </BentoCard>

          <BentoCard
            title="Regenerate"
            desc="Need another explanation? One tap."
            className="md:col-span-2"
            delay={0.18}
          >
            <RegenerateVisual />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
