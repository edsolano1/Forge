// The glowing i for the tap-through review copy only. Never part of the app.
// It knows which screen or sheet is on top and lists what changed there since v5.315.
(function(){
  var SHEET=['It slides up from the bottom and rests there, instead of appearing at the top.','Drag the bar at the top down to close it. It follows your finger and fades.','The same round X, top right, on every sheet.'];
  var N={
    welcome:['The Yes, No and Continue buttons are the app’s own pill buttons now. They were a different shape and font from everything after them.'],
    ez:['The small tick sound on each choice is gone.'],
    home:['The three lines you drag a workout by are bigger and clearly visible. They were small and dim.','The weekday names (SUN, MON) are in the title font. Before, each phone substituted its own.','REST on an empty day is readable.','Text sizes across the app were cut from 48 pairings to about 19. Nothing is smaller than 10.','A hint here dims the screen once, then leaves a ring. It no longer shows right after a workout.'],
    session:['After you log a set, the rest bar’s minus 15, plus 15 and SKIP are taller: 40 instead of 28.','A hint dims once for a moment, then a ring stays on the anvil. It does not flicker when you scroll.','The tip sits at the bottom instead of covering the next sets.','Tapping the wrong thing no longer dismisses the hint.'],
    make:['The bin on each row is a calm square button, not red, and the same size as the other icon buttons.','The drag lines match the ones on the board and in a workout.'],
    settingsOvl:['Four parts, one open at a time. Tap a part to open it; the others fold.','A shut part shows what it is set to.','It was nearly three screens long. It fits on one now.'],
    dayOvl:['Delete is no longer red. Deleting is recoverable, and red is kept for the question that asks if you are sure.','The words under the icons are bigger.'],
    savedOvl:['The plus and the X are the same size, lined up, and spaced apart. The plus is gold.'],
    histOvl:['The title stays on one line with Week, Month, All underneath it.','The big numbers are no longer a smeared bold.'],
    editOvl:['CANCEL and DONE are at the bottom, under your thumb. They were in the top third of the screen.','With the keyboard up, the sheet lifts clear of it.'],
    exMoreOvl:['The word CLOSE is gone. The X and the drag bar are the way out.','The X keeps clear space from the first row.'],
    instrOvl:['The heading says "How to do it", with the lift named underneath. It used to say only the lift’s name.'],
    exHistOvl:['The heading says "History", with the lift named underneath.'],
    exNoteOvl:['The heading says "Your note", with the lift named underneath.','Closing with the X or the bar saves the note and updates the card.'],
    plateOvl:['The X sits clear of the bar picker below it.'],
    lvlOvl:['LEVEL UP is in the title font, not a stand in.','RAISE ALL is the same height and shape as other main buttons.','It can be closed with the X or the bar as well as Not this time.'],
    pumpOvl:['The X no longer sits on top of the bin.','The bin is calm, not red.'],
    timerOvl:['The CLOSE button is gone, so START has the full width.'],
    mkCexOvl:['ADVANCED is a real button. It was bare text with a tiny line under it.'],
    askOvl:['A question sits at the bottom now, so its answers are under your thumb.','It has no X and no drag bar: it wants an answer.','A notice with one answer shows only OK. It used to show CANCEL beside it.'],
    exportOvl:['The finish screen is unchanged on purpose. It has no X and no bar.','The drag hint no longer pops up right after you finish.']
  };
  var seen={},open=false,cur='';
  var st=document.createElement('style');
  st.textContent='#wnBtn{position:fixed;left:8px;top:44%;z-index:5000;width:42px;height:42px;border-radius:50%;border:2px solid #ff8a1f;background:#1a0f08;color:#ff8a1f;font:400 22px Marcellus,Georgia,serif;display:grid;place-items:center;cursor:pointer;box-shadow:0 0 0 0 rgba(255,138,31,.7);user-select:none;-webkit-user-select:none}'+
    '#wnBtn.new{animation:wnPulse 1.5s ease-out infinite;background:#ff8a1f;color:#1b0f06}'+
    '@keyframes wnPulse{0%{box-shadow:0 0 0 0 rgba(255,138,31,.75),0 0 18px 4px rgba(255,138,31,.55)}70%{box-shadow:0 0 0 14px rgba(255,138,31,0),0 0 18px 4px rgba(255,138,31,.55)}100%{box-shadow:0 0 0 0 rgba(255,138,31,0),0 0 18px 4px rgba(255,138,31,.55)}}'+
    '#wnBtn u{position:absolute;right:-5px;top:-5px;min-width:18px;height:18px;border-radius:9px;background:#fff6e6;color:#1b0f06;font:400 11px "Share Tech Mono",monospace;text-decoration:none;display:grid;place-items:center;padding:0 4px}'+
    '#wnCard{position:fixed;left:12px;right:12px;top:50%;transform:translateY(-50%);z-index:5001;max-width:420px;margin:0 auto;border-radius:14px;border:1px solid #ff8a1f;background:linear-gradient(#2a180d,#150c08);box-shadow:0 0 0 200vmax rgba(4,2,1,.72),0 18px 40px -10px #000;padding:18px 18px 14px;color:#fff6e6;display:none;max-height:80vh;overflow:auto}'+
    '#wnCard.on{display:block}'+
    '#wnCard b{display:block;font:400 11px "Share Tech Mono",monospace;letter-spacing:.16em;color:#ff8a1f;text-transform:uppercase;margin-bottom:4px}'+
    '#wnCard h4{font:400 20px Marcellus,Georgia,serif;margin:0 0 10px;color:#fff6e6}'+
    '#wnCard ul{margin:0 0 6px;padding-left:18px}#wnCard li{font:400 14.5px Barlow,system-ui,sans-serif;line-height:1.4;color:#f0dcc6;margin:6px 0}'+
    '#wnCard .g{color:#bd9678}'+
    '#wnCard .row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}'+
    '#wnCard .row span{flex:1;min-height:40px;border-radius:999px;border:1px solid #4a2c1c;background:#130c09;color:#bd9678;font:400 11px "Share Tech Mono",monospace;letter-spacing:.14em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0 12px;white-space:nowrap}'+
    '#wnCard .row span.go{border-color:#a0521c;color:#ff8a1f;background:rgba(255,138,31,.08)}';
  document.head.appendChild(st);
  var btn=document.createElement('div');btn.id='wnBtn';btn.innerHTML='i<u></u>';document.body.appendChild(btn);
  var card=document.createElement('div');card.id='wnCard';document.body.appendChild(card);
  var NAMES={welcome:'The first run',ez:'The wizard',home:'The week board',session:'A workout',make:'The workout builder',settingsOvl:'Settings',dayOvl:'The day sheet',savedOvl:'Saved workouts',histOvl:'Workouts finished',editOvl:'The number sheet',exMoreOvl:'The lift menu',instrOvl:'How to do it',exHistOvl:'History',exNoteOvl:'Your note',plateOvl:'Plate calculator',lvlOvl:'Level up',pumpOvl:'Pump Day',timerOvl:'Quick timer',mkCexOvl:'Add your own exercise',askOvl:'A question',exportOvl:'The finish screen'};
  function on(id){var e=document.getElementById(id);return !!(e&&e.classList.contains('on'));}
  function ctx(){
    var best=null;[].forEach.call(document.querySelectorAll('.ovl.on'),function(o){if(!best||(o._openSeq||0)>=(best._openSeq||0))best=o;});
    if(best)return best.id;
    if(on('welcome'))return 'welcome';if(on('ez'))return 'ez';if(on('make'))return 'make';if(on('session'))return 'session';return 'home';
  }
  function notes(c){
    var a=(N[c]||[]).slice(),isSheet=/Ovl$/.test(c)&&c!=='askOvl'&&c!=='exportOvl';
    return {own:a,sheet:isSheet?SHEET:[]};
  }
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function draw(){
    var c=ctx(),n=notes(c),h='<b>What changed here</b><h4>'+esc(NAMES[c]||'This sheet')+'</h4>';
    if(n.own.length)h+='<ul>'+n.own.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';
    if(n.sheet.length)h+='<ul>'+n.sheet.map(function(x){return '<li class="g">'+esc(x)+'</li>';}).join('')+'</ul>';
    if(!n.own.length&&!n.sheet.length)h+='<ul><li class="g">Nothing specific to this screen.</li></ul>';
    h+='<div class="row">'+((c==='welcome'||c==='ez')?'<span data-skip>Skip to a ready week</span>':'')+'<span class="go" data-ok>Got it</span></div>';
    card.innerHTML=h;seen[c]=1;
  }
  function tick(){
    var c=ctx();
    if(c!==cur){cur=c;if(open){open=false;card.classList.remove('on');}}
    var n=notes(c),k=n.own.length+n.sheet.length;
    btn.classList.toggle('new',!seen[c]&&k>0);
    btn.querySelector('u').textContent=k||'';btn.querySelector('u').style.display=k?'':'none';
  }
  async function skip(){
    var W=function(ms){return new Promise(function(r){setTimeout(r,ms);});};
    try{
      if(on('ez')){try{ezClose();}catch(e){}await W(500);}
      var wc=document.getElementById('welcome');
      if(wc&&wc.classList.contains('on')){
        [].filter.call(wc.querySelectorAll('button'),function(b){return b.textContent.trim()==='No';}).forEach(function(b){b.click();});
        await W(300);var g=document.getElementById('wcGo');if(g)g.click();
        await W(1500);var p=document.querySelector('#wcPicks [onclick="wcPick(0)"]');if(p)p.click();await W(1300);
      }
      [].forEach.call(document.querySelectorAll('.ovl.on'),function(e){try{closeOvl(e.id);}catch(x){}});
      var any=false;DAYS.forEach(function(d){if((DB.days[d.k]||[]).length)any=true;});
      if(!any){forgeDay('mon','gym');forgeDay('wed','gym');forgeDay('fri','gym');await W(600);}
      [].forEach.call(document.querySelectorAll('.ovl.on'),function(e){try{closeOvl(e.id);}catch(x){}});
    }catch(e){}
  }
  btn.addEventListener('pointerdown',function(e){e.stopPropagation();},true);
  btn.addEventListener('click',function(e){e.stopPropagation();open=!open;if(open)draw();card.classList.toggle('on',open);tick();});
  card.addEventListener('pointerdown',function(e){e.stopPropagation();},true);
  card.addEventListener('click',function(e){
    e.stopPropagation();
    if(e.target.closest('[data-skip]')){open=false;card.classList.remove('on');skip();return;}
    if(e.target.closest('[data-ok]')){open=false;card.classList.remove('on');tick();}
  });
  setInterval(tick,300);tick();
})();
