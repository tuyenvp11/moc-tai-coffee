import assert from 'node:assert/strict';
const origin = (process.argv[2] || 'http://127.0.0.1:8080').replace(/\/$/,'');
const fetchApp = (path, options = {}) => fetch(origin + path, { ...options, signal: AbortSignal.timeout(10000) });
const health = await fetchApp('/api/health');
assert.equal(health.status, 200); assert.equal((await health.json()).status,'ok');
const home = await fetchApp('/api/home');
assert.equal(home.status,200); assert.equal((await home.json()).data.store.name,'Mộc Tại Coffee');
const page = await fetchApp('/');
assert.equal(page.status,200); assert.match(page.headers.get('content-type'),/text\/html/);
const html = await page.text(); assert.match(html,/id="root"/);
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(match=>match[1]);
assert.ok(assets.some(path=>path.endsWith('.js')),'React JavaScript asset is present');
assert.ok(assets.some(path=>path.endsWith('.css')),'React stylesheet is present');
for (const path of [...new Set([...assets,'/assets/cafe.jpg'])]) {
  const response = await fetchApp(path); assert.equal(response.status,200,path);
  assert.ok((await response.arrayBuffer()).byteLength > 0,`${path} is not empty`);
  assert.ok(!response.headers.get('content-type').includes('text/html'),`${path} is served as an asset`);
}
const menu = await fetchApp('/api/menu?category=coffee&limit=1');
assert.equal(menu.status,200); const menuData=await menu.json();
assert.equal(menuData.data.length,1); assert.equal(menuData.data[0].categoryId,'coffee');
const product = menuData.data[0];
const quote = await fetchApp('/api/quotes',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({items:[{productId:product.id,quantity:2,variantId:'regular'}]})});
assert.equal(quote.status,200); assert.equal((await quote.json()).data.total,product.price*2);
assert.equal((await fetchApp('/api/not-found')).status,404);
console.log(`Docker smoke check passed: React HTML, JavaScript, CSS, photos, API, catalog filtering and server pricing at ${origin}.`);
