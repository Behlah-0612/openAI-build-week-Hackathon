import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/ensure-user-profile";
import { receiptCommitSchema } from "@/lib/validation";

const reviewIdSchema = z.string().uuid();

function redirectToReview(request: Request, reviewId: string, error: string) {
  const url = new URL(`/scan/review/${reviewId}`, request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, 303);
}

export async function POST(request: Request) {
  const form = await request.formData();
  const reviewId = String(form.get("review_id") ?? "");
  if (!reviewIdSchema.safeParse(reviewId).success) return NextResponse.redirect(new URL("/scan?error=Invalid%20receipt%20review.", request.url), 303);

  const names = form.getAll("item_name").map(String);
  const quantities = form.getAll("item_quantity").map(String);
  const units = form.getAll("item_unit").map(String);
  const prices = form.getAll("item_price").map(String);
  const removed = new Set(form.getAll("remove_item").map(String));
  const items = names.map((name, index) => ({ name, quantity: quantities[index], unit: units[index], price: prices[index] || undefined })).filter((_, index) => !removed.has(String(index)));
  const parsed = receiptCommitSchema.safeParse({
    store_name: String(form.get("store_name") ?? "").trim() || null,
    total_amount: String(form.get("total_amount") ?? "") === "" ? null : Number(form.get("total_amount")),
    image_path: String(form.get("image_path") ?? ""),
    items,
  });
  if (!parsed.success) return redirectToReview(request, reviewId, parsed.error.issues[0]?.message ?? "The reviewed receipt is invalid.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirectToReview(request, reviewId, "Your session has expired. Please log in again.");

  const { error: profileError } = await ensureUserProfile(supabase, user);
  if (profileError) {
    console.error("Could not prepare user profile before receipt commit:", profileError);
    return redirectToReview(request, reviewId, `Could not prepare your PantryChef profile: ${profileError.message}`);
  }

  const { data: review } = await supabase.from("ai_jobs").select("id").eq("id", reviewId).eq("user_id", user.id).eq("kind", "receipt_review").maybeSingle();
  if (!review) return redirectToReview(request, reviewId, "This receipt review was not found.");

  const receipt = parsed.data;
  const { data: savedReceipt, error: receiptError } = await supabase
    .from("receipts")
    .insert({ user_id: user.id, image_url: receipt.image_path ?? null, raw_ocr_json: receipt, parsed_at: new Date().toISOString(), total_amount: receipt.total_amount, store_name: receipt.store_name })
    .select("id")
    .single();
  if (receiptError) return redirectToReview(request, reviewId, `Could not save the receipt: ${receiptError.message}`);

  const { error: itemError } = await supabase.from("pantry_items").insert(receipt.items.map((item) => ({ user_id: user.id, name: item.name, category: "Other", quantity: item.quantity, unit: item.unit, estimated_price: item.price ?? null, source: "receipt" })));
  if (itemError) {
    await supabase.from("receipts").delete().eq("id", savedReceipt.id).eq("user_id", user.id);
    return redirectToReview(request, reviewId, `Could not add reviewed items to the pantry: ${itemError.message}`);
  }

  await supabase.from("ai_jobs").delete().eq("id", reviewId).eq("user_id", user.id);
  const pantry = new URL("/pantry", request.url);
  pantry.searchParams.set("inventory_notice", `${receipt.items.length} receipt item${receipt.items.length === 1 ? " was" : "s were"} added to your inventory.`);
  return NextResponse.redirect(pantry, 303);
}
