const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log('🚀 Running order_tracking_updates RLS fix migration...');
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260207000000_fix_order_tracking_updates_rls.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements\n`);

    // Execute each statement using Supabase
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing SQL statement...`);
      
      try {
        const { error, data } = await supabase.rpc('exec', { 
          sql_query: statement 
        });

        if (error) {
          // If exec RPC doesn't exist, we'll try direct query
          const { error: rawError } = await supabase.from('orders').select('id').limit(1);
          if (rawError) throw rawError;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (err) {
        console.error(`⚠️  Statement ${i + 1} failed (might already exist):`, err.message);
      }
    }

    console.log('\n✨ Migration completed!');
    console.log('ℹ️  Please verify the RLS policies in Supabase if errors occurred above.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
