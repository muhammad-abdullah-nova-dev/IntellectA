"use client";

import { useState } from "react";
import { DockitSection } from "./DockitSection";
import {
  StepAskPreview,
  StepLearnPreview,
  StepSignInPreview,
} from "./StepTabPreviews";

const TABS = [
  {
    number: 1,
    title: "Sign in with Google",
    subtitle: "Set up in seconds — syncs across devices.",
  },
  {
    number: 2,
    title: "Ask your first question",
    subtitle: "Text, image, or say quiz me — we connect you to the right expert.",
  },
  {
    number: 3,
    title: "Start learning",
    subtitle: "Step-by-step teaching with clear formulas and adaptive quizzes.",
  },
];

const PANELS = [StepSignInPreview, StepAskPreview, StepLearnPreview];

export function DockitHeroTabs() {
  const [active, setActive] = useState(1);
  const ActivePanel = PANELS[active - 1];

  return (
    <div id="how-it-works">
      <DockitSection
        title={
          <>
            Get started quickly
            <span className="light-text">in just 3 simple steps</span>
          </>
        }
        description="A fast and frustration-free way to set up and start learning with IntellectA."
      >
        <div className="hero-tabs-wrap">
          <div className="hero-tabs-nav" role="tablist" aria-label="How it works">
            {TABS.map((tab) => {
              const isActive = active === tab.number;
              return (
                <button
                  key={tab.number}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`hero-tab-nav${isActive ? " is-active" : ""}`}
                  onClick={() => setActive(tab.number)}
                >
                  <span className="tab-number">{tab.number}</span>
                  <span className="tab-button-text">
                    <span className="tab-title">{tab.title}</span>
                    <span className="tab-subtitle">{tab.subtitle}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hero-tabs-content" role="tabpanel">
            <div key={active} className="hero-tab-panel fade-in">
              <ActivePanel />
            </div>
          </div>
        </div>
      </DockitSection>
    </div>
  );
}
