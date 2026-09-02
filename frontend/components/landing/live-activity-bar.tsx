"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const activities = [
  { text: "Priya asked about calculus limits", subject: "Math" },
  { text: "Aarav explored time dilation", subject: "Physics" },
  { text: "Sneha balanced a redox reaction", subject: "Chem" },
  { text: "Rohan revised WWI causes", subject: "History" },
  { text: "Kabir uploaded a diagram doubt", subject: "Physics" },
];

export function LiveActivityBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % activities.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  const current = activities[index];

  return (
    <div className="mx-auto max-w-7xl px-6 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3 text-sm shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/50"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="text-slate-500 dark:text-slate-400">Live study room</span>
        <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.3 }}
            className="truncate text-slate-700 dark:text-slate-200"
          >
            {current.text}
            <span className="ml-2 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-medium text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300">
              {current.subject}
            </span>
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
