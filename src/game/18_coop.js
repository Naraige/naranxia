/* ================= Co-op: peer to peer lockstep (WebRTC, manual code exchange) ================= */
const MPD=6,MPSTEP=1/30;
Object.assign(MP,{pc:null,dc:null,tick:0,loc:{},rem:{},out:[],sent:0,acc:0,stall:false,hs:{},hr:{},desync:false,simR:null,lostAt:0});
/* visual helpers must never consume the shared simulation random stream */
const _puff=puff,_snd=snd;
puff=function(){const m=Math.random;Math.random=REALR;try{return _puff.apply(null,arguments)}finally{Math.random=m}};
snd=function(n){if(MP.ex&&MP.rmt&&(n==='err'||n==='click'))return;const m=Math.random;Math.random=REALR;try{return _snd.apply(null,arguments)}finally{Math.random=m}};
const _N={setStance,startResearch2,order,build,train,startResearch,callWave,groupSel,ungroupSel,confirmPick,trade};
const selIds=()=>sel().map(u=>u.uid),mpPush=c=>MP.out.push(c),gated=()=>MP.on&&!MP.ex;
order=function(w){if(gated()){mpPush({k:'o',i:selIds(),x:w.x,y:w.y,f:formType,fa:FORCEF});return}return _N.order(w)};
build=function(t,x,y){if(gated()){mpPush({k:'b',t,x,y,r:buildRot,ti:BTIER,gl:gateLen,sb:selB&&structs.includes(selB)?selB.sid:null});return}return _N.build(t,x,y)};
train=function(t){if(gated()){mpPush({k:'t',t,b:curB().sid});return}return _N.train(t)};
startResearch=function(){if(gated()){mpPush({k:'r'});return}return _N.startResearch()};
const repairB=function(sid){if(gated()){mpPush({k:'rp',b:sid});return}return repair0(sid)};
startResearch2=function(k){if(gated()){mpPush({k:'r2',n:k});return}return _N.startResearch2(k)};
callWave=function(){if(gated()){mpPush({k:'w'});return}return _N.callWave()};
trade=function(k){if(gated()){mpPush({k:'tr',n:k});return}return _N.trade(k)};
kingSkill=function(n){if(gated()){mpPush({k:'ks',n});return}return kingSkill0(n)};
const sendConvoy=function(c){if(gated()){mpPush({k:'cv',g:c.g|0,w:c.w|0,s:c.s|0,f:c.f|0});return}return sendConvoy0(c)};
const ROLEK=new Set(['rb+','rb-','rr+','rr-','rt+','rt-']),roleAdj=function(r,d){if(gated()){mpPush({k:'ro',r,d});return}return roleAdj0(r,d)};
setStance=function(st){if(gated()){mpPush({k:'st',i:selIds(),s:st});return}return _N.setStance(st)};
groupSel=function(){if(gated()){mpPush({k:'g',i:selIds()});return}return _N.groupSel()};
ungroupSel=function(){if(gated()){mpPush({k:'u',i:selIds()});return}return _N.ungroupSel()};
function withSel(S,fn){const keep=units.map(u=>u.sel);units.forEach(u=>u.sel=S.has(u.uid));try{fn()}finally{units.forEach((u,i)=>u.sel=keep[i])}}
function mpExec(c,mine){const m0=msgS,mt0=msgT,sl=selB,fm=formType,br=buildRot;MP.ex=true;MP.rmt=!mine;MP.note=null;setPl(mine?LPL():1-LPL());
 try{switch(c.k){
  case'o':formType=c.f;FORCEF=c.fa==null?null:c.fa;try{withSel(new Set(c.i),()=>{if(sel().length)_N.order({x:c.x,y:c.y})})}finally{FORCEF=null}break;
  case'b':{buildRot=c.r;gateLen=c.gl||2;selB=c.sb!=null?(structs.find(s=>s.sid===c.sb)||null):null;const bt0=BTIER;setTier(c.ti===undefined?1:c.ti);try{_N.build(c.t,c.x,c.y)}finally{setTier(bt0)}break}
  case't':selB=structs.find(s=>s.sid===c.b&&(s.pl|0)===CURPL)||null;_N.train(c.t);break;
  case'r':{const was=RS.on;_N.startResearch();if(!mine&&!was&&RS.on)MP.note=(MP.pname||'Your partner')+' started Stonemasonry (shared)';break}
  case'rp':repair0(c.b);break;
  case'w':_N.callWave();break;
  case'r2':{const was=RS2.on;_N.startResearch2(c.n);if(!mine&&!was&&RS2.on===c.n)MP.note=(MP.pname||'Your partner')+' started '+RN2[c.n]+' (shared)';break}
  case'tr':_N.trade(c.n);break;
  case'ro':roleAdj0(c.r,c.d);break;
  case'g':withSel(new Set(c.i),()=>_N.groupSel());break;
  case'u':withSel(new Set(c.i),()=>_N.ungroupSel());break
  case'st':withSel(new Set(c.i),()=>_N.setStance(c.s));break
  case'ks':kingSkill0(c.n);break;
  case'cv':sendConvoy0(c);break}}
 finally{MP.ex=false;MP.rmt=false;setPl(LPL());selB=sl;formType=fm;buildRot=br;if(!mine){msgS=m0;msgT=mt0;if(MP.note){msgS=MP.note;msgT=4;MP.note=null}}}}
