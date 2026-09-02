"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, MessageSquare, Brain } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { HeroDashboard } from "@/components/landing/hero-dashboard";

const STEPS = [
  {
    num: "1",
    title: "Sign in with Google",
    description:
      "Create your account in seconds. Your workspace syncs across every device.",
    icon: LogIn,
  },
  {
    num: "2",
    title: "Ask your first question",
    description:
      "Type a doubt, upload an image, or say “quiz me.” The router picks the right specialist.",
    icon: MessageSquare,
  },
  {
    num: "3",
    title: "Learn & remember",
    description:
      "Get step-by-step teaching with LaTeX. Memory builds in Neon + Mem0 for next time.",
    icon: Brain,
  },
];

export function DockitSteps() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Get started in{" "}
              <span className="text-violet-400">3 simple steps</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              A fast, frustration-free way to start learning with AI specialists.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {STEPS.map((step, i) => (
            <ScrollReveal key={step.num} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className="relative flex h-full flex-col rounded-2xl border border-border/70 bg-card/60 p-6"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/15 text-sm font-bold text-violet-400">
                  {step.num}
                </span>
                <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
                  <step.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-16">
            <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
              Live preview — specialist agent in action
            </p>
            <div className="mx-auto max-w-lg">
              <HeroDashboard />
            </div>
            <p className="mt-8 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-violet-400 hover:underline"
              >
                Open your workspace →
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
