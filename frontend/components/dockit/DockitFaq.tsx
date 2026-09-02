"use client";

import { useState } from "react";
import { DockitSection } from "./DockitSection";

const TABS = [
  { type: "basic", title: "Getting Started", subtitle: "How to begin with IntellectA.", icon: "🚀" },
  { type: "setting", title: "Features & Memory", subtitle: "Quizzes, memory, and sync.", icon: "⚙️" },
  { type: "study", title: "Study Smarter", subtitle: "Tips to learn better.", icon: "📚" },
] as const;

const ITEMS = [
  {
    type: "basic",
    q: "How do I get started with IntellectA?",
    a: "Sign in with Google or email, open the chat workspace, and ask your first academic question.",
  },
  {
    type: "basic",
    q: "What subjects are supported?",
    a: "Eight only: Mathematics, Physics, Chemistry, Biology, History, Politics, Geography, and Economics.",
  },
  {
    type: "basic",
    q: "Is IntellectA free?",
    a: "Yes for personal learning during development — sign in and start chatting.",
  },
  {
    type: "basic",
    q: "Do I need to pick a subject before asking?",
    a: "No — just type your question. IntellectA connects you to the right subject expert automatically.",
  },
  {
    type: "basic",
    q: "Can I use IntellectA on my phone?",
    a: "Yes. Sign in on any device — your chat history and memory sync when you're logged in.",
  },
  {
    type: "setting",
    q: "Does history sync across devices?",
    a: "Yes when logged in. Your chats and learning progress stay saved and follow you on every device.",
  },
  {
    type: "setting",
    q: "Can I upload images?",
    a: "Yes — JPEG, PNG, or WebP up to 4 MB for diagram and equation doubts.",
  },
  {
    type: "setting",
    q: "How do quizzes work?",
    a: 'Say "quiz me on [topic]" — questions get harder or easier based on how you\'re doing.',
  },
  {
    type: "setting",
    q: "Does IntellectA support math equations?",
    a: "Yes — math formulas and chemical equations display clearly right in the chat.",
  },
  {
    type: "setting",
    q: "Are answers based on real syllabus content?",
    a: "Yes — explanations stay focused on proper study material so you learn the right way for school and exams.",
  },
  {
    type: "study",
    q: "How should I ask questions to get better answers?",
    a: "Be specific — mention the chapter, what you tried, and where you're stuck. Upload a photo if it's a diagram or equation.",
  },
  {
    type: "study",
    q: "Can IntellectA help with exam revision?",
    a: "Yes — ask for summaries, key formulas, or say \"quiz me on [topic]\" to practice under exam-style pressure.",
  },
  {
    type: "study",
    q: "Should I study one subject per session?",
    a: "Either works. One subject keeps focus tight; mixing subjects is fine when you're revising multiple papers in a day.",
  },
  {
    type: "study",
    q: "What if I don't understand the first explanation?",
    a: "Ask follow-ups like \"explain simpler\" or \"give an example\" — the tutor remembers context within the same chat.",
  },
  {
    type: "study",
    q: "Is IntellectA only for homework?",
    a: "No — use it for concept clarity, revision, doubt-solving, essay outlines, and building confidence before tests.",
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`dockit-accordion show ${open ? "open" : ""}`}>
      <div className="accordion-header" onClick={() => setOpen(!open)} onKeyDown={(e) => e.key === "Enter" && setOpen(!open)} role="button" tabIndex={0}>
        <h4>{q}</h4>
        <div className="accordion-icon">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
            <path className="vertical-line" fillRule="evenodd" d="M8.47821 6.52114V0H6.52169V6.52114H0V8.47766H6.52169V15H8.47821V8.47766H15V6.52114H8.47821Z" />
            <path fillRule="evenodd" d="M0 6.52114V8.47766H15V6.52114H0Z" />
          </svg>
        </div>
      </div>
      <div className="accordion-body">{a}</div>
    </div>
  );
}

export function DockitFaq() {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const visible = ITEMS.filter((i) => i.type === activeTab);

  return (
    <div id="faq">
      <DockitSection
        title={
          <>
            Have question?
            <span className="light-text">We&apos;re here to help</span>
          </>
        }
        description="Get answers to the general questions people have asked."
      >
        <div className="accordion-container">
          <div>
            {TABS.map((tab) => (
              <div
                key={tab.type}
                className={`accordion-tab-item ${activeTab === tab.type ? "active-tab" : ""}`}
                onClick={() => setActiveTab(tab.type)}
                onKeyDown={(e) => e.key === "Enter" && setActiveTab(tab.type)}
                role="button"
                tabIndex={0}
              >
                <div className="tab-icon-circle text-2xl">{tab.icon}</div>
                <div>
                  <h3>{tab.title}</h3>
                  <p>{tab.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          <div>
            {visible.map((item, i) => (
              <div key={item.q} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <AccordionItem q={item.q} a={item.a} />
              </div>
            ))}
          </div>
        </div>
      </DockitSection>
    </div>
  );
}
