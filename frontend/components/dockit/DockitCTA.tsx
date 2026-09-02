import Link from "next/link";
import { DockitSection } from "./DockitSection";

export function DockitCTA() {
  return (
    <div id="get-started" className="cta-container pb-20">
      <DockitSection
        title={
          <>
            Ready to explore
            <span className="light-text">IntellectA experience?</span>
          </>
        }
        description="Join focused learners using IntellectA for exam prep, homework, and daily revision."
      >
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/login" className="btn-primary">
            Get Started
          </Link>
          <Link href="/chat" className="btn-outline-primary">
            Open workspace
          </Link>
        </div>
      </DockitSection>
    </div>
  );
}
