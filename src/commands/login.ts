import type { Command } from 'commander'
import { createServer } from 'node:http'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { hostname } from 'node:os'
import type { AddressInfo } from 'node:net'
import { saveToken, WEB_URL } from '../config.js'

const LOGIN_TIMEOUT_MS = 120_000

export function parseCallback(reqUrl: string, expectedState: string): string {
  const url = new URL(reqUrl, 'http://127.0.0.1')
  if (url.searchParams.get('state') !== expectedState) {
    throw new Error('State mismatch — possible forged callback. Aborting.')
  }
  const code = url.searchParams.get('code')
  if (!code) throw new Error('Callback is missing the authorization code.')
  return code
}

function openBrowser(url: string): void {
  const [cmd, args] =
    process.platform === 'darwin' ? ['open', [url]] as const :
    process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] as const :
    ['xdg-open', [url]] as const
  try {
    spawn(cmd, [...args], { stdio: 'ignore', detached: true }).unref()
  } catch {
    // Non-fatal: the URL is printed for manual opening.
  }
}

const SUCCESS_HTML = `<!doctype html><meta charset="utf-8"><title>clipno</title>
<body style="font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0">
<div style="text-align:center"><h1>✓ Authorized</h1><p>You can close this tab and return to your terminal.</p></div>`

function waitForCallback(state: string): Promise<{ code: string; port: number }> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      if (!req.url?.startsWith('/callback')) {
        res.writeHead(404).end()
        return
      }
      try {
        const code = parseCallback(req.url, state)
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(SUCCESS_HTML)
        clearTimeout(timer)
        server.close()
        resolve({ code, port })
      } catch (err) {
        res.writeHead(400).end('Bad request')
        clearTimeout(timer)
        server.close()
        reject(err)
      }
    })
    let port = 0
    const timer = setTimeout(() => {
      server.close()
      reject(new Error('Timed out waiting for browser authorization (120s).\nIf this machine has no browser (SSH/CI), create a token at https://clipno.app/dashboard/tokens and run:\n  clipno login --token <clipno_pat_...>'))
    }, LOGIN_TIMEOUT_MS)
    server.listen(0, '127.0.0.1', () => {
      port = (server.address() as AddressInfo).port
      const state0 = state
      const name = encodeURIComponent(`CLI @ ${hostname()}`)
      const authorizeUrl = `${WEB_URL}/cli/authorize?port=${port}&state=${state0}&name=${name}`
      process.stdout.write(`Opening browser to authorize…\n${authorizeUrl}\n(If the browser did not open, paste the URL manually.)\n`)
      openBrowser(authorizeUrl)
    })
  })
}

async function exchangeCode(code: string): Promise<string> {
  const res = await fetch(`${WEB_URL}/api/cli/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string }
  if (!res.ok || !data.token) {
    throw new Error(data.error || `Token exchange failed (HTTP ${res.status})`)
  }
  return data.token
}

export function registerLogin(program: Command): void {
  program
    .command('login')
    .description('Authorize this machine via browser (or paste a token with --token)')
    .option('--token <token>', 'personal access token (clipno_pat_...)')
    .action(async (opts: { token?: string }) => {
      if (opts.token) {
        if (!opts.token.startsWith('clipno_pat_')) {
          throw new Error('Invalid token: expected it to start with clipno_pat_')
        }
        saveToken(opts.token)
        process.stdout.write('✓ Token saved. Run `clipno whoami` to verify.\n')
        return
      }
      const state = randomBytes(16).toString('hex')
      const { code } = await waitForCallback(state)
      process.stdout.write('Authorization received, exchanging code…\n')
      const token = await exchangeCode(code)
      saveToken(token)
      process.stdout.write('✓ Logged in. Token saved to ~/.config/clipno/config.json\n')
    })
}
