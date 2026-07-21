import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { recipeOptionsSchema } from "@/lib/validation";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { Enhance } from "@/components/ui/enhance";
import { RecipeGenerator } from "@/components/recipe-generator";
import { RecipeCard } from "@/components/recipe-card";

type RecipeSearchParams = Promise<{ job?: string; error?: string }>;
const jobIdSchema = z.string().uuid();

export default async function Recipes({ searchParams }: { searchParams: RecipeSearchParams }) {
  const { job: jobId, error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let recipes: z.infer<typeof recipeOptionsSchema>["recipes"] = [];

  if (user && jobIdSchema.safeParse(jobId).success) {
    const { data: job } = await supabase.from("ai_jobs").select("result").eq("id", jobId!).eq("user_id", user.id).eq("kind", "recipe_results").maybeSingle();
    const parsed = recipeOptionsSchema.safeParse(job?.result);
    if (parsed.success) recipes = parsed.data.recipes;
  }

  return (
    <main className="p-5">
      <PageHeader backHref="/dashboard" backLabel="Home" title="What can I cook?" description="Three ideas based on your pantry, not a perfect grocery haul." />

      {error && (
        <Alert variant="error" title="Recipes could not be generated" className="mt-5">
          {error}
        </Alert>
      )}

      {/*
        No-JS fallback (kept intentionally as-is): posts to
        /api/recipes/generate-form, which redirects back with ?job=, rendered
        below by the untouched server lookup — both still fully functional
        without JavaScript.
      */}
      <Enhance
        fallback={
          <form action="/api/recipes/generate-form" method="post" className="mt-6 rounded-xl bg-surface p-5 text-text shadow-sm shadow-black/5">
            <label className="block font-semibold text-text" htmlFor="minutes">
              How much time do you have?
            </label>
            <select id="minutes" name="minutes" defaultValue="30" className="mt-2 min-h-12 w-full rounded-lg border border-border/15 bg-surface p-3 text-text outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
            </select>
            <label className="sr-only" htmlFor="cuisine">
              Cuisine preference
            </label>
            <input id="cuisine" name="cuisine" placeholder="Cuisine (optional, e.g. Italian)" className="mt-3 min-h-12 w-full rounded-lg border border-border/15 bg-surface p-3 text-text placeholder:text-muted-text/70 outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30" />
            <label className="mt-3 flex items-center gap-2 text-sm text-text">
              <input name="vegetarian" type="checkbox" className="h-5 w-5 accent-primary" /> Vegetarian
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-text">
              <input name="prioritize_expiring" type="checkbox" defaultChecked className="h-5 w-5 accent-primary" /> Use expiring items first
            </label>
            <button type="submit" className="mt-5 min-h-14 w-full rounded-lg bg-primary font-bold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              Find recipes
            </button>
          </form>
        }
      >
        <RecipeGenerator />
      </Enhance>

      {recipes.length > 0 && (
        <>
          <Alert variant="success" className="mt-5">
            Here are {recipes.length} recipe ideas based on your pantry.
          </Alert>
          <div className="mt-5 grid gap-4">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.title} recipe={recipe} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
