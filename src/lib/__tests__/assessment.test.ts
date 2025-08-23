import { describe, expect, it } from 'vitest'
import { calculateOverall } from '../assessment'

describe('calculateOverall', () => {
  it('calculates average of values and rounds to two decimals', () => {
    const items = { q1: 4, q2: 3.5, q3: 5 }
    expect(calculateOverall(items)).toBe(4.17)
  })

  it('ignores null or undefined values', () => {
    const items = { q1: 4, q2: null, q3: undefined, q4: 2 }
    expect(calculateOverall(items)).toBe(3)
  })

  it('returns 0 when there are no valid values', () => {
    const items = { q1: null, q2: undefined }
    expect(calculateOverall(items)).toBe(0)
  })
})
