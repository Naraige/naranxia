import { sessionState } from '../gameplay/session.js';
import { mpMsg, mpSend, setMpMsgHandler } from './lockstep.js';
import { MP } from './session.js';
import { PK, pkBuild, PKS, PKU, renderPick, setRenderPickHandler } from '../rendering/site-picker.js';
import { THREE } from '../rendering/three.js';
import { PVH, PVS, PVW, sitePickerState } from '../ui/site-picker.js';
import { FFT } from '../ui/typography.js';
import { LAND, terrainState, WLV } from '../world/terrain-state.js';

export const sitePreviewState = {
  _pcT: 0,
  _pcL: '',
};

function pkOther(){if(PK.oth)return PK.oth;const g=new THREE.Group(),m=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.95,depthTest:false});
 const cone=new THREE.Mesh(new THREE.ConeGeometry(5,14,10),m(0x5aa9ff));cone.rotation.x=Math.PI;cone.position.y=12;cone.renderOrder=9;
 const ring=new THREE.Mesh(new THREE.RingGeometry(10,12,40),m(0x5aa9ff));ring.rotation.x=-Math.PI/2;ring.position.y=1;ring.renderOrder=9;
 const cv2=document.createElement('canvas');cv2.width=256;cv2.height=64;const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv2),depthTest:false,transparent:true}));sp.scale.set(40,10,1);sp.position.y=28;sp.renderOrder=10;
 g.add(cone,ring,sp);g.userData={cv:cv2,sp,ring,cone,nm:null};PK.sc.add(g);PK.oth=g;return g}

function pkOthName(g,t){if(g.userData.nm===t)return;g.userData.nm=t;const c=g.userData.cv,x=c.getContext('2d');x.clearRect(0,0,256,64);x.font='700 28px '+FFT;x.textAlign='center';x.lineWidth=6;x.strokeStyle='#0b0810';x.fillStyle='#f3d27a';x.strokeText(t,128,42);x.fillText(t,128,42);g.userData.sp.material.map.needsUpdate=true}

let _rp;

let _mm2;

export function initializeSitePreview() {
  /* partner cursor + castle site during placement */
  MP.cur=null;
  _rp = renderPick;
  setRenderPickHandler(function(dt){if(!PK||PK.key!==terrainState.SEED)pkBuild();
   if(MP.conn){const h=PK.hit||sitePickerState.pickPos;if(h&&performance.now()-sitePreviewState._pcT>90){const k=h.tx+','+h.ty;if(k!==sitePreviewState._pcL){sitePreviewState._pcL=k;mpSend({k:'pc',tx:h.tx,ty:h.ty})}sitePreviewState._pcT=performance.now()}
    const g=pkOther(),P=MP.theirs||MP.cur;
    if(P&&PK.Y){const i=Math.max(0,Math.min(PVW-1,Math.round((P.tx-1)/PVS))),j=Math.max(0,Math.min(PVH-1,Math.round((P.ty-1)/PVS)));g.visible=true;g.position.set(i*PKU,Math.max(PK.Y[j*PVW+i],(WLV-LAND)*PKS),j*PKU);
     const placed=!!MP.theirs;g.userData.ring.scale.setScalar(placed?1.6:1);g.userData.cone.position.y=12+(placed?0:Math.sin(sessionState.clockT*5)*1.5);pkOthName(g,(MP.pname||'Partner')+(placed?' - castle':''))}else g.visible=false}
   else if(PK.oth)PK.oth.visible=false;
   _rp(dt)});
  _mm2 = mpMsg;
  setMpMsgHandler(function(m){if(m.k==='pc'){MP.cur={tx:+m.tx,ty:+m.ty}}else return _mm2(m)});
}
