"use client";

import { ChevronDown } from "lucide-react";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

const FAQ_GROUPS = [
  {
    label: "Getting Started",
    subtitle: "How to begin with IntellectA",
    items: [
      {
        q: "How do I get started?",
        a: "Sign in with Google or email, open the chat workspace, and ask your first academic question. Popular prompts on the homepage work too.",
      },
      {
        q: "What subjects are supported?",
        a: "Eight only: Mathematics, Physics, Chemistry, Biology, History, Politics, Geography, and Economics. Other topics are politely declined.",
      },
      {
        q: "Is IntellectA free?",
        a: "Yes for personal learning. Sign in, chat, and sync history at no cost during development.",
      },
    ],
  },
  {
    label: "Features & Memory",
    subtitle: "Quizzes, RAG, and cross-device sync",
    items: [
      {
        q: "Does my chat history sync across devices?",
        a: "Yes when logged in. Chats save to Neon PostgreSQL. Redis caches short-term context. Mem0 stores personalization insights.",
      },
      {
        q: "Can I upload images?",
        a: "Yes — JPEG, PNG, or WebP up to 4 MB. Vision analysis routes to the right subject specialist.",
      },
      {
        q: "How do quizzes work?",
        a: "Say “quiz me on [topic].” The Evaluator agent asks questions and adapts difficulty based on your answers.",
      },
    ],
  },
  {
    label: "Help & Support",
    subtitle: "Troubleshooting common issues",
    items: [
      {
        q: "Why was my question declined?",
        a: "The scope guard blocks non-academic topics (coding help, entertainment, etc.) to keep you focused on studies.",
      },
      {
        q: "Chat failed to load?",
        a: "Ensure backend is running on port 8000 and you're signed in. Hard refresh the frontend if styles look broken.",
      },
      {
        q: "Where is data stored?",
        a: "Sessions and messages in Neon PostgreSQL. Short-term cache in Redis. Long-term insights in Mem0 when configured.",
      },
    ],
  },
];

export function DockitFaq() {
  return (
    <section id="faq" className="border-t border-border/60 bg-card/20 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <ScrollReveal>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Have questions? We&apos;re here to help
            </h2>
            <p className="mt-4 text-muted-foreground">
              Answers to what students ask most about IntellectA.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 space-y-10">
          {FAQ_GROUPS.map((group) => (
            <div key={group.label}>
              <h3 className="text-lg font-semibold text-violet-400">
                {group.label}
              </h3>
              <p className="text-sm text-muted-foreground">{group.subtitle}</p>
              <div className="mt-4 divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
                {group.items.map((item) => (
                  <details key={item.q} className="group px-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
