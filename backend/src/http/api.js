import { ApiError, getCategories, getHome, getProduct, getStore, listMenu, createQuote } from '../services/catalog-service.js';
const MAX_BODY_BYTES = 16384;
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
    'x-content-type-options': 'nosniff', ...headers },
});
async function readJson(request) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
    throw new ApiError(415, 'UNSUPPORTED_MEDIA_TYPE', 'Yêu cầu Content-Type application/json.');
  }
  const reader = request.body?.getReader();
  const chunks = []; let length = 0;
  if (reader) {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > MAX_BODY_BYTES) { await reader.cancel(); throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'Dữ liệu gửi lên quá lớn.'); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
  }
  const bytes = new Uint8Array(length); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new ApiError(400, 'INVALID_JSON', 'Nội dung JSON không hợp lệ.'); }
}
export async function handleApi(request) {
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '');
    const readRoutes = {
      '/api/health': () => ({ status: 'ok', service: 'moc-tai-api' }),
      '/api/home': () => ({ data: getHome() }),
      '/api/store': () => ({ data: getStore() }),
      '/api/categories': () => ({ data: getCategories() }),
      '/api/gallery': () => ({ data: getStore().gallery }),
      '/api/menu': () => listMenu(url.searchParams),
    };
    const detail = /^\/api\/menu\/([^/]+)$/.exec(path);
    if (path in readRoutes || detail) {
      if (!['GET', 'HEAD'].includes(request.method)) return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Phương thức không được hỗ trợ.' } }, 405, { allow: 'GET, HEAD' });
      let body;
      if (detail) {
        let id;
        try { id = decodeURIComponent(detail[1]); } catch { throw new ApiError(400, 'INVALID_PATH', 'Đường dẫn không hợp lệ.'); }
        body = { data: getProduct(id) };
      } else body = readRoutes[path]();
      const response = json(body);
      return request.method === 'HEAD' ? new Response(null, { headers: response.headers }) : response;
    }
    if (path === '/api/quotes') {
      if (request.method !== 'POST') return json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Yêu cầu POST để tính giá.' } }, 405, { allow: 'POST' });
      return json({ data: createQuote(await readJson(request)) });
    }
    return json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy API.' } }, 404);
  } catch (error) {
    if (error instanceof ApiError) return json({ error: { code: error.code, message: error.message } }, error.status);
    console.error('API error:', error);
    return json({ error: { code: 'INTERNAL_ERROR', message: 'Có lỗi xảy ra. Vui lòng thử lại sau.' } }, 500);
  }
}
