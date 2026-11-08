import { selH } from '../ai/kingdoms.js';
import { GROWT, SAPL } from '../ai/workplaces.js';
import { rngf } from '../core/random.js';
import { constructionState, tilesFor } from '../gameplay/construction.js';
import { HOMEC, stoneOn } from '../gameplay/players.js';
import { ROTT, TH, TS, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { fowSeenAt } from './fog.js';
import { bxc, newG, quad, shade, toGeo } from './geometry.js';
import { matV } from './materials.js';
import { ballHead, GEO, trebArm, trebBase, trebCW } from './models/structures.js';
import { CAM, scene, SHADOWS } from './scene.js';
import { buildStructMesh0, structuresState } from './structures.js';
import { DIRT, dirtyT, GRASS } from './terrain.js';
import { THREE } from './three.js';
import { cvs } from '../ui/canvases.js';
import { D4, gOK } from '../world/routes.js';
import { CH, genF, HT, LAND, NCX } from '../world/terrain.js';

export const buildPreviewState = {
  GHO: null,
};

/* ---- ghost (build preview) ---- */
let cubeG2;

export const GBM=new Set(['wall','gate','tower','barracks','farm','storage','house','academy','market','forester','guild','observatory','granary','bell','sanctuary','beacon','orchard','forge','embassy','warroom','sappers','torch','movec']);

function mkGB(solid){const g=new THREE.Group();g.visible=false;scene.add(g);return{g,key:'',solid,mat:solid?matV:new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.62,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-3})}}

export let GB1;
export let GB2;
export let GB3;

/* ---- transparent previews of what will be built: terrain blocks, ramps, paths, siege weapons, stone upgrades ---- */
export let TGH = null;
export let GBW = null;
let GBWK = '';
const TGEO={};

function tgBlock(G,y0,y1,top,side){const s=shade(side,.9),s2=shade(side,.72);quad(G,[0,y1,0],[0,y1,1],[1,y1,1],[1,y1,0],[0,1,0],top,top,top,top);
 quad(G,[1,y0,0],[1,y1,0],[1,y1,1],[1,y0,1],[1,0,0],s2,s,s,s2);quad(G,[0,y0,1],[0,y1,1],[0,y1,0],[0,y0,0],[-1,0,0],s2,s,s,s2);
 quad(G,[1,y0,1],[1,y1,1],[0,y1,1],[0,y0,1],[0,0,1],s2,s,s,s2);quad(G,[0,y0,0],[0,y1,0],[1,y1,0],[1,y0,0],[0,0,-1],s2,s,s,s2);quad(G,[0,y0,0],[1,y0,0],[1,y0,1],[0,y0,1],[0,-1,0],s2,s2,s2,s2)}

