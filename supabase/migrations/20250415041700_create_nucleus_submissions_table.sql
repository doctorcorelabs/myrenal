-- supabase/migrations/20250415041700_create_nucleus_submissions_table.sql

CREATE TABLE nucleus_submissions (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at timestamptz DEFAULT now() NOT NULL,
    title text NOT NULL,
    category text,
    author text,
    location text,
    featured_image_url text,
    subtitle text,
    summary text,
    key_insights text, -- Storing as single text, user can separate insights by newlines in the form
    content text NOT NULL, -- Storing Markdown content
    status text DEFAULT 'pending'::text NOT NULL
);

-- Add Row Level Security (RLS) if needed, assuming public submissions for now
-- ALTER TABLE nucleus_submissions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access" ON nucleus_submissions FOR SELECT USING (true);
-- CREATE POLICY "Allow authenticated users to insert" ON nucleus_submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- Adjust policies based on actual requirements later if needed. For now, keeping it simple.

COMMENT ON TABLE public.nucleus_submissions IS 'Stores user-submitted ideas for Nucleus posts.';
COMMENT ON COLUMN public.nucleus_submissions.key_insights IS 'User-provided key insights, potentially separated by newlines.';
COMMENT ON COLUMN public.nucleus_submissions.content IS 'Main content of the submission in Markdown format.';
COMMENT ON COLUMN public.nucleus_submissions.status IS 'Submission status: pending, approved, rejected.';
