"use client";

import { motion } from "framer-motion";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { SUBJECTS } from "@/lib/subjects";
import { SubjectIcon } from "@/components/subject-icon";

export function SubjectsShowcase() {
  return (
    <section id="subjects" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <p className="section-label">Curriculum scope</p>
            <h2 className="section-heading mt-3">
              8 subject specialists.{" "}
              <span className="brand-gradient-text">Zero noise.</span>
            </h2>
            <p className="section-sub">
              Each subject has a dedicated agent with RAG-backed curriculum
              chunks. Off-topic questions are politely declined by the scope
              guard.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SUBJECTS.map((subject, i) => (
              <ScrollReveal key={subject.id} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="group glass-panel relative h-full overflow-hidden rounded-2xl p-5"
                >
                  <SubjectIcon
                    subject={subject}
                    size="lg"
                    className="relative z-10 shadow-md"
                  />
                  <h3 className="mt-4 font-semibold">{subject.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {subject.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Specialist agent active
                  </span>
                </motion.div>
              </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
