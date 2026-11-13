create table if not exists customers (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  name text not null,
  phone text,
  email_verified_at timestamptz,
  profile_verified_at timestamptz,
  policies_accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists email_tokens (
  token text primary key,
  customer_id text not null references customers (id),
  purpose text not null,
  expires_at timestamptz not null,
  used_at timestamptz
);

create table if not exists customer_sessions (
  id text primary key,
  customer_id text not null references customers (id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists email_tokens_customer_idx on email_tokens (customer_id);
create index if not exists customer_sessions_customer_idx on customer_sessions (customer_id);
