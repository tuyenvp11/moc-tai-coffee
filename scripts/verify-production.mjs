import { once } from 'node:events';
import assert from 'node:assert/strict';
import { createApp } from '../backend/src/app.js';
import worker from '../dist/server/index.js';
const server = createApp().listen(0,'127.0.0.1');
await once(server,'listening');
const origin = `http://127.0.0.1:${server.address().port}`;
let checks = 0;
try {
  const htmlResponse = await fetch(origin+'/');
  const html = await htmlResponse.text();
  assert.equal(htmlResponse.status,200); assert.match(html,/Mộc Tại Coffee/); assert.match(html,/id="root"/);
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match=>match[1]);
  for (const pathname of ['/',...assets,'/assets/coffee.jpg']) {
    const nodeResponse = await fetch(origin+pathname);
    const workerResponse = await worker.fetch(new Request('https://example.test'+pathname));
    assert.equal(nodeResponse.status,200,pathname); assert.equal(workerResponse.status,200,pathname);
    assert.deepEqual(new Uint8Array(await nodeResponse.arrayBuffer()),new Uint8Array(await workerResponse.arrayBuffer()),pathname);
    const head = await worker.fetch(new Request('https://example.test'+pathname,{method:'HEAD'}));
    assert.equal(head.status,200); assert.equal(await head.text(),'');
    const etag = head.headers.get('etag');
    assert.equal((await worker.fetch(new Request('https://example.test'+pathname,{headers:{'if-none-match':etag}}))).status,304);
    checks++;
  }
  for (const pathname of ['/api/home','/api/menu?category=tea','/api/menu/not-a-product','/api/health']) {
    const nodeResponse = await fetch(origin+pathname);
    const workerResponse = await worker.fetch(new Request('https://example.test'+pathname));
    assert.equal(nodeResponse.status,workerResponse.status,pathname); assert.deepEqual(await nodeResponse.json(),await workerResponse.json(),pathname); checks++;
  }
  const payload = JSON.stringify({items:[{productId:'latte',quantity:3,variantId:'large'}]});
  const options = {method:'POST',headers:{'content-type':'application/json'},body:payload};
  const nodeQuote = await (await fetch(origin+'/api/quotes',options)).json();
  const workerQuote = await (await worker.fetch(new Request('https://example.test/api/quotes',options))).json();
  assert.deepEqual(nodeQuote,workerQuote); assert.equal(nodeQuote.data.total,180000); checks++;
  assert.equal((await fetch(origin+'/assets/missing.jpg')).status,404);
  assert.equal((await worker.fetch(new Request('https://example.test/assets/missing.jpg'))).status,404); checks++;
  const oversized = await worker.fetch(new Request('https://example.test/api/quotes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:'a'.repeat(17000)})}));
  assert.equal(oversized.status,413);checks++;
  console.log(`Production verified: ${checks} Node/Express and Worker checks passed; React HTML, JS, CSS, images and API routes are consistent.`);
} finally {
  await new Promise(resolve=>{server.close(resolve);server.closeAllConnections();});
}
