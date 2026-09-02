"use client";

const items = [
  "Exam prep",
  "Homework help",
  "Self-study",
  "Board exams",
  "College PCM",
  "LaTeX math",
  "Image doubts",
  "Pin chats",
];

export function TrustMarquee() {
  const loop = [...items, ...items];

  return (
    <section className="overflow-hidden border-y border-slate-200/70 bg-white/50 py-6 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-16 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 sm:w-24" />
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-16 bg-gradient-to-l from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90 sm:w-24" />
        <div className="flex w-max animate-trust-marquee gap-8 py-1">
          {loop.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex shrink-0 items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
