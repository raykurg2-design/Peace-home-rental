create table if not exists auth_rate_limits (
  bucket text primary key,
  hit_count int not null default 0,
  window_started_at timestamptz not null default now()
);
