import { addBox, newG, rgb } from '../geometry.js';
import { pxZg } from './unit-accessories.js';
import { uv2 } from './unit-style.js';
import { mut2 } from './mutant-style.js';
import { PXON } from './units.js';
import { zBuild, ZNV } from './zombies.js';
import { SWPX } from '../swarm.js';
import { THREE } from '../three.js';

/* swarm geometry: same generator, swarm pixel units (SWPX), parts for the vertex animation, glow + skin flags; tiny details dropped */
export function swGeoV(S){S.lod=1;if(PXON&&S.decay!=='dried'&&S.decay!=='mummy')S=Object.assign({},S,{sk:S.sk.map(pxZg)});const P=[],N=[],C=[],I=[],A=[],GL=[],SKA=[],u=SWPX;
 const box=(x0,y0,z0,x1,y1,z1,c,part,gl,sk)=>{const G=newG();addBox(G,x0*u,y0*u,z0*u,x1*u,y1*u,z1*u,rgb(c));const o=P.length/3;for(const v of G.P)P.push(v);for(const v of G.N)N.push(v);for(const v of G.C)C.push(v);for(const ix of G.I)I.push(ix+o);for(let q=0;q<G.P.length/3;q++){A.push(part);GL.push(gl);SKA.push(sk)}};
 zBuild(S,(R,x0,y0,z0,x1,y1,z1,c,m,sk)=>{const gl=m===5?1:0;if(!gl&&Math.max(x1-x0,y1-y0,z1-z0)<(R==='H'?.75:1.05))return;
  if(R==='T'||R==='H')box(x0,y0,z0,x1,y1,z1,c,0,gl,sk);
  else if(R==='AR')box(6+x0,24+y0,z0,6+x1,24+y1,z1,c,2,gl,sk);
  else if(R==='AL')box(-6-x1,24+y0,z0,-6-x0,24+y1,z1,c,1,gl,sk);
  else if(R==='L'){box(-2-x1,y0,z0,-2-x0,y1,z1,c,3,gl,sk);box(2+x0,y0,z0,2+x1,y1,z1,c,4,gl,sk)}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 g.setAttribute('aPart',new THREE.Float32BufferAttribute(A,1));g.setAttribute('aGl',new THREE.Float32BufferAttribute(GL,1));g.setAttribute('aSk',new THREE.Float32BufferAttribute(SKA,1));g.setIndex(I);return g}

export const SWV=[];

export const swVar=sd=>((sd>>3)^(sd>>9))&15;

export const zKeyOf=u=>{const n=ZNV[u.type];if(!n||u.t!==1)return null;if(u.boss&&(uv2('boss')||mut2('boss')))return{v:(u.bn|0)%6,hint:'boss'};const h=(u.uid*2654435761)>>>0;return u.zk&&u.zk!=='zombie'?{v:h%6,hint:u.zk}:{v:h%n,hint:null}};

export function initializeSwarmModels() {
  for(let v=0;v<16;v++)SWV.push(v<10?['zombie',100+v]:v<13?['husk',100+v]:['runner',100+v]);
}
