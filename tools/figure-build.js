// Rebuilds the lifter inside index.html from its source, tools/figure-rig.js and tools/figure-lifts.js.
// Run after changing a lift:  node tools/figure-build.js
// It replaces only the rig and the lifts inside FIGLIB. The pacing code after them is left as it stands.
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),file=path.join(root,'index.html');
let s=fs.readFileSync(file,'utf8');
const crlf=s.indexOf('\r\n')>=0;if(crlf)s=s.replace(/\r\n/g,'\n');
const rig=fs.readFileSync(path.join(__dirname,'figure-rig.js'),'utf8').replace(/\r\n/g,'\n'),
      lifts=fs.readFileSync(path.join(__dirname,'figure-lifts.js'),'utf8').replace(/\r\n/g,'\n');
if(/<\/script/i.test(rig+lifts))throw new Error('a script close tag inside the source would end the app\'s script block');
const HEAD='var FIGLIB=(function(){\n', a=s.indexOf(HEAD);
if(a<0||s.indexOf(HEAD,a+1)>=0)throw new Error('FIGLIB not found exactly once');
const z=s.indexOf('\nvar PACE=',a), end=s.indexOf('return {FIG:FIG,LIFTS:LIFTS,kOf:kOf};',a);
if(z<0||end<0||z>end)throw new Error('the pacing code after the lifts was not found');
s=s.slice(0,a+HEAD.length)+rig+'\n'+lifts+s.slice(z);
fs.writeFileSync(file,crlf?s.replace(/\n/g,'\r\n'):s);
console.log('lifter rebuilt, index.html is '+s.length+' characters');
