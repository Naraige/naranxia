/* ================= SAVE / LOAD =================
   The whole simulation state is written as an object graph (shared references kept), the big world arrays gzipped.
   Desktop app: one file per save in the app-data folder (window.NARX); browser: IndexedDB. */
const SAVA={SPK:[()=>SPK,null],OBJ:[()=>OBJ,v=>{OBJ=v&&v.w?v:{w:1,k:1}}],GST:[()=>GST,v=>{GST=v&&v.k?v:{k:{},g:0,w:0,s:0,f:0,lost:0}}],SEED:[()=>SEED,v=>{SEED=v}],GPR:[()=>GPR,v=>{GPR=v}],CX:[()=>CX,v=>{CX=v}],CY:[()=>CY,v=>{CY=v}],SITE2:[()=>SITE2,v=>{SITE2=v}],HT:[()=>HT,null],ter:[()=>ter,null],amt:[()=>amt,null],pth:[()=>pth,null],FLG:[()=>FLG,null],TFL:[()=>TFL,null],genF:[()=>genF,null],stairs:[()=>stairs,null],ROUTES:[()=>ROUTES,v=>{ROUTES=v}],RCH:[()=>RCH,v=>{RCH=v}],GORD:[()=>GORD,v=>{GORD=v}],GI:[()=>GI,v=>{GI=v}],genN:[()=>genN,v=>{genN=v}],SEALD:[()=>SEALD,null],CAMPS:[()=>CAMPS,null],UID:[()=>UID,v=>{UID=v}],SID:[()=>SID,v=>{SID=v}],occ:[()=>occ,null],units:[()=>units,v=>{units=v}],structs:[()=>structs,v=>{structs=v}],fx:[()=>fx,v=>{fx=v}],pt:[()=>pt,v=>{pt=v}],queue:[()=>queue,v=>{queue=v}],over:[()=>over,v=>{over=v}],time:[()=>time,v=>{time=v}],waveT:[()=>waveT,v=>{waveT=v}],waveI:[()=>waveI,v=>{waveI=v}],waveN:[()=>waveN,v=>{waveN=v}],nextL:[()=>nextL,v=>{nextL=v}],CS:[()=>CS,v=>{CS=v}],CS2:[()=>CS2,v=>{CS2=v}],kills:[()=>kills,v=>{kills=v}],RESP:[()=>RESP,v=>{RESP=v}],SAPL:[()=>SAPL,null],PRES:[()=>PRES,null],saplT:[()=>saplT,v=>{saplT=v}],SW:[()=>SW,null],SWH:[()=>SWH,null],SWN:[()=>SWN,null],SWD:[()=>SWD,null],SWARMS:[()=>SWARMS,v=>{SWARMS=v}],hordeT:[()=>hordeT,v=>{hordeT=v}],hordeOn:[()=>hordeOn,v=>{hordeOn=v}],waveOn:[()=>waveOn,v=>{waveOn=v}],hordeD:[()=>hordeD,v=>{hordeD=v}],burnAt:[()=>burnAt,v=>{burnAt=v}],nightLv:[()=>nightLv,v=>{nightLv=v}],nightCk:[()=>nightCk,v=>{nightCk=v}],waveST:[()=>waveST,v=>{waveST=v}],LITL:[()=>LITL,v=>{LITL=v}],darkT:[()=>darkT,v=>{darkT=v}],campT:[()=>campT,v=>{campT=v}],SIMTK:[()=>SIMTK,v=>{SIMTK=v}],shelOn:[()=>shelOn,v=>{shelOn=v}],shelRel:[()=>shelRel,v=>{shelRel=v}],mergeT:[()=>mergeT,v=>{mergeT=v}],ACH:[()=>ACH,null],WAVEZ:[()=>WAVEZ,v=>{WAVEZ=v}],HORDES:[()=>HORDES,null],BASES:[()=>BASES,null],hdT:[()=>hdT,v=>{hdT=v}],spawnHT:[()=>spawnHT,v=>{spawnHT=v}],baseId:[()=>baseId,v=>{baseId=v}],RS:[()=>RS,null],RS2:[()=>RS2,null],ROLE:[()=>ROLE,null],RHAS:[()=>RHAS,null],roleT:[()=>roleT,v=>{roleT=v}],RALLY:[()=>RALLY,null],RALLYC:[()=>RALLYC,null],PRICE:[()=>PRICE,null],priceT:[()=>priceT,v=>{priceT=v}],CLM:[()=>CLM,null],BAD:[()=>BAD,null],tfo:[()=>tfo,null],LVO:[()=>LVO,null],SCRT:[()=>SCRT,null],C:[()=>C,null],BTIER:[()=>BTIER,v=>{BTIER=v}],RL:[()=>RL,null],FGS:[()=>FGS,v=>{FGS=v}],FORCEF:[()=>FORCEF,v=>{FORCEF=v}],PUD:[()=>PUD,null],alertT:[()=>alertT,v=>{alertT=v}],farmT:[()=>farmT,v=>{farmT=v}],fowSeen:[()=>fowSeen,null],fowVis:[()=>fowVis,null],fowTex:[()=>fowTex,null],fowRA:[()=>fowRA,null],fowLo:[()=>fowLo,null],fowHi:[()=>fowHi,null],diffI:[()=>diffI,v=>{diffI=v}]};
const SVVER=1,SVSKIP=new Set(['zf','zft','_tc','pfS']);
const svX=v=>!!v&&typeof v==='object'&&typeof THREE!=='undefined'&&(v instanceof THREE.Object3D||v.isMaterial||v.isBufferGeometry||v.isTexture||v.isBufferAttribute);
const b64e=u8=>{let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s)};
const b64d=s=>{const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function gzU8(u8,de){const cs=de?new DecompressionStream('gzip'):new CompressionStream('gzip');const st=new Blob([u8]).stream().pipeThrough(cs);return new Uint8Array(await new Response(st).arrayBuffer())}
const TACT={Uint8Array,Int8Array,Uint16Array,Int16Array,Uint32Array,Int32Array,Float32Array,Float64Array,Uint8ClampedArray};
async function svEncode(){const ids=new Map(),objs=[],Q=[],big=[];
 const ref=v=>{if(v===null)return null;const t=typeof v;if(t==='number')return Number.isFinite(v)?v:{$n:String(v)};if(t==='string'||t==='boolean')return v;if(t!=='object')return {$u:1};
  if(svX(v)||(typeof Node!=='undefined'&&v instanceof Node)||v instanceof CanvasRenderingContext2D)return {$u:1};
  let id=ids.get(v);if(id===undefined){id=objs.length;ids.set(v,id);objs.push(null);Q.push(v)}return {$r:id}};
 const R={};for(const k in SAVA)R[k]=ref(SAVA[k][0]());
 for(let q=0;q<Q.length;q++){const v=Q[q],id=ids.get(v);let o;
  if(ArrayBuffer.isView(v)){const u8=new Uint8Array(v.buffer,v.byteOffset,v.byteLength);o={$t:v.constructor.name,n:v.length};if(v.byteLength>8192)big.push([o,u8.slice()]);else o.d=b64e(u8)}
  else if(Array.isArray(v))o={$a:v.map(ref)};
  else if(v instanceof Map)o={$m:[...v].map(([a,b])=>[ref(a),ref(b)])};
  else if(v instanceof Set)o={$s:[...v].map(ref)};
  else if(typeof v.mk==='function'&&'tx' in v&&'sx' in v)o={$g:[v.tx,v.ty,v.sx,v.sy,v.big|0,v.q|0]};
  else if(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null){o={$x:1};(window.__svw||(window.__svw=[])).push('class:'+(v.constructor&&v.constructor.name))}
  else{const p={};for(const k in v){if(SVSKIP.has(k))continue;const x=v[k];if(typeof x==='function'){(window.__svw||(window.__svw=[])).push('fn:'+k);continue}if(svX(x))continue;p[k]=ref(x)}o={$o:p}}
  objs[id]=o}
 for(const[o,u8]of big)o.z=b64e(await gzU8(u8));
 return {v:SVVER,gv:GVER,R,objs}}
async function svDecode(S){const O=S.objs,live=new Array(O.length);
 for(let i=0;i<O.length;i++){const o=O[i];if(o.$t){const T0=TACT[o.$t];const u8=o.z?await gzU8(b64d(o.z),true):b64d(o.d||'');live[i]=new T0(u8.buffer,0,o.n)}
  else if(o.$a)live[i]=[];else if(o.$m)live[i]=new Map();else if(o.$s)live[i]=new Set();else if(o.$g){const a=o.$g,G=mkG(a[0],a[1],a[2],a[3],!!a[5]);G.big=a[4];live[i]=G}else if(o.$x)live[i]=undefined;else live[i]={}}
 const val=x=>x===null||typeof x!=='object'?x:x.$r!==undefined?live[x.$r]:x.$n!==undefined?Number(x.$n):undefined;
 for(let i=0;i<O.length;i++){const o=O[i],L=live[i];if(o.$a){for(const x of o.$a)L.push(val(x))}else if(o.$m){for(const[a,b]of o.$m)L.set(val(a),val(b))}else if(o.$s){for(const x of o.$s)L.add(val(x))}
  else if(o.$o){for(const k in o.$o){const x=o.$o[k];if(x&&x.$u)continue;L[k]=val(x)}}}
 const out={};for(const k in S.R)out[k]=val(S.R[k]);return out}
/* const bindings are refilled in place, let bindings reassigned */
function svAssign(k,v){const A=SAVA[k];if(!A)return;if(A[1]){A[1](v);return}const c=A[0]();
 if(ArrayBuffer.isView(c)){if(v&&v.length===c.length)c.set(v)}else if(c instanceof Map){c.clear();if(v)for(const[a,b]of v)c.set(a,b)}else if(c instanceof Set){c.clear();if(v)for(const x of v)c.add(x)}
 else if(Array.isArray(c)){c.length=0;if(v)for(const x of v)c.push(x)}else if(c&&typeof c==='object'){for(const kk of Object.keys(c))delete c[kk];Object.assign(c,v||{})}}
async function svPack(){const S=await svEncode();S.meta={wave:waveN,kills,time:Math.round(time),date:Date.now(),king:'Naraige'};return JSON.stringify(S)}
async function svApply(txt){const S=JSON.parse(txt);if(!S||S.v!==SVVER)throw new Error('Unknown save format');
 paused=true;MP.on=false;picking=false;setupOpen=false;settingsOpen=false;saveOpen=false;mode=null;selB=null;
 SEED=S.R.SEED;GPR=JSON.parse(JSON.stringify(S.objs[S.R.GPR.$r].$o));CX=S.R.CX;CY=S.R.CY;
 const D=await svDecode(S);
 SITE2=null;for(const s of structs||[])rmStruct(s);initWorld();for(const k in D)svAssign(k,D[k]);RAWD.fill(0);smDone.fill(0);
 for(const u of units){u.m=null;u._tc=null}for(const s of structs)s.o3=null;
 GF.clear();LFLD.clear();LFQT.fill(-1);LFQS.fill(null);SEPM.clear&&SEPM.clear();setPl(0);calcFD();fdDirty=true;ver++;rebuildOwn(true);
 fowTm=-9;fowT.needsUpdate=true;inGame=true;started=true;paused=false;showMap=false;camSave=null;
 build3D();svMini();try{icoPart('tier');icoPart('units')}catch(e){}
 msgS='Game loaded - wave '+waveN;msgT=3}
/* redraw the minimap for every chunk already generated */
function svMini(){mg.fillStyle='#10151f';mg.fillRect(0,0,TW,TH);for(let cy=0;cy<NCY;cy++)for(let cx=0;cx<NCX;cx++){if(!genF[cy*NCX+cx])continue;const x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH),im=mg.createImageData(x1-x0,y1-y0);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const c=mmRGB(y*TW+x),k=((y-y0)*(x1-x0)+x-x0)*4;im.data[k]=c[0];im.data[k+1]=c[1];im.data[k+2]=c[2];im.data[k+3]=255}mg.putImageData(im,x0,y0)}}
/* storage: desktop files, else IndexedDB */
const SVDB={db:null,open(){return this.db||(this.db=new Promise((ok,ko)=>{const r=indexedDB.open('naranxia_saves',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}))},
 async tx(mode,fn){const d=await this.open();return new Promise((ok,ko)=>{const t=d.transaction('s',mode),st=t.objectStore('s'),q=fn(st);t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>ko(t.error)})}};
const SVST={async list(){if(window.NARX)return NARX.list();const keys=await SVDB.tx('readonly',s=>s.getAllKeys())||[];const out=[];for(const k of keys){const m=await SVDB.tx('readonly',s=>s.get('meta:'+k));if(!String(k).startsWith('meta:'))out.push({name:k,t:m&&m.date||0})}return out.filter(o=>o.name).sort((a,b)=>b.t-a.t)},
 async put(n,d,meta){if(window.NARX)return NARX.save(n,d);await SVDB.tx('readwrite',s=>s.put(d,n));await SVDB.tx('readwrite',s=>s.put(meta||{},'meta:'+n))},
 async get(n){if(window.NARX)return NARX.load(n);return SVDB.tx('readonly',s=>s.get(n))},
 async del(n){if(window.NARX)return NARX.del(n);await SVDB.tx('readwrite',s=>s.delete(n));await SVDB.tx('readwrite',s=>s.delete('meta:'+n))}};
let saveOpen=false,svList=null,svBusy='',svSel=-1;
const svName=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return 'Wave '+waveN+' - '+d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())+' '+p(d.getHours())+'h'+p(d.getMinutes())};
async function svRefresh(){try{svList=await SVST.list()}catch(e){svList=[];svBusy='Saves are not available here'}}
async function saveGame(name,quiet){if(MP.on||!inGame||over){if(!quiet){msgS=MP.on?'Saving is for solo games':'Nothing to save';msgT=3}return}
 svBusy='Saving...';try{const d=await svPack();await SVST.put(name||svName(),d,{date:Date.now(),wave:waveN});svBusy='';if(!quiet){msgS='Game saved';msgT=3;snd('build')}await svRefresh()}catch(e){svBusy='';msgS='Save failed: '+e.message;msgT=4;console.error(e)}}
