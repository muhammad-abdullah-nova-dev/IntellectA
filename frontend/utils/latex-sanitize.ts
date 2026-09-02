/** Fix common LLM LaTeX mistakes before KaTeX rendering. */
export function sanitizeMathInMarkdown(content: string): string {
  let text = fixMhchemMacros(String(content || ""));
  text = wrapCeInMathDelimiters(text);
  text = autoWrapPlainEquations(text);
  text = wrapStandaloneCeLines(text);

  // Orphan LaTeX ending with $$ but no opening $$ (common LLM mistake)
  text = text.replace(
    /(?<!\$\$)(\\(?:text|frac|begin|end)[\s\S]*?\\end\{array\}\s*\$\$)/g,
    (match) => {
      const inner = match.replace(/\$\$$/, "").trim();
      return `$$\n${repairMathBlock(inner)}\n$$`;
    }
  );

  text = text.replace(
    /(?<!\$\$)(\\text\{[\s\S]*?\\(?:down|up|left|right)arrow[\s\S]*?\$\$)/g,
    (match) => {
      const inner = match.replace(/\$\$$/, "").trim();
      return `$$\n${repairMathBlock(inner)}\n$$`;
    }
  );

  // Repair each display math block
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner: string) => {
    const { math, prose } = splitMathAndProse(inner);
    const fixed = repairMathBlock(math);
    if (prose) {
      return `$$\n${fixed}\n$$\n\n${prose.trim()}`;
    }
    return `$$\n${fixed}\n$$`;
  });

  // Balance unclosed display math
  const delimiterCount = (text.match(/\$\$/g) || []).length;
  if (delimiterCount % 2 === 1) {
    text += "\n$$";
  }

  return text;
}

function splitMathAndProse(inner: string): { math: string; prose: string } {
  const prosePatterns = [
    /\n\s*Note that\b/i,
    /\n\s*\*\*Key concepts/i,
    /\n\s*\*\s+The\s+/,
    /\n\s*-\s+The\s+(normal|weight|traction|frictional)/i,
    /\n\s*This FBD will be/i,
  ];

  let splitAt = -1;
  for (const pattern of prosePatterns) {
    const match = inner.match(pattern);
    if (match?.index !== undefined) {
      if (splitAt === -1 || match.index < splitAt) {
        splitAt = match.index;
      }
    }
  }

  if (splitAt === -1) {
    return { math: inner, prose: "" };
  }

  return {
    math: inner.slice(0, splitAt),
    prose: inner.slice(splitAt),
  };
}

function repairMathBlock(inner: string): string {
  let m = inner.trim();

  // Markdown must not live inside math
  m = m.replace(/\*\*([^*]+)\*\*/g, "\\text{$1}");
  m = m.replace(/^\s*[\*\-]\s+/gm, "");
  m = m.replace(/\n{3,}/g, "\n\n");

  const hasBegin = /\\begin\{array\}/.test(m);
  const hasEnd = /\\end\{array\}/.test(m);

  if (hasEnd && !hasBegin) {
    m = `\\begin{array}{c}\n${m}`;
  }
  if (hasBegin && !hasEnd) {
    m = `${m}\n\\end{array}`;
  }

  // Lone \end{array} without any begin — strip duplicate ends
  if ((m.match(/\\end\{array\}/g) || []).length > 1 && !hasBegin) {
    m = m.replace(/\\end\{array\}/g, "").trim();
    m = `\\begin{array}{c}\n${m}\n\\end{array}`;
  }

  // \text{...}\\ \downarrow style lines work better in array
  if (
    /\\(downarrow|uparrow|leftarrow|rightarrow)/.test(m) &&
    !/\\begin\{array\}/.test(m)
  ) {
    m = `\\begin{array}{c}\n${m}\n\\end{array}`;
  }

  return fixMhchemMacros(m);
}

/**
 * Model often writes \\ceFe or \\ceO2 instead of \\ce{Fe} / \\ce{O2}.
 * mhchem requires braces — without them KaTeX shows red \\ce.
 */
export function fixMhchemMacros(text: string): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    const idx = text.indexOf("\\ce", i);
    if (idx === -1) {
      result += text.slice(i);
      break;
    }

    result += text.slice(i, idx);
    const afterTag = idx + 3;

    if (text[afterTag] === "{") {
      let depth = 0;
      let j = afterTag;
      for (; j < text.length; j++) {
        if (text[j] === "{") depth++;
        if (text[j] === "}") {
          depth--;
          if (depth === 0) {
            j++;
            break;
          }
        }
      }
      const inner = text.slice(afterTag + 1, j - 1);
      result += `\\ce{${normalizeCeBody(inner)}}`;
      i = j;
      continue;
    }

    let j = afterTag;
    while (j < text.length && /[A-Za-z0-9+\-=<>\s^().]/.test(text[j])) {
      j++;
    }

    const body = text.slice(afterTag, j).trim();
    if (body) {
      result += `\\ce{${normalizeCeBody(body)}}`;
    } else {
      result += "\\ce";
    }
    i = j;
  }

  return result;
}

