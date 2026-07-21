import Link from "next/link";
import { BarChart3, ChevronRight, Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PantrySummary } from "@/components/pantry-summary";
import { ExpiringItems } from "@/components/expiring-items";
import { generatePantryPulse, PantryPulseError, type PantryPulse } from "@/lib/pantry-pulse";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ inventory_notice?: string; inventory_error?: string; pulse?: string }> }) {
  const messages = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
  const { data: items } = user
    ? await supabase
        .from("pantry_items")
        .select("id, name, expires_at")
        .not("expires_at", "is", null)
        .gte("expires_at", today)
        .lte("expires_at", soon)
        .order("expires_at", { ascending: true })
        .limit(5)
    : { data: [] };
  let pulse: PantryPulse | null = null;
  let pulseError = "";

  if (messages.pulse === "1" && user) {
    const { data: pantryItems, error } = await supabase
      .from("pantry_items")
      .select("name,category,quantity,unit,estimated_price,expires_at")
      .limit(200);

    if (error) {
      pulseError = "Could not load your pantry for meal ideas.";
    } else {
      try {
        pulse = await generatePantryPulse(user.id, pantryItems ?? []);
      } catch (error) {
        console.error("Dashboard Pantry Pulse failed:", error);
        pulseError = error instanceof PantryPulseError ? error.message : "Pantry Pulse could not be refreshed.";
      }
    }
  }

  return (
    <main className="p-5">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">Your kitchen</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-text">Good to see you 👋</h1>
        </div>
        {user ? (
          <form action="/api/auth/logout" method="post">
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Log out
            </button>
          </form>
        ) : (
          <Link href="/login" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Log in
          </Link>
        )}
      </header>

      <Card variant="filled-primary" className="mt-6">
        <Sparkles size={24} aria-hidden="true" />
        <h2 className="mt-3 text-xl font-bold">Start with what you have.</h2>
        <p className="mt-2 text-sm text-primary-foreground/80">Add a few pantry items, and I&rsquo;ll turn them into dinner ideas.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link href="/pantry?add=1" className={buttonVariants({ variant: "secondary", className: "gap-2" })}>
            <Plus size={18} aria-hidden="true" /> Add item
          </Link>
          <Link href="/pantry" className="inline-flex min-h-12 items-center justify-center rounded-lg bg-surface px-4 text-sm font-semibold text-primary">
            View pantry
          </Link>
        </div>
      </Card>

      <PantrySummary summary={pulse} error={pulseError} />

      <Link
        href="/insights"
        className="mt-4 flex min-h-11 items-center justify-between gap-3 rounded-lg px-1 text-sm font-semibold text-primary"
      >
        <span className="flex items-center gap-2">
          <BarChart3 size={16} aria-hidden="true" /> See spend &amp; waste insights
        </span>
        <ChevronRight size={16} aria-hidden="true" />
      </Link>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">Expiring soon</h2>
          <Link href="/pantry" className="text-sm font-semibold text-primary">
            See all
          </Link>
        </div>
        {messages.inventory_notice && (
          <Alert variant="success" className="mt-3">
            {messages.inventory_notice}
          </Alert>
        )}
        {messages.inventory_error && (
          <Alert variant="error" className="mt-3">
            {messages.inventory_error}
          </Alert>
        )}
        <ExpiringItems items={items ?? []} />
      </section>
    </main>
  );
}