function setPause(v){paused=v;autoPaused=false;if(MP.on)mpSend({k:'p',v})}
function mpSend(o){try{if(MP.dc&&MP.dc.readyState==='open')MP.dc.send(JSON.stringify(o))}catch(e){}}
function mpHash(){let h=(units.length*7+structs.length*13+queue.length*3+RESP.reduce((a,R,i)=>Math.imul(a,131)+Math.round(R.g)*3+Math.round(R.w)*5+Math.round(R.s)*11+Math.round(R.f||0)*17+i,0))|0;
 for(const u of units)h=(Math.imul(h,31)+((u.x*8)|0)+Math.imul((u.y*8)|0,7)+(u.hp|0))|0;h=(Math.imul(h,31)+SW.n)|0;for(let i=0;i<SW.n;i+=17)h=(Math.imul(h,31)+((SW.x[i]*8)|0)+Math.imul((SW.y[i]*8)|0,7))|0;return h}
function mpChk(t){if(MP.hs[t]!==undefined&&MP.hr[t]!==undefined){const hl=MP.hl||(MP.hl=[]);hl.push([t,MP.hs[t],MP.hr[t]]);if(hl.length>60)hl.shift();if(MP.hs[t]!==MP.hr[t]){MP.desync=true;MP.dsN=(MP.dsN|0)+1;if(MP.host)mpResync();else mpSend({k:'rsq',e:MP.ep})}delete MP.hs[t];delete MP.hr[t]}}
/* ---- co-op: automatic resynchronisation ----
   when the state hashes of the two machines differ, the host freezes the lockstep, sends a full snapshot of its game (the save
   format, in chunks), the guest loads it, then the host loads the very same snapshot and both restart from that tick with a
   fresh shared random stream: everything rebuilt while loading is rebuilt the same way on both sides, so the games agree again.
   Command and hash messages carry an epoch so nothing from before the resync is applied after it. */
Object.assign(MP,{ep:0,rsy:null,rsLast:-1e9,rsTxt:null,rsMeta:null,rsBuf:null,rsGot:0});
const RSCH=48000;
async function mpResync(){if(!MP.on||!MP.host||MP.rsy||over)return;if(performance.now()-MP.rsLast<8000)return;MP.rsy='pack';MP.rsLast=performance.now();
 const T=MP.tick,M={ep:MP.ep+1,t:T,sd:(Math.imul(T+1,2654435761)^Math.floor(SEED*1e6))>>>0};let txt;
 try{txt=JSON.stringify(await svEncode())}catch(e){MP.rsy=null;return}
 const n=Math.ceil(txt.length/RSCH);mpSend({k:'rs0',ep:M.ep,t:T,n,sd:M.sd});for(let i=0;i<n;i++)mpSend({k:'rs1',ep:M.ep,i,d:txt.slice(i*RSCH,(i+1)*RSCH)});
 MP.rsTxt=txt;MP.rsMeta=M;MP.rsy='sent'}
