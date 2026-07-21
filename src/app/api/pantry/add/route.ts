import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/ensure-user-profile";
import { pantryItemSchema } from "@/lib/validation";

function redirectToPantry(request: Request, params: Record<string, string>) {
  const url = new URL("/pantry", request.url);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = pantryItemSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return redirectToPantry(request, {
      add: "1",
      inventory_error: parsed.error.issues[0]?.message ?? "The item details are invalid.",
    });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirectToPantry(request, { add: "1", inventory_error: "Please log in before adding an item." });
  }

  const { error: profileError } = await ensureUserProfile(supabase, user);
  if (profileError) {
    console.error("Could not prepare user profile before pantry insert:", profileError);
    return redirectToPantry(request, {
      add: "1",
      inventory_error: `Could not prepare your PantryChef profile: ${profileError.message}`,
    });
  }

  const { error } = await supabase.from("pantry_items").insert({
    ...parsed.data,
    estimated_price: parsed.data.estimated_price || null,
    purchased_at: parsed.data.purchased_at || null,
    expires_at: parsed.data.expires_at || null,
    user_id: user.id,
    source: "manual",
  });

  if (error) {
    console.error("Pantry insert failed:", error);
    return redirectToPantry(request, {
      add: "1",
      inventory_error: `Could not save this item: ${error.message}`,
    });
  }

  return redirectToPantry(request, { inventory_notice: `${parsed.data.name} was added to your inventory.` });
}