function normalizeCeBody(body: string): string {
  return body
    .replace(/->/g, " -> ")
    .replace(/<-/g, " <- ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Wrap \\ce{...} in $...$ when the model left it outside math mode. */
function wrapCeInMathDelimiters(text: string): string {
  let result = "";
  let i = 0;

  while (i < text.length) {
    const idx = text.indexOf("\\ce{", i);
    if (idx === -1) {
      result += text.slice(i);
      break;
    }

    result += text.slice(i, idx);

    if (isInsideMathDelimiter(text, idx)) {
      const close = text.indexOf("}", idx + 4);
      result += text.slice(idx, close + 1);
      i = close + 1;
      continue;
    }

    const close = text.indexOf("}", idx + 4);
    if (close === -1) {
      result += text.slice(idx);
      break;
    }

    const ce = text.slice(idx, close + 1);
    result += `$${ce}$`;
    i = close + 1;
  }

  return result;
}

function isInsideMathDelimiter(text: string, position: number): boolean {
  let i = 0;
  let inInline = false;
  let inDisplay = false;

  while (i < position) {
    if (text[i] === "$" && text[i - 1] !== "\\") {
      if (text[i + 1] === "$") {
        inDisplay = !inDisplay;
        inInline = false;
        i += 2;
        continue;
      }
      if (!inDisplay) {
        inInline = !inInline;
      }
    }
    i++;
  }

  return inInline || inDisplay;
}

/** Lines that are only a \\ce{...} expression should be in math mode. */
function wrapStandaloneCeLines(text: string): string {
  return text.replace(
    /^(\s*)(\\ce\{[^}\n]+\})\s*$/gm,
    (_, indent: string, ce: string) => `${indent}$$${ce}$$`
  );
}

/** Wrap plain-text equation lines (common in chemistry) in $...$ for KaTeX. */
function autoWrapPlainEquations(content: string): string {
  return content.replace(/^(?!\s*[$`#>|\-*])(.+)$/gm, (line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.includes("$")) return line;
    if (trimmed.length > 200) return line;
    if (!looksLikePlainEquation(trimmed)) return line;

    const latex = plainEquationToLatex(trimmed);
    const isDisplay =
      /^[A-Za-z\\]/.test(trimmed) &&
      trimmed.includes("=") &&
      (trimmed.includes("\\frac") || /\(.*\/.*\)/.test(trimmed) || trimmed.includes("ln"));

    if (isDisplay && trimmed.length < 120) {
      return `$$${latex}$$`;
    }
    return line.replace(trimmed, `$${latex}$`);
  });
}

function looksLikePlainEquation(line: string): boolean {
  if (!/[=]/.test(line)) return false;
  if (/^#{1,6}\s/.test(line)) return false;
  if (/^(Note|Step|Thus|Therefore|Where|Given)\b/i.test(line)) return false;

  const chemMathSignals =
    /\bln\b|\blog\b|\bexp\b|°|\/[A-Za-z)]|\^[0-9\-]|\bRT\b|\bPV\b|pH|K_[a-z]|E°|E\^/;
  const hasSignal = chemMathSignals.test(line);
  const startsWithVar = /^[A-Za-zΔ][A-Za-z0-9_°\\]*\s*=/.test(line);

  return hasSignal && startsWithVar;
}

function plainEquationToLatex(line: string): string {
  let s = line;
  s = s.replace(/°/g, "^{\\circ}");
  s = s.replace(/\*\s*/g, " \\cdot ");
  s = s.replace(/\(([A-Za-z0-9\\]+)\/([A-Za-z0-9\\]+)\)/g, "\\frac{$1}{$2}");
  s = s.replace(/\bln\s*\(([^)]+)\)/g, "\\ln \\left($1\\right)");
  s = s.replace(/\bln\s+([A-Za-z0-9]+)/g, "\\ln $1");
  s = s.replace(/\blog\s*\(([^)]+)\)/g, "\\log \\left($1\\right)");
  s = s.replace(/\s*=\s*/g, " = ");
  return s.trim();
}
