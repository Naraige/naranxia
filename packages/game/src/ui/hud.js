import { bossBar } from '../ai/wave-boss.js';
import { wkOf, WKT } from '../ai/workplaces.js';
import { snd, sndOn, toggleSound } from '../audio/sound.js';
import { backgroundLoopState } from '../core/background-loop.js';
import { UIDT } from '../core/frame-loop.js';
import { diagnosticsState, MSGL } from '../debug/diagnostics.js';
import { drawDev } from '../debug/tools.js';
import { ACHD, TOASTS } from '../gameplay/achievements.js';
import { popCap, popUsed } from '../gameplay/economy.js';
import { kingBar } from '../gameplay/king-skills.js';
import { newGame, openMenu } from '../gameplay/lifecycle.js';
import { aliveC, LPL, playersState } from '../gameplay/players.js';
import { GCAP, rulesState, T, TH, TS, TW } from '../gameplay/rules.js';
import { curB, sel } from '../gameplay/selection.js';
import { sessionState } from '../gameplay/session.js';
import { simulationState } from '../gameplay/simulation.js';
import { gstBest, statisticsState } from '../gameplay/statistics.js';
import { SW, swPending } from '../gameplay/swarm.js';
import { wavesState } from '../gameplay/waves.js';
import { L, T_, TC, TTL, tw, twH } from '../i18n/language.js';
import { camZoom } from '../input/desktop.js';
import { inputState } from '../input/state.js';
import { setPause } from '../multiplayer/lockstep.js';
import { objBar } from '../multiplayer/objectives.js';
import { MP } from '../multiplayer/session.js';
import { home, scr } from '../rendering/camera.js';
import { CAM } from '../rendering/scene.js';
import { BANNER } from '../rendering/structures.js';
import { UNITK } from '../rendering/unit-animation.js';
import { SEASC, seasonIdx, wxLabel } from '../rendering/weather.js';
import { CMP, costParts, drawCost, drawItem, menuItems, NAMES, uiBtn } from './build-menu.js';
import { canvasesState, cv } from './canvases.js';
import { convoyPanelState, drawConvoy } from './convoy-panel.js';
import { BTN, BTNH, CHAT, frame, GRN, GRNH, hearts, INV, MAPF, PAN, SLOT, TIPP } from './drawing.js';
import { hudDisplayState } from './hud-state.js';
import { dIc, IC } from './icons.js';
import { THEME } from './kingdom-theme.js';
import { bar, drawMapModal, drawWorld, mmss, pill } from './minimap.js';
import { settingsState } from './settings.js';
import { drawPicker, sitePickerState } from './site-picker.js';
import { drawTitle } from './title-menu.js';
import { drawTroops, PLUN, troopPanelState } from './troop-panel.js';
import { tutBar } from './tutorial.js';
import { FF } from './typography.js';
import { LAND, rollWorld, terrainState } from '../world/terrain.js';

export const hudState = {
  uiHits: [],
  uiRects: [],
  mmDrag: false,
};

/* ================= HUD, world map, title screen, input ================= */
export let mmRect = {x:0,y:0,w:0,h:0};

export const U=(x,y,w,h)=>({x:x*hudDisplayState.UIS,y:y*hudDisplayState.UIS,w:w*hudDisplayState.UIS,h:h*hudDisplayState.UIS}),inR=(p,r)=>p.x>=r.x&&p.x<r.x+r.w&&p.y>=r.y&&p.y<r.y+r.h;

function flow(L,x0,y0,w){let x=x0,y=y0+(CMP?0:9),rh=0,mx=0,rowStart=true;for(const it of L){if(it.under){it.x=it.under.x;it.y=it.under.y+it.under.h+3;it.lab=false;rh=Math.max(rh,it.y+it.h-y);continue}if(it.br){x=x0+9999}if(it.gap!==undefined){x+=it.gap;continue}if(x+it.w>x0+w&&x>x0){x=x0;y+=rh+(CMP?3:12);rh=0;rowStart=true}it.x=x;it.y=y;it.lab=it.first;rowStart=false;x+=it.w+3;rh=Math.max(rh,it.h);mx=Math.max(mx,x-3)}return{h:y+rh-y0,w:mx-x0}}

