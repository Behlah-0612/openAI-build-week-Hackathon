import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the local app hydrate correctly when it is opened on this machine's
  // LAN address (for example, while testing camera capture from a phone).
  // Add a new LAN address here if DHCP assigns a different one.
  allowedDevOrigins: ["localhost", "127.0.0.1", "10.0.0.136"],
  headers: async () => [{ source: "/(.*)", headers: [
    { key: "Content-Security-Policy", value: "default-src 'self'; img-src 'self' data: https://*.supabase.co https://i.ytimg.com; connect-src 'self' https://*.supabase.co; media-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(self)" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }
  ] }]
};
export default nextConfig;
