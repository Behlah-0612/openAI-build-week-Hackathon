import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PantryItemDeleteButton({ id, name }: { id: string; name: string }) {
  return (
    <form action="/api/pantry/discard" method="post">
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${name}`}
        title={`Remove ${name}`}
        className="text-muted-text hover:bg-error-surface hover:text-error"
      >
        <Trash2 size={18} aria-hidden="true" />
      </Button>
    </form>
  );
}
