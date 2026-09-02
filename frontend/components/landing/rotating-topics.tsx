"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const topics = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Economics",
];

export function RotatingTopics() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % topics.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex min-w-[5.5rem] items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={topics[index]}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-r from-cyan-600 to-indigo-600 bg-clip-text font-semibold text-transparent"
        >
          {topics[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
