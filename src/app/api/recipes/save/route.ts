import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/ensure-user-profile";
import { recipeOptionsSchema } from "@/lib/validation";
export async function POST(request: Request) {
  const parsed = recipeOptionsSchema.shape.recipes.element.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid recipe" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error: profileError } = await ensureUserProfile(supabase, user);
  if (profileError) {
    console.error("Could not prepare user profile before saving a recipe:", profileError);
    return NextResponse.json({ error: `Could not prepare your PantryChef profile: ${profileError.message}` }, { status: 400 });
  }

  const recipe = parsed.data;
  const { error } = await supabase.from("recipes").insert({
    user_id: user.id,
    title: recipe.title,
    ingredients_json: recipe.ingredients,
    steps_json: recipe.steps,
    time_minutes: recipe.time_minutes,
    missing_ingredients_json: recipe.missing_ingredients,
    estimated_cost: recipe.estimated_cost,
    source: "ai_generated",
  });

  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ ok: true });
}
