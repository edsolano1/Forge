// FIG: one body, fixed bone lengths, posed in 3D and drawn from any side.
// Units are canvas pixels on the app's 480 x 480 stage. y is UP from the floor,
// z is the way the lifter faces, x is across the body (the lifter's right is -x).
var FIG=(function(){
"use strict";
var INK="#e8ded2", FAR="#8d8378", GO="#d97b2e", LINE="#3a3632", HOT="#ff7a1a", DEF="rgba(70,48,30,.20)";
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
function solve(p){
  var R=Math.PI/180, L=(p.lean||0)*R;
  var u=[0,Math.cos(L),Math.sin(L)], n=[0,-Math.sin(L),Math.cos(L)], X=[1,0,0];
  var H=p.hip, S=add(H,mul(u,B.trunk));
  var J={u:u,n:n,H:H,S:S,side:{}};
  var Ln=((p.lean||0)+(p.neck||0))*R, nu=[0,Math.cos(Ln),Math.sin(Ln)];
  J.nu=nu; J.nn=[0,-Math.sin(Ln),Math.cos(Ln)];
  J.neck0=add(S,mul(u,6)); J.head=add(J.neck0,mul(nu,B.neck+B.headR[1]-2));
  [-1,1].forEach(function(s){
    var q={}, m=function(v){return v?[v[0]*-s,v[1],v[2]]:v;};   // poses are written for the right side (s=-1)
    q.hipJ=add(H,mul(X,s*B.hipW));
    q.shoJ=add(add(S,mul(X,s*B.shoW)),p.shrug?add(mul(u,p.shrug[0]),mul(n,p.shrug[1])):[0,0,0]);
    var ank=m(s<0?(p.ankR||p.ank):(p.ankL||p.ank));
    var kp=m(p.kneePole||[-.2,0,1]);
    var lg=ik(q.hipJ,ank,B.thigh,B.shin,kp);
    q.knee=lg.mid;q.ank=lg.end;q.legF=lg.bend;
    var fd=m(p.footDir||[-.17,0,1]);q.footDir=norm(fd);
    var hd=m(s<0?(p.handR||p.hand):(p.handL||p.hand));
    var ep=m(p.elbPole||[-.3,-1,-.4]);
    var ar=ik(q.shoJ,hd,B.uarm,B.farm,ep);
    q.elb=ar.mid;q.hand=ar.end;q.armB=ar.bend;
    J.side[s]=q;
  });
  return J;
}

// ---- views ----
function view(kind,cx){
  if(kind==='side')return {k:kind,v:[-1,0,0],p:function(a){return [cx+a[2],FLOOR-a[1],-a[0]];},d:function(a){return [a[2],-a[1]];}};
  if(kind==='back')return {k:kind,v:[0,0,-1],p:function(a){return [cx-a[0],FLOOR-a[1],-a[2]];},d:function(a){return [-a[0],-a[1]];}};
  return {k:kind,v:[0,0,1],p:function(a){return [cx+a[0],FLOOR-a[1],a[2]];},d:function(a){return [a[0],-a[1]];}};
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
  var parts=[], u=J.u, n=J.n, X=[1,0,0];
  function depth(c){return V.p(c)[2];}
  function part(name,blobs,joint,jr,far,order){
    var d=0;blobs.forEach(function(b){d+=depth(b.c);});
    parts.push({name:name,blobs:blobs,d:d/blobs.length,joint:joint,jr:jr,far:far,o:order,mus:[]});
    return parts[parts.length-1];
  }
  // torso
  var tb=TOR.map(function(t){
    var c=add(add(J.H,mul(u,t[0]*B.trunk)),mul(n,(t[2]-t[3])/2));
    return {c:c,ax:[mul(X,t[1]),mul(n,(t[2]+t[3])/2),mul(u,3)]};
  });
  var torso=part('torso',tb,null,0,false,10);
  function tpt(f){return add(J.H,mul(u,f*B.trunk));}
  function tm(key,f,lat,face,hh,hw,dep){
    var N=mul(n,face), c=add(add(tpt(f),mul(X,lat)),mul(N,dep*.72));
    torso.mus.push({key:key,c:c,ax:[mul(u,hh),mul(X,hw),mul(N,dep*.5)],N:N});
  }
  tm('chest',.77,-17,1,13,15,19);tm('chest',.77,17,1,13,15,19);
  tm('abs',.36,0,1,25,10,14);
  tm('lats',.56,-20,-1,27,12,15);tm('lats',.56,20,-1,27,12,15);
  tm('traps',.93,0,-1,15,21,14);
  tm('lowback',.20,-8,-1,19,6,14);tm('lowback',.20,8,-1,19,6,14);
  tm('glute',-.02,-14,-1,15,12,18);tm('glute',-.02,14,-1,15,12,18);
  // neck and head
  part('neck',[sph(add(J.S,mul(u,2)),9),sph(add(J.neck0,mul(J.nu,B.neck)),8)],add(J.S,mul(u,4)),13,false,11);
  var hr=B.headR;
  part('head',[{c:J.head,ax:[[hr[0],0,0],mul(J.nu,hr[1]),mul(J.nn,hr[2])]},
               {c:add(add(J.head,mul(J.nu,-12)),mul(J.nn,6)),ax:[[11,0,0],mul(J.nu,10),mul(J.nn,12)]}],
       add(J.neck0,mul(J.nu,B.neck)),10,false,12);
  [-1,1].forEach(function(s){
    var q=J.side[s], far=(V.k==='side'&&s>0);
    function limb(name,a,b,rs,ts,front,bulge,joint,jr,order){
      var bl=rs.map(function(r,i){var c=mix(a,b,ts[i]);if(bulge&&bulge[i])c=add(c,mul(front,bulge[i]));return sph(c,r);});
      var P=part(name,bl,joint,jr,far,order);
      P.a=a;P.b=b;P.dir=norm(sub(b,a));P.L=len(sub(b,a));P.front=front;
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
    var fd=q.footDir, dn=[0,-1,0];
    part('foot',[sph(add(add(q.ank,mul(fd,-5)),mul(dn,5)),7),sph(add(add(q.ank,mul(fd,23)),mul(dn,6.3)),5.7),sph(add(add(q.ank,mul(fd,36)),mul(dn,7.4)),4.6)],
         q.ank,8,far,22);
    var ua=limb('uarm',q.shoJ,q.elb,[12.5,10.5,8.5],[0,.45,1],mul(q.armB,-1),null,q.shoJ,15,30);
    ua.mus.push({key:'delt',c:q.shoJ,ax:[[11.5,0,0],[0,11.5,0],[0,0,11.5]],N:V.v});
    lm(ua,'biceps',.58,.28,10,1);lm(ua,'triceps',.52,.32,10,-1);
    var wr=mix(q.elb,q.hand,B.wrist);
    var fa=limb('farm',q.elb,wr,[8.5,9.2,6.2,5.6],[0,.3,.8,1],mul(q.armB,-1),null,q.elb,10,31);
    lm(fa,'forearm',.3,.24,8,1,true);
    part('hand',[sph(mix(wr,q.hand,.35),6),sph(q.hand,7.6)],wr,7,far,32);
  });
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
  x.fillStyle=P.far?FAR:INK;x.fill(path);
  if(P.far||!P.mus.length)return;
  x.save();x.clip(path);
  P.mus.forEach(function(m){
    if(dot3(norm(m.N),V.v)<-.2)return;
    var lv=lit&&lit[m.key];
    x.fillStyle=lv===2?HOT:DEF;
    x.globalAlpha=lv===2?1:(lv===1?1:1);
    if(lv===1)x.fillStyle="rgba(255,122,26,.42)";
    var pts=blobPts(V,m.c,m.ax,20);
    x.beginPath();x.moveTo(pts[0][0],pts[0][1]);for(var i=1;i<pts.length;i++)x.lineTo(pts[i][0],pts[i][1]);x.closePath();x.fill();
  });
  x.restore();
}
function drawGear(x,V,g){
  var a,b,c;
  if(g.t==='bar'){                               // a loaded bar lying across the body
    c=V.p(g.c);
    if(V.k==='side'){
      if(g.r>8){
        x.fillStyle="rgba(18,16,14,.62)";x.beginPath();x.arc(c[0],c[1],g.r,0,7);x.fill();
        x.strokeStyle=GO;x.lineWidth=7;x.beginPath();x.arc(c[0],c[1],g.r-3.5,0,7);x.stroke();
      }
      x.fillStyle=GO;x.beginPath();x.arc(c[0],c[1],g.r>8?6:5,0,7);x.fill();
    }else{
      x.strokeStyle=GO;x.lineWidth=7;x.lineCap='round';
      x.beginPath();x.moveTo(c[0]-g.half,c[1]);x.lineTo(c[0]+g.half,c[1]);x.stroke();
      if(g.r>8){x.fillStyle=GO;x.fillRect(c[0]-g.half-2,c[1]-g.r,13,g.r*2);x.fillRect(c[0]+g.half-11,c[1]-g.r,13,g.r*2);}
    }
  }else if(g.t==='line'){
    a=V.p(g.a);b=V.p(g.b);
    x.strokeStyle=g.col||LINE;x.lineWidth=g.w||6;x.lineCap='round';
    x.beginPath();x.moveTo(a[0],a[1]);x.lineTo(b[0],b[1]);x.stroke();
  }else if(g.t==='box'){                         // a pad or a bench top, given by two corners
    a=V.p(g.a);b=V.p(g.b);
    var x0=Math.min(a[0],b[0]),y0=Math.min(a[1],b[1]),w=Math.abs(a[0]-b[0]),h=Math.abs(a[1]-b[1]);
    x.fillStyle="#211e1b";x.strokeStyle=LINE;x.lineWidth=4;x.lineJoin='round';
    x.beginPath();x.rect(x0,y0,w,h);x.fill();x.stroke();
  }
}
function gearDepth(V,g){
  if(g.t==='bar'){if(V.k==='side')return 200;if(g.d&&g.d[V.k]!=null)return g.d[V.k];return V.p(g.c)[2];}
  if(g.d!=null)return g.d[V.k]!=null?g.d[V.k]:0;
  return (V.p(g.a)[2]+V.p(g.b)[2])/2;
}
function draw(x,kind,pose,gear,lit,cx,ground){
  x.clearRect(0,0,480,480);
  var V=view(kind,cx==null?240:cx);
  x.strokeStyle=LINE;x.lineWidth=6;x.lineCap='round';
  x.beginPath();x.moveTo(ground?ground[0]:90,FLOOR+3);x.lineTo(ground?ground[1]:390,FLOOR+3);x.stroke();
  var J=solve(pose), items=[];
  var lay=pose.layer&&pose.layer[kind];
  buildParts(J,V).forEach(function(P){
    if(lay){
      var grp=P.o>=30?'arms':(P.o>=20?'legs':null);
      if(grp&&lay[grp])P.d=(lay[grp]==='front'?1:-1)*(grp==='arms'?1000:900);
    }
    items.push({d:Math.round(P.d*50)/50,o:P.o,P:P});
  });
  (gear||[]).forEach(function(g){
    items.push({d:gearDepth(V,g),o:g.t==='bar'?99:0,g:g});
  });
  items.sort(function(a,b){return a.d-b.d||a.o-b.o;});
  items.forEach(function(it){if(it.P)drawPart(x,V,it.P,lit);else drawGear(x,V,it.g);});
  return J;
}
return {draw:draw,solve:solve,B:B,lerp:lerp,add:add,mul:mul,view:view,parts:buildParts,blobPts:blobPts,gearDepth:gearDepth,TOR:TOR};
})();

// ---------------- the five lifts ----------------
// stand: a standing lift, so the bar must stay over the middle of the foot.
// tall: the end of the rep (k) where the lifter stands fully upright.
var LIFTS=(function(){
"use strict";
var B=FIG.B, lerp=FIG.lerp, R=Math.PI/180, ARM=B.uarm+B.farm-.6, PL=44;
function S_of(hip,lean){return [0,hip[1]+B.trunk*Math.cos(lean*R),hip[2]+B.trunk*Math.sin(lean*R)];}
function smooth(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);}
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
            gear:[{t:'bar',c:bar,half:112,r:PL,d:{front:-500}}]};
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
    return {p:p,gear:[{t:'bar',c:[0,by,bz],half:112,r:PL,d:{back:-500}}]};
  }},