function mpResMsg(m){
 if(m.k==='rsq'){if(MP.host)mpResync();return}
 if(m.k==='rs0'&&!MP.host){MP.rsy='recv';MP.rsBuf=new Array(m.n);MP.rsGot=0;MP.rsMeta={ep:m.ep,t:m.t,sd:m.sd};return}
 if(m.k==='rs1'&&!MP.host&&MP.rsy==='recv'&&MP.rsMeta&&m.ep===MP.rsMeta.ep){if(MP.rsBuf[m.i]===undefined){MP.rsBuf[m.i]=m.d;MP.rsGot++}
  if(MP.rsGot===MP.rsBuf.length){const txt=MP.rsBuf.join(''),M=MP.rsMeta;MP.rsBuf=null;MP.rsy='load';mpResApply(txt,M).then(()=>{MP.rsy='go';mpSend({k:'rsok',ep:M.ep})},()=>{MP.rsy=null})}return}
 if(m.k==='rsok'&&MP.host&&MP.rsy==='sent'&&MP.rsMeta&&m.ep===MP.rsMeta.ep){const txt=MP.rsTxt,M=MP.rsMeta;MP.rsTxt=null;MP.rsy='load';mpResApply(txt,M).then(()=>{MP.rsy=null;mpSend({k:'rsgo',ep:M.ep})},()=>{MP.rsy=null});return}
 if(m.k==='rsgo'&&!MP.host&&MP.rsy==='go'&&m.ep===MP.ep){MP.rsy=null;return}}
/* load a snapshot inside a running co-op game: the local view (camera, selection, menu) is kept. Same steps as svApply, but the
   decoding (asynchronous) comes first, then everything that touches the simulation runs in one go with a seeded random stream,
   so the host and the guest rebuild exactly the same game */
async function mpResApply(txt,M){const keep=new Set(units.filter(u=>u.sel).map(u=>u.uid)),sb=selB&&structs.includes(selB)?selB.sid:null,cs=castleSel;
 const S=JSON.parse(txt);if(!S||S.v!==SVVER)throw new Error('bad snapshot');const D=await svDecode(S);
 const R0=Math.random;Math.random=rngf((M.sd^0x5bd1e995)>>>0);
 try{mode=null;SEED=S.R.SEED;GPR=JSON.parse(JSON.stringify(S.objs[S.R.GPR.$r].$o));CX=S.R.CX;CY=S.R.CY;
  SITE2=null;for(const q of structs||[])rmStruct(q);initWorld();for(const k in D)svAssign(k,D[k]);RAWD.fill(0);smDone.fill(0);
  for(const u of units){u.m=null;u._tc=null}for(const q of structs)q.o3=null;
  GF.clear();LFLD.clear();LFQT.fill(-1);LFQS.fill(null);SEPM.clear&&SEPM.clear();setPl(LPL());calcFD();fdDirty=true;ver++;rebuildOwn(true);
  fowTm=-9;fowT.needsUpdate=true;build3D();svMini();try{icoPart('tier');icoPart('units')}catch(e){}}
 finally{Math.random=R0}
 for(const u of units)u.sel=keep.has(u.uid);selB=sb!=null?structs.find(q=>q.sid===sb)||null:null;castleSel=cs;SELBS=[];
 MP.ep=M.ep;MP.simR=rngf(M.sd);MP.tick=M.t;MP.sent=M.t+MPD-1;MP.acc=0;MP.loc={};MP.rem={};MP.hs={};MP.hr={};MP.desync=false;MP.stall=false;
 for(let k=M.t;k<M.t+MPD;k++){MP.loc[k]=[];MP.rem[k]=[]}
 msgS='Resynchronized with your partner';msgT=4}
