import { fb, hs } from '../core/math.js';
import { reset } from '../gameplay/reset.js';
import { TH, TW } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { inputState } from '../input/state.js';
import { bxc, newG, toGeo } from './geometry.js';
import { pkLiveFocus } from './live-site-preview.js';
import { matV } from './materials.js';
import { renderer, scene } from './scene.js';
import { buildChunk } from './terrain.js';
import { buildProps, VAR } from './terrain-props.js';
import { THREE } from './three.js';
import { cv } from '../ui/canvases.js';
import { hudState, inR } from '../ui/hud.js';
import { buildPreview, pvH, PVH, PVS, pvW, PVW, siteMaskGet, siteOK, sitePickerState } from '../ui/site-picker.js';
import { BED, CH, genChunk, LAND, NCX, NCY, ROCKH, SNOW, terrainState, WLV } from '../world/terrain.js';

/* ---- 3D castle site picker ---- */
export let PK=null;
export const PKS=.25,PKU=.5;

export function pkInit(){const sc=new THREE.Scene();sc.background=new THREE.Color(0x9ccaf0);sc.fog=new THREE.Fog(0x9ccaf0,260,1100);
 sc.add(new THREE.HemisphereLight(0xffffff,0x6a7a60,.85));const dl=new THREE.DirectionalLight(0xfff2d8,.85);dl.position.set(-200,300,150);sc.add(dl);
 const cam=new THREE.PerspectiveCamera(45,1,1,4000);
 const cg=new THREE.ConeGeometry(3,10,12);cg.rotateX(Math.PI);cg.translate(0,5,0);const hov=new THREE.Mesh(cg,new THREE.MeshBasicMaterial({color:0x6fe08a}));hov.visible=false;sc.add(hov);
 const mark=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(6,10,6),new THREE.MeshLambertMaterial({color:0xffd23c}));b.position.y=5;mark.add(b);const bm=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,60,8),new THREE.MeshBasicMaterial({color:0xffe27a,transparent:true,opacity:.55}));bm.position.y=30;mark.add(bm);
 const rg=new THREE.Mesh(new THREE.RingGeometry(10,12,40),new THREE.MeshBasicMaterial({color:0xffd23c,side:THREE.DoubleSide}));rg.rotation.x=-Math.PI/2;rg.position.y=.5;mark.add(rg);mark.visible=false;sc.add(mark);
 PK={sc,cam,yaw:.35,pitch:.85,dist:400,tx:PVW*PKU/2,tz:PVH*PKU/2,mesh:null,wat:null,key:-1,hov,mark,Y:null,hit:null}}

