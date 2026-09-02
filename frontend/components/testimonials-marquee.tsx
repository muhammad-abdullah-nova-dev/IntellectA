"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export interface TestimonialItem {
  name: string;
  role: string;
  subject: string;
  quote: string;
  rating: number;
}

function TestimonialCard({
  item,
  variant,
}: {
  item: TestimonialItem;
  variant: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`w-[min(88vw,360px)] shrink-0 rounded-2xl border p-5 shadow-lg ${
        isDark
          ? "border-white/10 bg-[#0e1330]/95 shadow-violet-950/30 hover:border-violet-500/30"
          : "border-slate-200/80 bg-white/95 shadow-slate-200/40 dark:border-slate-700/80 dark:bg-slate-900/95"
      }`}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: item.rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p
        className={`mt-4 text-sm leading-relaxed ${
          isDark ? "text-slate-300" : "text-slate-700 dark:text-slate-300"
        }`}
      >
        &ldquo;{item.quote}&rdquo;
      </p>
      <div
        className={`mt-5 flex items-center justify-between border-t pt-4 ${
          isDark ? "border-white/10" : "border-slate-200/80 dark:border-slate-700"
        }`}
      >
        <div>
          <p
            className={`text-sm font-semibold ${
              isDark ? "text-white" : "text-slate-900 dark:text-slate-100"
            }`}
          >
            {item.name}
          </p>
          <p className="text-xs text-slate-500">{item.role}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            isDark
              ? "bg-violet-500/20 text-violet-300"
              : "bg-gradient-to-r from-cyan-50 to-indigo-50 text-cyan-700 dark:from-cyan-950/50 dark:to-indigo-950/50 dark:text-cyan-300"
          }`}
        >
          {item.subject}
        </span>
      </div>
    </motion.article>
  );
}

function MarqueeRow({
  items,
  reverse = false,
  variant,
}: {
  items: TestimonialItem[];
  reverse?: boolean;
  variant: "light" | "dark";
}) {
  const loop = [...items, ...items];

  return (
    <div
      className={`flex w-max gap-4 py-2 ${
        reverse
          ? "animate-testimonial-marquee-reverse"
          : "animate-testimonial-marquee"
      }`}
    >
      {loop.map((item, index) => (
        <TestimonialCard
          key={`${item.name}-${index}`}
          item={item}
          variant={variant}
        />
      ))}
    </div>
  );
}

export function TestimonialsMarquee({
  items,
  variant = "light",
}: {
  items: TestimonialItem[];
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";
  const rowB = [...items].reverse();

  return (
    <section
      id="testimonials"
      className={`relative w-full overflow-hidden border-y py-14 ${
        isDark
          ? "border-white/5 bg-[#060818]"
          : "border-slate-200/60 bg-slate-100/50 dark:border-slate-800/60 dark:bg-slate-950/50"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.12),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_70%)]"
        }`}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto max-w-6xl px-6 text-center"
      >
        <p
          className={`text-sm font-semibold uppercase tracking-widest ${
            isDark ? "text-violet-400" : "text-cyan-600 dark:text-cyan-400"
          }`}
        >
          Testimonials
        </p>
        <h2
          className={`mt-2 text-2xl font-bold sm:text-3xl ${
            isDark ? "text-white" : "text-slate-900 dark:text-slate-100"
          }`}
        >
          Loved by learners everywhere
        </h2>
        <p
          className={`mx-auto mt-3 max-w-2xl text-sm sm:text-base ${
            isDark ? "text-slate-400" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          Real feedback from students using IntellectA across subjects.
        </p>
      </motion.div>

      <div className="relative mt-10 space-y-5">
        <div
          className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-16 sm:w-28 ${
            isDark
              ? "bg-gradient-to-r from-[#060818] via-[#060818]/90 to-transparent"
              : "bg-gradient-to-r from-slate-100 via-slate-100/90 to-transparent dark:from-slate-950 dark:via-slate-950/90"
          }`}
        />
        <div
          className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-16 sm:w-28 ${
            isDark
              ? "bg-gradient-to-l from-[#060818] via-[#060818]/90 to-transparent"
              : "bg-gradient-to-l from-slate-100 via-slate-100/90 to-transparent dark:from-slate-950 dark:via-slate-950/90"
          }`}
        />

        <div className="marquee-viewport overflow-hidden">
          <MarqueeRow items={items} variant={variant} />
        </div>
        <div className="marquee-viewport overflow-hidden">
          <MarqueeRow items={rowB} reverse variant={variant} />
        </div>
      </div>
    </section>
  );
}
