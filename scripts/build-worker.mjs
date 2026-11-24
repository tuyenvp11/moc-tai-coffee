import { readdir, readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
const root = fileURLToPath(new URL('../',import.meta.url));
const frontend = path.join(root,'frontend/dist');
const output = path.join(root,'dist');
const mime = { '.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp','.woff2':'font/woff2' };
const assets = {};
async function collect(dir) {
  for (const entry of await readdir(dir,{ withFileTypes:true })) {
    const file = path.join(dir,entry.name);
    if (entry.isDirectory()) await collect(file);
    else {
      const bytes = await readFile(file);
      assets['/' + path.relative(frontend,file).split(path.sep).join('/')] = {
        data:bytes.toString('base64'), type:mime[path.extname(file)] || 'application/octet-stream',
        etag:'"' + createHash('sha256').update(bytes).digest('hex') + '"',
      };
    }
  }
}
await collect(frontend);
if (!assets['/index.html']) throw new Error('Missing React build. Run npm run build --workspace frontend first.');
await rm(output,{ recursive:true,force:true });
await mkdir(path.join(output,'server'),{ recursive:true });
await build({
  entryPoints:[path.join(root,'worker/index.js')], outfile:path.join(output,'server/index.js'),
  bundle:true, format:'esm', platform:'browser', target:'es2022', minify:true,
  plugins:[{name:'embedded-assets',setup(builder){
    builder.onResolve({filter:/^virtual:assets$/},()=>({path:'virtual:assets',namespace:'embedded'}));
    builder.onLoad({filter:/.*/,namespace:'embedded'},()=>({contents:'export default '+JSON.stringify(assets),loader:'js'}));
  }}],
});
await mkdir(path.join(output,'.openai'),{recursive:true});
await writeFile(path.join(output,'.openai/hosting.json'),await readFile(path.join(root,'.openai/hosting.json')));
console.log(`Built Worker adapter with ${Object.keys(assets).length} React assets. Node/Express remains available via npm start.`);
