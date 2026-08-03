create table if not exists public.holder_votes (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  vote_option text not null,
  vote_label text not null,
  token_balance_raw text not null,
  signature text not null,
  signed_message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_holder_votes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_holder_votes_updated_at on public.holder_votes;

create trigger set_holder_votes_updated_at
before update on public.holder_votes
for each row
execute function public.set_holder_votes_updated_at();

alter table public.holder_votes enable row level security;

create index if not exists holder_votes_vote_option_idx
on public.holder_votes (vote_option);
