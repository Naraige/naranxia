/* ================= Minecraft-style icons =================
   items  -> 16x16 pixel sprites with a dark outline (ingot, sword, armour, wheat, clock, map...)
   blocks -> isometric cubes (log, cobblestone, stone bricks, grass, TNT, piston, stairs, path)
   units  -> mob-head style heads; buildings -> isometric renders of the real medieval models */
function pc16(fn,ol){const c=cvs(16,16),g=c.getContext('2d'),P=(x,y,col)=>{if(x<0||y<0||x>15||y>15)return;g.fillStyle=col;g.fillRect(x|0,y|0,1,1)},R=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)},
 L=(x0,y0,x1,y1,col)=>{const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let k=0;k<=n;k++)P(Math.round(x0+(x1-x0)*k/n),Math.round(y0+(y1-y0)*k/n),typeof col==='function'?col(k,n):col)},
 Gd=(rows,pal,x0,y0)=>rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch!=='.'&&pal[ch])P(x0+i,y0+j,pal[ch])}}),
 C=(cx,cy,f)=>{for(let y=0;y<16;y++)for(let x=0;x<16;x++){const dx=x+.5-cx,dy=y+.5-cy,col=f(hyp(dx,dy),Math.atan2(dy,dx),dx,dy);if(col)P(x,y,col)}};
 fn({P,R,L,Gd,C,g});const o=arcIcon(epx(epx(epx(c))),ICO_N);o.__px=true;return o}
const MI_IRN={i:'#c9ced6',w:'#f2f2f2',d:'#8a909c'},MI_STK=(k)=>k%2?'#5a3f1c':'#8a6a3a';
/* isometric block / model helpers (geometry built from 0..1 so the pixel shader's block grid lines up with the cube edges) */
function miMesh(G){return new THREE.Mesh(toGeo(G),matV)}
function miBlock(fn){const G=newG();fn(G);return miMesh(G)}
const MI_ISO=[Math.PI/4,.58];
function miShot(o,yaw,pitch){return icoShot(o,yaw==null?MI_ISO[0]:yaw,pitch==null?MI_ISO[1]:pitch)}
/* building renders: brighter light, slightly finer pixels so timber frames and roofs stay readable */
let MI_AMB=null;function miShotB(obj,yaw,pitch,n){const R=ICR,cam=R.cam;if(!MI_AMB){MI_AMB=new THREE.AmbientLight(0xffffff,.5);MI_AMB.visible=false;R.sc.add(MI_AMB)}MI_AMB.visible=true;
 R.sc.add(obj);obj.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(obj),sp=bb.getBoundingSphere(new THREE.Sphere()),c=sp.center,r=Math.max(.01,sp.radius),d=r/Math.sin(cam.fov*Math.PI/360)*.98;
 cam.position.set(c.x+Math.sin(yaw)*Math.cos(pitch)*d,c.y+Math.sin(pitch)*d,c.z+Math.cos(yaw)*Math.cos(pitch)*d);cam.near=d*.05;cam.far=d*4;cam.updateProjectionMatrix();cam.lookAt(c);
 const oc=new THREE.Color();renderer.getClearColor(oc);const oa=renderer.getClearAlpha();const fw0=FOWU.fowP.value.w,fz0=FOWU.fowP.value.z;FOWU.fowP.value.w=0;FOWU.fowP.value.z=0;renderer.setClearColor(0x000000,0);renderer.setRenderTarget(R.rt);renderer.clear();renderer.render(R.sc,cam);renderer.readRenderTargetPixels(R.rt,0,0,ICO_RT,ICO_RT,R.buf);renderer.setRenderTarget(null);renderer.setClearColor(oc,oa);FOWU.fowP.value.w=fw0;FOWU.fowP.value.z=fz0;R.sc.remove(obj);MI_AMB.visible=false;
 const N2=ICO_RT,cv2=cvs(N2,N2),g=cv2.getContext('2d'),im=g.createImageData(N2,N2);for(let y=0;y<N2;y++){const sy=N2-1-y;for(let x=0;x<N2;x++){const s0=(sy*N2+x)*4,o=(y*N2+x)*4;im.data[o]=R.buf[s0];im.data[o+1]=R.buf[s0+1];im.data[o+2]=R.buf[s0+2];im.data[o+3]=R.buf[s0+3]}}g.putImageData(im,0,0);return arcIcon(cv2,ICO_N)}
