import { TRC, TRD, TRT, TRX } from './translations.js';
import { EXTRA } from './langs/index.js';
import { titleSceneState } from '../rendering/title-scene.js';
import { uiBtn } from '../ui/build-menu.js';
import { canvasesState } from '../ui/canvases.js';
import { BTN, BTNH, frame, GRN, GRNH, PAN } from '../ui/drawing.js';
import { pill } from '../ui/minimap.js';
import { FFT, fontOf, setF, TWM } from '../ui/typography.js';

export const languageState = {
  langOpen: false,
};

/* ================= LANGUAGES =================
   Every text drawn by the interface goes through L(): exact phrases, then templates ("Wave {0}", "{0} has fallen to the horde"),
   then pieces split on separators. English is the source; the choice is kept per player. */
export const LANGS=[['English','gb'],['Français','fr'],['Español','es'],['Deutsch','de'],['Italiano','it'],['Português','pt'],...EXTRA.map(e=>[e.name,e.flag])];

export let LANG=0;

export function L(s){if(!LANG||typeof s!=='string'||!s)return s;let r=TRC.get(s);if(r!==undefined)return r;r=tr0(s);if(TRC.size>8000)TRC.clear();TRC.set(s,r);return r}

function tr0(s){const li=LANG-1;let e=TRX.get(s);if(e&&e[li])return e[li];
 const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);if(m[2]!==s&&m[2]){e=TRX.get(m[2]);if(e&&e[li])return m[1]+e[li]+m[3]}
 for(const t of TRT){const mm=t.re.exec(s);if(!mm||!t.v[li])continue;const val={};t.ids.forEach((d,i)=>{val[d]=mm[i+1]});return t.v[li].replace(/\{(\d)\}/g,(x,d)=>{const v=val[+d];return v===undefined?'':(/^[\d.,%+\- ]*$/.test(v)?v:L(v))})}
 for(const sep of['  -  ',' - ',' | ','   ']){if(s.indexOf(sep)>0){const P=s.split(sep),T=P.map(L);if(T.some((x,i)=>x!==P[i]))return T.join(sep)}}
 return s}

function setLang(i){LANG=i;TRC.clear();TWM.clear();try{localStorage.setItem('dk_lang',i)}catch(e){}try{i18nDom()}catch(e){}titleSceneState.titleDirty=true}

/* the HTML parts (co-op lobby) follow too */
let I18NO=null;
export function i18nDom(){const roots=[...document.querySelectorAll('body > div, body > form')];
 const fix=n=>{if(n.nodeType===3){const v=n.nodeValue;if(v!==n.__tr)n.__en=v;const en=n.__en,tt=en.trim(),out=tt?en.replace(tt,L(tt)):en;n.__tr=out;if(out!==v)n.nodeValue=out}
  else if(n.nodeType===1&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'&&n.tagName!=='CANVAS'){if(n.placeholder!==undefined&&n.placeholder){if(n.placeholder!==n.__pt)n.__ph=n.placeholder;n.__pt=n.placeholder=L(n.__ph)}for(const c of n.childNodes)fix(c)}};
 for(const r of roots)fix(r);
 if(!I18NO&&typeof MutationObserver!=='undefined'){I18NO=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fix(m.target);else for(const a of m.addedNodes)fix(a)}});for(const r of roots)I18NO.observe(r,{subtree:true,childList:true,characterData:true})}}

