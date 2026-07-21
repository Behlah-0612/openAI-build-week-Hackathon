import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { receiptSchema } from "@/lib/validation";

type ReviewSearchParams = Promise<{ error?: string }>;

export default async function ReceiptReview({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: ReviewSearchParams }) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: job } = await supabase
    .from("ai_jobs")
    .select("id,result")
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("kind", "receipt_review")
    .maybeSingle();
  if (!job) notFound();

  const raw = job.result as { receipt?: unknown; image_path?: unknown } | null;
  const receipt = receiptSchema.safeParse(raw?.receipt);
  const imagePath = typeof raw?.image_path === "string" ? raw.image_path : "";
  if (!receipt.success || !imagePath) notFound();

  return (
    <main className="p-5">
      <Link href="/scan" className="text-sm font-semibold text-primary">← Scan another receipt</Link>
      <p className="mt-5 text-sm font-semibold text-primary">REVIEW BEFORE SAVING</p>
      <h1 className="mt-1 text-3xl font-bold text-text">Check scanned items</h1>
      <p className="mt-2 text-muted-text">Correct any detail below. These items are not in your pantry until you confirm.</p>

      {error && <p role="alert" className="mt-5 rounded-xl bg-error-surface p-4 text-sm text-error">{error}</p>}

      <form action="/api/receipts/commit-form" method="post" className="mt-6 grid gap-4 rounded-xl bg-surface p-5 text-text shadow-sm shadow-black/5">
        <input type="hidden" name="review_id" value={job.id} />
        <input type="hidden" name="image_path" value={imagePath} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-text">Store name<input name="store_name" defaultValue={receipt.data.store_name ?? ""} className="min-h-11 rounded-lg border border-border/15 bg-surface px-3 text-text outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30" /></label>
          <label className="grid gap-1 text-sm font-medium text-text">Receipt total<input name="total_amount" type="number" min="0" step="0.01" defaultValue={receipt.data.total_amount ?? ""} className="min-h-11 rounded-lg border border-border/15 bg-surface px-3 text-text outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30" /></label>
        </div>

        <div className="grid gap-3">
          {receipt.data.items.map((item, index) => (
            <fieldset key={`${item.name}-${index}`} className="rounded-xl border border-border/10 p-3">
              <legend className="px-1 text-xs font-bold text-muted-text">ITEM {index + 1}</legend>
              <input type="hidden" name="item_index" value={index} />
              <div className="grid gap-2 sm:grid-cols-[1fr_72px_92px_88px]">
                <label className="grid gap-1 text-xs font-medium text-muted-text">Item<input required name="item_name" defaultValue={item.name} className="min-h-11 rounded-lg border border-border/15 bg-surface px-3 text-text outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30" /></label>
                <label className="grid gap-1 text-xs font-medium text-muted-text">Qty<input required name="item_quantity" type="number" min="0.1" step="0.1" defaultValue={item.quantity} className="min-h-11 rounded-lg border border-border/15 bg-surface px-3 text-text outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30" /></label>
                <label className="grid gap-1 text-xs font-medium text-muted-text">Unit<input required name="item_unit" defaultValue={item.unit} className="min-h-11 rounded-lg border border-border/15 bg-surface px-3 text-text outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30" /></label>
                <label className="grid gap-1 text-xs font-medium text-muted-text">Price<input name="item_price" type="number" min="0" step="0.01" defaultValue={item.price ?? ""} className="min-h-11 rounded-lg border border-border/15 bg-surface px-3 text-text outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30" /></label>
              </div>
              <label className="mt-3 inline-flex items-center gap-2 text-sm text-error"><input name="remove_item" type="checkbox" value={index} className="h-5 w-5 accent-primary" /> Do not add this item</label>
            </fieldset>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/scan" className="flex min-h-12 items-center justify-center rounded-lg border border-border/15 font-semibold text-text">Cancel</Link>
          <button type="submit" className="min-h-12 rounded-lg bg-primary font-bold text-primary-foreground">Confirm & add to pantry</button>
        </div>
      </form>
    </main>
  );
}
