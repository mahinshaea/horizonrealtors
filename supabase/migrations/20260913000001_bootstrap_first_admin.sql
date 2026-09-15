create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_role public.user_role;
begin
  -- Serialize the first-user check so concurrent signups cannot both become admins.
  perform pg_advisory_xact_lock(73918421);
  if exists (select 1 from public.profiles where role = 'admin') then
    new_role := 'user';
  else
    new_role := 'admin';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''), new_role)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
