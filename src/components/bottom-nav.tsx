"use client";
import Link from "next/link";
import { ChefHat, LayoutDashboard, ReceiptText, ShoppingBasket } from "lucide-react";
import { usePathname } from "next/navigation";
const links = [{ href: "/dashboard", label: "Home", icon: LayoutDashboard }, { href: "/pantry", label: "Pantry", icon: ShoppingBasket }, { href: "/scan", label: "Scan", icon: ReceiptText }, { href: "/chef", label: "Chef", icon: ChefHat }];
export function BottomNav() { const path = usePathname(); return <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-ink/10 bg-cream/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:left-1/2 md:max-w-md md:-translate-x-1/2"><div className="mx-auto grid max-w-md grid-cols-4">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-medium ${path === href ? "bg-herb/10 text-herb" : "text-ink/60"}`}><Icon size={21}/>{label}</Link>)}</div></nav>; }
