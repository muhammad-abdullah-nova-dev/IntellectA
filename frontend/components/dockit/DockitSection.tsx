import type { ReactNode } from "react";

export function DockitSection({
  title,
  description,
  children,
  className = "",
}: {
  title: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`dockit-section ${className}`.trim()}>
      <div className="dockit-container">
        <div className="mb-16 text-center">
          <h2 className="section-title mb-4">{title}</h2>
          {description && (
            <p className="section-description mx-auto max-w-2xl">{description}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
