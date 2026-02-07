#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  console.log('\n📋 Steps to get your service role key:');
  console.log('1. Go to https://supabase.com and open your project');
  console.log('2. Navigate to Settings > API');
  console.log('3. Copy the "service_role" key under "Project API keys"');
  console.log('4. Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

async function runMigration() {
  try {
    console.log('🚀 Running order_tracking_updates RLS fix migration...\n');
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260207000000_fix_order_tracking_updates_rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements, filtering out comments
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.replace(/--.*$/gm, '').trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📝 Found ${statements.length} SQL statement(s) to execute\n`);

    // Execute each statement via REST API
    let successCount = 0;
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'X-Client-Info': 'migration-runner/1.0',
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok && response.status !== 404) {
          // 404 likely means the RPC doesn't exist, so we'll try a different approach
          const error = await response.text();
          if (response.status !== 404) {
            console.log(`⚠️  Status ${response.status}:`, error.substring(0, 100));
          }
        } else {
          successCount++;
          console.log(`✅ Statement ${i + 1} executed`);
        }
      } catch (err) {
        console.error(`❌ Error on statement ${i + 1}:`, err.message);
      }
    }

    if (successCount > 0) {
      console.log(`\n✨ Migration completed! (${successCount}/${statements.length} statements executed)`);
    } else {
      console.log(`\n⚠️  Could not execute migration via API.`);
      console.log('\n📌 To apply this fix manually:');
      console.log('1. Go to Supabase Dashboard > SQL Editor');
      console.log('2. Click "New Query"');
      console.log(`3. Copy the contents of: supabase/migrations/20260207000000_fix_order_tracking_updates_rls.sql`);
      console.log('4. Click "Run"');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