bench:{name:'Bench Press',views:['side','back'],labels:['Side','From the head end'],cx:[236,240],ground:[60,420],up:1,
  lit:{chest:2,triceps:2,delt:1},
  says:'The chest and the back of the arms push. The shoulders help.',
  pose:function(k){
    var hip=[0,108,44], lean=-90, S=S_of(hip,lean);
    var bar=[0,lerp(135.5,S[1]+ARM-5,k),lerp(-28,S[2]+2,k)];
    return {p:{hip:hip,lean:lean,neck:0,ank:[-36,B.ankH,124],kneePole:[-.1,1,.5],footDir:[-.2,0,1],
               hand:[-76,bar[1],bar[2]],elbPole:[-.35,-1,.5]},
            gear:[{t:'box',a:[-30,74,-140],b:[30,88,54],d:{side:-100,back:-40,front:-200}},
                  {t:'line',a:[0,70,-116],b:[0,4,-116],w:7,d:{side:-101,back:-41}},{t:'line',a:[0,70,36],b:[0,4,36],w:7,d:{side:-101,back:-300}},
                  {t:'bar',c:bar,half:112,r:PL,d:{back:500}}]};
  }},
row:{name:'Barbell Row',views:['side','back'],cx:[236,240],stand:1,up:1,
  lit:{lats:2,traps:2,biceps:1,delt:1,lowback:1,forearm:1},
  says:'The big muscles of the back pull. The arms and lower back help.',
  pose:function(k){
    var hip=[0,168,-67], lean=63, S=S_of(hip,lean);
    var bar=[0,lerp(S[1]-ARM+1,178,k),lerp(S[2]+1,8,k)];
    return {p:{hip:hip,lean:lean,neck:-16,ank:[-22,B.ankH,0],kneePole:[-.1,0,1],footDir:[-.15,0,1],
               hand:[-46,bar[1],bar[2]],elbPole:[-.25,.5,-1]},
            gear:[{t:'bar',c:bar,half:112,r:PL,d:{back:-500}}]};
  }},
