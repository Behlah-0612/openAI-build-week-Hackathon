import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PantryItemDeleteButton } from "@/components/pantry-item-delete-button";

type PantryItem = {
  id: string;
  name: string;
  expires_at: string | null;
};

export function ExpiringItems({ items }: { items: PantryItem[] }) {
  if (items.length === 0) {
    return (
      <EmptyState
        className="mt-3"
        title="Nothing needs using soon"
        description="Nice work keeping your kitchen fresh."
      />
    );
  }

  return (
    <ul className="mt-3 grid gap-2">
      {items.map((item) => (
        <li key={item.id}>
          <Card padding="md" className="flex items-center gap-3">
            <CalendarClock className="shrink-0 text-warning" size={20} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-text">{item.name}</p>
              <p className="text-sm text-muted-text">Expires {item.expires_at ?? "soon"}</p>
            </div>
            <PantryItemDeleteButton id={item.id} name={item.name} />
          </Card>
        </li>
      ))}
    </ul>
  );
}
