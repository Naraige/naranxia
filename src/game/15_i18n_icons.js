for(const k in TRD){if(k.indexOf('{0}')<0){TRX.set(k,TRD[k]);continue}const ids=[];const re=k.replace(/[.*+?^$()|[\]\\]/g,'\\$&').replace(/\{(\d)\}/g,(m,d)=>{ids.push(+d);return '(.*?)'});if(new Set(ids).size!==ids.length)continue;
 TRT.push({re:new RegExp('^'+re+'$'),ids,v:TRD[k],w:k.replace(/\{\d\}/g,'').length})}
TRT.sort((a,b)=>b.w-a.w);
function L(s){if(!LANG||typeof s!=='string'||!s)return s;let r=TRC.get(s);if(r!==undefined)return r;r=tr0(s);if(TRC.size>8000)TRC.clear();TRC.set(s,r);return r}
function tr0(s){const li=LANG-1;let e=TRX.get(s);if(e&&e[li])return e[li];
 const m=/^(\s*)([\s\S]*?)(\s*)$/.exec(s);if(m[2]!==s&&m[2]){e=TRX.get(m[2]);if(e&&e[li])return m[1]+e[li]+m[3]}
 for(const t of TRT){const mm=t.re.exec(s);if(!mm||!t.v[li])continue;const val={};t.ids.forEach((d,i)=>{val[d]=mm[i+1]});return t.v[li].replace(/\{(\d)\}/g,(x,d)=>{const v=val[+d];return v===undefined?'':(/^[\d.,%+\- ]*$/.test(v)?v:L(v))})}
 for(const sep of['  -  ',' - ',' | ','   ']){if(s.indexOf(sep)>0){const P=s.split(sep),T=P.map(L);if(T.some((x,i)=>x!==P[i]))return T.join(sep)}}
 return s}
function setLang(i){LANG=i;TRC.clear();TWM.clear();try{localStorage.setItem('dk_lang',i)}catch(e){}try{i18nDom()}catch(e){}titleDirty=true}
/* the HTML parts (co-op lobby) follow too */
let I18NO=null;function i18nDom(){const roots=[...document.querySelectorAll('body > div, body > form')];
 const fix=n=>{if(n.nodeType===3){const v=n.nodeValue;if(v!==n.__tr)n.__en=v;const en=n.__en,tt=en.trim(),out=tt?en.replace(tt,L(tt)):en;n.__tr=out;if(out!==v)n.nodeValue=out}
  else if(n.nodeType===1&&n.tagName!=='SCRIPT'&&n.tagName!=='STYLE'&&n.tagName!=='CANVAS'){if(n.placeholder!==undefined&&n.placeholder){if(n.placeholder!==n.__pt)n.__ph=n.placeholder;n.__pt=n.placeholder=L(n.__ph)}for(const c of n.childNodes)fix(c)}};
 for(const r of roots)fix(r);
 if(!I18NO&&typeof MutationObserver!=='undefined'){I18NO=new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fix(m.target);else for(const a of m.addedNodes)fix(a)}});for(const r of roots)I18NO.observe(r,{subtree:true,childList:true,characterData:true})}}
/* little flags drawn in code */
function drawFlag(code,x,y,w,h){ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();const R_=(c,a,b,cc,d)=>{ctx.fillStyle=c;ctx.fillRect(x+a*w,y+b*h,cc*w,d*h)};
 if(code==='fr'){R_('#0055a4',0,0,1/3,1);R_('#fff',1/3,0,1/3,1);R_('#ef4135',2/3,0,1/3,1)}
 else if(code==='it'){R_('#009246',0,0,1/3,1);R_('#fff',1/3,0,1/3,1);R_('#ce2b37',2/3,0,1/3,1)}
 else if(code==='de'){R_('#000',0,0,1,1/3);R_('#dd0000',0,1/3,1,1/3);R_('#ffce00',0,2/3,1,1/3)}
 else if(code==='es'){R_('#aa151b',0,0,1,1);R_('#f1bf00',0,.25,1,.5)}
 else if(code==='pt'){R_('#046a38',0,0,.4,1);R_('#da291c',.4,0,.6,1);ctx.fillStyle='#ffe000';ctx.beginPath();ctx.arc(x+.4*w,y+.5*h,h*.22,0,6.283);ctx.fill()}
 else{R_('#012169',0,0,1,1);ctx.lineCap='butt';const ln=(lw,c,ax,ay,bx,by)=>{ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x+ax*w,y+ay*h);ctx.lineTo(x+bx*w,y+by*h);ctx.stroke()};
  ln(h*.2,'#fff',0,0,1,1);ln(h*.2,'#fff',1,0,0,1);ln(h*.08,'#c8102e',0,0,1,1);ln(h*.08,'#c8102e',1,0,0,1);R_('#fff',.42,0,.16,1);R_('#fff',0,.36,1,.28);R_('#c8102e',.45,0,.1,1);R_('#c8102e',0,.4,1,.2)}
 ctx.restore();ctx.strokeStyle='rgba(0,0,0,.55)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1)}
let langOpen=false;
function langBtn(x,y,w,h,i,fn,sel){uiBtn(x,y,w,h,sel?GRN:BTN,sel?GRNH:BTNH,fn,null,(X,Y,W2,H2)=>{const fh=Math.min(H2-6,13),fw=fh*1.5;drawFlag(LANGS[i][1],X+6,Y+(H2-fh)/2,fw,fh);T_(LANGS[i][0],X+12+fw,Y+(H2-9)/2+.5,'#fff',1)})}
function drawLang(UW,UH,cx){const W=Math.min(UW-12,360),X=Math.max(6,Math.min(UW-W-6,cx-W/2)),H=Math.min(UH-16,62+LANGS.length*26+30),Y=Math.max(8,(UH-H)/2);frame(X,Y,W,H,PAN,6);TTL(L('Choose your language'),X+10,Y+7,1.3);
 LANGS.forEach((l,i)=>langBtn(X+12,Y+34+i*26,W-24,22,i,()=>{setLang(i);langOpen=false},LANG===i));
 pill(X+W/2-40,Y+H-24,80,16,'Back',BTN,BTNH,()=>{langOpen=false},null,.9)}
const tw=(s,sc)=>{const f=fontOf(9*(sc||1));ctx.font=f;s=L(String(s));const k=f+'\u0001'+s;let v=TWM.get(k);if(v===undefined){v=ctx.measureText(s).width;if(TWM.size>3000)TWM.clear();TWM.set(k,v)}return v};
function T_(s,x,y,col,sc){sc=sc||1;s=L(String(s));setF(9*sc);ctx.textBaseline='top';ctx.textAlign='left';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillText(s,x+.5*sc,y+.9*sc);ctx.fillStyle=col||'#fbf1de';ctx.fillText(s,x,y)}
function TC(s,cx,y,col,sc){T_(s,cx-tw(s,sc)/2,y,col,sc)}
const TTS=sc=>Math.round(9*sc*1.25*.86);
function TTL(s,x,y,sc,al){s=L(String(s));const S=TTS(sc);ctx.font='700 '+S+'px '+FFT;ctx.textBaseline='top';ctx.textAlign=al||'left';ctx.fillStyle='rgba(4,3,8,.82)';ctx.fillText(s,x+Math.max(1,S*.05),y+Math.max(1,S*.08));
 const g=ctx.createLinearGradient(0,y,0,y+S);g.addColorStop(0,'#fff5d2');g.addColorStop(.47,'#f2c862');g.addColorStop(.53,'#dca23e');g.addColorStop(1,'#a8721f');ctx.fillStyle=g;ctx.fillText(s,x,y);ctx.textAlign='left'}
