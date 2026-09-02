"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

export function FeatureGrid({ features }: { features: FeatureItem[] }) {
  return (
    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f, i) => (
        <ScrollReveal key={f.title} delay={i * 0.08}>
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="group relative h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-cyan-500/15" />
            <motion.div
              className={`relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${f.color} text-white shadow-md`}
              whileHover={{ scale: 1.08, rotate: 3 }}
            >
              <f.icon className="h-6 w-6" />
            </motion.div>
            <h3 className="relative mt-5 text-lg font-semibold text-slate-900 dark:text-slate-100">
              {f.title}
            </h3>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {f.description}
            </p>
          </motion.div>
        </ScrollReveal>
      ))}
    </div>
  );
}
