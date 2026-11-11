import { AC, sndOn, toggleSound } from '../audio/sound.js';
import { inputState } from '../input/state.js';
import { GNOTES } from '../core/version.js';
import { GVER } from '../core/version.js';
import { quitGame, startGame } from '../gameplay/lifecycle.js';
import { sessionState } from '../gameplay/session.js';
import { BOSSN } from '../ai/wave-boss.js';
import { drawFlag, drawLang, L, LANG, LANGS, languageState, T_, TC, tw } from '../i18n/language.js';
import { MP } from '../multiplayer/session.js';
import { bannerPattern, drawEmblemR, EMB, gemSwatch, saveTheme, shieldTile } from '../rendering/kingdom-banner.js';
import { bannerIcon } from '../rendering/banner-icon.js';
import { retheme } from '../rendering/structures.js';
import { TFADE } from '../rendering/title-scene.js';
import { SEAS, SEASC } from '../rendering/weather.js';
import { uiBtn } from './build-menu.js';
import { canvasesState } from './canvases.js';
import { BTN, BTNH, focusRing, gold, menuSkin } from './drawing.js';
import { hudState, inR, U } from './hud.js';
import { NAV, navAdd, navBegin, navEnd, navPoll } from './menu-nav.js';
import { dIc, IC } from './icons.js';
import { KNAMES, PAL, THEME } from './kingdom-theme.js';
import { continueLast, drawSaves, saveMenuState, svPeek } from './save-menu.js';
import { drawSettings, nmI, settingsBack, settingsState } from './settings.js';
import { openPicker } from './site-picker.js';
import { drawTitleWeather, lastRun, titleSeasonColor, titleWeatherLabel } from './title-weather.js';
import { FFT } from './typography.js';
import { curMode, drawModes, modeIcon, modeState, openModes, playMode } from './mode-select.js';
import { footH, menuFooter } from './menu-footer.js';
import { fireGlow, fxTitleSeen } from './menu-fx.js';
import { bevelBtn, KC, kitCard, kitEnd, kitRow, kitScreen, listBegin, listEnd, newPill, pxText, pxW } from './menu-kit.js';
import { hexBadge, tipBanner, titleBlur, titleEmbers, titleLogo, titleLogoW, titleVignette } from './title-frame.js';

let TT0 = -1;
let scrKey = 'main';
let notesOpen = false;
let chrOpen = false;
let recOpen = false;
export const titleDebug = { rec(v) { recOpen = v }, notes(v) { notesOpen = v }, chr(v) { chrOpen = v }, modes(v) { modeState.open = v } };

/* tip of the day: one of the tutorial lines, changing each day */
const TIPS = ['Right-click a tree, a rock or gold: your peasants gather it', 'Build a house in the Town menu to raise your population limit', 'Train a knight in the Train bar: knights fight the zombies', 'Build walls or a tower in the Defense menu to hold the lanes', 'Try a spike trap in the Defense menu: zombies on it get hurt', 'Zombies follow the red lines: the top bar counts down to the wave', 'Research Stonemasonry in the castle menu to build in stone'];
const TIPN = (Date.now() / 864e5 | 0) % TIPS.length;

/* "What's new" keeps its NEW pill until the notes of this version were opened once (localStorage dk_seenver; visual only) */
let seenVer;
const notesNew = () => { if (seenVer === undefined) { try { seenVer = localStorage.getItem('dk_seenver') } catch (e) { seenVer = null } } return !!GNOTES && seenVer !== GVER };
const openNotes = () => { notesOpen = true; seenVer = GVER; try { localStorage.setItem('dk_seenver', GVER) } catch (e) { } };

function titleBack(UW,UH){const g=canvasesState.ctx,gr=g.createLinearGradient(0,0,0,UH);gr.addColorStop(0,'rgba(5,8,18,.5)');gr.addColorStop(.3,'rgba(5,8,18,.1)');gr.addColorStop(.6,'rgba(5,8,18,.14)');gr.addColorStop(1,'rgba(5,8,18,.72)');g.fillStyle=gr;g.fillRect(0,0,UW,UH);
 titleVignette(UW,UH)}

