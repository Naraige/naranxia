import { AC, sndOn, toggleSound } from '../audio/sound.js';
import { inputState } from '../input/state.js';
import { GNOTES } from '../core/version.js';
import { GVER } from '../core/version.js';
import { bugReport } from '../debug/tools.js';
import { newGame, quitGame, startGame } from '../gameplay/lifecycle.js';
import { sessionState } from '../gameplay/session.js';
import { drawLang, L, LANG, langBtn, LANGS, languageState, T_, TC, TTL, tw } from '../i18n/language.js';
import { mpOpen, mpOpenJoin } from '../multiplayer/lobby.js';
import { MP } from '../multiplayer/session.js';
import { bannerPattern, drawEmblemR, EMB, gemSwatch, saveTheme, shieldTile } from '../rendering/kingdom-banner.js';
import { BANNER, retheme } from '../rendering/structures.js';
import { TFADE } from '../rendering/title-scene.js';
import { uiBtn } from './build-menu.js';
import { canvasesState } from './canvases.js';
import { arcDia, BTN, BTNH, dirtBack, frame, gold, GRN, GRNH, PAN, rr } from './drawing.js';
import { hudState, inR, U } from './hud.js';
import { NAV, navAdd, navBegin, navEnd, navPoll, padOn } from './menu-nav.js';
import { dIc, IC } from './icons.js';
import { KNAMES, PAL, THEME } from './kingdom-theme.js';
import { pill } from './minimap.js';
import { continueLast, drawSaves, saveMenuState, svPeek } from './save-menu.js';
import { drawSettings, nmI, settingsState } from './settings.js';
import { openPicker } from './site-picker.js';
import { tutStart } from './tutorial.js';
import { drawTitleWeather, lastRun, titleSeasonColor, titleWeatherLabel } from './title-weather.js';
import { FFT } from './typography.js';

function menuCx(UW,pw){return UW/2}

let TT0 = -1;
let notesOpen = false;
let recOpen = false;
export const titleDebug = { rec(v) { recOpen = v }, notes(v) { notesOpen = v } };

/* tip of the day: one of the tutorial lines, changing each day */
const TIPS = ['Right-click a tree, a rock or gold: your peasants gather it', 'Build a house in the Town menu to raise your population limit', 'Train a knight in the Train bar: knights fight the zombies', 'Build walls or a tower in the Defense menu to hold the lanes', 'Try a spike trap in the Defense menu: zombies on it get hurt', 'Zombies follow the red lines: the top bar counts down to the wave', 'Research Stonemasonry in the castle menu to build in stone'];
const TIPN = (Date.now() / 864e5 | 0) % TIPS.length;


function titleBack(UW,UH,cx,pw){const g=canvasesState.ctx.createLinearGradient(0,0,0,UH);g.addColorStop(0,'rgba(255,255,255,.2)');g.addColorStop(.55,'rgba(255,255,255,.3)');g.addColorStop(1,'rgba(240,245,251,.66)');canvasesState.ctx.fillStyle=g;canvasesState.ctx.fillRect(0,0,UW,UH);
 {const rg=canvasesState.ctx.createRadialGradient(cx,UH*.4,20,cx,UH*.4,Math.max(UW,UH)*.55);rg.addColorStop(0,'rgba(255,255,255,.5)');rg.addColorStop(1,'rgba(255,255,255,0)');canvasesState.ctx.fillStyle=rg;canvasesState.ctx.fillRect(0,0,UW,UH)}}

