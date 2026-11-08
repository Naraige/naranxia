import { mkU } from '../gameplay/entities.js';
import { RS } from '../gameplay/rules.js';
import { FOWU } from './fog.js';
import { bxc, newG, toGeo } from './geometry.js';
import { matV } from './materials.js';
import { doorGeo } from './models/fortifications.js';
import { ballHead, GEO, sGeo, trebArm } from './models/structures.js';
import { sprites, vsp } from './models/unit-parts.js';
import { renderer, scene } from './scene.js';
import { unitG } from './terrain.js';
import { THREE } from './three.js';
import { animUnit, cannonG } from './unit-animation.js';
import { cvs } from '../ui/canvases.js';
import { arcIcon, ICO_N, ICO_RT } from '../ui/drawing.js';
import { IC } from '../ui/icons.js';

/* ---- 3D rendered UI icons ---- */
export let ICR=null;

export function icoInit(){const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x9a8a78,.85));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(-3,5,4);sc.add(dl);
 ICR={sc,cam:new THREE.PerspectiveCamera(28,1,.05,200),rt:new THREE.WebGLRenderTarget(ICO_RT,ICO_RT,{samples:4}),buf:new Uint8Array(ICO_RT*ICO_RT*4)}}

const icoMesh=(G)=>new THREE.Mesh(toGeo(G),matV);

const icoStd=(geo,c)=>new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color:c}));

export function icoUnit(type,t){const u=mkU(t||0,type,0,0);u.face=0;u.fa=0;u.hp=1;u.ttl=1;animUnit(u,.016,false,0);const g=u.m;scene.remove(g);unitG.delete(u);u.m=null;g.position.set(0,0,0);{const rm=[];g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')rm.push(o)});rm.forEach(o=>o.parent&&o.parent.remove(o))}const w=new THREE.Group();w.add(g);return w}

function icoStruct(type,m,tier,extra){const s={type,t:0,tier:tier==null?1:tier,sz:1};const w=new THREE.Group();const me=new THREE.Mesh(sGeo(s,m||0),matV);w.add(me);if(extra)extra(w);return w}

let ICOT=-1;
export const ICT=[{},{}],TIERK=new Set(['wall','gate','tower','barracks','path']);

function icoObj(k){
 switch(k){
 case 'peasant':case 'idle':return icoUnit('peasant');case 'knight':return icoUnit('knight');case 'archer':return icoUnit('archer');case 'bannerman':return icoUnit('bannerman');case 'captain':return icoUnit('captain');case 'scout':return icoUnit('scout');case 'engineer':return icoUnit('engineer');
 case 'skull':return icoUnit('zombie',1);
 case 'cannon':{const w=new THREE.Group(),m=new THREE.Mesh(GEO.cannonU||(GEO.cannonU=cannonG()),matV);m.rotation.y=-.5;w.add(m);return w}
 case 'wall':return icoStruct('wall',10,ICOT<0?(RS.done?1:0):ICOT);case 'tower':return icoStruct('tower',0,ICOT<0?(RS.done?1:0):ICOT);case 'barracks':return icoStruct('barracks',0,ICOT<0?(RS.done?1:0):ICOT);case 'farm':return icoStruct('farm',0,1);
 case 'gate':return icoStruct('gate',0,ICOT<0?(RS.done?1:0):ICOT,w=>{const d=new THREE.Mesh(GEO.door||(GEO.door=doorGeo()),matV);d.position.set(0,1.32,0);w.add(d)});
 case 'home':case 'castle':{const w=icoStruct('castle',0,RS.done?1:0);return w}
 case 'upgrade':{const w=new THREE.Group();const G=newG();for(let i=0;i<3;i++)for(let j=0;j<2;j++)bxc(G,-.5+i*.5,j*.32,0,.46,.3,.46,j%2?'#b9bcc8':'#9a9ba6');bxc(G,0,.64,0,.46,.3,.46,'#c7c9d4');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.3,.55,4),0xffd23c);c.position.set(0,1.28,0);w.add(c);return w}
 case 'ballista':return icoStruct('ballista',0,1,w=>{const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);w.add(h)});
 case 'trebuchet':return icoStruct('trebuchet',0,1,w=>{const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.y=.4;w.add(a)});
 case 'path':{const G=newG(),st=ICOT===1;for(let i=0;i<3;i++)for(let j=0;j<3;j++)bxc(G,(i-1)*.55,0,(j-1)*.55,.5,.12+((i+j)%2)*.03,.5,st?((i+j)%2?'#8e9098':'#a9abb3'):((i+j)%2?'#b08a58':'#c4a06a'));return icoMesh(G)}
 case 'raise':{const w=new THREE.Group();const G=newG();for(let i=0;i<2;i++)for(let j=0;j<2;j++)bxc(G,(i-.5)*.6,0,(j-.5)*.6,.58,.5,.58,'#8a6238'),bxc(G,(i-.5)*.6,.5,(j-.5)*.6,.58,.14,.58,'#5fae48');bxc(G,0,.64,0,.58,.5,.58,'#8a6238');bxc(G,0,1.14,0,.58,.14,.58,'#5fae48');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.32,.6,4),0xffd23c);c.position.set(0,1.9,0);w.add(c);return w}
 case 'dig':{const w=new THREE.Group();const G=newG();for(let i=0;i<3;i++)for(let j=0;j<3;j++){if(i===1&&j===1)continue;bxc(G,(i-1)*.5,0,(j-1)*.5,.48,.6,.48,'#8a6238');bxc(G,(i-1)*.5,.6,(j-1)*.5,.48,.14,.48,'#5fae48')}bxc(G,0,0,0,.48,.25,.48,'#5a3d1e');w.add(icoMesh(G));const c=icoStd(new THREE.ConeGeometry(.3,.6,4),0xffd23c);c.rotation.x=Math.PI;c.position.set(0,1.5,0);w.add(c);return w}
 case 'coin':{const G=newG();const ing=(x,y,z)=>{bxc(G,x,y,z,1.0,.3,.5,'#e8b820');bxc(G,x,y+.3,z,.8,.1,.34,'#ffe266');bxc(G,x-.38,y+.2,z+.18,.1,.06,.06,'#fff6c0')};ing(0,0,0);ing(.12,.4,-.05);return icoMesh(G)}
 case 'wood':{const G=newG();bxc(G,0,0,0,1,1,1,'#6b5030');bxc(G,0,1,0,.94,.02,.94,'#b8945f');bxc(G,0,1.02,0,.64,.02,.64,'#9a7a48');bxc(G,0,1.04,0,.3,.02,.3,'#b8945f');bxc(G,.2,.3,.51,.12,.4,.02,'#4f3a22');bxc(G,-.25,.55,.51,.1,.3,.02,'#4f3a22');return icoMesh(G)}
 case 'stone':{const G=newG();bxc(G,0,0,0,1,1,1,'#7f7f7f');[[-.25,.7,.51,.4,.22],[.22,.3,.51,.36,.26],[-.2,.12,.51,.3,.2]].forEach(([x,y,z,w,h],k)=>bxc(G,x,y,z,w,h,.02,k%2?'#9a9a9a':'#646464'));[[.51,.6,.2],[.51,.25,-.2]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.02,.26,.36,k?'#9a9a9a':'#646464'));[[0,1.01,.1],[.2,1.01,-.25]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.36,.02,.3,k?'#9a9a9a':'#646464'));return icoMesh(G)}
 case 'heart':{const G=newG();[[0,1,3],[-1,.4,1],[1,.4,1]].forEach(()=>0);const rows=['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'];rows.forEach((r,j)=>{for(let i=0;i<7;i++)if(r[i]==='X')bxc(G,(i-3)*.3,(5-j)*.3,0,.3,.3,.3,j<2&&i>0&&i<3&&j===0?'#ff9a9a':'#e03a4a')});return icoMesh(G)}
 case 'sword':{const G=newG();vsp(G,sprites().sword,0,0,0,.1);return icoMesh(G)}
 case 'hammer':{return icoObj('upgrade')}
 case 'army':{const w=new THREE.Group();[[-.9,0],[0,0],[.9,0]].forEach(([x,z],i)=>{const u=icoUnit('knight');u.position.set(x*.8,0,i===1?-.7:0);w.add(u)});return w}
 case 'group':{const w=new THREE.Group();[[-.8,0],[.8,0],[0,-.8]].forEach(([x,z])=>{const u=icoUnit('knight');u.position.set(x,0,z);w.add(u)});return w}
 case 'ungroup':{const w=new THREE.Group();[[-.9,0],[.9,0]].forEach(([x,z])=>{const u=icoUnit('knight');u.position.set(x,0,z);w.add(u)});return w}
 }return null}

