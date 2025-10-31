import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { dimensionId: string } }
) {
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

    const body = await request.json()
    const { metric, notes } = body

    // Validate metric
    if (metric !== null && metric !== undefined && (metric < 1 || metric > 5)) {
      return NextResponse.json({ error: 'Metric must be between 1 and 5' }, { status: 400 })
    }

    // Update dimension (RLS policies will ensure user owns it)
    const { data: dimension, error: updateError } = await supabase
      .from('dimensions')
      .update({
        metric,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.dimensionId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Dimension not found or access denied' }, { status: 404 })
      }
      console.error('Error updating dimension:', updateError)
      return NextResponse.json({ error: 'Failed to update dimension' }, { status: 500 })
    }

    return NextResponse.json({ dimension })
  } catch (error) {
    console.error('Error updating dimension:', error)
    return NextResponse.json({ error: 'Failed to update dimension' }, { status: 500 })
  }
}
