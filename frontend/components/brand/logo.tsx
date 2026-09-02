import { cn } from "@/lib/utils";
import { IntellectAIcon } from "@/components/brand/intellecta-logo";

/** IntellectA app symbol (gradient mark) */
export function IntellectALogoMark({
  className,
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return <IntellectAIcon size={size} className={className} />;
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 36,
  lg: 40,
  xl: 56,
  "2xl": 72,
} as const;

export type LogoSize = keyof typeof sizeMap;

export function LogoIcon({
  size = "md",
  className,
}: {
  size?: LogoSize;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <IntellectAIcon
      size={sizeMap[size]}
      className={cn("shrink-0", className)}
    />
  );
}

export function LogoBrand({
  size = "md",
  showTagline = false,
  tagline = "Learn smarter, every day",
  className,
  nameClassName,
}: {
  size?: LogoSize;
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  nameClassName?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon size={size} />
      <div className="min-w-0">
        <p
          className={cn(
            "font-semibold leading-tight text-[#f6f6f6]",
            size === "xs" || size === "sm" ? "text-sm" : "text-base",
            nameClassName
          )}
        >
          IntellectA
        </p>
        {showTagline && (
          <p className="truncate text-xs text-[#999]">{tagline}</p>
        )}
      </div>
    </div>
  );
}

/** Assistant avatar in chat */
export function LogoAvatar({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const px = size === "sm" ? 40 : size === "lg" ? 48 : 40;

  return (
    <IntellectAIcon
      size={px}
      className={cn("shrink-0 rounded-xl", className)}
    />
  );
}
