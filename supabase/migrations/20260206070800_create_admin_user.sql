-- Create Admin User Migration
-- Properly creates admin user using Supabase auth functions

-- Create admin user if not exists
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'admin@mountainmade.com';
    admin_password TEXT := 'Admin@123';
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email;

    -- If admin doesn't exist, create it
    IF admin_user_id IS NULL THEN
        -- Insert into auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', 'Admin User', 'role', 'admin'),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;

        -- Insert into auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            admin_user_id,
            jsonb_build_object('sub', admin_user_id::text, 'email', admin_email),
            'email',
            NOW(),
            NOW(),
            NOW()
        );

        -- The trigger will automatically create the user_profile
        RAISE NOTICE 'Admin user created successfully with email: %', admin_email;
    ELSE
        RAISE NOTICE 'Admin user already exists with email: %', admin_email;
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating admin user: %', SQLERRM;
END $$;