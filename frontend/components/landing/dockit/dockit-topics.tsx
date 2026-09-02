"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SubjectIcon } from "@/components/subject-icon";
import { SUBJECTS } from "@/lib/subjects";

const TOPICS = [
  {
    title: "Mathematics",
    count: "4 modules",
    subjectId: "mathematics",
    items: ["Algebra & equations", "Calculus & limits", "Geometry proofs", "LaTeX formulas"],
    href: "/login",
  },
  {
    title: "Sciences",
    count: "12 modules",
    subjectId: "physics",
    items: ["Mechanics & motion", "Chemical bonding", "Cell biology", "Lab diagrams"],
    href: "/login",
  },
  {
    title: "Humanities",
    count: "8 modules",
    subjectId: "history",
    items: ["World history", "Political systems", "Cause & effect", "Essay structure"],
    href: "/login",
  },
  {
    title: "Social Sciences",
    count: "6 modules",
    subjectId: "geography",
    items: ["Physical geography", "Climate & maps", "Micro & macro", "Supply & demand"],
    href: "/login",
  },
];

export function DockitTopics() {
  return (
    <section id="subjects" className="border-y border-border/60 bg-card/20 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Subject topics for your studies
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Explore our eight specialists and see what each agent can help you
              with.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {TOPICS.map((topic, i) => {
            const subject =
              SUBJECTS.find((s) => s.id === topic.subjectId) ?? SUBJECTS[0];
            return (
              <ScrollReveal key={topic.title} delay={i * 0.08}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="flex h-full flex-col rounded-2xl border border-border/70 bg-card/80 p-6 transition-shadow hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <SubjectIcon subject={subject} size="md" />
                      <div>
                        <h3 className="font-semibold">{topic.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {topic.count}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ul className="mt-5 flex-1 space-y-2">
                    {topic.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="h-1 w-1 rounded-full bg-violet-400" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={topic.href}
                    className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-violet-400 hover:underline"
                  >
                    Start learning
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.article>
              </ScrollReveal>
            );
          })}
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {SUBJECTS.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs text-muted-foreground"
            >
              {s.emoji} {s.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
