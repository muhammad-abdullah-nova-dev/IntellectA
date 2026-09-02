"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const prompts = [
  "Solve ∫ x² dx step by step",
  "Explain time dilation simply",
  "Balance this chemical equation",
  "Causes of World War I?",
  "Newton's third law examples",
];

export function PromptChips() {
  return (
    <div className="mt-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Try asking
      </p>
      <div className="flex flex-wrap gap-2">
        {prompts.map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            whileHover={{ scale: 1.04, y: -2 }}
          >
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs text-slate-600 shadow-sm transition-colors hover:border-cyan-300 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-cyan-700 dark:hover:text-cyan-300"
            >
              <MessageCircle className="h-3 w-3 text-cyan-500 opacity-70 transition-opacity group-hover:opacity-100" />
              {text}
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