pull:{name:'Lat Pulldown',views:['side','back'],cx:[214,240],ground:[80,400],up:1,
  lit:{lats:2,biceps:1,forearm:1,traps:1,delt:1},
  says:'The wide muscles down the sides of the back. The arms and shoulders help.',
  pose:function(k){
    var hip=[0,112,0], lean=-9, S=S_of(hip,lean);
    var bar=[0,lerp(S[1]+ARM-8,221,k),lerp(8,16,k)];
    return {p:{hip:hip,lean:lean,neck:10,ank:[-22,B.ankH,92],kneePole:[-.05,1,.6],footDir:[-.1,0,1],
               hand:[-72,bar[1],bar[2]],elbPole:[-.6,-1,-.12],layer:{back:{arms:'back'}}},
            gear:[{t:'box',a:[-26,80,-26],b:[26,92,44],d:{side:-100,back:-200}},
                  {t:'line',a:[0,78,8],b:[0,4,8],w:7,d:{side:-101,back:-201}},
                  {t:'box',a:[-30,120,40],b:[30,133,80],d:{side:100,back:-150}},
                  {t:'line',a:[0,440,8],b:bar,w:4,d:{side:-5,back:-90}},
                  {t:'bar',c:bar,half:96,r:5,d:{back:-500}}]};
  }}
};
})();
