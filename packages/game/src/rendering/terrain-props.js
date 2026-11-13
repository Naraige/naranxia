import { fb, hs } from '../core/math.js';
import { rngf } from '../core/random.js';
import { TH, TW } from '../gameplay/rules.js';
import { blocksState } from './blocks.js';
import { bxc, newG, toGeo } from './geometry.js';
import { buildPropsB } from './terrain-props-blocks.js';
import { matV } from './materials.js';
import { scene, SHADOWS } from './scene.js';
import { THREE } from './three.js';
import { gOK } from '../world/routes.js';
import { CH, FLG, HT, LAND, occ, pth, stairs, ter, terrainState } from '../world/terrain-state.js';

/* ---- props (trees, rocks, gold, flowers) merged per chunk ---- */
const LEAF=[['#3f7f2a','#4a8e32','#336f22','#5a9c3a'],['#46862e','#549638','#3a7626','#62a442'],['#3a7a34','#468a3e','#2f6a2a','#56984a']],PINEC=[['#2f7a4a','#3d8f58','#276a3e','#4ea068'],['#2a6e48','#37835a','#215c3a','#46966a']],BIRCH=['#a8c85a','#bcd86a','#92b04a','#d0e684'];


function forestGeo(v){const G=newG(),R=rngf(v*389+17),L=LEAF[v%3],T='#5b4326';bxc(G,0,0,0,.3,.6,.3,T);bxc(G,.02,.2,.151,.1,.12,.02,'#4a361e');
 const lc=()=>[L[0],L[1],L[2],L[0]][(R()*4)|0];for(const[a,b]of[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]]){bxc(G,a,.55,b,.5,.5,.5,lc());if(R()<.78)bxc(G,a,1.05,b,.5,.5,.5,lc())}
 if(v>=1){bxc(G,0,1.55,0,.5,.5,.5,lc())}if(v===2){bxc(G,.25,1.55,-.25,.5,.25,.5,lc())}if(v>=3){bxc(G,-.25,1.55,.25,.5,.5,.5,lc());bxc(G,.25,1.55,.25,.5,.25,.5,lc())}
 if(v%2&&R()<.5)bxc(G,.26,.8,.51,.08,.08,.02,'#c8282a');return toGeo(G)}

export let FOR;

/* ---- Minecraft-style props: everything built from .3 cubes ---- */
const MC_=.3;

function mcLeaves(G,R,cols,layers,s){layers.forEach(([y,pat])=>{const cells=pat==='sq'?[[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]]:pat==='plus'?[[0,0],[1,0],[-1,0],[0,1],[0,-1]]:[[0,0]];
  cells.forEach(([a,b])=>{if(pat==='sq'&&a&&b&&R()<.22)return;bxc(G,a*MC_*s,y*s,b*MC_*s,MC_*s*1.02,MC_*s*1.02,MC_*s*1.02,cols[(R()*cols.length)|0])})})}

function oakGeo(v){const G=newG(),R=rngf(v*977+13),L=LEAF[v%3],s=.95+(v>>1)*.1;
 for(let k=0;k<3;k++)bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,k%2?'#6b4a2a':'#5b3f22');
 mcLeaves(G,R,[L[0],L[1],L[2]],[[.6,'sq'],[.9,'sq'],[1.2,'plus'],[1.5,'one']],s);
 if(v%3===1)[[.3,.9,.45],[-.35,.6,.42]].forEach(([x,y,z])=>bxc(G,x*s,y*s,z*s,.1,.1,.1,'#e04a3a'));return toGeo(G)}

function pineGeo(v){const G=newG(),R=rngf(v*733+5),L=PINEC[v%2],s=.95+(v>>1)*.15;
 for(let k=0;k<4;k++)bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,k%2?'#4f3418':'#3f2a14');
 mcLeaves(G,R,[L[0],L[1],L[2]],[[.45,'sq'],[.75,'plus'],[1.05,'sq'],[1.35,'plus'],[1.65,'one'],[1.95,'one']],s);
 if(v>1)[[1.65,0,0],[1.35,.3,0],[1.35,-.3,0]].forEach(([y,x,z])=>bxc(G,x*s,(y+.27)*s,z*s,.2,.06,.2,'#eef4f2'));return toGeo(G)}

function birchGeo(v){const G=newG(),R=rngf(v*511+3),s=.95+v*.1;
 for(let k=0;k<4;k++){bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,'#e8e4d8');if(k%2===0)bxc(G,.03,k*MC_*s+.05,MC_*s/2,.12,.06,.03,'#2a2a2a')}
 mcLeaves(G,R,[BIRCH[0],BIRCH[1],BIRCH[2]],[[.9,'sq'],[1.2,'sq'],[1.5,'plus'],[1.8,'one']],s);return toGeo(G)}

