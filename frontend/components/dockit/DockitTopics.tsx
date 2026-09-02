import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DockitSection } from "./DockitSection";

const CARDS = [
  {
    title: "STEM Sciences",
    icon: "/dockit/element.svg",
    count: "4 Specialists",
    accent: "#7BE1A4",
    items: [
      "Mathematics & calculus",
      "Physics & mechanics",
      "Chemistry & bonding",
      "Biology & genetics",
    ],
    href: "/login",
  },
  {
    title: "Humanities",
    icon: "/dockit/content.svg",
    count: "2 Specialists",
    accent: "#FF8585",
    items: [
      "World history",
      "Political systems",
      "Cause & effect essays",
      "Timeline analysis",
    ],
    href: "/login",
  },
  {
    title: "Social Sciences",
    icon: "/dockit/layouts.svg",
    count: "2 Specialists",
    accent: "#FFD97B",
    items: [
      "Physical geography",
      "Climate & maps",
      "Micro & macro economics",
      "Supply & demand",
    ],
    href: "/login",
  },
  {
    title: "Smart Learning",
    icon: "/dockit/code-block.svg",
    count: "AI Tools",
    accent: "#979BFF",
    items: [
      "Adaptive quizzes",
      "Clear math & equations",
      "Image upload doubts",
      "Cross-device memory",
    ],
    href: "/chat",
    cta: "Open workspace",
  },
];

export function DockitTopics() {
  return (
    <div id="subjects" className="topics-section">
      <DockitSection
        title={
          <>
            Feature topics for
            <span className="light-text">our curriculum</span>
          </>
        }
        description="Explore our eight subject experts and see what each one can help you with."
      >
        <div className="topics-grid">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="topic-card group"
              style={{ ["--topic-accent" as string]: card.accent }}
            >
              <div className="topic-card-header">
                <div
                  className="topic-card-icon"
                  style={{
                    background: `color-mix(in srgb, ${card.accent} 14%, transparent)`,
                    borderColor: `color-mix(in srgb, ${card.accent} 35%, transparent)`,
                  }}
                >
                  <Image src={card.icon} alt="" width={22} height={22} />
                </div>
                <div className="topic-card-heading">
                  <h3>{card.title}</h3>
                  <span className="topic-card-count">{card.count}</span>
                </div>
              </div>

              <ul className="topic-card-list">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <Link href={card.href} className="topic-card-cta">
                <span>{card.cta ?? "Start learning"}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </article>
          ))}
        </div>
      </DockitSection>
    </div>
  );
}