export function drawTitle(UW,UH){settingsState.nameBox=null;hudState.uiHits=[];hudState.uiRects=[U(0,0,UW,UH)];const pw=Math.min(300,UW-16),cx=menuCx(UW,pw),small=UH<330;if(!sessionState.inGame&&TFADE>.003&&!window.__cam){canvasesState.ctx.fillStyle='rgba(255,255,255,'+(TFADE*.92).toFixed(3)+')';canvasesState.ctx.fillRect(0,0,UW,UH)}if(TT0<0)TT0=sessionState.clockT;const ent=(a,b)=>sessionState.inGame?1:Math.max(0,Math.min(1,(sessionState.clockT-TT0-a)/(b-a))),ease=v=>v*v*(3-2*v);titleBack(UW,UH,cx,pw);if(!sessionState.inGame&&!settingsState.settingsOpen&&!saveMenuState.saveOpen&&!languageState.langOpen&&!settingsState.setupOpen)drawTitleWeather(UW,UH);
 if(settingsState.settingsOpen){dirtBack(UW,UH);drawSettings(UW,UH,cx);return}
  if(saveMenuState.saveOpen){dirtBack(UW,UH);drawSaves(UW,UH,cx);return}
  if(languageState.langOpen){dirtBack(UW,UH);drawLang(UW,UH,cx);return}
 if(settingsState.setupOpen){dirtBack(UW,UH);drawSetup(UW,UH,cx,Math.min(UW-16,380),small);return}
 if(notesOpen){NAV.onEsc=()=>{notesOpen=false};navBegin(false);dirtBack(UW,UH);drawNotes(UW,UH,cx);return}
 if(recOpen){NAV.onEsc=()=>{recOpen=false};navBegin(false);dirtBack(UW,UH);drawRecords(UW,UH,cx);return}
 NAV.onEsc=null;navBegin(!sessionState.inGame||!MP.on);navPoll();
 let y=Math.max(8,UH*(small?.05:.1));uiBtn(UW-30,6,24,20,BTN,BTNH,()=>{settingsState.settingsOpen=true},['Settings'],(x,yy,w,h)=>dIc(IC.gear,x+5,yy+3,14));
 if(sessionState.inGame){canvasesState.ctx.fillStyle='rgba(255,255,255,.4)';canvasesState.ctx.fillRect(0,0,UW,UH);y=Math.max(12,UH*.16);TTL('Game Menu',cx,y,1.75,'center');y+=34}else{
 canvasesState.ctx.globalAlpha=ease(ent(.1,.8));const gw=Math.min(UW*.8,440),cs=Math.max(4,Math.floor(gw/47)),lw=cs*47,lx=Math.round(cx-lw/2);mcLogo('NARANXIA',lx,Math.round(y),cs);y+=cs*5+cs*1.1;
 {const sp=L(MCSPL[Math.floor(sessionState.clockT/7)%MCSPL.length]),a=.7+.3*Math.sin(sessionState.clockT*2.3),S=Math.round(Math.max(9,Math.min(cs*1.75,15)));canvasesState.ctx.save();canvasesState.ctx.textAlign='center';canvasesState.ctx.textBaseline='top';canvasesState.ctx.font='600 '+S+'px '+FFT;
  const tw2=canvasesState.ctx.measureText(sp).width;canvasesState.ctx.shadowColor='rgba(47,125,246,'+(.25*a).toFixed(3)+')';canvasesState.ctx.shadowBlur=Math.max(3,cs);canvasesState.ctx.fillStyle='#2f5fa8';canvasesState.ctx.fillText(sp,cx,y);canvasesState.ctx.shadowBlur=0;canvasesState.ctx.shadowColor='transparent';
  const ly=Math.round(y+S*.55),lg=Math.min(60,cs*7);for(const sd of[-1,1]){const x0=cx+sd*(tw2/2+8),gr=canvasesState.ctx.createLinearGradient(x0,0,x0+sd*lg,0);gr.addColorStop(0,'rgba(47,125,246,.7)');gr.addColorStop(1,'rgba(47,125,246,0)');canvasesState.ctx.fillStyle=gr;canvasesState.ctx.fillRect(Math.min(x0,x0+sd*lg),ly,lg,1);arcDia(x0,ly+.5,2,'#2f7df6')}
  canvasesState.ctx.restore();y+=S+Math.round(small?6:cs*1.3)}
 }canvasesState.ctx.globalAlpha=ease(ent(.4,1.1));const ig=sessionState.inGame,bw=Math.min(UW-24,Math.max(200,Math.min(300,UW*.5))),gp=small?5:9,bx=Math.round(cx-bw/2),wide=bw>=250;
 if(!ig&&saveMenuState.last===undefined){saveMenuState.last=null;svPeek()}
 const nb=(ig?(MP.on?5:7):5)+(!ig&&saveMenuState.last?1:0)+(!ig&&window.NARX&&NARX.desktop?1:0)+(ig?0:1)+(wide||ig?0:1),bh=Math.max(16,Math.min(small?22:26,Math.floor((UH-(ig?20:60)-y)/nb)-gp));
 const hv=(x,yy,w,h)=>inR(inputState.mouse,U(x,yy,w,h)),mb=(lab,fn,hl)=>{const k=navAdd(fn,hv(bx,y,bw,bh));pill(bx,y,bw,bh,lab,hl?GRN:BTN,hl?GRNH:BTNH,fn,null,1.15,k>=0&&NAV.sel===k);y+=bh+gp};
 const openLoad=()=>{saveMenuState.saveOpen=true;saveMenuState.svList=null},openTut=()=>{try{localStorage.removeItem('dk_tut')}catch(e){}settingsState.setupOpen=true};
 if(ig){mb('Back to Game',startGame);if(!MP.on)mb('Save / Load',openLoad);mb('New game',newGame);mb('Quit game',quitGame);if(!MP.on)mb('Tutorial',()=>{tutStart(true);startGame()});mb('Report a bug [F8]',bugReport);mb('Multiplayer (Co-op)',mpOpen)}
 else{if(saveMenuState.last)mb('Continue',continueLast,1);mb('Singleplayer',()=>{settingsState.setupOpen=true});mb('Multiplayer (Co-op)',mpOpen);mb('Load game',openLoad);mb('Tutorial',openTut);if(window.NARX&&NARX.desktop)mb('Exit to desktop',()=>window.close())}
 {const sd=()=>{toggleSound()},lg=()=>{languageState.langOpen=true},op=()=>{settingsState.settingsOpen=true},sl=sndOn?'Sound: on':'Sound: off';
  const row=(x,w,lab,fn,lang)=>{const k=navAdd(fn,hv(x,y,w,bh)),on=k>=0&&NAV.sel===k;if(lang){langBtn(x,y,w,bh,LANG,fn,false);if(on)gold(x,y,w,bh)}else pill(x,y,w,bh,lab,BTN,BTNH,fn,null,wide&&!ig?1.05:1.15,on)};
  if(ig){const hw=Math.round((bw-gp)/2);row(bx,hw,'Options',op);row(bx+hw+gp,bw-hw-gp,sl,sd);y+=bh+gp}
  else if(wide){const lw=Math.max(96,Math.round(bw*.36)),hw=Math.round((bw-lw-2*gp)/2);row(bx,hw,'Options',op);row(bx+hw+gp,hw,sl,sd);row(bx+2*hw+2*gp,bw-2*hw-2*gp,'',lg,1);y+=bh+gp}
  else{const hw=Math.round((bw-gp)/2);row(bx,hw,'Options',op);row(bx+hw+gp,bw-hw-gp,sl,sd);y+=bh+gp;row(bx,bw,'',lg,1);y+=bh+gp}}
 if(!ig){const r=lastRun();if(r&&UH-y>34){TC('Last game: wave '+r.w+'  -  '+r.k+' zombies slain',cx,y+2,'#c4a37a',.85);y+=13;{const wl=titleWeatherLabel(),ww=tw(wl,.85);arcDia(cx-ww/2-8,y+6,2.5,titleSeasonColor())}TC(titleWeatherLabel(),cx,y+2,titleSeasonColor(),.85);y+=15}
  if(sessionState.best.w>0&&UH-y>18){TC('Best: wave '+sessionState.best.w+'  -  '+sessionState.best.k+' zombies slain',cx,y+2,'#ffff55',.9);y+=16}}
 if(!ig&&UH-y>30&&UH>260){const t=TIPS[TIPN];let sc=.8;while(sc>.58&&tw(t,sc)>UW-40)sc-=.04;if(tw(t,sc)<=UW-40)TC(t,cx,Math.min(y+6,UH-40),'#9fd6e6',sc)}
 canvasesState.ctx.globalAlpha=ease(ent(1,1.6));if(UH>240)TC(NAV.active?(padOn()?'D-pad: move | A: select | B: back':'Up / Down: move | Enter: select | Esc: back'):'',cx,UH-27,'#9fb0c6',.72);const ms=AC&&AC.state==='running'&&sndOn?'':(sndOn?'Press any key or click for the music':'Sound is off');TC(ms,cx,UH-14,'#c8c8c8',.8);T_(GVER,UW-24,UH-12,'#c8c8c8',.75);if(!ig&&GNOTES){const nw=Math.max(96,tw('What\'s new',.8)+22),nx=UW-nw-8,ny=UH-34,k=navAdd(()=>{notesOpen=true},hv(nx,ny,nw,18));pill(nx,ny,nw,18,'What\'s new',BTN,BTNH,()=>{notesOpen=true},null,.8,NAV.sel===k)}if(!ig){const rn=Math.max(70,tw('Records',.8)+22),k2=navAdd(()=>{recOpen=true},hv(8,UH-34,rn,18));pill(8,UH-34,rn,18,'Records',BTN,BTNH,()=>{recOpen=true},null,.8,NAV.sel===k2);const jn=Math.max(90,tw('Join a game',.8)+22),k3=navAdd(mpOpenJoin,hv(14+rn,UH-34,jn,18));pill(14+rn,UH-34,jn,18,'Join a game',BTN,BTNH,mpOpenJoin,null,.8,NAV.sel===k3)}navEnd();canvasesState.ctx.globalAlpha=1}

