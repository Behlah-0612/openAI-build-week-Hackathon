import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { Enhance } from "@/components/ui/enhance";
import { ReceiptScanner } from "@/components/receipt-scanner";

type ScanSearchParams = Promise<{ error?: string }>;

export default async function Scan({ searchParams }: { searchParams: ScanSearchParams }) {
  const { error } = await searchParams;

  return (
    <main className="p-5">
      <PageHeader backHref="/dashboard" backLabel="Home" title="Scan a receipt" description="Choose a receipt image, then PantryChef will extract items for your review. Nothing is added automatically." />

      {error && (
        <Alert variant="error" className="mt-5">
          {error}
        </Alert>
      )}

      {/*
        No-JS fallback (kept intentionally as-is): posts to /api/receipts/scan,
        which redirects to /scan/review/[id] — both untouched, both still fully
        functional without JavaScript.
      */}
      <Enhance
        fallback={
          <form action="/api/receipts/scan" method="post" encType="multipart/form-data" className="mt-7 rounded-xl border-2 border-dashed border-primary/30 bg-surface p-5 shadow-sm shadow-black/5">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">1. Choose a receipt</p>
            <label className="mt-3 grid gap-2 text-sm font-semibold text-text">
              Capture a new receipt photo
              <input
                name="receipt_camera"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="block min-h-12 w-full rounded-lg border border-border/15 bg-surface p-2 text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary"
              />
            </label>
            <p className="mt-2 text-center text-xs text-muted-text">On desktop, this opens a file picker. On supported phones, it opens the camera.</p>
            <p className="my-5 text-center text-xs font-bold tracking-widest text-muted-text/70">Or</p>
            <label className="grid gap-2 text-sm font-semibold text-text">
              Upload an existing receipt image
              <input
                name="receipt_upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="block min-h-12 w-full rounded-lg border border-border/15 bg-surface p-2 text-sm text-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-2 file:font-semibold file:text-primary"
              />
            </label>
            <p className="mt-3 text-xs text-muted-text">JPEG, PNG, or WebP only · 8 MB maximum.</p>
            <button type="submit" className="mt-5 min-h-14 w-full rounded-lg bg-primary px-4 font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              2. Scan receipt for items
            </button>
          </form>
        }
      >
        <ReceiptScanner />
      </Enhance>
    </main>
  );
}