/* every menu screen is drawn with the menu skin (night-blue plates for the few old-style buttons left) and ends with the key-hint footer */
export function drawTitle(UW,UH){menuSkin(true);try{drawTitleScreen(UW,UH)}finally{kitEnd();menuSkin(false)}}

function drawTitleScreen(UW,UH){if(!sessionState.inGame)fxTitleSeen();settingsState.nameBox=null;hudState.uiHits=[];hudState.uiRects=[U(0,0,UW,UH)];
 const ig=sessionState.inGame,cx=UW/2,fh=footH(UH),g=canvasesState.ctx;
 const sub=settingsState.settingsOpen||saveMenuState.saveOpen||languageState.langOpen||settingsState.setupOpen||modeState.open||notesOpen||chrOpen||recOpen;
 titleBlur(!ig&&!sub);
 if(!ig&&TFADE>.003&&!window.__cam){g.fillStyle='rgba(4,3,8,'+(TFADE*.92).toFixed(3)+')';g.fillRect(0,0,UW,UH)}
 if(TT0<0)TT0=performance.now();
 {const sk=settingsState.settingsOpen?'set':saveMenuState.saveOpen?'sav':languageState.langOpen?'lng':settingsState.setupOpen?'new':modeState.open?'mod':notesOpen?'not':chrOpen?'chr':recOpen?'rec':'main';if(sk!==scrKey){scrKey=sk;NAV.sel=-1}}
 const FT=(back,sel)=>menuFooter(UW,UH,sel?[['Esc','Back',back],['Enter','Select']]:[['Esc','Back',back]]);
 /* list screens: rows take the keyboard / pad focus, the first Enter only shows it */
 const LS=(back,draw,sel)=>{NAV.onEsc=back;navBegin(true);NAV.first=false;navPoll();draw(UW,UH,fh,back);kitEnd();FT(back,sel!==0);navEnd()};
 if(settingsState.settingsOpen){NAV.onEsc=null;navBegin(!settingsState.rebind);NAV.first=false;navPoll();drawSettings(UW,UH,fh,settingsBack);kitEnd();FT(settingsBack,1);navEnd();return}
 if(saveMenuState.saveOpen){LS(()=>{saveMenuState.saveOpen=false},drawSaves);return}
 if(languageState.langOpen){LS(()=>{languageState.langOpen=false},drawLang);return}
 if(settingsState.setupOpen){const b=()=>{settingsState.setupOpen=false};NAV.onEsc=null;navBegin(true);navPoll();drawSetup(UW,UH,fh,b);kitEnd();FT(b,1);navEnd();return}
 if(modeState.open){drawModes(UW,UH,cx,()=>{modeState.open=false});navEnd();return}
 if(notesOpen){LS(()=>{notesOpen=false},drawNotes,0);return}
 if(chrOpen){LS(()=>{chrOpen=false},drawChronicle,0);return}
 if(recOpen){LS(()=>{recOpen=false},drawRecords,0);return}
 if(ig){drawGameMenu(UW,UH,fh);return}
 NAV.onEsc=null;navBegin(true);navPoll();
 titleBack(UW,UH);drawTitleWeather(UW,UH);fireGlow(UW,UH);
 drawLobby(UW,UH);
 navEnd();g.globalAlpha=1}

/* ================= the lobby (title screen): tip banner on top, logo and counters on the left, season card on the right,
   the big Play button under the current-mode band at the bottom left, compact key buttons at the bottom right ================= */
