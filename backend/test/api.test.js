import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../src/app.js';
import { handleApi } from '../src/http/api.js';
let server, base;
before(async () => {
  server = createApp({ frontendDirectory: null }).listen(0, '127.0.0.1');
  await once(server, 'listening'); base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); }));
async function request(path, payload) {
  const response = await fetch(base + path, payload === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  return { status: response.status, body: await response.json() };
}
test('homepage data identifies the brand and supplies galleries and category counts', async () => {
  const { status, body } = await request('/api/home');
  assert.equal(status, 200); assert.equal(body.data.store.name, 'Mộc Tại Coffee');
  assert.equal(body.data.slides.length, 3); assert.equal(body.data.categories.reduce((sum, c) => sum + c.count, 0), 6);
});
test('category filtering, accent-insensitive search and pagination run on the server', async () => {
  const { body } = await request('/api/menu?category=coffee&q=ca%20phe&limit=1');
  assert.equal(body.data.length, 1); assert.equal(body.data[0].categoryId, 'coffee'); assert.equal(body.meta.total, 1);
  const first = await request('/api/menu?limit=3'); const second = await request('/api/menu?limit=3&page=2');
  assert.equal(first.body.meta.total, 6); assert.equal(second.body.data.length, 3);
  assert.ok(!first.body.data.some(p => second.body.data.some(q => p.id === q.id)));
});
test('unknown categories, invalid pages and duplicate parameters are rejected', async () => {
  for (const query of ['category=invalid','page=0','page=1.5','limit=100','limit=0','page=1&page=2']) {
    const r = await request('/api/menu?' + query); assert.equal(r.status, 400, query);
  }
});
test('quote derives the price and size surcharge from the catalog, ignoring client prices', async () => {
  const r = await request('/api/quotes', { items: [{ productId: 'ca-phe-sua-moc-tai', quantity: 2, variantId: 'large', unitPrice: 1 }], total: 1 });
  assert.equal(r.status, 200); assert.equal(r.body.data.total, 110000); assert.equal(r.body.data.items[0].unitPrice, 55000);
});
test('quotes consolidate duplicate lines and enforce the combined quantity cap', async () => {
  const item = { productId: 'latte', quantity: 2 };
  const r = await request('/api/quotes', { items: [item,item] });
  assert.equal(r.body.data.items.length, 1); assert.equal(r.body.data.total, 200000);
  const over = await request('/api/quotes', { items: [{...item,quantity:15},{...item,quantity:15}] }); assert.equal(over.status, 400);
});
test('quote rejects invalid quantities, missing products and invalid variants', async () => {
  for (const quantity of [0,-1,1.5,'2',21]) assert.equal((await request('/api/quotes', { items: [{ productId:'latte',quantity }] })).status,400);
  assert.equal((await request('/api/quotes',{items:[]})).status,400);
  assert.equal((await request('/api/quotes',{items:[{productId:'missing',quantity:1}]})).status,404);
  assert.equal((await request('/api/quotes',{items:[{productId:'croissant-bo',quantity:1,variantId:'large'}]})).status,400);
});
test('malformed and oversized JSON, unsupported media types and methods have stable errors', async () => {
  const malformed = await fetch(base+'/api/quotes',{method:'POST',headers:{'content-type':'application/json'},body:'{'});
  assert.equal(malformed.status,400); assert.equal((await malformed.json()).error.code,'INVALID_JSON');
  const tooBig = await fetch(base+'/api/quotes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({ text:'a'.repeat(17000) })}); assert.equal(tooBig.status,413);
  assert.equal((await fetch(base+'/api/quotes',{method:'POST',body:'hi'})).status,415);
  assert.equal((await fetch(base+'/api/menu',{method:'POST'})).status,405);
  assert.equal((await fetch(base+'/api/quotes')).status,405);
  assert.equal((await fetch(base+'/api/missing')).status,404);
});
test('Node and Worker adapters expose the same catalog contract', async () => {
  for (const path of ['/api/menu?category=tea','/api/home','/api/menu/missing']) {
    const local = await request(path); const worker = await handleApi(new Request('https://example.test'+path));
    assert.equal(local.status, worker.status); assert.deepEqual(local.body, await worker.json());
  }
  const head = await handleApi(new Request('https://example.test/api/menu',{method:'HEAD'})); assert.equal(await head.text(),'');
});
