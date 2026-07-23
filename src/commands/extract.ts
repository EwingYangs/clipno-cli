import type { Command } from 'commander'
import { apiFetch } from '../api.js'

export interface ExtractPayload {
  title: string
  author: string
  image: string
  favicon: string
  publishedDate: string
  tags: string[]
  source: string
  resourceType: string | string[]
  sourceIcon: string
  contentMarkdown: string
  postImages: string[]
  video: string
}

export function formatExtract(payload: ExtractPayload, markdown: boolean): string {
  return markdown ? (payload.contentMarkdown ?? '') : JSON.stringify(payload, null, 2)
}

export function registerExtract(program: Command): void {
  program
    .command('extract <url>')
    .description('Extract a URL into structured data (JSON by default)')
    .option('--markdown', 'output only the content markdown')
    .action(async (url: string, opts: { markdown?: boolean }) => {
      const payload = await apiFetch<ExtractPayload>('/api/extractComplete', {
        method: 'POST',
        body: { url },
      })
      process.stdout.write(formatExtract(payload, !!opts.markdown) + '\n')
    })
}
