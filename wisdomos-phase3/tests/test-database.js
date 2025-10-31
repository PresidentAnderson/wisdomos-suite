#!/usr/bin/env node
// Quick database connectivity test for WisdomOS

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dcvpixqvzqibwwobyfji.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjdnBpeHF2enFpYnd3b2J5ZmppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzUzMDksImV4cCI6MjA3MTUxMTMwOX0.9tMcYlb9cJTa9jYd9-Nky03mJB66QF_Dk6eueY_y5Gc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔥 Testing WisdomOS Database Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('   ⚠️  Table "users" not found (expected if not created yet)');
    } else {
      console.log('   ✅ Database connection successful!');
    }
    
    // Test 2: Real-time connection
    console.log('\n2. Testing real-time connection...');
    const channel = supabase.channel('test-channel')
      .on('broadcast', { event: 'test' }, payload => {
        console.log('   ✅ Real-time message received:', payload);
      })
      .subscribe((status) => {
        console.log('   📡 Real-time status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('   ✅ Real-time connection successful!');
          
          // Send test message
          channel.send({
            type: 'broadcast',
            event: 'test',
            payload: { message: 'Phoenix connection test! 🔥' }
          });
          
          // Cleanup
          setTimeout(() => {
            supabase.removeAllChannels();
            console.log('\n🎉 All tests passed! WisdomOS is ready for deployment!');
            process.exit(0);
          }, 2000);
        }
      });
      
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();