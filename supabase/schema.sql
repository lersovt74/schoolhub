create table if not exists public.schoolhub_state (
  id text primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_schoolhub_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_schoolhub_state_updated_at on public.schoolhub_state;
create trigger trg_schoolhub_state_updated_at
before update on public.schoolhub_state
for each row
execute function public.touch_schoolhub_state_updated_at();

alter table public.schoolhub_state enable row level security;

revoke all on table public.schoolhub_state from anon;
revoke all on table public.schoolhub_state from authenticated;
grant all on table public.schoolhub_state to service_role;
