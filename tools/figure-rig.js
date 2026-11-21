var PU_BY=376,PU_LEAN=-14,PU_TOP=15,PU_SZ=-27,PU_AY=112,PU_AZ0=78,PU_AZ1=40,PU_FD=[-.1,-.9,-.44],PU_POLE=[-.3,-1,.6];
var CF_D0=8,CF_D1=22;
var IN_X0=84,IN_U=12,IN_N=27,IN_P=2,IN_POLE=[-.35,-1,.35];
var CR_HX=14,CR_HY0=150,CR_HY1=138,CR_Z0=121,CR_Z1=30,CR_AY=56,CR_AZ=158,CR_FY=0.94,CR_FZ=0.34,CR_POLE=[-.85,-.5,-1],CR_PA=[0,34,168],CR_PB=[0,96,190.4];
var PUSH_HZ=-4,PUSH_LEAN=16,PUSH_TH0=100,PUSH_PZ=78;
// FIG: one body, fixed bone lengths, posed in 3D and drawn from any side.
// Units are canvas pixels on the app's 480 x 480 stage. y is UP from the floor,
// z is the way the lifter faces, x is across the body (the lifter's right is -x).
var FIG=(function(){
"use strict";
var INK="#e8ded2", FAR="#8d8378", GO="#d97b2e", LINE="#514a43", HOT="#ff7a1a", DEF="rgba(70,48,30,.20)";
// THE SKIN: everything about how the lifter LOOKS, and nothing about how it moves. A skin is a handful of
// colours and a face. Poses, bones and lifts never read it, so a new skin can never break a lift.
//   ink: the body. far: the far limbs seen from the side. hot: a muscle doing the work. help: one helping.
//   def: the quiet shape of a muscle at rest. mark: the face. face: 'plate' | 'nose' | 'visor' | 'eyes' | 'none'.
var SKIN0={ink:INK,far:FAR,hot:HOT,help:"rgba(255,122,26,.42)",def:DEF,mark:"rgba(52,38,28,.8)",face:'plate'}, SK=SKIN0;
function skin(o){SK={};var k;for(k in SKIN0)SK[k]=SKIN0[k];if(o)for(k in o)SK[k]=o[k];return SK;}
var FLOOR=432;
// ---- the body. Nothing below this line may set a length of its own. ----
var B={ankH:12, shin:86, thigh:92, trunk:100, uarm:64, farm:64, wrist:.81, shoW:39, hipW:17, neck:12, headR:[17,23.5,20.5]};
// torso cross-sections: [how far up the trunk, half width, depth in front, depth behind]
var TOR=[[-.13,19,10,12],[-.04,27,15,20],[.06,29,16,22],[.18,27,16,18],[.32,23,15,14],[.48,27,18,16],
         [.62,32,22,18],[.76,35,24,19],[.90,37,20,19],[1.0,35,14,15],[1.06,22,10,12],[1.11,11,8,10]];

function add(a,b){return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function mul(a,s){return [a[0]*s,a[1]*s,a[2]*s];}
function dot3(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function len(a){return Math.sqrt(dot3(a,a));}
function norm(a){var l=len(a)||1;return [a[0]/l,a[1]/l,a[2]/l];}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function mix(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];}
function lerp(a,b,t){return a+(b-a)*t;}

// two bones from a to a target: the joint between them goes toward the pole.
// The target is pulled in if it is out of reach, so a bone can never stretch.
function ik(a,tg,l1,l2,pole){
  var d=sub(tg,a), dist=len(d), mx=l1+l2-.4, mn=Math.abs(l1-l2)+.4;
  if(dist>mx){d=mul(d,mx/dist);dist=mx;}
  if(dist<mn){d=dist?mul(d,mn/dist):[0,-mn,0];dist=mn;}
  var dir=mul(d,1/dist);
  var p=sub(pole,mul(dir,dot3(pole,dir)));
  if(len(p)<1e-4)p=cross(dir,[1,0,0]);
  p=norm(p);
  var x=(l1*l1-l2*l2+dist*dist)/(2*dist), h=Math.sqrt(Math.max(0,l1*l1-x*x));
  return {mid:add(add(a,mul(dir,x)),mul(p,h)), end:add(a,d), bend:p};
}

// pose -> every joint. A pose says where the hips, feet and hands are; the rest follows.
function rot(a,b,deg){var t=deg*Math.PI/180,c=Math.cos(t),sn=Math.sin(t);return [add(mul(a,c),mul(b,sn)),sub(mul(b,c),mul(a,sn))];}
function solve(p){
  var R=Math.PI/180, L=(p.lean||0)*R, r;
  var u=[0,Math.cos(L),Math.sin(L)], n=[0,-Math.sin(L),Math.cos(L)], X=[1,0,0];
  if(p.spin){r=rot(X,n,p.spin);X=r[0];n=r[1];}                      // the whole body turned about its own length
  var Xs=X, ns=n; if(p.twist){r=rot(X,n,p.twist);Xs=r[0];ns=r[1];}   // the shoulders turned against the hips
  var H=p.hip, S=add(H,mul(u,B.trunk));
  var J={u:u,n:n,X:X,Xs:Xs,ns:ns,H:H,S:S,side:{}};
  r=rot(u,ns,p.neck||0); J.nu=r[0]; J.nn=r[1];
  J.neck0=add(S,mul(u,6)); J.head=add(J.neck0,mul(J.nu,B.neck+B.headR[1]-2));
  [-1,1].forEach(function(s){
    // a pose names one value (written for the RIGHT side and mirrored for the left), or one per side
    // (ankR / ankL, handR / handL, kneePoleR / L, elbPoleR / L, footDirR / L), each given as it really is
    function get(name,def){var e=p[name+(s<0?'R':'L')];if(e)return e;var v=p[name]||def;return [v[0]*-s,v[1],v[2]];}
    var q={};
    q.hipJ=add(H,mul(X,s*B.hipW));
    q.shoJ=add(add(S,mul(Xs,s*B.shoW)),p.shrug?add(mul(u,p.shrug[0]),mul(ns,p.shrug[1])):[0,0,0]);
    var lg=ik(q.hipJ,get('ank'),B.thigh,B.shin,get('kneePole',[-.2,0,1]));
    q.knee=lg.mid;q.ank=lg.end;q.legF=lg.bend;
    q.footDir=norm(get('footDir',[-.17,0,1]));
    var ar=ik(q.shoJ,get('hand'),B.uarm,B.farm,get('elbPole',[-.3,-1,-.4]));
    q.elb=ar.mid;q.hand=ar.end;q.armB=ar.bend;
    if(p.palm||p['palm'+(s<0?'R':'L')])q.palm=norm(get('palm'));       // the way the palm faces
    if(p.thumb||p['thumb'+(s<0?'R':'L')])q.thumb=norm(get('thumb'));   // the way the thumb points
    J.side[s]=q;
  });
  return J;
}

// ---- views ----
// side, front, back; rear (from behind, off to the lifter's right), quarter (from in front, off to the right),
// top (looking straight down, head of a lying lifter to the left)
function view(kind,cx){
  if(kind==='side')return {k:kind,v:[-1,0,0],p:function(a){return [cx+a[2],FLOOR-a[1],-a[0]];},d:function(a){return [a[2],-a[1]];}};
  if(kind==='top')return {k:kind,v:[0,1,0],p:function(a){return [cx+a[2],250+a[0],a[1]];},d:function(a){return [a[2],a[0]];}};
  var f=38*Math.PI/180, v=kind==='rear'?[-Math.sin(f),0,-Math.cos(f)]:kind==='quarter'?[-Math.sin(f),0,Math.cos(f)]:kind==='back'?[0,0,-1]:[0,0,1];
  var ex=v[2], ez=-v[0];
  return {k:kind,v:v,p:function(a){return [cx+a[0]*ex+a[2]*ez,FLOOR-a[1],a[0]*v[0]+a[2]*v[2]];},d:function(a){return [a[0]*ex+a[2]*ez,-a[1]];}};
}
// an ellipsoid seen from a view is an ellipse: sample its edge
function blobPts(V,c,ax,N){
  var a=V.d(ax[0]),b=V.d(ax[1]),e=V.d(ax[2]);
  var m00=a[0]*a[0]+b[0]*b[0]+e[0]*e[0], m01=a[0]*a[1]+b[0]*b[1]+e[0]*e[1], m11=a[1]*a[1]+b[1]*b[1]+e[1]*e[1];
  var l00=Math.sqrt(Math.max(m00,1e-6)), l10=m01/l00, l11=Math.sqrt(Math.max(m11-l10*l10,1e-6));
  var o=V.p(c), out=[];N=N||14;
  for(var i=0;i<N;i++){var t=i/N*6.2832,cs=Math.cos(t),sn=Math.sin(t);out.push([o[0]+l00*cs,o[1]+l10*cs+l11*sn]);}
  return out;
}
function hull(pts){
  pts=pts.slice().sort(function(a,b){return a[0]-b[0]||a[1]-b[1];});
  function cr(o,a,b){return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);}
  var lo=[],up=[],i;
  for(i=0;i<pts.length;i++){while(lo.length>=2&&cr(lo[lo.length-2],lo[lo.length-1],pts[i])<=0)lo.pop();lo.push(pts[i]);}
  for(i=pts.length-1;i>=0;i--){while(up.length>=2&&cr(up[up.length-2],up[up.length-1],pts[i])<=0)up.pop();up.push(pts[i]);}
  lo.pop();up.pop();return lo.concat(up);
}
// a body part is a chain of blobs; its outline is the hulls of each neighbouring pair
function chainPath(V,blobs){
  var path=new Path2D(), prev=null;
  blobs.forEach(function(b,i){
    var pts=blobPts(V,b.c,b.ax);
    var h=hull(prev?prev.concat(pts):pts);
    if(prev||blobs.length===1){path.moveTo(h[0][0],h[0][1]);for(var j=1;j<h.length;j++)path.lineTo(h[j][0],h[j][1]);path.closePath();}
    prev=pts;
  });
  return path;
}
function sph(c,r){return {c:c,ax:[[r,0,0],[0,r,0],[0,0,r]]};}

function buildParts(J,V){
  var parts=[], u=J.u;
  function fr(f){var w=Math.max(0,Math.min(1,(f-.25)/.5));w=w*w*(3-2*w);return {X:norm(mix(J.X,J.Xs,w)),n:norm(mix(J.n,J.ns,w))};}
  function depth(c){return V.p(c)[2];}
  function part(name,blobs,joint,jr,far,order){
    var d=0;blobs.forEach(function(b){d+=depth(b.c);});
    parts.push({name:name,blobs:blobs,d:d/blobs.length,joint:joint,jr:jr,far:far,o:order,mus:[]});
    return parts[parts.length-1];
  }
  // torso
  var tb=TOR.map(function(t){
    var F=fr(t[0]), c=add(add(J.H,mul(u,t[0]*B.trunk)),mul(F.n,(t[2]-t[3])/2));
    return {c:c,ax:[mul(F.X,t[1]),mul(F.n,(t[2]+t[3])/2),mul(u,3)]};
  });
  var torso=part('torso',tb,null,0,false,10);
  function tpt(f){return add(J.H,mul(u,f*B.trunk));}
  function tm(key,f,lat,face,hh,hw,dep){
    var F=fr(f), N=mul(F.n,face), c=add(add(tpt(f),mul(F.X,lat)),mul(N,dep*.72));
    torso.mus.push({key:key,c:c,ax:[mul(u,hh),mul(F.X,hw),mul(N,dep*.5)],N:N,sd:lat<0?'R':lat>0?'L':''});
  }
  tm('chest',.77,-17,1,13,15,19);tm('chest',.77,17,1,13,15,19);
  tm('abs',.36,0,1,25,10,14);
  tm('obl',.34,-19,1,19,5.5,13);tm('obl',.34,19,1,19,5.5,13);
  tm('lats',.56,-20,-1,27,12,15);tm('lats',.56,20,-1,27,12,15);
  tm('traps',.93,0,-1,15,21,14);
  tm('lowback',.20,-8,-1,19,6,14);tm('lowback',.20,8,-1,19,6,14);
  tm('glute',-.02,-14,-1,15,12,18);tm('glute',-.02,14,-1,15,12,18);
  // neck and head
  part('neck',[sph(add(J.S,mul(u,2)),9),sph(add(J.neck0,mul(J.nu,B.neck)),8)],add(J.S,mul(u,4)),13,false,11);
  var hr=B.headR;
  var hbl=[{c:J.head,ax:[mul(J.Xs,hr[0]),mul(J.nu,hr[1]),mul(J.nn,hr[2])]},
           {c:add(add(J.head,mul(J.nu,-12)),mul(J.nn,6)),ax:[mul(J.Xs,11),mul(J.nu,10),mul(J.nn,12)]}];
  var fc=SK.face, hpt=function(f,up,x){return add(add(add(J.head,mul(J.nn,f)),mul(J.nu,up)),mul(J.Xs,x||0));};
  if(fc==='nose'||fc==='eyes')hbl.push(sph(hpt(21.5,-6),4.2));          // a nose: the one thing a head needs to face somewhere
  var hd=part('head',hbl,add(J.neck0,mul(J.nu,B.neck)),10,false,12);
  if(fc==='plate')hd.mus.push({key:'face',c:hpt(13,-3),ax:[mul(J.Xs,9.5),mul(J.nu,13),mul(J.nn,7)],N:J.nn});
  if(fc==='nose')hd.mus.push({key:'face',col:SK.mark,c:hpt(17,2.5),ax:[mul(J.Xs,11),mul(J.nu,1.7),mul(J.nn,5)],N:J.nn});   // a brow
  if(fc==='visor')hd.mus.push({key:'face',col:SK.mark,c:hpt(11,2),ax:[mul(J.Xs,15),mul(J.nu,4.6),mul(J.nn,11)],N:J.nn});
  if(fc==='eyes')[-1,1].forEach(function(e){hd.mus.push({key:'face',col:SK.mark,c:hpt(17,2,e*6.2),ax:[mul(J.Xs,2.5),mul(J.nu,3),mul(J.nn,3)],N:J.nn});});
  [-1,1].forEach(function(s){
    var q=J.side[s], far=(V.k==='side'&&s>0&&q.hipJ[0]>4);   // the far side is dimmed from the side, unless the body is turned on its side
    function limb(name,a,b,rs,ts,front,bulge,joint,jr,order){
      var bl=rs.map(function(r,i){var c=mix(a,b,ts[i]);if(bulge&&bulge[i])c=add(c,mul(front,bulge[i]));return sph(c,r);});
      var P=part(name,bl,joint,jr,far,order);
      P.a=a;P.b=b;P.dir=norm(sub(b,a));P.L=len(sub(b,a));P.front=front;P.s=s;
      return P;
    }
    function lm(P,key,t,hl,r,face,always){
      var N=always?V.v:mul(P.front,face), sd=norm(cross(P.dir,N));
      var c=add(mix(P.a,P.b,t),mul(N,r*.5));
      P.mus.push({key:key,c:c,ax:[mul(P.dir,hl*P.L),mul(sd,r*.8),mul(N,r*.55)],N:N});
    }
    var th=limb('thigh',q.hipJ,q.knee,[16.5,16,13,10.5],[0,.4,.75,1],q.legF,[0,1.5,0,0],q.hipJ,19,20);
    lm(th,'quad',.5,.38,15,1);lm(th,'ham',.48,.38,15,-1);
    var sh=limb('shin',q.knee,q.ank,[10.5,11.5,8.5,6.5],[0,.3,.7,1],q.legF,[0,-3,-1,0],q.knee,12,21);
    lm(sh,'calf',.3,.24,11,-1);
    var fd=q.footDir, dn=Math.abs(fd[1])+Math.abs(fd[2])<.05?[0,-1,0]:norm([0,-fd[2],fd[1]]);          // the sole faces square away from the way the toes point
    var toe=add(add(q.ank,mul(fd,36)),mul(dn,7.4)), flat=q.ank[1]<40&&fd[1]<-.05;
    if(flat&&toe[1]<4.6)toe=[toe[0],4.6,toe[2]+2];       // up on the ball of the foot, the toes bend and stay down
    part('foot',[sph(add(add(q.ank,mul(fd,-5)),mul(dn,5)),7),sph(add(add(q.ank,mul(fd,23)),mul(dn,6.3)),5.7),sph(toe,4.6)],
         q.ank,15,far,22).s=s;       // a wide joint, or the heel cuts a moving line across the shin as the foot tilts
    var ua=limb('uarm',q.shoJ,q.elb,[12.5,10.5,8.5],[0,.45,1],mul(q.armB,-1),null,q.shoJ,15,30);
    ua.mus.push({key:'delt',c:q.shoJ,ax:[[11.5,0,0],[0,11.5,0],[0,0,11.5]],N:V.v});
    lm(ua,'biceps',.58,.28,10,1);lm(ua,'triceps',.52,.32,10,-1);
    var wr=mix(q.elb,q.hand,B.wrist);
    var fa=limb('farm',q.elb,wr,[8.5,9.2,6.2,5.6],[0,.3,.8,1],mul(q.armB,-1),null,q.elb,10,31);
    lm(fa,'forearm',.3,.24,8,1,true);
    var hb=[sph(mix(wr,q.hand,.35),6),sph(q.hand,7.6)];
    if(q.thumb)hb.push(sph(add(q.hand,mul(q.thumb,8.5)),3.6));
    var hp=part('hand',hb,wr,7,far,32);hp.s=s;
    if(q.palm){var fdir=norm(sub(q.hand,wr)), sdir=norm(cross(fdir,q.palm));
      hp.mus.push({key:'palm',c:add(q.hand,mul(q.palm,3.5)),ax:[mul(fdir,5.2),mul(sdir,4.6),mul(q.palm,3)],N:q.palm,sd:''});}
  });
  // the neck sits behind both the trunk and the head, always: left to its own depth it swaps with them mid rep
  parts[1].d=Math.min(parts[0].d,parts[2].d)-.02;
  return parts;
}

// ---- drawing ----
function drawPart(x,V,P,lit){
  var path=chainPath(V,P.blobs);
  // a thin gap round the part so one limb reads against another, but not at its own joint
  x.save();
  if(P.joint){
    var j=V.p(P.joint), cl=new Path2D();
    cl.rect(-50,-50,600,600);cl.arc(j[0],j[1],P.jr,0,6.2832);
    x.clip(cl,'evenodd');
  }
  x.globalCompositeOperation='destination-out';x.lineWidth=5;x.lineJoin='round';x.stroke(path);
  x.restore();
  x.fillStyle=P.far?SK.far:SK.ink;x.fill(path);
  if(P.far||!P.mus.length)return;
  x.save();x.clip(path);
  P.mus.forEach(function(m){
    var dt=dot3(norm(m.N),V.v);if(dt<-.5)return;
    var fd=Math.max(0,Math.min(1,(dt+.5)/.4));fd=fd*fd*(3-2*fd);     // turning away it fades, it never blinks off
    var sd=m.sd!=null?m.sd:(P.s?(P.s<0?'R':'L'):'');          // lit:{quad:2} lights both sides, lit:{quadR:2} the right only
    var lv=lit&&(lit[m.key]||(sd&&lit[m.key+sd]));
    x.fillStyle=lv===2?SK.hot:SK.def;
    x.globalAlpha=fd;
    if(lv===1)x.fillStyle=SK.help;
    if(m.col)x.fillStyle=m.col;
    if(m.key==='palm')x.fillStyle="rgba(70,48,30,.5)";
    var pts=blobPts(V,m.c,m.ax,20);
    x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);x.closePath();x.fill();
  });
  x.restore();
}
var GX={};       // gear a lift file brings itself: FIG.gear.name=function(x,V,g){...}, used as {t:'name',...}
function ringPts(V,c,ax,off,rad){
  ax=norm(ax);var e1=norm(cross(ax,Math.abs(ax[1])>.9?[1,0,0]:[0,1,0])), e2=cross(ax,e1), o=[], i, t;
  for(i=0;i<18;i++){t=i/18*6.2832;o.push(V.p(add(add(c,mul(ax,off)),add(mul(e1,rad*Math.cos(t)),mul(e2,rad*Math.sin(t))))));}
  return o;
}
function poly(x,h){x.beginPath();h.forEach(function(q,j){if(j)x.lineTo(q[0],q[1]);else x.moveTo(q[0],q[1]);});x.closePath();}
function drawGear(x,V,g){
  var a,b,c;
  if(GX[g.t]){GX[g.t](x,V,g);return;}
  if(g.t==='bar'){                               // a loaded bar lying across the body
    c=V.p(g.c);
    if(V.k==='side'){
      if(g.r>8){
        x.fillStyle="rgba(18,16,14,.62)";x.beginPath();x.arc(c[0],c[1],g.r,0,7);x.fill();
        x.strokeStyle=GO;x.lineWidth=7;x.beginPath();x.arc(c[0],c[1],g.r-3.5,0,7);x.stroke();
      }
      x.fillStyle=GO;x.beginPath();x.arc(c[0],c[1],g.r>8?6:5,0,7);x.fill();
    }else{
      a=V.p([g.c[0]-g.half,g.c[1],g.c[2]]);b=V.p([g.c[0]+g.half,g.c[1],g.c[2]]);
      x.strokeStyle=GO;x.lineWidth=7;x.lineCap='round';
      x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();
      if(g.r>8){x.fillStyle=GO;[-1,1].forEach(function(sg){poly(x,hull(ringPts(V,g.c,[1,0,0],sg*(g.half-11),g.r).concat(ringPts(V,g.c,[1,0,0],sg*(g.half+2),g.r))));x.fill();});}
    }
  }else if(g.t==='db'){                          // a dumbbell: a handle with a head on each end
    var ax=norm(g.ax), e1=norm(cross(ax,Math.abs(ax[1])>.9?[1,0,0]:[0,1,0])), e2=cross(ax,e1), HR=11.5, IN=8.5, OUT=19;
    var dim=V.k==='side'&&g.c[0]>0, tw=dot3(ax,V.v), near=tw>=0?1:-1;
    var ring=function(off){var o=[],i,t;for(i=0;i<18;i++){t=i/18*6.2832;
      o.push(V.p(add(add(g.c,mul(ax,off)),add(mul(e1,HR*Math.cos(t)),mul(e2,HR*Math.sin(t))))));}return o;};
    var head=function(sg){
      var h=hull(ring(sg*IN).concat(ring(sg*OUT)));
      x.beginPath();h.forEach(function(q,j){if(j)x.lineTo(q[0],q[1]);else x.moveTo(q[0],q[1]);});x.closePath();
      x.fillStyle=dim?"#8a5a2c":GO;x.fill();x.strokeStyle="#15120f";x.lineWidth=1.6;x.lineJoin='round';x.stroke();
      if(tw*sg>.5){c=V.p(add(g.c,mul(ax,sg*OUT)));x.fillStyle="#15171b";x.beginPath();x.arc(c[0],c[1],3,0,7);x.fill();}
    };
    head(-near);
    a=V.p(add(g.c,mul(ax,-IN)));b=V.p(add(g.c,mul(ax,IN)));
    x.strokeStyle=dim?"#8a5a2c":GO;x.lineWidth=4.5;x.lineCap='butt';x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();
    c=V.p(g.c);x.fillStyle=dim?SK.far:SK.ink;x.beginPath();x.arc(c[0],c[1],6.9,0,7);x.fill();   // the fist, closed over the handle
    head(near);
  }else if(g.t==='line'){
    a=V.p(g.a);b=V.p(g.b);
    x.lineCap='round';
    if(Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1])<1){           // a rod seen end on: a line with no length draws nothing, so draw its end
      x.fillStyle=g.col||LINE;x.beginPath();x.arc(a[0],a[1],(g.w||6)/2,0,7);x.fill();return;
    }
    if(g.rim){x.strokeStyle=g.rim;x.lineWidth=(g.w||6)+2.6;x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();}
    x.strokeStyle=g.col||LINE;x.lineWidth=g.w||6;
    x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();
  }else if(g.t==='box'){                         // a pad or a bench top, given by two corners
    var cs=[],i;
    if(g.pts)cs=g.pts.map(function(q){return V.p(q);});      // a slab that is not square to the room: its own corners
    else for(i=0;i<8;i++)cs.push(V.p([i&1?g.a[0]:g.b[0],i&2?g.a[1]:g.b[1],i&4?g.a[2]:g.b[2]]));
    cs=hull(cs);
    x.fillStyle="#2f2a26";x.strokeStyle=LINE;x.lineWidth=4;x.lineJoin='round';
    x.beginPath();cs.forEach(function(q,j){if(j)x.lineTo(q[0],q[1]);else x.moveTo(q[0],q[1]);});x.closePath();x.fill();x.stroke();
  }
}
function gearDepth(V,g){
  if(g.t==='bar'){if(V.k==='side')return 200;if(g.d&&g.d[V.k]!=null)return g.d[V.k];return V.p(g.c)[2];}
  if(g.t==='db')return 2000+V.p(g.c)[2]*.01;        // draw() ties it to the hand that holds it
  if(g.d!=null&&g.d[V.k]!=null)return g.d[V.k];
  if(g.d!=null&&(V.k==='side'||V.k==='front'||V.k==='back'))return 0;
  if(!g.a||!g.b)return g.c?V.p(g.c)[2]:0;
  return (V.p(g.a)[2]+V.p(g.b)[2])/2;
}
// zoom: {s:scale, at:[x,y,z]} draws closer in, with that point of the scene held at the middle of the frame
function draw(x,kind,pose,gear,lit,cx,ground,zoom){
  x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,480,480);
  var V=view(kind,cx==null?240:cx);
  if(zoom){var zf=V.p(zoom.at);x.translate(240,240);x.scale(zoom.s,zoom.s);x.translate(-zf[0],-zf[1]);}
  x.strokeStyle=LINE;x.lineWidth=6;x.lineCap='round';
  if(kind!=='top'){x.beginPath();x.moveTo(ground?ground[0]:90,FLOOR+3);x.lineTo(ground?ground[1]:390,FLOOR+3);x.stroke();}
  var J=solve(pose), items=[], handD={};
  var lay=pose.layer&&pose.layer[kind];
  buildParts(J,V).forEach(function(P){
    if(lay){
      var grp=P.o>=30?'arms':(P.o>=20?'legs':null);
      if(grp&&lay[grp])P.d=(lay[grp]==='front'?1:-1)*(grp==='arms'?1000:900);
      // one part on one side, e.g. uarmR:'front': from off to one side the near shoulder is always over the trunk
      var one=P.s&&lay[P.name+(P.s<0?'R':'L')];
      if(one)P.d=(one==='front'?1:-1)*1000;
    }
    items.push({d:Math.round(P.d*50)/50,o:P.o,P:P});
    if(P.name==='hand')handD[P.s]=Math.round(P.d*50)/50;
  });
  (gear||[]).forEach(function(g){
    if(g.v&&g.v.indexOf(kind)<0)return;
    // a dumbbell goes wherever its hand goes: just over it, never over the whole body
    items.push({d:g.t==='db'?handD[g.c[0]<0?-1:1]+.03:gearDepth(V,g),o:g.t==='bar'?99:(g.t==='db'?98:0),g:g});
  });
  items.sort(function(a,b){return a.d-b.d||a.o-b.o;});
  items.forEach(function(it){if(it.P)drawPart(x,V,it.P,lit);else drawGear(x,V,it.g);});
  x.setTransform(1,0,0,1,0,0);
  return J;
}
// a lift asks for a close up with zoom:{s:2.3,on:'hands'} (or on:[x,y,z]); views:['top'] limits it to some views.
// The point is worked out ONCE, from the middle of the rep, so the camera never moves.
function zoomOf(L,kind){
  var z=L.zoom;if(!z||(z.views&&z.views.indexOf(kind)<0))return null;
  if(!z._at){var at=z.on;if(at==='hands'||!at){var J=solve(L.pose(.5).p),a=J.side[-1].hand,b=J.side[1].hand;at=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];}z._at=at;}
  return {s:z.s||2,at:z._at};
}
return {skin:skin,zoomOf:zoomOf,draw:draw,solve:solve,B:B,lerp:lerp,add:add,sub:sub,mul:mul,dot:dot3,len:len,norm:norm,cross:cross,mix:mix,hull:hull,poly:poly,ringPts:ringPts,ik:ik,
        view:view,parts:buildParts,blobPts:blobPts,gearDepth:gearDepth,TOR:TOR,gear:GX,col:{INK:INK,FAR:FAR,GO:GO,LINE:LINE,PAD:"#2f2a26"}};
})();