function drawRecords(UW,UH,cx){const W=Math.min(UW-12,420),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=8,H=UH-16;frame(X,Y,W,H,PAN,6);TTL('Records',X+10,Y+7,1.35);
 let y=Y+34;const b=sessionState.best,r=lastRun();
 if(b&&b.w>0){T_('Best: wave '+b.w+'  -  '+b.k+' zombies slain',X+14,y,'#ffff55',.9);y+=16}
 if(r){T_('Last game: wave '+r.w+'  -  '+r.k+' zombies slain',X+14,y,'#c4a37a',.85);y+=13;T_(titleWeatherLabel(),X+14,y,titleSeasonColor(),.85);y+=17}
 let runs=[];try{const all=JSON.parse(localStorage.getItem('dk_sb')||'{}');for(const k in all)for(const e of all[k])if(e&&e.w>=0)runs.push(e)}catch(e){}
 runs.sort((a,b2)=>b2.s-a.s);runs=runs.slice(0,Math.max(0,Math.min(8,Math.floor((Y+H-34-y-16)/14))));
 if(!(b&&b.w>0)&&!r&&!runs.length)T_('No record yet',X+14,y,'#c4a37a',.85);
 else if(runs.length){T_('Best runs',X+14,y,'#d9b27a',.85);y+=15;runs.forEach((e,i)=>{T_('#'+(i+1)+'   Wave '+e.w+'   '+e.k+' kills',X+22,y,'#ead8ba',.82);y+=14})}
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{recOpen=false},null,.9)}