function drawLobby(UW,UH){const g=canvasesState.ctx,nar=UW<480,low=UH<300,m=nar?6:12,T=(performance.now()-TT0)/1000,
  ent=(a,b)=>{const v=Math.max(0,Math.min(1,(T-a)/(b-a)));return v*v*(3-2*v)};
 titleEmbers(UW,UH);
 if(saveMenuState.last===undefined){saveMenuState.last=null;svPeek()}
 /* --- top: tip of the day --- */
 g.globalAlpha=ent(.5,1.1);tipBanner(UW,nar?4:6,m,TIPS[TIPN],T_,tw);
 /* --- logo, splash line --- */
 const lh=nar?Math.min(34,UH*.08):low?26:40,lmax=nar?UW-2*m-16:Math.min(UW*.42,270),lw=titleLogoW('NARANXIA',lmax,lh),lx=nar?Math.round(UW/2-lw/2):m+8,ly=nar?26:30;
 g.globalAlpha=ent(.05,.6);titleLogo('NARANXIA',lx+lw/2,ly+lh/2,lmax,lh);
 let y=ly+lh+(low?3:6);
 {const sp=L(MCSPL[Math.floor(sessionState.clockT/7)%MCSPL.length]),a=.7+.3*Math.sin(sessionState.clockT*2.3),S=nar?11:13;g.save();g.textAlign=nar?'center':'left';g.textBaseline='top';g.font='600 '+S+'px '+FFT;const sx=nar?UW/2:lx+2;
  g.fillStyle='rgba(4,3,8,.75)';g.fillText(sp,sx+1,y+1.5);g.shadowColor='rgba(60,190,255,'+(.85*a).toFixed(3)+')';g.shadowBlur=6;g.fillStyle='#c8f3ff';g.fillText(sp,sx,y);g.restore();y+=S+(low?5:9)}
 /* --- counters with hexagon icons (wide screens) --- */
 g.globalAlpha=ent(.3,.9);
 const best=sessionState.best,run=lastRun();
 if(!nar&&!low&&best&&best.w>0){let x=lx+2;const cnt=(ic,val,lab)=>{hexBadge(x+10,y+11,10,ic);const w1=pxText(val,x+25,y+7,13,'#ffe39a',{raw:true}),w2=tw(lab,.72);T_(lab,x+25,y+14,'#b8c4d8',.72);x+=25+Math.max(w1,w2)+14};
  cnt('crown',String(best.w),'Best wave');cnt('skull',String(best.k),'Zombies slain');if(run)cnt('glass',String(run.w),'Last game')}
 /* --- season card: version, season of the last game, What's new / Records / Chronicle --- */
 const items=[['Leaderboard',()=>{recOpen=true}],['Chronicle',()=>{chrOpen=true}]];if(GNOTES)items.unshift(['Update',openNotes,notesNew()]);
 const cw=nar?UW-2*m:Math.min(184,UW*.3),cx0=nar?m:UW-m-cw,cy0=nar?y+2:30,rh=nar||low?16:18,lbR=11;let ch=31+items.length*(rh+2)+5,lbN=0,lbRuns=[];
 /* --- bottom left: Continue, mode band, Play --- */
 const pw=nar?UW-2*m:Math.min(214,Math.max(170,UW*.33)),px=nar?m:m+6,ph=low?30:nar?34:40,
  key=[['Load game','l',()=>{saveMenuState.saveOpen=true;saveMenuState.svList=null}],['Tutorial','t',()=>{try{localStorage.removeItem('dk_tut')}catch(e){}settingsState.setupOpen=true}],['Options','o',()=>{settingsState.settingsOpen=true}],[sndOn?'Sound: on':'Sound: off','',()=>{toggleSound()}],['','',()=>{languageState.langOpen=true},1]];
 if(window.NARX&&NARX.desktop)key.push(['Exit to desktop','',()=>window.close()]);
 /* compact buttons: measured, then flowed in rows (right-aligned on wide screens, two columns on narrow ones) */
 const kh=low?18:20,kg=4,avail=nar?UW-2*m:UW-m-6-(px+pw+14),kw=key.map(k=>k[3]?Math.ceil(tw(LANGS[LANG][0],.85))+36:Math.ceil(pxW(k[0],10))+18+(k[1]&&!inputState.touch?20:0)),rows=[];
 if(nar){const hw=Math.floor((avail-kg)/2);for(let i=0;i<key.length;i+=2)rows.push(key.slice(i,i+2).map((k,j,a)=>[k,a.length===1?avail:j?avail-hw-kg:hw]))}
 else{let cur=[],wsum=0;key.forEach((k,i)=>{if(cur.length&&wsum+kw[i]>avail){rows.push(cur);cur=[];wsum=0}cur.push([k,kw[i]]);wsum+=kw[i]+kg});if(cur.length)rows.push(cur)}
 const kTop=UH-m-(nar?2:4)-rows.length*(kh+kg)+kg,py=nar?kTop-8-ph:UH-m-4-ph,by=py-21,cy1=by-28;
 if(!nar){const ch2=ch-(rh+2),room=kTop-8-(cy0+ch2+6)-(rh+15);lbN=Math.min(10,Math.floor(room/lbR));if(lbN>=3){ch=ch2;lbRuns=topRuns().slice(0,lbN)}else lbN=0}
 g.globalAlpha=ent(.35,1);
 NAV.keys={};
 if(saveMenuState.last){const s=saveMenuState.last,wv=/^Wave (\d+)/.exec(String(s.name));bevelBtn(px,cy1,pw,23,'Continue','gold',continueLast,{sub:wv?L('Wave '+wv[1]):null})}
 {/* mode band: current mode | Change */
  const md=curMode(),k=navAdd(openModes,inR(inputState.mouse,U(px,by,pw,17))),on=NAV.sel===k;
  g.fillStyle='rgba(0,0,0,.4)';g.fillRect(px+1,by+2,pw,17);g.fillStyle=on?'rgba(30,36,54,.95)':'rgba(10,12,20,.88)';g.fillRect(px,by,pw,17);g.fillStyle='rgba(184,149,76,.8)';g.fillRect(px,by,pw,1);g.fillRect(px,by+16,pw,1);g.fillRect(px,by,1,17);g.fillRect(px+pw-1,by,1,17);
  const chw=Math.min(pw*.45,Math.ceil(pxW('Change',9,500))+18);g.fillStyle='rgba(184,149,76,.5)';g.fillRect(px+pw-chw-1,by+3,1,11);
  modeIcon(md.id,px+11,by+8.5,.8);pxText(md.name,px+22,by+9,10,'#ffe39a',{max:pw-chw-28});pxText('Change',px+pw-chw/2,by+9,9,on?'#ffffff':'#b8c4d8',{al:'center',max:chw-6,wt:500});
  if(on)focusRing(px,by,pw,17);hudState.uiHits.push({...U(px,by,pw,17),fn:openModes,tip:null})}
 bevelBtn(px,py,pw,ph,'Play','go',playMode,{sc:1.05});
 /* --- bottom right: compact buttons with key chips --- */
 g.globalAlpha=ent(.5,1.15);
 let kLeft=UW;
 rows.forEach((r,ri)=>{const yy=kTop+ri*(kh+kg),tot=r.reduce((a,e)=>a+e[1]+kg,-kg);let x=nar?m:UW-m-6-tot;if(ri===rows.length-1)kLeft=x;
  for(const[k,w]of r){if(k[3])bevelBtn(x,yy,w,kh,LANGS[LANG][0],'dark',k[2],{raw:true,sc:.9,al:'left',icw:1.4,ic:(X,Y,S)=>drawFlag(LANGS[LANG][1],X,Y+1,S*1.4,S-2)});else bevelBtn(x,yy,w,kh,k[0],'dark',k[2],{sc:.95,key:k[1]?k[1].toUpperCase():null,al:k[1]?'left':null});if(k[1])NAV.keys[k[1]]=k[2];x+=w+kg}});
 /* --- season card --- */
 g.globalAlpha=ent(.3,.9);
 if(!nar||cy0+ch<(saveMenuState.last?cy1:by)-6){kitCard(cx0,cy0,cw,ch);
  const si=run?((run.w/4)|0)%4:0,wl=run?titleWeatherLabel():L(SEAS[0]),prog=run?((run.w%4)+1)/4:0;
  pxText(GVER,cx0+8,cy0+9,9,KC.gold,{raw:true});T_(wl,cx0+cw-8-tw(wl,.78),cy0+5,run?titleSeasonColor():SEASC[0],.78);
  g.fillStyle='#0c0d12';g.fillRect(cx0+8,cy0+18,cw-16,5);g.fillStyle=SEASC[si];g.fillRect(cx0+8,cy0+18,Math.round((cw-16)*prog),5);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(cx0+8,cy0+18,Math.round((cw-16)*prog),1);
  for(let i=1;i<4;i++){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(cx0+8+Math.round((cw-16)*i/4),cy0+18,1,5)}
  let ry=cy0+29;for(const it of items){if(lbN&&it[0]==='Leaderboard')continue;kitRow(cx0+5,ry,cw-10,rh,{label:it[0],fn:it[1],sc:.82,right:it[2]?(rx,yy,hh)=>newPill(rx,yy+hh/2,true)+2:null});ry+=rh+2}
  if(lbN){/* leaderboard card: title row (opens the full screen) and a preview of the top 10 */
   const ly=cy0+ch+6,lh=rh+10+Math.max(1,lbRuns.length)*lbR+5,open=()=>{recOpen=true};kitCard(cx0,ly,cw,lh);kitRow(cx0+5,ly+4,cw-10,rh,{label:'Leaderboard',fn:open,sc:.82});
   g.fillStyle='rgba(184,149,76,.35)';g.fillRect(cx0+8,ly+rh+6,cw-16,1);let yy=ly+rh+10+lbR/2;
   if(!lbRuns.length)T_('No record yet',cx0+9,yy-5,'#c4a37a',.72);
   lbRuns.forEach((e,i)=>{const c=i?'#b8c4d8':'#ffe39a',rw=pxText('#'+(i+1),cx0+9,yy,8,i?'#8f96a6':'#e9b93c',{raw:true}),ww=pxText('Wave '+e.w,cx0+30,yy,8,c);void rw;
    pxText(e.n||(e.k+''),cx0+cw-9,yy,8,i?'#c4a37a':'#e9b93c',{raw:true,al:'right',max:cw-48-ww});yy+=lbR});
   hudState.uiHits.push({...U(cx0,ly+rh+6,cw,lh-rh-6),fn:open,tip:null})}}
 else{/* very small screens: the three links as one row of compact buttons */
  const n=items.length,w1=Math.floor((cw-kg*(n-1))/n);items.forEach((it,i)=>bevelBtn(cx0+i*(w1+kg),cy0,w1,16,it[0],'dark',it[1],{sc:.9}))}
 /* --- hints --- */
 g.globalAlpha=ent(.8,1.4);
 const ms=AC&&AC.state==='running'&&sndOn?'':(sndOn?'Press any key or click for the music':'Sound is off');
 if(ms&&!nar){const w=tw(ms,.72);if(w<avail)T_(ms,UW-m-6-w,kTop-13,'#aab0bd',.72)}
 if(!nar&&!inputState.touch&&NAV.active&&kLeft-(px+pw)>190)menuFooter(UW,UH,[['^v','Move'],['Enter','Select']],{cy:UH-m-4-kh/2,cx:(px+pw+kLeft)/2,band:false});
 g.globalAlpha=1}

