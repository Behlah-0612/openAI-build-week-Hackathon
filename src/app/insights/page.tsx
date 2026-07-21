import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

function dayKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(value);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function StatCard({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "default" | "warning" | "error";
}) {
  return (
    <Card
      padding="md"
      variant={tone === "default" ? "default" : undefined}
      className={cn(tone === "warning" && "bg-warning-surface", tone === "error" && "bg-error-surface")}
    >
      <p className={cn("text-sm", tone === "default" ? "text-muted-text" : tone === "warning" ? "text-warning/80" : "text-error/80")}>{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", tone === "warning" ? "text-warning" : tone === "error" ? "text-error" : "text-text")}>{value}</p>
      <p className={cn("mt-1 text-xs", tone === "default" ? "text-muted-text" : tone === "warning" ? "text-warning/80" : "text-error/80")}>{caption}</p>
    </Card>
  );
}

export default async function Insights() {
  const supabase = await createClient();
  const [receiptsResult, recipesResult, pantryResult] = await Promise.all([
    supabase.from("receipts").select("total_amount,parsed_at").order("parsed_at", { ascending: false }).limit(200),
    supabase.from("recipes").select("id,time_minutes,created_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("pantry_items").select("estimated_price,expires_at").limit(500),
  ]);

  const today = dayKey(new Date());
  const sevenDaysAgo = dayKey(daysAgo(6));
  const fourteenDaysAgo = dayKey(daysAgo(13));
  const soon = dayKey(new Date(Date.now() + 3 * 86_400_000));
  const dailySpend = Array.from({ length: 7 }, (_, index) => {
    const date = daysAgo(6 - index);
    return { key: dayKey(date), label: new Intl.DateTimeFormat("en", { weekday: "short" }).format(date), amount: 0 };
  });
  const dayIndex = new Map(dailySpend.map((day, index) => [day.key, index]));

  let currentSpend = 0;
  let previousSpend = 0;
  for (const receipt of receiptsResult.data ?? []) {
    const date = (receipt.parsed_at ?? "").slice(0, 10);
    const amount = Number(receipt.total_amount ?? 0);
    if (date >= sevenDaysAgo && date <= today) {
      currentSpend += amount;
      const index = dayIndex.get(date);
      if (index !== undefined) dailySpend[index].amount += amount;
    } else if (date >= fourteenDaysAgo && date < sevenDaysAgo) {
      previousSpend += amount;
    }
  }

  const pantry = pantryResult.data ?? [];
  const pantryValue = pantry.reduce((total, item) => total + Number(item.estimated_price ?? 0), 0);
  const potentialWaste = pantry.filter((item) => item.expires_at && item.expires_at < today).reduce((total, item) => total + Number(item.estimated_price ?? 0), 0);
  const expiringSoon = pantry.filter((item) => item.expires_at && item.expires_at >= today && item.expires_at <= soon);
  const savedRecipes = recipesResult.data ?? [];
  const savedRecipeMinutes = savedRecipes.reduce((total, recipe) => total + Number(recipe.time_minutes ?? 0), 0);
  const receiptCount = receiptsResult.data?.length ?? 0;
  const averageReceipt = receiptCount ? (receiptsResult.data ?? []).reduce((total, receipt) => total + Number(receipt.total_amount ?? 0), 0) / receiptCount : 0;
  const maxDailySpend = Math.max(...dailySpend.map((day) => day.amount), 1);
  const spendChange = previousSpend ? ((currentSpend - previousSpend) / previousSpend) * 100 : null;

  return (
    <main className="p-5">
      <PageHeader backHref="/dashboard" backLabel="Home" eyebrow="Cost & time" title="Kitchen insights" description="Live totals from your receipts, pantry, and saved recipes." />

      <div className="mt-6 grid grid-cols-2 gap-3">
        <StatCard label="Last 7 days" value={formatMoney(currentSpend)} caption={spendChange === null ? "No prior-week receipts" : `${spendChange >= 0 ? "+" : ""}${spendChange.toFixed(0)}% vs. prior 7 days`} />
        <StatCard label="Pantry value" value={formatMoney(pantryValue)} caption={`${pantry.length} tracked item${pantry.length === 1 ? "" : "s"}`} />
        <StatCard label="Expiring in 3 days" value={String(expiringSoon.length)} caption="Use these first" tone="warning" />
        <StatCard label="Potential waste" value={formatMoney(potentialWaste)} caption="Expired items still listed" tone="error" />
      </div>

      <Card padding="lg" className="mt-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-bold text-text">Receipt spend, last 7 days</h2>
          <span className="text-sm font-semibold text-primary">{formatMoney(currentSpend)}</span>
        </div>
        <div className="mt-5 flex h-40 items-end gap-2">
          {dailySpend.map((day) => (
            <div className="flex flex-1 flex-col items-center gap-2" key={day.key}>
              <div
                className="w-full rounded-t-md bg-primary transition-all"
                style={{ height: `${day.amount ? Math.max((day.amount / maxDailySpend) * 115, 8) : 3}px` }}
                title={`${day.label}: ${formatMoney(day.amount)}`}
              />
              <span className="text-[10px] text-muted-text">{day.label}</span>
            </div>
          ))}
        </div>
        {!currentSpend && <p className="mt-4 text-sm text-muted-text">No receipt spend was logged in the last seven days. Scan a receipt to start this chart.</p>}
      </Card>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <Card padding="md" className="bg-primary/10">
          <p className="text-sm text-primary/80">Saved recipes</p>
          <p className="mt-1 text-2xl font-bold text-primary">{savedRecipes.length}</p>
          <p className="mt-1 text-xs text-primary/80">{savedRecipeMinutes ? `${savedRecipeMinutes} planned cooking min` : "No recipe time saved yet"}</p>
        </Card>
        <Card padding="md">
          <p className="text-sm text-muted-text">Receipt average</p>
          <p className="mt-1 text-2xl font-bold text-text">{formatMoney(averageReceipt)}</p>
          <p className="mt-1 text-xs text-muted-text">Across {receiptCount} receipt{receiptCount === 1 ? "" : "s"}</p>
        </Card>
      </section>
    </main>
  );
}
