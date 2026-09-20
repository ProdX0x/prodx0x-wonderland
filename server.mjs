import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.mp4':'video/mp4','.webm':'video/webm','.woff2':'font/woff2'};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root) || pathname.split('/').some(p=>p.startsWith('.'))) {res.writeHead(403).end();return;}
    const info = await stat(file); if(!info.isFile()) {res.writeHead(404).end();return;}
    const headers = {'Content-Type':mime[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    let start=0,end=info.size-1;
    if(range){start=Number(range[1]);end=range[2]?Math.min(Number(range[2]),end):end;if(start>end){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;}
    headers['Content-Length']=end-start+1;
    res.writeHead(range?206:200,headers);
    if(req.method==='HEAD'){res.end();return;}createReadStream(file,{start,end}).pipe(res);
  } catch {res.writeHead(404).end('Fichier introuvable');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Wonderland → http://localhost:${port}`));