export const idleP=()=>sessionState.units.filter(u=>u.t===0&&(!MP.on||(u.pl|0)===playersState.CURPL)&&u.type==='peasant'&&!u.job&&!u.o&&!u.carry&&u.hp>0&&!u.shel);

export function selPeas(){const P=sessionState.units.filter(u=>u.t===0&&u.type==='peasant'&&u.hp>0&&!u.shel&&(!MP.on||(u.pl|0)===playersState.CURPL));if(!P.length)return;sessionState.units.forEach(u=>u.sel=false);P.forEach(u=>u.sel=true);sessionState.mode=null;hudDisplayState.msgS=P.length+' peasants selected';hudDisplayState.msgT=2}

export function selIdle(){const I=idleP();if(!I.length){hudDisplayState.msgS='No idle peasants';hudDisplayState.msgT=2;return}sessionState.units.forEach(u=>u.sel=false);sessionState.mode=null;I.forEach(u=>u.sel=true);CAM.x=I[0].x/TS;CAM.z=I[0].y/TS;hudDisplayState.msgS=I.length+' idle peasant'+(I.length>1?'s':'')+' selected';hudDisplayState.msgT=3}

function drawEnd(UW,UH){const g=canvasesState.ctx.createLinearGradient(0,0,0,UH);g.addColorStop(0,'rgba(80,0,0,.45)');g.addColorStop(1,'rgba(170,16,16,.68)');canvasesState.ctx.fillStyle=g;canvasesState.ctx.fillRect(0,0,UW,UH);hudState.uiHits=[];hudState.uiRects=[U(0,0,UW,UH)];const cx=UW/2,cy=UH/2,pw=Math.min(220,UW-16);
 let ts=3;while(ts>1.3&&twH('Your kingdom fell!',ts)>UW-16)ts-=.2;TTL('Your kingdom fell!',cx,cy-78,ts,'center');TC(THEME.n+' has fallen to the horde',cx,cy-78+9*ts+8,'#e0e0e0',1);
 {const a='Score: ',b=String(sessionState.waveN*100+sessionState.kills),w=tw(a,1.1)+tw(b,1.1);T_(a,cx-w/2,cy-22,'#ffffff',1.1);T_(b,cx-w/2+tw(a,1.1),cy-22,'#ffff55',1.1)}
 TC('Waves survived: '+sessionState.waveN+'    Zombies slain: '+sessionState.kills+'    Best: wave '+sessionState.best.w,cx,cy-6,'#e0e0e0',.85);
 {const G=rulesState.GST,y1=cy+9;TC('Earned: '+Math.round(G.g)+' gold    '+Math.round(G.w)+' wood    '+Math.round(G.s)+' stone    '+Math.round(G.f)+' food',cx,y1,'#f0dca8',.8);
  const bu=gstBest(),nm=bu?(bu[0]==='other'?'Towers and cannons':L(NAMES[bu[0]]||bu[0])):'-',a1='Best unit: ',c1=bu?'('+bu[1]+' kills)':'',w1=tw(a1,.8)+tw(nm,.8)+(c1?tw(c1,.8)+6:0)+4;let xx=cx-w1/2;
  T_(a1,xx,y1+13,'#c4a37a',.8);xx+=tw(a1,.8);T_(nm,xx,y1+13,'#ffffff',.8);xx+=tw(nm,.8)+4;if(c1)T_(c1,xx,y1+13,'#ffff55',.8);
  TC('Units lost: '+G.lost,cx,y1+26,'#c4a37a',.8)}
 if(statisticsState.SBR){const y2=cy+48;TC((statisticsState.SBR.daily?'Daily map':'This map')+' - '+(statisticsState.SBR.rank===0?'NEW RECORD!':'Best runs'),cx,y2,statisticsState.SBR.rank===0?'#ffff55':'#f0dca8',.8);
  statisticsState.SBR.top.forEach((r,i)=>TC('#'+(i+1)+'   Wave '+r.w+'   '+r.k+' kills',cx,y2+12+i*11,i===statisticsState.SBR.rank?'#ffffff':'#c4a37a',.72))}
 pill(cx-pw/2,cy+100,pw,22,'Play again',BTN,BTNH,newGame,null,1.1);pill(cx-pw/2,cy+128,pw,22,'Title Screen',BTN,BTNH,()=>{sessionState.inGame=false;sessionState.over=false;sessionState.started=false;rollWorld()},null,1.1)}

