"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

export function MiniFeatures({
  items,
}: {
  items: { icon: LucideIcon; title: string; text: string }[];
}) {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <ScrollReveal key={item.title} delay={0.2 + i * 0.06}>
          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 dark:bg-cyan-950/40"
            >
              <item.icon className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </motion.div>
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-200">
                {item.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.text}
              </p>
            </div>
          </motion.div>
        </ScrollReveal>
      ))}
    </div>
  );
}
