import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const discardSchema = z.object({ id: z.string().uuid() });

function redirectBack(request: Request, params: Record<string, string>) {
  const requestUrl = new URL(request.url);
  const referer = request.headers.get("referer");
  const fallback = new URL("/dashboard", requestUrl.origin);
  const candidate = referer ? new URL(referer) : fallback;
  const sameOrigin = candidate.origin === requestUrl.origin;
  const allowedPath = candidate.pathname === "/dashboard" || candidate.pathname === "/pantry";
  const destination = sameOrigin && allowedPath ? candidate : fallback;

  Object.entries(params).forEach(([key, value]) => {
    destination.searchParams.set(key, value);
  });

  return NextResponse.redirect(destination, 303);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const body = discardSchema.safeParse({ id: formData.get("id") });

  if (!body.success) {
    return redirectBack(request, { inventory_error: "Invalid pantry item." });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectBack(request, { inventory_error: "Please log in before updating your pantry." });
  }

  const { data: deletedItems, error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", body.data.id)
    .eq("user_id", user.id)
    .select("id, name");

  if (error || !deletedItems || deletedItems.length !== 1) {
    console.error("Pantry discard failed:", error);
    return redirectBack(request, {
      inventory_error: "The item could not be removed. Please refresh and try again.",
    });
  }

  return redirectBack(request, {
    inventory_notice: `${deletedItems[0].name} was removed from your inventory.`,
  });
}
