-- Auto-confirm user emails on signup
-- This allows users to log in immediately after creating an account

-- Update the handle_new_user function to auto-confirm emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert into user_profiles with proper error handling
    INSERT INTO public.user_profiles (id, email, full_name, role, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth user creation
        RAISE WARNING 'Error creating user profile for %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Update existing unconfirmed users to be confirmed
DO $$
BEGIN
    -- Auto-confirm all existing users who haven't confirmed their email
    UPDATE auth.users
    SET 
        email_confirmed_at = COALESCE(email_confirmed_at, created_at),
        updated_at = now()
    WHERE email_confirmed_at IS NULL;
    
    RAISE NOTICE 'Auto-confirmed existing unconfirmed users';
END $$;