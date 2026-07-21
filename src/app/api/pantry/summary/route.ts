import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePantryPulse, PantryPulseError } from "@/lib/pantry-pulse";

export const runtime = "nodejs";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Your session has expired. Please log in again." }, { status: 401 });
    }

    const { data: items, error } = await supabase
      .from("pantry_items")
      .select("name,category,quantity,unit,estimated_price,expires_at")
      .limit(200);

    if (error) {
      console.error("Pantry query failed:", error);
      return NextResponse.json({ error: "Could not load pantry items." }, { status: 400 });
    }

    return NextResponse.json(await generatePantryPulse(user.id, items ?? []));
  } catch (error) {
    console.error("Pantry Pulse request failed:", error);
    const message = error instanceof PantryPulseError ? error.message : "Pantry Pulse could not be refreshed. Check the dev terminal.";
    const status = error instanceof PantryPulseError ? error.status : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
