import { cn } from "@/lib/utils";
import { SUBJECTS, type SubjectInfo } from "@/lib/subjects";

/** Full Tailwind classes (no dynamic concat) so JIT includes every subject gradient. */
const ICON_BOX: Record<string, string> = {
  mathematics:
    "bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-900/30",
  physics:
    "bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-900/30",
  chemistry:
    "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-900/30",
  biology:
    "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-900/30",
  history:
    "bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-900/30",
  politics:
    "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-900/30",
  geography:
    "bg-gradient-to-br from-sky-500 to-blue-600 shadow-sky-900/30",
  economics:
    "bg-gradient-to-br from-orange-500 to-rose-600 shadow-orange-900/30",
};

const SIZE = {
  sm: { box: "h-8 w-8 rounded-lg", icon: "h-4 w-4" },
  md: { box: "h-9 w-9 rounded-lg", icon: "h-4 w-4" },
  lg: { box: "h-11 w-11 rounded-xl", icon: "h-5 w-5" },
} as const;

export function SubjectIcon({
  subject,
  size = "md",
  className,
}: {
  subject: SubjectInfo | string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  const info =
    typeof subject === "string"
      ? SUBJECTS.find((s) => s.id === subject) ?? SUBJECTS[0]
      : subject;
  const Icon = info.icon;
  const s = SIZE[size];
  const gradient = ICON_BOX[info.id] ?? ICON_BOX.mathematics;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center text-white shadow-sm",
        s.box,
        gradient,
        className
      )}
    >
      <Icon className={s.icon} />
    </div>
  );
}
