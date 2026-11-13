alter table customers
  add column if not exists apple_sub text unique,
  add column if not exists auth_provider text not null default 'email',
  alter column password_hash drop not null;

create table if not exists login_challenges (
  id text primary key,
  customer_id text not null references customers (id),
  purpose text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  attempts int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists login_challenges_customer_idx on login_challenges (customer_id);
create index if not exists customers_apple_sub_idx on customers (apple_sub);
