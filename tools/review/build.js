const fs=require('fs');const sp=process.argv[2];
let s=fs.readFileSync('index.html','utf8');const j=fs.readFileSync(sp+'/sample/jump.js','utf8');
const i=s.lastIndexOf('</body>');if(i<0)throw new Error('no body end');
s=s.slice(0,i)+'<script>\n'+j+'\n</script>\n'+s.slice(i);
fs.writeFileSync(sp+'/sample/forge-markup.html',s);fs.writeFileSync('_jump_test.html',s);console.log('built',s.length);
