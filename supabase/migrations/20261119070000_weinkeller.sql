-- Weinkeller: Tageszähler für Claude-Aufrufe und Server-Sicherung des App-Zustands.
-- Beide Tabellen sind nur über die Edge Function (service_role) erreichbar:
-- RLS an, keine Policies für anon/authenticated.

create table if not exists public.usage (
  day   date primary key,
  calls int  not null default 0
);

create table if not exists public.cellar_state (
  id         text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.usage        enable row level security;
alter table public.cellar_state enable row level security;

revoke all on public.usage        from anon, authenticated;
revoke all on public.cellar_state from anon, authenticated;

-- Zählt einen Aufruf für heute (Europe/Berlin) und liefert den neuen Stand.
-- Liegt der Stand schon am Limit, wird nicht weiter gezählt.
create or replace function public.bump_usage(lim int)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  d date := (now() at time zone 'Europe/Berlin')::date;
  n int;
begin
  insert into public.usage (day, calls) values (d, 0) on conflict (day) do nothing;
  update public.usage set calls = calls + 1 where day = d and calls < lim returning calls into n;
  if n is null then
    return lim + 1; -- Limit erreicht
  end if;
  return n;
end;
$$;

revoke all on function public.bump_usage(int) from public, anon, authenticated;
grant execute on function public.bump_usage(int) to service_role;