function drawToasts(UW){for(let i=0;i<TOASTS.length;i++){const o=TOASTS[i];o.t+=UIDT;const T=o.t,sl=T<.35?1-T/.35:T>4.6?(T-4.6)/.35:0;if(T>4.95){TOASTS.splice(i,1);i--;continue}const d=ACHD[o.k],w=Math.max(150,Math.max(tw(d[0],.9),twH('Achievement',.95))+40),h=30,x=UW-w-4+sl*(w+8),y=settingsState.TOPH+4+i*(h+4);
  frame(x,y,w,h,PAN,4);
  const ic=IC[o.k==='w1'||o.k==='w5'||o.k==='w10'?'shield':o.k==='k1'||o.k==='k100'||o.k==='k500'?'sword':o.k==='res'?'upgrade':o.k==='move'?'home':o.k==='keep'?'tower':o.k]||IC.sword;if(ic)dIc(ic,x+6,y+7,16);
  TTL('Achievement',x+28,y+4,.95);T_(d[0],x+28,y+17,'#ffffff',.85)}}

/* ---- main HUD ---- */
export function drawUI(){canvasesState.ctx.setTransform(hudDisplayState.UIS,0,0,hudDisplayState.UIS,0,0);canvasesState.ctx.imageSmoothingEnabled=true;hudState.uiHits=[];hudState.uiRects=[];
 const UW=Math.floor(cv.width/hudDisplayState.UIS),UH=Math.floor(cv.height/hudDisplayState.UIS);
 if(!sessionState.started){if(sitePickerState.picking)drawPicker(UW,UH);else drawTitle(UW,UH);canvasesState.ctx.setTransform(1,0,0,1,0,0);return}
 frame(-3,-3,UW+6,27,CHAT,0);hudState.uiRects.push(U(0,0,UW,24));
 /* right cluster: menu / pause / speed */
 let rx=UW-5;const tb=(w,ic,fn,tip,on)=>{rx-=w;uiBtn(rx,3,w,17,BTN,BTNH,fn,tip,(x,y,W2,H2)=>dIc(ic,x+(W2-12)/2,y+2.5,12),on);rx-=3};
 tb(18,IC.menu,openMenu,['Main menu [Esc]']);tb(18,IC.army,()=>{troopPanelState.troopsOpen=!troopPanelState.troopsOpen;snd('click')},['Troops [F2]','Every unit and what it is doing'],troopPanelState.troopsOpen);tb(18,IC.gear,()=>{openMenu();settingsState.settingsOpen=true;settingsState.fromGame=true},['Settings']);tb(18,sessionState.paused?IC.play:IC.pause,()=>{setPause(!sessionState.paused)},['Pause [Space]'],sessionState.paused);tb(18,sndOn?IC.sound:IC.mute,toggleSound,['Sound on/off [O]']);
 rx-=21;uiBtn(rx,3,21,17,BTN,BTNH,()=>{if(!MP.on)sessionState.spd=sessionState.spd%3+1},['Game speed [F]'],(x,y,W2)=>TC('x'+sessionState.spd,x+W2/2,y+4,sessionState.spd>1?'#ffd23c':'#fff',.95),sessionState.spd>1);rx-=6;
 const wp=[['Wave '+sessionState.waveN,'#d9b8ff'],[wavesState.waveOn?(wavesState.nightLv>=.5?'Night':(wavesState.hordeD<5000?'Horde '+Math.round(wavesState.hordeD)+' tiles':'Horde')):'Next '+mmss(sessionState.waveT),wavesState.waveOn?(wavesState.nightLv>=.5?'#9fb4ff':'#ffb38a'):sessionState.waveT<10&&((sessionState.clockT*3)|0)%2?'#ff8a8a':'#ffffff'],[sessionState.nextL.map(L=>terrainState.ROUTES[L].dir).join(' '),'#ff7a7a'],[wxLabel(),SEASC[seasonIdx()]]];
 let wwid=0;wp.forEach(p=>wwid+=tw(p[0],.95)+10);if(UW<560||rx-wwid>UW*.42){let x=UW<560?6:rx-wwid;wp.forEach(p=>{T_(p[0],x,7,p[1],.95);x+=tw(p[0],.95)+10});if(UW>=560)rx-=wwid+4;hudState.uiHits.push({...U(UW<560?6:rx,3,wwid,17),tip:['Next wave','Zombies come along the red lines']})}
 let x=6;{const nmw=Math.min(90,tw(THEME.n,.9)+4);if(UW>=560){canvasesState.ctx.drawImage(BANNER,x,2,13,19.5);T_(THEME.n,x+17,7,'#fff',.9);hudState.uiHits.push({...U(x,2,17+nmw,20),tip:['Your kingdom','Banner on your castle, towers and gates']});x+=21+nmw}}
 const two=UW<560;settingsState.TOPH=two?46:28;let ry=3;if(two){frame(3,22,UW-6,19,CHAT,6);x=9;rx=UW-6;ry=23}
 const item=(ic,s,col,tip)=>{const n=16+tw(s)+10;if(x+n>rx-4)return;dIc(ic,x,ry+2,13);T_(s,x+16,ry+3.5,col);hudState.uiHits.push({...U(x,ry,n-4,17),tip});x+=n};
 item(IC.coin,sessionState.res.g,'#ffd23c',['Gold']);item(IC.wood,sessionState.res.w,'#e8b27a',['Wood']);item(IC.stone,sessionState.res.s,'#d4dae6',['Stone']);item(IC.food,Math.floor(sessionState.res.f||0),'#f2c14e',['Food','Farms make it while a peasant works them','Every unit costs food to train']);
 {const hf=Math.max(0,sessionState.CS.hp+(sessionState.CS2?sessionState.CS2.hp:0))/(sessionState.CS.max+(sessionState.CS2?sessionState.CS2.max:0));if(x+86<rx-4){hearts(x,ry+4.5,hf,10);hudState.uiHits.push({...U(x,ry,80,17),tip:['Castle health','Do not let it fall']});x+=86}else if(x+60<rx-4){dIc(IC.heart,x,ry+2,13);bar(x+16,ry+4.5,38,hf,'#ff6a6a','#c01f2f');hudState.uiHits.push({...U(x,ry,56,17),tip:['Castle health','Do not let it fall']});x+=62}}
 {const pu=popUsed(LPL()),pc=popCap(LPL());item(IC.bed,pu+'/'+pc,pu>=pc?'#ff8a7a':'#f2e2c0',['Population','Houses raise the limit (+6 each)','and every new unit costs food'])}item(IC.skull,sessionState.units.filter(u=>u.t===1).length+SW.n,'#c4ee98',['Zombies alive']);item(IC.sword,sessionState.kills,'#fbf0dc',['Zombies slain']);
 /* build menu */
 const L=menuItems(),narrow=UW<340,mw=narrow?100:150,mh=Math.round(mw*TH/TW),availW=narrow?UW-8:UW-mw-30,f0=flow(L,0,0,availW-8),ph=f0.h+10,py=UH-ph-6,pw=f0.w+10,px=narrow?4:Math.max(4,((UW-mw-18-pw)>>1));
 flow(L,px+5,py+5,availW-8);frame(px,py,pw,ph,INV,6);hudState.uiRects.push(U(px,py,pw,ph));for(const it of L)if(it.gap===undefined)drawItem(it);
 const S2=sel();let sy=py-4;const QB=sessionState.queue.filter(q=>q.b===curB());if(QB.length)sy-=22;if(narrow){const yb0=py-mh-9-3-19-19;sy=Math.min(sy,yb0-3)}
 if(S2.length&&!sessionState.over){const cnt={};S2.forEach(u=>cnt[u.type]=(cnt[u.type]||0)+1);const txt=Object.entries(cnt).map(([k,v])=>v+' '+L(v>1?(PLUN[k]||NAMES[k]):NAMES[k])).join(', '),hint=S2.some(u=>u.type==='archer')?'Right-click a wall, gate or tower to garrison':S2.some(u=>u.type==='peasant')?'Right-click a resource to harvest, a building to repair':S2.some(u=>u.type==='captain')?'[G] group nearby soldiers behind the captain':'Right-click to move or attack',w=Math.max(tw(txt,.9),tw(hint,.78))+14;frame(px,sy-26,w,26,CHAT,5);T_(txt,px+7,sy-22,'#ffff55',.9);T_(hint,px+7,sy-11,'#e0e0e0',.78);hudState.uiRects.push(U(px,sy-26,w,26))}
 if(QB.length)QB.forEach((q,i)=>{const bx=px+i*20,by=py-23;frame(bx,by,18,18,SLOT,4);dIc(IC[q.type],bx+2,by+1.5,14);canvasesState.ctx.fillStyle='#000';canvasesState.ctx.fillRect(bx+2,by+14,14,3);if(i===0){canvasesState.ctx.fillStyle='#55ff55';canvasesState.ctx.fillRect(bx+2,by+14,Math.max(1,Math.round(14*(1-q.left/q.tot))),2)}});
 /* minimap = world map */
 const mx2=UW-mw-9,my2=narrow?py-mh-9:UH-mh-9;
 frame(mx2-4,my2-4,mw+8,mh+8,MAPF,5);drawWorld(mx2,my2,mw,mh,false);mmRect=U(mx2,my2,mw,mh);hudState.uiRects.push(U(mx2-3,my2-3,mw+6,mh+6));
 const bw2=(mw+6-3)/2,ya=my2-3-19;
 uiBtn(mx2-3,ya,bw2,17,GRN,GRNH,home,['Back to base [H]','Centers the camera on your castle'],(x,y,w)=>{dIc(IC.compass,x+4,y+2.5,12);T_('Base',x+19,y+4,'#fff',.95)});
 uiBtn(mx2-3+bw2+3,ya,bw2,17,BTN,BTNH,()=>{sessionState.showMap=true},['World map [M]','See the whole world, spawns and routes'],(x,y,w)=>{dIc(IC.map,x+4,y+2.5,12);T_('Map',x+19,y+4,'#fff',.95)});
 const qw=(mw+6-9)/4,yb=ya-19;[[IC.zoomIn,()=>camZoom(-1),'Zoom in'],[IC.zoomOut,()=>camZoom(1),'Zoom out'],[IC.rotL,()=>{CAM.yaw+=.4},'Rotate left [Z]'],[IC.rotR,()=>{CAM.yaw-=.4},'Rotate right [X]']].forEach(([ic,fn,t],i)=>uiBtn(mx2-3+i*(qw+3),yb,qw,17,BTN,BTNH,fn,[t],(x,y,w)=>dIc(ic,x+(w-12)/2,y+2.5,12)));
 if(troopPanelState.troopsOpen)drawTroops(UW,UH);if(convoyPanelState.convoyOpen)drawConvoy(UW,UH);if(diagnosticsState.devOpen)drawDev(UW,UH);
 /* banners & hints */
 let bossY=0;if(wavesState.WAVEZ>0&&!sessionState.over){let rem=SW.n+swPending();for(const u of sessionState.units)if(u.t===1&&u.lane>=0)rem++;if(rem>0){const bw=Math.min(182,UW-40),bx=Math.round((UW-bw)/2),by=settingsState.TOPH+13;TC('Raid - Wave '+sessionState.waveN+'  ('+rem+' left)',UW/2,settingsState.TOPH+2,'#ffffff',.85);canvasesState.ctx.fillStyle='#000';canvasesState.ctx.fillRect(bx-1,by-1,bw+2,7);canvasesState.ctx.fillStyle='#4a0e0e';canvasesState.ctx.fillRect(bx,by,bw,5);const fw=Math.max(1,Math.round(bw*Math.min(1,rem/wavesState.WAVEZ)));canvasesState.ctx.fillStyle='#d81e1e';canvasesState.ctx.fillRect(bx,by,fw,5);canvasesState.ctx.fillStyle='#ff6a6a';canvasesState.ctx.fillRect(bx,by,fw,1);canvasesState.ctx.fillStyle='rgba(0,0,0,.35)';for(let k=1;k<10;k++)canvasesState.ctx.fillRect(bx+Math.round(bw*k/10),by,1,5);bossY=22}else wavesState.WAVEZ=0;if(!sessionState.over)bossY+=bossBar(UW,settingsState.TOPH+bossY);bossY+=objBar(UW,settingsState.TOPH+bossY);bossY+=kingBar(UW,settingsState.TOPH+bossY);bossY+=tutBar(UW,settingsState.TOPH+bossY)}
 if(!sessionState.over){let msg=sessionState.mode?'Place '+NAMES[sessionState.mode]+(sessionState.mode==='gate'?' - 3 tiles: two towers and a passage, [R] rotates':sessionState.mode==='movec'?' - click the new centre of your castle':sessionState.mode==='ballista'||sessionState.mode==='trebuchet'?' on a tower - [R] sets facing':sessionState.mode==='raise'||sessionState.mode==='dig'?' - paint tiles':sessionState.mode==='ramp'?' - one block that climbs 1 level, [R] turns it':sessionState.mode==='demolish'?' - click a building':sessionState.mode==='upgrade'?' - click or drag over wood buildings':'')+' - click a tile - right-click or Esc cancels':hudDisplayState.msgT>0?hudDisplayState.msgS:sessionState.time<30?'Select peasants, then right-click a tree, rock or gold to harvest':'';
  if(hudDisplayState.msgT>0&&hudDisplayState.msgS&&hudDisplayState.msgS!==MSGL[MSGL.length-1]){MSGL.push(hudDisplayState.msgS);if(MSGL.length>25)MSGL.shift()}
  if(msg&&sessionState.bannerT<=0){canvasesState.ctx.globalAlpha=sessionState.mode||hudDisplayState.msgT>0?1:Math.min(1,(18-sessionState.time)/3);let ms=.95;while(ms>.55&&tw(msg,ms)+16>UW-6)ms-=.05;const w=tw(msg,ms)+16;frame((UW-w)/2,settingsState.TOPH+bossY,w,16,CHAT,8);TC(msg,UW/2,settingsState.TOPH+bossY+4,'#ffffff',ms);canvasesState.ctx.globalAlpha=1}
  if(sessionState.bannerT>0){canvasesState.ctx.globalAlpha=Math.min(1,sessionState.bannerT*1.2);let bs=3.4;while(bs>1.6&&tw(sessionState.bannerS,bs)>UW-20)bs-=.2;let b2=1.15;while(b2>.6&&tw(sessionState.bannerS2,b2)>UW-20)b2-=.05;const yb=Math.max(settingsState.TOPH+8,UH*.2);TC(sessionState.bannerS,UW/2,yb,'#ff5555',bs);TC(sessionState.bannerS2,UW/2,yb+9*bs+6,'#ffff55',b2);canvasesState.ctx.globalAlpha=1}
  if(sessionState.paused){canvasesState.ctx.fillStyle='rgba(0,0,0,.35)';canvasesState.ctx.fillRect(0,0,UW,UH);TC('Game Paused',UW/2,UH*.36,'#ffffff',2.2);TC(backgroundLoopState.autoPaused?'Click anywhere or press Space to resume':'Press Space to resume',UW/2,UH*.36+28,'#a0a0a0',.95)}}
 const hv=hudState.uiHits.find(h=>h.tip&&inR(inputState.mouse,h));
 if(hv&&!sessionState.over&&!sessionState.showMap){const ln=hv.tip,cpp=hv.cost?costParts(hv.cost):null,cw0=cpp?cpp.reduce((q,p)=>q+tw(p[0],.9)+12,0):0,w=Math.max(cw0,...ln.map(s=>tw(s,.9)))+14,h=ln.length*11+8;let tx=Math.min(UW-w-2,Math.max(2,Math.round(hv.x/hudDisplayState.UIS))),ty=Math.round(hv.y/hudDisplayState.UIS)-h-4;if(ty<26)ty=Math.round((hv.y+hv.h)/hudDisplayState.UIS)+4;
  frame(tx,ty,w,h,TIPP,5);ln.forEach((s,i)=>{if(cpp&&i===ln.length-1){drawCost(cpp,tx+7,ty+5+i*11,w-14,.9,9)}else T_(s,tx+7,ty+5+i*11,i?'#aaaaaa':'#ffffff',.9)})}
 drawToasts(UW);
 if(sessionState.showMap)drawMapModal(UW,UH);
 if(sessionState.over)drawEnd(UW,UH);
 canvasesState.ctx.setTransform(1,0,0,1,0,0)}

