export type AgentId =
  | "MathAgent"
  | "PhysicsAgent"
  | "ChemistryAgent"
  | "HistoryAgent"
  | "mathematics"
  | "physics"
  | "chemistry"
  | "biology"
  | "history"
  | "politics"
  | "geography"
  | "economics"
  | "IntellectA"
  | "OutOfScope"
  | "Unknown"
  | string;

export interface AgentBadgeInfo {
  label: string;
  emoji: string;
  className: string;
}

const SUBJECT_BADGE_CLASS =
  "border-slate-200 bg-slate-50 text-slate-800 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200";

const AGENT_BADGES: Record<string, AgentBadgeInfo> = {
  // v2 subject slugs
  mathematics: {
    label: "Mathematics",
    emoji: "🧮",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
  },
  physics: {
    label: "Physics",
    emoji: "⚛️",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
  },
  chemistry: {
    label: "Chemistry",
    emoji: "⚗️",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
  biology: {
    label: "Biology",
    emoji: "🧬",
    className:
      "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/40 dark:text-green-200",
  },
  history: {
    label: "History",
    emoji: "📜",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  },
  politics: {
    label: "Politics",
    emoji: "🏛️",
    className:
      "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200",
  },
  geography: {
    label: "Geography",
    emoji: "🌍",
    className:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
  },
  economics: {
    label: "Economics",
    emoji: "📈",
    className:
      "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-200",
  },
  // Out of scope — brand badge only
  IntellectA: {
    label: "IntellectA",
    emoji: "✨",
    className: SUBJECT_BADGE_CLASS,
  },
  scope_guard: {
    label: "IntellectA",
    emoji: "✨",
    className: SUBJECT_BADGE_CLASS,
  },
  // v1 legacy agents (image upload path)
  MathAgent: {
    label: "Mathematics",
    emoji: "🧮",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-200",
  },
  PhysicsAgent: {
    label: "Physics",
    emoji: "⚛️",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200",
  },
  ChemistryAgent: {
    label: "Chemistry",
    emoji: "⚗️",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
  HistoryAgent: {
    label: "History",
    emoji: "📜",
    className:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  },
  OutOfScope: {
    label: "IntellectA",
    emoji: "✨",
    className: SUBJECT_BADGE_CLASS,
  },
  Unknown: {
    label: "IntellectA",
    emoji: "✨",
    className: SUBJECT_BADGE_CLASS,
  },
};

export function getAgentBadge(agent?: string | null): AgentBadgeInfo {
  if (!agent) {
    return AGENT_BADGES.IntellectA;
  }
  return AGENT_BADGES[agent] ?? AGENT_BADGES.IntellectA;
}
