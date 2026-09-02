"use client";

import {
  Cloud,
  Laptop,
  MessageSquare,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { IntellectAIcon } from "@/components/brand/intellecta-logo";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { HeroDashboard } from "@/components/landing/hero-dashboard";

export function StepSignInPreview() {
  return (
    <div className="hero-step-stage">
      <div className="hero-step-mock hero-step-mock--signin">
        <div className="hero-step-mock-icon-ring">
          <IntellectAIcon size={44} />
        </div>
        <h4 className="hero-step-mock-title">Join in one click</h4>
        <p className="hero-step-mock-desc">
          Google sign-in — your chats and memory sync instantly.
        </p>
        <GoogleSignInButton className="mx-auto mt-3" label="Sign in with Google" />
        <div className="hero-step-mock-badges">
          <span>
            <Cloud className="h-3.5 w-3.5" />
            Cloud sync
          </span>
          <span>
            <Sparkles className="h-3.5 w-3.5" />
            8 specialists
          </span>
        </div>
      </div>

      <div className="hero-step-side">
        <p className="hero-step-side-label">Syncs across devices</p>
        <div className="hero-step-sync-viz">
          <div className="hero-step-device">
            <Laptop className="h-5 w-5" />
            <span>Laptop</span>
          </div>
          <div className="hero-step-sync-line">
            <Cloud className="h-4 w-4" />
          </div>
          <div className="hero-step-device">
            <Smartphone className="h-5 w-5" />
            <span>Phone</span>
          </div>
        </div>
        <ul className="hero-step-side-list">
          <li>Chat history saved in the cloud</li>
          <li>Memory follows you everywhere</li>
          <li>No extra setup required</li>
        </ul>
      </div>
    </div>
  );
}

export function StepAskPreview() {
  return (
    <div className="hero-step-stage hero-step-stage--ask">
      <div className="hero-step-mock hero-step-mock--ask">
        <div className="hero-step-mock-chat">
          <div className="hero-step-user-bubble">
            Explain Newton&apos;s second law with a real-life example
          </div>
          <div className="hero-step-routing">
            <MessageSquare className="h-3.5 w-3.5" />
            Connecting to <strong>Physics expert</strong>…
          </div>
          <div className="hero-step-agent-row">
            {["Math", "Physics", "Chem", "Bio"].map((s) => (
              <span key={s} className={s === "Physics" ? "active" : ""}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hero-step-side">
        <p className="hero-step-side-label">Right expert, every time</p>
        <div className="hero-step-route-list">
          {[
            { q: "∫ calculus problem", agent: "Math" },
            { q: "photosynthesis steps", agent: "Biology" },
            { q: "WW2 causes", agent: "History" },
          ].map((item) => (
            <div key={item.agent} className="hero-step-route-item">
              <span className="hero-step-route-q">{item.q}</span>
              <span className="hero-step-route-agent">{item.agent}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StepLearnPreview() {
  return (
    <div className="hero-step-stage hero-step-stage--learn">
      <HeroDashboard variant="embedded" />
    </div>
  );
}