function tgRamp(G,d){const[dx,dy]=D4[d],ax=dx?0:1,sg=(dx+dy)>0,ns=2,st=.5,c=GRASS,rc=DIRT,gc=shade(c,.88),r7=shade(rc,.75);
 for(let k=0;k<ns;k++){const u0=k/ns,u1=(k+1)/ns,yt=(k+1)*st,yb=yt-st,p0=sg?u0:1-u1,p1=sg?u1:1-u0,ck=shade(c,.96+.04*(k&1));
  if(ax===0){quad(G,[p0,yt,0],[p0,yt,1],[p1,yt,1],[p1,yt,0],[0,1,0],ck,ck,ck,ck);const rx=sg?p0:p1;
   if(sg)quad(G,[rx,yb,1],[rx,yt,1],[rx,yt,0],[rx,yb,0],[-1,0,0],r7,gc,gc,r7);else quad(G,[rx,yb,0],[rx,yt,0],[rx,yt,1],[rx,yb,1],[1,0,0],r7,gc,gc,r7);
   quad(G,[p1,0,1],[p1,yt,1],[p0,yt,1],[p0,0,1],[0,0,1],rc,rc,rc,rc);quad(G,[p0,0,0],[p0,yt,0],[p1,yt,0],[p1,0,0],[0,0,-1],rc,rc,rc,rc)}
  else{quad(G,[0,yt,p0],[0,yt,p1],[1,yt,p1],[1,yt,p0],[0,1,0],ck,ck,ck,ck);const rz=sg?p0:p1;
   if(sg)quad(G,[0,yb,rz],[0,yt,rz],[1,yt,rz],[1,yb,rz],[0,0,-1],r7,gc,gc,r7);else quad(G,[1,yb,rz],[1,yt,rz],[0,yt,rz],[0,yb,rz],[0,0,1],r7,gc,gc,r7);
   quad(G,[1,0,p0],[1,yt,p0],[1,yt,p1],[1,0,p1],[1,0,0],rc,rc,rc,rc);quad(G,[0,0,p1],[0,yt,p1],[0,yt,p0],[0,0,p0],[-1,0,0],rc,rc,rc,rc)}}
 const s=shade(rc,.85);if(ax===0){if(sg)quad(G,[1,0,0],[1,1,0],[1,1,1],[1,0,1],[1,0,0],s,s,s,s);else quad(G,[0,0,1],[0,1,1],[0,1,0],[0,0,0],[-1,0,0],s,s,s,s)}
 else{if(sg)quad(G,[1,0,1],[1,1,1],[0,1,1],[0,0,1],[0,0,1],s,s,s,s);else quad(G,[0,0,0],[0,1,0],[1,1,0],[1,0,0],[0,0,-1],s,s,s,s)}}

function tgGeo(k){let q=TGEO[k];if(q)return q;const G=newG();
 if(k==='block')tgBlock(G,0,1,GRASS,DIRT);else if(k==='path1'||k==='path2'){const c=k==='path2'?[.56,.56,.57]:[.6,.49,.3];tgBlock(G,0,.08,c,shade(c,.8))}else tgRamp(G,+k.slice(4));
 return TGEO[k]=toGeo(G)}

export function tgShow(k,x,y,z,good,sc,front){if(!TGH){TGH=new THREE.Mesh(tgGeo('block'),new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.6,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}));TGH.renderOrder=5;scene.add(TGH)}
 TGH.geometry=tgGeo(k);TGH.position.set(x,y,z);TGH.scale.setScalar(sc||1);TGH.material.color.set(front?(good?0xffc27a:0xff6060):good?0xa6ffb4:0xff8686);TGH.material.depthTest=!front;TGH.material.side=front?THREE.BackSide:THREE.FrontSide;TGH.visible=true}

export function gbwShow(type,o,aim,good){if(!GBW){GBW=new THREE.Group();GBW.userData.mat=new THREE.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.7,depthWrite:false,depthTest:false});scene.add(GBW)}const M=GBW.userData.mat;
 if(GBWK!==type){GBWK=type;while(GBW.children.length)GBW.remove(GBW.children[0]);
  if(type==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),M);h.scale.setScalar(.82);h.position.set(0,3.58,0);GBW.add(h);GBW.userData.rot=h}
  else{const wg=new THREE.Group();wg.scale.setScalar(.4);wg.position.set(-.4,3.28,-.4);wg.add(new THREE.Mesh(GEO.tb||(GEO.tb=trebBase()),M));const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),M);a.position.set(1,1.78,1);a.rotation.order='YXZ';wg.add(a);const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),M);cw.position.set(0,0,-.86);a.add(cw);GBW.add(wg);GBW.userData.rot=a}}
 GBW.traverse(m=>{if(m.isMesh)m.renderOrder=7});GBW.userData.rot.rotation.y=aim;GBW.position.set(o.tx+.5,o.bh||HT[o.ty*TW+o.tx],o.ty+.5);M.color.set(good?0xa6ffb4:0xff8686);GBW.visible=true}


