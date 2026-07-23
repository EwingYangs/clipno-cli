import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, statSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

let dir: string

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'clipno-test-'))
  process.env.CLIPNO_CONFIG_DIR = dir
  delete process.env.CLIPNO_TOKEN
})

afterEach(() => {
  rmSync(dir, { recursive: true, force: true })
  delete process.env.CLIPNO_CONFIG_DIR
})

describe('config', () => {
  it('saveToken then getToken round-trips', async () => {
    const { saveToken, getToken } = await import('./config.js')
    saveToken('clipno_pat_abc')
    expect(getToken()).toBe('clipno_pat_abc')
  })

  it('config file has 0600 permissions', async () => {
    const { saveToken } = await import('./config.js')
    saveToken('clipno_pat_abc')
    const mode = statSync(path.join(dir, 'config.json')).mode & 0o777
    expect(mode).toBe(0o600)
  })

  it('CLIPNO_TOKEN env overrides file', async () => {
    const { saveToken, getToken } = await import('./config.js')
    saveToken('clipno_pat_file')
    process.env.CLIPNO_TOKEN = 'clipno_pat_env'
    expect(getToken()).toBe('clipno_pat_env')
  })

  it('clearToken removes the file', async () => {
    const { saveToken, clearToken, getToken } = await import('./config.js')
    saveToken('clipno_pat_abc')
    expect(clearToken()).toBe(true)
    expect(getToken()).toBeUndefined()
    expect(clearToken()).toBe(false)
  })
})