function mpGen(){let n=0;while(GI<GORD.length&&n<2){const k=GORD[GI++];if(!genF[k]){genChunk(k%NCX,(k/NCX)|0);n++}}}
function mpFrame(dt){if(over||MP.rsy)return;MP.acc=Math.min(.3,MP.acc+dt);if(paused){MP.acc=0;return}
 let n=0;while(MP.acc>=MPSTEP&&n<8){
  while(MP.sent<MP.tick+MPD){MP.sent++;const c=MP.out;MP.out=[];MP.loc[MP.sent]=c;mpSend({k:'c',t:MP.sent,c,e:MP.ep})}
  const r=MP.rem[MP.tick];if(!r){MP.stall=true;break}MP.stall=false;
  const L=MP.loc[MP.tick]||[],cm=MP.host?[...L.map(c=>[c,1]),...r.map(c=>[c,0])]:[...r.map(c=>[c,0]),...L.map(c=>[c,1])];
  Math.random=MP.simR;try{mpGen();for(const[c,m]of cm)mpExec(c,m);update(MPSTEP)}finally{Math.random=REALR}
  delete MP.loc[MP.tick];delete MP.rem[MP.tick];MP.tick++;MP.acc-=MPSTEP;n++;
  if(MP.tick%90===0){const h=mpHash();MP.hs[MP.tick]=h;mpSend({k:'h',t:MP.tick,h,e:MP.ep});mpChk(MP.tick)}}
 if(n===8)MP.acc=0}
function mpBegin(st){msgS='Co-op: Alt+click pings the map / Shift: defend / Ctrl: gather / Shift+Ctrl: attack';msgT=12;SEED=st.seed;GPR=st.gpr;CX=st.cx;CY=st.cy;CROT=st.cr&3;diffI=0;SWF=100;SITE2={tx:st.cx2,ty:st.cy2,rot:st.cr2&3};picking=false;setupOpen=false;settingsOpen=false;
 MP.on=true;const sd=Math.floor(SEED*1e6)+1;Math.random=rngf(sd);try{reset()}finally{Math.random=REALR}
 inGame=false;camSave=null;startGame();spd=1;paused=false;over=false;setPl(LPL());home();
 MP.simR=rngf(sd+977);MP.tick=0;MP.sent=MPD-1;MP.acc=0;MP.out=[];MP.loc={};MP.rem={};MP.hs={};MP.hr={};MP.desync=false;MP.stall=false;MP.ep=0;MP.rsy=null;MP.rsLast=-1e9;MP.hl=[];MP.dsN=0;
 for(let i=0;i<MPD;i++){MP.loc[i]=[];MP.rem[i]=[]}
 MP.mine=null;MP.theirs=null;mpModal(false)}
MP.phase='';MP.mine=null;MP.theirs=null;MP.pname='';MP.code='';
/* the two castles may stand side by side: only their 5x5 walls and the 3 tiles in front of each door must not overlap */
const sitesFar=(a,b)=>!a||!b||Math.max(Math.abs(a.tx-b.tx),Math.abs(a.ty-b.ty))>=10;
/* ---- lobby state ---- */
function mpConnected(){MP.conn=true;MP.mine=null;MP.theirs=null;mpSend({k:'hello',n:THEME.n,v:GVER});if(MP.host)mpWorldSync();lobbyRender();lobbyShow()}
function mpWorldSync(){if(MP.conn&&MP.host){MP.theirs=null;mpSend({k:'w',seed:SEED,gpr:GPR,d:diffI});MP.mine=null;lobbyRender()}}
const _rw=rollWorld;rollWorld=function(){_rw();if(MP.conn&&MP.host&&!MP.on)mpWorldSync()};
confirmPick=function(){
 if(!MP.conn){SITE2=null;return _N.confirmPick()}
 if(!pickPos||!pickPos.ok)return;const me={tx:pickPos.tx,ty:pickPos.ty};
 if(!sitesFar(me,MP.theirs)){pickMsg='Your castles would overlap: move a little away from your partner';return}
 me.rot=PKROT&3;MP.mine=me;mpSend({k:'ready',cx:me.tx,cy:me.ty,r:me.rot});picking=false;setupOpen=false;lobbyRender();lobbyShow()};
