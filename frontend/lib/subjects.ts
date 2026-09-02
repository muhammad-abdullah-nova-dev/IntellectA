import type { LucideIcon } from "lucide-react";
import {
  Atom,
  BookOpen,
  Calculator,
  Dna,
  FlaskConical,
  Globe2,
  Landmark,
  LineChart,
} from "lucide-react";

export interface SubjectInfo {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  description: string;
  emoji: string;
}

export const SUBJECTS: SubjectInfo[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    icon: Calculator,
    color: "from-cyan-500 to-cyan-600",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    description: "Algebra, calculus, geometry & proofs with LaTeX.",
    emoji: "🧮",
  },
  {
    id: "physics",
    name: "Physics",
    icon: Atom,
    color: "from-indigo-500 to-violet-600",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    description: "Mechanics, waves, relativity & modern physics.",
    emoji: "⚛️",
  },
  {
    id: "chemistry",
    name: "Chemistry",
    icon: FlaskConical,
    color: "from-emerald-500 to-teal-600",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    description: "Reactions, bonding, stoichiometry & organic chem.",
    emoji: "⚗️",
  },
  {
    id: "biology",
    name: "Biology",
    icon: Dna,
    color: "from-green-500 to-emerald-600",
    iconColor: "text-green-600 dark:text-green-400",
    description: "Cells, genetics, ecology & human physiology.",
    emoji: "🧬",
  },
  {
    id: "history",
    name: "History",
    icon: BookOpen,
    color: "from-amber-500 to-orange-600",
    iconColor: "text-amber-600 dark:text-amber-400",
    description: "World events, civilizations & cause-effect analysis.",
    emoji: "📜",
  },
  {
    id: "politics",
    name: "Politics",
    icon: Landmark,
    color: "from-violet-500 to-purple-600",
    iconColor: "text-violet-600 dark:text-violet-400",
    description: "Governance, constitutions & political theory.",
    emoji: "🏛️",
  },
  {
    id: "geography",
    name: "Geography",
    icon: Globe2,
    color: "from-sky-500 to-blue-600",
    iconColor: "text-sky-600 dark:text-sky-400",
    description: "Physical & human geography, maps & climate.",
    emoji: "🌍",
  },
  {
    id: "economics",
    name: "Economics",
    icon: LineChart,
    color: "from-orange-500 to-rose-600",
    iconColor: "text-orange-600 dark:text-orange-400",
    description: "Micro, macro, markets & policy basics.",
    emoji: "📈",
  },
];

export const SUBJECT_NAMES = SUBJECTS.map((s) => s.name);