function twH(s,sc){ctx.font='700 '+TTS(sc)+'px '+FFT;return ctx.measureText(L(String(s))).width}
const PAN=['#1d2530','#b8954c','#0a0d12'],BTN=['#263242','#c9a24f','#0b0f14'],BTNH=['#2c4a66','#86dcff','#0c141c'],BTNX=['#171d25','#4c4535','#0a0c10'],TABA=['#1e6a74','#7fe6e6','#0a2a2e'],GRN=['#1d6670','#79dede','#0a272b'],GRNH=['#278692','#a8f6f6','#0e3a40'],RDB=['#7a2630','#e0707a','#3a0e14'];
function rr(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
const SHDM=new Map(),shd=(c,k)=>{const key=c+'|'+k;let r=SHDM.get(key);if(r===undefined){const h=hex(c);r='#'+h.map(v=>Math.max(0,Math.min(255,Math.round(k>=0?v+(255-v)*k:v*(1+k)))).toString(16).padStart(2,'0')).join('');if(SHDM.size>600)SHDM.clear();SHDM.set(key,r)}return r};
const LGC=new Map();function lgc(k,y,h,a,b,c,d,e,f){k+='|'+y+'|'+h;let g=LGC.get(k);if(g===undefined){g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(a,b);g.addColorStop(c,d);if(e!==undefined)g.addColorStop(e,f);if(LGC.size>900)LGC.clear();LGC.set(k,g)}return g}
function arcDia(cx,cy,r,c){ctx.beginPath();ctx.moveTo(cx,cy-r-1);ctx.lineTo(cx+r+1,cy);ctx.lineTo(cx,cy+r+1);ctx.lineTo(cx-r-1,cy);ctx.closePath();ctx.fillStyle='#07060b';ctx.fill();
 const g=ctx.createLinearGradient(0,cy-r,0,cy+r);g.addColorStop(0,shd(c,.5));g.addColorStop(.5,c);g.addColorStop(1,shd(c,-.5));ctx.beginPath();ctx.moveTo(cx,cy-r);ctx.lineTo(cx+r,cy);ctx.lineTo(cx,cy+r);ctx.lineTo(cx-r,cy);ctx.closePath();ctx.fillStyle=g;ctx.fill()}
function arcDeco(x,y,w,h,c,full){
 if(full){const L=Math.round(Math.min(14,w*.1,h*.28)),i=3;ctx.fillStyle=c;ctx.globalAlpha=.5;
  ctx.fillRect(x+i,y+i,L,1);ctx.fillRect(x+i,y+i,1,L);ctx.fillRect(x+w-i-L,y+i,L,1);ctx.fillRect(x+w-i-1,y+i,1,L);
  ctx.fillRect(x+i,y+h-i-1,L,1);ctx.fillRect(x+i,y+h-i-L,1,L);ctx.fillRect(x+w-i-L,y+h-i-1,L,1);ctx.fillRect(x+w-i-1,y+h-i-L,1,L);ctx.globalAlpha=1;
  if(w>=150){const m=Math.round(x+w/2);ctx.fillStyle=c;ctx.fillRect(m-24,y-1,16,1);ctx.fillRect(m+8,y-1,16,1);ctx.fillRect(m-24,y+h,16,1);ctx.fillRect(m+8,y+h,16,1);arcDia(m,y,3.4,c);arcDia(m,y+h,2.6,c)}}
 const r=2.4;arcDia(x+.5,y+.5,r,c);arcDia(x+w-.5,y+.5,r,c);arcDia(x+.5,y+h-.5,r,c);arcDia(x+w-.5,y+h-.5,r,c)}
function frame(x,y,w,h,p,r){if(p===SLOT||p===SLOTH||p===SLOTX){mcSlot(x,y,w,h,p);return}if(p===TIPP){mcTip(x,y,w,h);return}
 x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
 if(p===CHAT){ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x,y,w,h);
  if(y<0&&w>200){const gl=ctx.createLinearGradient(x,0,x+w,0);gl.addColorStop(0,'rgba(214,176,96,0)');gl.addColorStop(.08,'rgba(214,176,96,.9)');gl.addColorStop(.92,'rgba(214,176,96,.9)');gl.addColorStop(1,'rgba(214,176,96,0)');ctx.fillStyle='rgba(5,4,8,.75)';ctx.fillRect(x,y+h,w,1);ctx.fillStyle=gl;ctx.fillRect(x,y+h-1,w,1)}return}
  const Rd=Math.max(1,Math.min(4.5,h/4,w/4)),big=h>40;
  ctx.fillStyle=big?'rgba(0,0,0,.42)':'rgba(0,0,0,.34)';rr(x+(big?2:1),y+(big?3:2),w,h,Rd+1);ctx.fill();
  ctx.fillStyle='#07060b';rr(x-1,y-1,w+2,h+2,Rd+1);ctx.fill();
  ctx.fillStyle=lgc('f'+p[0],y,h,0,shd(p[0],.16),.5,p[0],1,shd(p[0],-.38));rr(x,y,w,h,Rd);ctx.fill();
  if(!big){ctx.fillStyle=lgc('gl',y,h*.55,0,'rgba(255,255,255,.13)',1,'rgba(255,255,255,0)');rr(x+1,y+1,w-2,h*.5,Math.max(0,Rd-1));ctx.fill()}
  else{const vg=ctx.createRadialGradient(x+w/2,y+h*.35,Math.min(w,h)*.2,x+w/2,y+h*.5,Math.max(w,h)*.75);vg.addColorStop(0,'rgba(255,240,210,.05)');vg.addColorStop(1,'rgba(0,0,0,.22)');ctx.fillStyle=vg;rr(x,y,w,h,Rd);ctx.fill()}
  if(p===BTNH||p===GRNH||p===TABA){ctx.fillStyle=lgc('h',y,h,0,'rgba(134,220,255,0)',1,'rgba(134,220,255,.24)');rr(x,y,w,h,Rd);ctx.fill();ctx.save();ctx.shadowColor='rgba(134,220,255,.55)';ctx.shadowBlur=6;ctx.strokeStyle='rgba(134,220,255,.5)';ctx.lineWidth=1;rr(x+.5,y+.5,w-1,h-1,Rd);ctx.stroke();ctx.restore()}
  const rim=p===MAPF?'#c9a24f':p[1];ctx.strokeStyle=lgc('r'+rim,y,h,0,shd(rim,.5),.5,rim,1,shd(rim,-.5));ctx.lineWidth=1.25;rr(x+.6,y+.6,w-1.2,h-1.2,Rd);ctx.stroke();
  if(h>6){ctx.strokeStyle='rgba(255,238,200,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+Rd+1,y+1.9);ctx.lineTo(x+w-Rd-1,y+1.9);ctx.stroke();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.moveTo(x+Rd+1,y+h-1.9);ctx.lineTo(x+w-Rd-1,y+h-1.9);ctx.stroke()}
 if((p===PAN||p===INV||p===MAPF)&&w>=60&&h>=30)arcDeco(x,y,w,h,rim,p===PAN&&h>=60)}
function gold(x,y,w,h,r){const Rd=Math.max(1,Math.min(3.5,w/5,h/5));ctx.save();ctx.shadowColor='rgba(255,214,120,.75)';ctx.shadowBlur=6;ctx.lineWidth=1.8;ctx.strokeStyle='#f6d98a';rr(x+.9,y+.9,w-1.8,h-1.8,Rd);ctx.stroke();ctx.restore()}
/* ---- vector icons (16x16 design space, drawn at any size) ---- */
const ICO_N=160,ICO_RT=320;
const ICN=fn=>{const S=12,c=cvs(16*S,16*S),g=c.getContext('2d');g.scale(S,S);g.lineJoin='round';g.lineCap='round';fn(g);const o=arcIcon(c,ICO_N);o.__vec=true;return o};
/* ---- Minecraft GUI kit: inventory panel, slots, tooltips, chat bars, pixel icons, hearts, dirt ---- */
const INV=['#1b2230','#c9a24f','#06080c'],SLOT=['#8b8b8b'],SLOTH=['#8b8b8b','h'],SLOTX=['#6d6d6d','x'],TIPP=['tip'],CHAT=['chat'],MAPF=['#d9c393','#f4e6c0','#8a6a3a'];
/* Arcane icon finish: smooth 64 px, warm light from the top-left, cool shade bottom-right, black ink outline */
function arcIcon(src,N){N=N||ICO_N;const pad=Math.round(N*.1),w=N-2*pad,a=cvs(N,N),ga=a.getContext('2d');ga.imageSmoothingEnabled=true;ga.imageSmoothingQuality='high';ga.drawImage(src,pad,pad,w,w);
 ga.globalCompositeOperation='source-atop';const gr=ga.createLinearGradient(0,0,N,N);gr.addColorStop(0,'rgba(255,238,196,.26)');gr.addColorStop(.48,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(10,18,48,.34)');ga.fillStyle=gr;ga.fillRect(0,0,N,N);
 const sp=ga.createRadialGradient(N*.32,N*.26,0,N*.32,N*.26,N*.42);sp.addColorStop(0,'rgba(255,250,230,.16)');sp.addColorStop(1,'rgba(255,250,230,0)');ga.fillStyle=sp;ga.fillRect(0,0,N,N);ga.globalCompositeOperation='source-over';
 const sil=(col)=>{const k=cvs(N,N),gk=k.getContext('2d');gk.drawImage(a,0,0);gk.globalCompositeOperation='source-in';gk.fillStyle=col;gk.fillRect(0,0,N,N);return k};
 /* rim light: the silhouette minus itself shifted toward the light, kept inside the shape */
 const rim=cvs(N,N),gr2=rim.getContext('2d'),rr2=Math.max(1,N/90);gr2.drawImage(sil('rgba(255,244,214,.55)'),0,0);gr2.globalCompositeOperation='destination-out';gr2.drawImage(a,rr2*1.4,rr2*1.4);gr2.globalCompositeOperation='destination-in';gr2.drawImage(a,0,0);
 const ink=sil('#0b0810'),o=cvs(N,N),go=o.getContext('2d'),r=Math.max(1.6,N/30);
 try{go.filter='blur('+(N/40).toFixed(1)+'px)';go.globalAlpha=.45;go.drawImage(ink,N/36,N/26);go.filter='none';go.globalAlpha=1}catch(e){}
 for(let i=0;i<24;i++){const t=i/24*6.2832;go.drawImage(ink,Math.cos(t)*r,Math.sin(t)*r)}go.drawImage(a,0,0);go.drawImage(rim,0,0);o.__hd=true;return o}
/* pixel art -> smooth shapes: two EPX passes (16 -> 64 px) before the painted finish */
function epx(src){const w=src.width,h=src.height,d=src.getContext('2d').getImageData(0,0,w,h).data,o=cvs(w*2,h*2),go=o.getContext('2d'),im=go.createImageData(w*2,h*2),D=im.data;
 const P=(x,y)=>{x=x<0?0:x>=w?w-1:x;y=y<0?0:y>=h?h-1:y;const i=(y*w+x)*4;return((d[i]<<24)|(d[i+1]<<16)|(d[i+2]<<8)|d[i+3])>>>0},put=(x,y,v)=>{const i=(y*w*2+x)*4;D[i]=v>>>24;D[i+1]=(v>>>16)&255;D[i+2]=(v>>>8)&255;D[i+3]=v&255};
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const p=P(x,y),A=P(x,y-1),B=P(x+1,y),C=P(x-1,y),E=P(x,y+1);put(2*x,2*y,C===A&&C!==E&&A!==B?A:p);put(2*x+1,2*y,A===B&&A!==C&&B!==E?B:p);put(2*x,2*y+1,E===C&&E!==B&&C!==A?C:p);put(2*x+1,2*y+1,B===E&&B!==A&&E!==C?E:p)}
 go.putImageData(im,0,0);return o}

function mcSlot(x,y,w,h,p){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);const X=p===SLOTX,H=p===SLOTH,Rd=Math.max(1,Math.min(3.5,w/5,h/5));
 ctx.fillStyle='rgba(0,0,0,.36)';rr(x+1,y+2,w,h,Rd+1);ctx.fill();ctx.fillStyle='#07060b';rr(x-1,y-1,w+2,h+2,Rd+1);ctx.fill();
 ctx.fillStyle=X?lgc('sx',y,h,0,'#222a35',1,'#11151b'):H?lgc('sh',y,h,0,'#41698a',.55,'#28455e',1,'#183044'):lgc('sn',y,h,0,'#3b526b',.55,'#26364a',1,'#161f2b');rr(x,y,w,h,Rd);ctx.fill();
 if(!X){ctx.fillStyle=lgc('sg',y,h*.5,0,'rgba(255,255,255,.12)',1,'rgba(255,255,255,0)');rr(x+1,y+1,w-2,h*.48,Math.max(0,Rd-1));ctx.fill()}
 const ig=ctx.createRadialGradient(x+w/2,y+h*.45,Math.min(w,h)*.15,x+w/2,y+h*.5,Math.max(w,h)*.7);ig.addColorStop(0,'rgba(0,0,0,0)');ig.addColorStop(1,'rgba(0,0,0,.25)');ctx.fillStyle=ig;rr(x,y,w,h,Rd);ctx.fill();
 if(H){const gg=ctx.createRadialGradient(x+w/2,y+h*.42,1,x+w/2,y+h*.42,w*.75);gg.addColorStop(0,'rgba(120,220,255,.3)');gg.addColorStop(1,'rgba(120,220,255,0)');ctx.fillStyle=gg;rr(x,y,w,h,Rd);ctx.fill()}
 ctx.save();if(H){ctx.shadowColor='rgba(134,220,255,.7)';ctx.shadowBlur=7}
 ctx.strokeStyle=X?lgc('bx',y,h,0,'#5a5140',1,'#221e16'):H?lgc('bh',y,h,0,'#e6faff',.5,'#86dcff',1,'#2d779c'):lgc('bn',y,h,0,'#fbe6a6',.45,'#d0a952',1,'#5a4520');ctx.lineWidth=1.3;rr(x+.65,y+.65,w-1.3,h-1.3,Rd);ctx.stroke();ctx.restore();
 if(h>8){ctx.strokeStyle='rgba(255,238,200,.13)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+Rd+1,y+2);ctx.lineTo(x+w-Rd-1,y+2);ctx.stroke()}}
function mcTip(x,y,w,h){x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);const Rd=Math.min(4,h/3);
 ctx.fillStyle='rgba(0,0,0,.45)';rr(x+2,y+3,w,h,Rd+1);ctx.fill();const bg=ctx.createLinearGradient(0,y,0,y+h);bg.addColorStop(0,'rgba(22,28,42,.97)');bg.addColorStop(1,'rgba(8,10,16,.97)');ctx.fillStyle=bg;rr(x,y,w,h,Rd);ctx.fill();
 const g=ctx.createLinearGradient(0,y+1,0,y+h-1);g.addColorStop(0,'rgba(246,214,130,.95)');g.addColorStop(1,'rgba(150,110,40,.9)');ctx.strokeStyle=g;ctx.lineWidth=1.2;rr(x+1.1,y+1.1,w-2.2,h-2.2,Rd);ctx.stroke();
 if(w>=50){arcDia(x+1,y+1,1.8,'#d8b060');arcDia(x+w-1,y+1,1.8,'#d8b060');arcDia(x+1,y+h-1,1.8,'#d8b060');arcDia(x+w-1,y+h-1,1.8,'#d8b060')}}
function TN(s,x,y,col,sc){sc=sc||1;s=L(String(s));setF(9*sc);ctx.textBaseline='top';ctx.textAlign='left';ctx.fillStyle=col||'#d6b46a';ctx.fillText(s,x,y)}
const HRT=['.KKK.KKK.','KRRWKRRRK','KRWRRRRRK','KRRRRRRRK','.KRRRRRK.','..KRRRK..','...KRK...','....K....'];
function heart(x,y,kind,ps){const H=(c1,c2)=>{ctx.beginPath();ctx.moveTo(x+4.5,y+7.6);ctx.bezierCurveTo(x+1.2,y+5.4,x-.2,y+3.4,x+.4,y+1.9);ctx.bezierCurveTo(x+1,y+.2,x+3.5,y-.1,x+4.5,y+1.7);ctx.bezierCurveTo(x+5.5,y-.1,x+8,y+.2,x+8.6,y+1.9);ctx.bezierCurveTo(x+9.2,y+3.4,x+7.8,y+5.4,x+4.5,y+7.6);ctx.closePath()};
 {ctx.save();const g=ctx.createLinearGradient(x,y,x+9,y+8);g.addColorStop(0,'#ff8a7a');g.addColorStop(.5,'#d8262a');g.addColorStop(1,'#7a0c14');H();ctx.fillStyle=kind?g:'#3a1418';ctx.fill();
  if(kind===1){ctx.save();H();ctx.clip();ctx.fillStyle='#3a1418';ctx.fillRect(x+4.5,y-1,6,10);ctx.restore()}if(kind){ctx.fillStyle='rgba(255,230,220,.55)';ctx.beginPath();ctx.ellipse(x+2.6,y+2.4,1,.7,-.6,0,6.283);ctx.fill()}H();ctx.lineWidth=1.2;ctx.strokeStyle='#120608';ctx.stroke();ctx.restore();return}
 ps=ps||1;ps=ps||1;for(let r=0;r<8;r++)for(let c=0;c<9;c++){const ch=HRT[r][c];if(ch==='.')continue;let col=ch==='K'?'#1a0606':'';if(!col){const full=kind===2||(kind===1&&c<=4);col=full?(ch==='W'?'#ffb0b0':'#e81c1c'):(ch==='W'?'#5a1414':'#3a0a0a')}ctx.fillStyle=col;ctx.fillRect(x+c*ps,y+r*ps,ps,ps)}}
function hearts(x,y,f,n){n=n||10;const hv=Math.round(Math.max(0,Math.min(1,f))*n*2);for(let i=0;i<n;i++)heart(x+i*8,y,hv>=2*i+2?2:hv===2*i+1?1:0,1)}

let HDBG=null;function hdBg(){if(HDBG)return HDBG;const N=512,c=cvs(N,N),g=c.getContext('2d'),im=g.createImageData(N,N),d=im.data,R=rngf(4242);
 const oct=[[6,.42],[14,.24],[32,.16],[80,.1],[200,.08]].map(([p,a])=>{const v=new Float32Array(p*p);for(let i=0;i<v.length;i++)v[i]=R();return{p,a,v}});
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){let s=0;for(const o of oct){const p=o.p,fx=x/N*p,fy=y/N*p,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty),i0=ix%p,i1=(ix+1)%p,j0=iy%p,j1=(iy+1)%p,a=o.v[j0*p+i0],b=o.v[j0*p+i1],c2=o.v[j1*p+i0],e=o.v[j1*p+i1];s+=o.a*((a+(b-a)*sx)*(1-sy)+(c2+(e-c2)*sx)*sy)}
  const t=Math.max(0,Math.min(1,(s-.22)*1.75)),k=(y*N+x)*4;d[k]=22+t*40;d[k+1]=28+t*42;d[k+2]=38+t*52;d[k+3]=255}
 g.putImageData(im,0,0);return HDBG=c}
