"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "katex/dist/katex.min.css";
import { renderKatex } from "@/lib/katex-setup";
import {
  groupContentBlocks,
  splitMathAndMarkdown,
} from "@/utils/split-math-markdown";

const blockMarkdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mb-2 text-base font-bold text-slate-900 dark:text-slate-100">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3 list-disc space-y-1 pl-6 [&>li]:leading-relaxed">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-6 [&>li]:leading-relaxed">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="leading-relaxed [&>p]:mb-1 [&>p]:inline">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-slate-900 dark:text-slate-100">
      {children}
    </strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em className="italic">{children}</em>
  ),
  code: ({
    children,
    className,
  }: {
    children?: React.ReactNode;
    className?: string;
  }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-sm text-cyan-600 dark:bg-slate-800 dark:text-cyan-400">
          {children}
        </code>
      );
    }
    return (
      <pre className="mb-3 overflow-x-auto rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
        <code className="font-mono text-sm text-slate-800 dark:text-slate-200">
          {children}
        </code>
      </pre>
    );
  },
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="mb-3 rounded-r border-l-4 border-cyan-300 bg-cyan-50 py-2 pl-4 dark:border-cyan-700 dark:bg-cyan-950/20">
      {children}
    </blockquote>
  ),
  a: ({
    children,
    href,
  }: {
    children?: React.ReactNode;
    href?: string;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-600 underline hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300"
    >
      {children}
    </a>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="mb-3 overflow-x-auto">
      <table className="min-w-full border-collapse border border-slate-300 dark:border-slate-600">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr className="border-b border-slate-200 dark:border-slate-700">{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="border border-slate-300 px-3 py-2 text-left font-semibold dark:border-slate-600">
      {children}
    </th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="border border-slate-300 px-3 py-2 dark:border-slate-600">
      {children}
    </td>
  ),
};

/** Inline markdown — no block <p> wrappers so math stays on the same line. */
const inlineMarkdownComponents = {
  ...blockMarkdownComponents,
  p: ({ children }: { children?: React.ReactNode }) => (
    <span className="inline">{children}</span>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <span className="inline">{children}</span>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <span className="inline">{children}</span>
  ),
};

function MathBlock({ tex, display }: { tex: string; display: boolean }) {
  const html = useMemo(() => renderKatex(tex, display), [tex, display]);

  if (display) {
    return (
      <div
        className="katex-display my-4 overflow-x-auto rounded-lg bg-slate-50 px-4 py-3 dark:bg-slate-800/50 [&_.katex]:text-base"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className="katex-inline mx-0.5 align-baseline [&_.katex]:text-[1em]"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function InlineMarkdown({ content }: { content: string }) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={inlineMarkdownComponents}
    >
      {trimmed}
    </ReactMarkdown>
  );
}

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export function MarkdownMessage({ content, className = "" }: MarkdownMessageProps) {
  const blocks = useMemo(() => {
    const parts = splitMathAndMarkdown(content);
    return groupContentBlocks(parts);
  }, [content]);

  return (
    <div
      className={`prose prose-sm max-w-none dark:prose-invert prose-cyan [&_.katex]:text-slate-900 dark:[&_.katex]:text-slate-100 [&>pre]:font-mono [&>pre]:text-sm [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 ${className}`}
    >
      {blocks.map((block, index) => {
        if (block.type === "display-math") {
          return <MathBlock key={index} tex={block.value} display />;
        }

        if (block.type === "markdown-block") {
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={blockMarkdownComponents}
            >
              {block.value}
            </ReactMarkdown>
          );
        }

        return (
          <p key={index} className="mb-3 last:mb-0 leading-relaxed">
            {block.parts.map((part, partIndex) =>
              part.type === "math" ? (
                <MathBlock
                  key={partIndex}
                  tex={part.value}
                  display={false}
                />
              ) : (
                <InlineMarkdown key={partIndex} content={part.value} />
              )
            )}
          </p>
        );
      })}
    </div>
  );
}
