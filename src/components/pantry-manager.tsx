import Link from "next/link";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PantryItemDeleteButton } from "@/components/pantry-item-delete-button";

type Item = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  estimated_price: number | null;
  purchased_at: string | null;
  expires_at: string | null;
  source: "manual" | "receipt";
};

function formatDate(value: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(`${value}T00:00:00`),
  );
}

function AddItemForm() {
  return (
    <Card variant="outlined" className="mt-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">New inventory</p>
          <h2 className="mt-1 text-xl font-bold text-text">Add an item</h2>
        </div>
        <Link href="/pantry" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Cancel
        </Link>
      </div>

      <form action="/api/pantry/add" method="post" className="mt-5 grid gap-3">
        <Field label="Item name" htmlFor="add-name" required>
          <Input id="add-name" required name="name" placeholder="e.g. Cherry tomatoes" />
        </Field>
        <Field label="Category" htmlFor="add-category" required>
          <Select id="add-category" name="category" defaultValue="Pantry">
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
          <Field label="Quantity" htmlFor="add-quantity" required>
            <Input id="add-quantity" required name="quantity" type="number" min="0.1" step="0.1" placeholder="1" />
          </Field>
          <Field label="Unit" htmlFor="add-unit" required>
            <Input id="add-unit" required name="unit" placeholder="e.g. cans" />
          </Field>
        </div>
        <Field label="Estimated price" htmlFor="add-price" optional>
          <Input id="add-price" name="estimated_price" type="number" min="0" step="0.01" placeholder="0.00" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchased" htmlFor="add-purchased" optional>
            <Input id="add-purchased" name="purchased_at" type="date" />
          </Field>
          <Field label="Expires" htmlFor="add-expires" optional>
            <Input id="add-expires" name="expires_at" type="date" />
          </Field>
        </div>
        <Button type="submit" size="lg" className="mt-2">
          Save item
        </Button>
      </form>
    </Card>
  );
}

export function PantryManager({ initialItems, initialOpen = false }: { initialItems: Item[]; initialOpen?: boolean }) {
  return (
    <>
      {!initialOpen && (
        <Link href="/pantry?add=1" className={buttonVariants({ size: "lg", className: "mt-5 w-full gap-2" })}>
          <Plus size={20} aria-hidden="true" /> Add an item
        </Link>
      )}

      {initialOpen && <AddItemForm />}

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-text">Inventory</h2>
          <p className="text-sm text-muted-text">
            {initialItems.length} item{initialItems.length === 1 ? "" : "s"}
          </p>
        </div>
        {initialItems.length === 0 ? (
          <EmptyState
            className="mt-3"
            title="Your pantry is empty"
            description="Add an item or scan a receipt to get started."
          />
        ) : (
          <ul className="mt-3 grid gap-3">
            {initialItems.map((item) => (
              <li key={item.id}>
                <Card padding="md">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-text">{item.name}</p>
                        <Badge tone="primary">{item.category}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-medium text-muted-text">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <Link
                      href={`/pantry/${item.id}/edit`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                      aria-label={`Edit ${item.name}`}
                    >
                      Edit
                    </Link>
                    <PantryItemDeleteButton id={item.id} name={item.name} />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-border/10 pt-3 text-sm">
                    <div>
                      <dt className="text-muted-text">Price</dt>
                      <dd className="mt-0.5 font-medium text-text">{item.estimated_price == null ? "Not set" : `$${Number(item.estimated_price).toFixed(2)}`}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-text">Added via</dt>
                      <dd className="mt-0.5 font-medium capitalize text-text">{item.source === "receipt" ? "Receipt scan" : "Manual entry"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-text">Purchased</dt>
                      <dd className="mt-0.5 font-medium text-text">{formatDate(item.purchased_at)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-text">Expires</dt>
                      <dd className="mt-0.5 font-medium text-text">{formatDate(item.expires_at)}</dd>
                    </div>
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
