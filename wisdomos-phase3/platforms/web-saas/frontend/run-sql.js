const { Client } = require('pg');
const fs = require('fs');

async function createTables() {
  console.log('🚀 Creating WisdomOS database tables in Supabase...');
  
  // Use the service role connection string
  const client = new Client({
    connectionString: 'postgresql://postgres.flttywslqlhnjzlknkkqg:PresidentJab2025!@aws-0-us-west-1.pooler.supabase.com:5432/postgres'
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database');

    // Read and execute the SQL file
    const sql = fs.readFileSync('create-tables.sql', 'utf8');
    console.log('📖 Reading SQL schema...');
    
    await client.query(sql);
    console.log('✅ Database tables created successfully!');
    
    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('tenants', 'users', 'life_areas', 'journals')
      ORDER BY table_name;
    `);
    
    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    if (error.detail) {
      console.error('Details:', error.detail);
    }
  } finally {
    await client.end();
    console.log('📡 Database connection closed');
  }
}

createTables();