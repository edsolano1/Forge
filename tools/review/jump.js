// Review links for the tap-through copy only. Never part of the app.
(function(){
  var W8=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
  function until(fn,ms){var t0=Date.now();return new Promise(function(res){(function p(){var ok=false;try{ok=fn();}catch(e){}if(ok||Date.now()-t0>ms)res(ok);else setTimeout(p,150);})();});}
  function shut(){[].forEach.call(document.querySelectorAll('.ovl.on'),function(e){try{closeOvl(e.id);}catch(x){}});}
  function today(){var k='mon';DAYS.forEach(function(d){if(d.js===new Date().getDay())k=d.k;});return k;}
  function hintsQuiet(){try{['log','grip','exhold'].forEach(function(k){HINTQUIET[k]=1;});hintHide();}catch(e){}}
  async function seed(){
    await until(function(){return typeof splashGone!=='undefined'&&splashGone&&typeof forgeDay==='function';},9000);
    await W8(500);
    var wc=document.getElementById('welcome');
    if(wc&&wc.classList.contains('on')){
      [].filter.call(wc.querySelectorAll('button'),function(b){return b.textContent.trim()==='No';}).forEach(function(b){b.click();});
      var bs=wc.querySelectorAll('button');if(bs.length)bs[bs.length-1].click();
      await W8(1300);
      var p=document.querySelector('#wcPicks [onclick="wcPick(0)"]');if(p)p.click();
      await W8(1500);
    }
    shut();
    var any=false;DAYS.forEach(function(d){if((DB.days[d.k]||[]).length)any=true;});
    if(!any){forgeDay(today(),'gym');await W8(700);}
    shut();
  }
  async function session(){
    var ss=document.getElementById('session');
    if(!ss.classList.contains('on')){var c=document.querySelector('#weekCards .card[data-base]');if(c)c.click();await W8(1500);}
    shut();
  }
  function firstSlot(){var e=document.querySelector('#session .exc:not(.shut)')||document.querySelector('#session .exc');return e?e.id.slice(4):null;}
  async function more(word){
    var b=document.querySelector('#session .exc:not(.shut) .ex-more');if(!b)return;b.click();await W8(400);
    var it=[].find.call(document.querySelectorAll('#exMoreList *'),function(e){return e.textContent.indexOf(word)>=0&&(e.onclick||e.getAttribute('onclick'));});
    if(it)it.click();
  }
  var R={
    hint:async function(){try{localStorage.setItem('arc_hints','1');localStorage.removeItem('arc_hintseen');localStorage.removeItem('arc_hintsaw');HINTQUIET={};}catch(e){}
      var ss=document.getElementById('session');if(ss.classList.contains('on')){try{renderSession();}catch(e){}}else await session();},
    plusminus:async function(){hintsQuiet();await session();hintsQuiet();var x=document.querySelector('#session .exc:not(.shut) .srow.next .inp');if(x)x.click();},
    swap:async function(){hintsQuiet();await session();hintsQuiet();await more('Swap this lift');},
    howto:async function(){hintsQuiet();await session();hintsQuiet();await more('How to do it');},
    builder:async function(){hintsQuiet();await session();hintsQuiet();await more('Edit this workout');},
    timer:async function(){hintsQuiet();await session();hintsQuiet();openTimerSheet();},
    wizard:async function(){hintsQuiet();try{DAYS.forEach(function(d){DB.days[d.k]=[];});DB.active={};saveDB();renderHome();}catch(e){}ezOpen('days');},
    pump:async function(){hintsQuiet();savedShow();},
    forgeday:async function(){hintsQuiet();savedShow();await W8(300);svAdd();}
  };
  async function go(){
    var h=(location.hash||'').slice(1);if(!R[h])return;
    try{await seed();await R[h]();}catch(e){console.error('jump',e);}
    await W8(900);try{var ao=document.getElementById('askOvl');if(ao.classList.contains('on')&&/Back it up/.test(document.getElementById('askTitle').textContent))document.getElementById('askNo').click();}catch(e){}
  }
  window.addEventListener('hashchange',function(){location.reload();});
  go();
})();
