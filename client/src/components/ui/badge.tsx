import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        gold:
          "border-transparent bg-[var(--o100)] text-[var(--o900)]",
        green:
          "border-transparent bg-[var(--g100)] text-[var(--g900)]",
        /* ── Tipos de perfil ──────────────────────────────────────────── */
        artista:
          "border-transparent bg-[var(--g100)] text-[var(--g900)]",
        grupo:
          "border-transparent bg-[var(--o100)] text-[var(--o900)]",
        produtor:
          "border-transparent bg-[#ede9fe] text-[#5b21b6]",
        professor:
          "border-transparent bg-[#dbeafe] text-[#1e40af]",
        estudio:
          "border-transparent bg-[#d1fae5] text-[#065f46]",
        luthier:
          "border-transparent bg-[#ffedd5] text-[#9a3412]",
        contratante:
          "border-transparent bg-[#cffafe] text-[#155e75]",
        parceiro:
          "border-transparent bg-[#f3f4f6] text-[#374151]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const PROFILE_TYPE_VARIANT: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
  artista_solo:       "artista",
  grupo_banda:        "grupo",
  comunidade_roda:    "artista",
  produtor:           "produtor",
  professor:          "professor",
  estudio:            "estudio",
  loja:               "luthier",
  luthier:            "luthier",
  contratante:        "contratante",
  parceiro:           "parceiro",
};

function profileTypeBadgeVariant(profileType?: string | null): VariantProps<typeof badgeVariants>["variant"] {
  if (!profileType) return "outline";
  return PROFILE_TYPE_VARIANT[profileType] ?? "outline";
}

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants, profileTypeBadgeVariant };
