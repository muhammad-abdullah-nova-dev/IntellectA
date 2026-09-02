"use client";

import dynamic from "next/dynamic";

export const MarkdownMessage = dynamic(
  () =>
    import("@/components/markdown-message").then((mod) => mod.MarkdownMessage),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Rendering…
      </p>
    ),
  }
);
