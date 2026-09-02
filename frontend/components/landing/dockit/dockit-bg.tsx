"use client";

export function DockitBg() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(250 90% 68% / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(250 90% 68% / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-600/8 blur-[100px]" />
    </>
  );
}
