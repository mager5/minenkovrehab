-- Create a table for videos
create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  description text,
  file_path text not null,
  thumbnail_path text,
  size bigint,
  duration int, -- in seconds
  mime_type text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS
alter table videos enable row level security;

create policy "Users can view their own videos"
  on videos for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own videos"
  on videos for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own videos"
  on videos for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own videos"
  on videos for delete
  using ( auth.uid() = user_id );

-- IMPORTANT: You must create a 'videos' bucket in Supabase Storage manually if it doesn't exist,
-- or run the following if you have permissions to manage storage via SQL:

insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Authenticated users can upload videos"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'videos' and auth.uid() = owner );

create policy "Authenticated users can view videos"
on storage.objects for select
to authenticated
using ( bucket_id = 'videos' and auth.uid() = owner );

create policy "Authenticated users can update videos"
on storage.objects for update
to authenticated
using ( bucket_id = 'videos' and auth.uid() = owner );

create policy "Authenticated users can delete videos"
on storage.objects for delete
to authenticated
using ( bucket_id = 'videos' and auth.uid() = owner );

-- Add views column
alter table videos add column if not exists views int default 0;

-- Function to increment views
create or replace function increment_video_view(video_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update videos
  set views = views + 1
  where id = video_id;
end;
$$;
