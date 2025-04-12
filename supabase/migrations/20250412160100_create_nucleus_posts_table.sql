USING (true);

-- Helper function to check if a user is an administrator based on the profiles table
CREATE OR REPLACE FUNCTION public.is_administrator(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND level = 'Administrator'
  );
$$;

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.is_administrator(uuid) TO authenticated;


-- Policies for allowing administrators to manage posts
-- Ensure you have a way to assign the 'Administrator' role to users,
-- potentially via custom claims or a separate roles table linked to users.

-- Allow Administrators to insert new posts
CREATE POLICY "Allow insert for administrators"
ON public.nucleus_posts
FOR INSERT
TO authenticated
WITH CHECK (public.is_administrator(auth.uid())); -- Use the helper function

-- Allow Administrators to update existing posts
CREATE POLICY "Allow update for administrators"
ON public.nucleus_posts
FOR UPDATE
USING (public.is_administrator(auth.uid())) -- Use the helper function
WITH CHECK (public.is_administrator(auth.uid())); -- Use the helper function

-- Allow Administrators to delete posts
CREATE POLICY "Allow delete for administrators"
ON public.nucleus_posts
FOR DELETE
USING (public.is_administrator(auth.uid())); -- Use the helper function
