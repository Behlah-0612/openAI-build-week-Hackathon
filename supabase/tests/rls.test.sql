-- Run with `supabase test db`. This verifies user A cannot read user B's pantry row.
begin;
select plan(1);
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', true);
select is((select count(*) from public.pantry_items where user_id = '22222222-2222-2222-2222-222222222222'), 0::bigint, 'user A cannot fetch user B pantry data');
select * from finish();
rollback;
