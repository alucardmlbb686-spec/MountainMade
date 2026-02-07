-- Add Role Column to User Profiles
-- Fixes: column user_profiles.role does not exist error

-- 1. Ensure user_role enum exists (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'wholesale');
        RAISE NOTICE 'Created user_role enum';
    ELSE
        RAISE NOTICE 'user_role enum already exists';
    END IF;
END $$;

-- 2. Add role column to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'role'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD COLUMN role public.user_role DEFAULT 'user'::public.user_role;
        RAISE NOTICE 'Added role column to user_profiles';
    ELSE
        RAISE NOTICE 'role column already exists in user_profiles';
    END IF;
END $$;

-- 3. Create index on role column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 4. Update existing users to have proper roles based on email
DO $$
BEGIN
    -- Set admin role for admin users
    UPDATE public.user_profiles
    SET role = 'admin'::public.user_role
    WHERE email LIKE '%admin%'
    AND role IS NULL;

    -- Set wholesale role for wholesale users
    UPDATE public.user_profiles
    SET role = 'wholesale'::public.user_role
    WHERE email LIKE '%wholesale%'
    AND role IS NULL;

    -- Set default user role for others
    UPDATE public.user_profiles
    SET role = 'user'::public.user_role
    WHERE role IS NULL;

    RAISE NOTICE 'Updated existing user roles';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Role update failed: %', SQLERRM;
END $$;

-- 5. Recreate or update the handle_new_user function to include role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, avatar_url, phone)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        avatar_url = EXCLUDED.avatar_url,
        phone = EXCLUDED.phone,
        updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 6. Recreate is_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'::public.user_role
    )
$$;

-- 7. Recreate is_wholesale function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_wholesale()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'wholesale'::public.user_role
    );
END;
$$;