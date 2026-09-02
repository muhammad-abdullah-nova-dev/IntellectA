import { sanitizeMathInMarkdown } from "@/utils/latex-sanitize";

export type ContentPart =
  | { type: "markdown"; value: string }
  | { type: "math"; value: string; display: boolean };

export type ContentBlock =
  | { type: "paragraph"; parts: ContentPart[] }
  | { type: "display-math"; value: string }
  | { type: "markdown-block"; value: string };

function isBlockMarkdown(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;

  return (
    /^#{1,6}\s/m.test(trimmed) ||
    /^[-*+]\s/m.test(trimmed) ||
    /^\d+\.\s/m.test(trimmed) ||
    /^```/m.test(trimmed) ||
    /^\|/m.test(trimmed) ||
    /^>/m.test(trimmed) ||
    trimmed.includes("\n\n")
  );
}

/** Group parts so inline math stays in the same line as surrounding text. */
export function groupContentBlocks(parts: ContentPart[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let inlineBuffer: ContentPart[] = [];

  const flushInline = () => {
    if (inlineBuffer.length === 0) return;

    if (
      inlineBuffer.length === 1 &&
      inlineBuffer[0].type === "markdown" &&
      isBlockMarkdown(inlineBuffer[0].value)
    ) {
      blocks.push({ type: "markdown-block", value: inlineBuffer[0].value });
    } else {
      blocks.push({ type: "paragraph", parts: [...inlineBuffer] });
    }
    inlineBuffer = [];
  };

  for (const part of parts) {
    if (part.type === "math" && part.display) {
      flushInline();
      blocks.push({ type: "display-math", value: part.value });
      continue;
    }

    if (part.type === "markdown" && isBlockMarkdown(part.value)) {
      flushInline();
      blocks.push({ type: "markdown-block", value: part.value });
      continue;
    }

    inlineBuffer.push(part);
  }

  flushInline();
  return blocks;
}

export function splitMathAndMarkdown(content: string): ContentPart[] {
  const text = sanitizeMathInMarkdown(content);
  const parts: ContentPart[] = [];
  const regex = /\$\$([\s\S]*?)\$\$|\$([^\$\n]+?)\$/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "markdown",
        value: text.slice(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined) {
      parts.push({ type: "math", value: match[1].trim(), display: true });
    } else if (match[2] !== undefined) {
      parts.push({ type: "math", value: match[2].trim(), display: false });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "markdown", value: text.slice(lastIndex) });
  }

  if (parts.length === 0) {
    parts.push({ type: "markdown", value: text });
  }

  return parts;
}