export function icoShot(obj,yaw,pitch){const R=ICR,cam=R.cam;R.sc.add(obj);obj.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(obj),sp=bb.getBoundingSphere(new THREE.Sphere()),c=sp.center,r=Math.max(.01,sp.radius),d=r/Math.sin(cam.fov*Math.PI/360)*1.02;
 yaw=yaw==null?.6:yaw;pitch=pitch==null?.3:pitch;cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
 const oc=new THREE.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();const fw0=FOWU.fowP.value.w,fz0=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(R.rt);renderer.clear();renderer.render(R.sc,cam);renderer.readRenderTargetPixels(R.rt,0,0,ICO_RT,ICO_RT,R.buf);renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);FOWU.fowP.value.w=fw0;FOWU.fowP.value.z=fz0;R.sc.remove(obj);
 const N2=ICO_RT,cv2=cvs(N2,N2),g=cv2.getContext('2d'),im=g.createImageData(N2,N2);for(let y=0;y<N2;y++){const sy=N2-1-y;for(let x=0;x<N2;x++){const s=(sy*N2+x)*4,o=(y*N2+x)*4;im.data[o]=R.buf[s];im.data[o+1]=R.buf[s+1];im.data[o+2]=R.buf[s+2];im.data[o+3]=R.buf[s+3]}}g.putImageData(im,0,0);return arcIcon(cv2,ICO_N)}

export let icons3D = function icons3D(){try{if(!ICR)icoInit();const keys=['cannon','peasant','idle','knight','archer','bannerman','captain','scout','engineer','skull','wall','tower','gate','barracks','farm','home','upgrade','ballista','trebuchet','path','raise','dig','coin','wood','stone','heart','sword','army','group','ungroup'];
 for(const k of keys){const o=icoObj(k);if(!o)continue;const yaw=['coin','wood','stone','path','raise','dig','upgrade','heart','sword'].includes(k)?.5:.45;IC[k]=icoShot(o,k==='heart'?0:k==='sword'?Math.PI/2:yaw,k==='heart'||k==='sword'?0:.35)}IC.castle=IC.home;IC.hammer=IC.upgrade;
 try{for(const t of[0,1]){ICOT=t;for(const k of TIERK){const o=icoObj(k);if(o)ICT[t][k]=icoShot(o,k==='path'?.5:.45,.35)}}}finally{ICOT=-1}}catch(e){console.error('icons3D',e)}};

export function setIcons3DHandler(handler) {
  icons3D = handler;
}
