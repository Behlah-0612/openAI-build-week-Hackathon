import { type ButtonHTMLAttributes, forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost" | "outline" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  destructive: "bg-error text-white hover:bg-error/90",
  ghost: "bg-transparent text-primary hover:bg-primary/10",
  outline: "border border-border/15 bg-transparent text-text hover:bg-text/5",
  link: "min-h-0 rounded-none bg-transparent p-0 text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 rounded-lg px-3 text-sm gap-1.5",
  md: "min-h-12 rounded-lg px-4 text-sm gap-2",
  lg: "min-h-14 rounded-lg px-5 text-base gap-2",
  icon: "min-h-11 min-w-11 rounded-lg p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50",
    variantClasses[variant],
    size !== "icon" || variant !== "link" ? sizeClasses[size] : undefined,
    className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading = false, disabled, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={buttonVariants({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="animate-spin" size={size === "sm" ? 16 : 18} aria-hidden="true" />}
      {children}
    </button>
  );
});
