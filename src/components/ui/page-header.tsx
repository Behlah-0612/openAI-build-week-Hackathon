import { type ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({
  backHref,
  backLabel = "Back",
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {backHref && (
          <Link href={backHref} className="inline-flex min-h-11 items-center gap-1 -ml-1 px-1 text-sm font-semibold text-primary">
            <ChevronLeft size={16} aria-hidden="true" /> {backLabel}
          </Link>
        )}
        {eyebrow && <p className={cn("text-xs font-bold uppercase tracking-wider text-primary", backHref && "mt-3")}>{eyebrow}</p>}
        <h1 className={cn("text-3xl font-bold tracking-tight text-text", (backHref || eyebrow) && "mt-1")}>{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted-text">{description}</p>}
      </div>
      {action && <div className="mt-1 shrink-0">{action}</div>}
    </header>
  );
}
