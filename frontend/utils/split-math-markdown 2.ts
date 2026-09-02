import { sanitizeMathInMarkdown } from "@/utils/latex-sanitize";

export type ContentPart =
  | { type: "markdown"; value: string }
  | { type: "math"; value: string; display: boolean };

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
