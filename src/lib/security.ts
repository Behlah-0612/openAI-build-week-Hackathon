import { NextResponse } from "next/server";
type Bucket = { tokens: number; resetAt: number };
const buckets = new Map<string, Bucket>();
export function requireSameOrigin(request: Request) { const origin = request.headers.get("origin"); const host = request.headers.get("host"); if (origin && host && new URL(origin).host !== host) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 }); return null; }
export function rateLimit(userId: string, limit = 12, windowMs = 60_000) { const now = Date.now(); const bucket = buckets.get(userId); if (!bucket || bucket.resetAt < now) { buckets.set(userId, { tokens: limit - 1, resetAt: now + windowMs }); return true; } if (bucket.tokens <= 0) return false; bucket.tokens--; return true; }
