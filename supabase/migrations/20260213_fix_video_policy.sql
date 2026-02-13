-- Ensure the videos bucket exists and is private
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do update set public = false;

-- Drop existing policies to avoid conflicts or confusion (optional but cleaner)
drop policy if exists "Authenticated users can view videos" on storage.objects;
drop policy if exists "Authenticated users can upload videos" on storage.objects;
drop policy if exists "Authenticated users can update videos" on storage.objects;
drop policy if exists "Authenticated users can delete videos" on storage.objects;

-- Create more robust policies based on file path structure: user_id/filename

-- 1. SELECT: Users can view files in their own folder
create policy "Users can view their own videos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. INSERT: Users can upload files to their own folder
create policy "Users can upload their own videos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. UPDATE: Users can update files in their own folder
create policy "Users can update their own videos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. DELETE: Users can delete files in their own folder
create policy "Users can delete their own videos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'videos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);
