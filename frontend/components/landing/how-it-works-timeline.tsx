"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function HowItWorksTimeline({ steps }: { steps: HowItWorksStep[] }) {
  return (
    <div className="relative mt-14">
      <div className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-cyan-400 via-indigo-400 to-transparent lg:block" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-6">
        {steps.map((item, i) => (
          <ScrollReveal key={item.step} delay={i * 0.12}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative flex min-h-[220px] flex-col rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 sm:p-8"
            >
              <div className="absolute -top-3 left-1/2 hidden h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-cyan-600 to-indigo-600 lg:flex dark:border-slate-900">
                <span className="h-2 w-2 rounded-full bg-white" />
              </div>

              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex h-9 min-w-[2.5rem] items-center justify-center rounded-lg bg-cyan-50 text-sm font-bold text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
                  {item.step}
                </span>
                <motion.div
                  whileHover={{ rotate: [0, -8, 8, 0] }}
                  transition={{ duration: 0.5 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 shadow-md"
                >
                  <item.icon className="h-5 w-5 text-white" />
                </motion.div>
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
