import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function IntellectAWordmark({
  className,
  width = 132,
  href,
}: {
  className?: string;
  width?: number;
  href?: string;
}) {
  const height = Math.round((width / 168) * 32);
  const img = (
    <Image
      src="/intellecta-logo.svg"
      alt="IntellectA"
      width={width}
      height={height}
      className={cn("h-auto w-auto", className)}
      priority
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 no-underline">
        {img}
      </Link>
    );
  }

  return img;
}

export function IntellectAIcon({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/intellecta-icon.svg"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden
    />
  );
}