function miOverlay(c,rows,pal,x0,y0){const g=c.getContext('2d'),k=c.width/20;rows.forEach((r,j)=>{for(let i=0;i<r.length;i++){const ch=r[i];if(ch==='.'||!pal[ch])continue;g.fillStyle=pal[ch];g.fillRect((x0+i)*k,(y0+j)*k,Math.ceil(k),Math.ceil(k))}});return c}
function miHead(type,t){const mdl=mkModel(type,t),g=new THREE.Group();g.add(new THREE.Mesh(mdl.head,matUI));
 if(mdl.parts)for(const p of mdl.parts)if(p.k==='plume'){const m=new THREE.Mesh(p.geo,matUI);m.position.set(p.x,p.y-mdl.neck,p.z);g.add(m)}
 return icoShot(g,.66,.4)}
function mcIcons(){if(!ICR)icoInit();const SW=sprites(),IC2={};
 /* ---------- items ---------- */
 IC2.coin=pc16(({R,P})=>{R(5,5,8,1,'#fff3a8');R(4,6,8,1,'#ffe060');P(12,6,'#d8a018');R(3,7,8,3,'#f0b820');R(11,7,1,3,'#c08a14');P(12,7,'#b07a10');P(12,8,'#a87410');R(3,9,8,1,'#d09a18');P(6,5,'#ffffff');P(7,5,'#ffffff');R(4,8,3,1,'#ffd45a')});
 IC2.heart=pc16(({Gd})=>Gd(["..rrr...rrr..",".rwwrr.rrrrr.","rrwrrrrrrrrrr","rrrrrrrrrrrrr","rrrrrrrrrrrrd",".rrrrrrrrrrd.","..rrrrrrrrd..","...rrrrrrd...","....rrrrd....",".....rrd.....","......d......"],{r:'#e81c1c',w:'#ffb0b0',d:'#a00e0e'},1,2));
 const swd=(rows,pal)=>pc16(({Gd})=>Gd(rows,pal,0,0),false);
 IC2.sword=swd(SW.sword,SPAL);IC2.iron=IC2.sword;IC2.steel=swd(SW.sword,{...SPAL,w:'#e0fffb',i:'#5ae6e0',d:'#24a49c'});
 IC2.tools=swd(SW.pick,SPAL);
 IC2.army=pc16(({Gd})=>{Gd(SW.sword.map(r=>[...r].reverse().join('')),SPAL,0,0);Gd(SW.sword,SPAL,0,0)},false);
 IC2.dig=pc16(({L,C})=>{C(11.5,4.5,(r,a,dx,dy)=>Math.abs(dx)+Math.abs(dy)<3.1?(dx+dy<-1?'#f2f2f2':dx+dy<1.2?'#c9ced6':'#8a909c'):null);L(2,13,8,7,MI_STK)});
 IC2.fletch=pc16(({L,P})=>{L(4,11,11,4,'#8a6a3a');P(12,3,'#4a4a4a');P(11,3,'#7a7a7a');P(12,4,'#7a7a7a');P(13,2,'#9a9a9a');P(12,2,'#5a5a5a');P(13,3,'#5a5a5a');P(3,12,'#f0f0f0');P(2,12,'#d8d8d8');P(3,13,'#d8d8d8');P(2,13,'#f0f0f0');P(4,12,'#c8c8c8');P(3,11,'#c8c8c8');P(1,14,'#e8e8e8');P(2,11,'#e0e0e0');P(4,13,'#e0e0e0')});
 IC2.harvest=pc16(({Gd})=>Gd([".....y......","..y..Yy..y..",".Yy..yY.yY..",".yY..Yy.Yy..",".Yy..yY.yY..","..yG.Yy.yG..","...G.GG.G...","...G..G.G...","....G.GG....","....GGG.....",".....G......",".....G......","....GGG.....",".....G......"],{y:'#e8c84a',Y:'#c8a030',G:'#7a8a2a'},2,1));
 const CHP=[".iii....iii.","iwii....iiid","iwiiiiiiiiid","iwiiiiiiiiid",".iiiiiiiiid.",".iiiiiiiiid.",".iiiiiiiiid.",".iiiiiiiiid.",".iiiiiiiiid.",".dddddddddd."];
 IC2.plate=pc16(({Gd})=>Gd(CHP,MI_IRN,2,3));
 IC2.mail=pc16(({Gd,g})=>{Gd(CHP,{i:'#a2a2aa',w:'#d0d0d8',d:'#5e5e66'},2,3);g.fillStyle='#3a3a42';for(let y=5;y<12;y+=2)for(let x=4+((y>>1)&1);x<12;x+=2)g.fillRect(x,y,1,1)});
 IC2.bastion=pc16(({Gd})=>Gd(["iiiiiiiiii","iwwwccwwwi","iwvwccwvwi","iwvwccwvwi","icccccccci","icccccccci","iwvwccwvwi","iwvwccwvwi","iwvwccwvwi",".iwwccwwi.","..iwccwi..","...iiii..."],{i:'#8a909c',w:'#a6844f',v:'#8a6a3a',c:thp()},3,2));IC2.shield=IC2.bastion;
 IC2.drill=pc16(({C,P})=>{C(8,8,(r,a,dx,dy)=>r>6.2?null:r>5.0?(dx+dy<0?'#ffe060':'#c8962a'):dy<0?'#4a8ad8':'#3a2a1a');P(6,5,'#ffe060');P(7,5,'#ffe060');P(6,6,'#ffe060');P(7,6,'#ffe060');P(10,10,'#5a9a36');P(9,11,'#5a9a36');P(8,8,'#1a1a1a');P(8,7,'#1a1a1a');P(8,6,'#1a1a1a')});
 IC2.compass=pc16(({C,L,P})=>{C(8,8,(r,a,dx,dy)=>r>6.2?null:r>5.0?'#6a6a72':r>4.0?(dx+dy<0?'#c8c8d0':'#9a9aa2'):'#3a3a44');L(8,8,11,5,'#e02a2a');L(8,8,5,11,'#e8e8e8');P(8,8,'#1a1a1a')});
 IC2.gear=pc16(({C})=>C(8,8,(r,a,dx,dy)=>{const tooth=Math.cos(a*8)>.15;if(r<2.1)return null;if(r<=4.9||(r<=6.6&&tooth))return dx+dy<-1?'#e0e0e0':dx+dy<2?'#b8b8c0':'#80808a';return null}));
 IC2.map=pc16(({R,P})=>{R(2,2,12,12,'#b8a070');R(3,3,10,10,'#ece0b4');R(4,4,4,3,'#7aa84a');R(9,8,3,3,'#7aa84a');R(4,9,3,3,'#5a8ad8');R(10,4,2,2,'#5a8ad8');P(8,6,'#a07040');P(7,7,'#a07040');P(8,8,'#a07040');P(10,11,'#a07040');P(9,6,'#c8282a');P(10,6,'#c8282a')});
 IC2.dice=pc16(({R})=>{R(3,3,10,10,'#f4f4f4');R(12,4,1,9,'#c8c8c8');R(4,12,9,1,'#c8c8c8');for(const[x,y]of[[5,5],[9,9],[7,7],[9,5],[5,9]])R(x,y,2,2,'#1a1a1a')});
 IC2.menu=pc16(({R})=>{for(const y of[4,7,10]){R(3,y,10,2,'#f0f0f0');R(3,y+1,10,1,'#c8c8c8')}});
 IC2.play=pc16(({R})=>{for(let y=3;y<=12;y++){const w=Math.round(Math.min(y-3,12-y)*1.6)+1;R(5,y,w,1,'#f0f0f0')}});
 IC2.pause=pc16(({R})=>{R(4,3,3,10,'#f0f0f0');R(9,3,3,10,'#f0f0f0');R(6,3,1,10,'#c8c8c8');R(11,3,1,10,'#c8c8c8')});
 const spk=(R)=>{R(2,6,3,4,'#e0e0e0');R(5,5,1,6,'#e0e0e0');R(6,4,1,8,'#e0e0e0');R(7,3,1,10,'#e0e0e0')};
 IC2.sound=pc16(({R,C})=>{spk(R);C(7,8,(r,a)=>Math.abs(a)<.9&&((r>2.6&&r<3.6)||(r>5.0&&r<6.0))?'#e0e0e0':null)});
 IC2.mute=pc16(({R,L})=>{spk(R);L(10,5,14,10,'#ff5555');L(14,5,10,10,'#ff5555')});
 const mag=(C,R,plus)=>{C(6.5,6.5,(r)=>r>4.4?null:r>3.2?'#d0d0d0':'#8ac8e8');R(10,10,2,2,'#7a5a2a');R(11,11,2,2,'#7a5a2a');R(12,12,2,2,'#5a3f1c');R(4,6,5,1,'#ffffff');if(plus)R(6,4,1,5,'#ffffff')};
 IC2.zoomIn=pc16(({C,R})=>mag(C,R,true));IC2.zoomOut=pc16(({C,R})=>mag(C,R,false));
 const arc=(C,R,P,dir)=>{C(8,9.5,(r,a)=>{if(r<3.3||r>4.9)return null;const deg=a*180/Math.PI;return deg<-12&&deg>-168?'#f0f0f0':null});if(dir<0){R(2,9,5,1,'#f0f0f0');R(3,10,3,1,'#f0f0f0');P(4,11,'#f0f0f0')}else{R(9,9,5,1,'#f0f0f0');R(10,10,3,1,'#f0f0f0');P(11,11,'#f0f0f0')}};
 IC2.rotL=pc16(({C,R,P})=>arc(C,R,P,-1));IC2.rotR=pc16(({C,R,P})=>arc(C,R,P,1));
 IC2.rotate=pc16(({C,R,P})=>{C(8,8,(r,a)=>{if(r<3.6||r>5.2)return null;const deg=a*180/Math.PI;return deg>-60||deg<-100?'#f0f0f0':null});R(8,1,1,6,'#f0f0f0');R(9,2,1,4,'#f0f0f0');R(10,3,1,2,'#f0f0f0')});
 IC2.close=pc16(({R})=>{for(let k=0;k<9;k++){R(3+k,3+k,2,2,'#ff5555');R(11-k,3+k,2,2,'#ff5555')}});
 IC2.cursor=pc16(({Gd})=>Gd(["w.......","ww......","www.....","wwww....","wwwww...","wwwwww..","wwwwwww.","wwwwwwww","wwwww...","ww.ww...","w...ww..","....ww..",".....ww."],{w:'#ffffff'},4,1));
 IC2.pan=pc16(({R,P})=>{const c='#f0f0f0';R(7,4,2,8,c);R(4,7,8,2,c);P(7,2,c);P(8,2,c);R(6,3,4,1,c);R(5,4,6,1,c);R(5,11,6,1,c);R(6,12,4,1,c);P(7,13,c);P(8,13,c);R(4,5,1,6,c);R(3,6,1,4,c);P(2,7,c);P(2,8,c);R(11,5,1,6,c);R(12,6,1,4,c);P(13,7,c);P(13,8,c)});
 const flag=(R,P,col,dk)=>{R(4,1,1,13,'#6b4a2a');R(3,14,3,1,'#5a5a5a');R(5,2,6,1,col);R(5,3,7,1,col);R(5,4,8,1,col);R(5,5,7,1,col);R(5,6,6,1,col);P(10,3,dk);P(11,4,dk);P(12,4,dk);P(10,5,dk);P(9,6,dk);R(6,4,2,1,'#ffffff')};
 IC2.rally=pc16(({R,P})=>flag(R,P,'#55e070','#2a9a40'));IC2.rallyc=pc16(({R,P})=>flag(R,P,'#ffd23c','#c8962a'));
 const ban=(R,P,col,dk)=>{R(3,1,10,1,'#8a6a3a');R(4,2,8,10,col);R(11,2,1,10,dk);P(4,12,col);P(5,12,col);P(7,12,col);P(8,12,col);P(10,12,col);P(11,12,dk);R(7,13,2,2,'#6b4a2a');R(7,4,2,6,'#f0f0f0');R(5,6,6,2,'#f0f0f0')};
 IC2.bannerman=pc16(({R,P})=>ban(R,P,thp(),ths()));
 const HLM=[".iiii.","iwiiid","iwiiid","ii..dd","i....d"];
 IC2.group=pc16(({Gd})=>{Gd(HLM,MI_IRN,5,2);Gd(HLM,MI_IRN,1,9);Gd(HLM,MI_IRN,9,9)});IC2.ungroup=pc16(({Gd})=>{Gd(HLM,MI_IRN,1,6);Gd(HLM,MI_IRN,9,6)});
IC2.plus=pc16(({R})=>{R(7,3,2,10,'#f0f0f0');R(3,7,10,2,'#f0f0f0')});IC2.minus=pc16(({R})=>R(3,7,10,2,'#f0f0f0'));
 IC2.ff=pc16(({R})=>{for(let y=3;y<=12;y++){const w=Math.round(Math.min(y-3,12-y)*1.0)+1;R(2,y,w,1,'#f0f0f0');R(8,y,w,1,'#f0f0f0')}});
 IC2.clock=IC2.drill;IC2.crown=pc16(({R,P})=>{R(2,7,12,5,'#ffd23c');R(2,11,12,1,'#c8962a');for(const x of[2,7,12]){R(x,4,2,3,'#ffd23c');P(x,3,'#ffe060')}P(4,6,'#ffd23c');P(10,6,'#ffd23c');R(4,9,2,1,'#c8282a');R(10,9,2,1,'#3a6fd0');R(7,9,2,1,'#55e070')});
IC2.agg=pc16(({Gd,P})=>{Gd(SW.sword,{...SPAL,w:'#ffe0e0',i:'#ff7a6a',d:'#c03a2a'},0,0)},false);
 IC2.def=IC2.shield;
 IC2.hold=pc16(({Gd})=>Gd(["...h..h.....","h..h..h.....","h..h..h..h..","h..h..h..h..","hh.hh.hh.h..","hhhhhhhhhh.h","hhhhhhhhhhhh","hhhhhhhhhhh.","hhhhhhhhhhh.",".hhhhhhhhhh.",".hhhhhhhhh..","..hhhhhhhh..","..hhhhhhh...","...dddddd..."],{h:'#e8b88a',d:'#a8744a'},2,1));
 IC2.stop=pc16(({C,R})=>{C(8,8,(r,a,dx,dy)=>Math.abs(dx)<6.4&&Math.abs(dy)<6.4&&Math.abs(dx)+Math.abs(dy)<9?(Math.abs(dx)+Math.abs(dy)>7.6||Math.abs(dx)>5.6||Math.abs(dy)>5.6?'#8a1010':'#e02a2a'):null);R(4,7,8,2,'#ffffff')});
 IC2.work=IC2.tools;
 IC2.bed=pc16(({R})=>{R(1,7,4,3,'#f4f4f4');R(1,7,4,1,'#ffffff');R(5,6,10,4,'#c8282a');R(5,6,10,1,'#e04848');R(5,9,10,1,'#9a1a1a');R(1,10,14,2,'#a98450');R(1,10,14,1,'#c8a060');R(1,12,2,2,'#6b4a2a');R(13,12,2,2,'#6b4a2a')});
 /* ---------- blocks (isometric) ---------- */
 IC2.wood=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#6b5030');for(const[x,w]of[[.18,.07],[.47,.05],[.78,.08]]){bxc(G,x,.06,1.0,w,.88,.006,'#4f3a22');bxc(G,1.0,.06,x,.006,.88,w,'#4f3a22')}bxc(G,.5,1.0,.5,.98,.006,.98,'#b8945f');bxc(G,.5,1.004,.5,.7,.006,.7,'#9a7a48');bxc(G,.5,1.008,.5,.42,.006,.42,'#b8945f');bxc(G,.5,1.012,.5,.14,.006,.14,'#9a7a48')}));
 const cob=(G,base,sd)=>{const R=rngf(sd||91);bxc(G,.5,0,.5,1,1,1,base||'#7f7f7f');for(let k=0;k<21;k++){const a=.12+R()*.76,b=.12+R()*.76,w=.12+R()*.18,h=.1+R()*.14,c=R()<.5?'#9c9c9c':'#5c5c5c',f=k%3;if(f===0)bxc(G,a,b-h/2,1.0,w,h,.006,c);else if(f===1)bxc(G,1.0,b-h/2,a,.006,h,w,c);else bxc(G,a,1.0,b,w,.006,h,c)}};
 IC2.stone=miShot(miBlock(G=>cob(G)));
 IC2.upgrade=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#8f8f8f');const m='#5e5e5e';for(const f of[0,1]){const F=(a,y,w,h)=>f?bxc(G,1.0,y,a,.006,h,w,m):bxc(G,a,y,1.0,w,h,.006,m);F(.5,.48,1,.04);F(.5,.96,1,.04);F(.5,.5,.04,.48);F(.25,0,.04,.48);F(.75,0,.04,.48)}bxc(G,.5,1.0,.5,1,.006,.04,m);bxc(G,.5,1.0,.5,.04,.006,1,m);bxc(G,.25,1.0,.25,.3,.008,.3,'#a0a0a0')}));IC2.hammer=IC2.upgrade;
 IC2.raise=miOverlay(miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#866043');bxc(G,.5,1.0,.5,1,.006,1,'#5aa036');bxc(G,.5,.8,.5,1.006,.2,1.006,'#5aa036');for(const x of[.15,.42,.7,.9]){bxc(G,x,.7,1.003,.08,.12,.006,'#5aa036');bxc(G,1.003,.7,x,.006,.1,.08,'#5aa036')}})),
  ["..K..",".KgK.","KgggK","KKgKK",".KgK.",".KKK."],{K:'#102010',g:'#55ff55'},14,0);
 IC2.path=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,.94,1,'#866043');bxc(G,.5,.94,.5,1,.006,1,'#9b7a46');const R=rngf(7);for(let k=0;k<12;k++)bxc(G,.08+R()*.84,.946,.08+R()*.84,.08,.006,.08,R()<.5?'#b0905a':'#7a5a34')}));
 IC2.ramp=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,.5,1,'#7f7f7f');bxc(G,.5,.5,.25,1,.5,.5,'#8a8a8a')}));
 IC2.demolish=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,1,1,'#c8282a');for(const x of[.2,.6])bxc(G,x,.08,1.0,.04,.84,.006,'#a01818');bxc(G,.5,.33,1.0,1.002,.34,.008,'#f0f0f0');bxc(G,1.0,.33,.5,.008,.34,1.002,'#f0f0f0');for(const x of[.22,.5,.78]){bxc(G,x,.39,1.004,.16,.22,.008,'#2a2a2a');bxc(G,1.004,.39,x,.008,.22,.16,'#2a2a2a')}bxc(G,.5,1.0,.5,1,.006,1,'#d6d6d6');bxc(G,.5,1.004,.5,.34,.006,.34,'#5a5a5a');bxc(G,.5,1.0,.5,.06,.12,.06,'#3a3a3a')}));
 IC2.movec=miShot(miBlock(G=>{cob(G,'#7a7a7a',33);bxc(G,.5,.72,.5,1.004,.28,1.004,'#b8945f');bxc(G,.5,1.0,.5,1,.008,1,'#c8a46a');bxc(G,.5,1.006,.5,.36,.008,.36,'#9a9aa2');for(const x of[.25,.5,.75]){bxc(G,x,.72,1.004,.02,.28,.008,'#8a6a3a');bxc(G,1.004,.72,x,.008,.28,.02,'#8a6a3a')}}));
 /* ---------- heads ---------- */
 IC2.peasant=miHead('peasant',0);IC2.knight=miHead('knight',0);IC2.archer=miHead('archer',0);IC2.captain=miHead('captain',0);IC2.bannerman=miHead('bannerman',0);IC2.king=miHead('king',0);IC2.guard=miHead('guard',0);
 IC2.skull=miHead('zombie',1);IC2.brute=miHead('brute',1);IC2.runner=miHead('runner',1);
 IC2.idle=miOverlay(miHead('peasant',0),["KKKKK","KzzzK","KKzKK","KzKKK","KzzzK","KKKKK"],{K:'#101018',z:'#ffffff'},14,0);
 /* ---------- buildings: renders of the medieval models ---------- */
 const tr=RS.done?1:0,SZI={tower:2,castle:5},st=(t,m,tier,ex)=>{const s={type:t,t:0,tier:tier==null?1:tier,sz:SZI[t]||1,gl:t==='gate'?3:0,tiles:[]},w=new THREE.Group();w.add(new THREE.Mesh(sGeo(s,m||0),matV));if(ex)ex(w);return w};
 const yaw=.62,pit=.36,B=(o,p,n)=>miShotB(o,yaw,p==null?pit:p,n);
 IC2.wall=B(st('wall',10,tr),.3,22);IC2.tower=B(st('tower',0,tr),.3,26);
 IC2.gate=B(st('gate',0,tr,w=>{const d=new THREE.Mesh(tr?(GEO.door||(GEO.door=doorGeo())):(GEO.doorw||(GEO.doorw=doorGeoW())),matV);d.position.set(0,1.32,0);w.add(d)}),.3,24);
 IC2.barracks=B(st('barracks',0,tr));IC2.farm=B(st('farm',0,1),.62);IC2.house=B(st('house',0,0));IC2.storage=B(st('storage',0,0));IC2.academy=B(st('academy',0,0));IC2.market=B(st('market',0,0));IC2.forester=B(st('forester',0,0));IC2.guild=B(st('guild',0,0));IC2.torch=B(st('torch',0,1),.3,22);
 IC2.home=B(st('castle',0,tr),.42);IC2.castle=IC2.home;IC2.keep=B(st('keep',0,tr));
 IC2.ballista=B(st('ballista',0,1,w=>{const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);h.rotation.y=.5;w.add(h)}),.45,24);
 IC2.trebuchet=B(st('trebuchet',0,1,w=>{const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.y=.4;w.add(a)}),.4,24);
 const door=t=>w=>{const d=new THREE.Mesh(t?(GEO.door||(GEO.door=doorGeo())):(GEO.doorw||(GEO.doorw=doorGeoW())),matV);d.position.set(0,1.32,0);w.add(d)};
 for(const t of[0,1]){ICT[t].wall=B(st('wall',10,t),.3,22);ICT[t].tower=B(st('tower',0,t),.3,26);ICT[t].gate=B(st('gate',0,t,door(t)),.3,24);ICT[t].barracks=B(st('barracks',0,t))}
 ICT[0].path=IC2.path;ICT[1].path=miShot(miBlock(G=>{bxc(G,.5,0,.5,1,.9,1,'#7a7468');const R=rngf(11);for(let i=0;i<3;i++)for(let j=0;j<3;j++){const c=['#a9abb3','#8e9098','#b8bac2','#9a9ca4'][(i+j*2)%4];bxc(G,.18+i*.32,.9,.18+j*.32,.28,.06+R()*.03,.28,c)}}));
 for(const k in IC2){if(IC2[k].__px&&IC[k]&&(IC[k].__vec||IC[k].__hd))continue;IC[k]=IC2[k]}}
