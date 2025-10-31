const { createClient } = require('@supabase/supabase-js');

async function setupDatabase() {
  console.log('🚀 Setting up WisdomOS database with proper authentication...');
  
  // Create admin client using service role key
  const supabase = createClient(
    'https://flttywslqlhnjzlknkkqg.supabase.co',
    'sbp_2ea61ad2d7106298a24d17c90d01a0315b28478b',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test basic connection by checking auth
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('✅ Supabase client initialized');

    console.log('📊 Creating essential tables...');
    
    // Create tables using SQL
    const createTablesSQL = `
      -- Enable UUID extension
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      
      -- Create users table (simplified)
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create life_areas table
      CREATE TABLE IF NOT EXISTS life_areas (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        name TEXT NOT NULL,
        status TEXT DEFAULT 'GREEN',
        score INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create journal_entries table (for mood tracking)
      CREATE TABLE IF NOT EXISTS journal_entries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id),
        life_area_id UUID REFERENCES life_areas(id),
        content TEXT NOT NULL,
        mood TEXT,
        entry_type TEXT DEFAULT 'mood_check',
        tags TEXT[],
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Enable RLS
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
      ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
      
      -- Create permissive policies for now (will tighten later)
      DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON users;
      CREATE POLICY "Enable all operations for authenticated users" ON users
        FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON life_areas;
      CREATE POLICY "Enable all operations for authenticated users" ON life_areas
        FOR ALL USING (true);
      
      DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON journal_entries;  
      CREATE POLICY "Enable all operations for authenticated users" ON journal_entries
        FOR ALL USING (true);
    `;

    // Execute the SQL using rpc call
    const { data: rpcData, error: rpcError } = await supabase.rpc('exec', {
      sql: createTablesSQL
    });

    if (rpcError) {
      console.log('⚠️  RPC not available, trying alternative approach...');
      
      // Alternative: Try to create tables individually
      console.log('📋 Creating users table...');
      const { error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (usersError && usersError.message.includes('does not exist')) {
        console.log('❌ Tables do not exist. Manual table creation needed.');
        console.log('📝 Please run this SQL in your Supabase SQL Editor:');
        console.log(createTablesSQL);
        return false;
      }
    } else {
      console.log('✅ SQL executed successfully');
    }

    // Test table access
    console.log('🔍 Testing table access...');
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) {
      console.log('❌ Users table access failed:', usersError.message);
      return false;
    }

    console.log('✅ Users table accessible');

    // Create a test user
    console.log('👤 Creating test user...');
    const { data: testUser, error: testUserError } = await supabase
      .from('users')
      .insert([
        {
          email: 'test@wisdomos.app',
          name: 'Test User'
        }
      ])
      .select()
      .single();

    if (testUserError && !testUserError.message.includes('duplicate')) {
      console.log('❌ Test user creation failed:', testUserError.message);
      return false;
    }

    const userId = testUser?.id || 'existing-user';
    console.log('✅ Test user ready:', userId);

    // Create a default life area
    console.log('🎯 Creating default life area...');
    const { data: testLifeArea, error: lifeAreaError } = await supabase
      .from('life_areas')
      .insert([
        {
          user_id: userId,
          name: 'General',
          status: 'GREEN',
          score: 7
        }
      ])
      .select()
      .single();

    if (lifeAreaError && !lifeAreaError.message.includes('duplicate')) {
      console.log('⚠️  Life area creation warning:', lifeAreaError.message);
    } else {
      console.log('✅ Default life area ready');
    }

    // Test journal entry creation
    console.log('📝 Testing journal entry creation...');
    const { data: testEntry, error: entryError } = await supabase
      .from('journal_entries')
      .insert([
        {
          user_id: userId,
          life_area_id: testLifeArea?.id,
          content: 'Test mood entry from database setup',
          mood: '😊',
          entry_type: 'mood_check'
        }
      ])
      .select()
      .single();

    if (entryError) {
      console.log('❌ Journal entry test failed:', entryError.message);
      return false;
    }

    console.log('✅ Journal entry test successful');
    console.log('🎉 Database setup completed successfully!');
    
    return true;

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    return false;
  }
}

setupDatabase().then(success => {
  if (success) {
    console.log('🚀 Ready to implement mood tracking functionality!');
  } else {
    console.log('💡 Please check Supabase configuration and try again');
  }
  process.exit(success ? 0 : 1);
});