import { createClient } from "@/lib/supabase/server";
import { PantryManager } from "@/components/pantry-manager";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";

export default async function Pantry({ searchParams }: { searchParams: Promise<{ inventory_notice?: string; inventory_error?: string; add?: string }> }) {
  const messages = await searchParams;
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("pantry_items")
    .select("id,name,category,quantity,unit,estimated_price,purchased_at,expires_at,source")
    .order("created_at", { ascending: false });

  return (
    <main className="p-5">
      <PageHeader backHref="/dashboard" backLabel="Home" title="My pantry" description="Keep a simple, useful inventory." />
      {messages.inventory_notice && (
        <Alert variant="success" className="mt-4">
          {messages.inventory_notice}
        </Alert>
      )}
      {messages.inventory_error && (
        <Alert variant="error" className="mt-4">
          {messages.inventory_error}
        </Alert>
      )}
      <PantryManager initialItems={items ?? []} initialOpen={messages.add === "1"} />
    </main>
  );
}
