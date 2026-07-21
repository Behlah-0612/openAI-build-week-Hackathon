import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { pantryItemSchema } from "@/lib/validation";

const updatePantryItemSchema = pantryItemSchema.extend({ id: z.string().uuid() });

function redirectToEdit(request: Request, id: string, error: string) {
  const url = new URL(`/pantry/${id}/edit`, request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const parsed = updatePantryItemSchema.safeParse(Object.fromEntries(formData));
  const id = String(formData.get("id") ?? "");

  if (!parsed.success) {
    return redirectToEdit(request, id, parsed.error.issues[0]?.message ?? "The item details are invalid.");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirectToEdit(request, parsed.data.id, "Your session has expired. Please log in again.");
  }

  const { id: itemId, ...itemData } = parsed.data;
  const { data: updated, error } = await supabase
    .from("pantry_items")
    .update({
      ...itemData,
      estimated_price: itemData.estimated_price || null,
      purchased_at: itemData.purchased_at || null,
      expires_at: itemData.expires_at || null,
    })
    .eq("id", itemId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("Pantry update failed:", error);
    return redirectToEdit(request, parsed.data.id, `Could not update this item: ${error.message}`);
  }

  if (!updated) {
    return redirectToEdit(request, parsed.data.id, "This item was not found in your inventory.");
  }

  const url = new URL("/pantry", request.url);
  url.searchParams.set("inventory_notice", `${parsed.data.name} was updated.`);
  return NextResponse.redirect(url, 303);
}
