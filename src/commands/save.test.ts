import { describe, expect, it } from 'vitest'
import { buildSaveBody, formatSaveResult } from './save.js'

describe('buildSaveBody', () => {
  it('minimal body has url only', () => {
    expect(buildSaveBody('https://a.com', {})).toEqual({ url: 'https://a.com' })
  })
  it('splits --tags by comma and trims', () => {
    const body = buildSaveBody('https://a.com', { tags: 'ai, notion ,cli' })
    expect(body.tags).toEqual(['ai', 'notion', 'cli'])
  })
  it('passes note and title through', () => {
    const body = buildSaveBody('https://a.com', { note: 'n', title: 't' })
    expect(body.note).toBe('n')
    expect(body.title).toBe('t')
  })
})

describe('formatSaveResult', () => {
  const res = { success: true, message: 'ok', pageUrl: 'https://notion.so/x', title: 'T' }
  it('human output has title and pageUrl', () => {
    const out = formatSaveResult(res, false)
    expect(out).toContain('T')
    expect(out).toContain('https://notion.so/x')
  })
  it('--json outputs raw JSON', () => {
    expect(JSON.parse(formatSaveResult(res, true)).pageUrl).toBe('https://notion.so/x')
  })
})
