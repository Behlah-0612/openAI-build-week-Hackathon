import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Heals older Auth accounts created before the public.users trigger migration
 * was installed. All PantryChef domain tables reference public.users(id).
 */
export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  const suppliedName = user.user_metadata?.display_name;
  const displayName = typeof suppliedName === "string" && suppliedName.trim()
    ? suppliedName.trim().slice(0, 100)
    : (user.email?.split("@")[0] ?? "PantryChef cook");

  return supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email ?? `${user.id}@users.pantrychef.local`,
      display_name: displayName,
    },
    { onConflict: "id" },
  );
}
