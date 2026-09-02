"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Star,
  Zap,
  BookOpen,
  ImagePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IntellectALogoMark } from "@/components/brand/logo";

const perks = [
  { icon: Zap, label: "8 subject agents" },
  { icon: BookOpen, label: "Adaptive quizzes" },
  { icon: ImagePlus, label: "Image upload" },
];

export function CtaBanner() {
  return (
    <section id="get-started" className="mx-auto max-w-7xl px-6 py-16 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[2rem] border border-cyan-400/30 shadow-2xl shadow-cyan-900/25 dark:border-cyan-500/20 dark:shadow-cyan-950/40"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-cyan-600 to-indigo-600" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
        <motion.div
          className="pointer-events-none absolute right-1/3 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-cyan-300/20 blur-2xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute h-2 w-2 rounded-full bg-white/40"
            style={{ left: `${20 + i * 25}%`, top: `${15 + i * 20}%` }}
            animate={{ y: [0, -12, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}

        <div className="relative flex flex-col gap-10 p-8 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
              <Brain className="h-4 w-4" />
              Ready for focused learning?
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
              Start your first{" "}
              <span className="relative inline-block">
                AI-powered
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-white/40" />
              </span>{" "}
              study session
            </h2>

            <p className="mt-4 text-base leading-relaxed text-white/90 sm:text-lg">
              Join learners using IntellectA for exam prep, homework, and daily
              revision — sign up free and ask your first question in seconds.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {perks.map(({ icon: Icon, label }, i) => (
                <motion.span
                  key={label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </motion.span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-4 sm:items-center lg:items-end">
            <Button
              asChild
              size="lg"
              className="group h-14 rounded-2xl bg-white px-10 text-base font-semibold text-cyan-700 shadow-xl shadow-black/15 transition-all hover:scale-[1.02] hover:bg-slate-50 hover:shadow-2xl"
            >
              <Link href="/login">
                <IntellectALogoMark className="mr-2 h-5 w-5 text-cyan-600" />
                Open IntellectA
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <p className="text-center text-xs text-white/70 lg:text-right">
              Free to start · No credit card
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
        <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
          Built for students who want speed + clarity
        </span>
      </div>
    </section>
  );
}