/* ================= in-game menu (Esc): same template, the game stays visible behind a dark veil ================= */
function drawGameMenu(UW,UH,fh){NAV.onEsc=startGame;navBegin(!MP.on);NAV.first=false;navPoll();
 const b=kitScreen(UW,UH,{key:'gm',title:'Game Menu',close:startGame,fh,maxW:420,veil:'rgba(9,10,15,.88)'}),l=listBegin('gm',b.x,b.y+1,b.w,b.h-14);
 l.section('Game');
 l.row({label:'Back to Game',fn:startGame},22);
 if(!MP.on)l.row({label:'Save / Load',fn:()=>{saveMenuState.saveOpen=true;saveMenuState.svList=null}},22);
 l.row({label:'Options',fn:()=>{settingsState.settingsOpen=true}},22);
 l.section('Sound');
 l.row({label:'Sound',opts:[['On',sndOn,()=>{if(!sndOn)toggleSound()}],['Off',!sndOn,()=>{if(sndOn)toggleSound()}]],fn:()=>{toggleSound()}},22);
 l.section('Session');
 l.row({label:'Quit to title',danger:1,fn:quitGame},22);
 listEnd();
 const ms=AC&&AC.state==='running'&&sndOn?'':(sndOn?'Press any key or click for the music':'Sound is off');
 if(ms)T_(ms,b.x+1,b.y+b.h-9,'#948e80',.75);
 kitEnd();
 menuFooter(UW,UH,NAV.active?[['^v','Move'],['Enter','Select'],['Esc','Back to Game',startGame]]:[['Esc','Back to Game',startGame]]);
 navEnd()}