function mpStart(){if(!MP.host||!MP.mine||!MP.theirs)return;if(MP.pver&&MP.pver!==GVER){lobbyNote('Different versions ('+GVER+' and '+MP.pver+'): both players must run the same one - restart the launcher or reload the page');return}if(!sitesFar(MP.mine,MP.theirs)){lobbyNote('The two castles are too close: one of you must move.');return}
 const st={k:'s',seed:SEED,gpr:GPR,cx:MP.mine.tx,cy:MP.mine.ty,cr:MP.mine.rot|0,cx2:MP.theirs.tx,cy2:MP.theirs.ty,cr2:MP.theirs.rot|0,d:diffI,sw:SWF};mpSend(st);mpBegin(st)}
function mpMsg(m){if(m.k==='c'){if((m.e|0)!==MP.ep)return;MP.rem[m.t]=m.c;if(document.hidden)bgTick()}else if(m.k==='h'){if((m.e|0)!==MP.ep)return;MP.hr[m.t]=m.h;mpChk(m.t)}else if(m.k&&m.k.startsWith('rs')){mpResMsg(m);return}else if(m.k==='p')paused=m.v;
 else if(m.k==='hello'){MP.pname=String(m.n||'Player').slice(0,24);MP.pver=String(m.v||'?');snd('spawn');lobbyNote(m.v===GVER?(MP.pname)+' joined the lobby!':'Version mismatch: you run '+GVER+', '+MP.pname+' runs '+(m.v||'an older version')+'. Use the same version or the game will desync.');if(MP.host)mpWorldSync();if(!picking&&!MP.on)lobbyShow();else lobbyRender()}
 else if(m.k==='w'&&!MP.host){SEED=m.seed;GPR=m.gpr;diffI=m.d;MP.mine=null;MP.theirs=null;if(picking){openPicker();pickMsg='The host chose a new map'}lobbyNote('The host chose a map');lobbyRender()}
 else if(m.k==='ready'){const again=!!MP.theirs;MP.theirs={tx:m.cx,ty:m.cy,rot:m.r&3};snd('click');lobbyNote(MP.pname+(again?' moved their castle':' placed their castle'));lobbyRender()}
 else if(m.k==='s'&&!MP.host)mpBegin(m)}
function mpLost(){if(!MP.conn&&!MP.on)return;const was=MP.on;MP.conn=false;MP.on=false;MP.mine=null;MP.theirs=null;if(was){msgS='Partner disconnected - continuing solo';msgT=6}lobbyNote('Your partner left the lobby.');lobbyRender()}
/* ---- connection 1: short room code through the free PeerJS broker ---- */
const PCFG=window.MP_PEER_CFG||{},CODEC='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const rcode=()=>Array.from({length:5},()=>CODEC[(REALR()*CODEC.length)|0]).join('');
function loadPeer(){return window.Peer?Promise.resolve():new Promise((res,rej)=>{const s=document.createElement('script');s.src=window.MP_PEER_SRC||'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js';s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s);setTimeout(()=>rej(new Error('timeout')),9000)})}
function attach(c){MP.pcon=c;c.on('open',()=>{MP.dc={readyState:'open',send:s=>c.send(s)};mpConnected()});c.on('data',d=>{try{mpMsg(typeof d==='string'?JSON.parse(d):d)}catch(e){}});c.on('close',mpLost);c.on('error',mpLost)}
const normCode=c=>String(c||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,16);
async function lobbyHost(custom,tries){tries=tries||0;custom=normCode(custom);if(custom&&custom.length<3){mpStatus('Your code needs at least 3 letters or digits.');return}mpStatus('Creating your room...');try{await loadPeer()}catch(e){mpStatus('Could not reach the matchmaking service. Check your connection and try again.');mpFallback(true);return}
 MP.host=true;MP.code=custom||rcode();const peer=new Peer('nrx-'+MP.code,PCFG);MP.peer=peer;
 peer.on('open',()=>{lobbyRender();lobbyShow();mpStatus('Waiting for your partner to join...')});
 peer.on('connection',c=>{if(MP.conn){c.close();return}attach(c)});
 peer.on('error',e=>{if(e.type==='unavailable-id'&&custom){peer.destroy();MP.code='';$m('mpHostP').style.display='block';$m('mpLobby').style.display='none';mpStatus('The code '+custom+' is already used by another room: choose a different one.')}else if(e.type==='unavailable-id'&&tries<4){peer.destroy();lobbyHost('',tries+1)}else{mpStatus('Matchmaking error ('+e.type+'). Check your connection and try again.');mpFallback(true)}})}
