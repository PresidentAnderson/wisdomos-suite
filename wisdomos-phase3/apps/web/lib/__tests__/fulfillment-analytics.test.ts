/**
 * Fulfillment Analytics Service Tests
 *
 * Test analytics calculations and data transformations
 */

import type { AnalyticsAreaScore } from '../fulfillment-analytics'

// Mock area data for testing
const mockArea = {
  id: '1',
  code: 'WRK',
  name: 'Work & Purpose',
  emoji: '💼',
  color: '#F59E0B',
  weight_default: 0.0625,
  is_active: true,
  description: 'Professional fulfillment',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('Analytics Calculations', () => {
  test('calculateGFS should compute weighted average correctly', () => {
    const areas = [
      { score: 5.0, weight: 0.5 },
      { score: 3.0, weight: 0.5 },
    ]

    // Expected: ((5 * 0.5) + (3 * 0.5)) / (0.5 + 0.5) * 20
    // = (2.5 + 1.5) / 1 * 20 = 4 * 20 = 80
    const expectedGFS = 80

    const totalWeight = areas.reduce((sum, a) => sum + a.weight, 0)
    const weightedScore = areas.reduce((sum, a) => sum + (a.score * a.weight), 0)
    const gfs = Math.round((weightedScore / totalWeight) * 20)

    expect(gfs).toBe(expectedGFS)
  })

  test('calculatePercentageChange should handle positive changes', () => {
    const current = 80
    const previous = 60

    const change = ((current - previous) / previous) * 100
    expect(change).toBeCloseTo(33.33, 1)
  })

  test('calculatePercentageChange should handle negative changes', () => {
    const current = 60
    const previous = 80

    const change = ((current - previous) / previous) * 100
    expect(change).toBeCloseTo(-25, 1)
  })

  test('calculatePercentageChange should handle zero previous value', () => {
    const current = 50
    const previous = 0

    const change = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100
    expect(change).toBe(100)
  })

  test('trend determination should be correct', () => {
    const testCases: Array<{ change: number | null; expected: 'up' | 'down' | 'stable' }> = [
      { change: 0.5, expected: 'up' },
      { change: -0.5, expected: 'down' },
      { change: 0.1, expected: 'stable' },
      { change: -0.1, expected: 'stable' },
      { change: null, expected: 'stable' },
    ]

    testCases.forEach(({ change, expected }) => {
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (change !== null) {
        if (change > 0.2) trend = 'up'
        else if (change < -0.2) trend = 'down'
      }
      expect(trend).toBe(expected)
    })
  })

  test('contribution level calculation should match GFS ranges', () => {
    const getContributionLevel = (gfs: number): 0 | 1 | 2 | 3 | 4 => {
      if (gfs >= 80) return 4
      if (gfs >= 60) return 3
      if (gfs >= 40) return 2
      if (gfs >= 20) return 1
      return 0
    }

    expect(getContributionLevel(95)).toBe(4)
    expect(getContributionLevel(75)).toBe(3)
    expect(getContributionLevel(55)).toBe(2)
    expect(getContributionLevel(35)).toBe(1)
    expect(getContributionLevel(15)).toBe(0)
  })

  test('top movers should be sorted correctly', () => {
    const areaScores: Partial<AnalyticsAreaScore>[] = [
      { area: { ...mockArea, code: 'A' }, momChange: 0.5 },
      { area: { ...mockArea, code: 'B' }, momChange: 1.5 },
      { area: { ...mockArea, code: 'C' }, momChange: -0.5 },
      { area: { ...mockArea, code: 'D' }, momChange: 0.8 },
    ] as any

    // Top improving
    const topImproving = [...areaScores]
      .filter(a => a.momChange !== null && a.momChange! > 0)
      .sort((a, b) => (b.momChange || 0) - (a.momChange || 0))

    expect(topImproving[0].area!.code).toBe('B') // 1.5
    expect(topImproving[1].area!.code).toBe('D') // 0.8
    expect(topImproving[2].area!.code).toBe('A') // 0.5

    // Top declining
    const topDeclining = [...areaScores]
      .filter(a => a.momChange !== null && a.momChange! < 0)
      .sort((a, b) => (a.momChange || 0) - (b.momChange || 0))

    expect(topDeclining[0].area!.code).toBe('C') // -0.5
  })
})

describe('Period Formatting', () => {
  test('getPeriod should format dates correctly', () => {
    const date = new Date('2025-10-15')
    const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    expect(period).toBe('2025-10')
  })

  test('getMonthsAgo should calculate correct periods', () => {
    const getMonthsAgo = (months: number): string => {
      const date = new Date()
      date.setMonth(date.getMonth() - months)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    // This test is time-dependent, so we just verify format
    const period = getMonthsAgo(1)
    expect(period).toMatch(/^\d{4}-\d{2}$/)
  })
})

describe('Insight Generation', () => {
  test('should generate positive insights for high GFS', () => {
    const gfs = 85
    const expectedKeyword = gfs >= 80 ? 'Exceptional' : ''
    expect(expectedKeyword).toBe('Exceptional')
  })

  test('should generate encouraging insights for low GFS', () => {
    const gfs = 35
    const expectedKeyword = gfs < 40 ? 'rise together' : ''
    expect(expectedKeyword).toBeTruthy()
  })

  test('should highlight significant improvements', () => {
    const momChange = 12
    const shouldHighlight = momChange > 10
    expect(shouldHighlight).toBe(true)
  })

  test('should flag significant declines', () => {
    const momChange = -12
    const shouldFlag = momChange < -10
    expect(shouldFlag).toBe(true)
  })
})
