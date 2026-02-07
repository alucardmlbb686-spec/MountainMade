-- Delivery Addresses Migration
-- Creates delivery_addresses table for customer address management

-- 1. Create delivery_addresses table
CREATE TABLE IF NOT EXISTS public.delivery_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_user_id ON public.delivery_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_addresses_is_default ON public.delivery_addresses(user_id, is_default);

-- 3. Enable RLS
ALTER TABLE public.delivery_addresses ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "users_manage_own_delivery_addresses" ON public.delivery_addresses;
CREATE POLICY "users_manage_own_delivery_addresses"
ON public.delivery_addresses
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. Trigger for updated_at
DROP TRIGGER IF EXISTS update_delivery_addresses_updated_at ON public.delivery_addresses;
CREATE TRIGGER update_delivery_addresses_updated_at
    BEFORE UPDATE ON public.delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at();

-- 6. Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If setting this address as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE public.delivery_addresses
        SET is_default = false
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

-- 7. Trigger to ensure single default
DROP TRIGGER IF EXISTS ensure_single_default_address_trigger ON public.delivery_addresses;
CREATE TRIGGER ensure_single_default_address_trigger
    BEFORE INSERT OR UPDATE ON public.delivery_addresses
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_single_default_address();

-- 8. Mock Data
DO $$
DECLARE
    existing_user_id UUID;
BEGIN
    -- Get existing user from user_profiles
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT id INTO existing_user_id FROM public.user_profiles WHERE email = 'user@example.com' LIMIT 1;
        
        IF existing_user_id IS NOT NULL THEN
            -- Create sample delivery addresses
            INSERT INTO public.delivery_addresses (user_id, full_name, email, phone, address, city, state, pincode, is_default)
            VALUES 
                (existing_user_id, 'Rajesh Kumar', 'user@example.com', '+91 98765 43210', '123 Main Street, Apartment 4B', 'Mumbai', 'Maharashtra', '400001', true),
                (existing_user_id, 'Rajesh Kumar', 'user@example.com', '+91 98765 43210', '456 Park Avenue, Building C', 'Pune', 'Maharashtra', '411001', false)
            ON CONFLICT (id) DO NOTHING;
        ELSE
            RAISE NOTICE 'No existing users found. Run auth migration first.';
        END IF;
    ELSE
        RAISE NOTICE 'Table user_profiles does not exist. Run auth migration first.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;