/* ================= Records ================= */
/* the ten best games stored on this device (dk_sb), best score first */
let TOPR=null,TOPS=null;
function topRuns(){let raw='';try{raw=localStorage.getItem('dk_sb')||''}catch(e){}if(TOPR&&raw===TOPS)return TOPR;const runs=[];try{const all=JSON.parse(raw||'{}');for(const k in all)for(const e of all[k])if(e&&e.w>=0)runs.push(e)}catch(e){}
 runs.sort((a,b2)=>b2.s-a.s);TOPS=raw;return TOPR=runs.slice(0,10)}
function drawRecords(UW,UH,fh,back){const b=kitScreen(UW,UH,{key:'rec',title:'Leaderboard',close:back,fh,maxW:460}),l=listBegin('rec',b.x,b.y,b.w,b.h),bs=sessionState.best,r=lastRun();
 const runs=topRuns();
 if(!(bs&&bs.w>0)&&!r&&!runs.length){l.gap(6);l.para('No record yet','#c4a37a',.9)}
 if(runs.length){l.section('Top 10 kingdoms');runs.forEach((e,i)=>l.row({label:'Wave '+e.w+'   '+e.k+' kills',value:e.n||'',vcol:i?'#c4a37a':'#e9b93c',vsc:.8,tag:['#'+(i+1),i?'#8f96a6':'#e9b93c'],block:1},18))}
 if(r){l.section('Last game');l.row({label:'Last game: wave '+r.w+'  -  '+r.k+' zombies slain',value:titleWeatherLabel(),vcol:titleSeasonColor(),vsc:.78,ic:(x,y,s)=>hexBadge(x+s/2,y+s/2,s/2-1,'glass'),block:1},22)}
 listEnd()}

