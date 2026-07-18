import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PantryManager } from "@/components/pantry-manager";
export default async function Pantry() { const supabase = await createClient(); const { data: items } = await supabase.from("pantry_items").select("id,name,category,quantity,unit,expires_at").order("created_at", { ascending: false }); return <main className="p-5"><Link href="/dashboard" className="text-sm font-semibold text-herb">← Home</Link><h1 className="mt-5 text-3xl font-bold">My pantry</h1><p className="mt-2 text-ink/60">Keep a simple, useful inventory.</p><PantryManager initialItems={items ?? []}/></main>; }