function dirtBack(UW,UH,dark){const p=ctx.createPattern(hdBg(),'repeat');ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;ctx.fillStyle=p;ctx.fillRect(0,0,cv.width,cv.height);ctx.restore();ctx.fillStyle='rgba(0,0,0,'+(dark==null?.55:dark)+')';ctx.fillRect(0,0,UW,UH)}
const lgr=(g,x0,y0,x1,y1,a,b)=>{const q=g.createLinearGradient(x0,y0,x1,y1);q.addColorStop(0,a);q.addColorStop(1,b);return q};
const poly=(g,pts,fill,stroke,lw)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};
const circ=(g,x,y,r,fill,stroke,lw)=>{g.beginPath();g.arc(x,y,r,0,6.2832);if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};
const rrg=(g,x,y,w,h,r,fill,stroke,lw)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(stroke){g.lineWidth=lw||1;g.strokeStyle=stroke;g.stroke()}};
const ln=(g,x0,y0,x1,y1,col,lw)=>{g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.strokeStyle=col;g.lineWidth=lw;g.stroke()};
let IC={
 coin:ICN(g=>{circ(g,8,8,6.6,lgr(g,3,2,13,14,'#ffe989','#e0a010'),'#8a5a00',1);circ(g,8,8,4.3,null,'rgba(138,90,0,.6)',.9);ln(g,8,5.6,8,10.4,'rgba(138,90,0,.75)',1.3);g.beginPath();g.arc(8,8,5.6,3.5,4.9);g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=.9;g.stroke()}),
 wood:ICN(g=>{[3,9.2].forEach(y=>{rrg(g,2.5,y,11.5,4.6,2.3,lgr(g,0,y,0,y+4.6,'#b9824a','#7a4e24'),'#3d2410',.9);circ(g,4.8,y+2.3,2.2,lgr(g,3,y,7,y+4,'#f0cf94','#d9a560'),'#3d2410',.8);circ(g,4.8,y+2.3,1.1,null,'rgba(120,70,20,.8)',.6)})}),
 stone:ICN(g=>{poly(g,[[1.5,12.5],[2.5,6],[6.5,2.5],[11.5,3.5],[14.5,8.5],[13.5,13]],lgr(g,2,2,14,14,'#c4cad4','#6d7480'),'#2f343d',1);poly(g,[[2.5,6],[6.5,2.5],[9,7.5],[5,10]],'rgba(255,255,255,.4)');poly(g,[[9,7.5],[14.5,8.5],[13.5,13],[8,12]],'rgba(0,0,0,.22)')}),
 heart:ICN(g=>{g.beginPath();g.moveTo(8,14.3);g.bezierCurveTo(.5,9.5,1.6,2.8,5.8,3.3);g.bezierCurveTo(7,3.45,7.8,4.4,8,5.2);g.bezierCurveTo(8.2,4.4,9,3.45,10.2,3.3);g.bezierCurveTo(14.4,2.8,15.5,9.5,8,14.3);g.closePath();g.fillStyle=lgr(g,3,3,12,14,'#ff7a7a','#c01f2f');g.fill();g.lineWidth=.9;g.strokeStyle='#5a0d16';g.stroke();g.beginPath();g.arc(5.4,6.4,1.6,3.3,4.5);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=.9;g.stroke()}),
 skull:ICN(g=>{circ(g,8,7,5.6,lgr(g,3,2,13,12,'#f2f8e0','#b9c9a0'),'#3a4a2a',.9);rrg(g,5,10,6,4.3,1.3,'#dfe9c8','#3a4a2a',.8);circ(g,5.8,7.2,1.6,'#233014');circ(g,10.2,7.2,1.6,'#233014');poly(g,[[8,8.6],[7.2,10],[8.8,10]],'#233014');ln(g,7,11,7,13.8,'#3a4a2a',.6);ln(g,9,11,9,13.8,'#3a4a2a',.6)}),
 hammer:ICN(g=>{ln(g,3.5,13.5,10,7,'#4a2c12',3);ln(g,3.5,13.5,10,7,'#b07a40',1.8);g.save();g.translate(10.8,5.6);g.rotate(.78);rrg(g,-4.4,-2.4,8.8,4.8,1.2,lgr(g,0,-2.4,0,2.4,'#e4e9f1','#7e8794'),'#2f343d',.9);g.restore()}),
 sword:ICN(g=>{ln(g,5.2,10.8,13.6,2.4,'#2a303a',3.1);ln(g,5.2,10.8,13.6,2.4,'#eef2f8',1.7);ln(g,3.6,8.4,7.8,12.6,'#6a4a10',2.4);ln(g,3.6,8.4,7.8,12.6,'#f0c040',1.4);ln(g,4.6,11.4,2.4,13.6,'#4a2c12',2.4);circ(g,2.1,13.9,1.3,'#f0c040','#6a4a10',.6)}),
 plus:ICN(g=>{ln(g,8,3,8,13,'#fff',2.2);ln(g,3,8,13,8,'#fff',2.2)}),
 minus:ICN(g=>{ln(g,3,8,13,8,'#fff',2.2)}),
 close:ICN(g=>{ln(g,3.5,3.5,12.5,12.5,'#fff',2.2);ln(g,12.5,3.5,3.5,12.5,'#fff',2.2)}),
 wall:ICN(g=>{rrg(g,1,5,14,9.5,1,lgr(g,0,5,0,14,'#bfc3cf','#80869a'),'#2f343d',.9);[[1,2.4],[6.2,2.4],[11.4,2.4]].forEach(([x,y])=>rrg(g,x,y,3.6,3.4,.6,'#c9cdd8','#2f343d',.8));
  ln(g,1.5,8.5,14.5,8.5,'rgba(40,45,60,.55)',.7);ln(g,1.5,11.7,14.5,11.7,'rgba(40,45,60,.55)',.7);[5,10.5].forEach(x=>ln(g,x,5.4,x,8.5,'rgba(40,45,60,.55)',.7));[3,8,13].forEach(x=>ln(g,x,8.5,x,11.7,'rgba(40,45,60,.55)',.7))}),
 gate:ICN(g=>{rrg(g,1,2.5,14,12,1.2,lgr(g,0,2,0,14,'#bfc3cf','#80869a'),'#2f343d',.9);g.beginPath();g.moveTo(4.4,14.5);g.lineTo(4.4,8.4);g.arc(8,8.4,3.6,Math.PI,0);g.lineTo(11.6,14.5);g.closePath();g.fillStyle=lgr(g,0,5,0,14,'#a8743c','#5e3a1a');g.fill();g.strokeStyle='#2a1808';g.lineWidth=.9;g.stroke();
  [6.2,8,9.8].forEach(x=>ln(g,x,5.4,x,14.4,'rgba(30,15,5,.55)',.6));ln(g,4.6,10.5,11.4,10.5,'#3a3d46',.8);circ(g,9.8,11.4,.6,'#f0c040')}),
 path:ICN(g=>{g.beginPath();g.ellipse(8,8.5,7,4.2,-.35,0,6.2832);g.fillStyle=lgr(g,2,3,14,13,'#dcc79a','#a68a58');g.fill();g.strokeStyle='#6b5530';g.lineWidth=.9;g.stroke();[[5,9],[8,7.4],[10.5,9.6],[7,10.8],[11,7]].forEach(([x,y])=>circ(g,x,y,.8,'rgba(90,70,40,.65)'))}),
 stairs:ICN(g=>{poly(g,[[1,14.5],[1,11.5],[5,11.5],[5,8.5],[9,8.5],[9,5.5],[13,5.5],[13,2.5],[15,2.5],[15,14.5]],lgr(g,0,2,0,15,'#cfd2dc','#7f8596'),'#2f343d',.9);[[1,11.5,5],[5,8.5,9],[9,5.5,13],[13,2.5,15]].forEach(([a,y,b])=>ln(g,a,y,b,y,'rgba(255,255,255,.8)',1))}),
 tower:ICN(g=>{rrg(g,4,6,8,9,.6,lgr(g,4,0,12,0,'#c9ccd6','#80869a'),'#2f343d',.9);rrg(g,3,4.2,10,2.4,.5,'#d2d5de','#2f343d',.8);[3,6.9,10.8].forEach(x=>rrg(g,x,2.4,2.2,2.3,.4,'#d2d5de','#2f343d',.7));ln(g,8,2.6,8,.3,'#3a2a14',.8);poly(g,[[8,.4],[11,1.3],[8,2.3]],'#d0382e');rrg(g,7,8.4,2,3.6,1,'#232a3e');ln(g,4.4,13,11.6,13,'rgba(40,45,60,.45)',.6)}),
 ballista:ICN(g=>{rrg(g,3,12,10,2.6,.6,lgr(g,3,12,3,15,'#a0764a','#5a3a20'),'#2f1c0c',.8);ln(g,2,7.5,8,6,'#8a5a2a',1.8);ln(g,14,7.5,8,6,'#8a5a2a',1.8);ln(g,2,7.5,8,11.4,'#f2e8c8',.6);ln(g,14,7.5,8,11.4,'#f2e8c8',.6);rrg(g,7,4,2,9,.6,lgr(g,7,0,9,0,'#c59a62','#7a5230'),'#2f1c0c',.7);poly(g,[[8,.4],[9.6,3.6],[6.4,3.6]],'#d4dae6','#3a3f50',.6);rrg(g,6.4,10,3.2,2.4,.5,'#80869a','#2f343d',.6)}),
 trebuchet:ICN(g=>{rrg(g,1.5,13,13,1.8,.5,'#7a5230','#2f1c0c',.7);poly(g,[[4,13],[7,4],[9,4],[6,13]],'#92643a','#2f1c0c',.7);poly(g,[[12,13],[9,4],[7,4],[10,13]],'#7a5230','#2f1c0c',.7);ln(g,3,10.6,13.4,2.4,'#b98a50',1.6);ln(g,3,10.6,13.4,2.4,'#5a3a20',.5);rrg(g,1.2,10.4,4,4,.8,lgr(g,1,10,5,14,'#a8aebc','#5c6272'),'#2f343d',.8);circ(g,13.6,2.2,1.7,'#9aa0b0','#2f343d',.7);circ(g,8,4.6,1,'#d4dae6','#2f343d',.5)}),
 raise:ICN(g=>{poly(g,[[1,12],[5,6],[8,8],[12,3],[15,12]],lgr(g,0,3,0,13,'#78c25a','#4a8a3a'),'#244a1c',.9);rrg(g,1,11.4,14,3.4,.8,lgr(g,0,11,0,15,'#a97a4a','#6b4a28'),'#3a2410',.8);ln(g,8,.8,8,5.4,'#ffd23c',1.4);poly(g,[[5.6,3],[8,.6],[10.4,3]],'#ffd23c','#7a5a00',.5)}),
 dig:ICN(g=>{poly(g,[[1,4],[15,4],[15,13],[1,13]],lgr(g,0,4,0,13,'#a97a4a','#6b4a28'),'#3a2410',.9);poly(g,[[1,4],[15,4],[12,8],[4,8]],'#3a2a18',null);rrg(g,1,2.6,14,2.4,.8,lgr(g,0,2,0,5,'#78c25a','#4a8a3a'),'#244a1c',.8);ln(g,8,.4,8,5.6,'#ffd23c',1.2);poly(g,[[5.6,3.6],[8,6.4],[10.4,3.6]],'#ffd23c','#7a5a00',.5)}),
 sound:ICN(g=>{poly(g,[[2,6],[5,6],[9,2.6],[9,13.4],[5,10],[2,10]],'#fbf0dc','#2a3350',.8);g.beginPath();g.arc(9.6,8,2.6,-1,1);g.strokeStyle='#fbf0dc';g.lineWidth=1.1;g.stroke();g.beginPath();g.arc(9.6,8,5,-1,1);g.stroke()}),
 mute:ICN(g=>{poly(g,[[2,6],[5,6],[9,2.6],[9,13.4],[5,10],[2,10]],'#8a93b0','#2a3350',.8);ln(g,11,5.4,15,10.6,'#ff6a6a',1.4);ln(g,15,5.4,11,10.6,'#ff6a6a',1.4)}),
 idle:ICN(g=>{circ(g,8,9.4,4.9,lgr(g,4,5,12,14,'#ffe2b4','#d9a874'),'#6b4423',.8);g.beginPath();g.ellipse(8,6.6,7.2,1.9,0,0,6.2832);g.fillStyle='#f0d878';g.fill();g.strokeStyle='#6b5018';g.lineWidth=.8;g.stroke();circ(g,6.1,9.8,.75,'#2a2a2a');circ(g,9.9,9.8,.75,'#2a2a2a');ln(g,6.2,12,9.8,12,'#8a4a2a',.7);[[11,2,2.4],[13.4,.4,1.7]].forEach(([x,y,r])=>{ln(g,x,y,x+r,y,'#bcd0ff',.8);ln(g,x+r,y,x,y+r,'#bcd0ff',.8);ln(g,x,y+r,x+r,y+r,'#bcd0ff',.8)})}),
 peasant:ICN(g=>{circ(g,8,9.4,4.9,lgr(g,4,5,12,14,'#ffe2b4','#d9a874'),'#6b4423',.8);g.beginPath();g.ellipse(8,6.6,7.2,1.9,0,0,6.2832);g.fillStyle=lgr(g,0,5,0,8,'#f0d878','#c9a444');g.fill();g.strokeStyle='#6b5018';g.lineWidth=.8;g.stroke();g.beginPath();g.ellipse(8,5.6,3.9,3,0,Math.PI,0);g.fillStyle=lgr(g,0,2,0,6,'#f8e594','#d8b650');g.fill();g.stroke();rrg(g,4.2,5.2,7.6,1.1,.4,'#8a4a2a');circ(g,6.1,9.8,.75,'#2a2a2a');circ(g,9.9,9.8,.75,'#2a2a2a');g.beginPath();g.arc(8,11.2,1.6,.3,2.8);g.strokeStyle='#8a4a2a';g.lineWidth=.7;g.stroke()}),
 knight:ICN(g=>{poly(g,[[2.8,14.5],[2.8,8],[4.6,3.4],[11.4,3.4],[13.2,8],[13.2,14.5]],lgr(g,3,3,13,14,'#e4e9f4','#7d879c'),'#262d40',1);rrg(g,4.2,7.2,7.6,2.2,.8,'#141a2a');rrg(g,7.2,9,1.6,5,.5,'#aeb7ca','#262d40',.5);poly(g,[[7,3.6],[7.6,.6],[11.4,1.3],[9.6,3.6]],lgr(g,7,1,11,4,'#ff6a5a','#b0241c'),'#5a1010',.6);ln(g,5,5,6.4,4.2,'rgba(255,255,255,.85)',.8)}),
 archer:ICN(g=>{poly(g,[[3.2,14.5],[3.2,7],[5.2,4],[8,.9],[10.8,4],[12.8,7],[12.8,14.5]],lgr(g,3,1,13,14,'#68c36c','#2c7a38'),'#173d1c',.9);circ(g,8,9,3.6,lgr(g,5,6,11,12,'#ffe2b4','#d9a874'),'#6b4423',.6);circ(g,6.7,8.8,.65,'#1d3a22');circ(g,9.3,8.8,.65,'#1d3a22');g.beginPath();g.arc(14.4,8,4.6,-1.15,1.15);g.strokeStyle='#4a2c12';g.lineWidth=1.5;g.stroke();g.strokeStyle='#8a5a2a';g.lineWidth=.8;g.stroke();ln(g,11.1,4.4,11.1,11.6,'#f4f4f4',.5)}),
 home:ICN(g=>{poly(g,[[1,8.2],[8,2],[15,8.2],[13.2,8.2],[13.2,14.3],[2.8,14.3],[2.8,8.2]],lgr(g,0,2,0,14,'#f4e3b8','#c9a86a'),'#4a2c12',.9);poly(g,[[0.4,8.4],[8,1.4],[15.6,8.4],[14.2,8.4],[8,3.2],[1.8,8.4]],'#d0382e','#6a1410',.8);rrg(g,6.5,9.6,3,4.7,.6,'#6b3f1c','#2a1808',.7);rrg(g,10.4,9,2,2,.3,'#8ec6f0','#2a1808',.6)}),
 map:ICN(g=>{poly(g,[[1,3.4],[5.4,2.2],[10.6,3.8],[15,2.6],[15,12.6],[10.6,13.8],[5.4,12.2],[1,13.4]],lgr(g,0,2,16,14,'#f4e6bd','#cdb27a'),'#5a4220',.9);ln(g,5.4,2.4,5.4,12,'rgba(90,66,32,.6)',.7);ln(g,10.6,3.9,10.6,13.6,'rgba(90,66,32,.6)',.7);g.beginPath();g.moveTo(2.6,10.6);g.quadraticCurveTo(5.6,5.4,8,8.6);g.quadraticCurveTo(10,11,12.8,5.4);g.strokeStyle='#d0382e';g.lineWidth=1;g.setLineDash([1.6,1.2]);g.stroke();g.setLineDash([]);ln(g,11.4,4,13.4,6,'#d0382e',1.1);ln(g,13.4,4,11.4,6,'#d0382e',1.1)}),
 pause:ICN(g=>{rrg(g,3.5,2.8,3.2,10.4,.8,'#fff');rrg(g,9.3,2.8,3.2,10.4,.8,'#fff')}),
 play:ICN(g=>{poly(g,[[4,2.4],[13.4,8],[4,13.6]],'#fff','#fff',1)}),
 ff:ICN(g=>{poly(g,[[1.5,3],[8,8],[1.5,13]],'#fff','#fff',.8);poly(g,[[8,3],[14.5,8],[8,13]],'#fff','#fff',.8)}),
 menu:ICN(g=>{[3.6,8,12.4].forEach(y=>ln(g,2.8,y,13.2,y,'#fff',2))}),
 army:ICN(g=>{g.beginPath();g.moveTo(8,1.3);g.lineTo(14,3.3);g.lineTo(13.2,9);g.quadraticCurveTo(12.2,13,8,14.9);g.quadraticCurveTo(3.8,13,2.8,9);g.lineTo(2,3.3);g.closePath();g.fillStyle=lgr(g,2,1,14,15,'#6c9cf0','#2a4fa8');g.fill();g.lineWidth=1;g.strokeStyle='#142450';g.stroke();ln(g,8,4.2,8,11.6,'#fff',1.6);ln(g,5,7,11,7,'#fff',1.6)}),
 cursor:ICN(g=>{poly(g,[[3.6,2],[3.6,13.2],[6.4,10.4],[8.4,14.6],[10.4,13.7],[8.4,9.6],[12.2,9.6]],'#fff','#10151f',1)}),
 pan:ICN(g=>{ln(g,8,3,8,13,'#fff',1.6);ln(g,3,8,13,8,'#fff',1.6);poly(g,[[8,1],[10.2,3.8],[5.8,3.8]],'#fff');poly(g,[[8,15],[10.2,12.2],[5.8,12.2]],'#fff');poly(g,[[1,8],[3.8,5.8],[3.8,10.2]],'#fff');poly(g,[[15,8],[12.2,5.8],[12.2,10.2]],'#fff')}),
 rotL:ICN(g=>{g.beginPath();g.arc(8,8.6,4.8,3.6,6.9);g.strokeStyle='#fff';g.lineWidth=1.8;g.stroke();poly(g,[[1.4,6.6],[5.6,6.4],[3.4,10]],'#fff')}),
 rotR:ICN(g=>{g.beginPath();g.arc(8,8.6,4.8,-.7,2.6);g.strokeStyle='#fff';g.lineWidth=1.8;g.stroke();poly(g,[[14.6,6.6],[10.4,6.4],[12.6,10]],'#fff')}),
 zoomIn:ICN(g=>{circ(g,6.6,6.6,4.6,'rgba(255,255,255,.12)','#fff',1.6);ln(g,10,10,14,14,'#fff',2);ln(g,6.6,4.4,6.6,8.8,'#fff',1.4);ln(g,4.4,6.6,8.8,6.6,'#fff',1.4)}),
 zoomOut:ICN(g=>{circ(g,6.6,6.6,4.6,'rgba(255,255,255,.12)','#fff',1.6);ln(g,10,10,14,14,'#fff',2);ln(g,4.4,6.6,8.8,6.6,'#fff',1.4)}),
 clock:ICN(g=>{circ(g,8,8,6.4,lgr(g,2,2,14,14,'#fdfdfd','#c0c8d8'),'#2a3350',1);ln(g,8,8,8,4,'#2a3350',1.3);ln(g,8,8,11,9.6,'#d0382e',1.2)}),
 crown:ICN(g=>{poly(g,[[1.5,12.5],[1,4.5],[4.8,8],[8,2.5],[11.2,8],[15,4.5],[14.5,12.5]],lgr(g,0,2,0,13,'#ffe56a','#d9981a'),'#6a4a08',.9);rrg(g,1.5,11.4,13,2.4,.8,'#f0b830','#6a4a08',.8);[[8,2.5],[1,4.5],[15,4.5]].forEach(([x,y])=>circ(g,x,y,1,'#ff5a5a','#6a1010',.5))}),
 sound:ICN(g=>{poly(g,[[2,6],[5,6],[9,2.8],[9,13.2],[5,10],[2,10]],'#fff');g.beginPath();g.arc(9.5,8,3.2,-.9,.9);g.strokeStyle='#fff';g.lineWidth=1.2;g.stroke()}),
 brute:ICN(g=>{circ(g,8,8.6,6,lgr(g,3,3,13,14,'#8fc070','#4a7a3a'),'#1d3010',1);poly(g,[[3.2,4.5],[2,1.4],[5.4,3.2]],'#e8e4d0','#3a3020',.6);poly(g,[[12.8,4.5],[14,1.4],[10.6,3.2]],'#e8e4d0','#3a3020',.6);circ(g,5.8,7.8,1.1,'#ff3030');circ(g,10.2,7.8,1.1,'#ff3030');rrg(g,4.6,11,6.8,2.4,.8,'#2a3a1a');[5.8,7.4,9,10.6].forEach(x=>ln(g,x,11,x,12,'#e8e4d0',.7))}),
 runner:ICN(g=>{circ(g,8,8.6,5.6,lgr(g,3,3,13,14,'#e89a78','#a0502e'),'#3a1608',1);circ(g,5.9,7.8,1,'#ff3030');circ(g,10.1,7.8,1,'#ff3030');rrg(g,5,11,6,1.8,.8,'#3a1608');ln(g,1,6,3.4,6.6,'#fff',.9);ln(g,.8,9,3.2,9,'#fff',.9);ln(g,1.4,11.8,3.6,11.2,'#fff',.9)})};
