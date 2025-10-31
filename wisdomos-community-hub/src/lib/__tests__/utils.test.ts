import { describe, expect, it } from 'vitest'
import { slugify, validateEmail } from '../utils'

describe('utils', () => {
  it('slugify converts text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('validateEmail checks format', () => {
    expect(validateEmail('test@example.com')).toBe(true)
    expect(validateEmail('invalid-email')).toBe(false)
  })
})
