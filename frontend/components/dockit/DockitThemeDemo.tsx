"use client";

import { useState } from "react";
import { DockitSection } from "./DockitSection";
import { HeroDashboard } from "@/components/landing/hero-dashboard";
import { WorkspaceMemoryPanel } from "./WorkspaceMemoryPanel";

export function DockitThemeDemo() {
  const [showMemory, setShowMemory] = useState(false);

  return (
    <DockitSection
      title={
        <>
          Switch between
          <span className="light-text">chat & memory views</span>
        </>
      }
      description="Toggle to preview the live workspace and the cloud stack that keeps your learning in sync."
      className="theme-demo-section"
    >
      <div className="theme-demo-stage">
        <div className="theme-switch-container">
          <div
            className={`theme-switch ${showMemory ? "active" : ""}`}
            onClick={() => setShowMemory((v) => !v)}
            onKeyDown={(e) => e.key === "Enter" && setShowMemory((v) => !v)}
            role="button"
            tabIndex={0}
            aria-label="Toggle between chat and memory preview"
          >
            <div className="theme-switch-button" />
          </div>
          <div className="theme-switch-labels">
            <span className={!showMemory ? "active" : ""}>Chat</span>
            <span className={showMemory ? "active" : ""}>Memory</span>
          </div>
        </div>

        <div className="theme-demo-panels" id="image-container">
          <div
            className={`theme-demo-panel dark-image ${showMemory ? "theme-switched" : ""}`}
          >
            <HeroDashboard variant="embedded" />
          </div>
          <div
            className={`theme-demo-panel light-image ${!showMemory ? "theme-switched" : ""}`}
          >
            <WorkspaceMemoryPanel />
          </div>
        </div>
      </div>
    </DockitSection>
  );
}
