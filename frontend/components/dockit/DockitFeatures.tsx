import { FolderTree, Search, Wand2, Zap } from "lucide-react";
import { DockitSection } from "./DockitSection";

const FEATURES = [
  {
    icon: FolderTree,
    color: "#FF8585",
    title: "Well organized",
    body: "Eight subject experts — Math, Physics, Chemistry, Biology, History, Politics, Geography & Economics.",
  },
  {
    icon: Zap,
    color: "#7BE1A4",
    title: "Lightning fast",
    body: "Quick, clear replies so you can keep studying without long waits between questions.",
  },
  {
    icon: Search,
    color: "#FFD97B",
    title: "Syllabus-smart",
    body: "Answers stay tied to real study material — accurate help for homework and exam prep.",
  },
  {
    icon: Wand2,
    color: "#979BFF",
    title: "Very adaptive",
    body: "Practice quizzes adjust to your level and remember what you find tricky over time.",
  },
];

export function DockitFeatures() {
  return (
    <div id="features">
      <DockitSection
        title={
          <>
            Powerful features
            <span className="light-text">for learning</span>
          </>
        }
        description="Everything you need to study smarter — built for students, not engineers."
      >
        <div className="features-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="dockit-card group">
              <div
                className="feature-icon-wrap"
                style={{
                  background: `color-mix(in srgb, ${f.color} 16%, transparent)`,
                }}
              >
                <f.icon className="h-7 w-7" style={{ color: f.color }} />
              </div>
              <p className="card-title">{f.title}</p>
              <div className="card-body">{f.body}</div>
              <div className="card-arrow">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="transition-transform duration-300 group-hover:-rotate-45"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10.3209 0.715753L17.3509 7.84376C17.7823 8.28117 17.7823 8.99035 17.3509 9.42776L10.3209 16.5558C9.88952 16.9932 9.1901 16.9932 8.7587 16.5558C8.32731 16.1184 8.32731 15.4092 8.7587 14.9718L13.9029 9.75582H1.10465C0.494569 9.75582 0 9.25435 0 8.63576C0 8.01717 0.494569 7.5157 1.10465 7.5157H13.9029L8.7587 2.29975C8.32731 1.86234 8.32731 1.15316 8.7587 0.715753C9.1901 0.278343 9.88952 0.278343 10.3209 0.715753Z"
                    fill="#f6f6f6"
                  />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </DockitSection>
    </div>
  );
}
