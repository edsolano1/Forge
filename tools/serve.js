// A static server for the preview pane. Lives in the repo because the copy in a session's temp
// folder disappears with the session and takes the preview with it.
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.css':'text/css','.mp3':'audio/mpeg','.wav':'audio/wav','.woff2':'font/woff2'};
http.createServer((q,s)=>{
  let p=decodeURIComponent(q.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
  const f=path.join(root,p);
  if(!f.startsWith(root)){s.writeHead(403);return s.end();}
  fs.readFile(f,(e,d)=>{
    if(e){s.writeHead(404);return s.end('not found');}
    s.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});s.end(d);
  });
}).listen(8131,()=>console.log('forge on 8131'));