export function pkBuild(){if(!PK)pkInit();if(sitePickerState.pvKey!==terrainState.SEED)buildPreview();PK.key=terrainState.SEED;if(PK.mesh){PK.sc.remove(PK.mesh);PK.mesh.geometry.dispose()}if(PK.wat){PK.sc.remove(PK.wat);PK.wat.geometry.dispose()}if(PK.props)for(const m of PK.props)PK.sc.remove(m);PK.props=[];
 const n=PVW*PVH,pos=new Float32Array(n*3),col=new Float32Array(n*3),Y=new Float32Array(n),SM=siteMaskGet();
 const P0=terrainState.GPR,TR=[],ROC=[],GLD=[],treeAt=(x,y,h)=>{const al=h-LAND,f=fb(x*.06,y*.06,terrainState.SEED+50),d=(f-P0.tr)/.2;if(d>0&&al<14&&hs(x,y,terrainState.SEED+11)<Math.min(.9,d*.9+.08))return 2;if(hs(x,y,terrainState.SEED+12)<P0.tc)return 2;if(al>=2&&fb(x*.05,y*.05,terrainState.SEED+60)>.78&&hs(x,y,terrainState.SEED+14)<.42*P0.gd)return 4;if(al>=4&&hs(x,y,terrainState.SEED+16)<.004*P0.gd)return 4;if(al>=3&&hs(x,y,terrainState.SEED+13)<.01+.004*al)return 3;if(hs(x,y,terrainState.SEED+15)<.0025)return 3;return 0};
 for(let j=0;j<PVH;j++)for(let i=0;i<PVW;i++){const k=j*PVW+i,h=pvH[k],wt=pvW[k],tx=Math.min(TW-1,i*PVS+1),ty=Math.min(TH-1,j*PVS+1);let c;const al=h-LAND,jit=.93+.14*hs(tx,ty,9);
  let code=0;if(!wt&&h<ROCKH)code=treeAt(tx,ty,h);
  if(wt)c=[.24,.52,.84];else if(h>=SNOW)c=[.9,.92,.97];else if(h>=ROCKH||al>=15)c=al>=19?[.66,.68,.74]:[.5,.54,.5];
  else{const m=fb(tx*.05,ty*.05,terrainState.SEED+500),dry=Math.max(0,Math.min(1,(m-.5)*3));c=[.3+.32*dry*.5,.62-.02*dry*.3,.26+.04*dry*.5];if(al>=8){const t=Math.min(1,(al-8)/12);c=[c[0]+(.5-c[0])*t,c[1]+(.54-c[1])*t,c[2]+(.42-c[2])*t]}
   if(al<=1){const nb=(i>0&&pvW[k-1])||(i<PVW-1&&pvW[k+1])||(j>0&&pvW[k-PVW])||(j<PVH-1&&pvW[k+PVW]);if(nb)c=[.86,.78,.55]}
   if(code===2)c=c.map(v=>v*.78);else if(code===3)c=[.5,.5,.46];else if(code===4)c=[.9,.76,.2]}
  c=c.map(v=>v*jit);if(!wt){if(SM[k])c=[c[0]*.45+.14,c[1]*.45+.55,c[2]*.45+.08];else{const l=(c[0]+c[1]+c[2])/3;c=[l*.62+.06,l*.62+.06,l*.62+.06]}}
  const lvl=Math.round((h-LAND)/2)*2,y=(wt?BED-1:lvl)*PKS;Y[k]=y;pos[k*3]=i*PKU;pos[k*3+1]=y;pos[k*3+2]=j*PKU;col[k*3]=c[0];col[k*3+1]=c[1];col[k*3+2]=c[2];
  if(!wt){const r=hs(tx,ty,31);if(code===2)TR.push([i*PKU,y,j*PKU,al>=8?1:0,.8+hs(tx,ty,32)*.5]);else if(code===3)ROC.push([i*PKU,y,j*PKU,(hs(tx,ty,33)*6)|0]);else if(code===4)GLD.push([i*PKU,y,j*PKU,(hs(tx,ty,34)*3)|0])}}
 const idx=new Uint32Array((PVW-1)*(PVH-1)*6);let p=0;for(let j=0;j<PVH-1;j++)for(let i=0;i<PVW-1;i++){const a=j*PVW+i,b=a+1,c=a+PVW,d=c+1;idx[p++]=a;idx[p++]=c;idx[p++]=b;idx[p++]=b;idx[p++]=c;idx[p++]=d}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(new THREE.BufferAttribute(idx,1));g.computeVertexNormals();
 PK.mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));PK.sc.add(PK.mesh);PK.Y=Y;
 const wg=new THREE.PlaneGeometry(PVW*PKU,PVH*PKU);wg.rotateX(-Math.PI/2);wg.translate(PVW*PKU/2,(WLV-LAND)*PKS,PVH*PKU/2);PK.wat=new THREE.Mesh(wg,new THREE.MeshBasicMaterial({color:0x3f8fe0,transparent:true,opacity:.62}));PK.sc.add(PK.wat);
 PK.lists={TR,ROC,GLD};PK.idx=idx;PK.rect=null;pkProps()}

let PKG=null;
function pkGeos(){if(PKG)return;const o=newG();bxc(o,0,0,0,.3,.7,.3,'#6b4423');bxc(o,0,.5,0,1.0,.55,1.0,'#4f9d45');bxc(o,0,.95,0,.7,.5,.7,'#63b457');bxc(o,0,1.4,0,.4,.2,.4,'#7bc86a');const p=newG();bxc(p,0,0,0,.25,.4,.25,'#5a3a1e');bxc(p,0,.3,0,.95,.4,.95,'#2f7a4a');bxc(p,0,.65,0,.7,.4,.7,'#3d8f58');bxc(p,0,1.0,0,.45,.4,.45,'#2a6e48');bxc(p,0,1.35,0,.2,.3,.2,'#4ea068');PKG=[toGeo(o),toGeo(p)]}

