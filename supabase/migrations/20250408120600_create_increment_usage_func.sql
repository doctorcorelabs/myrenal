-- Function to increment usage count for a user and feature on the current date
CREATE OR REPLACE FUNCTION public.increment_usage(
    user_id_param uuid,
    feature_name_param text
 )
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER -- Add SECURITY DEFINER here
 AS $$
 BEGIN
     INSERT INTO public.daily_usage (user_id, feature_name, usage_date, count)
    VALUES (user_id_param, feature_name_param, CURRENT_DATE, 1)
    ON CONFLICT (user_id, feature_name, usage_date)
    DO UPDATE SET count = daily_usage.count + 1;
END;
 $$;

 -- Note: SECURITY DEFINER added above.
 -- Ensure the function owner (typically the user running migrations) has the necessary
 -- INSERT/UPDATE privileges on the public.daily_usage table.
