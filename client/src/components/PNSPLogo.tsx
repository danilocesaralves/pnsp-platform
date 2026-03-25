import { LOGO_URL } from "@shared/pnsp";
import { cn } from "@/lib/utils";

interface PNSPLogoProps {
  variant?: "full" | "icon" | "text";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: "dark" | "light" | "auto";
  className?: string;
}

const sizeMap = {
  xs: { img: "h-6", text: "text-sm" },
  sm: { img: "h-8", text: "text-base" },
  md: { img: "h-10", text: "text-lg" },
  lg: { img: "h-12", text: "text-xl" },
  xl: { img: "h-16", text: "text-2xl" },
};

export function PNSPLogo({
  variant = "full",
  size = "md",
  theme = "auto",
  className,
}: PNSPLogoProps) {
  const { img: imgSize, text: textSize } = sizeMap[size];

  const textColor =
    theme === "dark"
      ? "text-white"
      : theme === "light"
      ? "text-[var(--n950)]"
      : "text-foreground";

  if (variant === "icon") {
    return (
      <img
        src={LOGO_URL}
        alt="PNSP"
        className={cn(imgSize, "w-auto object-contain", className)}
      />
    );
  }

  if (variant === "text") {
    return (
      <span
        className={cn(
          "font-display font-semibold tracking-tight",
          textSize,
          textColor,
          className
        )}
      >
        <span style={{ color: "var(--o500)" }}>P</span>
        <span>NSP</span>
      </span>
    );
  }

  // full variant — logo image + text
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={LOGO_URL}
        alt="PNSP"
        className={cn(imgSize, "w-auto object-contain flex-shrink-0")}
      />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display font-semibold tracking-tight",
            textSize,
            textColor
          )}
        >
          PNSP
        </span>
        <span
          className={cn(
            "font-body text-[0.6em] tracking-widest uppercase opacity-70",
            textColor
          )}
        >
          Samba & Pagode
        </span>
      </div>
    </div>
  );
}

export default PNSPLogo;
