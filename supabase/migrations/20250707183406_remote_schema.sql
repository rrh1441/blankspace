drop policy "Allow service_role full access to story_usage" on "public"."story_usage";

create policy "Allow service_role full access to story_usage"
on "public"."story_usage"
as permissive
for all
to supabase_admin, service_role
using (true)
with check (true);