export function ghostMake(G,type,tx,ty,ax,good,alpha){const sz=type==='castle'?5:(type==='tower'||type==='barracks'||type==='farm'||type==='storage'||type==='house'||type==='academy'||type==='market'||type==='forester'||type==='guild'||type==='observatory'||type==='granary'||type==='bell'||type==='sanctuary'||type==='beacon'||type==='orchard'||type==='forge'||type==='embassy'||type==='warroom'||type==='sappers'||type==='keep')?2:1,wd=!(stoneOn()&&(type==='barracks'||type==='wall'||type==='gate'||type==='tower')),tier=buildPreviewState.GHO?buildPreviewState.GHO.tier:wd?0:1,gl=buildPreviewState.GHO?buildPreviewState.GHO.gl:constructionState.gateLen,rot=buildPreviewState.GHO?buildPreviewState.GHO.rot:type==='castle'?(HOMEC()?HOMEC().rot|0:0):ROTT.has(type)?constructionState.buildRot&3:0,key=type+'|'+tx+','+ty+'|'+(ax|0)+'|'+tier+'|'+gl+'|'+rot;
 if(G.key!==key){G.key=key;const s={t:0,type,tier,sz,tx,ty,ax:ax||0,gl,rot,tiles:tilesFor(type,tx,ty,sz,ax,gl),hp:1,max:1,prog:1,ci:0,x:(tx+(type==='gate'?(ax?.5:gl/2):sz/2))*TS,y:(ty+(type==='gate'?(ax?gl/2:.5):sz/2))*TS};
  while(G.g.children.length)G.g.remove(G.g.children[0]);s.o3=G.g;G.g.scale.set(1,1,1);structuresState.BPLOFF=true;try{buildStructMesh0(s)}finally{structuresState.BPLOFF=false}
  if(!G.solid)G.g.traverse(o=>{if(o.isMesh)o.material=G.mat})}
 if(!G.solid){G.mat.color.set(good?0xa6ffb4:0xff8686);G.mat.opacity=alpha||.62}G.g.visible=true}

export const rampPool=[];
export function rampBox(i,x,y,z,sx,sy,sz,good){let m=rampPool[i];if(!m){m=new THREE.Mesh(cubeG2,new THREE.MeshBasicMaterial({transparent:true,opacity:.8,depthWrite:false,depthTest:false}));m.renderOrder=6;scene.add(m);rampPool[i]=m}m.material.color.set(good?0x2bff6a:0xff4444);m.scale.set(sx*.96,sy,sz*.96);m.position.set(x,y,z);m.visible=true}

/* Minecraft block-breaking cracks on the resource a peasant is working */
let CRKT;
let CRKG;
export const CRKP = [];

let SAPM;

export function saplRender(){let n=0;if(SAPL.size){const R=(CAM.dist*1.7+26),q=new THREE.Object3D();for(const[i,v]of SAPL){const x=i%TW,y=(i/TW)|0;if(Math.abs(x-CAM.x)>R||Math.abs(y-CAM.z)>R)continue;
  if(!fowSeenAt((x+.5)*TS,(y+.5)*TS))continue;const p=Math.min(1,(sessionState.time-v.t)/GROWT),s=.45+p*.95;q.position.set(x+.5+(((i*37)%7)-3)*.03,HT[i],y+.5+(((i*53)%7)-3)*.03);q.rotation.set(0,(i%8)*.7,0);q.scale.set(s,s,s);q.updateMatrix();SAPM.setMatrixAt(n++,q.matrix);if(n>=1024)break}}
 SAPM.count=n;if(n)SAPM.instanceMatrix.needsUpdate=true}

