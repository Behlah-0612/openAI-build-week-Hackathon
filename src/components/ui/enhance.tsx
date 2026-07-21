"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Renders `fallback` until the client has hydrated, then swaps to `children`.
 * Lets a real, working no-JS <form> ship as the fallback for a richer client
 * flow, with no flash of both UIs and no JS-detection hacks.
 */
export function Enhance({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return <>{ready ? children : fallback}</>;
}
