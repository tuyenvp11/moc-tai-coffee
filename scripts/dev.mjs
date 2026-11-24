import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createApp } from '../backend/src/app.js';
const frontendRoot = fileURLToPath(new URL('../frontend/', import.meta.url));
const apiPort = Number(process.env.API_PORT || 3001);
let backend, vite, stopping = false;
async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  await vite?.close();
  if (backend) {
    backend.closeAllConnections();
    await new Promise(resolve => backend.close(resolve));
  }
  process.exitCode = code;
}
process.on('SIGINT', () => { void stop(); });
process.on('SIGTERM', () => { void stop(); });
try {
  backend = createApp({ frontendDirectory: null }).listen(apiPort, '127.0.0.1');
  await once(backend, 'listening');
  console.log(`Mộc Tại API: http://127.0.0.1:${apiPort}`);
  // Vite handles frontend HMR. Restart this command after changing backend code.
  vite = await createServer({
    root: frontendRoot,
    configFile: fileURLToPath(new URL('../frontend/vite.config.js', import.meta.url)),
    server: { host:'0.0.0.0', port:Number(process.env.PORT || 5173), strictPort:true,
      proxy: { '/api': { target:`http://127.0.0.1:${apiPort}` } } },
  });
  await vite.listen(); vite.printUrls();
} catch (error) { console.error(error.message); await stop(1); }
