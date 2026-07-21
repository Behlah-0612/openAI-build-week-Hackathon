import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

const controlClassName =
  "min-h-11 w-full rounded-lg border border-border/15 bg-surface px-3 text-text placeholder:text-muted-text/70 outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(controlClassName, invalid && "border-error focus-visible:border-error focus-visible:ring-error/30", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

export { controlClassName };
