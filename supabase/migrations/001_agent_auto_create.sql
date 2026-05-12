-- Auto-create agents row when a new user signs up with role = 'agent'
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'user');

  insert into public.users (id, email, role, name)
  values (
    new.id,
    new.email,
    v_role,
    coalesce(new.raw_user_meta_data->>'name', '')
  );

  if v_role = 'agent' then
    insert into public.agents (user_id)
    values (new.id);
  end if;

  return new;
end;
$$;
