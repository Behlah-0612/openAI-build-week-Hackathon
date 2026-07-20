"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type PantryItem = {
  id: string;
  name: string;
  expires_at: string | null;
};

export function ExpiringItems({ initialItems }: { initialItems: PantryItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [discardingId, setDiscardingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function discardItem(id: string) {
    setDiscardingId(id);
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
        throw new Error(data.error ?? "Could not discard this item.");
      }

      setItems((current) => current.filter((item) => item.id !== id));
      setSuccess(`${itemName} was discarded and removed from your inventory.`);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not discard this item."
      );
    } finally {
      setDiscardingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mt-3 rounded-2xl border border-dashed border-ink/20 p-6 text-center text-sm text-ink/60">
        Nothing needs using soon. Nice work keeping your kitchen fresh.
      </div>
    );
  }

  return (
    <>
      <ul className="mt-3 grid gap-2">
        {items.map((item) => (
          <li
            className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
            key={item.id}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-sm text-ink/60">
                Expires {item.expires_at ?? "soon"}
              </p>
            </div>

            <button
              type="button"
              onClick={() => discardItem(item.id)}
              disabled={discardingId === item.id}
              className="rounded-xl p-3 text-ink/50 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
              aria-label={`Discard ${item.name}`}
              title="Discard item"
            >
              <Trash2 size={19} />
            </button>
          </li>
        ))}
      </ul>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mt-3 text-sm font-medium text-herb">{success}</p>}
    </>
  );
}
