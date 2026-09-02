"use client";

import { motion } from "framer-motion";
import { Calculator, FlaskConical, BookOpen, Orbit } from "lucide-react";

/** Pills float around the hero mockup only — not over headline copy */
const orbs = [
  {
    icon: Calculator,
    label: "Math",
    className: "-left-2 top-[6%] sm:-left-4 lg:-left-6",
    delay: 0,
  },
  {
    icon: Orbit,
    label: "Physics",
    className: "-right-2 top-[10%] sm:-right-4 lg:-right-6",
    delay: 0.4,
  },
  {
    icon: FlaskConical,
    label: "Chem",
    className: "-left-2 bottom-[22%] sm:-left-5 lg:-left-8",
    delay: 0.8,
  },
  {
    icon: BookOpen,
    label: "History",
    className: "-right-2 bottom-[18%] sm:-right-5 lg:-right-8",
    delay: 1.2,
  },
];

export function FloatingSubjects() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 hidden sm:block">
      {orbs.map(({ icon: Icon, label, className, delay }) => (
        <motion.div
          key={label}
          className={`absolute ${className}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + delay, duration: 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4 + delay,
              repeat: Infinity,
              ease: "easeInOut",
              delay,
            }}
            className="flex items-center gap-2 rounded-full border border-cyan-200/60 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-md backdrop-blur-md dark:border-cyan-800/50 dark:bg-slate-900/90 dark:text-slate-300"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-indigo-600 text-white">
              <Icon className="h-3.5 w-3.5" />
            </span>
            {label}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
