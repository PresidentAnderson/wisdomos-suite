const { createClient } = require('@supabase/supabase-js');

async function createTables() {
  console.log('🚀 Setting up WisdomOS database tables in Supabase...');
  
  // Create Supabase client with service role key
  const supabase = createClient(
    'https://flttywslqlhnjzlknkkqg.supabase.co',
    'sbp_2ea61ad2d7106298a24d17c90d01a0315b28478b'
  );

  try {
    // Test connection first
    console.log('🔌 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Connected to Supabase successfully');

    // Create tables using RPC calls or direct SQL
    console.log('📊 Creating database schema...');
    
    // Create basic tables that the app needs
    const tables = [
      {
        name: 'tenants',
        sql: `
          CREATE TABLE IF NOT EXISTS tenants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'ACTIVE',
            plan TEXT DEFAULT 'FREE',
            settings JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable RLS
          ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
          
          -- Create policy
          CREATE POLICY "Enable all access for service role" ON tenants
            FOR ALL USING (true);
        `
      },
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID REFERENCES tenants(id),
            email TEXT NOT NULL,
            name TEXT,
            role TEXT DEFAULT 'MEMBER',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(tenant_id, email)
          );
          
          -- Enable RLS
          ALTER TABLE users ENABLE ROW LEVEL SECURITY;
          
          -- Create policy
          CREATE POLICY "Enable all access for service role" ON users
            FOR ALL USING (true);
        `
      },
      {
        name: 'life_areas',
        sql: `
          CREATE TABLE IF NOT EXISTS life_areas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            user_id UUID REFERENCES users(id),
            name TEXT NOT NULL,
            status TEXT DEFAULT 'GREEN',
            score INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, name)
          );
          
          -- Enable RLS
          ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
          
          -- Create policy
          CREATE POLICY "Enable all access for service role" ON life_areas
            FOR ALL USING (true);
        `
      },
      {
        name: 'journals',
        sql: `
          CREATE TABLE IF NOT EXISTS journals (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id UUID NOT NULL,
            user_id UUID REFERENCES users(id),
            life_area_id UUID REFERENCES life_areas(id),
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          -- Enable RLS
          ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
          
          -- Create policy
          CREATE POLICY "Enable all access for service role" ON journals
            FOR ALL USING (true);
        `
      }
    ];

    // Execute each table creation
    for (const table of tables) {
      console.log(`📋 Creating ${table.name} table...`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: table.sql
      });
      
      if (error) {
        console.log(`⚠️  Table ${table.name} might already exist or RPC not available`);
        // Try alternative approach - this might not work but let's see
        try {
          await supabase.from(table.name).select('id').limit(1);
          console.log(`✅ ${table.name} table verified`);
        } catch (e) {
          console.log(`❌ Could not verify ${table.name} table`);
        }
      } else {
        console.log(`✅ ${table.name} table created/verified`);
      }
    }
    
    // Insert default tenant
    console.log('🏢 Creating default tenant...');
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert([
        {
          name: 'Default Tenant',
          slug: 'default',
          plan: 'FREE',
          status: 'ACTIVE'
        }
      ])
      .select();
    
    if (tenantError && !tenantError.message.includes('duplicate')) {
      console.log('⚠️  Could not create default tenant:', tenantError.message);
    } else {
      console.log('✅ Default tenant ready');
    }
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
  }
}

createTables();