// Trace a solid-silhouette PNG into one SVG path (evenodd), 100x100 viewBox.
// node trace.js in.png out.svg [threshold]
const fs=require('fs'),zlib=require('zlib');
function png(buf){
  let p=8,w,h,ct,bd,idat=[];
  while(p<buf.length){const len=buf.readUInt32BE(p),type=buf.toString('ascii',p+4,p+8),d=buf.slice(p+8,p+8+len);
    if(type==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);bd=d[8];ct=d[9];}
    else if(type==='IDAT')idat.push(d);p+=12+len;}
  const raw=zlib.inflateSync(Buffer.concat(idat));
  const ch={0:1,2:3,4:2,6:4}[ct],bpp=ch*(bd/8),stride=w*bpp;
  const out=Buffer.alloc(h*stride);let q=0;
  for(let y=0;y<h;y++){const f=raw[q++];const row=out.subarray(y*stride,(y+1)*stride);const prev=y?out.subarray((y-1)*stride,y*stride):null;
    for(let i=0;i<stride;i++){const x=raw[q++];const a=i>=bpp?row[i-bpp]:0,b=prev?prev[i]:0,c=(prev&&i>=bpp)?prev[i-bpp]:0;let v;
      switch(f){case 0:v=x;break;case 1:v=x+a;break;case 2:v=x+b;break;case 3:v=x+((a+b)>>1);break;
        case 4:{const pa=Math.abs(b-c),pb=Math.abs(a-c),pc=Math.abs(a+b-2*c);const pr=(pa<=pb&&pa<=pc)?a:(pb<=pc?b:c);v=x+pr;break;}}
      row[i]=v&255;}}
  return {w,h,ch,data:out};
}
function lum(img,x,y){const i=(y*img.w+x)*img.ch;const d=img.data;if(img.ch<3)return d[i];return 0.3*d[i]+0.59*d[i+1]+0.11*d[i+2];}
const [,,inF,outF,thrS]=process.argv;const thr=+(thrS||70);
const img=png(fs.readFileSync(inF));
// downsample to ~256 on the long side for tracing speed, keep aspect, then square-crop to content
const S=Math.max(img.w,img.h)/256;const W=Math.round(img.w/S),H=Math.round(img.h/S);
const m=new Uint8Array((W+2)*(H+2));
for(let y=0;y<H;y++)for(let x=0;x<W;x++){let s=0,n=0;for(let yy=Math.floor(y*S);yy<Math.min(img.h,Math.floor((y+1)*S));yy++)for(let xx=Math.floor(x*S);xx<Math.min(img.w,Math.floor((x+1)*S));xx++){s+=lum(img,xx,yy);n++;}
  if(s/n>thr)m[(y+1)*(W+2)+x+1]=1;}
const at=(x,y)=>m[(y+1)*(W+2)+x+1];
// marching squares contours on the padded grid: trace edges between filled/empty cells
const edges=new Map();// key "x,y,dir" -> visited
function key(a,b){return a[0]+','+a[1]+'>'+b[0]+','+b[1];}
// build directed boundary segments: for each filled cell, each side facing empty gets a segment (clockwise around fill)
const segs=new Map();
for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!at(x,y))continue;
  if(!at(x,y-1))add([x,y],[x+1,y]);
  if(!at(x+1,y))add([x+1,y],[x+1,y+1]);
  if(!at(x,y+1))add([x+1,y+1],[x,y+1]);
  if(!at(x-1,y))add([x,y+1],[x,y]);}
function add(a,b){const k=a[0]+','+a[1];if(!segs.has(k))segs.set(k,[]);segs.get(k).push(b);}
const paths=[];
for(const [k,list] of segs){while(list.length){let cur=k.split(',').map(Number);const start=cur.slice();const pts=[start];let nxt=list.pop();
  let guard=0;while(nxt&&!(nxt[0]===start[0]&&nxt[1]===start[1])&&guard++<100000){pts.push(nxt);const l=segs.get(nxt[0]+','+nxt[1]);if(!l||!l.length)break;
    // prefer turning consistently: pick the candidate that keeps going (any); fine for simple shapes
    let pick=0;if(l.length>1){const d=[nxt[0]-cur[0],nxt[1]-cur[1]];for(let i=0;i<l.length;i++){const e=[l[i][0]-nxt[0],l[i][1]-nxt[1]];if(d[0]*e[1]-d[1]*e[0]>0){pick=i;break;}}}
    cur=nxt;nxt=l.splice(pick,1)[0];}
  if(pts.length>8)paths.push(pts);}}
// simplify
function rdp(pts,eps){if(pts.length<3)return pts;let dmax=0,idx=0;const a=pts[0],b=pts[pts.length-1];
  for(let i=1;i<pts.length-1;i++){const d=pd(pts[i],a,b);if(d>dmax){dmax=d;idx=i;}}
  if(dmax>eps){const l=rdp(pts.slice(0,idx+1),eps),r=rdp(pts.slice(idx),eps);return l.slice(0,-1).concat(r);}return [a,b];}
function pd(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1];if(!dx&&!dy)return Math.hypot(p[0]-a[0],p[1]-a[1]);const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
// content bounds -> square 100 box with 8% margin
let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;paths.forEach(p=>p.forEach(q=>{x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1]);}));
const side=Math.max(x1-x0,y1-y0),sc=84/side,ox=(100-(x1-x0)*sc)/2,oy=(100-(y1-y0)*sc)/2;
const d=paths.map(p=>{const s=rdp(p.concat([p[0]]),1.2);return 'M'+s.map(q=>((q[0]-x0)*sc+ox).toFixed(1)+' '+((q[1]-y0)*sc+oy).toFixed(1)).join('L')+'Z';}).join('');
fs.writeFileSync(outF,'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path fill="currentColor" fill-rule="evenodd" d="'+d+'"/></svg>\n');
console.log(outF,paths.length+' contours',d.length+' chars');
