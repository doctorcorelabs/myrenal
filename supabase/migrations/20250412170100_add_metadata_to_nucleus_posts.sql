-- Add new columns to nucleus_posts table for richer content display

ALTER TABLE public.nucleus_posts
ADD COLUMN category text,
ADD COLUMN subtitle text,
ADD COLUMN author text,
ADD COLUMN location text,
ADD COLUMN key_insights text[]; -- Array of text for key insights

-- Add comments for clarity
COMMENT ON COLUMN public.nucleus_posts.category IS 'Category of the post (e.g., Clinical Learning, Engineering Updates)';
COMMENT ON COLUMN public.nucleus_posts.subtitle IS 'Optional subtitle appearing below the main title';
COMMENT ON COLUMN public.nucleus_posts.author IS 'Author of the post';
COMMENT ON COLUMN public.nucleus_posts.location IS 'Optional location associated with the post (e.g., JAKARTA)';
COMMENT ON COLUMN public.nucleus_posts.key_insights IS 'Array of key takeaway points for the post';

-- Note: Existing RLS policies should still apply.
-- If you need different access control for these new columns, adjust policies accordingly.
