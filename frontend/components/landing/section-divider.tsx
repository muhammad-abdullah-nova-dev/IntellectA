"use client";

import { motion } from "framer-motion";

export function SectionDivider() {
  return (
    <div className="relative mx-auto h-12 max-w-7xl overflow-hidden px-6">
      <motion.div
        className="absolute left-1/2 top-1/2 h-px w-full max-w-md -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
        animate={{ scaleX: [0.6, 1, 0.6], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-lg shadow-cyan-500/30"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
