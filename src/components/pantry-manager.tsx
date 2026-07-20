"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expires_at: string | null;
};

export function PantryManager({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function add(form: FormData) {
    setError("");
    setSuccess("");

    const response = await fetch("/api/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Could not add the pantry item.");
      return;
    }

    setOpen(false);
    location.reload();
  }

  async function remove(id: string) {
    setDeletingId(id);
    setError("");
    setSuccess("");
    const itemName = items.find((item) => item.id === id)?.name ?? "Item";

    try {
      const response = await fetch("/api/pantry", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.deletedId !== id) {
        throw new Error(data.error ?? "Could not remove this pantry item.");
      }

      setItems((current) => current.filter((item) => item.id !== id));
      setSuccess(`${itemName} was removed from your inventory.`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not remove this pantry item."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-5 min-h-14 w-full rounded-2xl bg-herb font-bold text-white"
      >
        Add an item
      </button>

      {open && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/30">
          <form action={add} className="w-full rounded-t-3xl bg-cream p-5">
            <h2 className="text-xl font-bold">Add to pantry</h2>
            <div className="mt-4 grid gap-3">
              <input required name="name" placeholder="Item name" className="rounded-xl border p-3" />
              <select name="category" className="rounded-xl border p-3">
                <option>Produce</option><option>Dairy</option><option>Pantry</option>
                <option>Frozen</option><option>Protein</option><option>Other</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required name="quantity" type="number" min="0.1" step="0.1" placeholder="Quantity" className="rounded-xl border p-3" />
                <input required name="unit" placeholder="Unit (e.g. cans)" className="rounded-xl border p-3" />
              </div>
              <input name="expires_at" type="date" className="rounded-xl border p-3" />
            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setOpen(false)} className="min-h-12 rounded-xl border">Cancel</button>
              <button className="min-h-12 rounded-xl bg-herb font-bold text-white">Save item</button>
            </div>
          </form>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-3 text-sm font-medium text-herb">{success}</p>}

      <ul className="mt-5 grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-ink/60">{item.quantity} {item.unit} · {item.category}</p>
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              disabled={deletingId === item.id}
              className="ml-auto rounded-xl p-3 text-ink/50 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              aria-label={`Remove ${item.name}`}
              title="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
