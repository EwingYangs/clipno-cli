import { Command } from 'commander'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../api.js'
import { buildSaveBody, formatSaveResult, registerSave } from './save.js'

vi.mock('../api.js', () => ({ apiFetch: vi.fn() }))

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
  it('omits enrichment switches when not specified', () => {
    const body = buildSaveBody('https://a.com', {})
    expect(body).not.toHaveProperty('transcribe')
    expect(body).not.toHaveProperty('extractImageText')
    expect(body).not.toHaveProperty('summarize')
  })
  it('maps enrichment switches to API fields, keeping explicit false', () => {
    expect(buildSaveBody('https://a.com', { transcribe: true, ocr: false, summarize: true })).toEqual({
      url: 'https://a.com',
      transcribe: true,
      extractImageText: false,
      summarize: true,
    })
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

describe('save command flags', () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset().mockResolvedValue({ success: true, message: 'ok' })
    vi.spyOn(process.stdout, 'write').mockImplementation(() => true)
  })

  async function sentBody(...args: string[]) {
    const program = new Command()
    registerSave(program)
    await program.parseAsync(['save', 'https://a.com', ...args], { from: 'user' })
    return (vi.mocked(apiFetch).mock.calls[0][1] as { body: Record<string, unknown> }).body
  }

  it('sends no enrichment fields by default', async () => {
    expect(await sentBody()).toEqual({ url: 'https://a.com' })
  })
  it('--transcribe --ocr --summarize send true', async () => {
    expect(await sentBody('--transcribe', '--ocr', '--summarize')).toMatchObject({
      transcribe: true,
      extractImageText: true,
      summarize: true,
    })
  })
  it('--no-* flags send false', async () => {
    expect(await sentBody('--no-transcribe', '--no-ocr', '--no-summarize')).toMatchObject({
      transcribe: false,
      extractImageText: false,
      summarize: false,
    })
  })
})
