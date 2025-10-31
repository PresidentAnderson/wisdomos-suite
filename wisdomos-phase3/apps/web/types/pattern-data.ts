/**
 * Type definitions for Pattern Data and Recommendations API
 *
 * These types match the database schema and API responses.
 */

// Database models
export interface PatternData {
  id: string
  tenantId: string
  userId: string
  date: Date
  energy: number // 0-100
  focus: number // 0-100
  fulfillment: number // 0-100
  createdAt: Date
}

export interface UserRecommendation {
  id: string
  tenantId: string
  userId: string
  recommendation: string
  reasoning: string | null
  dataPoint: any | null // JSON field
  generatedAt: Date
  viewed: boolean
  viewedAt: Date | null
}

// API Response types
export interface PatternDataPoint {
  date: string // Day name: 'Mon', 'Tue', etc.
  energy: number
  focus: number
  fulfillment: number
}

export interface PatternInsight {
  title: string
  description: string
  icon: string // Icon identifier
}

export interface PatternAverages {
  energy: number
  focus: number
  fulfillment: number
}

export type TrendDirection = 'rising' | 'falling' | 'flat'
export type TrendStrength = 'weak' | 'moderate' | 'strong'

export interface TrendInfo {
  direction: TrendDirection
  change: number
  consecutiveDays: number
  trendStrength: TrendStrength
  isSignificant: boolean
}

export interface PatternTrends {
  energy: TrendInfo
  focus: TrendInfo
  fulfillment: TrendInfo
}

export interface SignificantTrend {
  metric: 'energy' | 'focus' | 'fulfillment'
  direction: TrendDirection
  consecutiveDays: number
  strength: TrendStrength
}

export interface PatternsResponse {
  patterns: PatternDataPoint[]
  insights: PatternInsight[]
  averages: PatternAverages
  trends: PatternTrends
  significantTrends: SignificantTrend[]
  aiInsight: string
}

export interface Recommendation {
  recommendation: string
  reasoning: string
  dataPoint: string
}

export interface RecommendationsResponse {
  recommendations: Recommendation[]
  generatedAt: string // ISO timestamp
  usingAI: boolean
  cached?: boolean
  basedOn: {
    dataPoints: number
    averageEnergy: number
    averageFocus: number
    averageFulfillment: number
  }
}

// Frontend hooks types
export interface UsePatternDataOptions {
  enabled?: boolean
  refetchInterval?: number
}

export interface UseRecommendationsOptions {
  enabled?: boolean
  refetchOnMount?: boolean
}

// Input types for creating pattern data
export interface CreatePatternDataInput {
  userId: string
  tenantId: string
  date: Date
  energy: number
  focus: number
  fulfillment: number
}

export interface CreateRecommendationInput {
  userId: string
  tenantId: string
  recommendation: string
  reasoning: string
  dataPoint?: any
}
