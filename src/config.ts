import { homedir } from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

export const API_URL = process.env.CLIPNO_API_URL || 'https://api.clipno.app'
export const WEB_URL = process.env.CLIPNO_WEB_URL || 'https://clipno.app'

function configDir(): string {
  return process.env.CLIPNO_CONFIG_DIR || path.join(homedir(), '.config', 'clipno')
}

function configPath(): string {
  return path.join(configDir(), 'config.json')
}

function readConfig(): { token?: string } {
  try {
    return JSON.parse(fs.readFileSync(configPath(), 'utf8'))
  } catch {
    return {}
  }
}

export function getToken(): string | undefined {
  return process.env.CLIPNO_TOKEN || readConfig().token
}

export function saveToken(token: string): void {
  fs.mkdirSync(configDir(), { recursive: true, mode: 0o700 })
  fs.writeFileSync(configPath(), JSON.stringify({ token }, null, 2) + '\n', { mode: 0o600 })
}

export function clearToken(): boolean {
  try {
    fs.unlinkSync(configPath())
    return true
  } catch {
    return false
  }
}