async function lobbyJoin(code){code=normCode(code);if(code.length<3){mpStatus('Type the room code first.');return}
 mpStatus('Joining room '+code+'...');try{await loadPeer()}catch(e){mpStatus('Could not reach the matchmaking service. Check your connection and try again.');mpFallback(true);return}
 MP.host=false;MP.code=code;const peer=new Peer(PCFG);MP.peer=peer;let t=setTimeout(()=>{if(!MP.conn)mpStatus('Room '+code+' not found. Check the code with the host.')},9000);
 peer.on('open',()=>{const c=peer.connect('nrx-'+code,{reliable:true});attach(c);c.on('open',()=>clearTimeout(t))});
 peer.on('error',e=>{mpStatus(e.type==='peer-unavailable'?'Room '+code+' not found. Check the code with the host.':'Connection error ('+e.type+').')})}
/* ---- connection 2 (fallback): manual WebRTC codes, no server at all ---- */

const enc=o=>btoa(unescape(encodeURIComponent(JSON.stringify(o)))),dec=s=>JSON.parse(decodeURIComponent(escape(atob(s.replace(/\s+/g,'')))));






/* ---- DOM window (same visual identity as the game) ---- */
const mpEl=document.createElement('div');mpEl.id='mp';mpEl.style.display='none';
const mpCss=document.createElement('style');mpCss.textContent=`#mp{position:fixed;inset:0;z-index:20;background:rgba(10,6,3,.72);display:flex;align-items:center;justify-content:center;font-family:"Trebuchet MS","Segoe UI",system-ui,sans-serif;color:#f6e9d2}
#mp .bx{width:min(520px,94vw);max-height:94vh;overflow:auto;background:linear-gradient(#34261b,#1b120c);border:1px solid #0a0603;border-radius:10px;box-shadow:0 0 0 1px rgba(255,196,120,.18) inset,0 12px 40px rgba(0,0,0,.6);padding:14px 16px}
#mp h2{margin:0 0 4px;font-size:20px;color:#ffd23c;letter-spacing:.5px}#mp p{margin:6px 0;font-size:13px;color:#ead8ba;line-height:1.4}
#mp textarea,#mp input.cd{width:100%;background:#150e09;color:#fff1d8;border:1px solid #9a6c3c;border-radius:6px;padding:6px;box-sizing:border-box}
#mp textarea{height:70px;resize:none;font:11px/1.3 monospace;word-break:break-all}
#mp input.cd{font:700 22px "Trebuchet MS",monospace;letter-spacing:4px;text-align:center;text-transform:uppercase}
#mp button{font:700 13px "Trebuchet MS",sans-serif;color:#fff;border:1px solid #0a0603;border-radius:6px;padding:7px 12px;margin:4px 6px 4px 0;cursor:pointer;background:linear-gradient(#654530,#33200f);box-shadow:0 0 0 1px rgba(255,196,120,.2) inset}
#mp button:hover:not(:disabled){background:linear-gradient(#e39a48,#8a4a10)}#mp button.pri{background:linear-gradient(#ffb25a,#c25e10)}#mp button.pri:hover:not(:disabled){background:linear-gradient(#ffcf8a,#d9731c)}#mp button:disabled{opacity:.45;cursor:default}
#mp .st{margin-top:8px;padding:6px 8px;border-radius:6px;background:rgba(0,0,0,.35);font-size:12px;color:#ffd9a0;min-height:18px}#mp .step{font-size:12px;color:#d9b27a;margin-top:8px;font-weight:700}
#mp .code{font:700 30px "Trebuchet MS",monospace;letter-spacing:6px;word-break:break-all;color:#ffd23c;text-align:center;padding:6px;background:#150e09;border:1px solid #9a6c3c;border-radius:8px;margin:6px 0}
#mp .pl{display:flex;align-items:center;gap:10px;padding:8px 10px;margin:5px 0;border-radius:8px;background:rgba(0,0,0,.32);border:1px solid rgba(255,196,120,.18)}
#mp .pl .dot{width:12px;height:12px;border-radius:50%;background:#6a5a4a;flex:none}#mp .pl.on .dot{background:#6fe08a;box-shadow:0 0 8px #6fe08a}#mp .pl.off{opacity:.55}
#mp .pl .nm{font-weight:700;flex:1}#mp .pl .rd{font-size:12px;color:#d9b27a}#mp .pl.rdy .rd{color:#9ff0b0}
#mp details{margin-top:8px;font-size:12px;color:#d9b27a}#mp summary{cursor:pointer}
#mpHud{position:fixed;left:50%;top:58px;transform:translateX(-50%);z-index:9;padding:3px 10px;border-radius:12px;background:rgba(24,15,9,.85);border:1px solid #9a6c3c;color:#ffd9a0;font:700 12px "Trebuchet MS",sans-serif;display:none;pointer-events:none}`;
document.head.appendChild(mpCss);
mpEl.innerHTML=`<div class="bx"><h2>Co-op (online, 2 players)</h2><p>Each player founds their own castle on the same map. The economy is shared and you fight the zombies together.</p>
<div id="mpHome"><button class="pri" id="mpBH">Host a game</button><button id="mpBJ">Join with a code</button></div>
<div id="mpHostP" style="display:none"><div class="step">Choose a room code (like a password) - or leave empty for a random one</div><input class="cd" id="mpHCode" maxlength="16" placeholder="ROSE42" autocomplete="off"><button class="pri" id="mpMk">Create room</button></div>
<div id="mpJoinP" style="display:none"><div class="step">Type the code your host gave you</div><input class="cd" id="mpCode" maxlength="16" placeholder="ROSE42" autocomplete="off"><button class="pri" id="mpGo">Join</button></div>
<div id="mpLobby" style="display:none"><div class="step">Your room code - your partner types it to join</div><div class="code" id="mpRoom">-----</div>
<div class="step">Players</div><div class="pl" id="mpP1"><span class="dot"></span><span class="nm"></span><span class="rd"></span></div><div class="pl" id="mpP2"><span class="dot"></span><span class="nm"></span><span class="rd"></span></div>
<div><button class="pri" id="mpSite">Choose my castle site</button><button class="pri" id="mpPlay" style="display:none">Play</button></div></div>

<div class="st" id="mpSt"></div><div style="margin-top:6px"><button id="mpClose">Close</button><button id="mpBack" style="display:none">Back</button></div></div>`;
document.body.appendChild(mpEl);
const mpHud=document.createElement('div');mpHud.id='mpHud';document.body.appendChild(mpHud);
const $m=id=>document.getElementById(id);
function mpStatus(t){$m('mpSt').textContent=t}
function mpModal(v){mpEl.style.display=v?'flex':'none'}
function lobbyNote(t){mpStatus(t)}
function mpFallback(v){}
function mpOpen(){mpModal(true);if(MP.conn)lobbyShow()}
function lobbyShow(){mpModal(true);$m('mpHostP').style.display='none';$m('mpHome').style.display='none';$m('mpJoinP').style.display='none';$m('mpLobby').style.display=(MP.conn||MP.code)?'block':'none';$m('mpBack').style.display='none';lobbyRender()}
function lobbyRender(){const L=$m('mpLobby');if(!L)return;$m('mpRoom').textContent=MP.code||'-----';
 const me=THEME.n||'You',row=(id,name,on,rdy,txt)=>{const e=$m(id);e.className='pl'+(on?' on':' off')+(rdy?' rdy':'');e.children[1].textContent=name;e.children[2].textContent=txt};
 const hostN=MP.host?me:(MP.pname||'Host'),guestN=MP.host?(MP.pname||''):me;
 row('mpP1',hostN+' (host)',MP.host||MP.conn,MP.host?!!MP.mine:!!MP.theirs,(MP.host?MP.mine:MP.theirs)?'Castle placed - ready':'Choosing a castle site...');
 const g=MP.host?MP.conn:true;row('mpP2',g?guestN:'Waiting for player 2...',g,MP.host?!!MP.theirs:!!MP.mine,g?((MP.host?MP.theirs:MP.mine)?'Castle placed - ready':'Choosing a castle site...'):'');
 $m('mpSite').textContent=MP.mine?'Change my castle site':'Choose my castle site';$m('mpSite').disabled=!MP.conn;
 const pb=$m('mpPlay');pb.style.display=MP.host?'inline-block':'none';const rd=MP.conn&&MP.mine&&MP.theirs;pb.disabled=!rd;pb.textContent=rd?'Play':'Play (both players must place a castle)';
 if(!MP.host&&MP.conn&&MP.mine&&MP.theirs)mpStatus('Waiting for the host to press Play...')}