async function loadGame(name){svBusy='Loading...';try{const d=await SVST.get(name);if(!d)throw new Error('save not found');await svApply(d);svBusy=''}catch(e){svBusy='';msgS='Load failed: '+e.message;msgT=4;console.error(e)}}
function drawSaves(UW,UH,cx){const W=Math.min(UW-12,420),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=8,H=UH-16;frame(X,Y,W,H,PAN,6);TTL(inGame&&!MP.on?'Save / Load':'Load game',X+10,Y+7,1.35);
 if(!svList){svList=[];svRefresh()}let y=Y+30;
 if(inGame&&!MP.on&&!over){pill(X+10,y,W-20,20,svBusy||'Save the game now',GRN,GRNH,()=>{if(!svBusy)saveGame()},null,1);y+=28}
 if(svBusy&&!(inGame&&!MP.on)){TC(svBusy,X+W/2,y,'#ffd25a',.9);y+=18}
 if(!svList.length)T_('No saved games yet',X+12,y+4,'#b59773',.85);
 const rows=Math.max(1,Math.floor((Y+H-58-y)/22));
 svList.slice(0,rows).forEach((s,i)=>{const yy=y+i*22;const d=new Date(s.t||0);T_(String(s.name).slice(0,34),X+12,yy+4,'#ead8ba',.82);
  pill(X+W-128,yy,62,18,'Load',BTN,BTNH,()=>{if(!svBusy)loadGame(s.name)},null,.8);pill(X+W-62,yy,52,18,'Delete',RDB,RDB,async()=>{await SVST.del(s.name);svRefresh()},null,.8)});
 if(window.NARX)pill(X+10,Y+H-24,120,16,'Open saves folder',BTN,BTNH,()=>NARX.openFolder(),null,.75);
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{saveOpen=false},null,.9)}

try{setTimeout(()=>{try{i18nDom()}catch(e){}},0)}catch(e){}
