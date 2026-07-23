import { describe, expect, it } from 'vitest'
import { parseCallback } from './login.js'

describe('parseCallback', () => {
  it('extracts code when state matches', () => {
    expect(parseCallback('/callback?code=abc&state=s1', 's1')).toBe('abc')
  })
  it('throws on state mismatch', () => {
    expect(() => parseCallback('/callback?code=abc&state=evil', 's1')).toThrow(/state/i)
  })
  it('throws when code missing', () => {
    expect(() => parseCallback('/callback?state=s1', 's1')).toThrow(/code/i)
  })
})
