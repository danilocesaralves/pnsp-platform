import { cn } from "@/lib/utils";
import { PNSPLogoSVG } from "./PNSPLogoSVG";

interface PNSPLogoProps {
  /** "full" = SVG logo completo (símbolo + PNSP + subtítulo)
   *  "icon" = apenas o símbolo (pandeiro + notas) — usa img recortada
   *  "text" = apenas o wordmark tipográfico */
  variant?: "full" | "icon" | "text";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** "dark" = fundo escuro → logo dourado
   *  "light" = fundo claro → logo preto
   *  "auto"  = herda do contexto (currentColor) */
  theme?: "dark" | "light" | "auto";
  className?: string;
}

// Tamanhos — o logo SVG tem proporção ~2.32:1 (largura:altura)
// Definimos a altura; a largura é calculada automaticamente
const sizeMap = {
  xs:    "h-7",    // 28px
  sm:    "h-10",   // 40px
  md:    "h-12",   // 48px
  lg:    "h-14",   // 56px
  xl:    "h-18",   // 72px
  "2xl": "h-24",   // 96px
};

// Cor do fill conforme tema
const fillMap = {
  dark:  "#DCA832",   // dourado sobre fundo escuro
  light: "#1a1a1a",   // preto sobre fundo claro
  auto:  "currentColor",
};

export function PNSPLogo({
  variant = "full",
  size = "md",
  theme = "auto",
  className,
}: PNSPLogoProps) {
  const hClass = sizeMap[size];
  const fill = fillMap[theme];

  // ── variant: text ─────────────────────────────────────────────────────────
  if (variant === "text") {
    const textSizeMap = {
      xs: "text-sm", sm: "text-base", md: "text-lg",
      lg: "text-xl", xl: "text-2xl", "2xl": "text-3xl",
    };
    const textColor =
      theme === "dark" ? "text-white"
      : theme === "light" ? "text-[#1a1a1a]"
      : "text-foreground";

    return (
      <span
        className={cn(
          "font-display font-semibold tracking-tight",
          textSizeMap[size],
          textColor,
          className
        )}
      >
        <span style={{ color: "var(--o500)" }}>P</span>
        <span>NSP</span>
      </span>
    );
  }

  // ── variant: icon ─────────────────────────────────────────────────────────
  // O SVG é horizontal (símbolo + texto). Para mostrar só o símbolo,
  // usamos um wrapper com overflow:hidden e largura fixa igual à altura
  if (variant === "icon") {
    return (
      <div
        className={cn("overflow-hidden flex-shrink-0", hClass, className)}
        style={{ width: "var(--logo-icon-w, 1em)", aspectRatio: "1 / 1" }}
        aria-label="PNSP"
      >
        <PNSPLogoSVG
          fill={fill}
          className={cn(hClass, "max-w-none")}
          // Shift left to show only the symbol portion (~40% of width)
        />
      </div>
    );
  }

  // ── variant: full (padrão) ────────────────────────────────────────────────
  return (
    <PNSPLogoSVG
      fill={fill}
      className={cn(hClass, className)}
    />
  );
}

export default PNSPLogo;
