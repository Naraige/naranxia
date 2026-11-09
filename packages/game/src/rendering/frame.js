import { cbOn, rmotion } from '../core/prefs.js';
import { syncRuins } from './ruins.js';
import { OWN, rangeOf, selH, TOWR } from '../ai/kingdoms.js';
import { snd } from '../audio/sound.js';
import { dist } from '../core/math.js';
import {
  constructionState,
  gateAxAt,
  gateOK,
  moveOK,
  pathOK,
  placeErr,
  tfo,
  tilesFor,
  valid,
  wallAt,
} from '../gameplay/construction.js';
import { ok } from '../gameplay/economy.js';
import { HOMEC, stoneOn } from '../gameplay/players.js';
import { C, RS, RS2, TH, TS, TW, UPC, WORK } from '../gameplay/rules.js';
import { selBs, selectionState } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { rampGroup, rampOK, tfOK } from '../gameplay/terraforming.js';
import { spkSync } from '../gameplay/traps.js';
import { inputState } from '../input/state.js';
import {
  buildPreviewState,
  crackAt,
  CRKP,
  GB1,
  GBM,
  GBW,
  gbwShow,
  ghost,
  ghostMake,
  govBuild,
  govHide,
  groupBoxes,
  MCHOV,
  MCSEL,
  rampBox,
  rampPool,
  rangeRing,
  saplRender,
  SCAF,
  selRangeShow,
  selRing,
  SGEO,
  TGH,
  tgShow,
} from './build-preview.js';
import { pickGround, updateCamera } from './camera.js';
import { fireflies, glow, glowFlush, puff, rflagUpd, smkFlush, syncClouds, syncFx, updateLit } from './effects.js';
import { fowSeenAt, fowVisAt } from './fog.js';
import { applyDay, nightK } from './lighting.js';
import { matV, WUT } from './materials.js';
import { CONNT, scafGeo } from './models/structures.js';
import { postRender } from './post-processing.js';
import { snapM } from './render-settings.js';
import { pulseRoutes } from './routes.js';
import { CAM, camera, scene } from './scene.js';
import { darkA, eyeFlush, fuseFx, mutGlow, pudRender, swarmRenderingState, swRender, zEyes } from './swarm.js';
import { gh, unitG, updateChunks } from './terrain.js';
import { updateTerr } from './territory.js';
import { THREE } from './three.js';
import { angd, animCorpses, animUnit, easeO, sat } from './unit-animation.js';
import { _uFr, _uPV, _uSp, uiFlush } from './unit-instances.js';
import { weatherTick } from './weather.js';
import { hudState, inR } from '../ui/hud.js';
import { gOK } from '../world/routes.js';
import { HT, LAND, occ, pth, stairs, ter } from '../world/terrain.js';
import { stairInfo } from '../world/traversal.js';

export const frameState = {
  frameN: 0,
};


/* Construction animation (visual only): the building rises with s.prog (as before), the scaffold stays a little above it,
   dust puffs at each fifth of the progress and a short settle bounce when construction is seen to finish.
   State lives in a WeakMap, never on the structure (saved/hashed); uses real-time dt and Math.random only through puff. */
const BFX=new WeakMap();
function bldAnim(s,dt){const o=s.o3,pr=Math.min(1,s.prog),rm=rmotion();let f=BFX.get(s);
 if(pr<1){if(!f){f={st:Math.floor(pr*5),b:-1};BFX.set(s,f)}f.seen=1;
  if(s.scaf)s.scaf.scale.y=rm?1:Math.min(1,.2+.8*pr+.3);
  const st=Math.floor(pr*5);if(st>f.st){f.st=st;if(!rm&&Math.abs(s.x/TS-CAM.x)<CAM.dist*2+20&&Math.abs(s.y/TS-CAM.z)<CAM.dist*2+20){const r=(s.sz||1)*TS*.5;for(let i=0;i<4;i++){const a=i*1.5708+.785;puff(s.x+Math.cos(a)*r,s.y+Math.sin(a)*r,'#c9b48c',2,26,{T:.6,z:.15,vz:.9,g:-.4,s:.14})}}}
  o.scale.y=.2+.8*pr;return}
 if(f&&f.seen&&f.b<0){f.b=0;f.seen=0}
 if(f&&f.b>=0){f.b+=dt;if(rm||f.b>.5){BFX.delete(s);o.scale.y=1;return}const t=f.b/.5;o.scale.y=1+.07*Math.sin(t*Math.PI*3)*(1-t)*(1-t);return}
 o.scale.y=1}