function dIc(ic,x,y,s){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(ic,x,y,s||14,s||14)}

/* ---- more icons ---- */
function thIcons(){IC.bannerman=ICN(g=>{ln(g,3.2,15,3.2,1.2,'#5a3a1a',1.6);circ(g,3.2,1.2,1,'#f0c040');poly(g,[[4,2.2],[13.8,2.2],[13.8,10.2],[8.9,8.2],[4,10.2]],lgr(g,0,2,0,10,PAL[THEME.c][2],PAL[THEME.c][1]),'#1c2438',.8);ln(g,8.9,3.6,8.9,7,'#fff',1.4);ln(g,7.2,5.3,10.6,5.3,'#fff',1.4)});
IC.captain=ICN(g=>{poly(g,[[2.8,14.5],[2.8,8],[4.6,4],[11.4,4],[13.2,8],[13.2,14.5]],lgr(g,3,3,13,14,'#fff1a8','#c8921e'),'#5a3d08',1);rrg(g,4.2,7.4,7.6,2.2,.8,'#141a2a');rrg(g,7.2,9.2,1.6,5,.5,'#e0b030','#5a3d08',.5);poly(g,[[6.6,4],[7.2,.4],[10,.4],[10.6,1.6],[9.6,4]],lgr(g,7,0,10,4,PAL[THEME.c][2],PAL[THEME.c][1]),'#1c2438',.6);circ(g,8,5.4,.8,'#ff5a5a')})}
IC.group=ICN(g=>{[[4.2,10.2,2],[11.8,10.2,2],[8,6,2.3]].forEach(([x,y,r])=>{circ(g,x,y-2.4,r,'#ffe2b4','#2a1a0a',.6);g.beginPath();g.arc(x,y+2.6,r*1.5,Math.PI,0);g.lineTo(x+r*1.5,y+5);g.lineTo(x-r*1.5,y+5);g.closePath();g.fillStyle='#7aa0ff';g.fill();g.strokeStyle='#1c2848';g.lineWidth=.6;g.stroke()});ln(g,1.5,14.6,14.5,14.6,'#ffd23c',1)});
IC.ungroup=ICN(g=>{[[4.2,10.2,2],[11.8,10.2,2]].forEach(([x,y,r])=>{circ(g,x,y-2.4,r,'#ffe2b4','#2a1a0a',.6);g.beginPath();g.arc(x,y+2.6,r*1.5,Math.PI,0);g.lineTo(x+r*1.5,y+5);g.lineTo(x-r*1.5,y+5);g.closePath();g.fillStyle='#7aa0ff';g.fill();g.strokeStyle='#1c2848';g.lineWidth=.6;g.stroke()});ln(g,2,2,14,14,'#ff5a5a',1.8);ln(g,14,2,2,14,'#ff5a5a',1.8)});
IC.dice=ICN(g=>{rrg(g,2,2,12,12,2.4,lgr(g,2,2,14,14,'#fff','#c4ccdc'),'#2a3350',1);[[5,5],[11,5],[8,8],[5,11],[11,11]].forEach(([x,y])=>circ(g,x,y,1,'#2a3350'))});
/* ---- kingdom banner & emblems ---- */
const EMB=[
 g=>{rrg(g,6,1.5,4,13,1,g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,2,5.5,12,4,1,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{const p=[];for(let i=0;i<10;i++){const r=i%2?3.2:7.2,a=-Math.PI/2+i*Math.PI/5;p.push([8+Math.cos(a)*r,8.4+Math.sin(a)*r])}poly(g,p,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{poly(g,[[1.5,12.5],[1,4.5],[4.8,8],[8,2.5],[11.2,8],[15,4.5],[14.5,12.5]],g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,1.5,11.6,13,2.4,.8,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{const f=g.fillStyle;ln(g,3,13,13,3,'rgba(0,0,0,.5)',3);ln(g,13,13,3,3,'rgba(0,0,0,.5)',3);ln(g,3,13,13,3,f,1.8);ln(g,13,13,3,3,f,1.8);ln(g,2.6,9.6,6.4,13.4,f,1.6);ln(g,13.4,9.6,9.6,13.4,f,1.6)},
 g=>{rrg(g,4.2,6,7.6,8.6,.6,g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,3,4.4,10,2.2,.4,g.fillStyle,'rgba(0,0,0,.5)',.5);[3,6.9,10.8].forEach(x=>rrg(g,x,2.4,2.2,2.2,.3,g.fillStyle,'rgba(0,0,0,.5)',.5))},
 g=>{const f=g.fillStyle;circ(g,8,8,3.4,f,'rgba(0,0,0,.5)',.5);for(let i=0;i<8;i++){const a=i*Math.PI/4;ln(g,8+Math.cos(a)*4.8,8+Math.sin(a)*4.8,8+Math.cos(a)*7,8+Math.sin(a)*7,f,1.5)}},
 g=>{poly(g,[[8,1.5],[13,7],[3,7]],g.fillStyle,'rgba(0,0,0,.5)',.5);poly(g,[[8,4.5],[13.6,10.5],[2.4,10.5]],g.fillStyle,'rgba(0,0,0,.5)',.5);rrg(g,7,10,2,4.5,.4,g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{poly(g,[[9.2,1],[3,9],[7.4,9],[6,15],[13,6.4],[8.6,6.4]],g.fillStyle,'rgba(0,0,0,.5)',.5)},
 g=>{const f=g.fillStyle;g.beginPath();g.arc(8,8,6.6,Math.PI*.28,Math.PI*1.72,false);g.arc(10.6,8,5.1,Math.PI*1.62,Math.PI*.38,true);g.closePath();g.fillStyle=f;g.fill();g.lineWidth=.5;g.strokeStyle='rgba(0,0,0,.5)';g.stroke();const p=[];for(let i=0;i<10;i++){const r=i%2?.9:2.1,a=-Math.PI/2+i*Math.PI/5;p.push([12.2+Math.cos(a)*r,4.4+Math.sin(a)*r])}poly(g,p,f,null)},
 g=>{const f=g.fillStyle;circ(g,8,3,1.7,null,'rgba(0,0,0,.5)',2.4);circ(g,8,3,1.7,null,f,1.4);rrg(g,7.2,4.4,1.6,9.2,.4,f,'rgba(0,0,0,.5)',.5);rrg(g,4,6,8,1.5,.5,f,'rgba(0,0,0,.5)',.5);g.beginPath();g.arc(8,9,5,Math.PI*.12,Math.PI*.88,false);g.lineWidth=2.6;g.strokeStyle='rgba(0,0,0,.5)';g.stroke();g.lineWidth=1.6;g.strokeStyle=f;g.stroke();poly(g,[[1.8,9.6],[3.6,8.4],[3.8,11]],f,null);poly(g,[[14.2,9.6],[12.4,8.4],[12.2,11]],f,null)},
 g=>{const f=g.fillStyle;circ(g,5,5,3.2,null,'rgba(0,0,0,.5)',2.8);circ(g,5,5,3.2,null,f,1.8);ln(g,7.2,7.2,14,14,'rgba(0,0,0,.5)',2.8);ln(g,7.2,7.2,14,14,f,1.8);ln(g,11.4,11.4,9.6,13.2,f,1.6);ln(g,13,13,11.4,14.6,f,1.6)},
 g=>{const f=g.fillStyle;ln(g,4,14.5,11.5,3,'rgba(0,0,0,.5)',2.4);ln(g,4,14.5,11.5,3,'#c8a070',1.4);poly(g,[[9.4,2.2],[14.6,4.6],[14,9.8],[11.4,6.6]],f,'rgba(0,0,0,.5)',.5)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[8,1.5],[10,5],[9.2,9.5],[8,10.5],[6.8,9.5],[6,5]],f,S,.5);poly(g,[[6.6,9],[3.6,7.6],[2,4.6],[3.2,3.2],[4.6,5.4],[6.4,6.6]],f,S,.5);poly(g,[[9.4,9],[12.4,7.6],[14,4.6],[12.8,3.2],[11.4,5.4],[9.6,6.6]],f,S,.5);rrg(g,4.6,10,6.8,1.8,.5,f,S,.5);poly(g,[[7,11.8],[9,11.8],[9.6,14.6],[6.4,14.6]],f,S,.5)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[8,4.6],[11,6.2],[15,4.2],[13.6,7.4],[10.6,9],[9.6,12],[8,14.4],[6.4,12],[5.4,9],[2.4,7.4],[1,4.2],[5,6.2]],f,S,.5);circ(g,8,3.4,1.5,f,S,.5)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[8,1.2],[11.4,6.4],[12.4,10],[10.8,13.4],[8,14.8],[5.2,13.4],[3.6,10],[4.6,6.4],[6.4,8.6]],f,S,.5);poly(g,[[8,7.4],[9.8,10.4],[8,13.2],[6.2,10.4]],'rgba(0,0,0,.25)',null)},
 g=>{const f=g.fillStyle,S='rgba(0,0,0,.5)';poly(g,[[2.4,2],[13.6,2],[13.6,8],[8,14.6],[2.4,8]],f,S,.5);poly(g,[[2.4,9],[8,4.6],[13.6,9],[13.6,11],[8,6.8],[2.4,11]],'rgba(0,0,0,.28)',null)}];
const lighten=(c,k)=>{const h=hex(c);return '#'+h.map(v=>Math.round(v+(255-v)*k).toString(16).padStart(2,'0')).join('')};
function bannerPattern(g,W,H,p,c2){g.fillStyle=c2;g.beginPath();
 if(p===1)g.rect(W/2,0,W/2,H);else if(p===2){g.moveTo(0,H*.62);g.lineTo(W/2,H*.3);g.lineTo(W,H*.62);g.lineTo(W,H*.8);g.lineTo(W/2,H*.48);g.lineTo(0,H*.8)}
 else if(p===3){g.moveTo(0,H*.08);g.lineTo(W*.3,0);g.lineTo(W,H*.62);g.lineTo(W,H*.84)}else if(p===4){g.rect(0,0,W/2,H*.38);g.rect(W/2,H*.38,W/2,H)}
 else if(p===5)g.rect(0,H*.3,W,H*.2);else if(p===6){g.rect(0,0,W,H);g.rect(W*.16,H*.08,W*.68,H*.86)}else if(p===7){g.moveTo(0,0);g.lineTo(W*.18,0);g.lineTo(W,H*.72);g.lineTo(W,H*.88);g.closePath();g.moveTo(W,0);g.lineTo(W*.82,0);g.lineTo(0,H*.72);g.lineTo(0,H*.88);g.closePath()}
 if(p)g.fill(p===6?'evenodd':'nonzero')}
function drawBanner(){const g=BANNER.getContext('2d'),W=128,H=192,p=PAL[THEME.c][1],s=PAL[THEME.c][2];g.clearRect(0,0,W,H);g.lineJoin='round';
 const path=()=>{g.beginPath();g.moveTo(8,4);g.lineTo(W-8,4);g.lineTo(W-8,H-30);g.lineTo(W/2,H-58);g.lineTo(8,H-30);g.closePath()};
 path();const q=g.createLinearGradient(0,0,0,H);q.addColorStop(0,lighten(p,.22));q.addColorStop(1,p);g.fillStyle=q;g.fill();g.save();path();g.clip();bannerPattern(g,W,H,THEME.p|0,PAL[THEME.c2|0][1]);const sh=g.createLinearGradient(0,0,W,0);sh.addColorStop(0,'rgba(255,255,255,.12)');sh.addColorStop(.5,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.18)');g.fillStyle=sh;g.fillRect(0,0,W,H);g.restore();path();g.lineWidth=11;g.strokeStyle=s;g.stroke();g.lineWidth=2;g.strokeStyle='rgba(0,0,0,.4)';g.stroke();
 {const im=embImg(THEME.e|0,embMetal(THEME.c));g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(im,W/2-55,31,110,110)}
 {const rg=g.createLinearGradient(0,0,0,9);rg.addColorStop(0,'#fff1b0');rg.addColorStop(.5,'#c8922a');rg.addColorStop(1,'#7a5410');g.fillStyle=rg;g.fillRect(2,1,W-4,7);g.strokeStyle='#3a2406';g.lineWidth=1;g.strokeRect(2.5,1.5,W-5,6);
  for(const fx of[4,W-4]){const fg=g.createRadialGradient(fx-1.5,3,1,fx,4.5,5);fg.addColorStop(0,'#fff6c8');fg.addColorStop(1,'#a8741a');g.beginPath();g.arc(fx,4.5,4.6,0,6.283);g.fillStyle=fg;g.fill();g.stroke()}}}
function saveTheme(){try{localStorage.setItem('dk_theme',JSON.stringify(THEME))}catch(e){}}
function drawEmblem(x,y,s,e,col){ctx.save();ctx.translate(x,y);ctx.scale(s/16,s/16);ctx.fillStyle=col;EMB[e](ctx);ctx.restore()}
const EMBC={};const embMetal=c=>c===3||c===10||c===11?'s':'g';
function embImg(e,m){const k=e+m;if(EMBC[k])return EMBC[k];const N=128,c=cvs(N,N),q=c.getContext('2d');q.scale(N/20,N/20);q.translate(2,2);
 const gr=q.createLinearGradient(0,1,0,15);if(m==='s'){gr.addColorStop(0,'#ffffff');gr.addColorStop(.45,'#d6dce8');gr.addColorStop(.55,'#9aa4b8');gr.addColorStop(1,'#eef2f8')}else{gr.addColorStop(0,'#fff6c4');gr.addColorStop(.42,'#f2c64a');gr.addColorStop(.58,'#b8801a');gr.addColorStop(1,'#ffd860')}
 q.fillStyle=gr;q.lineJoin='round';EMB[e](q);
 const o=cvs(N,N),p=o.getContext('2d');p.drawImage(c,0,0);p.globalCompositeOperation='source-in';p.fillStyle=m==='s'?'#1c2232':'#3a2406';p.fillRect(0,0,N,N);
 const f=cvs(N,N),h=f.getContext('2d');h.shadowColor='rgba(0,0,0,.7)';h.shadowBlur=5;h.shadowOffsetY=4;for(const[dx,dy]of[[-2.5,0],[2.5,0],[0,-2.5],[0,2.5],[-1.8,-1.8],[1.8,1.8],[-1.8,1.8],[1.8,-1.8]])h.drawImage(o,dx,dy);h.shadowColor='transparent';h.drawImage(c,0,0);
 const hi=cvs(N,N),j=hi.getContext('2d');j.drawImage(c,0,-2.5);j.globalCompositeOperation='source-in';j.fillStyle='rgba(255,255,255,.55)';j.fillRect(0,0,N,N);j.globalCompositeOperation='destination-out';j.drawImage(c,0,1);
 h.globalCompositeOperation='source-atop';h.drawImage(hi,0,0);return EMBC[k]=f}
function drawEmblemR(x,y,s,e,c){const im=embImg(e,embMetal(c==null?THEME.c:c)),p=s*.125;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x-p,y-p,s+2*p,s+2*p)}
function shieldPath(x,y,w,h){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.lineTo(x+w,y+h*.52);ctx.quadraticCurveTo(x+w,y+h*.86,x+w/2,y+h);ctx.quadraticCurveTo(x,y+h*.86,x,y+h*.52);ctx.closePath()}
function shieldTile(x,y,s,inner){const w=s,h=s*1.12,y0=y-s*.06;ctx.save();ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=2;ctx.shadowOffsetY=1;shieldPath(x,y0,w,h);const c=PAL[THEME.c][1],q=ctx.createLinearGradient(x,y0,x+w,y0+h);q.addColorStop(0,lighten(c,.28));q.addColorStop(1,c);ctx.fillStyle=q;ctx.fill();ctx.restore();
 ctx.save();shieldPath(x,y0,w,h);ctx.clip();inner(x,y0,w,h);const sh=ctx.createLinearGradient(x,y0,x+w,y0);sh.addColorStop(0,'rgba(255,255,255,.16)');sh.addColorStop(.5,'rgba(255,255,255,0)');sh.addColorStop(1,'rgba(0,0,0,.2)');ctx.fillStyle=sh;ctx.fillRect(x,y0,w,h);ctx.restore();
 shieldPath(x+.6,y0+.6,w-1.2,h-1.2);const gr=ctx.createLinearGradient(0,y0,0,y0+h);gr.addColorStop(0,'#fff1b0');gr.addColorStop(.5,'#c89a2e');gr.addColorStop(1,'#f6d878');ctx.lineWidth=1.2;ctx.strokeStyle=gr;ctx.stroke();shieldPath(x,y0,w,h);ctx.lineWidth=.5;ctx.strokeStyle='rgba(20,12,0,.8)';ctx.stroke()}
function gemSwatch(x,y,s,col){ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=1.5;ctx.shadowOffsetY=.8;ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2-.3,0,6.283);const q=ctx.createRadialGradient(x+s*.36,y+s*.3,s*.05,x+s/2,y+s/2,s*.62);q.addColorStop(0,lighten(col,.6));q.addColorStop(.45,col);q.addColorStop(1,lighten(col,-.0)&&'#00000000'===''?col:col);ctx.fillStyle=q;ctx.fill();ctx.restore();
 ctx.beginPath();ctx.arc(x+s/2,y+s/2,s/2-.3,0,6.283);const d=ctx.createRadialGradient(x+s/2,y+s/2,s*.25,x+s/2,y+s/2,s*.52);d.addColorStop(0,'rgba(0,0,0,0)');d.addColorStop(1,'rgba(0,0,0,.38)');ctx.fillStyle=d;ctx.fill();
 ctx.lineWidth=.9;ctx.strokeStyle='#c99a3a';ctx.stroke();ctx.beginPath();ctx.ellipse(x+s*.38,y+s*.3,s*.15,s*.09,-.6,0,6.283);ctx.fillStyle='rgba(255,255,255,.6)';ctx.fill()}
thIcons();drawBanner();bannerTex.needsUpdate=true;
IC.gear=ICN(g=>{for(let k=0;k<8;k++){const a=k*Math.PI/4;ln(g,8+Math.cos(a)*4.5,8+Math.sin(a)*4.5,8+Math.cos(a)*7,8+Math.sin(a)*7,'#f6e9d2',2.6)}circ(g,8,8,5,'#f6e9d2','#2a303a',.8);circ(g,8,8,2,'#2a303a','#2a303a',.5)});IC.upgrade=ICN(g=>{poly(g,[[8,1.5],[14,8],[10,8],[10,14.5],[6,14.5],[6,8],[2,8]],'#ffd23c','#7a5a00',.9)});
