const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export class ApiClientError extends Error {
  constructor(message, status, code) { super(message); this.name = 'ApiClientError'; this.status = status; this.code = code; }
}
export async function api(path, { method = 'GET', body, signal } = {}) {
  const response = await fetch(API_BASE + path, {
    method, signal,
    headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let payload;
  try { payload = await response.json(); }
  catch { throw new ApiClientError('Không thể đọc dữ liệu. Vui lòng thử lại.', response.status, 'INVALID_RESPONSE'); }
  if (!response.ok) throw new ApiClientError(payload.error?.message || 'Không thể kết nối với Mộc Tại. Vui lòng thử lại.', response.status, payload.error?.code);
  return payload;
}
