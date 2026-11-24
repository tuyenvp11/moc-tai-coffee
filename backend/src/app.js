import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { handleApi } from './http/api.js';
export function createApp({ frontendDirectory = fileURLToPath(new URL('../../frontend/dist/', import.meta.url)) } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => { res.set('X-Content-Type-Options', 'nosniff'); res.set('Referrer-Policy', 'strict-origin-when-cross-origin'); next(); });
  // Vite proxies /api in development; production uses the same origin. No broad CORS grants.
  app.use('/api', express.raw({ type: () => true, limit: '16kb' }), async (req, res, next) => {
    try {
      const options = { method: req.method, headers: { 'content-type': req.headers['content-type'] || '' } };
      if (!['GET', 'HEAD'].includes(req.method) && req.body?.length) options.body = req.body;
      const response = await handleApi(new Request(new URL(req.originalUrl, 'http://localhost'), options));
      res.status(response.status);
      response.headers.forEach((value, key) => res.set(key, value));
      res.send(Buffer.from(await response.arrayBuffer()));
    } catch (error) { next(error); }
  });
  if (frontendDirectory && existsSync(frontendDirectory + '/index.html')) {
    app.use(express.static(frontendDirectory));
    app.get('/{*path}', (req, res) => {
      if (req.path.split('/').pop().includes('.')) return res.status(404).send('Not found');
      res.sendFile(frontendDirectory + '/index.html');
    });
  }
  app.use((_req, res) => res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy đường dẫn.' } }));
  app.use((error, _req, res, _next) => {
    const large = error.type === 'entity.too.large';
    if (!large) console.error(error);
    res.status(large ? 413 : 500).json({ error: {
      code: large ? 'PAYLOAD_TOO_LARGE' : 'INTERNAL_ERROR',
      message: large ? 'Dữ liệu gửi lên quá lớn.' : 'Có lỗi xảy ra. Vui lòng thử lại sau.',
    } });
  });
  return app;
}
