/**
 * Shareable Fulfillment Reports
 *
 * Generate public shareable links for fulfillment data:
 * - Control what data to share (areas, scores, trends)
 * - Set expiration dates
 * - Password protection option
 * - Analytics on views
 */

import { supabase } from '@/lib/supabase'
import crypto from 'crypto'

// Types
export interface ShareableReport {
  id: string
  user_id: string
  tenant_id: string
  share_token: string // Public URL token
  title: string
  description: string | null

  // Sharing options
  include_areas: string[] // Area IDs to include
  include_gfs: boolean
  include_trends: boolean
  include_history: boolean
  include_dimensions: boolean

  // Access control
  is_public: boolean
  password_hash: string | null
  expires_at: string | null
  max_views: number | null

  // Analytics
  view_count: number
  last_viewed_at: string | null

  created_at: string
  updated_at: string
}

export interface ReportSnapshot {
  captured_at: string
  gfs: number
  areas: Array<{
    id: string
    code: string
    name: string
    emoji: string
    score: number
    trend_30d: number | null
    status: string
  }>
  trends?: {
    mom_change: number | null
    yoy_change: number | null
  }
  history?: Array<{
    date: string
    gfs: number
  }>
}

export interface CreateReportOptions {
  userId: string
  tenantId?: string
  title: string
  description?: string
  includeAreas?: string[] // Empty = all areas
  includeGFS?: boolean
  includeTrends?: boolean
  includeHistory?: boolean
  includeDimensions?: boolean
  isPublic?: boolean
  password?: string
  expiresIn?: number // Days from now
  maxViews?: number
}

/**
 * Create a shareable report
 */