/* a research only changes a few icons: redraw just those (tier: the stone-able buildings, units: the soldier heads) */
function icoPart(kind,i){if(!ICR)icoInit();i=i|0;const set=(k,v)=>{if(v)IC[k]=v};let J;
 if(kind==='tier'){const tr=RS.done?1:0,SZI={tower:2,castle:5},st=(t,m,tier,ex)=>{const s={type:t,t:0,tier,sz:SZI[t]||1,gl:t==='gate'?3:0,tiles:[]},w=new THREE.Group();w.add(new THREE.Mesh(sGeo(s,m||0),matV));if(ex)ex(w);return w},B=(o,p,n)=>miShotB(o,.62,p==null?.36:p,n);
  J=[()=>set('wall',B(st('wall',10,tr),.3,22)),()=>set('tower',B(st('tower',0,tr),.3,26)),()=>set('gate',B(st('gate',0,tr,w=>{const d=new THREE.Mesh(tr?(GEO.door||(GEO.door=doorGeo())):(GEO.doorw||(GEO.doorw=doorGeoW())),matV);d.position.set(0,1.32,0);w.add(d)}),.3,24)),
   ()=>set('barracks',B(st('barracks',0,tr))),()=>{set('home',B(st('castle',0,tr),.42));IC.castle=IC.home},()=>set('keep',B(st('keep',0,tr)))]}
 else J=['knight','archer','captain','bannerman','king','guard'].map(k=>()=>set(k,miHead(k,0)));
 /* one icon per task so the redraw never holds a frame for long */
 if(i<J.length){J[i]();if(i+1<J.length)setTimeout(()=>{try{icoPart(kind,i+1)}catch(e){}},20)}}
/* every later 3D-icon refresh (research done, new kingdom colour) re-applies the Minecraft set */
{const _i3=icons3D;icons3D=function(){try{_i3()}catch(e){}try{mcIcons()}catch(e){console.error('mcIcons',e)}}}
try{mcIcons()}catch(e){console.error('mcIcons',e)}
/* three.js draws every object's UUID from Math.random: whatever builds meshes must use the real random, never the shared co-op stream
   (otherwise a cached geometry on one machine and a fresh one on the other would split the two simulations) */
{const viz=f=>function(){const m=Math.random;Math.random=REALR;try{return f.apply(this,arguments)}finally{Math.random=m}};
 addStruct=viz(addStruct);buildStructMesh=viz(buildStructMesh);if(typeof mcCorpse==='function')mcCorpse=viz(mcCorpse);build3D=viz(build3D);icons3D=viz(icons3D);icoPart=viz(icoPart);if(typeof addStairs==='function')addStairs=viz(addStairs)}

