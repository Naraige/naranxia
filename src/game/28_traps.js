/* ================= SPIKE TRAPS AND BOILING OIL (#9) =================
   Spike trap (Defense menu, 10 gold + 15 wood): one tile, passable, zombies standing on it are hurt every 0.5 s until the trap breaks.
   Boiling oil (Academy research after Bastion walls): every finished wall, gate and tower scalds zombies within 1.3 tiles every 1.5 s.
   Both are simulation (timers in sim time, damage through the same lists the bombers use), traps are a Map tile -> hp saved with the game (SAVA). */
const SPKC={g:10,w:15};
function placeSpike(tx,ty){if(over)return;const i=ty*TW+tx;
 if(!gOK(tx,ty)||!valid(tx,ty)||ter[i]===1||SPK.has(i)||occ.has(i)){if(!MP.on||CURPL===LPL()){msgS='Cannot place a trap here';msgT=2;snd('err')}return}
 if(!ok(SPKC)){if(!MP.on||CURPL===LPL()){msgS='Not enough resources';msgT=2;snd('err')}return}
 pay(SPKC);SPK.set(i,120);SPKV++;snd('build',(tx+.5)*TS,(ty+.5)*TS);puff((tx+.5)*TS,(ty+.5)*TS,'#8a7058',6,40,{T:.5,z:.1,vz:.8,g:2,s:.1})}
let SPKA=0,OILA=0;
function trapTick(dt){
 if(SPK.size){SPKA+=dt;if(SPKA>=.5){SPKA-=.5;const dm=(14+.5*waveN)*.5,dead=[];
  for(const[i,hp]of SPK){const x=((i%TW)+.5)*TS,y=(((i/TW)|0)+.5)*TS;let n=0;const Q=ugNear(1,x,y,TS*.62);
   for(let q=0;q<Q.length;q++){const z=UGU[Q[q]];if(z.t===1&&z.hp>0&&dist(z.x,z.y,x,y)<TS*.62){z.hp-=dm;z.hurt=.25;n++}}
   n+=swSplash(x,y,TS*.6,dm,40)||0;if(n){puff(x,y,'#c8ccd4',3,30,{T:.3,z:.2,vz:1,g:-.4,s:.08});const nh=hp-n*7;if(nh<=0)dead.push(i);else SPK.set(i,nh)}}
  if(dead.length){for(const i of dead)SPK.delete(i);SPKV++}}}
 if(RS2.done.oil&&(waveOn||SW.n)){OILA+=dt;if(OILA>=.25){const step=OILA;OILA=0;const dm=12+.5*waveN;
  for(const s of structs){if(s.t!==0||s.prog<1||s.hp<=0||!(s.type==='wall'||s.type==='gate'||s.type==='tower'))continue;if((s.ot||0)>time)continue;s.ot=time+1.5+((s.sid|0)%8)*.04;
   const Q=ugNear(1,s.x,s.y,TS*1.3);let n=0;for(let q=0;q<Q.length;q++){const z=UGU[Q[q]];if(z.t===1&&z.hp>0&&dist(z.x,z.y,s.x,s.y)<TS*1.3+(s.rad||0)){z.hp-=dm;z.hurt=.25;n++}}
   n+=swSplash(s.x,s.y,TS*1.3,dm,40)||0;if(n){puff(s.x,s.y,'#ffb040',4,40,{T:.4,z:.8,vz:1.2,g:3,s:.1});if(REALR()<.4)snd('sizzle',s.x,s.y)}}}}}
/* ---- look: dark pit with five spikes, one instanced mesh each (rebuilt only when the traps change) ---- */
let SPKM=null,SPKP=null,SPKS=-1;
function spkSync(){if(!SPK.size&&!SPKM)return;if(SPKS===SPKV&&SPKM)return;
 if(!SPKM){SPKM=new THREE.InstancedMesh(new THREE.ConeGeometry(.06,.34,4),new THREE.MeshLambertMaterial({color:0xaab0ba}),1500);SPKP=new THREE.InstancedMesh(new THREE.CylinderGeometry(.46,.46,.02,10),new THREE.MeshLambertMaterial({color:0x2e2218}),300);
  for(const m of[SPKM,SPKP]){m.frustumCulled=false;m.count=0;scene.add(m)}}
 SPKS=SPKV;const o=new THREE.Object3D(),offs=[[0,0],[.22,.2],[-.22,.2],[.2,-.22],[-.2,-.2]];let n=0,p=0;
 for(const i of SPK.keys()){if(p>=300||n+5>1500)break;const x=(i%TW)+.5,z=((i/TW)|0)+.5,h=gh(x,z);o.rotation.set(0,0,0);o.scale.set(1,1,1);o.position.set(x,h+.012,z);o.updateMatrix();SPKP.setMatrixAt(p++,o.matrix);
  for(const[a,b]of offs){o.position.set(x+a,h+.17,z+b);o.updateMatrix();SPKM.setMatrixAt(n++,o.matrix)}}
 SPKM.count=n;SPKP.count=p;SPKM.instanceMatrix.needsUpdate=true;SPKP.instanceMatrix.needsUpdate=true}
let ERAA=0;
function eraTick(dt){if(!RS2.done.era)return;ERAA+=dt;if(ERAA<2)return;ERAA-=2;for(const s of structs)if(s.t===0&&s.prog>=1&&s.hp>0&&s.hp<s.max)s.hp=Math.min(s.max,s.hp+s.max*.01)}
IC.era=IC.steel||IC.iron;IC.oil=IC.fire;IC.spike=IC.bastion||IC.torch;