function rockGeo(v){const G=newG(),C=[['#9aa1ac','#a9b0bb','#7e8590'],['#868d98','#9ea5b0','#6a717e'],['#a8aeb8','#b8bec8','#8c929e'],['#707784','#868d9a','#5a606c'],['#9c9a92','#adab9f','#7f7d74'],['#8a9098','#9aa0aa','#6f757f']][v%6];
 bxc(G,0,0,0,.75,.4,.75,C[0]);bxc(G,.18,.4,.1,.42,.3,.42,C[1]);bxc(G,-.25,0,-.3,.34,.3,.34,C[2]);if(v%2)bxc(G,-.28,.3,-.28,.2,.14,.2,C[0]);bxc(G,-.3,.4,.2,.2,.08,.22,'#5d8a4a');
 [[.2,.2,.38],[-.2,.1,.38],[.38,.25,-.1]].forEach(([x,y,z])=>bxc(G,x,y,z,.14,.14,.05,C[2]));return toGeo(G)}

function goldGeo(_v){const G=newG();bxc(G,0,0,0,.8,.8,.8,'#7d7d7d');
 [[-.2,.2,.41],[.2,.5,.41],[0,.62,.41],[.41,.3,-.1],[.41,.55,.2],[-.41,.4,.0],[-.15,.82,.1],[.1,.82,-.2],[-.1,.1,-.41],[.25,.35,-.41]].forEach(([x,y,z],k)=>{const q=k%3?.18:.24;bxc(G,x,y,z,Math.abs(x)>.4?.06:q,q,Math.abs(z)>.4?.06:q,k%2?'#ffd23c':'#f0b020')});
 bxc(G,0,.8,0,.5,.04,.5,'#8d8d8d');return toGeo(G)}

export let VAR;

/* decor (grass-level, non blocking) */
function bushGeo(v){const G=newG(),L=LEAF[v%3];bxc(G,0,0,0,.44,.38,.44,L[0]);bxc(G,.12,.2,.12,.22,.22,.22,L[1]);bxc(G,-.14,.06,-.1,.2,.2,.2,L[2]);if(v%2)[[.18,.3,.22],[-.2,.22,.16],[.1,.12,-.23]].forEach(([x,y,z])=>bxc(G,x,y,z,.06,.06,.06,'#c8282a'));return toGeo(G)}

function flowerGeo(v){const G=newG(),C=[['#f0f0e8','#e8c020'],['#f0d020','#e8a010'],['#c8282a','#2a2a2a'],['#4a6ad8','#2a3a8a'],['#b060d8','#7a2a9a']][v%5];[[0,0],[.2,.14],[-.16,.12]].forEach(([x,z],k)=>{const h=.18+.05*(k%2);bxc(G,x,0,z,.03,h,.03,'#3f7f2a');bxc(G,x+.04,h*.4,z,.06,.03,.03,'#4a8e32');bxc(G,x,h,z,.1,.08,.1,C[0]);bxc(G,x,h+.03,z,.04,.06,.04,C[1])});return toGeo(G)}

function tuftGeo(_v){const G=newG(),c=['#4a8e32','#5a9c3a','#3f7f2a'];[[0,0,.32],[.07,.05,.24],[-.07,.04,.28],[.03,-.07,.22],[-.04,-.06,.2],[.1,-.02,.18]].forEach(([x,z,h],k)=>bxc(G,x,0,z,.03,h,.03,c[k%3]));return toGeo(G)}

function mushGeo(_v){const G=newG();bxc(G,0,0,0,.06,.12,.06,'#e8e0d0');bxc(G,0,.12,0,.18,.08,.18,'#c8282a');[[.05,.2,.05],[-.05,.2,-.04]].forEach(([x,y,z])=>bxc(G,x,y,z,.04,.01,.04,'#ffffff'));bxc(G,.15,0,.1,.04,.08,.04,'#e8e0d0');bxc(G,.15,.08,.1,.1,.04,.1,'#9a6a4a');return toGeo(G)}

function reedGeo(_v){const G=newG();[[0,0,.75],[.11,.06,.9],[-.09,.08,.6]].forEach(([x,z,h])=>{for(let y=0;y<h;y+=.15){bxc(G,x,y,z,.05,.14,.05,'#94c86a');bxc(G,x,y+.13,z,.06,.02,.06,'#6a9a48')}bxc(G,x+.04,h*.6,z,.06,.02,.03,'#a8d878')});return toGeo(G)}

