/* ================= TOUCH MODE (#17) =================
   Pointer events already give taps and drags. Added here for a finger (capture phase, before the mouse handlers):
   two fingers = pinch to zoom and drag to move the camera; one tap on empty ground with units selected = move order (the right click),
   a tap on a unit or building still selects it. The 'Pan' button in the menu stays for one-finger camera moves. Mouse play is unchanged. */
const TCH=new Map();let TG=null,TGEND=false,TCHON=false;
const tchK=()=>cv.width/Math.max(1,cv.getBoundingClientRect().width);
addEventListener('pointerdown',e=>{if(e.pointerType!=='touch'||e.target!==cv)return;TCHON=true;TCH.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(TCH.size===2){ptr=null;box=null;mmDrag=false;const[a,b]=[...TCH.values()];TG={d:Math.hypot(a.x-b.x,a.y-b.y),cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};TGEND=true}
 if(TCH.size>=2){e.stopImmediatePropagation();e.preventDefault()}},true);
addEventListener('pointermove',e=>{if(e.pointerType!=='touch'||!TCH.has(e.pointerId))return;TCH.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(TCH.size>=2&&TG){const[a,b]=[...TCH.values()],d=Math.hypot(a.x-b.x,a.y-b.y),cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
  if(started&&!showMap){if(d>8&&TG.d>8)CAM.dist=Math.max(7,Math.min(80,CAM.dist*TG.d/d));panCam((cx-TG.cx)*tchK(),(cy-TG.cy)*tchK())}
  TG={d,cx,cy};e.stopImmediatePropagation();e.preventDefault()}},true);
const tchUp=e=>{if(e.pointerType!=='touch')return;const swallow=TG||TGEND;TCH.delete(e.pointerId);if(TCH.size<2)TG=null;
 if(swallow){if(!TCH.size)TGEND=false;ptr=null;box=null;e.stopImmediatePropagation();return}
 /* one-finger tap on empty ground with units selected: the right click */
 if(TCHON&&ptr&&ptr.m<=8&&ptr.btn===0&&!mode&&started&&!over&&!showMap&&sel().length){const w=wpos();
  if(!pickUnit(mouse)&&!pickStruct(mouse)&&!occ.get(Math.floor(w.y/TS)*TW+Math.floor(w.x/TS))){order(w);puff(w.x,w.y,'#ffe14a',8,40);ptr=null;box=null;e.stopImmediatePropagation()}}};
addEventListener('pointerup',tchUp,true);addEventListener('pointercancel',e=>{if(e.pointerType==='touch'){TCH.delete(e.pointerId);if(TCH.size<2)TG=null;if(!TCH.size)TGEND=false}},true);
