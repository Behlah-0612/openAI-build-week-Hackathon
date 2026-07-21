"use client";

import { type MouseEvent, type ReactNode, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Renders as a real `<a href="/dashboard?pulse=1">` so it works with no JS.
 * When JS is available, intercepts the click and navigates via the router
 * inside a transition, so the existing server-side Pantry Pulse computation
 * (unchanged) gets a pending state and no full-page reload flash, instead of
 * a second client-side fetch that would trigger the AI call twice.
 */
export function PantryPulseTrigger({
  children,
  pendingChildren,
  className,
  "aria-label": ariaLabel,
  title,
}: {
  children: ReactNode;
  pendingChildren?: ReactNode;
  className?: string;
  "aria-label"?: string;
  title?: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pending) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    startTransition(() => router.push("/dashboard?pulse=1"));
  }

  return (
    <a
      href="/dashboard?pulse=1"
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-busy={pending || undefined}
      title={title}
      className={cn(className, pending && "pointer-events-none opacity-70")}
    >
      {pending ? pendingChildren ?? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : children}
    </a>
  );
}
