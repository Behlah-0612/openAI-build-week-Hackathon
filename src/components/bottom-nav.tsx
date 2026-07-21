"use client";

import Link from "next/link";
import { ChefHat, LayoutDashboard, ReceiptText, ShoppingBasket, UtensilsCrossed } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/pantry", label: "Pantry", icon: ShoppingBasket },
  { href: "/scan", label: "Scan", icon: ReceiptText },
  { href: "/recipes", label: "Cook", icon: UtensilsCrossed },
  { href: "/chef", label: "Chef", icon: ChefHat },
];

export function BottomNav() {
  const path = usePathname();

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-50 w-[calc(100%-1.25rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border/10 bg-surface-elevated/95 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl"
    >
      <div className="grid grid-cols-5 gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== "/dashboard" && path.startsWith(`${href}/`));

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold transition-colors ${
                active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-text hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
