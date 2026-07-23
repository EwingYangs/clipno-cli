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

  it('maps 403 without a code field (sync save quota shape) to upgrade hint', async () => {
    mockFetch(403, { error: 'Monthly limit reached', message: 'Monthly limit reached', remaining: 0, is_vip: false })
    const { apiFetch } = await import('./api.js')
    await expect(apiFetch('/api/save')).rejects.toThrow(/50 saves\/month/)
  })

  it('maps AUTH_MISSING (Notion not connected) to the connect-Notion hint', async () => {
    mockFetch(400, { error: 'Notion not connected. Please authorize Notion first.', message: 'Notion not connected. Please authorize Notion first.', code: 'AUTH_MISSING' })
    const { apiFetch } = await import('./api.js')
    await expect(apiFetch('/api/save', { method: 'POST', body: { url: 'https://a.com' } }))
      .rejects.toThrow(/clipno\.app\/dashboard\/notion/)
  })

  it('maps AUTH_INVALID (stale Notion token) to the connect-Notion hint', async () => {
    mockFetch(500, { error: 'Failed to retrieve Notion token', message: 'Failed to retrieve Notion token', code: 'AUTH_INVALID' })
    const { apiFetch } = await import('./api.js')
    await expect(apiFetch('/api/save', { method: 'POST', body: { url: 'https://a.com' } }))
      .rejects.toThrow(/clipno\.app\/dashboard\/notion/)
  })
})
