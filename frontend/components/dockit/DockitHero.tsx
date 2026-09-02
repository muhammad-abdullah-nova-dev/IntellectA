"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { isAuthenticated } from "@/lib/auth";

const POPULAR = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Politics",
  "Geography",
  "Economics",
];

export function DockitHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const submit = (text: string) => {
    const q = text.trim();
    if (q) sessionStorage.setItem("intellecta_seed_prompt", q);
    router.push(isAuthenticated() ? "/chat" : "/login");
  };

  return (
    <section className="dockit-hero dockit-container relative">
      <h1>
        Great{" "}
        <img
          src="/intellecta-icon.svg"
          alt=""
          className="hero-icon"
        />{" "}
        learning
        <span className="light-text">students love</span>
      </h1>
      <p className="hero-tagline max-w-2xl">
        Eight subject experts, adaptive quizzes, and personalized help — all in
        one place.
      </p>

      <div className="search-container">
        <div className="search-bar-inner">
          <Search className="h-5 w-5 shrink-0 text-[#999]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit(query)}
            placeholder="Search subjects or ask a question…"
          />
          <kbd className="hidden rounded border border-white/10 px-2 py-0.5 font-mono text-[10px] text-[#999] sm:inline">
            ↵
          </kbd>
          <button
            type="button"
            className="btn-primary shrink-0 text-sm"
            onClick={() => submit(query)}
          >
            Ask
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <p className="text-base">Popular:</p>
        <div className="badges">
          {POPULAR.map((tag) => (
            <button
              key={tag}
              type="button"
              className="badge"
              onClick={() => submit(`Help me with ${tag}`)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