export function crackAt(i,x,y,z,sx,sy,sz,st){let m=CRKP[i];if(!m){m=new THREE.Mesh(CRKG,new THREE.MeshBasicMaterial({map:CRKT[0],transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.renderOrder=3;scene.add(m);CRKP[i]=m}if(m.material.map!==CRKT[st])m.material.map=CRKT[st];m.scale.set(sx,sy,sz);m.position.set(x,y,z);m.visible=true}

/* green overlay: where the castle may be founded / moved */
let GOVM;
let GOVE;
const GOV = {m:null,e:null,key:'',t:0};

export function govBuild(key,cx,cy,R,ok){GOVM.opacity=.42+.14*Math.sin(sessionState.clockT*3.2);const vis=()=>{if(GOV.m)GOV.m.visible=true;if(GOV.e)GOV.e.visible=true};if(GOV.key===key){vis();return}if(sessionState.clockT-GOV.t<.35&&GOV.m&&GOV.key.split('|')[0]===key.split('|')[0]){vis();return}GOV.key=key;GOV.t=sessionState.clockT;
 for(const q of['m','e'])if(GOV[q]){scene.remove(GOV[q]);GOV[q].geometry.dispose();GOV[q]=null}
 const S=2*R+1,V=new Uint8Array(S*S),at=(x,y)=>{const i=x-(cx-R),j=y-(cy-R);return i<0||j<0||i>=S||j>=S?0:V[j*S+i]};
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++)if(gOK(x,y)&&genF[((y/CH)|0)*NCX+((x/CH)|0)]&&ok(x,y))V[(y-cy+R)*S+(x-cx+R)]=1;
 const P=[],I=[],PE=[],IE=[];let n=0,ne=0;const eq=(ax,az,bx,bz,h)=>{PE.push(ax,h,az,ax,h+.22,az,bx,h+.22,bz,bx,h,bz);IE.push(ne,ne+1,ne+2,ne,ne+2,ne+3);ne+=4};
 for(let y=cy-R;y<=cy+R;y++)for(let x=cx-R;x<=cx+R;x++){if(!at(x,y))continue;const h=HT[y*TW+x]+.06;P.push(x,h,y,x,h,y+1,x+1,h,y+1,x+1,h,y);I.push(n,n+1,n+2,n,n+2,n+3);n+=4;
  if(!at(x,y-1))eq(x,y,x+1,y,h);if(!at(x,y+1))eq(x,y+1,x+1,y+1,h);if(!at(x-1,y))eq(x,y,x,y+1,h);if(!at(x+1,y))eq(x+1,y,x+1,y+1,h)}
 if(!n)return;const mk=(P,I,M)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeBoundingSphere();const m=new THREE.Mesh(g,M);m.renderOrder=2;m.frustumCulled=false;scene.add(m);return m};
 GOV.m=mk(P,I,GOVM);if(ne)GOV.e=mk(PE,IE,GOVE)}

export function govHide(){if(GOV.m)GOV.m.visible=false;if(GOV.e)GOV.e.visible=false}

let MCBOX;
export let MCSEL;
export let MCHOV;

export let ghost;
export const SCAF=new Set(),SGEO={};
export let selRing;

/* reach of the selected tower or castle: a ring laid on the ground (seen through hills), an inner one for the trebuchet's dead zone */
let SELRG;

export function selRangeShow(sb,rg){if(!sb||!rg){SELRG.o.visible=SELRG.i.visible=false;return}const key=sb.sid+'|'+rg.r+'|'+(rg.min||0)+'|'+sb.x+','+sb.y+'|'+(dirtyT.size?SELRG.key:'');
 if(key!==SELRG.key){SELRG.key=key;const put=(M,r)=>{const P=M.geometry.attributes.position,w=Math.max(.22,r*.018);for(let k=0;k<=128;k++){const a=k/128*6.2832,c=Math.cos(a),sn=Math.sin(a);for(let e=0;e<2;e++){const rr=r+(e?w:-w),x=sb.x/TS+c*rr,z=sb.y/TS+sn*rr,tx=Math.max(0,Math.min(TW-1,Math.floor(x))),tz=Math.max(0,Math.min(TH-1,Math.floor(z)));P.setXYZ(k*2+e,x,(HT[tz*TW+tx]||LAND)+.35,z)}}P.needsUpdate=true;M.geometry.computeBoundingSphere()};put(SELRG.o,rg.r);if(rg.min)put(SELRG.i,rg.min)}
 SELRG.o.visible=true;SELRG.i.visible=!!rg.min}

/* outlines for the other buildings of a double-click group */
const MCSELP=[];
export function groupBoxes(L,sb){let n=0;for(const s of L){if(s===sb)continue;let m=MCSELP[n];if(!m){m=new THREE.LineSegments(MCBOX,MCSEL.material);scene.add(m);MCSELP[n]=m}n++;const H=selH(s),w=s.type==='gate'?(s.ax?1:(s.gl||2)):s.sz,d=s.type==='gate'?(s.ax?(s.gl||2):1):s.sz;m.position.set(s.x/TS,s.bh||LAND,s.y/TS);m.scale.set(w+.04,H,d+.04);m.visible=true}for(let k=n;k<MCSELP.length;k++)MCSELP[k].visible=false}

export let rangeRing;

export function initializeBuildPreview() {
  cubeG2 = new THREE.BoxGeometry(1,1,1);
  GB1 = mkGB(false);
  GB2 = mkGB(true);
  GB3 = mkGB(true);
  CRKT = (()=>{const R=rngf(77),pts=[];let x=8,y=8;for(let k=0;k<70;k++){pts.push([x,y]);const d=(R()*4)|0;x=Math.max(0,Math.min(15,x+[1,-1,0,0][d]));y=Math.max(0,Math.min(15,y+[0,0,1,-1][d]));if(R()<.12){x=(R()*16)|0;y=(R()*16)|0}}
   const T=[];for(let s=0;s<10;s++){const c=cvs(16,16),g=c.getContext('2d');const n=Math.round((s+1)/10*pts.length);g.fillStyle='rgba(0,0,0,.6)';for(let k=0;k<n;k++)g.fillRect(pts[k][0],pts[k][1],1,1);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;T.push(t)}return T})();
  CRKG = (()=>{const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);return g})();
  SAPM = (()=>{const G=newG();bxc(G,0,0,0,.07,.42,.07,'#6b4a2c');bxc(G,0,.3,0,.3,.22,.3,'#4f9a3c');bxc(G,0,.5,0,.2,.16,.2,'#62b148');bxc(G,.1,.22,.05,.12,.1,.12,'#5aa842');bxc(G,-.09,.36,-.06,.11,.1,.11,'#4a9238');
   const m=new THREE.InstancedMesh(toGeo(G),matV,1024);m.frustumCulled=false;m.count=0;m.castShadow=SHADOWS;scene.add(m);return m})();
  GOVM = new THREE.MeshBasicMaterial({color:0xd8ff5a,transparent:true,opacity:.42,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,side:THREE.DoubleSide});
  GOVE = new THREE.MeshBasicMaterial({color:0xf2ffd8,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide});
  MCBOX = (()=>{const g=new THREE.BoxGeometry(1,1,1);g.translate(0,.5,0);return new THREE.EdgesGeometry(g)})();
  MCSEL = new THREE.LineSegments(MCBOX,new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.75}));
  MCHOV = new THREE.LineSegments(MCBOX,new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity:.55}));
  MCSEL.visible=MCHOV.visible=false;
  scene.add(MCSEL,MCHOV);
  ghost = new THREE.Mesh(cubeG2,new THREE.MeshBasicMaterial({color:0x66ff66,transparent:true,opacity:.45,depthWrite:false}));
  ghost.visible=false;
  scene.add(ghost);
  selRing = new THREE.Mesh(new THREE.RingGeometry(1,1.14,48),new THREE.MeshBasicMaterial({color:0xffd23c,side:THREE.DoubleSide,transparent:true,opacity:.9,depthWrite:false}));
  selRing.rotation.x=-Math.PI/2;
  selRing.visible=false;
  scene.add(selRing);
  SELRG = (()=>{const mk=c=>{const g=new THREE.BufferGeometry(),N=129;g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(N*2*3),3));const ix=[];for(let k=0;k<N-1;k++){const a=k*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(ix);
    const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.75,depthTest:false,depthWrite:false,side:THREE.DoubleSide}));m.renderOrder=8;m.visible=false;m.frustumCulled=false;scene.add(m);return m};return{o:mk(0xffd84a),i:mk(0xff7a4a),key:''}})();
  rangeRing = (()=>{const pts=[];for(let i=0;i<=64;i++)pts.push(new THREE.Vector3(Math.cos(i/64*6.2832)*7.5,0,Math.sin(i/64*6.2832)*7.5));return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.6}))})();
  rangeRing.visible=false;
  scene.add(rangeRing);
}
