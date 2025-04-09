-- Function to get all usage records for the current date
CREATE OR REPLACE FUNCTION public.get_today_all_usage(
    _cache_buster bigint DEFAULT 0 -- Added cache buster parameter
)
RETURNS TABLE (
    user_id uuid,
    feature_name text, -- Match the type in your daily_usage table
    usage_count integer,
    usage_date date
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        du.user_id,
        du.feature_name,
        du.count, -- Ensure this matches the column name in daily_usage (e.g., 'count' or 'usage_count')
        du.usage_date
    FROM
        public.daily_usage du
    WHERE
        du.usage_date = CURRENT_DATE; -- Filter for today's date
END;
$$;
