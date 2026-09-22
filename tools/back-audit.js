// Back-button audit. Paste this whole file into the console of a running Forge (or evaluate it
// over CDP on the phone) and it prints a table: every sheet in the page, opened the way the app
// opens it, then the hardware back pressed the way Android presses it (onBackButton), and what
// happened. It ends with PASS or a list of what back left standing.
//
// Why it exists: back has been lost twice by somebody adding a screen and not knowing there was
// a branch to add it to. Sheets are found by reading the page, so a NEW SHEET IS AUDITED WITHOUT
// ANYONE REMEMBERING TO ADD IT HERE; what still needs a line is a full screen that is not an
// .ovl (see SCREENS below), and BACK_RULES in index.html is where back learns about it.
//
// It writes nothing: it seeds nothing, saves nothing, and puts the app back on the home screen.
(async function backAudit(){
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const el=id=>document.getElementById(id);
  const on=id=>!!(el(id)&&el(id).classList.contains('on'));
  const openIds=()=>[...document.querySelectorAll('.ovl.on')].map(o=>o.id);
  const rows=[];
  let failures=0;
  const note=(what,ok,detail)=>{rows.push({screen:what,back:ok?'closes it':'DID NOT',detail:detail||''});if(!ok)failures++;};

  async function home(){
    openIds().forEach(id=>{try{closeOvl(id);}catch(e){}});
    ['make','session'].forEach(id=>{try{el(id).classList.remove('on');}catch(e){}});
    await wait(150);
  }

  // ---- 1. every sheet in the page, found by reading it ----
  // Each is opened by hand (classList) rather than through its own opener: the question here is
  // only whether back can get OUT of it, and a sheet that opens itself empty still answers that.
  const sheets=[...document.querySelectorAll('.ovl')].map(o=>o.id).filter(Boolean);
  for(const id of sheets){
    await home();
    el(id).classList.add('on');
    await wait(160);
    if(!on(id)){note(id,false,'would not open for the audit');continue;}
    try{onBackButton();}catch(e){note(id,false,'back threw: '+e.message);continue;}
    await wait(320);
    // A sheet guarding an unsaved change asks first: that IS back working, so the question counts.
    const asked=on('askOvl')&&id!=='askOvl';
    note(id,!on(id)||asked,asked?'asks to keep the change first':(on(id)?'still open':''));
    if(asked){try{closeOvl('askOvl');}catch(e){}}
  }

  // ---- 2. the screens that are not sheets, which is what back forgets ----
  const SCREENS=[
    {n:'a session',    open:async()=>{const wk=(DB.days&&Object.values(DB.days).flat()[0]);if(!wk)return false;openW(wk);await wait(400);return on('session');},
                       out:()=>!on('session')},
    {n:'the builder',  open:async()=>{const wk=(DB.days&&Object.values(DB.days).flat()[0]);if(!wk)return false;openMake(wk,DB.custom&&DB.custom[wk]?wk:'');await wait(500);return on('make');},
                       out:()=>!on('make')||on('askOvl')},
    {n:'a night in the history',open:async()=>{if(!(DB.logs||[]).length)return false;showHistory();await wait(250);histOpen(0);await wait(250);return on('histOvl')&&HIST.sel!==null;},
                       out:()=>HIST.sel===null&&on('histOvl')},
    {n:'the saved fold',open:async()=>{savedOpen();await wait(200);return !!SAVED_OPEN;},
                       out:()=>!SAVED_OPEN}
  ];
  for(const s of SCREENS){
    await home();
    let opened=false;
    try{opened=await s.open();}catch(e){note(s.n,false,'could not be opened: '+e.message);continue;}
    if(!opened){note(s.n,true,'skipped: nothing here to open it with');continue;}
    try{onBackButton();}catch(e){note(s.n,false,'back threw: '+e.message);continue;}
    await wait(400);
    note(s.n,s.out(),s.out()?'':'back did not leave it');
  }

  await home();
  console.table(rows);
  const verdict=failures?('FAILED: '+failures+' place'+(failures===1?'':'s')+' back cannot get out of'):'PASS: back gets out of every sheet and screen';
  console.log(verdict);
  console.log('back rules, in order: '+BACK_RULES.map(r=>r.n).join(' -> ')+' -> offer to close the app');
  return {verdict:verdict,rows:rows};
})();