/* little flags drawn in code */
function drawFlag(code,x,y,w,h){canvasesState.ctx.save();canvasesState.ctx.beginPath();canvasesState.ctx.rect(x,y,w,h);canvasesState.ctx.clip();const R_=(c,a,b,cc,d)=>{canvasesState.ctx.fillStyle=c;canvasesState.ctx.fillRect(x+a*w,y+b*h,cc*w,d*h)};
 if(code==='fr'){R_('#0055a4',0,0,1/3,1);R_('#fff',1/3,0,1/3,1);R_('#ef4135',2/3,0,1/3,1)}
 else if(code==='it'){R_('#009246',0,0,1/3,1);R_('#fff',1/3,0,1/3,1);R_('#ce2b37',2/3,0,1/3,1)}
 else if(code==='de'){R_('#000',0,0,1,1/3);R_('#dd0000',0,1/3,1,1/3);R_('#ffce00',0,2/3,1,1/3)}
 else if(code==='es'){R_('#aa151b',0,0,1,1);R_('#f1bf00',0,.25,1,.5)}
 else if(code==='pt'){R_('#046a38',0,0,.4,1);R_('#da291c',.4,0,.6,1);canvasesState.ctx.fillStyle='#ffe000';canvasesState.ctx.beginPath();canvasesState.ctx.arc(x+.4*w,y+.5*h,h*.22,0,6.283);canvasesState.ctx.fill()}
 else if(code==='nl'){R_('#ae1c28',0,0,1,1/3);R_('#fff',0,1/3,1,1/3);R_('#21468b',0,2/3,1,1/3)}
 else if(code==='pl'){R_('#fff',0,0,1,.5);R_('#dc143c',0,.5,1,.5)}
 else if(code==='tr'){R_('#e30a17',0,0,1,1);const c=canvasesState.ctx;c.fillStyle='#fff';c.beginPath();c.arc(x+.38*w,y+.5*h,h*.3,0,6.283);c.fill();c.fillStyle='#e30a17';c.beginPath();c.arc(x+.43*w,y+.5*h,h*.24,0,6.283);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(x+.6*w,y+.5*h,h*.1,0,6.283);c.fill()}
 else if(code==='ru'){R_('#fff',0,0,1,1/3);R_('#0039a6',0,1/3,1,1/3);R_('#d52b1e',0,2/3,1,1/3)}
 else if(code==='uk'){R_('#0057b7',0,0,1,.5);R_('#ffd700',0,.5,1,.5)}
 else if(code==='ja'){R_('#fff',0,0,1,1);canvasesState.ctx.fillStyle='#bc002d';canvasesState.ctx.beginPath();canvasesState.ctx.arc(x+.5*w,y+.5*h,h*.3,0,6.283);canvasesState.ctx.fill()}
 else if(code==='zh'){R_('#de2910',0,0,1,1);canvasesState.ctx.fillStyle='#ffde00';canvasesState.ctx.fillRect(x+.12*w,y+.14*h,.14*w,.26*h);canvasesState.ctx.fillRect(x+.3*w,y+.1*h,.05*w,.1*h);canvasesState.ctx.fillRect(x+.34*w,y+.24*h,.05*w,.1*h)}
 else if(code==='ko'){R_('#fff',0,0,1,1);const c=canvasesState.ctx;c.fillStyle='#cd2e3a';c.beginPath();c.arc(x+.5*w,y+.5*h,h*.28,Math.PI,0);c.fill();c.fillStyle='#0047a0';c.beginPath();c.arc(x+.5*w,y+.5*h,h*.28,0,Math.PI);c.fill();c.fillStyle='#000';for(const[a,b]of[[.12,.14],[.78,.14],[.12,.74],[.78,.74]])c.fillRect(x+a*w,y+b*h,.1*w,.12*h)}
 else if(code==='ar'){R_('#006c35',0,0,1,1);R_('#fff',.2,.58,.6,.08);R_('#fff',.3,.38,.4,.1)}
 else{R_('#012169',0,0,1,1);canvasesState.ctx.lineCap='butt';const ln=(lw,c,ax,ay,bx,by)=>{canvasesState.ctx.strokeStyle=c;canvasesState.ctx.lineWidth=lw;canvasesState.ctx.beginPath();canvasesState.ctx.moveTo(x+ax*w,y+ay*h);canvasesState.ctx.lineTo(x+bx*w,y+by*h);canvasesState.ctx.stroke()};
  ln(h*.2,'#fff',0,0,1,1);ln(h*.2,'#fff',1,0,0,1);ln(h*.08,'#c8102e',0,0,1,1);ln(h*.08,'#c8102e',1,0,0,1);R_('#fff',.42,0,.16,1);R_('#fff',0,.36,1,.28);R_('#c8102e',.45,0,.1,1);R_('#c8102e',0,.4,1,.2)}
 canvasesState.ctx.restore();canvasesState.ctx.strokeStyle='rgba(0,0,0,.55)';canvasesState.ctx.lineWidth=1;canvasesState.ctx.strokeRect(x+.5,y+.5,w-1,h-1)}

