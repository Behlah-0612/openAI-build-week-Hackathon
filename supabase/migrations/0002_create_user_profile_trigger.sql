-- Keep the application profile table in sync with Supabase Auth users.
-- PantryChef tables reference public.users(id), so this trigger is required
-- before a newly signed-up user can create or own pantry data.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, is_demo)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(coalesce(new.email, ''), '@', 1)),
    false
  )
  on conflict (id) do update set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill any accounts created before this migration ran.
insert into public.users (id, email, display_name, is_demo)
select
  id,
  coalesce(email, ''),
  coalesce(raw_user_meta_data ->> 'display_name', split_part(coalesce(email, ''), '@', 1)),
  false
from auth.users
on conflict (id) do nothing;
