"use client";

import { Star } from "lucide-react";
import { DockitSection } from "./DockitSection";

const TESTIMONIALS = [
  {
    name: "Aisha K.",
    role: "Class 12 · CBSE",
    subject: "Physics",
    quote:
      "Special relativity finally clicked — step-by-step explanations beat any YouTube rabbit hole.",
    rating: 5,
  },
  {
    name: "Rohan M.",
    role: "JEE aspirant",
    subject: "Mathematics",
    quote:
      "I upload calculus screenshots and get clean solutions in seconds. Quiz mode actually adapts when I mess up.",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "Undergrad",
    subject: "Chemistry",
    quote:
      "Chemical equations display properly here. Feels like a tutor that remembers what I struggled with last week.",
    rating: 5,
  },
  {
    name: "Dev P.",
    role: "Class 11",
    subject: "Biology",
    quote:
      "Photosynthesis and genetics answers stay on syllabus — focused and reliable. Huge for board prep.",
    rating: 5,
  },
  {
    name: "Meera T.",
    role: "Humanities student",
    subject: "History",
    quote:
      "Timeline essays and cause-effect breakdowns are structured the way my teacher wants. Saves hours.",
    rating: 5,
  },
  {
    name: "Arjun N.",
    role: "Class 10",
    subject: "Economics",
    quote:
      "Supply-demand graphs explained with real examples. Cross-device sync means I continue on my phone after school.",
    rating: 5,
  },
];

function TestimonialCard({
  item,
}: {
  item: (typeof TESTIMONIALS)[number];
}) {
  return (
    <article className="dockit-testimonial-card">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#ffca7b] text-[#ffca7b]" />
        ))}
      </div>
      <p className="dockit-testimonial-quote">&ldquo;{item.quote}&rdquo;</p>
      <div className="dockit-testimonial-footer">
        <div>
          <p className="dockit-testimonial-name">{item.name}</p>
          <p className="dockit-testimonial-role">{item.role}</p>
        </div>
        <span className="dockit-testimonial-subject">{item.subject}</span>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: typeof TESTIMONIALS;
  reverse?: boolean;
}) {
  const loop = [...items, ...items];
  return (
    <div
      className={`dockit-testimonial-track ${reverse ? "dockit-testimonial-track--reverse" : ""}`}
    >
      {loop.map((item, i) => (
        <TestimonialCard key={`${item.name}-${i}`} item={item} />
      ))}
    </div>
  );
}

export function DockitTestimonials() {
  const rowB = [...TESTIMONIALS].reverse();

  return (
    <div id="testimonials" className="dockit-testimonials-section">
      <DockitSection
        title={
          <>
            Loved by learners
            <span className="light-text">everywhere</span>
          </>
        }
        description="Real feedback from students using IntellectA across subjects."
      >
        <div className="dockit-testimonials-stage">
          <div className="dockit-testimonials-fade dockit-testimonials-fade--left" />
          <div className="dockit-testimonials-fade dockit-testimonials-fade--right" />
          <div className="dockit-testimonials-rows">
            <MarqueeRow items={TESTIMONIALS} />
            <MarqueeRow items={rowB} reverse />
          </div>
        </div>
      </DockitSection>
    </div>
  );
}