export let render3D = function render3D(dt){frameState.frameN++;updateCamera(dt);updateChunks(7);syncRuins();
 let anyDmg=false;for(const s of sessionState.structs)if(s.t===0&&(s.hp<s.max||s.prog<1)){anyDmg=true;break}
 {const R=(CAM.dist*1.7+26)*TS,cx=CAM.x*TS,cy=CAM.z*TS;camera.updateMatrixWorld();_uPV.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_uFr.setFromProjectionMatrix(_uPV);
  swarmRenderingState.ZEYN=0;for(const u of sessionState.units){if(u.shel||Math.abs(u.x-cx)>R||Math.abs(u.y-cy)>R)continue;if(u.t!==0&&!fowVisAt(u.x,u.y)){if(u.t===1&&nightK>.25)zEyes(u,Math.min(1,nightK*1.3),0);continue}if(u.dy==null)u.dy=gh(u.x/TS,u.y/TS);_uSp.center.set(u.x/TS,u.dy+.65,u.y/TS);
   if(!_uFr.intersectsSphere(_uSp)){const g0=u.m;if(g0&&g0.userData){g0.userData.frame=frameState.frameN;g0.visible=false}continue}animUnit(u,dt,anyDmg,frameState.frameN);if(u.m)u.m.visible=true;if(u.fuse>0)fuseFx(u);else if(u.type==='bomber'||u.type==='acid')mutGlow(u);if(u.t===1&&nightK>.25)zEyes(u,darkA(u.x/TS,u.y/TS),1)}}
 animCorpses(dt);swRender(dt);saplRender();pudRender();
 {let ci=0;const WK=WORK*(RS2.done.tools?.75:1);for(const u of sessionState.units){if(ci>=16)break;if(u.t!==0||u.type!=='peasant'||!(u.work>0)||u.carry||u.tl<0||u.o)continue;const j=u.job;if(j!=='w'&&j!=='s'&&j!=='g')continue;const tx=u.tl%TW,ty=(u.tl/TW)|0;if(Math.abs(tx-CAM.x)>34||Math.abs(ty-CAM.z)>34)continue;if(dist(u.x,u.y,(tx+.5)*TS,(ty+.5)*TS)>46)continue;
  const st=Math.max(0,Math.min(9,Math.floor(u.work/WK*10))),h=HT[u.tl];if(j==='w')crackAt(ci++,tx+.5,h,ty+.5,.34,.92,.34,st);else crackAt(ci++,tx+.5,h,ty+.5,.86,.82,.86,st)}for(let k=ci;k<CRKP.length;k++)CRKP[k].visible=false}
 for(const[u,g]of unitG)if(g.userData.frame!==frameState.frameN){scene.remove(g);unitG.delete(u);u.m=null;if(g.userData.mat)g.userData.mat.dispose()}
 {const sb=selectionState.selB&&sessionState.structs.includes(selectionState.selB)?selectionState.selB:selectionState.castleSel?HOMEC():null,on=!!sb;MCSEL.visible=on;selRangeShow(sb,sb&&rangeOf(sb));groupBoxes(selBs(),sb);if(on){const selB=sb;const H=selH(selB),w=selB.type==='gate'?(selB.ax?1:(selB.gl||2)):selB.sz,d=selB.type==='gate'?(selB.ax?(selB.gl||2):1):selB.sz;MCSEL.position.set(selB.x/TS,selB.bh||LAND,selB.y/TS);MCSEL.scale.set(w+.04,H,d+.04)}}
 MCHOV.visible=false;if(!sessionState.mode&&sessionState.started&&!sessionState.over&&inputState.mouse.x>=0&&!hudState.uiRects.some(r=>inR(inputState.mouse,r))&&!(window.matchMedia&&matchMedia('(pointer:coarse)').matches)){const p=pickGround(inputState.mouse.x,inputState.mouse.y);if(p){const tx=Math.floor(p.x),ty=Math.floor(p.z);if(gOK(tx,ty)){const o=occ.get(ty*TW+tx);if(!o){const h=HT[ty*TW+tx],tr=ter[ty*TW+tx];MCHOV.visible=true;MCHOV.position.set(tx+.5,tr>=2&&tr<=4?h:h-1,ty+.5);MCHOV.scale.set(1.01,tr>=2&&tr<=4?(tr===2?1.9:.95):1.01,1.01)}}}}
 selRing.visible=false;if(false){selRing.position.set(selectionState.selB.x/TS,(selectionState.selB.bh||LAND)+.2,selectionState.selB.y/TS);const q=selectionState.selB.sz*.78+Math.sin(sessionState.clockT*4)*.05;selRing.scale.set(q,q,q)}
 for(const s of SCAF){if(s.prog>=1||!sessionState.structs.includes(s)){scene.remove(s.scaf);s.scaf=null;SCAF.delete(s)}}
 for(const s of sessionState.structs){if(s.t===2&&s.o3)s.o3.visible=fowSeenAt(s.x,s.y);if(s.t===0&&s.prog<1&&!s.scaf&&s.o3){const H={wall:2.1,gate:2.8,tower:4.6,castle:6.2,barracks:3.1,farm:.8,storage:2.3,house:3.1,academy:3.4,market:2.3,forester:2.2,guild:3.0,observatory:3.3,granary:2.6,bell:2.6,sanctuary:2.6,beacon:3.4,orchard:2.4,forge:3.0,embassy:2.8,warroom:2.9,sappers:2.6,torch:1.5,keep:4.9}[s.type]||2,w=s.type==='gate'?(s.gl||2)*1.05:s.sz,d=s.type==='gate'?.9:s.sz,k=s.type+w+'x'+d+'x'+H,m=new THREE.Mesh(SGEO[k]||(SGEO[k]=scafGeo(w,d,H)),matV);m.position.set(s.x/TS,s.bh||HT[s.ty*TW+s.tx],s.y/TS);if(s.type==='gate'&&s.ax)m.rotation.y=Math.PI/2;scene.add(m);s.scaf=m;SCAF.add(s)}
  if(s.prog>=1&&s.hp<s.max*.3&&s.hp>0&&s.o3&&Math.abs(s.x/TS-CAM.x)<CAM.dist*2+30&&Math.abs(s.y/TS-CAM.z)<CAM.dist*2+30){const fl=.75+.25*Math.sin(sessionState.clockT*13+s.x)+.15*Math.sin(sessionState.clockT*29+s.y),hb=(s.bh||LAND)+1.2+(s.sz||1)*.4;glow(s.x/TS,hb,s.y/TS,1.1*(s.sz||1)*fl,1,.42,.1,.5);glow(s.x/TS,hb+.5,s.y/TS,.5*fl,1,.85,.4,.6)}
  if(s.flag)s.flag.rotation.y=Math.sin(sessionState.clockT*3)*.3;if(s.o3)bldAnim(s,dt)
  if(s.bolt){const c=s.wcd>0?s.wcd:0,p=c/3.4;s.bolt.visible=p<.5;s.bolt.position.z=-Math.max(0,Math.min(1,(p-.1)/.4))*.55}
  if(s.head){const a=s.aim||0;s.head.rotation.y+=angd(s.head.rotation.y,a)*Math.min(1,dt*8);s.head.position.z=-Math.max(0,s.rec||0)*.18*Math.cos(s.head.rotation.y);s.head.position.x=-Math.max(0,s.rec||0)*.18*Math.sin(s.head.rotation.y)}
  if(s.arm){const a=s.aim||0,c=s.wcd>0?s.wcd:0,rest=.95,fire=-.95;let ang;if(c>5.7)ang=rest+(fire-rest)*sat((6.2-c)/.22);else if(c>.3)ang=fire+(rest-fire)*easeO(sat((5.7-c)/5.2));else ang=rest;
   if(s.tpv){s.tpv.rotation.y+=angd(s.tpv.rotation.y,a)*Math.min(1,dt*2.2);s.arm.rotation.y=0}else s.arm.rotation.y+=angd(s.arm.rotation.y,a)*Math.min(1,dt*3);s.arm.rotation.x=ang;if(s.cw)s.cw.rotation.x=-ang}
  if(s.door){let op=0;for(const u of sessionState.units)if(u.t===0&&!u.gar&&Math.abs(u.x-s.x)<TS*2.1&&Math.abs(u.y-s.y)<TS*2.1){op=1;break}
   if((op>.5)!==!!s.dopen){s.dopen=op>.5;snd('gate',s.x,s.y)}s.dop+=(op-s.dop)*Math.min(1,dt*(s.door.userData.lv?4:7));if(s.door.userData.lv){const a=s.dop*1.5;s.door.userData.lv[0].rotation.y=a;s.door.userData.lv[1].rotation.y=-a}else s.door.scale.y=Math.max(.08,1-s.dop*.92)}}

 WUT.value=sessionState.clockT;updateLit();syncFx();if(!rmotion())fireflies(dt);smkFlush();syncClouds();applyDay(dt);weatherTick(dt);spkSync();updateTerr();pulseRoutes();
 rflagUpd();
 if(sessionState.mode==='movec'&&!sessionState.over){const hc=HOMEC();if(hc)govBuild('mv'+sessionState.ver+':'+sessionState.structs.length+':'+hc.tx+','+hc.ty+':'+(hc.rot|0)+':'+OWN.size,hc.tx+2,hc.ty+2,41,(x,y)=>moveOK(x,y))}else govHide();
 ghost.visible=rangeRing.visible=false;GB1.g.visible=false;rampPool.forEach(m=>m.visible=false);ghost.material.depthTest=true;if(TGH)TGH.visible=false;if(GBW)GBW.visible=false;
 if(sessionState.mode&&!sessionState.over&&inputState.mouse.x>=0&&!hudState.uiRects.some(r=>inR(inputState.mouse,r))){const p=pickGround(inputState.mouse.x,inputState.mouse.y);if(p){let tx=Math.floor(p.x),ty=Math.floor(p.z);if(sessionState.mode==='house'||sessionState.mode==='farm'||CONNT.has(sessionState.mode)){const sp=snapM(sessionState.mode,tx,ty);tx=sp[0];ty=sp[1]}
  if(tx>=0&&ty>=0&&tx<TW&&ty<TH&&gOK(tx,ty)){let good=(sessionState.mode==='path'?pathOK(tx,ty):valid(tx,ty))&&ok(C[sessionState.mode]);if(sessionState.mode==='tower')good=tilesFor('tower',tx,ty,2).every(([x,y])=>gOK(x,y)&&(valid(x,y)||wallAt(x,y)))&&ok(C.tower);if(sessionState.mode==='ballista'||sessionState.mode==='trebuchet'){const o=occ.get(ty*TW+tx);good=!!o&&o.type==='tower'&&o.t===0&&o.prog>=1&&!o.weapon&&ok(C[sessionState.mode])}if(sessionState.mode==='raise'||sessionState.mode==='dig')good=tfOK(tx,ty,true)&&ok(C[sessionState.mode])&&!tfo.has(ty*TW+tx);if(sessionState.mode==='ramp')good=rampOK(tx,ty)&&!tfo.has(ty*TW+tx);if(sessionState.mode==='stairs')good=good&&!!stairInfo(tx,ty);if(sessionState.mode==='path')good=good&&pth[ty*TW+tx]<(RS.done?2:1);if(sessionState.mode==='barracks')good=tilesFor('barracks',tx,ty,2).every(([x,y])=>gOK(x,y)&&valid(x,y))&&ok(C.barracks);
   let hh=sessionState.mode==='farm'?.9:sessionState.mode==='storage'?1.1:sessionState.mode==='house'?1.4:sessionState.mode==='academy'?2.2:sessionState.mode==='market'?1.8:sessionState.mode==='forester'?1.5:sessionState.mode==='guild'?2.2:sessionState.mode==='observatory'?2.6:sessionState.mode==='granary'?2.3:sessionState.mode==='bell'?2.2:sessionState.mode==='sanctuary'?2.2:sessionState.mode==='beacon'?2.8:sessionState.mode==='orchard'?2.0:sessionState.mode==='forge'?2.4:sessionState.mode==='embassy'?2.3:sessionState.mode==='warroom'?2.4:sessionState.mode==='sappers'?2.2:sessionState.mode==='torch'?1.3:sessionState.mode==='rally'||sessionState.mode==='rallyc'?.1:sessionState.mode==='ramp'?.12:sessionState.mode==='barracks'?1.9:sessionState.mode==='tower'?3:sessionState.mode==='path'?.06:sessionState.mode==='stairs'?.5:sessionState.mode==='gate'?2.2:sessionState.mode==='ballista'||sessionState.mode==='trebuchet'?3.6:sessionState.mode==='raise'||sessionState.mode==='dig'?1:1.7,h0=HT[ty*TW+tx];let gx=1.02,gz=1.02,cx2=tx+.5,cz2=ty+.5;if(sessionState.mode==='gate'){const ax=gateAxAt(tx,ty);good=gateOK(tx,ty,ax,constructionState.gateLen)&&ok(C.gate);gx=ax?1.02:constructionState.gateLen+.02;gz=ax?constructionState.gateLen+.02:1.02;cx2=tx+(ax?.5:constructionState.gateLen/2);cz2=ty+(ax?constructionState.gateLen/2:.5)}if(sessionState.mode==='tower'||sessionState.mode==='barracks'||sessionState.mode==='farm'||sessionState.mode==='storage'||sessionState.mode==='house'||sessionState.mode==='academy'||sessionState.mode==='market'||sessionState.mode==='forester'||sessionState.mode==='guild'||sessionState.mode==='observatory'||sessionState.mode==='granary'||sessionState.mode==='bell'||sessionState.mode==='sanctuary'||sessionState.mode==='beacon'||sessionState.mode==='orchard'||sessionState.mode==='forge'||sessionState.mode==='embassy'||sessionState.mode==='warroom'||sessionState.mode==='sappers'){gx=gz=2.02;cx2=tx+1;cz2=ty+1}let yy=h0+hh/2,showG=true;
    if(sessionState.mode==='barracks'||sessionState.mode==='farm'||sessionState.mode==='storage'||sessionState.mode==='house'||sessionState.mode==='academy'||sessionState.mode==='market'||sessionState.mode==='forester'||sessionState.mode==='guild'||sessionState.mode==='observatory'||sessionState.mode==='granary'||sessionState.mode==='bell'||sessionState.mode==='sanctuary'||sessionState.mode==='beacon'||sessionState.mode==='orchard'||sessionState.mode==='forge'||sessionState.mode==='embassy'||sessionState.mode==='warroom'||sessionState.mode==='sappers'){const t2=tilesFor(sessionState.mode,tx,ty,2),hs2=t2.map(([x,y])=>HT[y*TW+x]);good=t2.every(([x,y])=>gOK(x,y)&&valid(x,y))&&Math.max(...hs2)-Math.min(...hs2)<=2&&ok(C[sessionState.mode])&&!placeErr(sessionState.mode,tx,ty);yy=Math.max(...hs2)+hh/2}
    if(sessionState.mode==='raise'){showG=false;tgShow('block',tx,ter[ty*TW+tx]===1?LAND-1:h0,ty,good)}
    if(sessionState.mode==='dig'){showG=false;tgShow('block',tx-.015,h0-1.015,ty-.015,good,1.03,true)}
    if(sessionState.mode==='path'){showG=false;tgShow(stoneOn()?'path2':'path1',tx,h0+.004,ty,good)}
    if(sessionState.mode==='ballista'||sessionState.mode==='trebuchet'){const o=occ.get(ty*TW+tx);if(o&&o.type==='tower'&&o.t===0){showG=false;gbwShow(sessionState.mode,o,(constructionState.buildRot&3)*Math.PI/2,good)}}
    if(sessionState.mode==='upgrade'){const o=occ.get(ty*TW+tx);if(o&&o.t===0&&UPC[o.type]&&o.tier===0){showG=false;good=o.prog>=1&&ok(UPC[o.type]);buildPreviewState.GHO={tier:1,rot:o.rot|0,gl:o.gl||2};try{ghostMake(GB1,o.type,o.tx,o.ty,o.ax|0,good,.62)}finally{buildPreviewState.GHO=null}}else good=false}
    if(sessionState.mode==='demolish'){const o=occ.get(ty*TW+tx);good=!!o&&o.t===0&&o.type!=='castle';if(!o&&stairs.has(ty*TW+tx)){good=true;showG=false;(stairs.get(ty*TW+tx).blk?[ty*TW+tx]:rampGroup(ty*TW+tx)).forEach((ii,bi)=>rampBox(bi,(ii%TW)+.5,HT[ii]+.14,((ii/TW)|0)+.5,1,.3,1,false))}else if(o){gx=o.sz*1.04;gz=o.sz*1.04;cx2=o.x/TS;cz2=o.y/TS;hh=2.4;yy=h0+hh/2}else showG=false;ghost.material.color.set(good?0xff9a3c:0xff5555)}
    if(sessionState.mode==='ramp'){showG=false;tgShow('ramp'+(constructionState.buildRot&3),tx,h0,ty,good)}
    if(sessionState.mode==='movec')good=moveOK(tx,ty)&&ok(C.movec);ghost.material.color.set(good?(cbOn()?0x56b4e9:0x66ff66):(cbOn()?0xe69f00:0xff5555));ghost.scale.set(gx,hh,gz);ghost.position.set(cx2,yy,cz2);ghost.visible=showG&&!GBM.has(sessionState.mode);if(GBM.has(sessionState.mode)){const a2=sessionState.mode==='gate'?gateAxAt(tx,ty):0,mc=sessionState.mode==='movec';ghostMake(GB1,mc?'castle':sessionState.mode,mc?tx-2:tx,mc?ty-2:ty,a2,good,.62)}
   if(sessionState.mode==='tower'||sessionState.mode==='ballista'||sessionState.mode==='trebuchet'){const rr=sessionState.mode==='tower'?TOWR+(stoneOn()?1.5:0):sessionState.mode==='ballista'?18:32;rangeRing.scale.set(rr/7.5,1,rr/7.5);rangeRing.position.set(cx2,h0+.15,cz2);rangeRing.visible=true}}}}
 eyeFlush();glowFlush();scene.updateMatrixWorld();uiFlush();postRender(scene,camera,true)};

export function setRender3DHandler(handler) {
  render3D = handler;
}
