import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
if (!process.argv[2]) await import('./build.mjs');
const root = resolve(process.argv[2] || 'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
createServer(async(req,res)=>{try{ let path = resolve(root, '.' + decodeURIComponent(new URL(req.url,'http://localhost').pathname)); if(path!==root&&!path.startsWith(root+sep)) {res.writeHead(403).end();return;} if((await stat(path)).isDirectory()) path=resolve(path,'index.html'); res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(await readFile(path)); }catch {res.writeHead(404).end('Not found');}}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('Local preview: http://127.0.0.1:'+ (process.env.PORT||4173)));
