/* shared start of every announce shot (inserted by tools/announce_shots.py): seeded world, castle, resources.
   The wave timer is parked (1e9) while the scene is built; each script ends with calm(seconds) so the top bar shows a real countdown
   ("Next 1:35"), or starts its wave the way the simulation does (startWave) so the bar shows the raid and the night can fall. */
let s=SEED_;const RR=Math.random;Math.random=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};
rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;
for(const R of RESP){R.g=900;R.w=700;R.s=500;R.f=300}
const TSZ=TS,cast={x:CX*TS,y:CY*TS};
const army=(spec,ox,oy,rows)=>{spec.forEach((t,i)=>{const u=mkU(0,t,cast.x+ox*TS+(i%rows)*TS*1.6,cast.y+oy*TS+((i/rows)|0)*TS*1.6);u.hp=T[t].hp*(i%4===1?.7:i%5===2?.45:1);units.push(u)})};
const settle=n=>{for(let i=0;i<n;i++)update(.1)};
const calm=t=>{waveT=t};
/* the next wave starts as in gameplay/simulation.js: without waveOn / hordeOn the night never falls (nightTick) and the bar keeps its countdown */
const startWave=n=>{waveN=n-1;waveST=time;wave();waveOn=hordeOn=true;hordeT=time;waveT=0};
const look=(x,z,dist,pitch,yaw)=>{CAM.x=x;CAM.z=z;CAM.dist=dist;CAM.pitch=pitch;CAM.yaw=yaw||0};
const ft=(x,y)=>freeTile(Math.round(x),Math.round(y));
/* building slots left and right of the castle (offsets from its centre, in tiles), clear of the bottom HUD */
const SLOTS=[[-8,-1],[-8,5],[-13,2],[-13,8],[8,-1],[8,5],[13,2],[13,8]];
const put=(types)=>types.forEach((t,i)=>{const sl=SLOTS[i%SLOTS.length],f=ft(CS.tx+2+sl[0],CS.ty+2+sl[1]);build(t,f[0],f[1]);const st=structs.filter(x=>x.type===t).pop();if(st)st.prog=1});
/* generate the land around the castle (minimap) and uncover it: scouts stand on two rings for a while, then leave */
const explore=(n)=>{for(let dx=-48;dx<=48;dx+=16)for(let dy=-48;dy<=48;dy+=16)ensureAround(Math.max(1,Math.min(TW-2,CX+dx)),Math.max(1,Math.min(TW-2,CY+dy)),1);
 const sc=[],pts=[];for(const r of[14,30])for(let i=0;i<8;i++){const a=i*Math.PI/4+(r>20?.39:0);pts.push([cast.x+Math.cos(a)*r*TS,cast.y+Math.sin(a)*r*TS])}
 pts.forEach(q=>{const u=mkU(0,'scout',q[0],q[1]);units.push(u);sc.push(u)});
 for(let i=0;i<n;i++){sc.forEach((u,j)=>{u.x=pts[j][0];u.y=pts[j][1]});update(.1);if(i%10===9)render3D(.05)}sc.forEach(u=>{u.hp=0});update(.1)};
/* the scene is built in seconds, so the achievements of a whole game pop at once: no toast on an announcement picture */
const noToast=()=>{TOASTS.length=0};
/* a kingdom some waves old: the opening hint is gone (it shows for the first 30 s) and the quest line stands at quest `id` */
const grown=id=>{time=Math.max(time,60);QST.on=1;QST.d={};QST.last='';QST.dt=-1e9;for(const q of QUESTS){if(q.id===id)break;QST.d[q.id]=1}};
const quiet=async ms=>{const o=renderer.render;renderer.render=function(){};await new Promise(r=>setTimeout(r,ms));renderer.render=o};