// ---------------- the five lifts ----------------
// stand: a standing lift, so the bar must stay over the middle of the foot.
// tall: the end of the rep (k) where the lifter stands fully upright.
// LK: what every lift is written with. Lift files added after this one use the same.
var LK=(function(){
"use strict";
var B=FIG.B, lerp=FIG.lerp, R=Math.PI/180, ARM=B.uarm+B.farm-.6, PL=44;
function S_of(hip,lean){return [0,hip[1]+B.trunk*Math.cos(lean*R),hip[2]+B.trunk*Math.sin(lean*R)];}
function smooth(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);}
// a press: the elbow sits straight under the hand, so the forearm stands upright when seen from the side.
// Given the shoulder and the hand, there is one such elbow; this returns the pole that puts it there.
function under(sho,hand,fall){
  var dz=hand[2]-sho[2], r1=B.farm, r2=Math.sqrt(Math.max(0,B.uarm*B.uarm-dz*dz));
  var dx=sho[0]-hand[0], dy=sho[1]-hand[1], d=Math.sqrt(dx*dx+dy*dy);
  if(d<1||d>r1+r2-.5||d<Math.abs(r1-r2)+.5)return fall;
  var a=(r1*r1-r2*r2+d*d)/(2*d), h=Math.sqrt(Math.max(0,r1*r1-a*a)), mx=hand[0]+dx*a/d, my=hand[1]+dy*a/d;
  var e1=[mx-dy*h/d,my+dx*h/d], e2=[mx+dy*h/d,my-dx*h/d], e=e1[1]<e2[1]?e1:e2;      // the lower of the two
  // half way between that elbow and the lift's own: dead upright from the side throws the elbows wide from the
  // end, and the other way round, so each view gives up about ten degrees
  var p=[e[0]-(sho[0]+hand[0])/2,e[1]-(sho[1]+hand[1])/2,hand[2]-(sho[2]+hand[2])/2], pl=Math.sqrt(p[0]*p[0]+p[1]*p[1]+p[2]*p[2])||1;
  var fl=Math.sqrt(fall[0]*fall[0]+fall[1]*fall[1]+fall[2]*fall[2])||1;
  return [p[0]/pl+fall[0]/fl,p[1]/pl+fall[1]/fl,p[2]/pl+fall[2]/fl];
}
// a dumbbell in each hand: the hand given is the right one, the left is its mirror
function dbs(h,ax){return [{t:'db',c:[h[0],h[1],h[2]],ax:ax,front:9},{t:'db',c:[-h[0],h[1],h[2]],ax:ax,front:9}];}
return {B:B,lerp:lerp,R:R,ARM:ARM,PL:PL,S_of:S_of,smooth:smooth,under:under,dbs:dbs};
})();
var LIFTS=(function(){
"use strict";
var B=LK.B, lerp=LK.lerp, R=LK.R, ARM=LK.ARM, PL=LK.PL, S_of=LK.S_of, smooth=LK.smooth, under=LK.under, dbs=LK.dbs;
return {
squat:{name:'Back Squat',views:['side','front'],cx:[236,240],stand:1,tall:0,up:0,
  lit:{quad:2,glute:2,ham:1,lowback:1,abs:1},
  says:'Thighs and backside do the work. The back and stomach hold you steady.',
  pose:function(k){
    var lean=lerp(6,40,k), hip=[0,lerp(188.3,89,k),lerp(6,-50,Math.pow(k,.85))];
    var S=S_of(hip,lean), n=[0,-Math.sin(lean*R),Math.cos(lean*R)], u=[0,Math.cos(lean*R),Math.sin(lean*R)];
    var bar=[0,S[1]+u[1]*5-n[1]*15,S[2]+u[2]*5-n[2]*15];
    return {p:{hip:hip,lean:lean,neck:-lean*.5,ank:[-36,B.ankH,0],kneePole:[-.5,0,1],footDir:[-.5,0,1],
               hand:[-84,bar[1],bar[2]],elbPole:[-.25,-1,-.35],layer:{front:{arms:'back',legs:'front'}}},
            gear:[{t:'bar',c:bar,half:112,r:PL,d:{front:-1100}}]};
  }},
dead:{name:'Deadlift',views:['side','back'],cx:[236,240],stand:1,tall:1,up:1,
  lit:{glute:2,ham:2,lowback:2,quad:2,traps:1,lats:1,forearm:1,abs:1},
  says:'Backside, thighs and lower back lift it. The grip, upper back and stomach hold on.',
  pose:function(k){
    // the bar climbs at ONE steady speed: the path below is read back by bar height, so no part of the
    // pull can rush. Without this the bar covered the top third in a fifth of the time, which read as a jerk.
    var me=this, N=96, i;
    if(!me.T){me.T=[];for(i=0;i<=N;i++)me.T.push(me.poseS(i/N).gear[0].c[1]);}
    var y=lerp(me.T[0],me.T[N],k);i=0;while(i<N-1&&me.T[i+1]<y)i++;
    var f=(y-me.T[i])/((me.T[i+1]-me.T[i])||1);
    return me.poseS((i+Math.max(0,Math.min(1,f)))/N);
  },
  poseS:function(k){
    // THE PULL: the hips rise on the legs' schedule, the shoulders stay just ahead of the bar, and the
    // back angle is whatever keeps the arms straight to it. The bar rides up the front of the leg: its
    // place is worked out FROM the leg, never set by hand.
    // THE FINISH: the last third eases into standing tall, and there the bar's height comes from the
    // arms. Asking for a bar height AND a hip height AND an upright back at once is three demands on
    // two freedoms, and the solver hopping between them is what shook the hands at the top.
    var dx=2, by=lerp(PL,150,k), hyT=lerp(134,186,1-Math.pow(1-k,1.7)), bz=15, lean=60, hip=[0,150,-60], p, it;
    function mk(){return {hip:hip,lean:lean,neck:-lean*.25,ank:[-22,B.ankH,0],kneePole:[-.1,0,1],footDir:[-.15,0,1],
                          hand:[-41,by,bz],elbPole:[-.2,0,-1],layer:{back:{arms:'back',legs:'back'}}};}
    function ride(){                            // ease the bar toward the front of the leg at its own height
      var q=FIG.solve(p).side[-1], lo=by<=q.knee[1], a=lo?q.ank:q.knee, b=lo?q.knee:q.hipJ;
      var t=Math.max(0,Math.min(1,(by-a[1])/((b[1]-a[1])||1))), rr=lo?lerp(6.5,11,t):lerp(11,16,t);
      bz=bz*.5+Math.max(13,a[2]+(b[2]-a[2])*t+rr+5)*.5;
    }
    for(it=0;it<24;it++){
      var Sz=bz+5, Sy=by+Math.sqrt(ARM*ARM-25-dx*dx);
      var c=Math.max(-1,Math.min(1,(Sy-hyT)/B.trunk));
      lean=Math.acos(c)/R;
      var hz=Sz-B.trunk*Math.sin(lean*R), hy=Sy-B.trunk*c;
      var far=Math.sqrt(Math.max(0,177*177-(hy-B.ankH)*(hy-B.ankH)-25));
      // nor so far back that the shins tip backward: the knee stays over the foot, easing back as the bar passes it
      far=Math.min(far,Math.sqrt(Math.max(0,B.thigh*B.thigh-(hy-97)*(hy-97)))-lerp(12,3,smooth(k/.5)));
      if(hz<-far){                              // never further back than the legs can reach: the shoulders
        hz=-far; var dz=hz+B.trunk*Math.sin(lean*R)-bz;        // come forward instead, and the hips settle
        hy=by+Math.sqrt(Math.max(0,ARM*ARM-dz*dz-dx*dx))-B.trunk*c;
      }
      hip=[0,hy,hz]; p=mk(); ride();
    }
    var w=smooth((k-.5)/.5);
    if(w>0){
      hip=[0,lerp(hip[1],189.4,w),lerp(hip[2],-2,w)]; lean=lerp(lean,1.5,w);
      for(it=0;it<24;it++){
        var S=S_of(hip,lean), d2=S[2]-bz;
        by=S[1]-Math.sqrt(Math.max(0,ARM*ARM-d2*d2-dx*dx));
        p=mk(); ride();
      }
      p=mk();
    }
    return {p:p,gear:[{t:'bar',c:[0,by,bz],half:112,r:PL,d:{back:-1100}}]};
  }},
bench:{name:'Bench Press',views:['side','back'],labels:['Side','From the head end'],cx:[236,240],ground:[60,420],up:1,
  lit:{chest:2,triceps:2,delt:1},
  says:'The chest and the back of the arms push. The shoulders help.',
  pose:function(k){
    var hip=[0,108,44], lean=-90, S=S_of(hip,lean);
    var bar=[0,lerp(135.5,S[1]+ARM-5,k),lerp(-28,S[2]+2,k)];
    return {p:{hip:hip,lean:lean,neck:0,ank:[-36,B.ankH,124],kneePole:[-.1,1,.5],footDir:[-.2,0,1],
               hand:[-76,bar[1],bar[2]],elbPole:under([-B.shoW,S[1],S[2]],[-76,bar[1],bar[2]],[-.35,-1,.5])},
            gear:[{t:'box',a:[-30,74,-140],b:[30,88,54],d:{side:-100,back:-40,front:-200}},
                  {t:'line',a:[0,70,-116],b:[0,4,-116],w:7,d:{side:-101,back:-41}},{t:'line',a:[0,70,36],b:[0,4,36],w:7,d:{side:-101,back:-300}},
                  {t:'bar',c:bar,half:112,r:PL,d:{back:500}}]};
  }},
row:{name:'Barbell Row',views:['side','back'],cx:[236,240],stand:1,up:1,
  lit:{lats:2,traps:2,biceps:1,delt:1,lowback:1,forearm:1},
  says:'The big muscles of the back pull. The arms and lower back help.',
  pose:function(k){
    var hip=[0,160,-66], lean=63, S=S_of(hip,lean);
    var bar=[0,lerp(S[1]-ARM+1,163,k),lerp(S[2]+1,0,k)];
    return {p:{hip:hip,lean:lean,neck:-16,ank:[-22,B.ankH,0],kneePole:[-.1,0,1],footDir:[-.15,0,1],
               hand:[-54,bar[1],bar[2]],elbPole:[-.25,.5,-1]},
            gear:[{t:'bar',c:bar,half:112,r:PL,d:{back:-500}}]};
  }},
pull:{name:'Lat Pulldown',views:['side','back'],cx:[214,240],ground:[80,400],up:1,
  lit:{lats:2,biceps:1,forearm:1,traps:1,delt:1},
  says:'The wide muscles down the sides of the back. The arms and shoulders help.',
  pose:function(k){
    var hip=[0,112,0], lean=-9, S=S_of(hip,lean);
    var bar=[0,lerp(S[1]+ARM-8,208,k),lerp(8,16,k)];
    return {p:{hip:hip,lean:lean,neck:10,ank:[-22,B.ankH,92],kneePole:[-.05,1,.6],footDir:[-.1,0,1],
               hand:[-72,bar[1],bar[2]],elbPole:[-.6,-1,-.12],layer:{back:{arms:'front'}}},
            gear:[{t:'box',a:[-26,80,-26],b:[26,92,44],d:{side:-100,back:-200}},
                  {t:'line',a:[0,78,8],b:[0,4,8],w:7,d:{side:-101,back:-201}},
                  {t:'box',a:[-30,117,40],b:[30,130,80],d:{side:100,back:-150}},
                  {t:'line',a:[0,440,8],b:bar,w:4,d:{side:-5,back:-90}},
                  {t:'bar',c:bar,half:96,r:5,d:{back:-500}}]};
  }},
// ---------------- the second ten ----------------
ohp:{name:'Overhead Press',batch:2,views:['side','front'],cx:[236,240],stand:1,up:1,
  lit:{delt:2,triceps:2,traps:1,chest:1,abs:1},
  says:'The shoulders and the back of the arms push. The upper back and stomach hold you steady.',
  pose:function(k){
    var hip=[0,188.3,lerp(-4,8,k)], lean=lerp(-5,1,k), S=S_of(hip,lean);   // a slight lean back to start, then the body comes forward under the bar
    // from the collarbone, forward round the chin, then back to over the ears
    var bar=[0,lerp(S[1]+3,S[1]+ARM+2.6,k),lerp(S[2]+26,S[2]-1,k)+13*Math.sin(Math.PI*k)*(1-k*.4)];
    return {p:{hip:hip,lean:lean,neck:-7*Math.sin(Math.PI*k),ank:[-24,B.ankH,0],kneePole:[-.1,0,1],footDir:[-.2,0,1],
               hand:[-65,bar[1],bar[2]],shrug:[6*k,0],elbPole:[-.3,-1,.45]},
            gear:[{t:'bar',c:bar,half:104,r:13,d:{front:bar[2]-2}}]};
  }},
curl:{name:'Barbell Curl',batch:2,views:['side','front'],cx:[228,240],up:1,
  lit:{biceps:2,forearm:1},
  says:'The front of the arm does the work. The forearm helps bend the elbow.',
  pose:function(k){
    var hip=[0,188.3,0], lean=1, S=S_of(hip,lean);
    var E=[-42,S[1]-63.6,S[2]+6], th=lerp(15,140,k)*R;          // the elbow stays put; the hand swings round it
    var hand=[-42,E[1]-B.farm*Math.cos(th),E[2]+B.farm*Math.sin(th)];
    return {p:{hip:hip,lean:lean,neck:0,ank:[-22,B.ankH,0],kneePole:[-.1,0,1],footDir:[-.2,0,1],
               hand:hand,elbPole:[0,-.6,-1],layer:{front:{arms:'front'}}},
            gear:[{t:'bar',c:[0,hand[1],hand[2]],half:96,r:22,d:{front:500}}]};
  }},
lat:{name:'Lateral Raise',batch:2,views:['side','front'],cx:[236,240],up:1,
  lit:{delt:2,traps:1},
  says:'The shoulders lift. The upper back helps a little.',
  pose:function(k){
    var hip=[0,188.3,0], lean=4, S=S_of(hip,lean), a=lerp(9,86,k)*R, L=124, f=20*R;   // out to the side and a little forward, elbows barely bent
    var hand=[-39-L*Math.sin(a)*Math.cos(f),S[1]-L*Math.cos(a),S[2]+6+L*Math.sin(a)*Math.sin(f)];
    var p={hip:hip,lean:lean,neck:-3,ank:[-22,B.ankH,0],kneePole:[-.1,0,1],footDir:[-.2,0,1],
           hand:hand,elbPole:[0,.25,-1],layer:{front:{arms:'front'}}};
    // the handle lies square across the forearm, thumb end forward: so as the arm comes up its front end
    // turns in toward the body, and it tips down a little at the top, like pouring out a cup of water
    var q=FIG.solve(p).side[-1], fx=q.hand[0]-q.elb[0], fy=q.hand[1]-q.elb[1], fz=q.hand[2]-q.elb[2], fl=Math.sqrt(fx*fx+fy*fy+fz*fz)||1;
    fx/=fl;fy/=fl;fz/=fl;
    var ax=[-fz*fx,-fz*fy*.35-.16*Math.sin(a),1-fz*fz];   // .35: hanging at the side the wrist lets it sit nearly level
    return {p:p,gear:[{t:'db',c:[hand[0],hand[1],hand[2]],ax:ax,front:9},{t:'db',c:[-hand[0],hand[1],hand[2]],ax:[-ax[0],ax[1],ax[2]],front:9}]};
  }},
push:{name:'Rope Pushdown',batch:2,views:['side','front'],cx:[206,240],up:1,
  lit:{triceps:2},
  says:'The back of the arm does all of it. The elbows stay by your sides.',
  pose:function(k){
    var hip=[0,185,PUSH_HZ], lean=PUSH_LEAN, S=S_of(hip,lean);
    var E=[-41,S[1]-63.5,S[2]+4], th=lerp(PUSH_TH0,8,k)*R, dx=lerp(30,9,k*k), fl=Math.sqrt(B.farm*B.farm-dx*dx);
    var hand=[E[0]+dx,E[1]-fl*Math.cos(th),E[2]+fl*Math.sin(th)];
    var knot=[0,hand[1]+Math.sqrt(36*36-hand[0]*hand[0]-9),hand[2]+3];
    return {p:{hip:hip,lean:lean,neck:-8,ank:[-22,B.ankH,0],kneePole:[-.1,0,1],footDir:[-.2,0,1],
               hand:hand,elbPole:[E[0]-(-39+hand[0])/2,E[1]-(S[1]+hand[1])/2,E[2]-(S[2]+hand[2])/2],layer:{front:{arms:'front'}}},
            gear:[{t:'line',a:[0,440,PUSH_PZ],b:knot,w:4,d:{side:-5,front:400}},
                  {t:'line',a:knot,b:hand,w:5,col:'#0b0a09',rim:'#7a7066',d:{side:300,front:1500}},
                  {t:'line',a:knot,b:[-hand[0],hand[1],hand[2]],w:5,col:'#0b0a09',rim:'#7a7066',d:{side:-300,front:1500}}]};
  }},
incl:{name:'Incline Dumbbell Press',batch:2,views:['side','back'],labels:['Side','From the head end'],cx:[262,240],ground:[60,420],up:1,
  lit:{chest:2,delt:2,triceps:1},
  says:'The upper chest and shoulders push. The back of the arms helps.',
  pose:function(k){
    var hip=[0,103,40], lean=-60, S=S_of(hip,lean), u=[0,Math.cos(lean*R),Math.sin(lean*R)], n=[0,-Math.sin(lean*R),Math.cos(lean*R)];
    var lo=[-IN_X0,S[1]-u[1]*IN_U+n[1]*IN_N,S[2]-u[2]*IN_U+n[2]*IN_N], hi=[-46,S[1]+ARM-1.5,S[2]+3];
    var hand=[lerp(lo[0],hi[0],Math.pow(k,IN_P)),lerp(lo[1],hi[1],k),lerp(lo[2],hi[2],k)];
    var a=[0,hip[1]-n[1]*24-u[1]*14,hip[2]-n[2]*24-u[2]*14], b=[0,hip[1]-n[1]*24+u[1]*162,hip[2]-n[2]*24+u[2]*162];
    return {p:{hip:hip,lean:lean,neck:0,ank:[-34,B.ankH,120],kneePole:[-.1,1,.6],footDir:[-.2,0,1],
               hand:hand,elbPole:under([-B.shoW,S[1],S[2]],hand,IN_POLE)},
            gear:[{t:'line',a:a,b:b,w:12,v:['side'],d:{side:-100}},
                  {t:'box',a:[-28,a[1],a[2]],b:[28,b[1],b[2]],v:['back'],d:{back:20}},
                  {t:'box',a:[-26,70,18],b:[26,82,76],v:['side'],d:{side:-100}},
                  {t:'line',a:[0,70,-10],b:[0,4,-10],w:7,d:{side:-101,back:-401}},{t:'line',a:[0,70,60],b:[0,4,60],w:7,v:['side'],d:{side:-101}}
                 ].concat(dbs(hand,[1,0,0]))};
  }},
crow:{name:'Seated Cable Row',okFlip:1,batch:2,views:['side','rear'],labels:['Side','From behind, off to one side'],cx:[126,196],ground:[50,430],up:1,
  lit:{lats:2,traps:2,biceps:1,delt:1,forearm:1,lowback:1},
  says:'The big muscles of the back pull. The arms help and the lower back holds you up.',
  pose:function(k){
    var hip=[0,80,0], lean=lerp(9,-5,k), S=S_of(hip,lean);
    var hand=[-CR_HX,lerp(CR_HY0,CR_HY1,k),lerp(S[2]+CR_Z0,CR_Z1,k)];
    // the foot plate leans: its eight corners, so the view from off to one side shows a leaning plate and not a square block
    var plate=[];[-30,30].forEach(function(px){[CR_PA,CR_PB].forEach(function(e){[-5,5].forEach(function(o){plate.push([px,e[1]-CR_FZ*o,e[2]+CR_FY*o]);});});});
    return {p:{hip:hip,lean:lean,neck:-lean*.4,ank:[-18,CR_AY,CR_AZ],kneePole:[-.05,1,.2],footDir:[0,CR_FY,CR_FZ],
               hand:hand,elbPole:CR_POLE,shrug:[0,lerp(5,-5,k)],layer:{rear:{uarmR:'front'}}},
            gear:[{t:'box',a:[-24,48,-28],b:[24,61,44],d:{side:-100,back:-200,rear:-200}},
                  {t:'line',a:[0,46,8],b:[0,4,8],w:7,d:{side:-101,back:-201,rear:-201}},
                  {t:'line',a:CR_PA,b:CR_PB,w:10,v:['side'],d:{side:-100}},
                  {t:'box',a:CR_PA,b:CR_PB,pts:plate,v:['rear'],d:{rear:-300}},
                  {t:'line',a:[0,4,168],b:[0,46,168],w:7,v:['side','rear'],d:{side:-101,rear:-301}},
                  {t:'line',a:[0,128,262],b:[0,hand[1],hand[2]+4],w:4,d:{side:-5,back:-90}},
                  {t:'line',a:[-15,hand[1],hand[2]],b:[15,hand[1],hand[2]],w:8,col:'#d97b2e',d:{side:250,back:-500}}]};
  }},
thrust:{name:'Hip Thrust',batch:2,views:['side','front'],labels:['Side','From the feet'],cx:[262,240],ground:[60,420],up:1,
  lit:{glute:2,ham:1,quad:1},
  says:'The backside does the work. The thighs help.',
  pose:function(k){
    // the upper back rests on the bench edge and the body hinges round it
    var lean=lerp(-58,-90,k), u=[0,Math.cos(lean*R),Math.sin(lean*R)], n=[0,-Math.sin(lean*R),Math.cos(lean*R)];
    var P=[0,101,-78], hip=[0,P[1]-u[1]*80,P[2]-u[2]*80];
    var bar=[0,hip[1]+n[1]*24+u[1]*3,hip[2]+n[2]*24+u[2]*3];
    return {p:{hip:hip,lean:lean,neck:lerp(38,22,k),ank:[-25,B.ankH,96],kneePole:[-.15,1,.3],footDir:[-.2,0,1],
               hand:[-52,bar[1],bar[2]],elbPole:[-.8,-.4,-.3],layer:{front:{legs:'front'}}},
            gear:[{t:'box',a:[-110,72,-134],b:[110,86,-74],d:{side:-100,front:-400}},
                  {t:'line',a:[0,70,-136],b:[0,4,-136],w:7,d:{side:-101,front:-401}},{t:'line',a:[0,70,-88],b:[0,4,-88],w:7,v:['side'],d:{side:-101}},
                  {t:'bar',c:bar,half:112,r:PL,d:{front:200}}]};
  }},
legx:{name:'Leg Extension',batch:2,views:['side','front'],cx:[196,240],ground:[60,420],up:1,
  lit:{quad:2},
  says:'The front of the thigh does all of it.',
  pose:function(k){
    var hip=[0,130,0], lean=-14, a=lerp(-8,84,k)*R;
    var K=[-17,132,92], ank=[-17,K[1]-B.shin*Math.cos(a),K[2]+B.shin*Math.sin(a)];
    var fd=[0,Math.sin(a)*.96+.1,Math.cos(a)], sd=[0,-Math.cos(a),Math.sin(a)];
    var pad=[0,ank[1]+fd[1]*14-sd[1]*9,ank[2]+fd[2]*14-sd[2]*9];
    return {p:{hip:hip,lean:lean,neck:8,ank:ank,kneePole:[0,1,.25],footDir:fd,
               hand:[-37,116,6],elbPole:[-.3,0,-1],layer:{front:{legs:'front',footR:'front',footL:'front'}}},
            // the machine: seat with its front edge behind the knee, back rest, a frame on the floor, the weight
            // stack behind, and a lever arm that turns on the SAME line as the knee and carries the shin pad
            gear:[{t:'box',a:[-27,100,-28],b:[27,113,81],d:{side:-100,front:-400}},
                  {t:'line',a:[0,112,-24],b:[0,236,-54],w:12,v:['side'],d:{side:-100}},
                  {t:'box',a:[-30,8,-128],b:[30,176,-92],v:['side'],d:{side:-110}},
                  {t:'line',a:[0,6,-92],b:[0,6,112],w:8,v:['side'],d:{side:-105}},
                  {t:'line',a:[0,98,-12],b:[0,8,-12],w:8,v:['side'],d:{side:-101}},
                  {t:'line',a:[0,98,62],b:[0,8,62],w:8,d:{side:-101,front:-401}},
                  {t:'line',a:[0,104,62],b:[0,K[1],K[2]],w:8,v:['side'],d:{side:-102}},
                  {t:'line',a:[0,K[1],K[2]],b:pad,w:6,col:'#6a6159',v:['side'],d:{side:280}},
                  {t:'line',a:[-34,K[1],K[2]],b:[34,K[1],K[2]],w:11,col:'#6a6159',v:['side'],d:{side:290}},
                  {t:'line',a:[-34,K[1],K[2]],b:[-34,pad[1],pad[2]],w:6,col:'#6a6159',v:['front'],d:{front:940}},
                  {t:'line',a:[-34,pad[1],pad[2]],b:[30,pad[1],pad[2]],w:15,col:'#d97b2e',d:{side:300,front:950}}]};
  }},
pullup:{name:'Pull Up',batch:2,views:['side','back'],cx:[262,240],ground:[110,370],up:1,
  lit:{lats:2,biceps:1,forearm:1,traps:1,delt:1},
  says:'The wide muscles of the back pull you up. The arms help.',
  pose:function(k){
    var BY=PU_BY, lean=lerp(0,PU_LEAN,k), Sy=lerp(BY-124.5,BY-PU_TOP,k), Sz=lerp(-2,PU_SZ,k);
    var hip=[0,Sy-B.trunk*Math.cos(lean*R),Sz-B.trunk*Math.sin(lean*R)];
    return {p:{hip:hip,lean:lean,neck:lerp(4,-6,k),ank:[-12,hip[1]-PU_AY,hip[2]-lerp(PU_AZ0,PU_AZ1,k)],kneePole:[-.1,-.2,1],footDir:PU_FD,
               hand:[-64,BY,0],elbPole:PU_POLE,layer:{back:{arms:'front'}}},
            gear:[{t:'bar',c:[0,BY,0],half:96,r:5,d:{back:-500}}]};
  }},
calf:{name:'Standing Calf Raise',batch:2,views:['side','back'],cx:[236,240],up:1,
  lit:{calf:2},
  says:'The calf does all of it. Rise onto the balls of your feet.',
  pose:function(k){
    // the ball of the foot stays on the floor and the heel comes up round it
    var ph=lerp(0,40,k)*R, f=[0,-Math.sin(ph),Math.cos(ph)], dn=[0,-Math.cos(ph),-Math.sin(ph)];
    var ball=[-20,6.3,23], ank=[ball[0],ball[1]-f[1]*23-dn[1]*6.3,ball[2]-f[2]*23-dn[2]*6.3];
    var dz=lerp(CF_D0,CF_D1,k), hip=[0,ank[1]+Math.sqrt(176.2*176.2-dz*dz),ank[2]+dz], lean=1, S=S_of(hip,lean);
    var hand=[-52,S[1]-125,S[2]+3];
    return {p:{hip:hip,lean:lean,neck:0,ank:ank,kneePole:[-.1,0,1],footDir:[f[0],f[1],f[2]],
               hand:hand,elbPole:[0,0,-1],layer:{back:{footR:'front',footL:'front'}}},   // from behind the heel is the nearest thing: left to its own depth it swapped with the shin near the top and a line across the ankle came and went
            gear:dbs(hand,[0,0,1])};
  }}
};
})();
