import type { Command } from 'commander'
import { apiFetch } from '../api.js'

export interface SaveResponse {
  success: boolean
  message: string
  pageUrl?: string
  pageId?: string
  title?: string
}

export function buildSaveBody(
  url: string,
  opts: { tags?: string; note?: string; title?: string },
): Record<string, unknown> {
  const body: Record<string, unknown> = { url }
  if (opts.tags) body.tags = opts.tags.split(',').map((t) => t.trim()).filter(Boolean)
  if (opts.note) body.note = opts.note
  if (opts.title) body.title = opts.title
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
    .option('--json', 'output the raw API response as JSON')
    .action(async (url: string, opts: { tags?: string; note?: string; title?: string; json?: boolean }) => {
      const res = await apiFetch<SaveResponse>('/api/save', {
        method: 'POST',
        body: buildSaveBody(url, opts),
      })
      process.stdout.write(formatSaveResult(res, !!opts.json) + '\n')
    })
}