function drawNotes(UW,UH,cx){const W=Math.min(UW-12,480),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),Y=8,H=UH-16;frame(X,Y,W,H,PAN,6);TTL('What\'s new',X+10,Y+7,1.35);T_(GVER,X+W-10-tw(GVER,.9),Y+10,'#d9b27a',.9);
 const items=String(GNOTES||'').split('\n').map(l=>l.replace(/^\s*[-*]\s*/,'').trim()).filter(Boolean),maxW=W-44,top=Y+32,room=H-top+Y-34;
 let sc=.82,lines;const wrap=sc=>{const out=[];for(const it of items){const ws=it.split(' ');let cur='';let first=true;for(const w of ws){const t=cur?cur+' '+w:w;if(cur&&tw(t,sc)>maxW){out.push([cur,first]);first=false;cur=w}else cur=t}if(cur)out.push([cur,first])}return out};
 lines=wrap(sc);while(sc>.58&&lines.length*(10.5*sc/.82+1)>room){sc-=.04;lines=wrap(sc)}
 let y=top;const lh=Math.round(10.5*sc/.82+1);for(const[t,first]of lines){if(y>Y+H-34)break;if(first)arcDia(X+16,y+4,2,'#d8b060');T_(t,X+26,y,'#ead8ba',sc);y+=lh+(first&&false?0:0)}
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{notesOpen=false},null,.9)}

