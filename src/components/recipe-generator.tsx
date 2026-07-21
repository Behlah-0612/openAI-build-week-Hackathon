"use client";

import { type FormEvent, useState } from "react";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckboxField } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { RecipeCard, type Recipe } from "@/components/recipe-card";

type RecipeResponse = { recipes?: Recipe[]; error?: string };

async function responseData(response: Response): Promise<RecipeResponse> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return response.json() as Promise<RecipeResponse>;

  if (response.status === 401) return { error: "Your session has expired. Please log in again, then find recipes." };
  if (response.status === 403) return { error: "This phone could not submit the request securely. Reload PantryChef from the same Wi-Fi connection and try again." };
  if (response.status >= 500) return { error: "Recipe suggestions are temporarily unavailable. Please try again in a moment." };
  return { error: "We could not create recipes from those settings. Please review them and try again." };
}

export function RecipeGenerator() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savedRecipes, setSavedRecipes] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const request = {
      minutes: Number(form.get("minutes")),
      vegetarian: form.get("vegetarian") === "on",
      cuisine: String(form.get("cuisine") || "").trim(),
      prioritize_expiring: form.get("prioritize_expiring") === "on",
    };

    setBusy(true);
    setError("");
    setNotice("");
    setRecipes([]);

    try {
      const response = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = await responseData(response);

      if (!response.ok) {
        setError(data.error ?? "Recipes could not be generated. Please try again.");
        return;
      }

      if (!data.recipes?.length) {
        setError("The chef did not return any recipes. Please try again.");
        return;
      }

      setRecipes(data.recipes);
      setNotice(`Here are ${data.recipes.length} recipe ideas based on your pantry.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The recipe request could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  async function save(recipe: Recipe) {
    setSavedRecipes((current) => ({ ...current, [recipe.title]: "saving" }));
    try {
      const response = await fetch("/api/recipes/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      const data = await responseData(response);
      if (response.ok) {
        setSavedRecipes((current) => ({ ...current, [recipe.title]: "saved" }));
        showToast(`${recipe.title} saved to your recipes.`, "success");
      } else {
        setSavedRecipes((current) => ({ ...current, [recipe.title]: data.error ?? "Could not save" }));
      }
    } catch (caught) {
      setSavedRecipes((current) => ({ ...current, [recipe.title]: caught instanceof Error ? caught.message : "Could not save" }));
    }
  }

  return (
    <>
      <form onSubmit={generate} className="mt-6 rounded-xl bg-surface p-5 shadow-sm shadow-black/5">
        <Field label="How much time do you have?" htmlFor="minutes" required>
          <Select id="minutes" name="minutes" defaultValue="30">
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="60">60 minutes</option>
          </Select>
        </Field>
        <Field label="Cuisine" htmlFor="cuisine" optional className="mt-3">
          <Input id="cuisine" name="cuisine" placeholder="e.g. Italian" />
        </Field>
        <div className="mt-3 grid gap-1">
          <CheckboxField name="vegetarian" label="Vegetarian" />
          <CheckboxField name="prioritize_expiring" label="Use expiring items first" defaultChecked />
        </div>
        <Button type="submit" size="lg" loading={busy} className="mt-5 w-full">
          {busy ? "Your chef is creating recipes…" : "Find recipes"}
        </Button>
      </form>

      {busy && (
        <div className="mt-5 grid gap-4">
          <p role="status" aria-live="polite" className="sr-only">
            Checking your pantry and creating practical meal ideas…
          </p>
          {Array.from({ length: 2 }, (_, index) => (
            <Card key={index} padding="lg" aria-hidden="true">
              <div className="flex justify-between gap-3">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-5 w-12" />
              </div>
              <Skeleton className="mt-3 h-4 w-1/3" />
              <Skeleton className="mt-6 h-4 w-24" />
              <div className="mt-2 grid gap-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      )}
      {error && (
        <Alert variant="error" title="Recipes could not be generated" className="mt-4">
          {error}
        </Alert>
      )}
      {notice && (
        <Alert variant="success" className="mt-4">
          {notice}
        </Alert>
      )}

      <div className="mt-5 grid gap-4">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.title} recipe={recipe} onSave={() => void save(recipe)} saveStatus={savedRecipes[recipe.title]} />
        ))}
      </div>
    </>
  );
}
