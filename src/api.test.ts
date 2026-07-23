import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

function mockFetch(status: number, json: unknown) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => json,
  })))
}

beforeEach(() => { process.env.CLIPNO_TOKEN = 'clipno_pat_test' })
afterEach(() => { vi.unstubAllGlobals(); delete process.env.CLIPNO_TOKEN })

describe('apiFetch', () => {
  it('sends Authorization header and returns JSON', async () => {
    mockFetch(200, { success: true })
    const { apiFetch } = await import('./api.js')
    const result = await apiFetch<{ success: boolean }>('/api/save', { method: 'POST', body: { url: 'https://a.com' } })
    expect(result.success).toBe(true)
    const call = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(call[0]).toContain('/api/save')
    expect(call[1].headers.Authorization).toBe('Bearer clipno_pat_test')
  })

  it('throws login hint when no token', async () => {
    delete process.env.CLIPNO_TOKEN
    process.env.CLIPNO_CONFIG_DIR = '/nonexistent-clipno-dir'
    const { apiFetch, ApiError } = await import('./api.js')
    await expect(apiFetch('/api/save')).rejects.toThrow(/clipno login/)
    delete process.env.CLIPNO_CONFIG_DIR
  })

  it('maps 401 to re-login hint', async () => {
    mockFetch(401, { error: 'Invalid or revoked personal access token', message: 'Invalid or revoked personal access token' })
    const { apiFetch } = await import('./api.js')
    await expect(apiFetch('/api/save')).rejects.toThrow(/clipno login/)
  })

  it('maps QUOTA_EXCEEDED to upgrade hint', async () => {
    mockFetch(403, { error: 'Monthly limit reached', message: 'Monthly limit reached', code: 'QUOTA_EXCEEDED' })
    const { apiFetch } = await import('./api.js')
    await expect(apiFetch('/api/save')).rejects.toThrow(/50 saves\/month/)
  })
})
