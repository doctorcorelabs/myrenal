-- Function to manually reset a specific user's quota for the current date
CREATE OR REPLACE FUNCTION public.reset_user_quota_manual(
    user_id_param uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Important: Allows the function to delete rows regardless of who calls it (assuming the caller is authorized, e.g., an admin)
AS $$
BEGIN
    -- Delete all usage records for the specified user for today
    DELETE FROM public.daily_usage
    WHERE user_id = user_id_param
      AND usage_date = CURRENT_DATE;

    -- Optional: Log the reset action if needed
    -- INSERT INTO public.admin_logs (action, user_id, details)
    -- VALUES ('manual_quota_reset', auth.uid(), jsonb_build_object('reset_user_id', user_id_param));

END;
$$;

-- Grant execute permission to the authenticated role (or a specific admin role if you have one)
-- This allows logged-in users (specifically the admin calling this from the dashboard) to execute the function.
GRANT EXECUTE ON FUNCTION public.reset_user_quota_manual(uuid) TO authenticated;
-- If you have a specific 'admin' role, you might use:
-- GRANT EXECUTE ON FUNCTION public.reset_user_quota_manual(uuid) TO admin_role;
