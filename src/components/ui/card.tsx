import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "default" | "outlined" | "dashed" | "filled-primary";
export type CardPadding = "none" | "sm" | "md" | "lg";

const variantClasses: Record<CardVariant, string> = {
  default: "bg-surface shadow-sm shadow-black/5",
  outlined: "bg-surface border border-border/10",
  dashed: "border-2 border-dashed border-primary/30 bg-surface",
  "filled-primary": "bg-primary text-primary-foreground",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
};

export type CardProps = HTMLAttributes<HTMLDivElement> & { variant?: CardVariant; padding?: CardPadding };

export function Card({ variant = "default", padding = "lg", className, ...props }: CardProps) {
  return <div className={cn("rounded-xl", variantClasses[variant], paddingClasses[padding], className)} {...props} />;
}
