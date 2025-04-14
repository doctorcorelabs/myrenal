-- supabase/migrations/20250415043200_add_name_email_to_nucleus_submissions.sql

ALTER TABLE public.nucleus_submissions
ADD COLUMN name text,
ADD COLUMN email text;

COMMENT ON COLUMN public.nucleus_submissions.name IS 'Optional name provided by the submitter.';
COMMENT ON COLUMN public.nucleus_submissions.email IS 'Optional email provided by the submitter.';