function pkProps(){pkGeos();const L=PK.lists;if(!L)return;if(PK.props)for(const m of PK.props){PK.sc.remove(m);m.dispose()}PK.props=[];const R=PK.rect,keep=p=>!R||p[0]<R[0]||p[0]>R[1]||p[2]<R[2]||p[2]>R[3];
 const TR=L.TR.filter(keep),ROC=L.ROC.filter(keep),GLD=L.GLD.filter(keep);
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),vv=new THREE.Vector3(),ss=new THREE.Vector3(),yA=new THREE.Vector3(0,1,0),addSet=(geo,list,sc)=>{if(!list.length)return;const im=new THREE.InstancedMesh(geo,matV,list.length);list.forEach((p,n)=>{q.setFromAxisAngle(yA,((p[3]*7+n)&3)*Math.PI/2);const k2=sc*(p[4]||1);m4.compose(vv.set(p[0],p[1],p[2]),q,ss.set(k2,k2*(geo===PKG[0]||geo===PKG[1]?1.1:1.05),k2));im.setMatrixAt(n,m4)});im.frustumCulled=false;PK.sc.add(im);PK.props.push(im)};
 const stp=Math.max(1,Math.ceil(TR.length/40000)),TA=TR.filter((p,n)=>n%stp===0);for(let v=0;v<2;v++)addSet(PKG[v],TA.filter((p,n)=>(p[3]?1:(n%3===0?1:0))===v),.55);for(let v=0;v<6;v++)addSet(VAR.r[v],ROC.filter(p=>p[3]===v),.9);for(let v=0;v<3;v++)addSet(VAR.g[v],GLD.filter(p=>p[3]===v),1.0)}

/* real generated world around the chosen site: the game's own chunk meshes (terrain, trees, rocks, gold) + the castle */
const PKR=3;
let PKD={x:-1,y:-1,grp:null,t:0};

function pkDetail(tx,ty){if(!PK||!PK.idx)return;const t0=performance.now();terrainState.CX=tx;terrainState.CY=ty;sessionState.CROT=sessionState.PKROT&3;try{reset()}catch(e){return}
 if(PKD.grp){PK.sc.remove(PKD.grp);PKD.grp.traverse(o=>{if(o.geometry)o.geometry.dispose()})}
 const grp=new THREE.Group();grp.scale.set(PKU/PVS,PKS,PKU/PVS);grp.position.y=-LAND*PKS;
 const ccx=(tx/CH)|0,ccy=(ty/CH)|0,mv=m=>{if(!m)return;scene.remove(m);m.castShadow=false;m.receiveShadow=false;grp.add(m)};
 for(let j=-PKR;j<=PKR;j++)for(let i=-PKR;i<=PKR;i++){const cx=ccx+i,cy=ccy+j;if(cx<0||cy<0||cx>=NCX||cy>=NCY)continue;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)genChunk(cx+a,cy+b);const o=buildChunk(cx,cy);mv(o.m);mv(o.w);mv(buildProps(cx,cy))}
 for(const st of sessionState.structs)if(st.o3){scene.remove(st.o3);grp.add(st.o3)}
 PK.sc.add(grp);PKD.grp=grp;PKD.x=tx;PKD.y=ty;PKD.r=sessionState.PKROT&3;
 const x0=(ccx-PKR)*CH,x1=(ccx+PKR+1)*CH,y0=(ccy-PKR)*CH,y1=(ccy+PKR+1)*CH,u=PKU/PVS;PK.rect=[x0*u,x1*u,y0*u,y1*u];pkProps();
 const i0=Math.floor(x0/PVS),i1=Math.ceil(x1/PVS),j0=Math.floor(y0/PVS),j1=Math.ceil(y1/PVS),src=PK.idx,out=new Uint32Array(src.length);let p=0;
 for(let j=0;j<PVH-1;j++)for(let i=0;i<PVW-1;i++){if(i>=i0&&i<i1&&j>=j0&&j<j1)continue;const k=(j*(PVW-1)+i)*6;out[p++]=src[k];out[p++]=src[k+1];out[p++]=src[k+2];out[p++]=src[k+3];out[p++]=src[k+4];out[p++]=src[k+5]}
 PK.mesh.geometry.setIndex(new THREE.BufferAttribute(out.subarray(0,p),1));PKD.ms=performance.now()-t0}