export function drawBars(){canvasesState.ctx.setTransform(1,0,0,1,0,0);const k=Math.max(1,inputState.DPR);let drew=0;
 const bar2=(x,y,w,f,c)=>{drew=1;canvasesState.ctx.fillStyle='#000';canvasesState.ctx.fillRect(Math.round(x-w/2-1),Math.round(y-1),w+2,3*k+1);canvasesState.ctx.fillStyle=c;canvasesState.ctx.fillRect(Math.round(x-w/2),Math.round(y),Math.max(1,Math.round(w*Math.max(0,Math.min(1,f)))),2*k)};
 for(const u of sessionState.units){const m=T[u.type].hp;if(u.hp>=m||u.hp<=0||u.shel)continue;const md=u.m&&u.m.userData.mdl,q=scr(u.x/TS,(u.dy||0)+(md?md.h*(md.sc||1.35)*UNITK:.8)+.1,u.y/TS);if(q.ok)bar2(q.x,q.y,(u.type==='brute'?26:16)*k,u.hp/m,u.t===1?'#c66bff':u.t===2?'#e8c040':'#6fdc6f')}
 {let n0=0;for(const u of sessionState.units)if(u.shel)n0++;if(n0)for(const c of aliveC()){let n=0;for(const u of sessionState.units)if(u.shel===c)n++;if(!n)continue;const q=scr(c.x/TS,(c.bh||LAND)+(c.tier!==0?6.7:5.7),c.y/TS);
  if(q.ok){drew=1;canvasesState.ctx.font=Math.round(9*k*1.75)+'px '+FF;canvasesState.ctx.textAlign='center';const t=L(n+' inside');canvasesState.ctx.fillStyle='rgba(0,0,0,.65)';canvasesState.ctx.fillText(t,q.x+1,q.y+1);canvasesState.ctx.fillStyle='#ffe08a';canvasesState.ctx.fillText(t,q.x,q.y)}}}
 if(!simulationState.shelOn)for(const s of sessionState.structs){if(s.t!==0||s.prog<1||s.hp<=0||!WKT.has(s.type)||(MP.on&&(s.pl|0)!==LPL())||wkOf(s))continue;const q=scr(s.x/TS,(s.bh||LAND)+1.4,s.y/TS);
  if(q.ok){drew=1;canvasesState.ctx.font=Math.round(8*k*1.75)+'px '+FF;canvasesState.ctx.textAlign='center';canvasesState.ctx.fillStyle='rgba(0,0,0,.65)';canvasesState.ctx.fillText(L('no worker'),q.x+1,q.y+1);canvasesState.ctx.fillStyle='#ffb070';canvasesState.ctx.fillText(L('no worker'),q.x,q.y)}}
 for(const s of sessionState.structs){if(s.garr&&s.garr.length){const q=scr(s.x/TS,(s.bh||LAND)+(s.type==='tower'?4.9:2.7),s.y/TS);if(q.ok){drew=1;canvasesState.ctx.font=Math.round(9*k*1.75)+'px '+FF;canvasesState.ctx.textAlign='center';canvasesState.ctx.fillStyle='rgba(0,0,0,.65)';canvasesState.ctx.fillText(s.garr.length+'/'+GCAP[s.type],q.x+1,q.y+1);canvasesState.ctx.fillStyle='#9fe870';canvasesState.ctx.fillText(s.garr.length+'/'+GCAP[s.type],q.x,q.y)}}
  if(s.hp>=s.max&&s.prog>=1)continue;const q=scr(s.x/TS,(s.bh||LAND)+(({tower:4.9,wall:2.2,gate:2.6,ballista:1.6,trebuchet:3.6,house:3.3,barracks:3.2,storage:2.5,academy:3.6,market:2.7,forester:2.4,guild:3.2,torch:1.9,farm:1.0,keep:5.2,castle:s.tier!==0?6.2:5.2})[s.type]||6.7),s.y/TS);if(!q.ok)continue;
  if(s.prog<1)bar2(q.x,q.y,(s.sz>=3?44+(s.sz-3)*10:24)*k,s.prog,'#ffd23c');else bar2(q.x,q.y,(s.sz>=3?44+(s.sz-3)*10:24)*k,s.hp/s.max,'#6fdc6f')}return drew}