export function langBtn(x,y,w,h,i,fn,sel){uiBtn(x,y,w,h,sel?GRN:BTN,sel?GRNH:BTNH,fn,null,(X,Y,W2,H2)=>{const fh=Math.min(H2-6,13),fw=fh*1.5;drawFlag(LANGS[i][1],X+6,Y+(H2-fh)/2,fw,fh);T_(LANGS[i][0],X+12+fw,Y+(H2-9)/2+.5,'#fff',1)})}

export function drawLang(UW,UH,cx){const two=LANGS.length>8,rows=two?Math.ceil(LANGS.length/2):LANGS.length,W=Math.min(UW-12,two?500:360),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),H=Math.min(UH-16,62+rows*26+30),Y=Math.max(8,(UH-H)/2),cw=two?(W-30)/2:W-24;frame(X,Y,W,H,PAN,6);TTL(L('Choose your language'),X+10,Y+7,1.3);
 LANGS.forEach((l,i)=>langBtn(X+12+(two?(i%2)*(cw+6):0),Y+34+(two?(i/2|0):i)*26,cw,22,i,()=>{setLang(i);languageState.langOpen=false},LANG===i));
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{languageState.langOpen=false},null,.9)}

export const tw=(s,sc)=>{const f=fontOf(9*(sc||1));canvasesState.ctx.font=f;s=L(String(s));const k=f+'\u0001'+s;let v=TWM.get(k);if(v===undefined){v=canvasesState.ctx.measureText(s).width;if(TWM.size>3000)TWM.clear();TWM.set(k,v)}return v};

export function T_(s,x,y,col,sc){sc=sc||1;s=L(String(s));setF(9*sc);canvasesState.ctx.textBaseline='top';canvasesState.ctx.textAlign='left';canvasesState.ctx.fillStyle='rgba(0,0,0,.6)';canvasesState.ctx.fillText(s,x+.5*sc,y+.9*sc);canvasesState.ctx.fillStyle=col||'#fbf1de';canvasesState.ctx.fillText(s,x,y)}

export function TC(s,cx,y,col,sc){T_(s,cx-tw(s,sc)/2,y,col,sc)}

export const TTS=sc=>Math.round(9*sc*1.25*.86);

export function TTL(s,x,y,sc,al){s=L(String(s));const S=TTS(sc);canvasesState.ctx.font='700 '+S+'px '+FFT;canvasesState.ctx.textBaseline='top';canvasesState.ctx.textAlign=al||'left';canvasesState.ctx.fillStyle='rgba(4,3,8,.82)';canvasesState.ctx.fillText(s,x+Math.max(1,S*.05),y+Math.max(1,S*.08));
 const g=canvasesState.ctx.createLinearGradient(0,y,0,y+S);g.addColorStop(0,'#fff5d2');g.addColorStop(.47,'#f2c862');g.addColorStop(.53,'#dca23e');g.addColorStop(1,'#a8721f');canvasesState.ctx.fillStyle=g;canvasesState.ctx.fillText(s,x,y);canvasesState.ctx.textAlign='left'}

export function twH(s,sc){canvasesState.ctx.font='700 '+TTS(sc)+'px '+FFT;return canvasesState.ctx.measureText(L(String(s))).width}

export function initializeLanguage() {
  try{LANG=Math.max(0,Math.min(LANGS.length-1,+(localStorage.getItem('dk_lang')||0)|0))}catch(e){}
}

export function initializeTranslationLookup() {
  /* languages beyond the first six keep their texts in langs/*.js: slot them into the table at their index */
  EXTRA.forEach((e,n)=>{for(const k in e.tr){const v=e.tr[k];if(!v)continue;(TRD[k]||(TRD[k]=[]))[5+n]=v}});
  for(const k in TRD){if(k.indexOf('{0}')<0){TRX.set(k,TRD[k]);continue}const ids=[];const re=k.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{(\d)\}/g,(m,d)=>{ids.push(+d);return '(.*?)'});if(new Set(ids).size!==ids.length)continue;
   TRT.push({re:new RegExp('^'+re+'$'),ids,v:TRD[k],w:k.replace(/\{\d\}/g,'').length})}

  TRT.sort((a,b)=>b.w-a.w);
}
