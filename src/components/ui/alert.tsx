import { type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertVariant = "info" | "success" | "warning" | "error";

const config: Record<AlertVariant, { icon: typeof Info; classes: string; role: "alert" | "status" }> = {
  info: { icon: Info, classes: "bg-info-surface text-info", role: "status" },
  success: { icon: CheckCircle2, classes: "bg-success/10 text-success", role: "status" },
  warning: { icon: AlertTriangle, classes: "bg-warning-surface text-warning", role: "alert" },
  error: { icon: XCircle, classes: "bg-error-surface text-error", role: "alert" },
};

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, classes, role } = config[variant];
  return (
    <div role={role} className={cn("flex gap-3 rounded-lg p-3.5 text-sm", classes, className)}>
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? "mt-0.5" : ""}>{children}</div>
      </div>
    </div>
  );
}
