import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/ensure-user-profile";
import { receiptCommitSchema } from "@/lib/validation";
export async function POST(request: Request) {
  const parsed = receiptCommitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "The reviewed receipt data is invalid." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Your session has expired. Please log in before saving receipt items." }, { status: 401 });

  const { error: profileError } = await ensureUserProfile(supabase, user);
  if (profileError) {
    console.error("Could not prepare user profile before receipt commit:", profileError);
    return NextResponse.json({ error: `Could not prepare your PantryChef profile: ${profileError.message}` }, { status: 400 });
  }

  const receipt = parsed.data;
  const { data: savedReceipt, error } = await supabase
    .from("receipts")
    .insert({ user_id: user.id, image_url: receipt.image_path ?? null, raw_ocr_json: receipt, parsed_at: new Date().toISOString(), total_amount: receipt.total_amount, store_name: receipt.store_name })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: `Could not save the receipt: ${error.message}` }, { status: 400 });

  const items = receipt.items.map((item) => ({ user_id: user.id, name: item.name, category: "Other", quantity: item.quantity, unit: item.unit, estimated_price: item.price ?? null, source: "receipt" }));
  const { error: itemError } = await supabase.from("pantry_items").insert(items);
  if (itemError) {
    await supabase.from("receipts").delete().eq("id", savedReceipt.id).eq("user_id", user.id);
    return NextResponse.json({ error: `Could not add reviewed items to the pantry: ${itemError.message}` }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