const MCSPL=['Survive the night!','Also try Co-op!','Hold the line!','100% blocky!','Mind the swarm!','Build towers!','Zombies hate walls!','Protect the castle!','Now with keeps!','Gold! Wood! Stone!','100x the swarm!','Ten thousand zombies!','Red eyes in the dark!'];


function mcLogo(txt,x0,y0,cs){const lw=cs*47,hh=cs*5;canvasesState.ctx.save();canvasesState.ctx.textBaseline='alphabetic';canvasesState.ctx.textAlign='center';
 let S=100;canvasesState.ctx.font='700 '+S+'px '+FFT;const w100=canvasesState.ctx.measureText(txt).width||1;S=Math.min(lw/w100*100,hh/.72);canvasesState.ctx.font='700 '+Math.round(S)+'px '+FFT;
 const cx=x0+lw/2,by=y0+hh;canvasesState.ctx.lineJoin='round';
 canvasesState.ctx.shadowColor='rgba(47,125,246,.35)';canvasesState.ctx.shadowBlur=cs*2.2;canvasesState.ctx.fillStyle='#ffffff';canvasesState.ctx.fillText(txt,cx,by);canvasesState.ctx.shadowBlur=0;canvasesState.ctx.shadowColor='transparent';
 canvasesState.ctx.lineWidth=Math.max(2,cs*.7);canvasesState.ctx.strokeStyle='#ffffff';canvasesState.ctx.strokeText(txt,cx,by+cs*.35);canvasesState.ctx.strokeText(txt,cx,by);
 const g=canvasesState.ctx.createLinearGradient(0,by-S*.72,0,by);g.addColorStop(0,'#1d2a3f');g.addColorStop(.5,'#243a63');g.addColorStop(1,'#2f5fa8');canvasesState.ctx.fillStyle=g;canvasesState.ctx.fillText(txt,cx,by);
 {const sw=((sessionState.clockT*.16)%1.7)-.3;if(sw>-.25&&sw<1.25){const bx=x0+sw*lw,w2=cs*2.2;canvasesState.ctx.save();canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(bx-w2+cs*3,y0-cs);canvasesState.ctx.lineTo(bx+w2+cs*3,y0-cs);canvasesState.ctx.lineTo(bx+w2-cs*3,by+cs);canvasesState.ctx.lineTo(bx-w2-cs*3,by+cs);canvasesState.ctx.closePath();canvasesState.ctx.clip();canvasesState.ctx.globalAlpha=.6;canvasesState.ctx.fillStyle='#8fb8ff';canvasesState.ctx.fillText(txt,cx,by);canvasesState.ctx.restore()}}
 canvasesState.ctx.restore()}

