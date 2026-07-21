import { Check, LoaderCircle, Save, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type Recipe = {
  title: string;
  time_minutes: number;
  estimated_cost: number;
  ingredients: { name: string; amount: string; have: boolean }[];
  steps: string[];
  missing_ingredients: string[];
};

export function RecipeCard({
  recipe,
  onSave,
  saveStatus,
}: {
  recipe: Recipe;
  onSave?: () => void;
  saveStatus?: string;
}) {
  const saveError = saveStatus && saveStatus !== "saving" && saveStatus !== "saved" ? saveStatus : undefined;

  return (
    <Card padding="lg">
      <div className="flex justify-between gap-3">
        <h2 className="text-xl font-bold text-text">{recipe.title}</h2>
        <span className="whitespace-nowrap text-sm font-semibold text-primary">{recipe.time_minutes} min</span>
      </div>
      <p className="mt-2 text-sm text-muted-text">${recipe.estimated_cost.toFixed(2)} estimated to fill gaps</p>

      <h3 className="mt-5 text-sm font-bold text-text">Ingredients</h3>
      <ul className="mt-2 grid gap-1 text-sm">
        {recipe.ingredients.map((ingredient) => (
          <li key={`${recipe.title}-${ingredient.name}`} className={ingredient.have ? "text-primary" : "text-muted-text"}>
            {ingredient.have ? <Check className="mr-1 inline" size={15} aria-label="In pantry" /> : <X className="mr-1 inline" size={15} aria-label="Needed" />}
            {ingredient.amount} {ingredient.name}
          </li>
        ))}
      </ul>

      <h3 className="mt-5 text-sm font-bold text-text">Steps</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-text/75">
        {recipe.steps.map((step, index) => (
          <li key={`${recipe.title}-${index}`}>{step}</li>
        ))}
      </ol>

      {recipe.missing_ingredients.length > 0 && (
        <p className="mt-4 rounded-lg bg-secondary/10 p-3 text-sm text-text">
          <span className="font-bold">Shopping list: </span>
          {recipe.missing_ingredients.join(", ")}
        </p>
      )}

      {onSave && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={saveStatus === "saving" || saveStatus === "saved"}
            className="mt-4 gap-2"
          >
            {saveStatus === "saving" ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : "Save recipe"}
          </Button>
          {saveError && <p className="mt-2 text-sm font-medium text-error">{saveError}</p>}
        </>
      )}
    </Card>
  );
}