export async function createShareableReport(
  options: CreateReportOptions
): Promise<ShareableReport> {
  const {
    userId,
    tenantId = 'default-tenant',
    title,
    description,
    includeAreas = [],
    includeGFS = true,
    includeTrends = true,
    includeHistory = false,
    includeDimensions = false,
    isPublic = false,
    password,
    expiresIn,
    maxViews
  } = options

  // Generate unique share token
  const shareToken = generateShareToken()

  // Hash password if provided
  const passwordHash = password ? await hashPassword(password) : null

  // Calculate expiration
  const expiresAt = expiresIn
    ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
    : null

  // Fetch areas if not specified
  let areaIds = includeAreas
  if (areaIds.length === 0) {
    const { data: areas } = await supabase
      .from('fd_areas')
      .select('id')
      .eq('is_active', true)
    areaIds = areas?.map(a => a.id) || []
  }

  // Capture current snapshot
  const snapshot = await captureReportSnapshot(userId, areaIds, {
    includeGFS,
    includeTrends,
    includeHistory,
    includeDimensions
  })

  // Create report record
  const report: Omit<ShareableReport, 'created_at' | 'updated_at'> = {
    id: crypto.randomUUID(),
    user_id: userId,
    tenant_id: tenantId,
    share_token: shareToken,
    title,
    description: description || null,
    include_areas: areaIds,
    include_gfs: includeGFS,
    include_trends: includeTrends,
    include_history: includeHistory,
    include_dimensions: includeDimensions,
    is_public: isPublic,
    password_hash: passwordHash,
    expires_at: expiresAt,
    max_views: maxViews || null,
    view_count: 0,
    last_viewed_at: null
  }

  // Save to database
  const { data, error } = await supabase
    .from('fd_shareable_report')
    .insert({
      ...report,
      snapshot_data: snapshot
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to create report: ${error.message}`)

  return data as ShareableReport
}

/**
 * Get shareable report by token
 */
export async function getShareableReport(
  shareToken: string,
  password?: string
): Promise<{ report: ShareableReport; snapshot: ReportSnapshot } | { error: string }> {
  // Fetch report
  const { data: report, error } = await supabase
    .from('fd_shareable_report')
    .select('*')
    .eq('share_token', shareToken)
    .single()

  if (error || !report) {
    return { error: 'Report not found' }
  }

  // Check if expired
  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return { error: 'Report has expired' }
  }

  // Check max views
  if (report.max_views && report.view_count >= report.max_views) {
    return { error: 'Report view limit reached' }
  }

  // Check password
  if (report.password_hash) {
    if (!password) {
      return { error: 'Password required' }
    }
    const isValid = await verifyPassword(password, report.password_hash)
    if (!isValid) {
      return { error: 'Invalid password' }
    }
  }

  // Increment view count
  await supabase
    .from('fd_shareable_report')
    .update({
      view_count: report.view_count + 1,
      last_viewed_at: new Date().toISOString()
    })
    .eq('id', report.id)

  return {
    report: report as ShareableReport,
    snapshot: report.snapshot_data as ReportSnapshot
  }
}

/**
 * Capture a snapshot of current fulfillment data
 */
async function captureReportSnapshot(
  userId: string,
  areaIds: string[],
  options: {
    includeGFS: boolean
    includeTrends: boolean
    includeHistory: boolean
    includeDimensions: boolean
  }
): Promise<ReportSnapshot> {
  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Fetch areas
  const { data: areas } = await supabase
    .from('fd_areas')
    .select('*')
    .in('id', areaIds)

  // Fetch current scores
  const { data: scores } = await supabase
    .from('fd_score_raw')
    .select('*')
    .eq('user_id', userId)
    .eq('period', period)
    .in('area_id', areaIds)

  // Build area data
  const areaData = areas?.map(area => {
    const areaScores = scores?.filter(s => s.area_id === area.id) || []
    const avgScore = areaScores.length > 0
      ? areaScores.reduce((sum, s) => sum + s.score, 0) / areaScores.length
      : 0

    const status = avgScore >= 4.5 ? 'excellent'
      : avgScore >= 3.5 ? 'healthy'
      : avgScore >= 2.0 ? 'friction'
      : 'critical'

    return {
      id: area.id,
      code: area.code,
      name: area.name,
      emoji: area.emoji,
      score: avgScore,
      trend_30d: null, // TODO: Calculate from history
      status
    }
  }) || []

  // Calculate GFS
  const totalWeight = areas?.reduce((sum, a) => sum + a.weight_default, 0) || 1
  const weightedSum = areaData.reduce((sum, ad) => {
    const area = areas?.find(a => a.id === ad.id)
    return sum + (ad.score * (area?.weight_default || 1))
  }, 0)
  const gfs = Math.round((weightedSum / totalWeight) * 20)

  // Build snapshot
  const snapshot: ReportSnapshot = {
    captured_at: now.toISOString(),
    gfs,
    areas: areaData
  }

  // Add trends if requested
  if (options.includeTrends) {
    // TODO: Fetch MoM/YoY data
    snapshot.trends = {
      mom_change: null,
      yoy_change: null
    }
  }

  // Add history if requested
  if (options.includeHistory) {
    // TODO: Fetch historical GFS data
    snapshot.history = []
  }

  return snapshot
}

/**
 * Generate unique share token
 */
function generateShareToken(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Hash password for storage
 */
async function hashPassword(password: string): Promise<string> {
  // For production, use bcrypt or similar
  // This is a simplified version
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * List all shareable reports for a user
 */
export async function listUserReports(userId: string): Promise<ShareableReport[]> {
  const { data, error } = await supabase
    .from('fd_shareable_report')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Failed to fetch reports: ${error.message}`)

  return data as ShareableReport[]
}

/**
 * Delete a shareable report
 */
export async function deleteShareableReport(reportId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('fd_shareable_report')
    .delete()
    .eq('id', reportId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to delete report: ${error.message}`)
}

/**
 * Update report settings
 */
export async function updateShareableReport(
  reportId: string,
  userId: string,
  updates: Partial<Pick<ShareableReport, 'title' | 'description' | 'is_public' | 'expires_at' | 'max_views'>>
): Promise<void> {
  const { error } = await supabase
    .from('fd_shareable_report')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', reportId)
    .eq('user_id', userId)

  if (error) throw new Error(`Failed to update report: ${error.message}`)
}

/**
 * Generate public URL for report
 */
export function getShareableReportURL(shareToken: string, baseURL?: string): string {
  const base = baseURL || (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/share/${shareToken}`
}
