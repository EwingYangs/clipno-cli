import type { Command } from 'commander'
import { apiFetch } from '../api.js'
import { clearToken, getToken } from '../config.js'

export function registerSession(program: Command): void {
  program
    .command('whoami')
    .description('Verify the stored token against the clipno API')
    .action(async () => {
      const token = getToken()
      if (!token) {
        process.stderr.write('Not logged in. Run `clipno login` first.\n')
        process.exit(1)
      }
      await apiFetch('/api/database-config')
      process.stdout.write(`✓ Token valid (${token.slice(0, 16)}…)\n`)
    })

  program
    .command('logout')
    .description('Delete the locally stored token')
    .action(() => {
      const removed = clearToken()
      process.stdout.write(removed ? 'Logged out.\n' : 'No stored credentials.\n')
      if (process.env.CLIPNO_TOKEN) {
        process.stdout.write('Note: CLIPNO_TOKEN env var is still set and takes precedence.\n')
      }
    })
}
