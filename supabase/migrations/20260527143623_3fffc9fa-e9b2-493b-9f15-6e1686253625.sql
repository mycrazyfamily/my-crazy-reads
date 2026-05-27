ALTER TABLE public.book_requests
  ADD COLUMN IF NOT EXISTS selected_location_id uuid,
  ADD COLUMN IF NOT EXISTS selected_location_label text;