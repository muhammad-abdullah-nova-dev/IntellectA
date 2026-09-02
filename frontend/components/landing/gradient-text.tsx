"use client";

import { cn } from "@/lib/utils";

export function GradientText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-cyan-600 via-indigo-500 to-cyan-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shift",
        className
      )}
    >
      {children}
    </span>
  );
}
