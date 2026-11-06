/* ================= END-OF-GAME STATS (#18) =================
   Counted for the local player only and never read by the simulation: the update wrapper measures what the sim added to the
   resources, hit() records who hit last (LH) so a kill is credited to a unit type, everything else is "Towers and cannons". */
function gstReset(){GST={k:{},g:0,w:0,s:0,f:0,lost:0}}
function gstKill(z){const t=LH.get(z)||'other';GST.k[t]=(GST.k[t]|0)+1}
function update(dt){const R=RESP[CURPL|0],g=R.g,w=R.w,s=R.s,f=R.f||0;update0(dt);objTick();kingTick();trapTick(dt);eraTick(dt);
 const G=GST;G.g+=Math.max(0,R.g-g);G.w+=Math.max(0,R.w-w);G.s+=Math.max(0,R.s-s);G.f+=Math.max(0,(R.f||0)-f)}
function gstBest(){let b=null,n=0;for(const k in GST.k)if(GST.k[k]>n){n=GST.k[k];b=k}return b?[b,n]:null}
/* ---- records by map (#13): the three best runs of this seed (waves x100 + kills) kept in this browser; today's daily map is flagged ---- */
let SBR=null;
const sbKey=()=>(+SEED).toFixed(4);
const sbLoad=()=>{try{return JSON.parse(localStorage.getItem('dk_sb')||'{}')}catch(e){return{}}};
function sbDaily(){try{const d=Math.floor(Date.now()/864e5);return Math.abs(rngf(d*2654435761%4294967296)()*500-SEED)<1e-6}catch(e){return false}}
function sbRec(){SBR=null;try{const all=sbLoad(),k=sbKey(),a=all[k]||[],sc=waveN*100+kills,r={w:waveN,k:kills,s:sc,d:Date.now()};a.push(r);a.sort((x,y)=>y.s-x.s||x.d-y.d);const top=a.slice(0,3);all[k]=top;
  const ks=Object.keys(all);if(ks.length>60){ks.sort((x,y)=>all[y][0].d-all[x][0].d);for(const q of ks.slice(60))delete all[q]}
  localStorage.setItem('dk_sb',JSON.stringify(all));SBR={top,rank:top.indexOf(r),daily:sbDaily()}}catch(e){}}