function logGeo(_v){const G=newG();bxc(G,0,0,0,.8,.24,.24,'#5b4326');bxc(G,.4,0,0,.02,.24,.24,'#a88a52');bxc(G,-.4,0,0,.02,.24,.24,'#a88a52');bxc(G,.4,.08,0,.025,.08,.08,'#8a6a3a');bxc(G,-.1,.24,.02,.2,.03,.14,'#4a8e32');return toGeo(G)}

export let DEC;

function mergeVar(G,geo,x,y,z,rk,sc,sy){const p=geo.attributes.position.array,n=geo.attributes.normal.array,c=geo.attributes.color.array,ix=geo.index.array,o=G.P.length/3,cs=[1,0,-1,0][rk],sn=[0,1,0,-1][rk];
 for(let k=0;k<p.length;k+=3){const px=p[k]*sc,pz=p[k+2]*sc;G.P.push(x+px*cs+pz*sn,y+p[k+1]*sy,z-px*sn+pz*cs);G.N.push(n[k]*cs+n[k+2]*sn,n[k+1],-n[k]*sn+n[k+2]*cs);G.C.push(c[k],c[k+1],c[k+2])}
 for(let k=0;k<ix.length;k++)G.I.push(ix[k]+o)}




export function buildProps(cx,cy){if(blocksState.D)return buildPropsB(cx,cy);const G=newG(),x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x,v=ter[i],h=hs(x,y,4),hh=HT[i],al=hh-LAND;
  if(v===0){if(pth[i]||occ.has(i)||stairs.has(i)||hh<LAND)continue;const q=hs(x,y,201);if(q>.07)continue;
   const jx0=(hs(x,y,61)-.5)*.5,jy0=(hs(x,y,62)-.5)*.5,rk0=(hs(x,y,63)*4)|0,wet=ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1;
   if(wet){if(q<.05)mergeVar(G,DEC.r[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1+hs(x,y,66)*.6);continue}if(FLG[i]&12)continue;
   if(al>=9||FLG[i]&1)continue;
   if(q<.022)mergeVar(G,DEC.f[(hs(x,y,202)*5)|0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   else if(q<.04)mergeVar(G,DEC.t[(hs(x,y,203)*2)|0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1+hs(x,y,67)*.5);
   else if(q<.056)mergeVar(G,DEC.b[(hs(x,y,204)*3)|0],x+.5+jx0*.6,hh,y+.5+jy0*.6,rk0,.9+hs(x,y,68)*.4,.9+hs(x,y,69)*.4);
   else if(q<.062)mergeVar(G,DEC.m[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   else if(q<.066&&fb(x*.03,y*.03,terrainState.SEED+88)>.5)mergeVar(G,DEC.l[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   continue}
  if(v===1||v===5)continue;
  const jx=(hs(x,y,61)-.5)*.3,jy=(hs(x,y,62)-.5)*.3,rk=(hs(x,y,63)*4)|0,sc=.85+hs(x,y,65)*.3,sy=sc*(.9+hs(x,y,64)*.25);
  if(v===2){let nb=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&gOK(x+dx,y+dy)&&ter[i+dy*TW+dx]===2)nb++;
   if(nb>=3)mergeVar(G,FOR[(h*6)|0],x+.5,hh,y+.5,(hs(x,y,63)*4)|0,1,1);else mergeVar(G,VAR.t[0],x+.5,hh,y+.5,0,1,1)}
  else if(v===3)mergeVar(G,VAR.r[(hs(x,y,6)*6)|0],x+.5+jx,hh,y+.5+jy,rk,sc,sy);
  else mergeVar(G,VAR.g[(hs(x,y,8)*3)|0],x+.5+jx,hh,y+.5+jy,rk,1,1)}
 if(!G.P.length)return null;const m=new THREE.Mesh(toGeo(G),matV);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);return m}

export function initializeTerrainProps() {
  FOR = [0,1,2,3,4,5].map(forestGeo);
  VAR = {t:[0,1,2,3,4,5].map(oakGeo).concat([0,1,2,3].map(pineGeo)).concat([0,1,2].map(birchGeo)),r:[0,1,2,3,4,5].map(rockGeo),g:[0,1,2].map(goldGeo)};
  DEC = {b:[0,1,2].map(bushGeo),f:[0,1,2,3,4].map(flowerGeo),t:[0,1].map(tuftGeo),m:[mushGeo(0)],r:[reedGeo(0)],l:[logGeo(0)]};


}
