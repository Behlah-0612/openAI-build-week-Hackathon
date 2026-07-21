import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border/20 p-6 text-center", className)}>
      {Icon && <Icon className="mx-auto text-muted-text/60" size={28} aria-hidden="true" />}
      <p className={cn("font-semibold text-text", Icon && "mt-3")}>{title}</p>
      {description && <p className="mt-1 text-sm text-muted-text">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