/* ================= What's new ================= */
function drawNotes(UW,UH,fh,back){const b=kitScreen(UW,UH,{key:'not',title:'Update',close:back,fh,maxW:500}),l=listBegin('not',b.x,b.y,b.w,b.h);
 const items=String(GNOTES||'').split('\n').map(s=>s.replace(/^\s*[-*]\s*/,'').trim()).filter(Boolean);
 l.section(GVER);for(const it of items)l.para(it,'#ead8ba',.88,true);
 listEnd()}

const CHRON=['Long ago the old world fell to the horde. Naranxia is all that remains: the last bastion of humanity.','King Naraige keeps its walls and its last light. Every night the horde comes back, and every dawn the sun burns it away.','Around the bastion, other camps survive. They refused the King\'s rule: rebels, and neighbours. Some trade, some raid.','Hold the walls, feed your people, and learn what the camps want. The night is long, but dawn always comes.'];

const CHFR=[[5,'Wave 5: The first rebel scouts are seen on the hills. They watch the walls, and they do not wave.'],[10,'Wave 10: A giant walks with the horde. The old records call such things Wardens, the fallen leaders of the old world.'],[10,'The Hollow Warden: He held the old gates until the horde walked through them. Death did not teach him to stop guarding. It taught him to stop choosing who to let in.'],[15,'Wave 15: The wolves come down from the hills. Even the wild has chosen a side, and it is not yours.'],[20,'Wave 20: A rebel envoy leaves a message at the gate: the camps know the King\'s light cannot burn forever.'],[20,'The Bell-Bearer: He rang the last bell of the old world, and the dead came to listen. Now he rings it again, and the husks come when he calls.'],[25,'Wave 25: Under the old ruins the survivors left vaults. The King sends scouts to find them before the horde does.'],[30,'Wave 30: Only the bastion still stands. If dawn comes again, Naranxia will be more than a refuge.'],[30,'The Frost King: He ruled the northern snows and refused every messenger from the south. The winter took him, and he took the winter with him.'],[40,'The Hive Queen: She promised her people they would never be hungry. She kept the promise: the brood that follows her eats whatever she points at.'],[40,'Wave 40: The eclipse has come and gone. The rebels no longer hide their fires; they watch the bastion as one watches a lighthouse.'],[50,'Wave 50: Fifty waves. In the rebel camps they say the King does not hold the walls: the walls hold the King. Both are true.']];