function drawSetup(UW,UH,cx,pw,small){let y=Math.max(6,UH*(small?.03:.06));TTL('New kingdom',cx,y,1.65,'center');y+=22;
 const eh=small?86:138;frame(cx-pw/2,y,pw,eh,PAN,6);const bnx=cx-pw/2+10,bnh=eh-14,bnw=bnh*2/3;canvasesState.ctx.imageSmoothingEnabled=true;canvasesState.ctx.drawImage(BANNER,bnx,y+7,bnw,bnh);
 const ex=bnx+bnw+10,ew=cx+pw/2-10-ex;T_('Your kingdom',ex,y+5,'#c4a37a',.8);
 const fy=y+15;settingsState.nameBox={x:ex,y:fy,w:ew-24,h:15};uiBtn(ex+ew-22,fy,22,15,BTN,BTNH,()=>{THEME.n=KNAMES[(Math.random()*KNAMES.length)|0];nmI.value=THEME.n;saveTheme()},['Random name'],(x,yy,w)=>dIc(IC.dice,x+4,yy+1.5,12));
 const LW=small?0:58,rx=ex+LW,rw=ew-LW,row=(lab,n,yy,sz,draw,sel,pick,tip)=>{if(LW)T_(lab,ex,yy+(sz-9*.72)/2,'#c4a37a',.72);const per=Math.max(1,Math.floor((rw+2.5)/(sz+2.5)));for(let i=0;i<n;i++){const sx2=rx+(i%per)*(sz+2.5),sy=yy+((i/per)|0)*(sz+3);draw(sx2,sy,sz,i);if(i===sel)gold(sx2-1,sy-1,sz+2,sz+2,4);hudState.uiHits.push({...U(sx2,sy,sz,sz),fn:()=>{pick(i);saveTheme();retheme()},tip:tip(i)})}return Math.ceil(n/per)*(sz+3)};
 const sq=(x,yy,sz,col)=>{rr(x,yy,sz,sz,3);canvasesState.ctx.fillStyle=col;canvasesState.ctx.fill();canvasesState.ctx.lineWidth=1;canvasesState.ctx.strokeStyle='rgba(0,0,0,.6)';canvasesState.ctx.stroke()};
 let ry=fy+20;const sw=Math.max(8,Math.min(15,(rw+2.5)/PAL.length-2.5));
 ry+=row('Colour',PAL.length,ry,sw,(x,yy,sz,i)=>gemSwatch(x,yy,sz,PAL[i][1]),THEME.c,i=>{THEME.c=i},i=>[PAL[i][0]+' colours']);
 if(!small)ry+=row('2nd colour',PAL.length,ry,sw,(x,yy,sz,i)=>{gemSwatch(x,yy,sz,PAL[i][1]);canvasesState.ctx.save();canvasesState.ctx.beginPath();canvasesState.ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);canvasesState.ctx.clip();canvasesState.ctx.fillStyle=PAL[THEME.c][1];canvasesState.ctx.fillRect(x,yy,sz/2,sz);canvasesState.ctx.restore();canvasesState.ctx.beginPath();canvasesState.ctx.arc(x+sz/2,yy+sz/2,sz/2-.3,0,6.283);canvasesState.ctx.lineWidth=.9;canvasesState.ctx.strokeStyle='#c99a3a';canvasesState.ctx.stroke()},THEME.c2,i=>{THEME.c2=i},i=>['Pattern colour: '+PAL[i][0]]);
 if(!small)ry+=row('Pattern',8,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>{canvasesState.ctx.translate(X,Y);bannerPattern(canvasesState.ctx,W,H,i,PAL[THEME.c2][1])}),THEME.p|0,i=>{THEME.p=i},i=>[['Plain','Per pale','Chevron','Bend','Quarterly','Fess','Bordure','Saltire'][i]]);
 ry+=row('Emblem',EMB.length,ry,sw+3,(x,yy,sz,i)=>shieldTile(x,yy,sz,(X,Y,W,H)=>drawEmblemR(X+W*.14,Y+H*.1,W*.72,i)),THEME.e,i=>{THEME.e=i},()=>['Emblem']);
 y+=eh+10;
 {const s='Long calm between waves, then a slow swarm. It grows stronger each wave.';let sc=.85;while(sc>.64&&tw(s,sc)>UW-14)sc-=.03;if(tw(s,sc)<=UW-14){TC(s,cx,y+3,'#c4a37a',sc);y+=22}else{const q=s.split('. ');TC(q[0]+'.',cx,y,'#c4a37a',.8);TC(q[1],cx,y+11,'#c4a37a',.8);y+=26}}
 const by=Math.min(UH-30,y+4);pill(cx-pw/2+14,by,(pw-28)*.34,22,'Back',BTN,BTNH,()=>{settingsState.setupOpen=false},null,.95);pill(cx-pw/2+14+(pw-28)*.36,by,(pw-28)*.64,22,'Choose site',GRN,GRNH,()=>{openPicker()},IC.map,1)}
