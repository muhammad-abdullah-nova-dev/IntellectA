"use client";

import { motion } from "framer-motion";

const items = [
  { value: "8", label: "Subject specialists" },
  { value: "RAG", label: "Curriculum-backed" },
  { value: "24/7", label: "Always available" },
  { value: "Sync", label: "Cross-device memory" },
];

export function StatsRow() {
  return (
    <div className="mt-10 flex flex-wrap gap-4 border-t border-slate-200/80 pt-8 dark:border-slate-800">
      {items.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
          whileHover={{ y: -4, scale: 1.02 }}
          className="min-w-[100px] rounded-xl border border-transparent bg-white/50 px-4 py-3 transition-colors hover:border-cyan-200/80 hover:bg-white dark:bg-slate-900/30 dark:hover:border-cyan-900/50 dark:hover:bg-slate-900/60"
        >
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {s.value}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
