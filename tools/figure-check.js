// The figure checker. Runs every lift through every frame and reports what a person
// would otherwise have to spot by eye:
//   THROUGH  a bar passing through a limb or the trunk
//   FLIP     two overlapping things swapping which is in front, mid rep
//   REACH    a hand or foot that could not reach where the lift put it (the bone clamp fired)
//   FLOOR    anything below the floor
//   JUMP     a joint moving too far in one frame (a snap)
// usage: node check.js path/to/fig.js [liftId]
var fs=require('fs'),vm=require('vm');
var ctx={Path2D:function(){},Math:Math,console:console};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[2],'utf8')+';this.FIG=FIG;this.LIFTS=LIFTS;',ctx);
var FIG=ctx.FIG,LIFTS=ctx.LIFTS,B=FIG.B,N=60,only=process.argv[3];
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function len(a){return Math.sqrt(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]);}
// shortest distance between segment p1-p2 and segment q1-q2
function segDist(p1,p2,q1,q2){
  var d1=sub(p2,p1),d2=sub(q2,q1),r=sub(p1,q1),a=d1[0]*d1[0]+d1[1]*d1[1]+d1[2]*d1[2],e=d2[0]*d2[0]+d2[1]*d2[1]+d2[2]*d2[2];
  var f=d2[0]*r[0]+d2[1]*r[1]+d2[2]*r[2],c=d1[0]*r[0]+d1[1]*r[1]+d1[2]*r[2],b=d1[0]*d2[0]+d1[1]*d2[1]+d1[2]*d2[2];
  var den=a*e-b*b,s=den>1e-9?Math.min(1,Math.max(0,(b*f-c*e)/den)):0,t=(b*s+f)/e;
  if(t<0){t=0;s=Math.min(1,Math.max(0,-c/a));}else if(t>1){t=1;s=Math.min(1,Math.max(0,(b-c)/a));}
  var x=[p1[0]+d1[0]*s-q1[0]-d2[0]*t,p1[1]+d1[1]*s-q1[1]-d2[1]*t,p1[2]+d1[2]*s-q1[2]-d2[2]*t];
  return {d:len(x),s:s};
}
var total=0;
Object.keys(LIFTS).forEach(function(id){
  if(only&&only!==id)return;
  var L=LIFTS[id],found={},prev=null,prevOrder={},prevNow=null,prevVel=null;
  function say(kind,what,k,w){var key=kind+' '+what;if(!found[key])found[key]={k0:k,k1:k,worst:w||0};found[key].k1=k;if(w>found[key].worst)found[key].worst=w;}
  for(var f=0;f<=N;f++){
    var k=f/N,r=L.pose(k),p=r.p,J=FIG.solve(p);
    [-1,1].forEach(function(s){
      var q=J.side[s],nm=s<0?'right':'left';
      // REACH: did the limb get where the pose asked?
      var m=function(v){return [v[0]*-s,v[1],v[2]];};
      var wantH=m(s<0?(p.handR||p.hand):(p.handL||p.hand)),wantA=m(s<0?(p.ankR||p.ank):(p.ankL||p.ank));
      if(len(sub(wantH,q.hand))>.5)say('REACH',nm+' hand short by '+len(sub(wantH,q.hand)).toFixed(1),k);
      if(len(sub(wantA,q.ank))>.5)say('REACH',nm+' foot short by '+len(sub(wantA,q.ank)).toFixed(1),k);
      // BEND: joints past what a body can do
      function ang(a,b,cc){var v1=sub(a,b),v2=sub(cc,b);return Math.acos(Math.max(-1,Math.min(1,(v1[0]*v2[0]+v1[1]*v2[1]+v1[2]*v2[2])/(len(v1)*len(v2)))))*180/Math.PI;}
      var ea=ang(q.shoJ,q.elb,q.hand),ka=ang(q.hipJ,q.knee,q.ank);
      var th=sub(q.knee,q.hipJ),ha=Math.acos((th[1]*J.u[1]+th[2]*J.u[2])/len(th))*180/Math.PI;
      if(ea<32)say('BEND',nm+' elbow folded past the limit, inner angle',k,180-ea);
      if(ka<40)say('BEND',nm+' knee folded past the limit',k,180-ka);
      if(ha<45)say('BEND',nm+' thigh folded into the belly, degrees of hip bend',k,180-ha);
      if(L.tall===k&&ka<166)say('TALL',nm+' knee still bent when standing tall, degrees',k,180-ka);
      // ARM THROUGH LEG
      [-1,1].forEach(function(s2){var g2=J.side[s2];
        [['forearm',q.elb,q.hand,7],['upper arm',q.shoJ,q.elb,10]].forEach(function(A){
          [['thigh',g2.hipJ,g2.knee,15,10.5],['shin',g2.knee,g2.ank,11,6.5]].forEach(function(c2){
            var o=segDist(c2[1],c2[2],A[1],A[2]),pen=c2[3]+(c2[4]-c2[3])*o.s+A[3]-o.d;
            if(pen>4)say('THROUGH',nm+' '+A[0]+' in a '+c2[0],k,pen);
          });});});
      // FLOOR
      ['knee','ank','elb','hand'].forEach(function(j){if(q[j][1]<4)say('FLOOR',nm+' '+j,k);});
      // THROUGH: each bar against thigh, shin, upper arm and the trunk
      (r.gear||[]).forEach(function(g){
        if(g.t!=='bar')return;
        var a=[-g.half,g.c[1],g.c[2]],b=[g.half,g.c[1],g.c[2]];
        [['thigh',q.hipJ,q.knee,15,10.5],['shin',q.knee,q.ank,11,6.5],['upper arm',q.shoJ,q.elb,11.5,8.5]].forEach(function(c){
          var o=segDist(c[1],c[2],a,b),rad=c[3]+(c[4]-c[3])*o.s,pen=rad+3.5-o.d;
          if(pen>3)say('THROUGH','bar in '+nm+' '+c[0],k,pen);
        });
      });
    });
    (r.gear||[]).forEach(function(g){
      if(g.t!=='bar')return;
      // BALANCE: a standing lifter keeps the bar over the middle of the foot
      if(L.stand&&Math.abs(g.c[2]-11.5)>14)say('BALANCE','bar off the middle of the foot by',k,Math.abs(g.c[2]-11.5));
      // trunk: the bar point against each cross-section, in the body's own frame
      var rel=sub(g.c,J.H),up=rel[1]*J.u[1]+rel[2]*J.u[2],fw=rel[1]*J.n[1]+rel[2]*J.n[2],fr=up/B.trunk;
      for(var i=0;i<FIG.TOR.length-1;i++){var t0=FIG.TOR[i],t1=FIG.TOR[i+1];if(fr>=t0[0]&&fr<=t1[0]){
        var w=(fr-t0[0])/(t1[0]-t0[0]),front=t0[2]+(t1[2]-t0[2])*w,back=t0[3]+(t1[3]-t0[3])*w;
        var pen=fw>=0?front+3.5-fw:back+3.5+fw;
        if(pen>4)say('THROUGH','bar in trunk'+(fw>=0?' (front)':' (back)'),k,pen);
      }}
      var hd=len(sub(g.c,J.head));if(Math.abs(g.c[0])<1&&hd<20)say('THROUGH','bar in head',k);
    });
    // FLIP: draw order of overlapping things, per view
    L.views.forEach(function(vk,vi){
      var V=FIG.view(vk,240),items=[];
      FIG.parts(J,V).forEach(function(P){
        var x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
        P.blobs.forEach(function(bl){FIG.blobPts(V,bl.c,bl.ax,8).forEach(function(pt){x0=Math.min(x0,pt[0]);x1=Math.max(x1,pt[0]);y0=Math.min(y0,pt[1]);y1=Math.max(y1,pt[1]);});});
        var lay=p.layer&&p.layer[vk],grp=P.o>=30?'arms':(P.o>=20?'legs':null),dd=P.d;if(lay&&grp&&lay[grp])dd=(lay[grp]==='front'?1:-1)*(grp==='arms'?1000:900);
        items.push({n:P.name+(P.blobs[0].c[0]<-1?' R':P.blobs[0].c[0]>1?' L':''),lim:grp?grp+(P.blobs[0].c[0]<0?'R':'L'):'',d:Math.round(dd*50)/50,o:P.o,bb:[x0,y0,x1,y1]});
      });
      (r.gear||[]).forEach(function(g,gi){if(g.t!=='bar')return;var c=V.p(g.c);
        items.push({n:'bar',d:FIG.gearDepth(V,g),o:99,bb:vk==='side'?[c[0]-g.r,c[1]-g.r,c[0]+g.r,c[1]+g.r]:[c[0]-g.half,c[1]-4,c[0]+g.half,c[1]+4]});});
      for(var a=0;a<items.length;a++)for(var b=a+1;b<items.length;b++){
        var A=items[a],Bb=items[b];
        var ov=Math.min(A.bb[2],Bb.bb[2])-Math.max(A.bb[0],Bb.bb[0]),oh=Math.min(A.bb[3],Bb.bb[3])-Math.max(A.bb[1],Bb.bb[1]);
        if(ov<6||oh<6)continue;
        if(A.lim&&A.lim===Bb.lim&&Math.abs(A.o-Bb.o)===1)continue;   // neighbours on one limb share a joint and a colour
        var key=vk+'|'+A.n+'|'+Bb.n,front=(A.d-Bb.d||A.o-Bb.o)>0?A.n:Bb.n;
        var real=L.okFlip&&/torso/.test(key)&&/arm|hand/.test(key);   // an arm truly passing from in front of the trunk to behind it
        if(!real&&prevOrder[key]&&prevOrder[key].f===f-1&&prevOrder[key].front!==front)say('FLIP',vk+' view: '+A.n+' and '+Bb.n+' swap',k);
        prevOrder[key]={f:f,front:front};
      }
    });
    // JUMP
    if(prev)[-1,1].forEach(function(s){['knee','elb'].forEach(function(j){var d=len(sub(J.side[s][j],prev.side[s][j]));if(d>9)say('JUMP',(s<0?'right ':'left ')+j+' moved '+d.toFixed(0)+' in one frame',k);});});
    // JERK: a hand, hip or bar that changes speed sharply between frames reads as a shake
    var now={hand:J.side[-1].hand,hip:J.H,sho:J.S};(r.gear||[]).forEach(function(g){if(g.t==='bar')now.bar=g.c;});
    if(prevNow&&prevVel)Object.keys(now).forEach(function(nk){var v=sub(now[nk],prevNow[nk]),dv=len(sub(v,prevVel[nk]||v));if(dv>2.2)say('JERK',nk+' changes speed sharply, by',k,dv);});
    if(prevNow){prevVel={};Object.keys(now).forEach(function(nk){prevVel[nk]=sub(now[nk],prevNow[nk]);});}
    prevNow=now;
    prev=J;
  }
  // RUSH: the hands should travel at an even speed through the rep. A stretch much faster than the rest reads as a jerk.
  var hs=[],hp=null;for(var f2=0;f2<=N;f2++){var hq=FIG.solve(L.pose(f2/N).p).side[-1].hand;if(hp)hs.push(len(sub(hq,hp)));hp=hq;}
  var mean=hs.reduce(function(a,b){return a+b;},0)/hs.length,peak=Math.max.apply(null,hs);
  if(peak>mean*1.6)say('RUSH','hands move '+(peak/mean).toFixed(1)+' times their average speed at one point',hs.indexOf(peak)/N);
  var keys=Object.keys(found);total+=keys.length;
  console.log('\n'+L.name+': '+(keys.length?keys.length+' to look at':'clean'));
  keys.forEach(function(key){var e=found[key];console.log('  '+key+(e.worst?', worst '+e.worst.toFixed(0):'')+'   (k '+e.k0.toFixed(2)+(e.k1!==e.k0?' to '+e.k1.toFixed(2):'')+')');});
});
console.log('\nTOTAL '+total);
