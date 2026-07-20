import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PantrySummary } from "@/components/pantry-summary";
import { ExpiringItems } from "@/components/expiring-items";

export default async function Dashboard() {
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

  return (
    <main className="p-5">
      <p className="text-sm font-semibold text-herb">YOUR KITCHEN</p>
      <h1 className="mt-1 text-3xl font-bold">Good to see you 👋</h1>

      <section className="mt-6 rounded-3xl bg-herb p-5 text-white">
        <Sparkles size={24} />
        <h2 className="mt-3 text-xl font-bold">Start with what you have.</h2>
        <p className="mt-2 text-sm text-white/80">
          Add a few pantry items, and I’ll turn them into dinner ideas.
        </p>
        <Link
          href="/pantry"
          className="mt-4 inline-block rounded-xl bg-white px-4 py-3 text-sm font-bold text-herb"
        >
          View pantry
        </Link>
      </section>

      <PantrySummary />

      <section className="mt-7">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Expiring soon</h2>
          <Link href="/pantry" className="text-sm font-semibold text-herb">
            See all
          </Link>
        </div>
        <ExpiringItems initialItems={items ?? []} />
      </section>

      <Link
        href="/pantry?add=1"
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-citrus text-white shadow-lg"
        aria-label="Add pantry item"
      >
        <Plus />
      </Link>
    </main>
  );
}
