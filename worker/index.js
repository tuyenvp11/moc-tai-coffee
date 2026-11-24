import assets from 'virtual:assets';
import { handleApi } from '../backend/src/http/api.js';
// Sites uses a Fetch runtime. Domain services and API validation are shared with Node/Express.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return handleApi(request);
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{allow:'GET, HEAD'}});
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch { return new Response('Bad request',{status:400}); }
    let asset = assets[pathname === '/' ? '/index.html' : pathname];
    if (!asset && !pathname.split('/').pop().includes('.')) asset = assets['/index.html'];
    if (!asset) return new Response('Not found',{status:404});
    const headers = { 'content-type':asset.type, etag:asset.etag,
      'cache-control':asset.type.startsWith('text/html') ? 'no-cache' : 'public, max-age=3600',
      'x-content-type-options':'nosniff', 'referrer-policy':'strict-origin-when-cross-origin' };
    if (request.headers.get('if-none-match') === asset.etag) return new Response(null,{status:304,headers});
    const bytes = request.method === 'HEAD' ? null : Uint8Array.from(atob(asset.data), char=>char.charCodeAt(0));
    return new Response(bytes,{headers});
  },
};
