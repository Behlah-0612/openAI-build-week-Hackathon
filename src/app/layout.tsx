import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = { title: "PantryChef", description: "Your pantry, your personal chef", manifest: "/manifest.webmanifest", appleWebApp: { capable: true, title: "PantryChef" } };
export const viewport: Viewport = { themeColor: "#467153", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><PwaRegister />{children}</body></html>; }
