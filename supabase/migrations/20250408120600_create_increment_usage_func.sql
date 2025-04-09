-- Function to increment usage count for a user and feature on the current date
CREATE OR REPLACE FUNCTION public.increment_usage(
    user_id_param uuid,
    feature_name_param text
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.daily_usage (user_id, feature_name, usage_date, count)
    VALUES (user_id_param, feature_name_param, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature_name, usage_date)
    DO UPDATE SET count = daily_usage.count + 1;
END;
$$;

-- Security definer is often needed for functions modifying data based on the calling user
-- ALTER FUNCTION public.increment_usage(uuid, text) SECURITY DEFINER;
-- Uncomment the above line if you encounter permission issues when calling this function from your frontend/backend.
-- Ensure the function owner has the necessary INSERT/UPDATE privileges on the daily_usage table.
