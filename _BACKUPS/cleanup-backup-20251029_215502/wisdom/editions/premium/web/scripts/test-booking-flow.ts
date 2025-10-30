#!/usr/bin/env node

/**
 * Test script for guest/booking flow
 * Tests real error reporting vs "fake success"
 */

async function testBookingFlow() {
  const API_BASE = process.env.API_URL || 'http://localhost:3000'
  
  console.log('🧪 Testing Guest/Booking Flow...\n')
  
  // Test 1: Create guest without required fields
  console.log('Test 1: Missing required guest fields...')
  try {
    const res = await fetch(`${API_BASE}/api/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guest: {} })
    })
    const data = await res.json()
    
    if (res.ok) {
      console.log('❌ Should have failed but succeeded')
    } else {
      console.log('✅ Correctly rejected:', data.error)
    }
  } catch (err) {
    console.log('❌ Network error:', err)
  }
  
  // Test 2: Create guest with valid data
  console.log('\nTest 2: Valid guest creation...')
  let guestId: string | null = null
  
  try {
    const res = await fetch(`${API_BASE}/api/guests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guest: {
          full_name: 'Test User',
          email: `test${Date.now()}@example.com`,
          phone: '+1234567890'
        }
      })
    })
    const data = await res.json()
    
    if (res.ok) {
      console.log('✅ Guest created:', data.id)
      guestId = data.id
    } else {
      console.log('❌ Failed:', data.error)
    }
  } catch (err) {
    console.log('❌ Network error:', err)
  }
  
  // Test 3: Create booking without required fields
  console.log('\nTest 3: Missing required booking fields...')
  try {
    const res = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking: {} })
    })
    const data = await res.json()
    
    if (res.ok) {
      console.log('❌ Should have failed but succeeded')
    } else {
      console.log('✅ Correctly rejected:', data.error)
    }
  } catch (err) {
    console.log('❌ Network error:', err)
  }
  
  // Test 4: Create valid booking
  if (guestId) {
    console.log('\nTest 4: Valid booking creation...')
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking: {
            guest_id: guestId,
            room_type: 'DORM_8',
            total_price: 100.50,
            checkin_date: '2025-08-25',
            checkout_date: '2025-08-27'
          }
        })
      })
      const data = await res.json()
      
      if (res.ok) {
        console.log('✅ Booking created:', data.id)
      } else {
        console.log('❌ Failed:', data.error)
      }
    } catch (err) {
      console.log('❌ Network error:', err)
    }
  }
  
  // Test 5: Test Supabase connection
  console.log('\nTest 5: Supabase connection...')
  try {
    const res = await fetch(`${API_BASE}/api/bookings?since=2025-01-01`)
    const data = await res.json()
    
    if (res.ok) {
      console.log('✅ Supabase connected, bookings count:', data.count)
    } else {
      console.log('⚠️  Supabase error (expected if DB not configured):', data.error)
    }
  } catch (err) {
    console.log('❌ Network error:', err)
  }
  
  console.log('\n🏁 Tests complete!')
  console.log('Expected result: Real errors from Supabase, not fake success messages')
}

// Run tests
testBookingFlow().catch(console.error)