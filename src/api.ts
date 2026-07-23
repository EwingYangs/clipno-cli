import { API_URL, getToken } from './config.js'

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message)
  }
}

export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken()
  if (!token) {
    throw new ApiError('Not logged in. Run `clipno login` first.', 401)
  }

  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>

  if (!res.ok) {
    const message =
      (typeof data.message === 'string' && data.message) ||
      (typeof data.error === 'string' && data.error) ||
      `Request failed with HTTP ${res.status}`
    const code = typeof data.code === 'string' ? data.code : undefined

    if (res.status === 401) {
      throw new ApiError(`${message}\nRun \`clipno login\` to re-authenticate.`, 401, code)
    }
    if (res.status === 403) {
      // All 403s from this API are quota/limit related (e.g. QUOTA_EXCEEDED on the
      // async path, or the sync save path's bare `{ error, message, remaining, is_vip }`
      // shape with no `code` field). Always append the upgrade hint.
      throw new ApiError(
        `${message}\nFree plan includes 50 saves/month. Upgrade: https://clipno.app/#pricing`,
        403,
        code,
      )
    }
    throw new ApiError(message, res.status, code)
  }

  return data as T
}
