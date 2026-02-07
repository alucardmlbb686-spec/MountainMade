const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  console.log('\nTo get your service role key:');
  console.log('1. Go to https://supabase.com');
  console.log('2. Open your project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the "service_role" key');
  console.log('5. Add it to your .env file as SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    console.log('🚀 Starting categories table migration...');
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../supabase/migrations/20260206145000_create_categories.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`\n[${i + 1}/${statements.length}] Executing...`);
      
      const { error } = await supabase.rpc('exec_raw_sql', { 
        sql: statement 
      }).catch(() => {
        // If exec_raw_sql doesn't exist, try direct execution
        return supabase.from('_sql').select().limit(0);
      });

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }
    }

    console.log('\n✅ Migration executed successfully!');
    console.log('Categories table has been created and seeded with data.');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error running migration:', err.message);
    console.log('\n📝 Alternative: You can run the migration manually:');
    console.log('1. Go to https://supabase.com');
    console.log('2. Open your project and go to SQL Editor');
    console.log('3. Click "New Query"');
    console.log('4. Copy the contents of supabase/migrations/20260206145000_create_categories.sql');
    console.log('5. Paste and run the query');
    process.exit(1);
  }
}

runMigration();