function pkCam(){const c=PK.cam,cp=Math.cos(PK.pitch);c.position.set(PK.tx+Math.sin(PK.yaw)*cp*PK.dist,Math.sin(PK.pitch)*PK.dist,PK.tz+Math.cos(PK.yaw)*cp*PK.dist);c.lookAt(PK.tx,0,PK.tz);c.aspect=cv.width/cv.height;c.updateProjectionMatrix();c.updateMatrixWorld()}

let _pkv;

function pkRay(p){if(!PK||!PK.Y)return null;pkCam();const c=PK.cam;_pkv.set(p.x/cv.width*2-1,-(p.y/cv.height*2-1),.5).unproject(c);const o=c.position,dx=_pkv.x-o.x,dy=_pkv.y-o.y,dz=_pkv.z-o.z,L=Math.sqrt(dx*dx+dy*dy+dz*dz),ux=dx/L,uy=dy/L,uz=dz/L;
 for(let t=0;t<4000;t+=1.2){const x=o.x+ux*t,y=o.y+uy*t,z=o.z+uz*t;if(x<0||z<0||x>(PVW-1)*PKU||z>(PVH-1)*PKU)continue;const k=Math.round(z/PKU)*PVW+Math.round(x/PKU);if(y<=PK.Y[k]){return{x,y,z}}}return null}

function pkTile(h){return{tx:Math.max(0,Math.min(TW-1,Math.round(h.x/PKU*PVS+1))),ty:Math.max(0,Math.min(TH-1,Math.round(h.z/PKU*PVS+1)))}}

export function pkSet(tx,ty,ok){sitePickerState.pickPos={tx,ty,ok}}

export let renderPick = function renderPick(dt){if(!PK||PK.key!==terrainState.SEED){pkBuild();PKD.x=-1;PKD.grp=null}
 if(sitePickerState.pickPos&&sitePickerState.pickPos.ok&&(sitePickerState.pickPos.tx!==PKD.x||sitePickerState.pickPos.ty!==PKD.y||(sessionState.PKROT&3)!==PKD.r)){PKD.w=(PKD.w||0)+dt;if(PKD.w>.3||PKD.x<0){PKD.w=0;pkDetail(sitePickerState.pickPos.tx,sitePickerState.pickPos.ty)}}
 if(sitePickerState.pickPos&&PK.mark){PK.mark.visible=true;const i=Math.max(0,Math.min(PVW-1,Math.round((sitePickerState.pickPos.tx-1)/PVS))),j=Math.max(0,Math.min(PVH-1,Math.round((sitePickerState.pickPos.ty-1)/PVS)));PK.mark.position.set(i*PKU,Math.max(PK.Y[j*PVW+i],(WLV-LAND)*PKS),j*PKU);PK.mark.children[2].material.color.set(sitePickerState.pickPos.ok?0xffd23c:0xff6b6b);PK.mark.children[0].visible=!(PKD.grp&&sitePickerState.pickPos.ok&&PKD.x===sitePickerState.pickPos.tx&&PKD.y===sitePickerState.pickPos.ty);PK.mark.children[2].scale.set(.4,.4,.4)}else PK.mark.visible=false;
 const h=pkRay(inputState.mouse);if(h&&!hudState.uiRects.some(r=>inR(inputState.mouse,r))){const t=pkTile(h),ok=siteOK(t.tx,t.ty);PK.hov.visible=true;PK.hov.position.set(h.x,h.y+1,h.z);PK.hov.material.color.set(ok?0x6fe08a:0xff6b6b);PK.hov.position.y+=2+Math.sin(sessionState.clockT*5)*1.2;PK.hit={...t,ok}}else{PK.hov.visible=false;PK.hit=null}
 pkCam();renderer.render(PK.sc,PK.cam)};

export function pkFocus(){if(!PK||!sitePickerState.pickPos)return;if(typeof pkLiveFocus==='function')pkLiveFocus(sitePickerState.pickPos.tx,sitePickerState.pickPos.ty);PK.tx=(sitePickerState.pickPos.tx-1)/PVS*PKU;PK.tz=(sitePickerState.pickPos.ty-1)/PVS*PKU}

export function setRenderPickHandler(handler) {
  renderPick = handler;
}

export function initializeSitePicker() {
  _pkv = new THREE.Vector3();
}
