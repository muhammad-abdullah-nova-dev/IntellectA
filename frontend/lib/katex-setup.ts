import katex from "katex";

let mhchemReady = false;

function ensureMhchem(): void {
  if (typeof window === "undefined" || mhchemReady) return;
  try {
    // Side-effect extension — load only in the browser to avoid SSR/webpack chunk issues.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("katex/contrib/mhchem/mhchem.js");
    mhchemReady = true;
  } catch {
    // Chemistry extension is optional.
  }
}

export function renderKatex(tex: string, displayMode = false): string {
  const trimmed = tex.trim();
  if (!trimmed) return "";

  ensureMhchem();

  try {
    return katex.renderToString(trimmed, {
      displayMode,
      throwOnError: false,
      strict: false,
      trust: true,
    });
  } catch {
    return trimmed;
  }
}