/* ================= Chronicle: the story, the fragments unlocked by the best wave, the journal of the realm ================= */
function drawChronicle(UW,UH,fh,back){const b=kitScreen(UW,UH,{key:'chr',title:'Chronicle',close:back,fh,maxW:500}),l=listBegin('chr',b.x,b.y,b.w,b.h),bw=(sessionState.best&&sessionState.best.w)|0;
 l.section('The last bastion');for(const t of CHRON)l.para(t,'#ead8ba',.9);
 const fr=CHFR.filter(f=>bw>=f[0]);
 if(fr.length){l.section('Fragments');for(const f of fr)l.para(f[1],'#d9cfb8',.88,true)}
 if(CHFR.some(f=>bw<f[0]))l.para('Reach a higher wave to read more.',KC.dim,.82);
 const jr=sessionState.jrn;if(Array.isArray(jr)&&jr.length){l.section('Journal of the realm');for(const e of jr.slice(-12))l.para(e[1]?'Wave '+(e[0]|0)+': '+BOSSN[e[2]|0]+' has fallen. The bastion holds.':'Wave '+(e[0]|0)+': '+BOSSN[e[2]|0]+' walks with the horde.','#d9cfb8',.88,true)}
 listEnd()}

const MCSPL=['Survive the night!','Also try Co-op!','Hold the line!','100% blocky!','Mind the swarm!','Build towers!','Zombies hate walls!','Protect the castle!','Now with keeps!','Gold! Wood! Stone!','100x the swarm!','Ten thousand zombies!','Red eyes in the dark!','The last bastion of humanity','Rebel camps watch from afar','Hold the last light'];

