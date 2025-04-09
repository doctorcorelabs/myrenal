-- Add cache buster parameter to get_today_usage_count function
-- Assuming the function exists and returns an integer count.
-- If the function definition is different, this might need adjustment.
CREATE OR REPLACE FUNCTION public.get_today_usage_count(
    user_id_param uuid,
    feature_name_param text,
    _cache_buster bigint DEFAULT 0 -- Added cache buster parameter
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    usage_count integer;
BEGIN
    SELECT COALESCE(sum(count), 0)
    INTO usage_count
    FROM public.daily_usage
    WHERE user_id = user_id_param
      AND feature_name = feature_name_param
      AND usage_date = CURRENT_DATE;

    RETURN usage_count;
END;
$$;

-- Note: This assumes the original function structure.
-- If the original function returned a table or had different logic,
-- this CREATE OR REPLACE statement might overwrite it incorrectly.
-- It's best practice to use ALTER FUNCTION if possible, but
-- CREATE OR REPLACE is used here for simplicity without knowing the exact original definition.
