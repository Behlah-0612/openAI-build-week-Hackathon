import { AlertTriangle, Clock3, LoaderCircle, RefreshCw, ShoppingBasket } from "lucide-react";
import type { PantryPulse } from "@/lib/pantry-pulse";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { PantryPulseTrigger } from "@/components/pantry-pulse-trigger";

export function PantrySummary({ summary, error }: { summary: PantryPulse | null; error?: string }) {
  return (
    <Card variant="outlined" className="mt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Pantry pulse</p>
          <h2 className="mt-1 text-xl font-bold text-text">{summary?.headline ?? "Quick meals from what you have"}</h2>
        </div>
        <PantryPulseTrigger
          aria-label="Refresh Pantry Pulse meal ideas"
          title="Refresh meal ideas"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <RefreshCw size={18} aria-hidden="true" />
        </PantryPulseTrigger>
      </div>

      {!summary && !error && (
        <PantryPulseTrigger
          className={buttonVariants({ size: "md", className: "mt-4 w-full gap-2" })}
          pendingChildren={
            <>
              <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Finding meal ideas…
            </>
          }
        >
          Find quick meal ideas
        </PantryPulseTrigger>
      )}

      {error && (
        <Alert variant="error" className="mt-3">
          {error}
        </Alert>
      )}

      {summary && (
        <div className="mt-4 grid gap-4 text-sm">
          <div className="rounded-lg bg-bg p-3 text-text">
            <strong>${summary.total_estimated_value.toFixed(2)}</strong> estimated inventory value
          </div>

          {summary.expiring_soon.length > 0 && (
            <Alert variant="warning">
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle size={16} aria-hidden="true" /> Use soon
              </p>
              <p className="mt-1">{summary.expiring_soon.map((item) => `${item.name} — ${item.note}`).join(" · ")}</p>
            </Alert>
          )}

          <div>
            <p className="mb-2 font-semibold text-text">Your quick meals</p>
            <div className="grid gap-3">
              {summary.quick_meals.map((meal) => (
                <Card key={meal.title} variant="outlined" padding="md">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-text">{meal.title}</h3>
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-primary">
                      <Clock3 size={14} aria-hidden="true" /> {meal.time_minutes} min
                    </span>
                  </div>
                  <p className="mt-2 text-muted-text">{meal.description}</p>
                  <p className="mt-3 text-xs text-primary">Use: {meal.use_from_pantry.join(", ")}</p>
                  {meal.buy_to_complete.length > 0 && (
                    <div className="mt-3 rounded-lg bg-secondary/10 p-3 text-xs text-text/80">
                      <p className="flex items-center gap-1 font-semibold text-text">
                        <ShoppingBasket size={14} aria-hidden="true" /> Small top-up shop
                      </p>
                      <ul className="mt-1 grid gap-1">
                        {meal.buy_to_complete.map((item) => (
                          <li key={item.name}>
                            <strong>{item.name}:</strong> {item.reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          {summary.low_stock_staples.length > 0 && <p className="text-muted-text">Low staples: {summary.low_stock_staples.join(", ")}</p>}
        </div>
      )}
    </Card>
  );
}
