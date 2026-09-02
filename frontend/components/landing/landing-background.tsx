"use client";

import { motion } from "framer-motion";

export function LandingBackground() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-cyan-400/15 blur-[120px] dark:bg-cyan-600/15"
        animate={{ x: [0, 24, 0], y: [0, -14, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -right-32 top-1/4 h-[400px] w-[400px] rounded-full bg-indigo-400/15 blur-[100px] dark:bg-indigo-700/15"
        animate={{ x: [0, -22, 0], y: [0, 14, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute bottom-1/4 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-300/10 blur-[80px] dark:bg-indigo-600/10"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-cyan-500/40 dark:bg-cyan-400/30"
          style={{
            left: `${12 + i * 14}%`,
            top: `${20 + (i % 3) * 22}%`,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 5 + i * 0.7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
    </>
  );
}
