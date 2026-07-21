import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { PwaRegister } from "@/components/pwa-register";
import { ToastProvider } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "PantryChef", description: "Your pantry, your personal chef", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "PantryChef" } };
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8F6F0" },
    { media: "(prefers-color-scheme: dark)", color: "#141A16" },
  ],
  width: "device-width",
  initialScale: 1,
};
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <ToastProvider>
          <div className={`mx-auto min-h-[100dvh] max-w-md ${user ? "pb-28" : ""}`}>{children}</div>
          {user && <BottomNav />}
        </ToastProvider>
      </body>
    </html>
  );
}
