import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";
import { controlClassName } from "./input";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(controlClassName, "min-h-24 py-2.5", invalid && "border-error focus-visible:border-error focus-visible:ring-error/30", className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});
