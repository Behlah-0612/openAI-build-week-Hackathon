import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type EditSearchParams = Promise<{ error?: string }>;

export default async function EditPantryItem({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: EditSearchParams }) {
  const [{ id }, { error: message }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: item } = await supabase
    .from("pantry_items")
    .select("id,name,category,quantity,unit,estimated_price,purchased_at,expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!item) notFound();

  return (
    <main className="p-5">
      <PageHeader backHref="/pantry" backLabel="Pantry" eyebrow="Edit inventory" title={item.name} description="Correct any detail, then save your changes." />

      {message && (
        <Alert variant="error" className="mt-5">
          {message}
        </Alert>
      )}

      <Card padding="lg" className="mt-6">
        <form action="/api/pantry/update" method="post" className="grid gap-3">
          <input type="hidden" name="id" value={item.id} />
          <Field label="Item name" htmlFor="edit-name" required>
            <Input id="edit-name" required name="name" defaultValue={item.name} />
          </Field>
          <Field label="Category" htmlFor="edit-category" required>
            <Select id="edit-category" name="category" defaultValue={item.category}>
              <option>Produce</option>
              <option>Dairy</option>
              <option>Pantry</option>
              <option>Frozen</option>
              <option>Protein</option>
              <option>Bakery</option>
              <option>Other</option>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Quantity" htmlFor="edit-quantity" required>
              <Input id="edit-quantity" required name="quantity" type="number" min="0.1" step="0.1" defaultValue={item.quantity} />
            </Field>
            <Field label="Unit" htmlFor="edit-unit" required>
              <Input id="edit-unit" required name="unit" defaultValue={item.unit} />
            </Field>
          </div>
          <Field label="Estimated price" htmlFor="edit-price" optional>
            <Input id="edit-price" name="estimated_price" type="number" min="0" step="0.01" defaultValue={item.estimated_price ?? ""} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Purchased" htmlFor="edit-purchased" optional>
              <Input id="edit-purchased" name="purchased_at" type="date" defaultValue={item.purchased_at ?? ""} />
            </Field>
            <Field label="Expires" htmlFor="edit-expires" optional>
              <Input id="edit-expires" name="expires_at" type="date" defaultValue={item.expires_at ?? ""} />
            </Field>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <Link href="/pantry" className={buttonVariants({ variant: "outline" })}>
              Cancel
            </Link>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
