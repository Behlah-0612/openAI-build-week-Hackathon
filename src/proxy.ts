import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function isPrivateDevelopmentOrigin(origin: URL) {
  const hostname = origin.hostname;
  const privateLan = hostname.startsWith("10.") || hostname.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname);
  return hostname === "localhost" || hostname === "127.0.0.1" || privateLan;
}

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    !["GET", "HEAD", "OPTIONS"].includes(request.method)
  ) {
    const origin = request.headers.get("origin");

    const originUrl = origin ? new URL(origin) : null;
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const sameOrigin = originUrl && [request.nextUrl.host, request.headers.get("host"), forwardedHost].filter(Boolean).includes(originUrl.host);
    const permittedDevelopmentOrigin = process.env.NODE_ENV === "development" && originUrl && isPrivateDevelopmentOrigin(originUrl);

    if (originUrl && !sameOrigin && !permittedDevelopmentOrigin) {
      return new Response("Invalid request origin", { status: 403 });
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/api/:path*"],
};