/* ================= New kingdom ================= */
function drawSetup(UW,UH,fh,back){const b=kitScreen(UW,UH,{key:'new',title:'New kingdom',close:back,fh,maxW:440}),small=b.h<190,pw=b.w,cx=b.x+pw/2;let y=b.y+2;
 const eh=small?86:138;kitCard(b.x,y,pw,eh);const bnx=b.x+10,bnh=eh-14,bnw=bnh*2/3;canvasesState.ctx.imageSmoothingEnabled=true;canvasesState.ctx.drawImage(bannerIcon(1),bnx,y+7,bnw,bnh);
 const ex=bnx+bnw+10,ew=b.x+pw-10-ex;T_('Your kingdom',ex,y+5,'#c4a37a',.8);
 const fy=y+15;settingsState.nameBox={x:ex,y:fy,w:ew-24,h:15};uiBtn(ex+ew-22,fy,22,15,BTN,BTNH,()=>{THEME.n=KNAMES[(Math.random()*KNAMES.length)|0];nmI.value=THEME.n;saveTheme()},['Random name'],(x,yy,w)=>dIc(IC.dice,x+4,yy+1.5,12));
 const LW=small?0:58,rx=ex+LW,rw=ew-LW,row=(lab,n,yy,sz,draw,sel,pick,tip)=>{if(LW)T_(lab,ex,yy+(sz-9*.72)/2,'#c4a37a',.72);const per=Math.max(1,Math.floor((rw+2.5)/(sz+2.5)));for(let i=0;i<n;i++){const sx2=rx+(i%per)*(sz+2.5),sy=yy+((i/per)|0)*(sz+3);draw(sx2,sy,sz,i);if(i===sel)gold(sx2-1,sy-1,sz+2,sz+2,4);hudState.uiHits.push({...U(sx2,sy,sz,sz),fn:()=>{pick(i);saveTheme();retheme()},tip:tip(i)})}return Math.ceil(n/per)*(sz+3)};
 let ry=fy+20;const sw=Math.max(8,Math.min(15,(rw+2.5)/PAL.length-2.5));
 ry+=row('Colour',PAL.length,ry,sw,(x,yy,sz,i)=>gemSwatch(x,yy,sz,PAL[i][1]),THEME.c,i=>{THEME.c=i},i=>[PAL[i][0]+' colours']);
 if(!small)ry+=row('2nd colour',PAL.length,ry,sw,(x,yy,sz,i)=>{gemSwatch(x,yy,sz,PAL[i][1]);canvasesState.ctx.save();canvasesState.ctx.beginPath();canvasesState.ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);canvasesState.ctx.clip();canvasesState.ctx.fillStyle=PAL[THEME.c][1];canvasesState.ctx.fillRect(x,yy,sz/2,sz);canvasesState.ctx.restore();canvasesState.ctx.beginPath();canvasesState.ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);canvasesState.ctx.lineWidth=.9;canvasesState.ctx.strokeStyle='#c99a3a';canvasesState.ctx.stroke()},THEME.c2,i=>{THEME.c2=i},i=>['Pattern colour: '+PAL[i][0]]);
 if(!small)ry+=row('Pattern',8,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>{canvasesState.ctx.translate(X,Y);bannerPattern(canvasesState.ctx,W,H,i,PAL[THEME.c2][1])}),THEME.p|0,i=>{THEME.p=i},i=>[['Plain','Per pale','Chevron','Bend','Quarterly','Fess','Bordure','Saltire'][i]]);
 ry+=row('Emblem',EMB.length,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>drawEmblemR(X+W*.14,Y+H*.1,W*.72,i)),THEME.e,i=>{THEME.e=i},()=>['Emblem']);
 y+=eh+8;
 {const s='Long calm between waves, then a slow swarm. It grows stronger each wave.';let sc=.85;while(sc>.64&&tw(s,sc)>pw)sc-=.03;if(tw(s,sc)<=pw){TC(s,cx,y+2,'#c4a37a',sc);y+=18}else{const q=s.split('. ');TC(q[0]+'.',cx,y,'#c4a37a',.8);TC(q[1],cx,y+11,'#c4a37a',.8);y+=26}}
 const bh=small?22:28,byy=Math.min(b.y+b.h-bh-2,y+4),bw1=Math.round(pw*.3),bw2=pw-bw1-8;
 bevelBtn(b.x+bw1+8,byy,bw2,bh,'Choose site','go',openPicker,{sc:.95});bevelBtn(b.x,byy,bw1,bh,'Back','dark',back,{sc:.85})}
