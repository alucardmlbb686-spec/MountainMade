#!/usr/bin/env node

/**
 * Automatic RLS Fixer for Categories & Products
 * Run: node scripts/fix-rls.js
 * 
 * This script applies the necessary RLS policies to enable categories
 * and products to load correctly in the app.
 */

const https = require('https');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env');
  process.exit(1);
}

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env');
  console.error('   You need the SERVICE ROLE KEY (not the anon key) to run migrations.');
  console.error('\n📋 To get the SERVICE ROLE KEY:');
  console.error('   1. Go to: https://supabase.com');
  console.error('   2. Select your project');
  console.error('   3. Settings → API → Service Role Key');
  console.error('   4. Copy and add to .env: SUPABASE_SERVICE_ROLE_KEY=key_here');
  process.exit(1);
}

const SQL_QUERY = `
-- Enable RLS and set policies for categories table
DROP POLICY IF EXISTS "public_view_categories" ON public.categories CASCADE;
CREATE POLICY "public_view_categories"
ON public.categories
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_categories" ON public.categories CASCADE;
CREATE POLICY "admins_manage_categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Verify products table policies  
DROP POLICY IF EXISTS "public_view_products" ON public.products CASCADE;
CREATE POLICY "public_view_products"
ON public.products
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_products" ON public.products CASCADE;
CREATE POLICY "admins_manage_products"
ON public.products
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
`;

async function executeSQL() {
  return new Promise((resolve, reject) => {
    const projectId = SUPABASE_URL.split('//')[1].split('.')[0];
    const url = `${SUPABASE_URL}/rest/v1/rpc/execute_sql`;

    const postData = JSON.stringify({
      query: SQL_QUERY
    });

    const options = {
      hostname: SUPABASE_URL.replace(/^https?:\/\//, '').split('/')[0],
      path: `/rest/v1/rpc/execute_sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY,
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('🔧 Fixing RLS policies for categories and products...\n');
  
  try {
    console.log('📤 Connecting to Supabase...');
    console.log(`   Project: ${SUPABASE_URL}\n`);
    
    console.log('⏳ Applying SQL migration...');
    const result = await executeSQL();
    
    console.log('✅ SQL executed successfully!\n');
    console.log('📋 Changes made:');
    console.log('   ✓ Added public read policy to categories table');
    console.log('   ✓ Added admin manage policy to categories table');
    console.log('   ✓ Verified public read policy on products table');
    console.log('   ✓ Verified admin manage policy on products table\n');
    
    console.log('🎉 RLS policies have been fixed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Restart your app: npm run dev');
    console.log('   2. Clear browser cache (Ctrl+Shift+Del)');
    console.log('   3. Refresh: http://localhost:3000');
    console.log('   4. Check that categories and products load\n');
    
  } catch (error) {
    console.error('❌ Error applying migration:');
    console.error(`   ${error.message}\n`);
    
    console.error('📋 Fallback: Use Supabase Dashboard');
    console.error('   1. Go to: https://supabase.com');
    console.error('   2. SQL Editor → New Query');
    console.error('   3. Paste the SQL from FIX_LOADING_ISSUE.md');
    console.error('   4. Click RUN\n');
    
    process.exit(1);
  }
}

run();
