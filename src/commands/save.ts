import type { Command } from 'commander'
import { apiFetch } from '../api.js'

export interface SaveResponse {
  success: boolean
  message: string
  pageUrl?: string
  pageId?: string
  title?: string
}

export interface SaveOptions {
  tags?: string
  note?: string
  title?: string
  /** Enrichment switches: undefined = not specified, fall back to account settings on the server. */
  transcribe?: boolean
  ocr?: boolean
  summarize?: boolean
}

export function buildSaveBody(url: string, opts: SaveOptions): Record<string, unknown> {
  const body: Record<string, unknown> = { url }
  if (opts.tags) body.tags = opts.tags.split(',').map((t) => t.trim()).filter(Boolean)
  if (opts.note) body.note = opts.note
  if (opts.title) body.title = opts.title
  // Only send switches the user set explicitly. Omitted transcribe/extractImageText fall back
  // to account settings on the server; omitted summarize means no summary.
  if (typeof opts.transcribe === 'boolean') body.transcribe = opts.transcribe
  if (typeof opts.ocr === 'boolean') body.extractImageText = opts.ocr
  if (typeof opts.summarize === 'boolean') body.summarize = opts.summarize
  return body
}

export function formatSaveResult(res: SaveResponse, json: boolean): string {
  if (json) return JSON.stringify(res, null, 2)
  const lines = [`✓ Saved${res.title ? `: ${res.title}` : ''}`]
  if (res.pageUrl) lines.push(res.pageUrl)
  return lines.join('\n')
}

export function registerSave(program: Command): void {
  program
    .command('save <url>')
    .description('Save a link to your Notion database')
    .option('--tags <tags>', 'comma-separated tags')
    .option('--note <note>', 'note to attach')
    .option('--title <title>', 'override the page title')
    .option('--transcribe', 'transcribe video/audio (default: your account setting)')
    .option('--no-transcribe', 'skip transcription')
    .option('--ocr', 'extract text from images (default: your account setting)')
    .option('--no-ocr', 'skip image text extraction')
    .option('--summarize', 'add an AI summary (default: off)')
    .option('--no-summarize', 'skip the AI summary')
    .option('--json', 'output the raw API response as JSON')
    .action(async (url: string, opts: SaveOptions & { json?: boolean }) => {
      const res = await apiFetch<SaveResponse>('/api/save', {
        method: 'POST',
        body: buildSaveBody(url, opts),
      })
      process.stdout.write(formatSaveResult(res, !!opts.json) + '\n')
    })
}
