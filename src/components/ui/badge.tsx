import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "primary" | "warning" | "error" | "success";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-text/8 text-muted-text",
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning-surface text-warning",
  error: "bg-error-surface text-error",
  success: "bg-success/10 text-success",
};

export function Badge({ tone = "neutral", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold", toneClasses[tone], className)} {...props} />;
}
