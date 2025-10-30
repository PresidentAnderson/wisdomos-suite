import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with user's token
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    })

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch life areas with nested subdomains and dimensions
    const { data: lifeAreas, error: lifeAreasError } = await supabase
      .from('life_areas')
      .select(`
        *,
        subdomains (
          *,
          dimensions (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (lifeAreasError) {
      console.error('Error fetching life areas:', lifeAreasError)
      return NextResponse.json({ error: 'Failed to fetch life areas' }, { status: 500 })
    }

    // Sort subdomains and dimensions for each life area
    const sortedLifeAreas = lifeAreas?.map(area => ({
      ...area,
      subdomains: area.subdomains
        ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
        .map((subdomain: any) => ({
          ...subdomain,
          dimensions: subdomain.dimensions?.sort((a: any, b: any) => a.name.localeCompare(b.name))
        }))
    }))

    return NextResponse.json({ lifeAreas: sortedLifeAreas })
  } catch (error) {
    console.error('Error fetching v5 data:', error)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
