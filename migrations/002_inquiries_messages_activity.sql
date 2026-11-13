create table if not exists inquiries (
  id text primary key,
  customer_id text not null references customers (id),
  listing_slug text not null,
  listing_title text not null,
  kind text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message_threads (
  id text primary key,
  customer_id text not null references customers (id),
  listing_slug text,
  listing_title text,
  subject text not null,
  inquiry_id text references inquiries (id),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  thread_id text not null references message_threads (id),
  sender_role text not null,
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists activity_events (
  id text primary key,
  customer_id text references customers (id),
  actor_role text not null,
  kind text not null,
  title text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists inquiries_customer_idx on inquiries (customer_id);
create index if not exists inquiries_created_idx on inquiries (created_at);
create index if not exists message_threads_customer_idx on message_threads (customer_id);
create index if not exists message_threads_last_idx on message_threads (last_message_at);
create index if not exists messages_thread_idx on messages (thread_id, created_at);
create index if not exists activity_events_customer_idx on activity_events (customer_id, created_at);
create index if not exists activity_events_created_idx on activity_events (created_at);