$m('mpBH').onclick=()=>{$m('mpHome').style.display='none';$m('mpHostP').style.display='block';$m('mpBack').style.display='inline-block';$m('mpHCode').focus()};
$m('mpMk').onclick=()=>{$m('mpHostP').style.display='none';$m('mpBack').style.display='none';lobbyHost($m('mpHCode').value)};
$m('mpHCode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')$m('mpMk').click()});
$m('mpBJ').onclick=()=>{$m('mpHome').style.display='none';$m('mpJoinP').style.display='block';$m('mpBack').style.display='inline-block';$m('mpCode').focus()};
$m('mpBack').onclick=()=>{$m('mpJoinP').style.display='none';$m('mpHostP').style.display='none';$m('mpHome').style.display='block';$m('mpBack').style.display='none'};
$m('mpGo').onclick=()=>lobbyJoin($m('mpCode').value);
$m('mpCode').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter')lobbyJoin($m('mpCode').value)});
$m('mpClose').onclick=()=>mpModal(false);
$m('mpSite').onclick=()=>{mpModal(false);setupOpen=false;settingsOpen=false;openPicker();pickMsg=MP.host?'':'Choose where YOUR castle will stand'};
$m('mpPlay').onclick=mpStart;
setInterval(()=>{let t='';if(MP.on){t=MP.rsy?'Co-op: resynchronizing...':MP.desync?'Co-op: OUT OF SYNC':MP.stall?'Co-op: waiting for your partner...':''}
 else if(MP.conn&&picking){t='Co-op lobby - '+(MP.mine?'your castle: placed':'choose your castle site')+' | '+(MP.pname||'partner')+': '+(MP.theirs?'ready':'choosing...')}
 else if(MP.conn&&!MP.host&&started===false&&MP.mine&&MP.theirs)t='Waiting for the host to press Play';
 if(t!==mpHud._t){mpHud._t=t;mpHud.textContent=t;mpHud.style.display=t?'block':'none';mpHud.style.color=MP.desync?'#ff8a8a':'#ffd9a0'}},300);

