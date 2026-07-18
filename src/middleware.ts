import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
export async function middleware(request: NextRequest) { if (request.nextUrl.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) { const origin = request.headers.get("origin"); if (origin && new URL(origin).host !== request.nextUrl.host) return new Response("Invalid request origin", { status: 403 }); } return updateSession(request); }
export const config = { matcher: ["/dashboard/:path*", "/login", "/api/:path*"] };
