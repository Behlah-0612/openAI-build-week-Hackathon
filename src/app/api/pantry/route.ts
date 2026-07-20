import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { pantryItemSchema } from "@/lib/validation";

const deletePantryItemSchema = z.object({ id: z.string().uuid() });

export async function POST(request: Request) {
  const body = pantryItemSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json(
      { error: "Invalid pantry item", details: body.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase.from("pantry_items").insert({
    ...body.data,
    expires_at: body.data.expires_at || null,
    user_id: user.id,
    source: "manual",
  });

  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const body = deletePantryItemSchema.safeParse(await request.json());

  if (!body.success) {
    return NextResponse.json({ error: "Invalid pantry item id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Your session has expired. Please log in again." },
      { status: 401 }
    );
  }

  // The owner filter is defense in depth alongside the RLS policy. Returning
  // the deleted row prevents a zero-row RLS delete from being reported as success.
  const { data: deletedItems, error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", body.data.id)
    .eq("user_id", user.id)
    .select("id");

  if (error) {
    console.error("Pantry item deletion failed:", error);
    return NextResponse.json(
      { error: "Could not update the pantry inventory." },
      { status: 500 }
    );
  }

  if (!deletedItems || deletedItems.length !== 1) {
    return NextResponse.json(
      {
        error:
          "That item was not deleted. Refresh the pantry and try again.",
      },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, deletedId: deletedItems[0].id });
}
