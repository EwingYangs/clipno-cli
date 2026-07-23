import { describe, expect, it } from 'vitest'
import { formatExtract, type ExtractPayload } from './extract.js'

const payload: ExtractPayload = {
  title: 'T', author: 'A', image: '', favicon: '', publishedDate: '',
  tags: ['x'], source: 'X', resourceType: 'Post', sourceIcon: '',
  contentMarkdown: '# body', postImages: [], video: '',
}

describe('formatExtract', () => {
  it('default outputs pretty JSON', () => {
    const out = formatExtract(payload, false)
    expect(JSON.parse(out).title).toBe('T')
  })
  it('--markdown outputs only contentMarkdown', () => {
    expect(formatExtract(payload, true)).toBe('# body')
  })
})
