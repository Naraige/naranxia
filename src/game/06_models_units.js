/* ---- unit models: voxel characters with separate head / both arms / tools (1 voxel = .05 tile) ---- */
let NOWEAP=false;const VX=.05,UM={};let RT=null;
function vb(G,cx,y0,cz,w,h,d,c){let T2=G;if(RT&&G===RT.G){if(cx<=-(RT.lax||3.2)&&y0>=1.8&&y0<13)T2=RT.LA;else if(y0>=RT.hy&&Math.abs(cx)<3.6&&cz>-2.9&&y0<24)T2=RT.HG}bxc(T2,cx*VX,y0*VX,cz*VX,w*VX,h*VX,d*VX,c)}
/* ---- Minecraft-style items: 16x16 pixel sprites extruded into cubes, outlined ---- */
const SPAL={b:'#7a5a2a',B:'#5a3f1c',w:'#f2f2f2',i:'#c9ced6',d:'#8a909c',g:'#ffd23c',G:'#fff1a0',h:'#c8962a',S:'#e8edf5',K:'#17171c',r:'#c04040',s:'#8a8a92'};
function sprGrid(){return Array.from({length:16},()=>Array(16).fill('.'))}
function sprLine(g,x0,y0,x1,y1,f){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0));for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/n),y=Math.round(y0+(y1-y0)*k/n);if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=f(k,n)}}
function sprOutline(g){const o=g.map(r=>r.slice());for(let y=0;y<16;y++)for(let x=0;x<16;x++)if(g[y][x]==='.')for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy;if(a>=0&&a<16&&b>=0&&b<16&&g[b][a]!=='.'){o[y][x]='K';break}}return o.map(r=>r.join(''))}
const SPR={};
function sprites(){if(SPR.pick)return SPR;
 const stick=(g,x0,y0,x1,y1)=>sprLine(g,x0,y0,x1,y1,k=>k%2?'B':'b');
 {const g=sprGrid();stick(g,0,15,10,5);for(let s=-5;s<=5;s++){const c=s*s*.07,x=Math.round(10+s*.707-.707*c),y=Math.round(5+s*.707+.707*c);if(x>=0&&x<16&&y>=0&&y<16){g[y][x]=s<-1?'w':s<3?'i':'d';if(x+1<16&&g[y][x+1]==='.')g[y][x+1]=s<1?'i':'d'}}SPR.pick=sprOutline(g)}
 {const g=sprGrid();stick(g,0,15,9,6);[[1,9,12],[2,8,13],[3,8,14],[4,8,14],[5,9,13],[6,10,12]].forEach(([y,a,b])=>{for(let x=a;x<=b;x++)g[y][x]=y<=2?'w':y>=5?'d':'i'});for(let y=2;y<=4;y++)g[y][14]='d';SPR.axe=sprOutline(g)}
 {const g=sprGrid();stick(g,0,15,9,6);for(let y=2;y<=6;y++)for(let x=8;x<=12;x++)if(x-8+ (y-2)>=1&&x-8+(y-2)<=7)g[y][x]=(x+y)%5===0?'d':'i';g[2][11]='w';g[3][12]='w';g[2][12]='w';SPR.hammer=sprOutline(g)}
 const sword=(w,i,d,hl)=>{const g=sprGrid();sprLine(g,3,12,14,1,k=>'i');sprLine(g,4,12,14,2,k=>'d');sprLine(g,3,11,13,1,k=>'w');sprLine(g,1,10,5,14,(k)=>'b');sprLine(g,0,15,3,12,k=>k?'B':'g');g[14][1]='b';g[15][0]='g';return sprOutline(g.map(r=>r.map(c=>c==='i'?i:c==='d'?d:c==='w'?w:c==='b'&&hl?'h':c)))};
 SPR.sword=sword('w','i','d',0);SPR.gsword=sword('G','g','h',1);
 {const g=sprGrid();for(let a=-70;a<=70;a+=5){const r=a*Math.PI/180,x=Math.round(Math.cos(r)*8),y=Math.round(8+Math.sin(r)*7.6);if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=a%10?'B':'b'}sprLine(g,3,1,3,15,()=>'S');SPR.bow=sprOutline(g)}
 return SPR}
function vsp(G,rows,x,oy,oz,p,th){for(let r=0;r<16;r++)for(let c=0;c<16;c++){const ch=rows[r][c];if(ch==='.')continue;vb(G,x,oy+(15-r)*p,oz+c*p,th||p*1.1,p,p,SPAL[ch])}}
/* tools in the grip frame (voxel units): origin = centre of the fist, handle along +z, the striking edge faces -y (down at the end of a swing) */
const TOOLG={};const HANDY=-4.5;
function tb(G,x,y,z,w,h,d,c){bxc(G,x*VX,(y-h/2)*VX,z*VX,w*VX,h*VX,d*VX,c)}
function handleG(G,L,wood,wrap){tb(G,0,0,(L-1.6)/2,.62,.62,L+1.6,wood);tb(G,0,0,0,.82,.82,1.8,wrap||'#4a2e16');tb(G,0,0,-1.55,.78,.78,.5,'#2e1c0e');tb(G,0,0,L-.25,.72,.72,.5,lighten(wood,-.2))}
function toolGeos(){if(TOOLG.axe)return TOOLG;const mk=f=>{const G=newG();f(G);return toGeo(G)},WD='#9a6a34',IR='#b9c0cc',ID='#7c8492',IL='#eef2f8';
 TOOLG.axe=mk(G=>{handleG(G,8.6,WD);tb(G,0,-.1,7.5,.7,1.1,1.5,ID);tb(G,0,-1.25,7.55,.42,1.5,1.9,IR);tb(G,0,-2.2,7.6,.4,.7,2.35,IR);tb(G,0,-2.62,7.6,.44,.32,2.5,IL);tb(G,0,.75,7.45,.62,.7,1.1,ID)});
 TOOLG.pick=mk(G=>{handleG(G,8.6,WD);tb(G,0,0,7.7,.85,1.2,1.3,ID);[[.95,7.55],[1.8,7.2],[2.55,6.75],[3.15,6.25]].forEach(([y,z],k)=>{tb(G,0,y,z,.55-.06*k,.8,.95,k===3?IL:IR);tb(G,0,-y,z,.55-.06*k,.8,.95,k===3?IL:IR)})});
 TOOLG.hoe=mk(G=>{handleG(G,9.4,WD);tb(G,0,-.55,9.05,.45,1.3,.5,ID);tb(G,0,-1.55,9.1,1.5,.75,.42,IR);tb(G,0,-1.98,9.1,1.56,.22,.46,IL)});
 TOOLG.hammer=mk(G=>{handleG(G,7.4,WD);tb(G,0,-.6,7.15,1.35,2.5,1.7,ID);tb(G,0,-1.95,7.15,1.45,.35,1.8,IL);tb(G,0,.62,7.15,1.4,.3,1.75,IR);tb(G,0,-.6,7.15,1.42,.3,1.78,'#5a606c')});
 const sword=(bl,bd,gd,gd2)=>mk(G=>{tb(G,0,0,0,.7,.7,2.0,'#4a2e16');tb(G,0,0,-1.45,1.0,1.0,.9,gd);tb(G,0,0,-1.95,.6,.6,.3,gd2);tb(G,0,0,1.25,.9,3.4,.75,gd);tb(G,0,1.85,1.25,.7,.5,.8,gd2);tb(G,0,-1.85,1.25,.7,.5,.8,gd2);
  tb(G,0,0,6.0,.34,1.25,8.6,bl);tb(G,0,0,5.6,.38,.32,7.0,bd);tb(G,0,0,10.6,.3,.8,1.0,bl);tb(G,0,0,11.25,.26,.36,.6,bl)});
 TOOLG.sword=PXON?pxSword():sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');TOOLG.gsword=PXON?pxCapSword():sword('#ffe9a0','#d0a03a','#c8862a','#fff6c8');
 TOOLG.rsword=PXON?pxRoyalSword():mk(G=>{const GDc='#d4a234',GD2c='#ecc964',ST='#dfe5ee',SD='#9aa3b2',SL='#f7f9fc';
  tb(G,0,0,-.1,.62,.62,2.5,'#1f2c5c');for(const z of[-.9,-.1,.7])tb(G,0,0,z,.68,.68,.16,GDc);
  tb(G,0,0,-1.75,1.0,1.0,.8,GDc);tb(G,0,0,-2.3,.62,.62,.4,GD2c);tb(G,0,0,-1.75,1.08,.42,.42,'#d8283a');
  tb(G,0,0,1.55,.95,5.4,.8,GDc);for(const s of[1,-1]){tb(G,0,s*2.9,1.75,.85,.7,1.1,GD2c);tb(G,0,s*2.95,2.35,.6,.45,.5,GDc)}tb(G,0,0,1.55,1.02,.9,.9,GD2c);tb(G,0,0,1.55,1.06,.46,.46,'#3a7aff');
  tb(G,0,0,2.4,.5,1.7,.9,GDc);
  tb(G,0,0,6.6,.38,1.6,7.6,ST);tb(G,0,0,11.5,.34,1.25,2.2,ST);tb(G,0,0,13.1,.3,.82,1.0,ST);tb(G,0,0,13.9,.24,.4,.6,SL);
  tb(G,0,0,7.2,.42,.36,8.6,SD);for(const s of[1,-1])tb(G,0,s*.74,7.6,.3,.12,10.2,SL)});
 TOOLG.halberd=PXON?pxHalberd():mk(G=>{const WD='#5e3f24',WD2='#3b2614',ST='#c9d0dc',SD='#7e8797',SL='#f2f5fa',GDc='#d4a234',GD2c='#ecc964',H=15.6;
  tb(G,0,0,5.0,.56,.56,21.6,WD);for(const z of[-1.9,-1.1,-.3,.5])tb(G,0,0,z,.64,.64,.3,WD2);
  tb(G,0,0,-5.75,.74,.74,.6,GDc);tb(G,0,0,-6.15,.5,.5,.3,GD2c);tb(G,0,0,7.2,.66,.66,.36,GDc);
  for(const s of[-1,1])tb(G,0,s*.32,H-1.9,.3,.1,3.6,SD);tb(G,0,0,H+.1,.84,.84,.9,GDc);tb(G,0,0,H-.5,.72,.72,.3,GD2c);
  tb(G,0,0,H+1.1,.42,1.12,1.2,ST);tb(G,0,0,H+2.4,.38,.9,1.4,ST);tb(G,0,0,H+3.8,.32,.64,1.4,ST);tb(G,0,0,H+5.0,.26,.4,1.0,SL);tb(G,0,0,H+5.75,.2,.2,.5,SL);tb(G,0,0,H+2.8,.46,.16,4.4,SL);
  tb(G,0,-.85,H,.34,1.0,2.3,SD);tb(G,0,-1.75,H,.3,.9,3.5,ST);tb(G,0,-2.55,H,.3,.8,4.3,ST);tb(G,0,-3.15,H,.3,.5,4.8,ST);tb(G,0,-3.48,H,.24,.24,4.6,SL);
  tb(G,0,-3.36,H-2.55,.26,.42,.5,ST);tb(G,0,-3.36,H+2.55,.26,.42,.5,ST);tb(G,0,-1.95,H,.38,.62,.62,GDc);tb(G,0,-1.95,H,.42,.28,.28,'#c42a36');
  tb(G,0,.85,H+.1,.3,1.0,.7,SD);tb(G,0,1.7,H-.1,.26,.8,.55,ST);tb(G,0,2.35,H-.4,.22,.6,.45,ST);tb(G,0,2.8,H-.75,.18,.4,.4,SL);
  tb(G,0,0,H-2.6,1.0,1.0,.16,GDc);tb(G,0,0,H-3.1,.96,.96,.8,'#a3202a');tb(G,0,0,H-3.8,.8,.8,.7,'#86161f');tb(G,0,0,H-4.35,.6,.6,.45,'#6a1018')});
 /* bow: grip in the fist, limbs along z, bent toward the archer (+y), string on the archer side */
 TOOLG.bow=PXON?pxBow():mk(G=>{tb(G,0,0,0,.8,.95,1.5,'#4a2e16');for(let k=0;k<6;k++){const z=1.05+k*1.08,y=.07*k*k;[1,-1].forEach(sg=>tb(G,0,y,sg*z,.55-.04*k,.75,1.2,k===5?'#5a3a1a':'#8a5a2a'))}[1,-1].forEach(sg=>tb(G,0,2.6,sg*6.75,.5,.5,.5,'#d9b13a'));
  tb(G,0,2.72,0,.14,.14,13.5,'#efe9d6')});
 return TOOLG}
const vx=(k,cx,y0,cz,w,h,d,c)=>bxc(RT.X[k],cx*VX,y0*VX,cz*VX,w*VX,h*VX,d*VX,c);

function fin(P,m){const parts=(P.parts||[]).map(p=>({...p,geo:toGeo(P.X[p.k])}));const t=g=>toGeo(g);const r={torso:t(P.G),head:t(P.HG),leg:t(P.LG),arm:t(P.AG),armL:P.LA.P.length?t(P.LA):null,hip:m.hip*VX,sh:m.sh*VX,neck:m.neck*VX,lx:m.lx*VX,ax:m.ax*VX,h:m.h*VX,sc:m.sc||1.35};
 r.head.translate(0,-r.neck,0);if(r.armL)r.armL.translate(r.ax,-r.sh,0);r.parts=parts;return r}
function mkModel(type,z){if(z>=20){const sv=THEME.c;THEME.c=z-20;try{return mkModel0(type,0)}finally{THEME.c=sv}}return mkModel0(type,z)}


/* ================= Minecraft-style characters: 8x8x8 head, 8x12x4 torso, 4x12x4 limbs (1 px = .46 voxel) ================= */
const MP_=.46,mp=n=>n*MP_;
function mcFace(G,skin,o){o=o||{};const e1=o.eye||'#ffffff',e2=o.pupil||'#3a3a9a',y=12.55;
 vb(G,-.9,y,1.86,.95,.5,.12,e1);vb(G,.9,y,1.86,.95,.5,.12,e1);vb(G,-.62,y,1.9,.5,.5,.12,e2);vb(G,.62,y,1.9,.5,.5,.12,e2);
 vb(G,0,12.0,1.88,.5,.5,.12,lighten(skin,-.12>0?0:0));vb(G,0,11.35,1.86,1.2,.28,.12,o.mouth||'#7a4a3a')}
function mcHead(G,skin,hair,o){o=o||{};vb(G,0,11,0,3.7,3.7,3.7,skin);
 if(hair){vb(G,0,14.05,0,3.85,.7,3.85,hair);vb(G,0,12.9,-1.75,3.85,1.9,.4,hair);vb(G,-1.8,13,0,.4,1.4,3.8,hair);vb(G,1.8,13,0,.4,1.4,3.8,hair);vb(G,0,13.6,1.8,3.85,.55,.3,hair)}
 mcFace(G,skin,o)}
function mcLimbs(G,LG,AG,c){/* legs */
 vb(LG,0,-5.5,0,1.84,5.5,1.84,c.pants);vb(LG,0,-5.5,0,1.9,1.1,2.0,c.shoes||'#4a4a52');
 /* right arm (AG) and left arm (in G, routed to LA) */
 const ax=2.76;vb(AG,0,-5.5,0,1.84,5.5,1.84,c.sleeve);if(c.bare!==false)vb(AG,0,-5.5,0,1.9,2.6,1.9,c.hand);vb(AG,0,-2.8,0,1.95,.3,1.95,lighten(c.sleeve,-.0));
 vb(G,-ax,5.0,0,1.84,5.5,1.84,c.sleeve);if(c.bare!==false)vb(G,-ax,5.0,0,1.9,2.6,1.9,c.hand);vb(G,-ax,7.7,0,1.95,.3,1.95,lighten(c.sleeve,-.0))}
function mcTorso(G,c){vb(G,0,5.5,0,3.7,5.5,1.84,c.shirt);vb(G,0,5.5,0,3.78,.5,1.9,c.belt||darkenC(c.shirt));if(c.chest)vb(G,0,7.6,.95,2.4,2.6,.1,c.chest)}
const darkenC=c=>lighten(c,-.0)&&(()=>{const h=hex(c);return '#'+h.map(v=>Math.round(v*.7).toString(16).padStart(2,'0')).join('')})();


/* ================= DUNGEON-HERO STYLE CHARACTERS =================
   A Minecraft character (8px head, 8x12x4 body, 4x12x4 limbs) with a face, hair and bare forearms, wearing simple chunky
   armour pieces built from boxes on the same pixel grid. Clean flat pixel colours (base, light top, dark lip). Boxes are
   collected first, then emitted with ambient occlusion at the corners of every merged quad (rays against the other pieces
   of the same body part), which gives soft contact shadows under brims, pauldrons, belts and plates. Units: pixels. */
const PXV=5.5/12,PXC=new Map();
const pxRGB=h=>{let c=PXC.get(h);if(!c){c=rgb(h);PXC.set(h,c)}return c};
const PXSH={F:.94,B:.78,R:.88,L:.82,T:1,D:.62};
let PXS=null,PXT=null;
const PXAD=(()=>{const N=14,r=[];for(let i=0;i<N;i++){const z=Math.sqrt(1-(i+.5)/N),q=Math.sqrt(1-z*z),a=i*2.39996;r.push([q*Math.cos(a),q*Math.sin(a),z])}return r})();
const PXAR=3.4,PXAK=.6,PXMQ=4;
function pxBox(Gx,x,y,z,w,h,d,paint,o){o=o||{};const b={Gx,x,y,z,w,h,d,paint,mat:o.mat||0,no:o.no||'',ao:o.ao!==false,only:!!o.only,grid:o.grid||null,m:PXT?PXT.m:null,mi:PXT?PXT.mi:null};if(PXS)PXS.push(b);else pxFlush([b])}
function pxScene(fn){const sv=PXS;PXS=[];let L;try{fn()}finally{L=PXS;PXS=sv}pxFlush(L)}
function pxRot(Gx,fn,rot,piv){const T=new THREE.Matrix4().makeTranslation(piv[0],piv[1],piv[2]).multiply(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0],rot[1],rot[2]))).multiply(new THREE.Matrix4().makeTranslation(-piv[0],-piv[1],-piv[2]));
 const sv=PXT,m=sv?sv.m.clone().multiply(T):T;PXT={m,mi:m.clone().invert()};try{fn(Gx)}finally{PXT=sv}}
const pxMP=(m,p)=>{if(!m)return p;const e=m.elements;return[e[0]*p[0]+e[4]*p[1]+e[8]*p[2]+e[12],e[1]*p[0]+e[5]*p[1]+e[9]*p[2]+e[13],e[2]*p[0]+e[6]*p[1]+e[10]*p[2]+e[14]]};
const pxMD=(m,p)=>{if(!m)return p;const e=m.elements;return[e[0]*p[0]+e[4]*p[1]+e[8]*p[2],e[1]*p[0]+e[5]*p[1]+e[9]*p[2],e[2]*p[0]+e[6]*p[1]+e[10]*p[2]]};
function pxHit(o,d,b){let O=o,D=d;if(b.mi){O=pxMP(b.mi,o);D=pxMD(b.mi,d)}let t0=1e-4,t1=PXAR;const lo=[b.x,b.y,b.z],hi=[b.x+b.w,b.y+b.h,b.z+b.d];
 for(let a=0;a<3;a++){if(Math.abs(D[a])<1e-9){if(O[a]<lo[a]||O[a]>hi[a])return Infinity;continue}let ta=(lo[a]-O[a])/D[a],tb=(hi[a]-O[a])/D[a];if(ta>tb){const t=ta;ta=tb;tb=t}if(ta>t0)t0=ta;if(tb<t1)t1=tb;if(t0>t1)return Infinity}return t0}
function pxOcc(p,n,L,self){const ax=Math.abs(n[0])<.9?[1,0,0]:[0,1,0],t1=[n[1]*ax[2]-n[2]*ax[1],n[2]*ax[0]-n[0]*ax[2],n[0]*ax[1]-n[1]*ax[0]],l1=Math.hypot(t1[0],t1[1],t1[2]);t1[0]/=l1;t1[1]/=l1;t1[2]/=l1;
 const t2=[n[1]*t1[2]-n[2]*t1[1],n[2]*t1[0]-n[0]*t1[2],n[0]*t1[1]-n[1]*t1[0]];let s=0;
 for(const q of PXAD){const d=[t1[0]*q[0]+t2[0]*q[1]+n[0]*q[2],t1[1]*q[0]+t2[1]*q[1]+n[1]*q[2],t1[2]*q[0]+t2[2]*q[1]+n[2]*q[2]];let tm=Infinity;
  for(const b of L){if(b===self)continue;const t=pxHit(p,d,b);if(t<tm)tm=t}if(tm<PXAR)s+=1-tm/PXAR}
 return s/PXAD.length}
function pxFlush(L){const by=new Map();for(const b of L){if(!by.has(b.Gx))by.set(b.Gx,[]);by.get(b.Gx).push(b)}
 for(const[,list]of by){const occ=list.filter(b=>b.ao);for(const b of list)if(!b.only)pxEmit(b,occ)}}
function pxEmit(b,occ){const s=PXV*VX,mo=BMAT;BMAT=b.mat;
 const W=b.grid?b.grid[0]:Math.max(1,Math.round(b.w)),H=b.grid?b.grid[1]:Math.max(1,Math.round(b.h)),D=b.grid?b.grid[2]:Math.max(1,Math.round(b.d)),sx=b.w/W,sy=b.h/H,sz=b.d/D,x0=b.x,y0=b.y,z0=b.z,x1=x0+b.w,y1=y0+b.h,z1=z0+b.d;
 const F=[['F',[x0,y0,z1],[sx,0,0],[0,sy,0],[0,0,1],W,H],['B',[x1,y0,z0],[-sx,0,0],[0,sy,0],[0,0,-1],W,H],['R',[x1,y0,z1],[0,0,-sz],[0,sy,0],[1,0,0],D,H],
  ['L',[x0,y0,z0],[0,0,sz],[0,sy,0],[-1,0,0],D,H],['T',[x0,y1,z1],[sx,0,0],[0,0,-sz],[0,1,0],W,D],['D',[x0,y0,z0],[sx,0,0],[0,0,sz],[0,-1,0],W,D]];
 try{for(const[f,o,du,dv,n,FW,FH]of F){if(b.no.indexOf(f)>=0)continue;const nW=pxMD(b.m,n),C=new Array(FW*FH);
  for(let v=0;v<FH;v++)for(let u=0;u<FW;u++)C[v*FW+u]=b.paint(f,u,v,FW,FH)||null;
  const dn=new Uint8Array(FW*FH),k0=PXSH[f],ac=new Map();
  const aoAt=(uu,vv)=>{const key=uu*1000+vv;let r=ac.get(key);if(r!==undefined)return r;r=0;if(occ.length>1){
    const p=[o[0]+du[0]*uu+dv[0]*vv+n[0]*.03,o[1]+du[1]*uu+dv[1]*vv+n[1]*.03,o[2]+du[2]*uu+dv[2]*vv+n[2]*.03];r=pxOcc(pxMP(b.m,p),nW,occ,b)}ac.set(key,r);return r};
  for(let v=0;v<FH;v++)for(let u=0;u<FW;u++){const i=v*FW+u,c=C[i];if(dn[i]||!c)continue;let w=1;while(u+w<FW&&w<PXMQ&&!dn[i+w]&&C[i+w]===c)w++;
   let h=1;grow:while(v+h<FH&&h<PXMQ){for(let q=0;q<w;q++){const j=(v+h)*FW+u+q;if(dn[j]||C[j]!==c)break grow}h++}
   for(let a=0;a<h;a++)for(let q=0;q<w;q++)dn[(v+a)*FW+u+q]=1;
   const P=(uu,vv)=>{const p=pxMP(b.m,[o[0]+du[0]*uu+dv[0]*vv,o[1]+du[1]*uu+dv[1]*vv,o[2]+du[2]*uu+dv[2]*vv]);return[p[0]*s,p[1]*s,p[2]*s]},
    ins=.3,col=(uu,vv)=>{const a=aoAt(uu+(uu>u?-ins:ins)*0,vv);return shade(pxRGB(c),k0*(1-PXAK*Math.min(1,a*1.3)))};
   let A=P(u+w,v),B=P(u+w,v+h),Cc=P(u,v+h),Dd=P(u,v),cA=col(u+w,v),cB=col(u+w,v+h),cC=col(u,v+h),cD=col(u,v);
   const e1=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],e2=[Cc[0]-B[0],Cc[1]-B[1],Cc[2]-B[2]],cr=[e1[1]*e2[2]-e1[2]*e2[1],e1[2]*e2[0]-e1[0]*e2[2],e1[0]*e2[1]-e1[1]*e2[0]];
   if(cr[0]*nW[0]+cr[1]*nW[1]+cr[2]*nW[2]<0){let t=A;A=Dd;Dd=t;t=B;B=Cc;Cc=t;t=cA;cA=cD;cD=t;t=cB;cB=cC;cC=t}
   quad(b.Gx,A,B,Cc,Dd,nW,cA,cB,cC,cD)}}}finally{BMAT=mo}}
function pxCat(Gx,T,pf,nf,flip){const o=Gx.P.length/3,n=T.P.length/3;if(Gx.M)while(Gx.M.length<o)Gx.M.push(0);
 for(let i=0;i<n;i++){const p=[T.P[i*3],T.P[i*3+1],T.P[i*3+2]],q=[T.N[i*3],T.N[i*3+1],T.N[i*3+2]],P2=pf?pf(p):p,N2=nf?nf(q):q;
  Gx.P.push(P2[0],P2[1],P2[2]);Gx.N.push(N2[0],N2[1],N2[2]);Gx.C.push(T.C[i*3],T.C[i*3+1],T.C[i*3+2]);if(Gx.M)Gx.M.push((T.M&&T.M[i])||0)}
 for(let i=0;i<T.I.length;i+=3){if(flip)Gx.I.push(T.I[i]+o,T.I[i+2]+o,T.I[i+1]+o);else Gx.I.push(T.I[i]+o,T.I[i+1]+o,T.I[i+2]+o)}if(T.hm)Gx.hm=1}
function pxArms(P,fn){const T=newG();pxScene(()=>fn(T));pxCat(P.AG,T);pxCat(P.LA,T,p=>[-p[0]-2.76*VX,p[1]+10.45*VX,p[2]],q=>[-q[0],q[1],q[2]],true)}
const shadeHex=(c,k)=>{const h=hex(c);return '#'+h.map(q=>Math.max(0,Math.min(255,Math.round(q*k))).toString(16).padStart(2,'0')).join('')};
/* palettes are written as the colour you see; PD turns them into albedo (the toon light lifts lit faces by about 1.4) */
const PD=h=>shadeHex(h,.704),PDP=a=>a.map(PD);
const PXST=PDP(['#3f4651','#6b7380','#99a0aa','#c4c9d0','#e6e9ed']),PXGO=PDP(['#7d5410','#b8861c','#ecbd3a','#ffdc6e','#fff2bc']),
 PXLE=PDP(['#3c220e','#5e381c','#86522c','#a96c3c','#c88a54']),PXDK=PD('#15171c');
const teamPal=c=>[shadeHex(c,.42),shadeHex(c,.62),shadeHex(c,.82),c,lighten(c,.28)];
/* clean bevel: light top row, dark bottom lip, flat base; light top face, dark underside */
const pBv=(P,o)=>{o=o||{};return(f,u,v,W,H)=>{if(f==='T')return o.top||P[3];if(f==='D')return P[1];if(H>=2&&v===H-1)return P[3];if(H>=3&&v===0)return o.lip||P[1];return P[2]}};
const pFl=c=>()=>c;
/* a ring of plate (or cloth) around a limb: bright top row, dark lip, a few worn pixels */
const pRing=(P,o)=>{o=o||{};return(f,u,v,W,H)=>{if(f==='T')return P[3];if(f==='D')return P[0];if(v===H-1)return o.hi?P[4]:P[3];if(H>=2&&v===0)return P[1];
 if(o.ln){if(o.ln.indexOf(v)>=0)return P[1];if(o.ln.indexOf(v-1)>=0)return P[3]}if(o.fr&&f==='F'&&(u===Math.floor(W/2)))return P[3];if(o.fg&&f==='F'&&v<=1)return u%2?P[1]:P[3];
 if(o.n!==false){const n=pxN(f,u,v,o.s||0);if(n<.13)return P[1];if(n>.91)return P[3]}return P[2]}};
const pxN=(f,u,v,s)=>{const x=Math.sin(u*12.9898+v*78.233+f.charCodeAt(0)*37.719+s*11.3)*43758.5453;return x-Math.floor(x)};
/* rings stacked down a limb (4px limb centred on x=z=0): each [y0, height, inflate, palette, options] */
function pxRings(T,L){for(const r of L){const[y0,h,inf,Pl,o]=r;pxBox(T,-2-inf,y0,-2-inf,4+2*inf,h,4+2*inf,pRing(Pl,o),{mat:o&&o.mat!==undefined?o.mat:4})}}
const PXWR=PDP(['#6e6250','#948670','#b8a98e','#d4c6aa','#e6dcc4']);
/* ---- faces: skin, eyes, brows, hair; hair styles: 0 short, 1 fringe, 2 long, 3 none ---- */
const SKINS=[['#a8664c','#c98262','#e8a684'],['#8f5a40','#b57452','#d4946e'],['#6e4430','#93603f','#b07a54'],['#b27a5c','#d69c78','#f0bc96']];
function pxHead(P,o){const Sk=PDP(SKINS[o.skin||0]),Hr=o.hair?PDP(o.hair):null,st=o.hs||0,EY=PD(o.eye||'#3fa65a'),WH=PD('#f4f4f4'),BR=Hr?Hr[0]:PD('#4a3020'),MO=PD('#8e4a3c'),Bd=o.beard?PDP(o.beard):null;
 pxBox(P.HG,-4,24,-4,8,8,8,(f,u,v,W,H)=>{
  if(f==='T')return Hr?((u+v)%3===0?Hr[2]:Hr[1]):Sk[1];if(f==='D')return Sk[0];
  if(f==='F'){if(Hr){if(v===7)return Hr[1];if(v===6&&(st===1?(u!==5):(u<=1||u>=6||u===3)))return u===3?Hr[2]:Hr[1];if(v===5&&(u===0||u===7)&&st!==3)return Hr[0]}
   if(v===4&&(u===1||u===2||u===5||u===6))return BR;if(v===3){if(u===1||u===6)return WH;if(u===2||u===5)return EY}
   if(Bd&&v<=2&&!(v>=1&&(u===3||u===4))&&!(v===2&&u>=2&&u<=5))return v===0?Bd[0]:Bd[1];
   if(v===2&&(u===3||u===4))return Sk[1];if(v===1&&(u===3||u===4))return MO;return v===0?Sk[1]:Sk[2]}
  const back=(f==='B')||(f==='R'&&u>=4)||(f==='L'&&u<=3);
  if(Hr){if(v>=6)return Hr[1];if(back&&v>=(st===2?1:3))return v===3&&st!==2?Hr[0]:Hr[1];if(st===2&&(f==='R'?u>=2:f==='L'?u<=5:false)&&v>=2)return Hr[1]}
  if((f==='R'&&u===3||f==='L'&&u===4)&&v===3)return Sk[0];return Sk[1]},{mat:0})}
/* ---- the body underneath: shirt (sleeves), bare forearms, trousers, boots ---- */
function pxBody(P,o){const Sh=PDP(o.shirt||['#283c5e','#3a5788','#4b6fa8','#6a8cc4']),Pa=PDP(o.pants||['#1d2a42','#2a3b5c','#344a72']),Bt=o.boots?PDP(o.boots):PXLE;
 pxBox(P.G,-4,12,-2,8,12,4,(f,u,v,W,H)=>{if(f==='T')return Sh[2];if(f==='D')return Sh[0];if(v===H-1)return Sh[3];if(v<=1)return Sh[1];return Sh[2]},{mat:0});
 pxBox(P.LG,-2,-12,-2,4,12,4,(f,u,v,W,H)=>{if(f==='T')return Pa[2];if(f==='D')return Bt[0];if(v<=3)return v===3?Bt[3]:(v===0?Bt[1]:Bt[2]);return v===4?Pa[0]:Pa[1+(v>9?1:0)]},{mat:0});
 pxBox(P.LG,-30,-40,-30,60,28,60,()=>PXDK,{only:true})}
function pxArm0(T,o){const Sk=PDP(SKINS[o.skin||0]),Sh=PDP(o.shirt||['#283c5e','#3a5788','#4b6fa8','#6a8cc4']),bare=o.bare!==false,sl=o.sleeve||6;
 pxBox(T,-2,-12,-2,4,12,4,(f,u,v,W,H)=>{if(f==='T')return Sh[2];if(f==='D')return Sk[0];if(!bare||v>=12-sl)return v===12-sl?Sh[1]:Sh[2];return v<=1?Sk[1]:Sk[2]},{mat:0})}

const pE=(u,v,W,H)=>Math.min(u,v,W-1-u,H-1-v);
/* ================= BLOCKBENCH-STYLE SKINS =================
   Each unit is the plain Minecraft player model: six base cubes and six outer-layer cubes (hat +0.5px, jacket / sleeves /
   trousers +0.25px, texture kept on the 64x64 grid, '.' = transparent so the base layer shows through), plus only a few
   extra cubes (crest, pauldrons, brim, quiver). The detail lives in the pixel art below, one string per row, top row first.
   A face given as '~R' is the mirror of face R; 'F' alone reuses face F. */
function pxPaint(spec,map){return(f,u,v,W,H)=>{let s=spec&&spec[f];if(!s)return null;let mir=false;if(typeof s==='string'){mir=s[0]==='~';s=spec[mir?s.slice(1):s]}
 if(typeof s==='function')return s(u,v,W,H);const row=s[H-1-v];if(!row)return null;const c=row[mir?W-1-u:u];if(c===undefined||c==='.')return null;const col=map[c];return col===undefined?null:col}}
function pxSkin(P,K,map,o){o=o||{};const B=(Gx,x,y,z,w,h,d,spec,g,m,ao)=>{if(spec)pxBox(Gx,x,y,z,w,h,d,pxPaint(spec,map),{mat:m||0,grid:g,ao:ao!==false})};
 B(P.HG,-4,24,-4,8,8,8,K.head,null,0);B(P.HG,-4.5,23.5,-4.5,9,9,9,K.hat,[8,8,8],K.hatMat||0,false);
 B(P.G,-4,12,-2,8,12,4,K.body,null,0);B(P.G,-4.25,11.75,-2.25,8.5,12.5,4.5,K.jacket,[8,12,4],K.jacketMat||0,false);
 B(P.LG,-2,-12,-2,4,12,4,K.leg,null,0);B(P.LG,-2.25,-12.25,-2.25,4.5,12.5,4.5,K.pants,[4,12,4],K.pantsMat||0,false);
 pxBox(P.LG,-30,-40,-30,60,28,60,()=>null,{only:true})}
function pxSkinArms(T,K,map){if(K.arm)pxBox(T,-2,-12,-2,4,12,4,pxPaint(K.arm,map),{mat:0});if(K.sleeve)pxBox(T,-2.25,-12.25,-2.25,4.5,12.5,4.5,pxPaint(K.sleeve,map),{mat:K.sleeveMat||0,grid:[4,12,4],ao:false})}
/* colour maps: letters to display colours, turned into albedo once */
const pxMap=(o,tm)=>{const m={};for(const k in o)m[k]=PD(o[k]);if(tm){const T=teamPal(tm);m.V=T[0];m.t=T[1];m.T=T[2];m.U=T[3];m.Y=T[4]}return m};
/* ---------------- KNIGHT ---------------- */
const SK_KNIGHT={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
 head:{F:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss'],B:'F',R:'F',L:'F',T:'F',D:'F'},
 hat:{F:['hhhhhhhh','llllllll','mmmGGmmm','kkkGGkkk','mmmGGmmm','mmmggmmm','dmdggdmd','dddddddd'],
  R:['hhhhhhhh','llllllll','mmmmmmml','kkmmGmmm','dmmmmmmm','mmmmmmmm','mmmmmmmd','dddddddd'],L:'~R',
  B:['hhhhhhhh','lllhllll','mmmlmmmm','mmmlmmmm','mmmlmmmm','dmmlmmmd','dmmlmmmd','dddddddd'],
  T:['lhhhhhhl','hlmggmlh','hmmggmmh','hmmggmmh','hmmggmmh','hmmggmmh','hlmggmlh','lhhGGhhl']},
 body:{F:['xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx','xyxyxyxy','yxyxyxyx'],B:'F',R:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],L:'R',T:['dddddddd','dddddddd','dddddddd','dddddddd'],D:'T'},
 jacket:{F:['whhhhhhw','hlmmmmlh','lmtTTtml','lmtGGtml','lmGGggml','dmtggtmd','dmtTTtmd','nbbGGbbn','dltTTtld','mhtTTthm','dmtTTtmd','ddtTTtdd'],
  R:['hhhh','llll','mmml','mmmm','mmmm','dmmm','dddd','bbbn','mmmm','hhhh','mmmm','dddd'],L:'~R',
  B:['hhhhhhhh','llllllll','mmtTTtmm','mmtTTtmm','dmtTTtmd','dmtTTtmd','dmtTTtmd','nbbbbbbn','dmtTTtmd','mhtTTthm','dmtTTtmd','ddtTTtdd'],
  T:['hhhhhhhh','hllllllh','hllllllh','whhhhhhw']},
 arm:{F:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],B:'F',R:'F',L:'F',T:['xxxx','xxxx','xxxx','xxxx'],D:'T'},
 sleeve:{F:['hhhh','llll','mlmm','dmmd','....','whhw','lmml','....','hhhh','lmml','hhhh','lmlm'],
  R:['hhhh','llll','mmmm','dmmd','....','hhhh','lmml','....','hhhh','mmmm','hhhh','mdmd'],L:'R',
  B:['llll','mmmm','dmmd','dddd','....','hhhh','mmmm','....','llll','mmmm','llll','dmdm'],T:['hhhh','hllh','hllh','hhhh'],D:['dddd','dddd','dddd','dddd']},
 leg:{F:['xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx','xyxy','yxyx'],B:'F',R:'F',L:'F',T:['xxxx','xxxx','xxxx','xxxx'],D:'T'},
 pants:{F:['llll','mmmm','dmmd','....','hhhh','hwwh','lmml','....','hllh','lmml','bBBb','dmmd'],
  R:['llll','mmmm','dmmm','....','hhhh','hhhl','lmml','....','hlll','lmml','bBBb','dmmd'],L:'~R',
  B:['llll','mmmm','dmmd','....','llll','mmmm','dmmd','....','llll','mmmm','bbbb','dddd'],T:['llll','llll','llll','llll'],D:['dddd','dddd','dddd','dddd']}};
function pxKnight(P,AL){const map=pxMap({k:'#141519',d:'#2c2e34',m:'#4a4d55',l:'#6d717a',h:'#949aa3',w:'#c4c8ce',x:'#1d1e22',y:'#2c2e33',
  g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16',s:'#c98262'},thp()),K=SK_KNIGHT,S=n=>map[n];
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-.5,32.5,-4.25,1,1,8.5,pxPaint({F:['G'],B:['o'],R:['GGGGGGGG'],L:'R',T:['g','G','G','G','G','G','G','g'],D:['o','o','o','o','o','o','o','o']},{G:map.G,o:map.o,g:map.g}),{mat:4,grid:[1,1,8]});
  if(AL>=2){pxBox(P.HG,-.5,33.5,-3,1,2,4,pxPaint({F:['U','T'],B:['T','t'],R:['UUUU','TTTT'],L:'R',T:['U','U','U','U'],D:['t','t','t','t']},map),{mat:7,grid:[1,2,4]});pxBox(P.HG,-.5,32,-5.6,1,2.5,2,pxPaint({F:['T','T','t'],B:'F',R:['TT','TT','tt'],L:'R',T:['T','T'],D:['t','t']},map),{mat:7,grid:[1,3,2]})}});
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3,-1.25,-3,6,3,6,pxPaint({T:['mllllm','lhhhhl','lhwwhl','lhhhhl','lhhhhl','mllllm'],F:['hhhhhh','lmmmml','oggggo'],B:'F',R:'F',L:'F',D:['dddddd','dddddd','dddddd','dddddd','dddddd','dddddd']},map),{mat:4})});
}
/* ---------------- ROYAL GUARD ---------------- */
const SK_GUARD={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
 head:SK_KNIGHT.head,
 hat:{F:['UUUUUUUU','TTTUUTTT','oggGGggo','TTTTTTTT','kkkkkkkk','tllllllt','tlhllhlt','tddddddt'],
  R:['UUUUUUUU','TTTTTTTU','gggggggo','TTTTTTTT','kkTTTTTT','lltTTTTT','ldtTTTTt','dttttttt'],L:'~R',
  B:['UUUUUUUU','TTTTTTTT','gggggggg','TTTTTTTT','TTTTTTTT','tTTTTTTt','tTTTTTTt','tttttttt'],
  T:['TUUUUUUT','UTTTTTTU','UTTggTTU','UTTggTTU','UTTggTTU','UTTggTTU','UTTTTTTU','TUUUUUUT']},
 body:SK_KNIGHT.body,
 jacket:{F:['UUUUUUUU','TtrRRrtT','TtRgGRtT','TtgGGgtT','TtRgGRtT','TtRRRRtT','TtrRRrtT','nbbGGbbn','TtRRRRtT','UtRRRRtU','TtRRRRtT','ttggggtt'],
  R:['UUUU','TTTT','TTTT','TTTT','TTTT','tTTT','tttt','bbbn','TTTT','UUUU','TTTT','tttt'],L:'~R',
  B:['UUUUUUUU','TTrrrrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TTrRRrTT','TtrRRrtT','nbbbbbbn','TtrRRrtT','UtrRRrtU','TtrRRrtT','ttggggtt'],
  T:['UUUUUUUU','UTTTTTTU','UTTTTTTU','UUUUUUUU']},
 arm:SK_KNIGHT.arm,
 sleeve:{F:['UUUU','TTTT','TTTT','oggo','....','UUUU','TttT','....','hhhh','lmml','GggG','lmlm'],
  R:['UUUU','TTTT','TTTT','oggo','....','UUUU','TTTT','....','hhhh','mmmm','gggo','mdmd'],L:'R',
  B:['TTTT','TTTT','tTTt','oggo','....','UUUU','TTTT','....','llll','mmmm','oggo','dmdm'],T:['UUUU','UTTU','UTTU','UUUU'],D:['dddd','dddd','dddd','dddd']},
 leg:SK_KNIGHT.leg,
 pants:{F:['TTTT','TTTT','tTTt','....','hhhh','hwwh','lmml','....','UUUU','TttT','bBBb','dmmd'],
  R:['TTTT','TTTT','tTTT','....','hhhh','hhhl','lmml','....','UUUU','TTTT','bBBb','dmmd'],L:'~R',
  B:['TTTT','TTTT','tTTt','....','llll','mmmm','dmmd','....','UUUU','TTTT','bbbb','dddd'],T:['TTTT','TTTT','TTTT','TTTT'],D:['dddd','dddd','dddd','dddd']}};
function pxGuard(P,AL){const map=pxMap({k:'#141519',d:'#2c2e34',m:'#4a4d55',l:'#6d717a',h:'#949aa3',w:'#c4c8ce',x:'#1d1e22',y:'#2c2e33',
  g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16',s:'#c98262',R:'#a62832',r:'#7a1a24',Q:'#c94450'},thp()),K=SK_GUARD;
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-.6,32.5,-2.5,1.2,3,3,pxPaint({F:['Q','R','r'],B:'F',R:['QQQ','RRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},map),{mat:7,grid:[1,3,3]});
  pxBox(P.HG,-.6,31,-5.2,1.2,3.5,2.7,pxPaint({F:['R','R','r','r'],B:'F',R:['QRR','RRR','rRR','rrr'],L:'R',T:['Q','Q','Q'],D:['r','r','r']},map),{mat:7,grid:[1,4,3]})});
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3.25,-1.25,-3.25,6.5,3,6.5,pxPaint({T:['TUUUUT','UYYYYU','UYYYYU','UYYYYU','UYYYYU','TUUUUT'],F:['UUUUUU','TTTTTT','oggggo'],B:'F',R:'F',L:'F',D:['tttttt','tttttt','tttttt','tttttt','tttttt','tttttt']},map),{mat:4,grid:[6,3,6]})});
}
/* ---------------- ARCHER ---------------- */
const SK_ARCHER={hatMat:7,jacketMat:0,
 head:{F:['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','sssSSsss','sssmmsss','ssssssss'],
  R:['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',
  B:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','ssssssss'],T:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh'],D:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss']},
 hat:{F:['GGGGGGGG','gggggggg','g......g','g......g','g......g','g......g','q......q','q......q'],
  R:['GGGGGGGG','gggggggg','gggggggg','qggggggg','qggggggg','qggggggq','qqgggggq','qqqqqqqq'],L:'~R',
  B:['GGGGGGGG','gggggggg','gggggggg','gggqgggg','gggqgggg','gggqgggg','qggqgggq','qqqqqqqq'],
  T:['gggggggg','gGgggGgg','gggggggg','ggGgggGg','gggggggg','gGgggggg','ggggGggg','GGGGGGGG']},
 body:{F:['VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],B:'F',R:['VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','vvvv','vvvv'],L:'R',T:['VVVVVVVV','VVVVVVVV','VVVVVVVV','VVVVVVVV'],D:['vvvvvvvv','vvvvvvvv','vvvvvvvv','vvvvvvvv']},
 jacket:{F:['.bbbbnb.','bBbbbnBb','bbBbnbbb','bbBnbbbb','bbnBbbbb','bnbBbbbb','nbbBbbbn','nnnyynnn','bbbBbbbb','bbbBbbbb','bbbbbbbb','nbbbbbbn'],
  R:['bbbb','bbbb','bbbb','bbbb','bbbb','bbbb','nbbb','nnnn','bbbb','bbbb','bbbb','nnnn'],L:'~R',
  B:['.bbnbbb.','bbbbnbbb','bbbbbnbb','bbbbbbnb','bbbbbbnb','bbbbbbbn','nbbbbbbn','nnnnnnnn','bbbbbbbb','bbbbbbbb','bbbbbbbb','nbbbbbbn'],T:['bbbbbbbb','b......b','b......b','bbbbbbbb']},
 arm:{F:['VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','ssss','ssss','ssss','ssss','SsSs','SSSS'],B:'F',R:'F',L:'F',T:['VVVV','VVVV','VVVV','VVVV'],D:['SSSS','SSSS','SSSS','SSSS']},
 sleeve:{F:['....','....','....','....','....','VVVV','....','BBBB','bnbb','bybb','nnnn','....'],R:['....','....','....','....','....','VVVV','....','BBBB','bbnb','bbbb','nnnn','....'],L:'R',B:'R',T:null,D:null},
 leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','pPPp','PPPP','bbbb','bbbb','bbbb','nnnn'],B:'F',R:'F',L:'F',T:['PPPP','PPPP','PPPP','PPPP'],D:['nnnn','nnnn','nnnn','nnnn']},
 pants:{F:['....','....','....','....','....','....','BBBB','bbbb','bnbb','bbbb','bbbb','nnnn'],R:['....','....','....','....','....','....','BBBB','bbbb','bbnb','bbbb','bbbb','nnnn'],L:'~R',B:'R',T:null,D:['nnnn','nnnn','nnnn','nnnn']}};
function pxArcher(P,AL){const map=pxMap({s:'#e8a684',S:'#c98262',h:'#6b3e1e',r:'#4a2a14',e:'#3fa65a',w:'#f4f4f4',m:'#8e4a3c',
  G:'#58a852',g:'#3f8a3e',q:'#2f6a30',V:'#3f8a3e',v:'#2f6a30',b:'#86522c',B:'#a96c3c',n:'#5e381c',y:'#ecbd3a',P:'#4e3a26',p:'#3a2a1a'}),K=SK_ARCHER;
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-1.5,26.5,-5.75,3,3.5,1.25,pxPaint({F:['ggg','ggg','qqq'],B:['GGG','ggg','qqq'],R:['G','g','q'],L:'R',T:['GGG'],D:['qqq']},map),{mat:7,grid:[3,3,1]});
  pxRot(P.G,T=>{pxBox(T,.6,13,-5.1,3,8.5,2.6,pxPaint({F:['BBB','bbb','bbb','bnb','bbb','bbb','yyy','nnn'],B:'F',R:['BB','bb','bb','bb','bb','bb','yy','nn'],L:'R',T:['nnn','nnn'],D:['nnn','nnn']},map),{mat:0,grid:[3,8,2]});
   pxBox(T,1,21.5,-4.4,2.2,1.4,1.2,pxPaint({F:['wQw','ffr'],B:'F',R:['w','f'],L:'R',T:['wQw'],D:['fff']},{w:PD('#f2f2f2'),Q:PD('#d03a2e'),f:PD('#c8a070'),r:PD('#d03a2e')}),{mat:0,grid:[3,2,1]})},[0,0,-.32],[2,17,-4]);
 });
 pxArms(P,T=>pxSkinArms(T,K,map));
}
/* ---------------- PEASANT (six variants: hat, skin, hair, beard, tunic colour) ---------------- */
function pxPeasant(P,AL){const pv=ZVAR&&ZVAR.hint==='p'?ZVAR.v%6:0;
 const SH=[['#6e4424','#8a5a32'],['#56642c','#6e7e3e'],['#6a3a32','#7c4a42'],['#3e4e62','#55667a'],['#6e6038','#8a7a52'],['#563a54','#6a4a6a']][pv],
  HR=[['#5a3a1a','#3a2410'],['#2a1a10','#160e08'],['#8a6a3a','#6a5028'],['#1e1a18','#120f0e'],['#a0522d','#6e3216'],['#6a6a62','#4a4a44']][pv],
  SK=[['#e8a684','#c98262'],['#f0bc96','#d69c78'],['#d4946e','#b57452'],['#e8a684','#c98262'],['#b07a54','#93603f'],['#f0bc96','#d69c78']][pv],hat=[0,2,0,1,3,0][pv],beard=pv===3||pv===5;
 const map=pxMap({s:SK[0],S:SK[1],h:HR[0],r:HR[1],e:['#3a78c2','#6b4423','#3fa65a','#6b4423','#3a78c2','#6b4423'][pv],w:'#f4f4f4',m:'#8e4a3c',
  V:SH[1],v:SH[0],a:'#ddd0ae',A:'#b4a682',c:'#c8a868',C:'#a08448',P:'#433824',p:'#2e2618',b:'#86522c',n:'#5e381c',W:'#d4c6aa',X:'#b8a98e',
  Z:'#d4b45c',z:'#a88a42',Y:'#ecd27a',k:'#6a5038',K:'#86684a',q:'#d8cbaa',Q:'#b0a284'});
 const face=beard?['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','rssSSssr','rrrmmrrr','rrrrrrrr']:['hhhhhhhh','hhhhhhhh','hsssssss','srrssrrs','swessews','sssSSsss','sssmmsss','ssssssss'];
 const K={jacketMat:0,
  head:{F:face,R:['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',B:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','ssssssss'],T:['hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh','hhhhhhhh'],D:['ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss','ssssssss']},
  hat:hat===0?null
   :hat===1?{F:['KKKKKKKK','kkkkkkkk','kkkkkkkk','........','........','........','........','........'],R:['KKKKKKKK','kkkkkkkk','kkkkkkkk','kkkk....','........','........','........','........'],L:'~R',B:['KKKKKKKK','kkkkkkkk','kkkkkkkk','kkkkkkkk','kkkkkkkk','........','........','........'],T:['KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK','KKKKKKKK']}
   :hat===2?{F:['qqqqqqqq','QqqqqqqQ','Q......Q','........','........','........','........','........'],R:['qqqqqqqq','qqqqqqqq','qqqqqqqq','Qqqqqqqq','.Qqqqqqq','..QQqqqq','.....QQq','........'],L:'~R',B:['qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','QqqqqqqQ','QQqqqqQQ','..QqqQ..'],T:['qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq','qqqqqqqq']}
   :null,
  body:{F:['VVVVVVVV','VVVssVVV','VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],B:['VVVVVVVV','VVVVVVVV','VVVVVVVV','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vVVVVVVv','vvvvvvvv','vvvvvvvv'],R:['VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','VVVV','vvvv','vvvv','vvvv'],L:'R',T:['VVVVVVVV','VVVVVVVV','VVVVVVVV','VVVVVVVV'],D:['vvvvvvvv','vvvvvvvv','vvvvvvvv','vvvvvvvv']},
  jacket:{F:['........','........','........','........','cCcCcCcC','.aaaaaa.','.aaaaaa.','.aAaaAa.','.aaaaaa.','.aaaaaa.','.AaaaaA.','..AAAA..'],R:['....','....','....','....','cCcC','....','....','....','....','....','....','....'],L:'R',B:['........','........','........','........','cCcCcCcC','........','........','........','........','........','........','........'],T:null,D:null},
  arm:{F:['VVVV','VVVV','VVVV','VVVV','VVVV','ssss','ssss','ssss','ssss','ssss','SsSs','SSSS'],B:'F',R:'F',L:'F',T:['VVVV','VVVV','VVVV','VVVV'],D:['SSSS','SSSS','SSSS','SSSS']},
  sleeve:{F:['....','....','....','....','....','VVVV','....','....','....','....','....','....'],B:'F',R:'F',L:'F',T:null,D:null},
  leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','bbbb','nnnn'],B:'F',R:'F',L:'F',T:['PPPP','PPPP','PPPP','PPPP'],D:['nnnn','nnnn','nnnn','nnnn']},
  pants:{F:['....','....','....','....','....','....','WWWW','XWXW','WXWX','XWXW','bbbb','nnnn'],R:['....','....','....','....','....','....','WWWW','XWXW','WXWX','XWXW','bbbb','nnnn'],L:'R',B:'R',T:null,D:['nnnn','nnnn','nnnn','nnnn']}};
 pxScene(()=>{pxSkin(P,K,map);if(hat===0)pxBox(P.HG,-4.25,31.75,-4.25,8.5,2.25,8.5,pxPaint({F:['YZZZZZZY','zZZZZZZz','kkkkkkkk'],B:'F',R:'F',L:'F',T:['ZZZZZZZZ','ZYZZZZYZ','ZZZZZZZZ','ZZZYZZZZ','ZZZZZZZZ','ZYZZZYZZ','ZZZZZZZZ','ZZZZZZZZ'],D:null},map),{mat:0,grid:[8,3,8]});if(hat===0)pxBox(P.HG,-6,31.25,-6,12,.75,12,pxPaint({T:['zZZZZZZZZZZz','ZZYZZZZZZYZZ','ZZZZZZZZZZZZ','ZZZZZYZZZZZZ','ZYZZZZZZZZYZ','ZZZZZZZZZZZZ','ZZZZZZZZZZZZ','ZZZYZZZZZYZZ','ZZZZZZZZZZZZ','ZZZZZZZYZZZZ','ZZYZZZZZZZZZ','zZZZZZZZZZZz'],F:['zzzzzzzzzzzz'],B:'F',R:'F',L:'F',D:['zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz','zzzzzzzzzzzz']},map),{mat:0})});
 pxArms(P,T=>pxSkinArms(T,K,map));
}
/* ================= GEAR: Naranxia arms, in the Blockbench item manner =================
   our own designs (steel, leather, wood, team colours, a little brass) built the Blockbench way: chunky bevelled 3D parts
   for hilts, sockets, bosses and rims, flat 2D pixel parts with finer pixels for blades and painted faces, wrapped grips
   with bands; built on the item grid then scaled down like items in a Minecraft hand.
   tool space: x = thickness, y = width, z = length; grip at the origin */
const RGO=PDP(['#7a4a10','#b07a22','#d9a83a','#f2cc66','#fff0b0']),RRU=PDP(['#7a1018','#c8202e','#ff6a70','#ffc0c8']),
 RSV=PDP(['#5d6674','#8a94a3','#b9c1cc','#dde2e8','#f7f9fb']),RDS=PDP(['#2c3038','#454b55','#626a76','#858d99','#a9b0ba']),
 RLE=PDP(['#2e1c0e','#4a2e16','#6b4423','#8a5a32','#a87244']),RWD=PDP(['#3a2414','#57361e','#74492a','#8f5e36','#a8743f']);
/* bevelled part: bright top row and left column, dark lip below; works for any palette */
const pBev=P=>(f,u,v,W,H)=>{if(f==='T')return (u===0||v===0)&&W>2?P[4]:P[3];if(f==='D')return P[0];if(H>=2&&v===H-1)return P[4];if(H>=3&&v===0)return P[1];return (u===0&&W>=3)?P[3]:P[2]};
const pGo=pBev(RGO);
const pGem=P=>(f,u,v,W,H)=>{if(f==='D')return P[0];if(W>=3&&H>=3){if(u===0||v===0||u===W-1||v===H-1)return P[1];return (u===1&&v===H-2)?P[3]:P[2]}return (u===0&&v===H-1)?P[3]:((u===W-1||v===0)?P[0]:P[1])};
const pWrap=P=>(f,u,v,W,H)=>{if(f==='T'||f==='D')return P[2];const q=(f==='F'||f==='B')?v:u;return (q+v)%2?P[1]:P[3]};
const gx=(G,x,y,z,w,h,d,p,o)=>pxBox(G,x,y,z,w,h,d,p,Object.assign({mat:4},o||{}));
const gem=(G,x,y,z,w,h,d,P)=>gx(G,x,y,z,w,h,d,pGem(P||RRU),{mat:5,grid:[Math.max(2,Math.round(w*2)),Math.max(2,Math.round(h*2)),Math.max(2,Math.round(d*2))]});
const GSC=.72,gScale=(geo,k)=>{geo.scale(k,k,k);return geo};
const teamGem=()=>{const T=teamPal(thp());return[T[0],T[2],T[3],T[4]]};
/* flat pixel sprite from a colour function on a W x H grid of cells of size ps (v = 0 is the bottom row) */
function pxSpriteF(G,W,H,col,o){const ps=o.ps||1,d=o.d||1,mat=o.mat===undefined?4:o.mat;
 for(let v=0;v<H;v++){let u=0;while(u<W){const c=col(u,v);if(!c){u++;continue}let e=u;while(e<W&&col(e,v)===c)e++;
   if(o.plane==='yz')pxBox(G,-d/2+(o.x||0),o.y+v*ps,o.z+u*ps,d,ps,(e-u)*ps,(f)=>f==='R'||f==='L'?c:shadeHex(c,f==='T'?.96:.8),{mat,ao:false,grid:[1,1,1]});
   else pxBox(G,o.x+u*ps,o.y+v*ps,-d/2+(o.z||0),(e-u)*ps,ps,d,(f)=>f==='F'?c:(f==='B'?(o.back||c):shadeHex(c,f==='T'?.96:.8)),{mat,ao:false,grid:[1,1,1]});
   u=e}}}
/* ---------------- knight's arming sword ----------------
   flat steel blade in fine pixels (bright edge, fuller, a few glints, stepped point), a straight steel cross-guard with
   blocky flared ends, a brown leather grip with a steel band, a steel wheel pommel with a team-coloured stone */
function pxSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,52,9,(u,v)=>{const L=52,hw=u<L-9?4:Math.max(0,4-(u-(L-9))*.5),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-10)return S[0];const n=pxN('F',u>>1,v,5);if(n>.9)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.2,ps:.5,d:1.2});
  gx(G,-.85,-1.7,2.2,1.7,3.4,1.3,pBev(RSV));
  gx(G,-.95,-4.6,1,1.9,9.2,1.4,pBev(RSV));gx(G,-1.15,-5.9,.7,2.3,1.7,2,pBev(RSV));gx(G,-1.15,4.2,.7,2.3,1.7,2,pBev(RSV));
  gx(G,-.75,-.75,-5.2,1.5,1.5,6.2,pWrap(RLE),{mat:0});gx(G,-.95,-.95,-2.6,1.9,1.9,.8,pBev(RSV));
  gx(G,-.85,-1.7,-7.6,1.7,3.4,2.4,pBev(RSV));gem(G,.85,-.6,-7,.35,1.2,1.2,teamGem());gem(G,-1.2,-.6,-7,.35,1.2,1.2,teamGem());
 });return gScale(toGeo(G),.9)}
/* ---------------- shields: the Minecraft shield ----------------
   built like the Minecraft shield (reference: "Minecraft Shield" by bugbilly, CC BY 4.0): a 12 x 22 plate one pixel thick,
   five vertical planks two pixels wide (light left pixel, dark right pixel, lighter end grain on top), an iron rim one pixel
   wide standing a little proud of the wood, eight rivets in two columns with a shadow pixel under each (small raised studs
   on the front), the same planks and rivets on the back, and an iron bracket handle with a leather-wrapped grip.
   Our heraldry is painted on the front planks, so the plank lines still show through the paint. */
const SHW=PDP(['#463724','#5b4a33','#705c41','#87704f','#9b835e']),SHI=PDP(['#3a3f47','#596069','#7f8792','#a3aab4','#c8ced6']),
 SHG=PDP(['#6e4a0e','#a8741e','#d7a83c','#f6d27a','#fff0b8']),SHK=PDP(['#262a31','#363c46','#4c5560','#66707c']);
const SH_RIV=[[2,3],[9,3],[2,8],[9,8],[2,13],[9,13],[2,18],[9,18]];
function pxMcShield(art,pal,AL){const G=newG(),IR=AL>=2?SHG:SHI;
 const riv=(u,r)=>{for(const q of SH_RIV)if(q[0]===u&&q[1]===r)return true;return false};
 const wood=(u,r,f)=>{const x=u-1,lf=(x&1)===0,n=pxN('W',x,Math.floor((r+x*3)/3),7),k=pxN(f,u,r,9);
  if(r===1)return lf?SHW[4]:SHW[3];if(r===20)return lf?SHW[2]:SHW[1];
  if(lf)return n>.8?SHW[4]:(k<.06?SHW[2]:SHW[3]);return n<.15?SHW[1]:(k>.95?SHW[3]:SHW[2])};
 const chAt=(u,r,front)=>front&&art?((art[r-1]||'')[u-1]||'.'):'.';
 const isField=c=>c==='.'||c==='T'||c==='R';
 const base=(u,r,f,front)=>{const c=chAt(u,r,front);if(c!=='.'&&pal[c]){const lf=((u-1)&1)===0;return r===1?pal[c][0]:(lf?pal[c][0]:pal[c][1])}return wood(u,r,f)};
 /* u 1..10 across, r 1..20 down; the rivet, its shadow below and a darker pixel to its right */
 const face=(u,r,f,front)=>{const c=chAt(u,r,front),b=base(u,r,f,front);if(!isField(c))return b;
  if(riv(u,r))return front?SHI[3]:SHI[2];if(riv(u,r-1)&&isField(chAt(u,r-1,front)))return shadeHex(b,.62);if(riv(u-1,r)&&isField(chAt(u-1,r,front)))return shadeHex(b,.84);return b};
 const rim=side=>(f,u,v,W,H)=>{if(f==='T')return IR[3];if(f==='D')return IR[0];
  if(f==='F'||f==='B'){if(side==='t')return (u===0||u===W-1)?IR[4]:IR[3];if(side==='b')return (u===0||u===W-1)?IR[2]:IR[1];return IR[2]}
  return IR[2]};
 pxScene(()=>{
  /* planks: front painted, back bare */
  gx(G,-5,-10,-.5,10,20,1,(f,u,v,W,H)=>face(u+1,20-v,f,f==='F'),{mat:0,grid:[10,20,1],no:'RLTD'});
  /* iron rim, a little thicker than the wood */
  gx(G,-6,10,-.65,12,1,1.3,rim('t'),{grid:[12,1,1]});gx(G,-6,-11,-.65,12,1,1.3,rim('b'),{grid:[12,1,1]});
  gx(G,-6,-10,-.65,1,20,1.3,rim('l'),{grid:[1,20,1]});gx(G,5,-10,-.65,1,20,1.3,rim('r'),{grid:[1,20,1]});
  /* raised rivet studs on the front (only where the paint is field or bare wood) */
  for(const[u,r]of SH_RIV){if(!isField(chAt(u,r,true)))continue;const x=-6+u+.5,y=11-r-.5;
   gx(G,x-.32,y-.32,.5,.64,.64,.24,(f)=>f==='T'?SHI[4]:(f==='D'?SHI[1]:(f==='F'?SHI[3]:SHI[2])),{grid:[1,1,1]})}
  /* bracket handle: two iron arms out of the back and a grip bar wrapped in leather */
  const pK=(f,u,v,W,H)=>f==='T'?SHK[3]:(f==='D'?SHK[0]:(v===H-1?SHK[3]:SHK[2]));
  gx(G,-2,2,-5.2,4,1.4,4.7,pK,{grid:[4,1,4]});gx(G,-2,-3.4,-5.2,4,1.4,4.7,pK,{grid:[4,1,4]});
  gx(G,-2,-3.4,-6.6,4,6.8,1.4,pK,{grid:[4,6,1]});gx(G,-2.15,-1.7,-6.75,4.3,3.4,1.7,pWrap(RLE),{mat:0,grid:[4,4,2]});
 });return G}
/* heraldry, 10 x 20 inside the rim (top row first); '.' leaves the wood bare, T is the team colour, H its light edge */
const ART_KNIGHT_A=['....TT....','....TT....','....TT....','....TT....','HHHHHHHHHH','TTTTTTTTTT','....TT....','....TT....','....TT....','....TT....',
 '....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....','....TT....'];
const ART_KNIGHT_B=['TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','CCCCCCCCCC','cccccccccc','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT',
 'TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT','TTTTccTTTT'];
const ART_CROWN=['TTTTTTTTTT','TTTTTTTTTT','TgTTggTTgT','TggTggTggT','TggggggggT','TgrgrrgrgT','TkkkkkkkkT','TTTTTTTTTT'];
const ART_GUARD_A=ART_CROWN.concat(['TTTTTTTTTT','YYYYYYYYYY','..........','..........','..........','..........','..........','..........','..........','..........','..........','..........']);
const ART_GUARD_B=ART_CROWN.concat(['TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','YYYYYYYYYY','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT','TTTTTTTTTT']);
/* royal guard arms, like its tabard: a red pale between team flanks with a gold crown on top, the gold sun below and a gold base */
const ART_GUARD_R1=['TTRRRRRRTT','TTgRggRgTT','TTggggggTT','TTgrggrgTT','TTkkkkkkTT','TTRRRRRRTT','TTRRRRRRTT','TTRRRRRRTT','TTRRggRRTT','TTRgGGgRTT',
 'TTgGYYGgTT','TTgGYYGgTT','TTRgGGgRTT','TTRRggRRTT','TTRRRRRRTT','TTRRRRRRTT','TTRRRRRRTT','TTkkkkkkTT','TTggggggTT','TTRRRRRRTT'];
/* royal guard arms, chief: the crown on a team chief over a gold line, the gold sun on red below */
const ART_GUARD_R2=['TTTTTTTTTT','TgTTggTTgT','TggTggTggT','TggggggggT','TgrgrrgrgT','TkkkkkkkkT','TTTTTTTTTT','YYYYYYYYYY','RRRRRRRRRR','RRRRRRRRRR',
 'RRRRRRRRRR','RRRRggRRRR','RRRgGGgRRR','RRgGYYGgRR','RRgGYYGgRR','RRRgGGgRRR','RRRRggRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR'];
/* royal guard arms, quartered team and red with a small crown and the gold sun on the crossing */
const ART_GUARD_R3=['TTTTTRRRRR','TTgTggRgRR','TTggggggRR','TTkkkkkkRR','TTTTTRRRRR','TTTTTRRRRR','TTTTTRRRRR','TTTTggRRRR','TTTgGGgRRR','TTgGYYGgRR',
 'RRgGYYGgTT','RRRgGGgTTT','RRRRggTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT','RRRRRTTTTT'];
const shPal=()=>{const T=teamPal(thp());return{T:[T[2],shadeHex(T[2],.84)],H:[T[3],T[2]],c:PDP(['#ece6d4','#d2cab3']),C:PDP(['#fbf7ec','#ece6d4']),
 g:PDP(['#e8ba4c','#c9962e']),G:PDP(['#f6d27a','#e8ba4c']),k:PDP(['#a87818','#8e6412']),r:PDP(['#d42a36','#a81c26']),Y:PDP(['#fff0b8','#f6d27a']),
 R:PDP(['#b42c38','#98222d'])}};
/* variants: default = full banner field (knight: pale cross; royal guard: red pale with crown and sun) */
function pxShield(AL,vr){const art=vr==='0'?null:(vr==='A'?ART_KNIGHT_A:ART_KNIGHT_B);return gScale(toGeo(pxMcShield(art,shPal(),AL)),.95)}
function pxGuardShield(AL,vr){const art=vr==='0'?null:(({A:ART_GUARD_A,B:ART_GUARD_B,R2:ART_GUARD_R2,R3:ART_GUARD_R3})[vr]||ART_GUARD_R1);return gScale(toGeo(pxMcShield(art,shPal(),AL)),.98)}
/* ---------------- halberd ----------------
   a Blockbench voxel weapon: every pixel is a cube one shaft-thickness wide. A spear point with two lugs, a crescent axe
   with a hollow and two horns, a back hook, a deep steel socket block, a brass collar with a small team tassel, a banded
   wooden shaft, a wrapped leather grip and a steel foot. Rows are drawn top first, the shaft is column 6. */
const pInPoly=(P,x,y)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const[xi,yi]=P[i],[xj,yj]=P[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c}return c};
const HALB=[
 '.......L.......','.......L.......','.......L.......','.......L.......','......LMD......','......LMD......','....L.L.D......','...LM..K.......',
 '..LMM..w.......','..LMD..W.......','.LMMD..w.......','.LMD...W.......','LMMDDD.S.DMM...','LMMD.D.S....ML.','LMD....S.....L.','LMD....S.....L.',
 'LMMD.D.S.......','LMMDDD.S.......','.LMD...W.......','.LMMD..G.......','..LMD..wY......','..LMM..WT......','...LM..wT......','....L..WT......'];
function pxHalberd(){const G=newG(),V=1.4,Tm=teamPal(thp()),N=52,G0=37,
 SV=PDP(['#3c4655','#576579','#8796a8','#b4c1cf','#dce4ec']),
 C={L:PD('#bfcad6'),M:PD('#8796a8'),D:PD('#56637a'),K:PD('#2d343f'),W:PD('#6e4b32'),w:PD('#533724'),V:PD('#7d5a3e'),Y:PD('#e0b040'),T:Tm[2],B:PD('#3d2716'),b:PD('#5a3a22')};
 const rows=[];
 for(let r=0;r<N;r++){if(r<HALB.length){rows.push(HALB[r]);continue}
  let ch=(r>=34&&r<=40)?(r%2?'B':'b'):(['W','w','V'][Math.floor(pxN('P',r,0,4)*3)]);if(r===49)ch='K';if(r>=50)ch=r===50?'M':'D';
  rows.push('.......'+ch+'.......')}
 const zc=r=>(G0-r)*V;
 pxScene(()=>{
  pxSpriteF(G,N,15,(u,v)=>{const ch=rows[N-1-u][v];return (ch==='.'||ch==='S'||ch==='G')?null:C[ch]},{plane:'yz',x:0,y:-7.5*V,z:zc(N-1)-V/2,ps:V,d:V});
  gx(G,-V,-1.5*V,zc(17)-V/2,2*V,3*V,6*V,pBev(SV),{grid:[2,3,6]});
  gx(G,-V,-V,zc(19)-V/2,2*V,2*V,V,pGo,{grid:[2,2,1]});
 });return gScale(toGeo(G),1.0)}
const RST=RSV,pGrip=(f,u,v)=>{const Tm=teamPal(thp()),q=(f==='T'||f==='D')?v:u;return q%2?Tm[1]:Tm[3]};
/* ---------------- bow ----------------
   recurve limbs made of three straight wooden segments each (3D, rotated), brass rings at the joints, a leather grip with
   a team band and an arrow rest, steel nocks with flat (2D) brass horn tips, flat brass leaf plates on the belly, the string */
function pxBow(){const G=newG(),Wd=RWD,Tm=teamPal(thp());
 const seg=(y0,z0,y1,z1,t,w,P)=>{const L=Math.hypot(y1-y0,z1-z0),cy=(y0+y1)/2,cz=(z0+z1)/2,a=Math.atan2(-(y1-y0),z1-z0);
  pxRot(G,T=>gx(T,-t/2,cy-w/2,cz-L/2-.15,t,w,L+.3,(f,u,v,W,H)=>f==='T'?P[4]:(f==='D'?P[1]:(v===H-1?P[3]:P[2])),{mat:0}),[a,0,0],[0,cy,cz])};
 pxScene(()=>{
  for(const sg of[-1,1]){const pts=[[0,2.4],[1.4,8.6],[3.9,14.2],[3.1,18]].map(([y,z])=>[y,z*sg]);
   seg(pts[0][0],pts[0][1],pts[1][0],pts[1][1],1.5,2,Wd);seg(pts[1][0],pts[1][1],pts[2][0],pts[2][1],1.4,1.8,Wd);seg(pts[2][0],pts[2][1],pts[3][0],pts[3][1],1.3,1.6,Wd);
   for(const k of[1,2]){const[y,z]=pts[k];gx(G,-.95,y-1.1,z-.55,1.9,2.2,1.1,pGo)}
   const[ty,tz]=pts[3];gx(G,-.8,ty-.8,tz-(sg>0?.2:1.2),1.6,1.6,1.4,pBev(RSV));
   pxSpriteF(G,4,5,(u,v)=>{const ok=sg>0?(u<=v&&u>=v-1):(3-u<=v&&3-u>=v-1);return ok?(v>2?RGO[4]:RGO[2]):null},{plane:'yz',x:0,y:ty+.6,z:sg>0?tz-.4:tz-1.6,ps:.5,d:.7});
   pxSpriteF(G,7,3,(u,v)=>{const m=Math.abs(u-3);return (v===1&&m<=3)||(v!==1&&m<=1)?(v===2?RGO[4]:RGO[2]):null},{plane:'yz',x:0,y:-1.9,z:sg>0?3.4:-6.9,ps:.5,d:.6});}
  gx(G,-1.05,-1.25,-2.6,2.1,2.5,5.2,pWrap(RLE),{mat:0});gx(G,-1.15,-1.35,-.45,2.3,2.7,.9,(f,u,v,W,H)=>f==='T'?Tm[4]:(v===H-1?Tm[3]:Tm[2]),{mat:0});
  gx(G,-.5,1.25,-.6,1,.8,1.2,pBev(RSV));
  gx(G,-.15,3.15,-18.2,.3,.3,36.4,()=>PD('#efe9d6'),{mat:0,ao:false});
 });return gScale(toGeo(G),.95)}

/* ================= RESTYLE ROUND 2: king, captain, bannerman, gunners, zombies =================
   Same Blockbench manner as the knight / royal guard: the Minecraft player model with an outer layer, a few extra
   cubes, the detail in the pixel art. Steel shades are the digits 0 (darkest) .. 5, gold g G o, leather b B n,
   the team colours V t T U Y come from pxMap. */
const PXF2={s:'#e0a07c',S:'#c27f5c',w:'#f4f4f4',e:'#3a6ec2',m:'#8e4a3c',0:'#141519',1:'#2c2e34',2:'#4a4d55',3:'#6d717a',4:'#949aa3',5:'#c4c8ce',
 g:'#d4a234',G:'#f0cc5c',o:'#9a6e1e',b:'#6e4826',B:'#8d6136',n:'#4a2e16'};
const pxMap2=(o,tm)=>pxMap(Object.assign({},PXF2,o),tm);
const rep2=(r,n)=>Array(n).fill(r);
const CH4=Array.from({length:12},(_,i)=>i%2?'2121':'1212'),CH8=CH4.map(r=>r+r);
const FACE2=(mid,low,R)=>({F:['hhhhhhhh','hhhhhhhh','hssssssh','srrssrrs','swessews','sssSSsss',mid||'sssmmsss',low||'ssssssss'],
 R:R||['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','ssssshhh','ssssssss'],L:'~R',B:rep2('hhhhhhhh',7).concat(['ssssssss']),T:rep2('hhhhhhhh',8),D:rep2('ssssssss',8)});
/* a pixel cut-out wall of a crown: rows top first, '.' = gap; plane xy (front / back) or yz (sides) */
function pxCut(G,rows,map,o){const H=rows.length,W=rows[0].length;pxSpriteF(G,W,H,(u,v)=>{const c=rows[H-1-v][u];return c==='.'?null:map[c]},o)}
/* ---------------- KING NARAIGE: A open face, beard and crown / B royal great helm under the crown ---------------- */
function pxKing(P,AL){const vr=(window.__KV||'B'),helm=vr==='B',
  map=pxMap2({h:'#7a4422',r:'#4e2a12',E:'#f3efe6',q:'#d6d0c2',x:'#18181c',R:'#a62832',Q:'#c94450',X:'#6c111b',j:'#e8303a',z:'#3a7aff'},thp());
 const K={hatMat:4,jacketMat:0,sleeveMat:4,pantsMat:4,
  head:FACE2('shhmmhhs','hhhhhhhh',['hhhhhhhh','hhhhhhhh','sssshhhh','sssshhhh','ssSshhhh','sssshhhh','hhsshhhh','hhhhhhhh']),
  hat:helm?{F:['oggggggo','44444444','333gG333','000gG000','333gG333','313gG313','3333g333','22222222'],
    R:['oggggggo','44444444','33333334','00333333','33333333','31333333','33333332','22222222'],L:'~R',
    B:['oggggggo','44444444','33343333','33343333','33343333','23343332','23343332','22222222'],
    T:['44444444','43333334','433gg334','43gGGg34','43gGGg34','433gg334','43333334','44444444']}:null,
  body:{F:CH8,B:'F',R:CH4,L:'R',T:rep2('11111111',4),D:'T'},
  jacket:{F:['EExEExEE','qEEEEEEq','gUUUUUUg','gUGUUGUg','gUGGGGUg','gUUUUUUg','XRRGGRRX','gUUUUUUg','gUUUUUUg','gTUUUUTg','gTTUUTTg','oggggggo'],
   R:['EExE','qEEq','gUUU','UUUU','UUUU','UUUU','XRRR','UUUU','UUUU','TUUU','TTUU','oggg'],L:'~R',
   B:['EExEExEE','qEEEEEEq','gUUUUUUg','gUUUUUUg','gUUUUUUg','gUUUUUUg','XRRRRRRX','gUUUUUUg','gUUUUUUg','gTUUUUTg','gTTUUTTg','oggggggo'],
   T:['EEEEEEEE','ExEEExEE','EEExEEEx','EEEEEEEE']},
  arm:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  sleeve:{F:['4444','3443','3333','2332','4444','gGGg','4554','3443','3333','2332','gGGg','2222'],R:'F',L:'F',
   B:['3333','2332','2222','1221','3333','oggo','3333','2332','2222','1221','oggo','1111'],T:['4444','4334','4334','4444'],D:rep2('1111',4)},
  leg:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  pants:{F:['3333','2222','1221','....','4444','gGGg','3443','....','4334','3443','2222','1111'],R:['3333','2222','1222','....','4444','gGGg','3443','....','4333','3443','2222','1111'],L:'~R',
   B:['3333','2222','1221','....','3333','2222','1221','....','3333','2222','1111','1111'],T:rep2('3333',4),D:rep2('1111',4)}};
 pxScene(()=>{pxSkin(P,K,map);
  /* ermine collar over the shoulders */
  pxBox(P.G,-4.3,21.6,-2.6,8.6,2.6,5.2,pxPaint({F:['EExEEExEE','qEEEqEEEq'],B:'F',R:['ExEEE','qEEqE'],L:'R',T:['EEExEEEEE','ExEEEEExE','EEEEEEEEE','EExEEEExE','EEEEEEEEE']},map),{mat:0,grid:[9,2,5]});
  /* the crown: four cut-out gold walls with rubies and sapphires */
  const y0=helm?32.3:31.1,h=helm?4.9:4.6,ps=(2*h)/9,FR=['G...G...G','gG.GgG.Gg','ggggggggg','gjgzgzgjg'],SD=['...G...','..GgG..','ggggggg','gzgjgzg'],o={ps,d:.9,mat:4};
  pxCut(P.HG,FR,map,Object.assign({x:-h,y:y0,z:h-.45},o));pxCut(P.HG,FR,map,Object.assign({x:-h,y:y0,z:-h+.45},o));
  pxCut(P.HG,SD,map,Object.assign({plane:'yz',x:h-.45,y:y0,z:-h+ps},o));pxCut(P.HG,SD,map,Object.assign({plane:'yz',x:-h+.45,y:y0,z:-h+ps},o));
 });
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3.1,-1.4,-3.1,6.2,3.2,6.2,pxPaint({T:['oggggo','g5445g','g4554g','g4554g','g5445g','oggggo'],F:['444444','333333','oggggo'],B:'F',R:'F',L:'F',D:rep2('111111',6)},map),{mat:4,grid:[6,3,6]})});
}
/* ---------------- CAPTAIN: gilded breastplate, red officer sash, team skirt, open bascinet, gold pauldrons ---------------- */
function pxCaptain(P,AL){const map=pxMap2({h:'#4a2c16',r:'#2e1a0c',R:'#b8323c',Q:'#de5a62',X:'#7a1a24'},thp());
 const K={hatMat:4,jacketMat:4,sleeveMat:4,pantsMat:4,
  head:FACE2('shhmmhhs'),
  hat:{F:['44444444','3gggggg3','3......3','3......3','3......3','3......3','33....33','33....33'],
   R:['44444444','33333333','33333333','33333332','33333332','33333322','33333322','22222222'],L:'~R',
   B:['44444444','33333333','33333333','33333333','23333332','23333332','22222222','22222222'],
   T:['44444444','43333334','433gg334','433gg334','433gg334','433gg334','43333334','44444444']},
  body:{F:CH8,B:'F',R:CH4,L:'R',T:rep2('11111111',4),D:'T'},
  jacket:{F:['oggggggo','gRQGGGGg','gGRQGGGg','gGGRQGGg','ggGGRQgg','ogGGGRQo','nbbGGbRn','TUUUUUUT','tUUTTUUt','tUUTTUUt','tTTttTTt','tttttttt'],
   R:['oggg','gGGg','gGGg','gGGg','ggGg','oggg','nbbn','TUUU','tUUU','tUUU','tTTT','tttt'],L:'~R',
   B:['oggggggo','gggggggg','gGggggGg','gggggggg','gggggggg','oggggggo','nbbbbbbn','TUUUUUUT','tUUUUUUt','tUUUUUUt','tTTttTTt','tttttttt'],
   T:['oggggggo','gGGGGGGg','gGGGGGGg','oggggggo']},
  arm:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  sleeve:{F:['GGGG','gggg','oggo','....','GGGG','gGGg','oggo','....','4444','3443','gggg','2323'],R:'F',L:'F',
   B:['gggg','oooo','oooo','....','gggg','oggo','oooo','....','3333','2222','oooo','1212'],T:['GGGG','GggG','GggG','GGGG'],D:rep2('1111',4)},
  leg:{F:CH4,B:'F',R:'F',L:'F',T:rep2('1111',4),D:'T'},
  pants:{F:['UUUU','UUUU','TUUT','....','gGGg','oggo','3443','....','4334','3443','2222','1111'],R:['UUUU','UUUU','TUUU','....','gGGg','oggo','3443','....','4333','3443','2222','1111'],L:'~R',
   B:['TTTT','TTTT','tTTt','....','gggg','oooo','3333','....','3333','2222','1111','1111'],T:rep2('UUUU',4),D:rep2('1111',4)}};
 pxScene(()=>pxSkin(P,K,map));
 pxArms(P,T=>{pxSkinArms(T,K,map);
  pxBox(T,-3.1,-1.4,-3.1,6.2,3.2,6.2,pxPaint({T:['oggggo','gGGGGg','gGRRGg','gGRRGg','gGGGGg','oggggo'],F:['GGGGGG','gggggg','oooooo'],B:'F',R:'F',L:'F',D:rep2('111111',6)},map),{mat:4,grid:[6,3,6]})});
}
/* ---------------- BANNERMAN: kettle hat, quilted gambeson, team tabard with a white cross, steel vambraces ---------------- */
function pxBannerman(P,AL){const map=pxMap2({h:'#5a3a1a',r:'#3a2410',a:'#ddd0ae',A:'#b4a682',c:'#f2ecdc',y:'#d9a83a',P:'#433824',p:'#2e2618'},thp());
 const Q8=Array.from({length:12},(_,i)=>i%2?'aaAaaaAa':'aAaaaAaa'),Q4=Q8.map(r=>r.slice(0,4));
 const K={hatMat:4,jacketMat:0,sleeveMat:4,
  head:FACE2(),
  hat:{F:['44444444','33333333','22222222','........','........','........','........','........'],R:'F',L:'F',B:'F',
   T:['44444444','43333334','43333334','43344334','43344334','43333334','43333334','44444444']},
  body:{F:Q8,B:'F',R:Q4,L:'R',T:rep2('aaaaaaaa',4),D:'T'},
  jacket:{F:['aaaaaaaa','aTTccTTa','aTTccTTa','acccccca','aTTccTTa','aTTccTTa','nbbyybbn','aTTccTTa','aTTccTTa','AtTccTtA','AttccttA','AAAAAAAA'],
   R:['aaaa','aAaa','aaAa','aaaa','aAaa','aaAa','nbbn','aaaa','aAaa','aaAa','AaaA','AAAA'],L:'~R',B:'F',T:['aaaaaaaa','aAaaaaAa','aaaaaaaa','aaaaaaaa']},
  arm:{F:Q4.slice(0,9).concat(['ssss','ssss','SSSS']),B:'F',R:'F',L:'F',T:rep2('aaaa',4),D:rep2('SSSS',4)},
  sleeve:{F:['....','....','....','....','....','4444','3443','3333','2222','....','....','....'],R:'F',L:'F',B:['....','....','....','....','....','3333','2222','2222','1111','....','....','....'],T:null,D:null},
  leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP'],B:'F',R:'F',L:'F',T:rep2('PPPP',4),D:rep2('nnnn',4)},
  pants:{F:['....','....','....','....','....','....','BBBB','bBbB','bbbb','bnbb','bbbb','nnnn'],R:'F',L:'F',B:'F',T:null,D:rep2('nnnn',4)}};
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,-6,29.4,-6,12,.8,12,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?map['4']:map['3']):(f==='D'?map['1']:map['2']),{mat:4,grid:[12,1,12]})});
 pxArms(P,T=>pxSkinArms(T,K,map));
}
/* ---------------- GUNNERS: team doublet, brass buttons, leather apron, bandolier of flasks, cap with a white feather ---------------- */
function pxGunner(P,AL){const map=pxMap2({h:'#3a2410',r:'#24160a',y:'#d9a83a',z:'#f2cc66',c:'#f2efe6',C:'#cfcabc',P:'#3e3a36',p:'#2a2622'},thp());
 const K={jacketMat:0,
  head:FACE2('shhhhhhs','sssmmsss'),
  hat:{F:['UUUUUUUU','yyyyyyyy','........','........','........','........','........','........'],R:'F',L:'F',B:'F',
   T:['UUUUUUUU','UYYUUUUU','UYUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU','UUUUUUUU']},
  body:{F:rep2('UUUUUUUU',12),B:'F',R:rep2('UUUU',12),L:'R',T:rep2('UUUUUUUU',4),D:'T'},
  jacket:{F:['tUUUUUbt','UUUUUbyU','UUUUbbUU','UUUbyUUU','UUbbUUUU','nnnyynnn','UBBBBBBU','UBbbbbBU','UBbbbbBU','tBbbbbBt','tBbnnbBt','tnnnnnnt'],
   R:['tUUU','UUUU','UUUU','UUUU','UUUU','nnnn','UUUU','UUUU','tUUU','tUUU','ttUU','tttt'],L:'~R',
   B:['tUUUUUUt','UbUUUUUU','UUbUUUUU','UUUbUUUU','UUUUbUUU','nnnnnnnn','UUUUUUUU','UUUUUUUU','tUUUUUUt','tUUUUUUt','ttUUUUtt','tttttttt'],
   T:['tUUUUUbt','UUUUUbUU','UUUUUUUU','tUUUUUUt']},
  arm:{F:rep2('UUUU',7).concat(['tttt','ssss','ssss','SsSs','SSSS']),B:'F',R:'F',L:'F',T:rep2('UUUU',4),D:rep2('SSSS',4)},
  sleeve:{F:['....','....','....','....','....','....','yUUy','tttt','....','....','....','....'],R:'F',L:'F',B:'F',T:null,D:null},
  leg:{F:['PPPP','PPPP','PPPP','pPPp','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP','PPPP'],B:'F',R:'F',L:'F',T:rep2('PPPP',4),D:rep2('nnnn',4)},
  pants:{F:['....','....','....','....','....','....','....','bbbb','bnbb','bbbb','bbbb','nnnn'],R:'F',L:'F',B:'F',T:null,D:rep2('nnnn',4)}};
 pxScene(()=>{pxSkin(P,K,map);
  pxBox(P.HG,3.4,30.4,-1.2,1.1,4.2,1.1,f=>f==='D'?map.C:map.c,{mat:0,grid:[1,4,1]});pxBox(P.HG,3.4,33.8,-2.7,1.1,2,1.6,f=>f==='T'?map.c:map.C,{mat:0,grid:[1,2,2]})});
 pxArms(P,T=>pxSkinArms(T,K,map));
}
/* ---------------- gear: the king's sword, the captain's sword, the captain's shield ---------------- */
function pxRoyalSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,60,9,(u,v)=>{const L=60,hw=u<L-10?4:Math.max(0,4-(u-(L-10))*.45),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-12)return u%7===3?RGO[3]:S[0];const n=pxN('K',u>>1,v,5);if(n>.9)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.4,ps:.5,d:1.2});
  gx(G,-.85,-1.6,2.6,1.7,3.2,1.2,pGo);
  gx(G,-.95,-5.2,1.6,1.9,10.4,1.6,pGo);gx(G,-1.1,-6.7,.5,2.2,1.9,2.6,pGo);gx(G,-1.1,4.8,.5,2.2,1.9,2.6,pGo);
  gem(G,.9,-.7,1.7,.4,1.4,1.4,RRU);gem(G,-1.3,-.7,1.7,.4,1.4,1.4,RRU);
  gx(G,-.75,-.75,-5.6,1.5,1.5,6.6,pWrap(RRU),{mat:0});gx(G,-.95,-.95,-3,1.9,1.9,.7,pGo);gx(G,-.95,-.95,-5.3,1.9,1.9,.7,pGo);
  gx(G,-1.1,-1.6,-8.2,2.2,3.2,2.6,pGo);gem(G,1.1,-.6,-7.6,.35,1.2,1.2,RRU);gem(G,-1.45,-.6,-7.6,.35,1.2,1.2,RRU);
 });return gScale(toGeo(G),.92)}
function pxCapSword(){const G=newG(),S=RSV;
 pxScene(()=>{
  pxSpriteF(G,58,9,(u,v)=>{const L=58,hw=u<L-9?4:Math.max(0,4-(u-(L-9))*.5),y=v-4;if(Math.abs(y)>hw+.01)return null;
   if(Math.abs(y)>hw-1)return y>0?S[4]:S[1];if(y===0&&u<L-11)return S[0];const n=pxN('Q',u>>1,v,7);if(n>.92)return S[4];return y>0?S[3]:S[2]},{plane:'yz',x:0,y:-2.25,z:3.3,ps:.5,d:1.2});
  gx(G,-.85,-1.7,2.3,1.7,3.4,1.3,pBev(RSV));
  gx(G,-.95,-5.4,1.1,1.9,10.8,1.4,pBev(RSV));gx(G,-1.15,-6.8,.6,2.3,1.8,2.2,pGo);gx(G,-1.15,5,.6,2.3,1.8,2.2,pGo);
  gx(G,-.75,-.75,-5.8,1.5,1.5,6.8,pWrap(RLE),{mat:0});gx(G,-.95,-.95,-2.8,1.9,1.9,.7,pGo);gx(G,-.95,-.95,-5.4,1.9,1.9,.7,pGo);
  gx(G,-.95,-1.8,-8.4,1.9,3.6,2.6,pGo);gem(G,.95,-.6,-7.8,.35,1.2,1.2,teamGem());gem(G,-1.3,-.6,-7.8,.35,1.2,1.2,teamGem());
 });return gScale(toGeo(G),.9)}
/* captain's arms: a team chief with the gold sun, a gold chevron, red below */
const ART_CAPTAIN=['TTTTTTTTTT','TTTTggTTTT','TTTgGGgTTT','TTgGYYGgTT','TTTgGGgTTT','TTTTggTTTT','TTTTTTTTTT',
 'TTTTGGTTTT','TTTGggGTTT','TTGgRRgGTT','TGgRRRRgGT','GgRRRRRRgG','gRRRRRRRRg','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR','RRRRRRRRRR'];
function pxCaptainShield(AL,vr){return gScale(toGeo(pxMcShield(vr==='0'?null:ART_CAPTAIN,shPal(),AL)),.95)}
/* ================= ZOMBIES: the same random undead (zSpec: skin, decay, outfit, headgear, wounds) as pixel skins =================
   the part sizes follow the old body mutations (MUTX: the brute's big arm, the bomber's barrel chest...); arms are built one by one */
function pxArms2(P,fR,fL){const TR=newG(),TL=newG();pxScene(()=>fR(TR));pxScene(()=>fL(TL));pxCat(P.AG,TR);pxCat(P.LA,TL,p=>[-p[0]-2.76*VX,p[1]+10.45*VX,p[2]],q=>[-q[0],q[1],q[2]],true)}
function pxZombie(type,ZV,P){
 const S=zSpec(type,ZV?ZV.v:0,ZV?ZV.hint:null),MT=MUTX[type],sd=S.seed>>>0,o=S.outfit,dc=S.decay,hd=S.head;
 const skel=dc==='skel',bony=dc==='bones',mum=dc==='mummy',dried=dc==='dried'||mum,C=PD;
 const mixH=(a,b,t)=>{const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16));return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')},
  zg=h=>dried?h:mixH(h,'#4f8a44',.32);
 const SK=C(zg(S.sk[0])),SKD=C(zg(S.sk[1])),SKL=C(zg(S.sk[2])),BN=C(S.bn[0]),BN2=C(S.bn[1]),BND=C(S.bn[2]),DK=C('#160c08'),FL=C('#6a1e14'),FL2=C('#9a3424'),
  WR=C('#cbbd98'),WR2=C('#a99c7a'),HAIR=C(S.hairc),EY=C(S.eye),RU=C('#5a3a20'),ST=PDP(['#2c2e34','#4a4d55','#6d717a','#949aa3']),GO=PDP(['#9a6e1e','#d4a234','#f0cc5c']);
 const TUNh=o==='soldier'?'#6e7078':o==='gambeson'?'#b6a684':o==='monk'?((sd&1)?ZCL.wool:ZCL.black):o==='shroud'?'#cbbd98':o==='rags'||o==='peasant'?ZCL.burlap:o==='hooded'?'#5a3a22':S.tun;
 const TC=C(TUNh),TD=shadeHex(TC,.78),T2=C(S.tun2||TUNh),T2D=shadeHex(T2,.78),HO=C(S.hose);
 const nz=(f,u,v)=>pxN(f,u+(sd%89),v+((sd>>7)%83),sd%13);
 const tT=(MT&&MT.T)||[1,1,1,0,0];
 const zb=(R,Gx,x,y,z,w,h,d,paint,op)=>{const t=MT&&MT[R];if(t){const py=R==='H'?24:R==='T'?12:0;x*=t[0];w*=t[0];y=(y-py)*t[1]+py+t[3];h*=t[1];z=z*t[2]+t[4];d*=t[2]}pxBox(Gx,x,y,z,w,h,d,paint,op)};
 const skin=(f,u,r)=>{const n=nz(f,u,r);if(dried)return n<.18?SKD:(n>.86?SKL:SK);const w=nz('W'+f,u>>1,r>>1);if(w>.95)return (u+r)%2?FL2:FL;if(n<.13)return SKD;if(n>.93)return SKL;return SK};
 const wrap=(f,u,r)=>{const n=nz('w'+f,u,r);if(n<.05)return DK;return ((r+(n<.22?1:0))%2)?WR:WR2};
 const bone=(f,u,r)=>{const n=nz('b'+f,u,r);return n<.15?BN2:(n>.93?BND:BN)};
 /* ---- head ---- */
 const hairOn=S.hair!=='none'&&!skel&&!mum;
 const head=(f,u,v,W,H)=>{const r=H-1-v;
  if(skel){if(f==='F'){if((r===3||r===4)&&(u===1||u===2||u===5||u===6))return DK;if(r===5&&(u===3||u===4))return DK;if(r===6)return (u===0||u===7)?BN2:(u%2?BN:DK);if(r===7)return (u>=1&&u<=6)?BN2:BND}return bone(f,u,r)}
  if(mum){if(f==='F'&&r===4&&(u===2||u===5||u===6))return DK;return wrap(f,u,r)}
  if(hairOn&&(f==='T'||(f==='B'&&r<6)||((f==='R'||f==='L')&&r<3)||(f==='F'&&r<1))){const n=nz('h'+f,u,r);if(S.hair==='patchy'&&n<.45)return skin(f,u,r);if(S.hair==='stringy'&&n<.25)return skin(f,u,r);return n>.8?shadeHex(HAIR,.8):HAIR}
  if(f==='F'){if(r===4&&(u===1||u===2||u===5||u===6))return DK;if(r===5&&(u===3||u===4))return SKD;
   if(type==='acid'&&r>=6&&(u===3||u===4))return C('#b8f040');
   if(r===6&&u>=2&&u<=5)return (S.jawOff||u===3||u===4)?DK:SKD;if(r===7&&S.jawOff&&u>=2&&u<=5)return u%2?BN:DK;
   if(S.cheek&&r>=5&&r<=6&&(S.cheek<0?u<=1:u>=6))return r===5?BN:BN2;if(S.skullPatch&&r<=2&&u<=2)return BN}
  if(S.skullPatch&&f==='T'&&u<3&&r<3)return BN;
  return skin(f,u,r)};
 /* ---- torso, arms, legs (bare body) ---- */
 const body=(f,u,v,W,H)=>{const r=H-1-v;
  if(skel){if(f==='F'){if(u===3||u===4)return r<11?BN2:BND;if(r>=1&&r<=7)return r%2?BN:DK;return (r>=8&&r<=9)?DK:BN2}if(f==='B'){if(u===3||u===4)return BN;return (r>=1&&r<=7&&r%2)?BN2:DK}return (r>=1&&r<=7&&r%2)?BN:DK}
  if(mum)return wrap(f,u,r);
  if(bony&&f==='F'&&r>=2&&r<=7&&u>=1&&u<=6&&((S.cheek>=0?u<=3:u>=4)||nz('rb',u,r)<.35))return r%2?BN:FL;
  if(type==='acid'&&nz('p'+f,u,r)>.93)return C('#c8ff60');
  return skin(f,u,r)};
 const limb=(bare,k)=>(f,u,v,W,H)=>{const r=H-1-v;if(skel)return r%4===3?BN2:BN;if(mum)return wrap(f,u,r);
  if(bare&&r>=6){const n=nz('a'+k+f,u,r);return r>=10?(n<.5?BN:BN2):(n<.3?FL:(n<.7?BN:BN2))}return skin(f,u,r)};
 const leg=(f,u,v,W,H)=>{const r=H-1-v;if(skel)return r%4===3?BN2:BN;if(mum)return wrap(f,u,r);
  if(o==='bare')return r>=11?SKD:skin(f,u,r);if(r>=10)return r===11?DK:RU;return nz('l'+f,u,r)<.1?shadeHex(HO,.8):HO};
 /* ---- clothes (outer layer): torn hems and holes from the seed ---- */
 const torn=(f,u,r,k,lim)=>{const n=nz('t'+f+k,u,r);return r>=lim-((n*3)|0)};
 const hole=(f,u,r,p)=>nz('o'+f,u,r)<p;
 let jacket=null,sleeve=null,pants=null;const sh=(c,f)=>f==='T'?c:(f==='D'?null:c);
 if(o==='tunic'||o==='peasant'||o==='rags'||o==='gambeson'||o==='hooded'){const qu=o==='gambeson',rag=o==='rags'?.3:.07,BELT=o==='peasant'?C('#c8a868'):C('#4a3622');
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T')return TC;if(torn(f,u,r,'j',11))return null;if(hole(f,u,r,rag))return null;if(r===6&&o!=='rags')return BELT;
   if(qu)return ((u+r)%3===0)?TD:TC;if(o==='peasant'&&nz('pa'+f,u>>1,r>>1)>.85)return lighten(TC,.1);return nz('c'+f,u,r)<.15?TD:TC};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v,len=qu?9:o==='hooded'?11:5;if(f==='D')return null;if(f==='T')return TC;if(r>=len||torn(f,u,r,'s',len))return null;if(hole(f,u,r,rag))return null;return (qu&&(u+r)%3===0)?TD:TC}}
 else if(o==='soldier'){
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(torn(f,u,r,'j',12))return null;if(hole(f,u,r,.06))return null;
   if((f==='F'||f==='B')&&u>=2&&u<=5&&r>=1)return r===6?C('#4a3622'):(nz('c'+f,u,r)<.12?T2D:T2);return (u+r)%2?ST[1]:ST[2]};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||r>=6||torn(f,u,r,'s',6))return null;return (u+r)%2?ST[1]:ST[2]}}
 else if(o==='monk'||o==='shroud'||o==='noble'){
  jacket=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(o==='shroud')return hole(f,u,r,.12)?null:wrap(f,u,r);
   if(o==='noble'){if(r===0)return C('#e6e0d0');if((f==='F')&&(u===3||u===4)&&r>=1&&r<=8&&r%2)return GO[1];if(torn(f,u,r,'j',12))return null;return nz('c'+f,u,r)<.12?T2D:T2}
   if(r===6)return C('#c8a868');if(hole(f,u,r,.05))return null;return nz('c'+f,u,r)<.15?TD:TC};
  sleeve=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(o==='shroud')return (r>=9||hole(f,u,r,.15))?null:wrap(f,u,r);if(r>=(o==='noble'?11:10)||torn(f,u,r,'s',10))return null;return o==='noble'?(r%3===1?GO[1]:T2):TC};
  if(o==='monk')pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D')return null;if(torn(f,u,r,'p',11))return null;return nz('m'+f,u,r)<.15?TD:TC};
  if(o==='shroud')pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D')return null;return hole(f,u,r,.25)?null:wrap(f,u,r)}}
 if(o==='bare'&&!skel&&!mum)pants=(f,u,v,W,H)=>{const r=H-1-v;if(f==='T'||f==='D'||r>3)return null;if(torn(f,u,r,'p',4))return null;return C(ZCL.burlap)};
 if(type==='bomber'){const s0=jacket;jacket=(f,u,v,W,H)=>{const r=H-1-v;if((f==='F'||f==='B')&&Math.abs((f==='F'?u:7-u)-(r*.62+.5))<.9)return C('#4a2e16');if(f==='T'&&(u===1||u===2))return C('#4a2e16');return s0?s0(f,u,v,W,H):null}}
 /* ---- headgear (outer layer) ---- */
 const win=(f,u,r,a,b)=>f==='F'&&r>=a&&r<=b&&u>=1&&u<=6;
 const STEEL=(f,u,r)=>f==='T'?ST[3]:(r===0?ST[3]:(r===1?ST[2]:ST[1]));
 let hat=null,brim=null,lamp=false;
 if(hd==='kettle'){hat=(f,u,v,W,H)=>{const r=H-1-v;return f==='D'?null:(f==='T'||r<3?STEEL(f,u,r):null)};brim=[ST[2],ST[1],ST[3]]}
 else if(hd==='nasal')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T'||r<3)return STEEL(f,u,r);if(f==='F'&&(u===3||u===4)&&r<6)return ST[2];return null};
 else if(hd==='coif')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,2,6))return null;return (u+r)%2?ST[1]:ST[2]};
 else if(hd==='hood'||hd==='ghood'){const HC=hd==='ghood'?C(ZCL.green):TC;hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,2,7))return null;if(hole(f,u,r,.06))return null;return nz('hd'+f,u,r)<.15?shadeHex(HC,.8):HC}}
 else if(hd==='straw'){hat=(f,u,v,W,H)=>{const r=H-1-v;return f==='D'?null:(f==='T'||r<2?C(nz('st'+f,u,r)<.3?'#a88a42':'#d4b45c'):null)};brim=[C('#d4b45c'),C('#a88a42'),C('#ecd27a')]}
 else if(hd==='lcoif')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T'||r<2)return C('#d8cbaa');if((f==='R'||f==='L')&&r<6)return C('#c4b694');return null};
 else if(hd==='circlet')hat=(f,u,v,W,H)=>{const r=H-1-v;return (f!=='T'&&f!=='D'&&r===2)?(u%3===1?GO[2]:GO[1]):null};
 else if(hd==='shroud')hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D'||win(f,u,r,3,5))return null;return wrap(f,u,r)};
 else if(hd==='mhelm'){hat=(f,u,v,W,H)=>{const r=H-1-v;if(f==='D')return null;if(f==='T')return C(nz('mh',u,r)<.2?'#8a6a2a':'#a8823a');if(r<3)return r===2?C('#5a3a1a'):C('#a8823a');return null};lamp=true}
 /* ---- build ---- */
 const lw=skel?2:4;
 pxScene(()=>{
  zb('H',P.HG,-4,24,-4,8,8,8,head,{mat:0,grid:[8,8,8]});
  if(hat)zb('H',P.HG,-4.5,23.5,-4.5,9,9,9,hat,{mat:hd==='kettle'||hd==='nasal'||hd==='coif'?4:0,grid:[8,8,8],ao:false});
  if(brim)zb('H',P.HG,-6,29.4,-6,12,.8,12,(f,u,v,W,H)=>f==='T'?((u===0||v===0||u===W-1||v===H-1)?brim[2]:brim[0]):(f==='D'?brim[1]:brim[0]),{mat:hd==='kettle'?4:0,grid:[12,1,12]});
  if(lamp){zb('H',P.HG,-1.2,30.2,4.4,2.4,2,1.2,f=>f==='F'?C('#fff2a0'):C('#6a5a3a'),{mat:5,grid:[2,2,1]});zb('H',P.HG,-4.6,29.7,3.2,9.2,.6,2,()=>C('#5a3a1a'),{mat:0,grid:[8,1,2]})}
  /* eyes that glow in the dark sockets (one for a mummy) */
  for(const x of(mum?[1]:[-2,1]))zb('H',P.HG,x,27,4,1,1,.14,()=>EY,{mat:5,grid:[1,1,1],ao:false});
  zb('T',P.G,-4,12,-2,8,12,4,body,{mat:0,grid:[8,12,4]});
  if(jacket)zb('T',P.G,-4.25,11.75,-2.25,8.5,12.5,4.5,jacket,{mat:o==='soldier'?4:0,grid:[8,12,4],ao:false});
  zb('L',P.LG,-lw/2,-12,-lw/2,lw,12,lw,leg,{mat:0,grid:[4,12,4]});
  if(pants&&!skel)zb('L',P.LG,-2.25,-12.25,-2.25,4.5,12.5,4.5,pants,{mat:0,grid:[4,12,4],ao:false});
  pxBox(P.LG,-30,-40,-30,60,28,60,()=>null,{only:true});
  /* arrows stuck in the back */
  for(let i=0;i<S.arrows;i++){const ax=-2.5+5*nz('ar',i,1),ay=15+6*nz('ar',i,2),z0=-2*tT[2]+tT[4];
   pxBox(P.G,ax-.25,ay-.25,z0-5.5,.5,.5,6.2,()=>C('#8a6a3a'),{mat:0,grid:[1,1,6],ao:false});pxBox(P.G,ax-.1,ay-.9,z0-5.6,.2,1.8,1.4,()=>C('#efe9d6'),{mat:0,grid:[1,2,1],ao:false})}
  /* the bomber's powder keg, fuse and spark; the acid spitter's glowing sacs */
  const zB=-2.25*tT[2]+tT[4],xW=4.25*tT[0];
  if(type==='bomber'){const W2=6,yk=(13-12)*tT[1]+12;pxBox(P.G,-W2/2,yk,zB-5,W2,8,5,(f,u,v,W,H)=>{if(f==='T'||f==='D')return (u+v)%3?RWD[2]:RWD[1];if(v===1||v===6)return RDS[1];return u%2?RWD[2]:RWD[3]},{mat:0,grid:[6,8,5]});
   pxBox(P.G,-.3,yk+8,zB-2.8,.6,2,.6,()=>C('#3a2a1a'),{mat:0,grid:[1,2,1],ao:false});pxBox(P.G,-.45,yk+10,zB-2.95,.9,.9,.9,()=>C('#ffb02a'),{mat:5,grid:[1,1,1],ao:false})}
  if(type==='acid')for(const[sx,sy,sz,s]of[[-2.6,19,0,3.4],[1.4,16,-.6,2.8],[-.4,21.2,-.2,2.4]])pxBox(P.G,sx,sy*tT[1]+(1-tT[1])*12,zB-s*.75+sz,s,s,s,(f,u,v)=>((u+v)%2?C('#9ae030'):C('#c8ff60')),{mat:5,grid:[2,2,2],ao:false});
 });
 /* arms one by one: the brute's right arm is huge, shackle and chain on its left wrist, bone spikes on its shoulder; the miner holds a pick */
 const arm=(R)=>T=>{const t=MT&&MT[R],ab=(x,y,z,w,h,d,p,op)=>{if(t){x*=t[0];w*=t[0];y=y*t[1];h*=t[1];z*=t[2];d*=t[2]}pxBox(T,x,y,z,w,h,d,p,op)};
  ab(-lw/2,-12,-lw/2,lw,12,lw,limb(R==='AR'?S.armR:S.armL,R),{mat:0,grid:[4,12,4]});
  if(sleeve&&!skel)ab(-2.25,-12.25,-2.25,4.5,12.5,4.5,sleeve,{mat:o==='soldier'?4:0,grid:[4,12,4],ao:false});
  if(type==='brute'&&R==='AR')for(const[x,z,h]of[[-.8,-1,3.4],[.6,.9,2.6]])ab(x,0,z,1.2,h,1.2,(f)=>f==='T'?BN2:BN,{mat:0,grid:[1,3,1]});
  if(type==='brute'&&R==='AL'){ab(-2.6,-9.6,-2.6,5.2,1.8,5.2,(f,u,v)=>f==='T'||f==='D'?ST[1]:(u%2?ST[2]:ST[1]),{mat:4,grid:[5,2,5]});for(let i=0;i<3;i++)ab(-.5,-11.2-i*1.4,2.4,1,1.2,.6,()=>ST[i%2?1:2],{mat:4,grid:[1,1,1],ao:false})}
  if(type==='miner'&&R==='AR'){ab(-.5,-11.5,-1.5,1,1,11,(f,u,v)=>((u+v)%2?RWD[2]:RWD[3]),{mat:0,grid:[1,1,11]});ab(-.6,-16,8.6,1.2,9,1.5,(f,u,v,W,H)=>v===0||v===H-1?RDS[1]:RDS[3],{mat:4,grid:[1,9,1]})}};
 pxArms2(P,arm('AR'),arm('AL'));
}
/* ================= ROUND 3: capes, the bannerman's banner, the cannon, the swarm's skin tone ================= */
const pxZg=h=>{const A=[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),B=[0x4f,0x8a,0x44];return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*.32).toString(16).padStart(2,'0')).join('')};
/* capes: a Minecraft cape (one pixel thick, the art on the back) with folds, hems and an emblem; s = 1 / PXV converts old units */
function pxCapes(type,P0){const X=P0.X;if(!X)return;const s=1/PXV,Tm=teamPal(thp()),C=PD;
 const R=PDP(['#6c111b','#8e1a26','#a62832','#c94450']),E=C('#f3efe6'),Ex=C('#18181c'),G=PDP(['#9a6e1e','#d4a234','#f0cc5c']);
 const cape=(Gx,w,h,z,W,H,col)=>pxBox(Gx,-w/2,-h,z,w,h,1.1,(f,u,v)=>{const r=H-1-v;return col(f,u,r,W,H)},{mat:0,grid:[W,H,1]});
 const fold=(u,W)=>u%3===1?1:(u%3===2?2:0);
 const sun=(u,r,u0,r0)=>{const du=u-u0,dr=r-r0;if(Math.abs(du)+Math.abs(dr)<=1)return G[2];if((du===0&&Math.abs(dr)===2)||(dr===0&&Math.abs(du)===2))return G[1];return null};
 if(type==='guard'){X.cape=newG();cape(X.cape,4.5*s,7.6*s,-.65*s,10,16,(f,u,r,W,H)=>{if(r<=1)return r?Tm[2]:Tm[3];if(r===H-1)return G[1];if(f==='B'||f==='F'){const c=sun(u,r,4.5|0,5);if(c&&f==='B')return c}return R[[2,1,3][fold(u)]]})}
 if(type==='captain'){X.cape=newG();cape(X.cape,4.2*s,9*s,-.65*s,10,18,(f,u,r,W,H)=>{if(r>=H-2)return r===H-1?G[0]:G[1];if(f==='B'){const c=sun(u,r,4,4);if(c)return c}return [Tm[3],Tm[2],Tm[4]][fold(u)]})}
 if(type==='king'){X.cape=newG();X.cape2=newG();
  const erm=(u,r,W)=>(u===0||u===W-1)?((r%3===1)?Ex:E):null;
  cape(X.cape,5.6*s,5*s,-.67*s,12,11,(f,u,r,W,H)=>{const e=erm(u,r,W);if(e)return e;if(r<=1)return (r===1&&u%3===1)?Ex:E;
   if(f==='B'&&r>=3&&r<=7&&u>=3&&u<=8){const du=u-5.5,dr=r-5;if(Math.abs(du)<=2&&Math.abs(dr)<=2){if(dr===-2)return (u%2)?G[2]:null;return dr===2?G[0]:G[1]}}return R[[2,1,3][fold(u)]]});
  cape(X.cape2,6.6*s,5.3*s,-.67*s,14,12,(f,u,r,W,H)=>{const e=erm(u,r,W);if(e)return e;if(r>=H-2)return r===H-1?G[0]:G[2];return R[[2,1,3][fold(u)]]})}}
/* the bannerman's banner: three chained cloth pieces painted as one 20 x 30 Minecraft banner: team field, gold border,
   a gold fleur-de-lis, a swallow tail cut in the bottom */
const FLEUR=['...GG...','..GGGG..','..GGGG..','G..GG..G','GG.GG.GG','GGGGGGGG','.GGGGGG.','...GG...','..GGGG..','...GG...'];
function pxBanner(X){const s=1/PXV,Tm=teamPal(thp()),G=PDP(['#9a6e1e','#d4a234','#f0cc5c']),BW=11.2,SH=5.6,TOT=16.6,W=20,H=30,rp=TOT/H;
 const px=(u,r)=>{if(r>=24){const half=(r-23)*1.55;if(Math.abs(u-9.5)<half)return null}if(r===0)return G[0];if(r===1)return G[2];if(u===0||u===W-1)return G[1];
  if(r===H-1||(r>=24&&Math.abs(Math.abs(u-9.5)-(r-23)*1.55)<.9))return G[0];const fr=r-7,fc=u-6;if(fr>=0&&fr<10&&fc>=0&&fc<8&&FLEUR[fr][fc]!=='.')return fc<4?G[2]:G[1];
  if(r===3||r===21)return G[1];return (u%4===3)?Tm[2]:(r>18?Tm[2]:Tm[3])};
 ['ban','ban2','ban3'].forEach((k,i)=>{X[k]=newG();const g0=-SH*i,g1=i<2?-SH*(i+1):-TOT,r0=Math.round(-g0/rp),r1=Math.round(-g1/rp),nr=r1-r0;
  pxBox(X[k],-BW/2*s,-(g0-g1)*s,-.25*s,BW*s,(g0-g1)*s,.55*s,(f,u,v)=>{if(f==='T'||f==='D')return f==='T'&&i===0?G[1]:null;const r=r0+(nr-1-v);return px(f==='B'?W-1-u:u,r)},{mat:0,grid:[W,nr,1],ao:false})})}
/* the cannon: bronze barrel with reinforcing rings and a cascabel, plank carriage, spoked wheels with iron tyres */
function pxCannon(){const G=newG(),BZ=PDP(['#5a3a10','#8a5a1e','#b8822e','#dca84a','#f2cc6a']),k=1/(PXV*VX);
 const wood=(f,u,v)=>((u+v)%5===0?RWD[1]:(f==='T'?RWD[3]:RWD[2])),iron=(f)=>f==='T'?RDS[3]:RDS[1];
 pxScene(()=>{
  for(const sx of[-1,1]){const x=sx*11.8,y=7.4,z=15.7,X0=sx>0?x:x-2.2;
   pxBox(G,X0,y-7,z-3,2.2,14,6,iron,{mat:4,grid:[2,14,6]});pxBox(G,X0,y-3,z-7,2.2,6,14,iron,{mat:4,grid:[2,6,14]});pxBox(G,X0,y-5.5,z-5.5,2.2,11,11,iron,{mat:4,grid:[2,11,11]});
   pxBox(G,X0+(sx>0?-.2:.2),y-5.2,z-5.2,2.6,10.4,10.4,(f,u,v)=>(f==='R'||f==='L')?((u===5||v===5||u===v||u===10-v)?RWD[3]:RWD[1]):RWD[2],{mat:0,grid:[2,11,11]});
   pxBox(G,sx>0?x+2.2:x-3.6,y-1.6,z-1.6,1.4,3.2,3.2,pBev(BZ),{grid:[1,3,3]})}
  pxBox(G,-11,6.4,14.6,22,2,2,iron,{mat:4,grid:[22,2,2]});
  pxBox(G,-4,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});pxBox(G,2,5,2,2,8,22,wood,{mat:0,grid:[2,8,22]});
  pxBox(G,-3,2,-14,6,4,17,wood,{mat:0,grid:[6,4,17]});pxBox(G,-2.5,1.5,-14.5,5,3,2,iron,{mat:4,grid:[5,3,2]});
  pxBox(G,-3.6,10,-1,7.2,7.2,28,(f,u,v,W,H)=>{if(f==='F')return (u>=2&&u<=4&&v>=2&&v<=4)?RDS[0]:BZ[3];if(f==='B')return BZ[1];const q=f==='T'||f==='D'?v:u;return f==='T'?BZ[3]:(v===H-1?BZ[3]:BZ[2])},{grid:[7,7,28]});
  for(const[z0,l]of[[-1.5,3.5],[11,1.6],[23.6,3.8]])pxBox(G,-4.4,9.2,z0,8.8,8.8,l,pBev(BZ),{grid:[8,8,2]});
  pxBox(G,-1.6,12,-4,3.2,3.2,3,pBev(BZ),{grid:[3,3,3]});
  for(const[x,z]of[[-17,-2],[-14,-3],[-15.5,.5]])pxBox(G,x,0,z,3,3,3,()=>RDS[0],{mat:4,grid:[3,3,3]});
 });return toGeo(G)}
/* ================= ROUND 4b: the castle, rebuilt the Minecraft way (square towers, chunky crenels, steep block roofs) =================
   A = square fortress: curtain walls, four square corner towers, a keep with a steep slate roof, a gatehouse with a portcullis
   B = great keep: one massive square keep with four corner turrets and a stepped slate spire, low walls and corner towers
   front = +z, the 5 x 5 tiles go from 0 to 5; C5.flag = where the animated flag stands */
/* wood or stone: the same castle A in logs and planks for the wooden tier */
let PXCW=false;
const pS=(G,x,y,z,w,h,d,c)=>PXCW?bW(G,x,y,z,w,h,d,(c===QTR||c===QSD2)?QW3:(c===QS[1]?QLOG:QW2)):bS(G,x,y,z,w,h,d,c);
const pSt=(G,x,y0,z,w,d,h,o)=>{if(!PXCW)return qStone(G,x,y0,z,w,d,h,o);const n=Math.max(1,Math.round(h/.2)),q=h/n;for(let k=0;k<n;k++)bW(G,x,y0+k*q,z,w,q,d,k%2?QW1:QW2)};
const pQu=(G,x0,z0,x1,z1,y0,h)=>{if(!PXCW)return qQuoin(G,x0,z0,x1,z1,y0,h)};
function pxCastleMer(G,x0,z0,x1,z1,y,s){s=s||.26;const put=(x,z)=>{pS(G,x,y,z,s,s,s,QS[1]);pS(G,x,y+s,z,s+.03,.03,s+.03,QTR)};
 const nx=Math.max(1,Math.round((x1-x0)/(s*2))),nz=Math.max(1,Math.round((z1-z0)/(s*2)));
 for(let i=0;i<=nx;i++){const x=x0+(x1-x0)*i/nx;put(x,z0);put(x,z1)}for(let j=1;j<nz;j++){const z=z0+(z1-z0)*j/nz;put(x0,z);put(x1,z)}}
function pxCastleGate(G,gz1){const ax0=2.5,aw=.82,ah=1.25,az=gz1+.005;bP(G,ax0,.2,az-.02,aw,ah,.06,'#18171c');bP(G,ax0,.2+ah,az-.02,aw*.6,.12,.06,'#18171c');
 for(const s of[-1,1]){pS(G,ax0+s*(aw/2+.06),.2,az,.12,ah+.12,.06,QTR)}pS(G,ax0,.32+ah,az,aw+.24,.14,.06,QTR);
 for(let i=0;i<6;i++)bP(G,ax0-aw/2+.08+i*(aw-.16)/5,.6,az-.035,.03,ah-.42,.03,QIR);for(const y of[.75,1.15])bP(G,ax0,y,az-.035,aw-.06,.03,.03,QIR);
 pS(G,ax0,.2,az+.14,aw+.3,.04,.3,QSD2);for(const s of[-1,1])qLamp(G,2.5+s*.62,1.45,gz1+.1,true)}
function pxCastleA(wood){PXCW=!!wood;const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)pS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=2.3,TH=.5;const cw=(x,z,w,d)=>{pSt(G,x,.2,z,w,d,WT-.2,{moss:1});pS(G,x,WT,z,w+.06,.08,d+.06,QTR)};
 cw(2.5,.3,3.4,TH);cw(.3,2.5,TH,3.4);cw(4.7,2.5,TH,3.4);cw(1.05,4.7,1.1,TH);cw(3.95,4.7,1.1,TH);
 pxCastleMer(G,.9,.08,4.1,.08,WT+.08);pxCastleMer(G,.08,.9,.08,4.1,WT+.08);pxCastleMer(G,4.92,.9,4.92,4.1,WT+.08);
 for(const z of[1.4,2.5,3.6]){qSlit(G,.045,1.2,z,false);qSlit(G,4.955,1.2,z,false)}
 /* square corner towers with a cornice, chunky crenels, banners on the front pair */
 for(const[x,z]of[[.65,.65],[4.35,.65],[.65,4.35],[4.35,4.35]]){const bk=z<2.5,H=bk?3.9:3.4,W=1.25,ox=x<2.5?-1:1,oz=z<2.5?-1:1;
  qPlinth(G,x,0,z,W+.12,W+.12,.2);pSt(G,x,.2,z,W,W,H-.2,{moss:1,ph:bk?1:0});pQu(G,x-W/2,z-W/2,x+W/2,z+W/2,.2,H-.2);
  pS(G,x,H,z,W+.18,.12,W+.18,QTR);pS(G,x,H+.12,z,W+.1,.06,W+.1,QSD2);pxCastleMer(G,x-W/2-.04,z-W/2-.04,x+W/2+.04,z+W/2+.04,H+.12,.28);
  qSlit(G,x+ox*(W/2+.005),1.3,z,false);qSlit(G,x,1.3,z+oz*(W/2+.005),true);qWin(G,x+ox*(W/2+.012),2.6,z,false,ox,{w:.16,h:.24,glow:1});qWin(G,x,2.6,z+oz*(W/2+.012),true,oz,{w:.16,h:.24,glow:1});
  if(!bk)qBan(G,x,H-.95,z+W/2+.03,true,1,.36,.8);else qFlag(G,x,H+.18,z,.8)}
 /* keep: square, steep slate gable roof with dormers, banners, a door */
 const kx=2.5,kz=1.75,KW=2.2,KD=1.9,KH=3.9;qPlinth(G,kx,.2,kz,KW+.12,KD+.12,.12);pSt(G,kx,.32,kz,KW,KD,KH-.32,{ph:1});pQu(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.32,KH-.32);
 pS(G,kx,KH,kz,KW+.16,.1,KD+.16,QTR);
 for(const[x,z,ax,n]of[[kx,kz+KD/2,true,1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){const L=ax?KW:KD;for(const o of[-.3,.3]){const w=o*L;qWin(G,ax?x+w:x+n*.012,2.7,ax?z+n*.012:z+w,ax,n,{w:.18,h:.34,glow:1})}}
 qDoor(G,kx,kz+KD/2+.016,true,1,{y:.32,w:.5,h:.8,wood:1});qBan(G,kx-.7,1.6,kz+KD/2+.04,true,1,.3,.7);qBan(G,kx+.7,1.6,kz+KD/2+.04,true,1,.3,.7);
 const rt=qRoof(G,kx,kz,KW+.1,KD+.1,KH+.1,PXCW?QSH:QSL,true,{rise:.3,run:.17});C5.flag=(typeof rt==='number'?rt:KH+1.9)+.05;C5.wflag=C5.flag;
 pS(G,kx-.55,KH+.1,kz+.5,.1,.9,.1,QSD);qFlag(G,kx,C5.flag-.05,kz,.9);
 /* gatehouse: a square block over the gate, crenellated, the arms of the kingdom */
 const gz0=4.15,gz1=5.05,GH=3.0,gzc=(gz0+gz1)/2;pSt(G,2.5,.2,gzc,1.9,gz1-gz0,GH-.2,{moss:1,ph:2});pQu(G,1.55,gz0,3.45,gz1,.2,GH-.2);
 pS(G,2.5,GH,gzc,2.06,.12,gz1-gz0+.12,QTR);pxCastleMer(G,1.5,gz0-.02,3.5,gz1+.04,GH+.12,.26);pxCastleGate(G,gz1);qBan(G,2.5,1.75,gz1+.04,true,1,.4,.75);
 qBarrel(G,3.3,3.2,.22);qBarrel(G,3.5,3.0,.22);qCrate(G,1.6,3.0,.22,.26);for(const[x,z]of[[1.6,3.9],[3.4,3.9]])qPost(G,x,.22,z,.55,true);
 return toGeo(G)}
function pxCastleB(){const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)bS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=1.7,TH=.4;const cw=(x,z,w,d)=>{qStone(G,x,.2,z,w,d,WT-.2,{moss:1});bS(G,x,WT,z,w+.06,.08,d+.06,QTR)};
 cw(2.5,.22,3.8,TH);cw(.22,2.5,TH,3.8);cw(4.78,2.5,TH,3.8);cw(1.0,4.78,1.2,TH);cw(4.0,4.78,1.2,TH);
 pxCastleMer(G,.8,.04,4.2,.04,WT+.08,.24);pxCastleMer(G,.04,.8,.04,4.2,WT+.08,.24);pxCastleMer(G,4.96,.8,4.96,4.2,WT+.08,.24);
 for(const[x,z]of[[.5,.5],[4.5,.5],[.5,4.5],[4.5,4.5]]){const W=.95,H=2.5;qStone(G,x,.2,z,W,W,H-.2,{moss:1});bS(G,x,H,z,W+.14,.1,W+.14,QTR);pxCastleMer(G,x-W/2-.03,z-W/2-.03,x+W/2+.03,z+W/2+.03,H+.1,.24)}
 /* the great keep */
 const kx=2.5,kz=2.2,KW=2.7,KH=4.6;qPlinth(G,kx,.2,kz,KW+.14,KW+.14,.14);qStone(G,kx,.34,kz,KW,KW,KH-.34,{ph:1});qQuoin(G,kx-KW/2,kz-KW/2,kx+KW/2,kz+KW/2,.34,KH-.34);
 for(const y of[1.6,3.1])bS(G,kx,y,kz,KW+.08,.08,KW+.08,QTR);bS(G,kx,KH,kz,KW+.2,.12,KW+.2,QTR);pxCastleMer(G,kx-KW/2-.06,kz-KW/2-.06,kx+KW/2+.06,kz+KW/2+.06,KH+.12,.3);
 for(const[x,z,ax,n]of[[kx,kz+KW/2,true,1],[kx,kz-KW/2,true,-1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){for(const o of[-.65,0,.65]){qWin(G,ax?x+o:x+n*.012,3.55,ax?z+n*.012:z+o,ax,n,{w:.18,h:.36,glow:1})}qWin(G,ax?x-.6:x+n*.012,2.1,ax?z+n*.012:z-.6,ax,n,{w:.16,h:.3,glow:1});qWin(G,ax?x+.6:x+n*.012,2.1,ax?z+n*.012:z+.6,ax,n,{w:.16,h:.3,glow:1})}
 qDoor(G,kx,kz+KW/2+.016,true,1,{y:.34,w:.56,h:.86,wood:1});qBan(G,kx-.85,2.3,kz+KW/2+.04,true,1,.34,.9);qBan(G,kx+.85,2.3,kz+KW/2+.04,true,1,.34,.9);
 /* corner turrets with stepped slate roofs, the stepped spire in the middle */
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=kx+a*(KW/2-.05),z=kz+b*(KW/2-.05),W=.72,H=KH+.9;qStone(G,x,KH-.4,z,W,W,H-KH+.4,{ph:2});bS(G,x,H,z,W+.12,.08,W+.12,QTR);qPyr(G,x,z,H+.08,W+.16,W+.16,QSL,.16,.09)}
 const sb=KH+.12,SW=1.3;qStone(G,kx,sb,kz,SW,SW,.9,{ph:1});for(const[x,z,ax,n]of[[kx,kz+SW/2,true,1],[kx+SW/2,kz,false,1],[kx-SW/2,kz,false,-1],[kx,kz-SW/2,true,-1]])qWin(G,x+(ax?0:n*.012),sb+.3,z+(ax?n*.012:0),ax,n,{w:.2,h:.36,glow:1});
 const kt=qPyr(G,kx,kz,sb+.9,SW+.2,SW+.2,QSL,.2,.1);C5.flag=(typeof kt==='number'?kt:sb+2.2)+.05;qFlag(G,kx,C5.flag-.05,kz,.9);
 /* small gatehouse */
 const gz0=4.35,gz1=5.05,GH=2.3;qStone(G,2.5,.2,(gz0+gz1)/2,1.7,gz1-gz0,GH-.2,{moss:1});bS(G,2.5,GH,(gz0+gz1)/2,1.84,.1,gz1-gz0+.12,QTR);pxCastleMer(G,1.62,gz0,3.38,gz1+.03,GH+.1,.24);pxCastleGate(G,gz1);
 return toGeo(G)}

let PXON=true,SHZ=+(window.__SHZ||1.35);let ALB=0,ALF=null;const alv=()=>ALF!=null?ALF:(RS2.done.plate?1:0)+(RS2.done.mail?1:0);
const HA={st:'#a9b0be',st2:'#878e9d',st3:'#666c7a',sth:'#cfd5df',ml:'#7f8591',ml2:'#61666f',br:'#c39a45',br2:'#e2c06a',gd:'#d4a234',gd2:'#ecc964',gdd:'#9a6e1e',lt:'#6b4423',lt2:'#4a2e16',lt3:'#8a5a32',em:'#f4ecd8',hx:'#62e4ff',dk:'#141218'};
function hkPut(Gx,m){return(x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(Gx,x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}}}
function humanKit(type,AL,P){
 const{G,HG,LA,LG,AG}=P,t=hkPut(G,0),tm=hkPut(G,4),tc=hkPut(G,7),tg=hkPut(G,5),hd=hkPut(HG,0),hm=hkPut(HG,4),hc=hkPut(HG,7),hg=hkPut(HG,5),k=hkPut(LG,0),km=hkPut(LG,4),
  A=(m,dx,y,z,w,h,d,c)=>{hkPut(AG,m)(dx,y,z,w,h,d,c);hkPut(LA,m)(-2.76-dx,y+10.45,z,w,h,d,c)},AE=(m,dx,y,z,w,h,d,c)=>hkPut(AG,m)(dx,y,z,w,h,d,c),AW=(m,dx,y,z,w,h,d,c)=>hkPut(LA,m)(-2.76-dx,y+10.45,z,w,h,d,c),
  L=(m,x,y,z,w,h,d,c)=>hkPut(LA,m)(x,y,z,w,h,d,c),P1=thp(),P2=ths(),PD=thd(),skin='#c68a5e';
 if(PXON&&(type==='king'||type==='captain'||type==='bannerman')){({king:pxKing,captain:pxCaptain,bannerman:pxBannerman})[type](P,AL);return null}
 if(PXON&&(type==='gunner'||type==='gunner2')){pxGunner(P,AL);if(type==='gunner2'){AE(0,0,-4.65,1.6,.3,.3,7.4,'#8a6a3a');AE(0,0,-4.85,5.5,.68,.68,1.0,'#4a3a2a');AE(0,0,-4.75,-2.3,.4,.4,.4,'#5a4428')}return{h:15.6}}
 if(PXON&&(type==='peasant'||type==='archer'||type==='guard')){({peasant:pxPeasant,archer:pxArcher,guard:pxGuard})[type](P,AL);return{h:type==='guard'?21:15.6}}
 if(type==='peasant'){
  const pv=ZVAR&&ZVAR.hint==='p'?ZVAR.v%6:0,psh=['#8a5a32','#6e7a3e','#7c4a42','#55667a','#8a7a52','#6a4a6a'][pv],psk=['#c68a5e','#d8a07a','#a8704a','#c88a62','#b67e56','#dca888'][pv],phr=['#5a3a1a','#2a1a10','#8a6a3a','#1e1a18','#a0522d','#6a6a62'][pv],phat=[0,2,0,1,3,0][pv];
  mcTorso(G,{shirt:psh,belt:'#5a3a1a'});mcLimbs(G,LG,AG,{pants:['#5a4a30','#4a4038','#5e5240','#3e3a36','#5a4a30','#4e4234'][pv],sleeve:psh,hand:psk,shoes:'#3a2a18'});mcHead(G,psk,phr);
  A(7,0,-3.0,0,1.98,.36,1.98,'#9a6a3c');k(0,-5.5,.06,1.96,1.6,2.06,'#3a2a18');k(0,-4.0,.06,2.02,.24,2.1,'#5a3f24');
  if(AL>=1){t(0,5.95,0,3.92,4.3,2.04,'#a88a5a');for(let i=0;i<4;i++)t(0,6.5+i*.95,1.03,3.3,.13,.04,'#7a6038');t(0,6.3,1.03,.13,3.7,.04,'#7a6038');t(0,6.3,-1.03,.13,3.7,.04,'#7a6038')}
  tc(0,5.6,1.06,2.5,3.3,.08,'#e2d3a8');tc(0,8.9,1.06,1.6,.9,.08,'#e2d3a8');tc(-.7,9.8,1.06,.16,1.2,.06,'#c9b78a');tc(.7,9.8,1.06,.16,1.2,.06,'#c9b78a');tc(0,6.6,1.11,1.2,.9,.05,'#cdbd90');
  t(0,5.8,0,3.96,.32,2.16,'#c9a86a');t(.9,5.3,1.08,.18,.6,.1,'#c9a86a');t(-1.35,5.62,1.06,.7,.78,.34,HA.lt);tm(-1.35,6.15,1.24,.22,.18,.04,HA.br);
  t(0,10.35,0,2.6,.62,2.08,'#7a4e2c');
  if(AL>=2){A(0,.1,-1.05,0,2.14,1.05,2.14,HA.lt);A(4,.1,-1.1,0,2.18,.14,2.18,HA.br);A(0,0,-4.5,0,2.0,1.3,2.0,HA.lt);A(4,0,-3.32,0,2.06,.12,2.06,HA.br)}
  if(phat===0){hc(0,14.3,0,5.6,.4,5.6,'#e0c060');hc(0,14.7,0,3.9,.9,3.9,'#f0d878');hc(0,14.62,0,4.0,.32,4.0,'#8a4a2a');hc(0,15.6,0,2.6,.2,2.6,'#e8cc68')}
  else if(phat===1){hc(0,14.05,0,4.0,.95,4.0,'#6a5038');hc(0,14.05,0,4.06,.25,4.06,'#4e3a28');hc(0,15.0,-.4,2.6,.35,2.8,'#6a5038')}
  else if(phat===2){hc(0,13.9,-.1,4.04,1.0,4.0,'#d8cbaa');hc(0,11.6,-1.98,4.04,2.4,.16,'#d8cbaa');hc(1.98,12.1,-.4,.16,1.9,3.0,'#d8cbaa');hc(-1.98,12.1,-.4,.16,1.9,3.0,'#d8cbaa');hc(0,13.85,1.98,4.06,.22,.16,'#b8a984')}
  t(0,6.2,-1.55,2.8,2.8,1.0,'#7a5a2a');t(0,6.8,-2.15,2.2,.6,.3,'#9a7a3a');t(0,8.9,-1.55,2.9,.3,1.06,'#5a3f1c');return{h:15.6}}
 if(type==='gunner'||type==='gunner2'){const CO=P1,COD=PD,LT2=HA.lt2,BRS=HA.br;
  mcTorso(G,{shirt:CO,belt:LT2});mcLimbs(G,LG,AG,{pants:'#3e3a36',sleeve:CO,hand:skin,shoes:'#2a2420'});mcHead(G,skin,'#3a2410');
  t(0,4.5,0,3.94,1.05,2.0,CO);t(0,4.5,0,3.98,.22,2.04,COD);tc(0,5.0,1.0,2.6,4.6,.1,'#6a4a2a');tc(0,5.0,1.0,2.7,.2,.12,'#4a321c');
  for(let i=0;i<7;i++)t(-1.5+i*.5,6.0+i*.68,1.05,.62,.46,.08,LT2);for(const[x,y]of[[-1.0,6.6],[0,7.95],[1.0,9.3]]){tm(x,y,1.13,.44,.56,.2,BRS);tm(x,y+.56,1.13,.2,.16,.14,'#7a5a2a')}
  t(0,5.5,0,3.98,.42,2.08,LT2);tm(0,5.47,1.06,.52,.52,.06,BRS);t(0,10.3,0,2.7,.6,2.06,COD);
  A(0,0,-5.5,0,2.0,1.75,2.0,'#4a3424');A(0,0,-3.85,0,2.07,.32,2.07,'#5e4430');A(7,0,-1.2,0,2.02,.3,2.02,COD);
  k(0,-5.5,.08,2.0,2.5,2.12,'#2a2420');k(0,-3.1,.08,2.08,.32,2.2,'#3a3028');k(0,-1.0,.06,1.94,.3,1.96,COD);
  hc(0,14.35,0,4.7,.34,4.7,'#2e2a2c');hc(0,14.69,0,3.92,.78,3.92,CO);hc(0,14.62,0,4.02,.24,4.02,BRS);hc(1.55,15.0,-.7,.3,1.7,.3,'#f2efe6');hc(1.55,16.5,-1.05,.3,.9,.3,'#e0dccf');hc(1.55,17.2,-1.5,.26,.6,.26,'#cfcabc');
  hd(-.9,11.55,1.88,1.0,.38,.06,'#6a5a4e');hd(.8,12.0,1.88,.6,.3,.06,'#6a5a4e');
  if(type==='gunner2'){AE(0,0,-4.65,1.6,.3,.3,7.4,'#8a6a3a');AE(0,0,-4.85,5.5,.68,.68,1.0,'#4a3a2a');AE(0,0,-4.75,-2.3,.4,.4,.4,'#5a4428')}
  return{h:15.6}}
 if(type==='archer'){const HO='#2f6e35',HOD='#22552a';
  mcTorso(G,{shirt:'#3f9a45',belt:HA.lt});mcLimbs(G,LG,AG,{pants:'#6a5a3a',sleeve:'#3f9a45',hand:skin,shoes:'#3a2a18'});mcHead(G,skin,'#6a3a18');
  t(0,5.5,0,3.86,4.25,1.98,HA.lt3);for(let i=0;i<4;i++){t(-.22,6.25+i*.85,1.0,.34,.1,.04,HA.lt2);t(.22,6.25+i*.85,1.0,.34,.1,.04,HA.lt2)}t(0,6.05,1.0,.1,3.4,.04,HA.lt2);
  tc(0,9.45,0,4.12,1.55,2.26,HO);tc(0,9.3,0,4.16,.2,2.3,HOD);tc(0,6.4,-1.1,3.5,3.1,.14,HO);tc(0,6.4,-1.12,3.56,.2,.16,HOD);
  for(let i=0;i<6;i++)t(-1.55+i*.62,5.9+i*.86,1.04,.66,.52,.1,HA.lt2);
  t(.9,6.0,-1.55,1.4,4.0,1.2,HA.lt);tm(.9,6.4,-1.55,1.48,.2,1.28,HA.br);tm(.9,9.1,-1.55,1.48,.2,1.28,HA.br);
  for(const[x,z,c]of[[.6,-1.3,'#f2f2f2'],[1.1,-1.65,'#e04a3a'],[.82,-1.8,'#f2f2f2'],[1.28,-1.3,'#e04a3a']]){t(x,9.9,z,.08,.6,.08,'#c8a070');tc(x,10.3,z,.24,.62,.24,c)}
  t(0,5.5,0,3.98,.45,2.1,HA.lt2);tm(0,5.47,1.06,.5,.5,.06,AL>=2?HA.gd:HA.br);t(1.3,5.6,1.06,.72,.72,.32,HA.lt);t(-1.35,5.6,1.06,.56,.6,.32,HA.lt);
  AW(0,0,-4.65,0,2.02,1.55,2.02,HA.lt);AW(4,0,-3.2,0,2.08,.14,2.08,HA.br);AE(0,0,-5.5,0,1.98,1.05,1.98,HA.lt2);
  k(0,-5.5,.08,1.98,2.1,2.12,HA.lt2);k(0,-3.55,.08,2.08,.32,2.22,HA.lt);
  hc(0,14.05,-.05,3.98,.9,3.96,HO);hc(1.93,11.0,-.05,.14,3.4,3.9,HO);hc(-1.93,11.0,-.05,.14,3.4,3.9,HO);hc(0,11.0,-1.96,3.98,3.95,.14,HO);hc(0,14.5,-1.45,1.7,.75,1.35,HO);hc(0,15.0,-1.9,.9,.5,.8,HO);hc(0,13.68,1.9,3.98,.44,.18,HOD);hc(1.93,11.0,1.7,.16,2.9,.5,HOD);hc(-1.93,11.0,1.7,.16,2.9,.5,HOD);
  if(AL>=1){for(const[x,y]of[[-1.3,6.6],[1.3,6.6],[-1.3,7.7],[1.3,7.7],[-1.3,8.7],[1.3,8.7]])tm(x,y,1.0,.24,.24,.06,'#d8c890');
   A(0,.12,-.95,0,2.22,1.2,2.22,HA.lt);A(4,.12,-1.0,0,2.28,.16,2.28,HA.br);for(const z of[-.6,0,.6])A(4,.12,-.4,z,.2,.2,2.26,'#d8c890');AE(0,0,-4.65,0,2.02,1.55,2.02,HA.lt)}
  if(AL>=2){A(0,0,-2.75,0,1.96,1.3,1.96,HA.ml);A(4,0,-4.55,0,2.08,1.25,2.08,HA.st3);A(4,0,-3.3,0,2.14,.14,2.14,HA.gd);tm(0,10.45,0,2.9,.55,2.34,HA.st2);
   hc(0,13.66,1.93,4.02,.14,.16,HA.gd);tm(0,5.4,1.1,.7,.7,.06,HA.gd);tg(0,5.55,1.14,.4,.4,.04,HA.hx)}
  return{h:15.6}}
 /* King Naraige: royal blue enamel plate with gilded edges, ermine collar, crowned great helm */
 if(type==='king'){const AR=thp(),ARD=thd(),ARL=lighten(AR,.18),GD=HA.gd,GD2=HA.gd2,GDD=HA.gdd,RED='#9e1b26',ERM='#f3efe6',ERS='#141418',STL='#c3cad6',STL2='#e2e6ee',STD='#5a6272',DK='#0b0a0e';
  mcTorso(G,{shirt:ARD,belt:GDD});mcLimbs(G,LG,AG,{pants:ARD,sleeve:ARD,hand:STL,shoes:STD,bare:false});
  tm(0,6.25,0,4.18,4.5,2.42,AR);tm(0,6.35,0,.62,4.3,2.52,ARL);tm(0,10.42,0,4.24,.42,2.52,GD);tm(0,6.15,0,4.26,.36,2.54,GD);for(const s of[-1,1])tm(s*2.04,6.35,0,.22,4.1,2.52,GD);
  tm(0,7.45,1.25,1.8,1.8,.12,GD);tm(0,7.8,1.32,1.1,1.1,.08,GD2);tg(0,8.1,1.37,.5,.5,.06,'#ff3b3b');
  for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?1.18:1.36,s=k%2?.28:.36;tm(Math.sin(a)*r,8.35+Math.cos(a)*r-s/2,1.26,s,s,.1,k%2?GD2:GD)}
  tm(0,5.3,0,4.32,.62,2.58,GD);tm(0,5.2,1.3,1.1,.82,.12,GD2);tg(0,5.42,1.37,.44,.38,.06,'#3a7aff');
  for(const s of[-1,1]){tm(s*1.1,3.5,1.02,1.78,1.85,.44,AR);tm(s*1.1,3.45,1.03,1.84,.26,.5,GD);tm(s*1.1,4.45,1.05,1.82,.16,.48,GDD)}
  tc(0,1.6,1.2,1.25,3.75,.14,RED);tc(0,1.55,1.22,1.35,.24,.16,GD);for(const s of[-1,1])tc(s*.66,1.6,1.22,.12,3.75,.16,GD);tm(0,3.25,1.29,.55,.55,.06,GD2);
  tc(0,10.45,0,4.3,1.1,3.05,ERM);for(const x of[-1.6,-.5,.55,1.6])tc(x,10.72,1.53,.24,.42,.08,ERS);for(const x of[-1.1,0,1.1])tc(x,10.72,-1.53,.24,.42,.08,ERS);for(const s of[-1,1])tc(s*2.15,10.72,.35*s,.08,.42,.24,ERS);
  tm(0,10.2,1.55,1.0,.6,.1,GD);tg(0,10.32,1.61,.36,.36,.05,'#ff3b3b');
  A(4,.42,-.2,0,3.3,1.3,3.1,AR);A(4,.42,-.3,0,3.36,.24,3.16,GD);A(4,.42,1.06,0,2.3,.22,2.3,GD2);
  A(4,.48,-1.1,0,3.08,.88,2.9,AR);A(4,.48,-1.18,0,3.14,.2,2.96,GD);A(4,.54,-1.88,0,2.78,.72,2.6,ARD);A(4,.54,-1.95,0,2.84,.18,2.66,GD);
  A(4,0,-4.15,0,2.1,1.42,2.1,AR);A(4,0,-2.85,0,2.16,.24,2.16,GD);A(4,0,-4.22,0,2.16,.2,2.16,GD);A(4,0,-5.62,0,2.18,1.44,2.18,STL);A(4,0,-5.66,0,2.22,.3,2.22,STD);
  km(0,-2.55,0,2.04,2.45,2.04,AR);km(0,-3.3,.6,1.6,1.1,1.02,GD);km(0,-3.05,1.12,.62,.6,.08,GD2);km(0,-5.2,.03,2.08,2.05,2.08,AR);km(0,-3.18,0,2.12,.16,2.12,GDD);
  k(0,-5.62,.3,2.12,.66,2.52,STD);km(0,-5.6,1.5,1.5,.46,.12,GD);
  hm(0,10.55,0,3.3,.7,3.1,STD);hm(0,10.9,0,4.22,4.08,4.22,STL);hc(0,14.98,0,3.9,.78,3.9,RED);hc(0,15.76,0,2.9,.32,2.9,RED);hm(0,10.84,0,4.3,.32,4.3,GD);
  hm(0,11.0,2.09,3.86,3.85,.14,STL2);hd(0,12.76,2.18,3.24,.36,.06,DK);hd(0,11.3,2.18,.38,1.46,.06,DK);for(const x of[-1.25,-.85,.85,1.25])for(const y of[11.45,11.95])hd(x,y,2.18,.2,.2,.05,DK);
  hm(0,13.12,2.2,3.42,.18,.06,GD);hm(0,12.56,2.2,3.42,.18,.06,GD);hm(0,13.3,2.22,.36,1.68,.08,GD);
  for(const s of[-1,1]){hm(s*2.13,11.25,-.15,.1,2.9,3.2,AR);hm(s*2.18,12.15,.25,.1,1.0,1.0,GD);hm(s*2.22,12.4,.25,.08,.5,.5,GD2)}
  hc(0,11.4,-2.2,3.3,2.9,.16,RED);hc(0,11.3,-2.24,3.4,.22,.18,GD);
  hm(0,14.3,0,4.52,.8,4.52,GD);hm(0,14.24,0,4.58,.18,4.58,GDD);hm(0,15.02,0,4.58,.14,4.58,GD2);
  hg(0,14.45,2.29,.58,.5,.07,'#ff2f3f');for(const s of[-1,1])hg(s*1.22,14.52,2.29,.34,.34,.06,'#3a7aff');for(const s of[-1,1])hg(s*2.29,14.48,0,.07,.44,.44,'#2fd07a');hg(0,14.45,-2.29,.5,.46,.07,'#ff2f3f');
  const fl=(x,z,al)=>{hm(x,15.1,z,.52,1.2,.52,GD);hm(x+(al?0:.44),15.42,z+(al?.44:0),.36,.46,.36,GD);hm(x-(al?0:.44),15.42,z-(al?.44:0),.36,.46,.36,GD);hm(x,16.28,z,.36,.46,.36,GD2);hg(x,16.72,z,.26,.26,.26,'#fff3d6')};
  fl(0,2.14,0);fl(0,-2.14,0);fl(2.14,0,1);fl(-2.14,0,1);hm(0,16.06,0,.44,.38,3.7,GD);hm(0,16.06,0,3.7,.38,.44,GD);for(const s of[-1,1]){hm(0,15.3,s*1.75,.44,.8,.44,GD);hm(s*1.75,15.3,0,.44,.8,.44,GD)}hm(0,16.44,0,.8,.72,.8,GD2);hm(0,17.16,0,.28,.62,.28,GD);hg(0,17.78,0,.22,.22,.22,'#fff3d6');for(const[x,z]of[[1.98,1.98],[-1.98,1.98],[1.98,-1.98],[-1.98,-1.98]]){hm(x,15.1,z,.38,.78,.38,GD);hg(x,15.88,z,.3,.3,.3,'#f6f0e2')}
  return{h:23}}
 /* royal guard: blue plate, crimson tabard with the royal sun, plumed great helm */
 if(type==='guard'){const AR=thp(),ARD=thd(),ARL=lighten(AR,.16),GD=HA.gd,GD2=HA.gd2,GDD=HA.gdd,RED='#9e1b26',STL='#c3cad6',STD='#5a6272',DK=HA.dk;
  mcTorso(G,{shirt:ARD,belt:GDD});mcLimbs(G,LG,AG,{pants:ARD,sleeve:ARD,hand:STL,shoes:STD,bare:false});
  tm(0,6.3,0,4.12,4.4,2.36,AR);tm(0,10.36,0,4.18,.4,2.46,GD);tm(0,6.2,0,4.2,.32,2.44,GD);for(const s of[-1,1])tm(s*2.0,6.4,0,.2,4.0,2.44,GD);
  tc(0,1.9,1.22,2.5,8.05,.12,RED);for(const s of[-1,1])tc(s*1.2,1.9,1.25,.14,8.05,.14,GD);tc(0,1.85,1.25,2.6,.24,.14,GD);
  tc(0,6.9,1.3,1.4,1.4,.06,GD);tc(0,7.2,1.34,.8,.8,.05,GD2);for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?.92:1.06,s=k%2?.22:.3;tc(Math.sin(a)*r,7.6+Math.cos(a)*r-s/2,1.31,s,s,.06,GD)}
  tm(0,5.3,0,4.26,.55,2.62,GDD);tm(0,5.25,1.32,.8,.65,.08,GD);
  A(4,.36,-.25,0,3.0,1.15,2.8,AR);A(4,.36,-.33,0,3.06,.22,2.86,GD);A(4,.42,-1.05,0,2.7,.75,2.5,ARD);A(4,.42,-1.12,0,2.76,.18,2.56,GD);
  A(4,0,-4.1,0,2.06,1.35,2.06,AR);A(4,0,-2.85,0,2.12,.22,2.12,GD);A(4,0,-5.6,0,2.14,1.4,2.14,STL);
  km(0,-2.5,0,2.0,2.4,2.0,AR);km(0,-3.2,.58,1.5,1.0,.95,GD);km(0,-5.2,.03,2.04,2.0,2.04,AR);k(0,-5.6,.28,2.08,.62,2.42,STD);
  hm(0,10.55,0,3.2,.65,3.0,STD);hm(0,10.92,0,4.12,4.06,4.12,AR);hm(0,14.98,0,3.7,.4,3.7,AR);hm(0,10.86,0,4.2,.3,4.2,GD);hm(0,13.0,0,4.2,.3,4.2,GD);hm(0,11.0,0,.42,3.98,4.2,ARL);
  for(const s of[-1,1])hd(s*.95,12.36,2.08,1.38,.36,.1,DK);hd(0,11.2,2.08,.42,1.52,.1,DK);hm(0,12.74,2.11,3.1,.14,.08,GD);
  hm(0,13.35,2.1,.5,.7,.1,GD);hm(0,14.05,2.1,.3,.3,.1,GD2);for(const s of[-1,1])hm(s*2.08,12.2,.2,.08,.6,.6,GD);
  hm(0,15.32,0,.5,.42,3.5,GD);hd(0,10.6,-1.55,3.6,.9,1.0,ARD);
  return{h:21}}
 /* knight / captain / bannerman */
 if(type==='knight'&&PXON){pxKnight(P,AL);return null}
 const cap=type==='captain',ban=type==='bannerman',pl=cap?HA.gd:HA.st,plh=cap?HA.gd2:HA.sth,pld=cap?HA.gdd:HA.st2,tr=cap?HA.sth:(AL>=2?HA.gd:HA.br);
 mcTorso(G,{shirt:P1,belt:P2});mcLimbs(G,LG,AG,{pants:'#55555e',sleeve:HA.ml,hand:skin,shoes:'#3a3a42',bare:false});mcHead(G,skin,ban?'#4a2e16':null);
 t(0,5.5,0,3.86,5.5,1.98,HA.ml);A(0,0,-5.4,0,1.9,5.4,1.9,HA.ml);k(0,-5.4,0,1.9,5.3,1.9,HA.ml2);
 const b0=ban?7.7:6.9;tm(0,b0,0,3.62,10.65-b0,2.12,pl);tm(0,b0+.2,0,.5,10.4-b0,2.26,plh);tm(0,10.45,0,3.1,.62,2.36,pld);
 if(!ban)for(const s of[-1,1])tm(s*1.55,7.4,0,.5,2.4,2.18,pld);
 tc(0,5.0,1.1,2.2,4.3,.14,P1);tc(0,5.0,-1.1,2.2,4.3,.14,PD);tc(-1.08,5.0,1.12,.12,4.3,.16,tr);tc(1.08,5.0,1.12,.12,4.3,.16,tr);tc(0,5.0,1.12,2.24,.16,.16,tr);
 tc(0,6.05,1.19,.42,2.6,.04,HA.em);tc(0,7.6,1.19,1.45,.42,.04,HA.em);
 t(0,5.82,0,3.98,.5,2.4,HA.lt2);tm(0,5.76,1.2,.62,.62,.06,tr);
 const pw=ban?2.3:2.55,ph=ban?1.5:1.85;
 A(4,.18,.6-ph,0,pw,ph,pw,pl);A(4,.18,.6,0,pw-.5,.3,pw-.3,plh);A(4,.32,.1-ph,0,pw-.2,.5,pw-.15,pld);A(4,.18,.52-ph,0,pw+.06,.16,pw+.08,tr);
 if(!ban){A(4,0,-2.65,0,1.98,1.0,1.98,pld);A(4,.62,-3.25,-.1,.8,.8,1.3,pl)}
 A(ban?0:4,0,-5.5,0,2.04,2.0,2.04,ban?HA.lt:pl);A(4,0,-3.62,0,2.18,.28,2.18,tr);A(4,0,-5.5,0,2.1,.5,2.1,ban?HA.lt2:pld);
 if(!ban){km(0,-2.3,.02,1.98,2.1,1.98,pl);km(0,-1.55,.55,1.94,1.5,.98,pld);km(0,-1.62,1.02,1.96,.14,.1,tr)}
 km(0,-3.05,.62,1.3,.8,.9,plh);km(0,-5.0,0,1.98,2.0,1.98,ban?HA.st2:pl);km(0,-5.5,.15,2.02,.56,2.26,pld);
 if(!ban){hm(0,10.95,0,4.0,3.95,4.0,pl);hm(0,13.15,0,4.14,.4,4.14,tr);hm(0,11.0,0,.42,3.9,4.12,plh);hd(-.9,12.45,2.06,1.31,.34,.12,HA.dk);hd(.9,12.45,2.06,1.31,.34,.12,HA.dk);
  for(const[x,y]of[[.75,11.6],[1.15,11.6],[.75,11.95],[1.15,11.95]])hd(x,y,2.06,.17,.17,.12,HA.dk);hm(0,14.9,0,3.4,.3,3.4,pld);hm(0,15.2,0,.5,.32,3.0,plh);hd(0,10.62,-1.55,3.6,.9,1.0,HA.ml)}
 else{hd(0,13.95,0,3.98,.85,3.98,HA.ml);hd(1.93,11.0,0,.14,3.8,3.98,HA.ml);hd(-1.93,11.0,0,.14,3.8,3.98,HA.ml);hd(0,11.0,-1.93,3.98,3.8,.14,HA.ml);
  hm(0,14.3,0,5.0,.28,5.0,pl);hm(0,14.58,0,3.7,.75,3.7,pl);hm(0,15.33,0,2.5,.25,2.5,plh);hm(0,14.58,0,3.8,.2,3.8,tr)}
 if(AL>=1){A(4,.3,.25,0,pw-.25,.5,pw-.1,plh);A(4,-.5,.55,0,.3,.85,pw-.3,pl);tm(0,6.15,0,3.3,.75,2.22,pld);
  if(!ban){hm(0,15.2,0,.36,.8,3.2,tr);km(.75,-3.15,.4,.3,.75,.95,pl);km(-.75,-3.15,.4,.3,.75,.95,pl)}else hm(0,15.58,0,.4,.3,.4,tr)}
 if(AL>=2){tm(0,9.25,1.19,1.0,1.0,.08,HA.gd);tg(0,9.45,1.24,.6,.6,.04,HA.hx);A(4,1.0,-.25,0,.3,1.35,1.5,HA.gd);A(4,0,-5.5,0,2.14,.5,2.14,HA.gd);
  if(type==='knight'){hc(0,15.95,-.3,.42,.55,2.8,P1);hc(0,15.5,-1.75,.42,.9,.6,P1);hc(0,15.2,-2.05,.42,.9,.5,P2)}
  if(ban){hm(0,14.3,0,5.06,.1,5.06,HA.gd);tg(0,14.65,1.86,.4,.4,.06,HA.hx)}}
 return null}
function mcModel(type,z){
 const G=newG(),HG=newG(),LA=newG(),LG=newG(),AG=newG(),P0={G,HG,LA,hy:11,lax:2.2};RT=P0;let sc=1.35,h=15.6,parts=null,X=null;
 const skin='#c68a5e',hair='#3a2410';
 if(type==='zombie'||type==='husk'||type==='runner'||type==='brute'||type==='bomber'||type==='acid'||type==='miner'){
  sc={zombie:1.35,husk:1.0,runner:1.2,brute:2.15,bomber:1.5,acid:1.3,miner:1.35}[type];if(type==='brute')h=18;zombieKit(type,ZVAR,{G,HG,LA,LG,AG});
 }else if(type==='peasant'||type==='archer'||type==='gunner'||type==='gunner2'){humanKit(type,ALB,{G,HG,LA,LG,AG})}
 else{const cap=type==='captain';humanKit(type,ALB,{G,HG,LA,LG,AG});
  if(cap){h=19;P0.X={cape:newG(),plume:newG()};vb(G,0,14.5,0,1.4,.6,3.6,'#d03030');
   vx('cape',0,-9,-.4,4.2,9,.5,thp());vx('cape',0,-9.4,-.4,4.4,.8,.7,'#e6b83a');vx('plume',0,0,0,1.2,1.1,1.4,'#d03030');vx('plume',0,1.0,-1.1,1.0,1.4,2.4,'#e04040');vx('plume',0,1.0,-3.4,.9,1.2,2.4,'#ff6a5a');vx('plume',0,.2,-5.4,.7,1.0,2.2,'#ff8a7a');
   parts=[{k:'cape',x:0,y:10.8*VX,z:-1.2*VX},{k:'plume',x:0,y:15.2*VX,z:-.6*VX}]}
  if(type==='bannerman'){h=40;const B=bannerKit(G);P0.X=B.X;parts=B.parts;if(PXON)pxBanner(B.X)}
  if(type==='king'){h=23;sc=1.72;P0.X={cape:newG(),cape2:newG()};const L1=5.0,L2=5.3,RED='#9e1b26',REDD='#6c111b',REDL='#b8283a',ERM='#f3efe6',ERS='#141418',GD=HA.gd,GD2=HA.gd2;
   vx('cape',0,-L1,-.42,5.6,L1,.5,RED);for(const x of[-1.95,-.65,.65,1.95]){vx('cape',x,-L1,-.69,.3,L1-.9,.06,REDD);vx('cape',x+.3,-L1,-.69,.18,L1-.9,.05,REDL)}
   for(const s of[-1,1]){vx('cape',s*2.62,-L1,-.42,.36,L1,.56,ERM);for(let y=-1.3;y>-L1;y-=1.25)vx('cape',s*2.62,y,-.72,.16,.3,.05,ERS)}
   vx('cape',0,-.95,-.42,6.0,.95,.66,ERM);for(const x of[-2.3,-1.15,0,1.15,2.3])vx('cape',x,-.62,-.77,.22,.3,.05,ERS);
   vx('cape',0,-4.35,-.72,1.7,1.7,.08,GD);vx('cape',0,-4.0,-.77,1.0,1.0,.06,GD2);for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?1.15:1.32,s=k%2?.26:.34;vx('cape',Math.sin(a)*r,-3.5+Math.cos(a)*r-s/2,-.73,s,s,.06,k%2?GD2:GD)}
   vx('cape2',0,-L2,-.42,6.6,L2,.5,RED);for(const x of[-2.3,-.78,.78,2.3]){vx('cape2',x,-L2+.5,-.69,.32,L2-.5,.06,REDD);vx('cape2',x+.32,-L2+.5,-.69,.2,L2-.5,.05,REDL)}
   for(const s of[-1,1]){vx('cape2',s*3.12,-L2,-.42,.36,L2,.56,ERM);for(let y=-.6;y>-L2;y-=1.25)vx('cape2',s*3.12,y,-.72,.16,.3,.05,ERS)}
   vx('cape2',0,-L2-.32,-.42,6.7,.5,.62,GD);vx('cape2',0,-L2+.3,-.42,6.66,.14,.6,GD2);
   parts=[{k:'cape',x:0,y:10.75*VX,z:-1.32*VX},{k:'cape2',par:'cape',x:0,y:-L1*VX,z:0}]}
  if(type==='guard'){h=21;sc=1.5;P0.X={cape:newG(),plume:newG()};const L=7.6,W=4.5,RED='#9e1b26',REDD='#6c111b';
   vx('cape',0,-L,-.4,W,L,.5,RED);for(const x of[-1.4,0,1.4])vx('cape',x,-L+.3,-.66,.26,L-1.2,.05,REDD);vx('cape',0,-L-.3,-.4,W+.1,.45,.6,HA.gd);vx('cape',0,-.7,-.4,W+.2,.7,.62,thd());
   vx('plume',0,0,0,.5,.9,1.2,RED);vx('plume',0,.3,-1.0,.48,1.1,1.6,RED);vx('plume',0,.1,-2.4,.46,1.0,1.6,REDD);vx('plume',0,-.4,-3.6,.42,.9,1.2,REDD);
   parts=PXON?[{k:'cape',x:0,y:10.8*VX,z:-1.45*VX}]:[{k:'cape',x:0,y:10.8*VX,z:-1.3*VX},{k:'plume',x:0,y:15.55*VX,z:.9*VX}]}

 }
 if(PXON)pxCapes(type,P0);
 const T=toolGeos(),r=fin({G,HG,LA,LG,AG,parts:parts,X:P0.X},{hip:5.5,sh:10.4,neck:11,lx:.95,ax:2.76,h,sc});r.tools=type==='peasant'?T:null;r.weap=NOWEAP||MVAR==='cine'?null:type==='knight'?'sword':type==='captain'?'gsword':type==='king'?'rsword':type==='guard'?'halberd':type==='archer'?'bow':null;r.shield=(type==='knight'||type==='captain'||type==='guard')&&MVAR!=='cine'?shieldGeo(type,ALB):null;r.shp=[.2*VX,-5.0*VX,(PXON?SHZ:2.1)*VX];RT=null;return r}

function mkModel0(type,z){return mcModel(type,z)}
/* ================= v73: medieval undead — decomposition, half-skeletons, skeletons ================= */
let ZVAR=null;
const ZNV={zombie:24,husk:12,runner:12,brute:8,bomber:6,acid:6,miner:6};
const ZSK={livid:['#8a9078','#666c58','#a6ac92'],putrid:['#6e7e4c','#4e5a34','#8a9a62'],grave:['#7c8070','#5a5e50','#9a9e8c'],bruise:['#74626e','#544650','#907e8a'],
 waxy:['#aea88e','#868068','#c8c2a6'],rot:['#5e5236','#40381f','#7a6c48'],drown:['#6e8488','#4e6266','#8aa2a6'],dried:['#7c6040','#58422a','#9a7c56'],ash:['#8e8a80','#6a665e','#aaa69c'],moss:['#5f7a46','#435832','#7a9660']};
const ZBN=[['#e0d6b8','#bcb092','#8a7e62'],['#d2c6a2','#ada07e','#7e7256'],['#c8bc98','#a49674','#766a4e']];
const ZCL={linen:'#bdae8c',linen2:'#a89a78',wool:'#6a4e32',dkwool:'#4a3622',green:'#56603e',red:'#72352a',woad:'#46566a',grey:'#68645a',black:'#2e2a26',ochre:'#84662e',burlap:'#96805a'};
const ZTUN=['wool','dkwool','green','red','woad','grey','linen2','ochre','burlap','black'],ZHOSE=['wool','dkwool','green','woad','grey','linen2','black'];
const ZEYE=['#ff3a2a','#ff3a2a','#ff6a20','#ffb02a','#9affd8','#c8f0ff','#7aff6a'];
const MPIV={T:12,H:24,AR:0,AL:0,L:12};
const MUTX={brute:{T:[1.32,1.06,1.38,0,-.2],H:[.84,.84,.86,-2.6,1.7],AR:[1.8,1.42,1.8,0,0],AL:[1.12,1.05,1.12,0,0],L:[1.28,1,1.3,0,0]},
 runner:{T:[.84,1.04,.86,0,0],H:[.9,.92,1,-.4,.9],AR:[.8,1.28,.8,0,0],AL:[.8,1.28,.8,0,0],L:[.84,1,.86,0,0]},
 bomber:{T:[1.42,.98,1.8,0,.5],H:[.78,.8,.8,-1.6,.6],AR:[1.1,.78,1.1,0,0],AL:[1.1,.78,1.1,0,0],L:[1.34,1,1.34,0,0]},
 acid:{T:[1,1,1.15,0,0],H:[.95,.95,.95,-2.4,2],AR:[.95,1.14,.95,0,0],AL:[.95,1.14,.95,0,0],L:[.95,1,.95,0,0]},
 miner:{T:[1.16,1,1.25,0,0],H:[.95,.95,.95,-1.2,1],AR:[1.15,1.05,1.15,0,0],AL:[1.2,1,1.2,0,0],L:[1.15,1,1.15,0,0]}};
function zRand(seed){let s=((seed|0)*2654435761>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
/* hint = former type of a converted unit (knight, archer, peasant...) */
function zSpec(kind,v,hint){const r=zRand(v*7919+({zombie:1,husk:2,runner:3,brute:4}[kind]||5)*104729+(hint?hint.length*977:0)),pick=a=>a[(r()*a.length)|0];
 const decay=kind==='husk'?pick(['dried','dried','mummy','dried']):kind==='runner'?pick(['bones','skel','skel','rot']):kind==='brute'?pick(['rot','rot','bones']):pick(['rot','rot','rot','rot','bones','bones','bones','skel','skel','skel']);
 const S={kind,v,decay,sk:ZSK[kind==='husk'?pick(['dried','rot','ash','dried']):pick(['livid','putrid','grave','bruise','waxy','rot','drown','ash','moss'])],bn:pick(ZBN),
  tun:ZCL[pick(ZTUN)],tun2:ZCL[pick(['red','woad','green','ochre','black'])],hose:ZCL[pick(ZHOSE)],eye:pick(ZEYE),shoes:pick(['leather','leather','wrap','bare']),legwrap:r()<.35,
  hairc:pick(['#2a1a10','#4a3a2a','#6a6a62','#1a1a1a','#6a4a24','#8a8a80']),hair:pick(['none','patchy','stringy','long','none']),arrows:r()<.3?1+(r()<.3?1:0):0,
  armL:r()<.5,armR:r()<.5,legB:r()<.4,cheek:r()<.5?(r()<.5?-1:1):0,skullPatch:r()<.45,jawOff:r()<.3,crack:r()<.5,slvL:r()<.5,slvR:r()<.5,patches:3+((r()*5)|0),seed:(r()*1e9)|0};
 S.outfit=kind==='husk'?(decay==='mummy'?'shroud':pick(['shroud','rags','monk','bare','rags'])):kind==='brute'?pick(['bare','rags','soldier','gambeson','bare']):kind==='runner'?pick(['rags','bare','tunic','peasant','rags']):
  pick(['tunic','peasant','soldier','gambeson','monk','noble','rags','shroud','bare','tunic','soldier','peasant']);
 const o=S.outfit;S.head=o==='soldier'?pick(['kettle','nasal','coif','nasal','none']):o==='monk'?'hood':o==='peasant'?pick(['straw','lcoif','none','none']):o==='noble'?pick(['circlet','none','hood']):o==='tunic'?pick(['lcoif','none','hood','none']):o==='shroud'&&decay!=='mummy'?pick(['shroud','none']):'none';
 if(hint==='knight'||hint==='captain'||hint==='bannerman'||hint==='king'||hint==='guard'){S.outfit='soldier';S.tun2=thp();S.head=pick(['nasal','kettle','coif'])}
 else if(hint==='archer'){S.outfit='hooded';S.tun=ZCL.green;S.head='ghood'}
 else if(hint==='peasant'){S.outfit=pick(['peasant','tunic']);S.head=pick(['straw','lcoif','none'])}
 if(kind==='brute'){S.decay='rot';S.outfit=pick(['bare','bare','rags']);S.head='none';S.sk=ZSK[pick(['bruise','putrid','bruise','moss'])];S.arrows=0;S.eye=pick(['#ff3a2a','#ff6a20'])}
 if(kind==='bomber'){S.decay='rot';S.outfit='bare';S.head='none';S.legwrap=false;S.hair='none';S.sk=ZSK[pick(['putrid','bruise','livid','moss'])];S.arrows=0;S.eye=pick(['#ffb02a','#ff6a20'])}
 else if(kind==='acid'){S.decay=pick(['rot','rot','bones']);S.outfit=pick(['bare','bare','rags']);S.head='none';S.hair=pick(['none','patchy']);S.sk=['#8c9a3c','#6a7a28','#aab858'];S.eye='#c8ff40';S.arrows=0}
 else if(kind==='miner'){S.decay=pick(['rot','rot','bones']);S.outfit=pick(['peasant','tunic','rags']);S.head='mhelm';S.sk=ZSK[pick(['grave','ash','livid','rot'])];S.eye=pick(['#ff3a2a','#ffb02a'])}
 return S}
/* E(region,x0,y0,z0,x1,y1,z1,colour,mat,skin) — px boxes; regions: T torso (abs), H head (abs), AL/AR arm (local: x +outer, y -12..0 from shoulder, z front), L leg (local: x +outer, y 0..12) */
function zBuild(S,E){const LD=!!S.lod,r=zRand(S.seed^1540483477),[SK,SKD,SKL]=S.sk,[BN,BN2,BND]=S.bn,FL='#5e1a12',DK='#120a06',RU='#7a4a2a',o=S.outfit,dc=S.decay,WR='#cbbd98',WR2='#a99c7a';
 const MT=MUTX[S.kind];let mut=!!MT;
 const b=(R,x0,y0,z0,x1,y1,z1,c,m,sk)=>{if(mut){const t=MT[R];if(t){const py=MPIV[R];x0*=t[0];x1*=t[0];y0=(y0-py)*t[1]+py+t[3];y1=(y1-py)*t[1]+py+t[3];z0=z0*t[2]+t[4];z1=z1*t[2]+t[4]}}E(R,x0,y0,z0,x1,y1,z1,c,m||0,sk||0)},rn=(a,c)=>a+r()*(c-a);
 const skel=dc==='skel',half=dc==='bones',dried=dc==='dried'||dc==='mummy',mum=dc==='mummy';
 const TUN=o==='soldier'?'#6e7078':o==='gambeson'?'#b6a684':o==='monk'?(r()<.5?ZCL.wool:ZCL.black):o==='shroud'?WR:o==='rags'||o==='peasant'?ZCL.burlap:o==='hooded'?'#5a3a22':S.tun;
 /* ---- legs ---- */
 if(skel||(half&&S.legB)){b('L',-.75,6.4,-.75,.75,12,.75,BN);b('L',-1.05,5.4,-.95,1.05,6.6,1.15,BN2);b('L',-.6,1.2,-.55,.6,5.6,.55,BN);b('L',-.25,1.4,-.9,.25,5.4,-.5,BN2);b('L',-1.1,0,-1.1,1.1,1.25,1.0,BN2);
  if(!LD){b('L',-.9,0,1.0,-.35,.6,2.1,BN);b('L',-.15,0,1.0,.4,.6,2.3,BN);b('L',.6,0,1.0,1.0,.55,1.9,BN)}
  if(o!=='bare'&&!mum){const HC=o==='monk'?TUN:S.hose;b('L',-1.75,8.6,-1.75,1.75,12,1.75,HC);if(!LD)for(let i=0;i<3;i++){const x=-1.75+i*1.17;b('L',x,8.6-rn(.4,1.2),-1.76,x+.7,8.6,1.76,HC)}}}
 else{const bareL=o==='bare'||mum;b('L',-2,0,-2,2,12,2,bareL?SK:o==='monk'?TUN:S.hose,0,bareL?1:0);
  if(mum)for(let y=.4;y<12;y+=1.9)b('L',-2.06,y,-2.06,2.06,y+1.1,2.06,((y*3)|0)%2?WR:WR2);
  else if(S.legwrap&&!bareL&&o!=='monk')for(let y=1.4;y<10.5;y+=1.7)b('L',-2.07,y,-2.07,2.07,y+.75,2.07,r()<.5?ZCL.linen2:ZCL.wool);
  if(!bareL&&o!=='monk'&&r()<.5){const y=rn(4,9);b('L',-.8,y,1.98,.9,y+rn(1.2,2.2),2.07,SKD,0,1);b('L',-.4,y+.4,2.04,.5,y+1.1,2.1,FL)}
  if(bareL&&!mum){for(let i=0;i<2;i++){const y=rn(2,10);b('L',1.98,y,rn(-1.6,.2),2.07,y+rn(1,2),rn(.4,1.6),r()<.5?FL:SKD,0,1)}b('L',-.8,5.2,1.98,.8,6.6,2.1,BN)}
  if(S.shoes==='leather'&&!bareL)b('L',-2.08,0,-2.14,2.08,1.5,2.18,'#4a3220');
  else if(S.shoes==='wrap'&&!bareL)b('L',-2.07,0,-2.1,2.07,1.4,2.14,ZCL.linen2);
  else{b('L',-2.05,0,-2.05,2.05,.9,2.05,SKD,0,1);if(!LD){b('L',-1.4,0,2.0,-.6,.5,2.6,BN);b('L',-.3,0,2.0,.5,.5,2.7,BN);b('L',.8,0,2.0,1.4,.45,2.5,BN)}}}
 /* ---- torso ---- */
 const soldierFront=z0=>{for(let i=0;i<(LD?2:6);i++){const x=rn(-3.6,2.8),y=rn(13,22.6);b('T',x,y,z0,x+rn(.5,1.1),y+rn(.4,.9),z0+.07,RU)}b('T',-2.6,12.8,z0,2.6,23.5,z0+.13,S.tun2);
  if(!LD)for(let i=0;i<5;i++){const x=-2.6+i*1.04;b('T',x,12.8,z0+.01,x+.6,12.8+rn(.4,1.8),z0+.14,'#6e7078',4)}b('T',-.35,15.2,z0+.12,.35,21.4,z0+.17,'#cfc290');b('T',-1.6,19.2,z0+.12,1.6,19.9,z0+.17,'#cfc290')};
 if(skel){
  if(o==='soldier'||o==='gambeson'){b('T',-4,12.6,-2,4,24,2,TUN,o==='soldier'?4:0);
   if(o==='soldier')soldierFront(1.99);else{if(!LD)for(let x=-3.4;x<3.6;x+=1.35)b('T',x,12.6,1.99,x+.12,24,2.05,'#8a7c5e');b('T',-4.06,22.8,-2.06,4.06,24.06,2.06,lighten(TUN,-.12))}
   const s=r()<.5?-1:1,x0=s<0?-3.5:.9,x1=s<0?-.9:3.5;b('T',x0,15.6,2.1,x1,20.4,2.2,DK);for(let y=16;y<20;y+=1.3)b('T',x0+.2,y,2.16,x1-.2,y+.5,2.24,BN);
   b('T',-3.3,12,-1.7,3.3,12.7,1.7,BN2)}
  else{/* rib cage: hollow, spine, pelvis, sternum, ribs, collar bones */
   b('T',-3,12.8,-1.3,3,23,1.3,DK);b('T',-.6,12,-2,.6,24,-1.1,BN2);b('T',-3.3,12,-1.7,3.3,13.8,1.7,BN2);b('T',-3.7,12.8,-1.2,-2.5,14.4,1.2,BN);b('T',2.5,12.8,-1.2,3.7,14.4,1.2,BN);b('T',-.5,16.2,1.3,.5,22.8,2.0,BN);
   const n=LD?3:5,st=LD?2.0:1.25;for(let i=0;i<n;i++){const y=16.6+i*st;
    if(LD){b('T',-3.5,y,1.25,3.5,y+.6,1.95,BN);b('T',-3.7,y,-1.6,-3.0,y+.6,1.6,BN2);b('T',3.0,y,-1.6,3.7,y+.6,1.6,BN2)}
    else{b('T',-3.5,y,1.2,-.5,y+.55,1.9,BN);b('T',.5,y,1.2,3.5,y+.55,1.9,BN);b('T',-3.7,y,-1.6,-3.0,y+.55,1.6,BN2);b('T',3.0,y,-1.6,3.7,y+.55,1.6,BN2);b('T',-3.4,y,-1.9,3.4,y+.55,-1.25,BN2)}}
   b('T',-3.9,23.2,-1.0,3.9,24,1.0,BN);b('T',-.5,24,-1.4,.5,24.7,-.3,BN2);
   if(o!=='bare'){b('T',-3.7,12,-1.85,3.7,14.4,1.85,TUN);if(!LD)for(let i=0;i<5;i++){const x=-3.7+i*1.48;b('T',x,12-rn(.3,1.4),-1.86,x+.9,12,1.86,TUN)}
    const s=r()<.5?-1:1;b('T',s<0?-3.95:1.0,20.8,-1.95,s<0?-1.0:3.95,24.06,1.95,TUN);if(!LD)b('T',s<0?-3.95:1.0,19.6,1.9,s<0?-2.6:2.4,20.8,1.98,TUN);
    if(o==='noble')b('T',-3.75,13.8,1.84,3.75,14.4,1.9,'#c8a040',4);if(o==='monk'||o==='shroud')b('T',-3.95,14.4,-1.95,3.95,16.2,1.95,TUN)}
   else b('T',-3.4,12,-1.75,3.4,13.4,1.75,ZCL.linen2)}}
 else{const bare=o==='bare'||mum;b('T',-4,12,-2,4,24,2,bare?SK:TUN,0,bare?1:0);
  if(mum){for(let y=12.3;y<24;y+=1.7){if(r()<.15)continue;b('T',-4.06,y,-2.06,4.06,y+rn(.8,1.1),2.06,r()<.5?WR:WR2)}b('T',2.4,14.6,2.06,3.2,18.4,2.14,WR2)}
  else if(o==='bare'){b('T',-3.5,12,-2.06,3.5,13.4,2.06,ZCL.linen2);b('T',-1.4,10.8,1.9,1.4,12,2.1,ZCL.linen2)}
  else{
   if(o==='tunic'||o==='peasant'||o==='hooded'){b('T',-4.06,14.2,-2.06,4.06,14.9,2.06,'#7a5a2e');b('T',-.7,21.8,1.98,.7,24.02,2.07,DK);if(!LD)b('T',-.9,22.6,2.04,.9,22.9,2.1,'#7a5a2e')}
   if(o==='peasant')for(let i=0;i<2;i++){const x=rn(-3.4,1.6),y=rn(15.5,21);b('T',x,y,1.99,x+1.6,y+1.6,2.06,lighten(TUN,-.15))}
   if(o==='hooded'){b('T',-3.4,14.9,1.99,3.4,21.6,2.12,'#4a2e18');b('T',-4.1,21.4,-2.1,4.1,24.05,2.1,ZCL.green)}
   if(o==='soldier'){soldierFront(1.99);b('T',-4.06,13.2,-2.06,4.06,14.3,2.06,'#4a3018')}
   if(o==='gambeson'){if(!LD)for(let x=-3.4;x<3.6;x+=1.35)b('T',x,12,1.99,x+.12,24,2.05,'#8a7c5e');b('T',-4.06,22.8,-2.06,4.06,24.06,2.06,lighten(TUN,-.12));b('T',-4.06,13.2,-2.06,4.06,14.1,2.06,'#4a3018')}
   if(o==='monk'){b('T',-4.06,14.6,-2.06,4.06,15.2,2.06,'#c8b88a');b('T',-.3,11.4,2.0,.3,14.6,2.1,'#c8b88a')}
   if(o==='noble'){b('T',-4.06,12,-2.06,4.06,12.7,2.06,'#c8a040',4);b('T',-.4,12.7,2.0,.4,24,2.1,'#c8a040',4);b('T',-4.1,22.4,-2.1,4.1,24.1,2.1,'#d8d0c0');if(!LD)for(let i=0;i<4;i++){const x=rn(-3.9,3.2);b('T',x,22.6,2.08,x+.4,23.8,2.16,'#8a8478')}}
   if(o==='shroud'){for(let i=0;i<3;i++){const y=rn(13,22);b('T',-4.07,y,-2.07,4.07,y+.6,2.07,WR2)}for(let i=0;i<2;i++){const x=rn(-3.4,2),y=rn(14,21);b('T',x,y,1.99,x+rn(1,2),y+rn(.8,1.6),2.06,'#7a6a4a')}}
   if(o==='rags')for(let i=0;i<4;i++){const x=rn(-3.6,2.4),y=rn(13.5,21.5),f=r()<.65;b('T',x,y,f?1.99:-2.07,x+rn(1,1.8),y+rn(1,1.8),f?2.07:-1.99,r()<.5?SKD:DK,0,1)}
   if(!LD&&o!=='noble'&&o!=='soldier')for(let i=0;i<5;i++){const x=-3.8+i*1.6+rn(-.2,.2);if(r()<.6)b('T',x,12,1.98,x+rn(.6,1.1),12+rn(.5,1.5),2.07,SKD,0,1)}}
  /* decomposition: torn flesh, ribs through it */
  if(half||(dc==='rot'&&r()<.6)||(o==='bare'&&!mum)){const s=r()<.5?-1:1,x0=s<0?-3.6:.6,x1=s<0?-.6:3.6,y0=rn(14.6,16),y1=rn(19.6,21.6);
   b('T',x0-.2,y0-.3,1.99,x1+.2,y1+.3,2.05,FL);b('T',x0,y0,2.0,x1,y1,2.07,DK);for(let y=y0+.35;y<y1-.4;y+=1.15)b('T',x0+(s<0?rn(.1,.5):.15),y,2.03,x1-(s<0?.15:rn(.1,.5)),y+.5,2.11,BN);b('T',s<0?-1.0:.6,y0,2.0,s<0?-.6:1.0,y1,2.12,BN2)}
  if(dried){if(!LD)for(let y=16.4;y<22;y+=1.2)b('T',-3.6,y,1.99,3.6,y+.4,2.05,SKD,0,1);b('T',-.4,13,1.99,.4,15.5,2.05,DK)}
  if(o==='bare'&&!mum)for(let i=0;i<(LD?1:S.patches);i++){const x=rn(-3.8,2.8),y=rn(13.5,23),f=r()<.6;b('T',x,y,f?1.99:-2.07,x+rn(.7,1.5),y+rn(.6,1.3),f?2.07:-1.99,r()<.5?FL:SKD,0,r()<.5?0:1)}
  if(!bare&&!LD){const x=rn(-3.2,2),y=rn(14,21);b('T',x,y,1.99,x+rn(1,1.8),y+rn(.8,1.5),2.07,'#4a1a10')}}
 /* arrows still stuck in the body */
 for(let i=0;i<S.arrows;i++){const x=rn(-2.6,2.2),y=rn(15,22);
  if(r()<.6){b('T',x,y,-6.4,x+.3,y+.3,-1.9,'#8a6a3a');b('T',x-.35,y-.2,-6.3,x+.65,y+.5,-5.5,'#e8e2d0')}else{b('T',x,y,1.9,x+.3,y+.3,5.4,'#8a6a3a');b('T',x-.35,y-.2,4.6,x+.65,y+.5,5.4,'#e8e2d0')}}
 /* ---- arms ---- */
 for(const A of['AL','AR']){const bone=skel||(half&&(A==='AL'?S.armL:S.armR)),torn=A==='AL'?S.slvL:S.slvR,SL=o==='bare'||mum?null:o==='soldier'?'#6e7078':o==='hooded'?ZCL.green:TUN;
  if(bone){b(A,-.65,-5.9,-.65,.65,0,.65,BN);b(A,-.95,-6.7,-.9,.95,-5.6,.9,BN2);b(A,-.8,-11.2,-.5,-.12,-6.4,.5,BN);b(A,.12,-11.2,-.5,.8,-6.4,.5,BN2);b(A,-.9,-12.1,-.75,.9,-11.1,.75,BN2);
   if(!LD)for(const x of[-.85,-.2,.45])b(A,x,-13.0,-.22,x+.4,-12.1,.22,BN);
   if(SL){const cut=-rn(3,5);b(A,-1.9,cut,-1.9,1.9,0,1.9,SL,o==='soldier'?4:0);if(!LD)for(let i=0;i<3;i++){const x=-1.9+i*1.27;b(A,x,cut-rn(.3,1.1),-1.91,x+.8,cut,1.91,SL)}}}
  else{b(A,-2,-12,-2,2,0,2,mum?SKD:SK,0,1);
   if(SL){const cut=torn?-rn(4,6.5):o==='monk'?-11:o==='noble'?-10:-8.6;b(A,-2.03,cut,-2.03,2.03,0,2.03,SL,o==='soldier'?4:0);
    if(o==='monk')b(A,-2.25,-11,-2.25,2.25,-9.6,2.25,TUN);if(o==='noble')b(A,-2.08,-10,-2.08,2.08,-9.3,2.08,'#d8d0c0');
    if(torn&&!LD)for(let i=0;i<4;i++)b(A,-2.04+i,cut-((S.seed>>(i+4))&1?1:.4),-2.04,-1.04+i,cut,2.04,SL)}
   if(mum)for(let y=-11.4;y<-.4;y+=2.1)b(A,-2.07,y,-2.07,2.07,y+1.05,2.07,((y*-3)|0)%2?WR:WR2);
   if(!mum&&r()<.6){const y=rn(-9,-5);b(A,1.98,y,-1.2,2.07,y+rn(1.2,2),1.0,FL);b(A,2.03,y+.3,-.5,2.11,y+1.0,.4,BN)}
   b(A,-2.03,-12,-2.03,2.03,-11.3,2.03,SKD,0,1);if(!LD)for(const x of[-1.5,-.35,.8])b(A,x,-13.0,-.3,x+.55,-12,.3,dried||dc==='rot'?BN2:SKD)}}
 /* ---- head ---- */
 if(skel||half){
  b('H',-4,27.2,-4,4,32,3.2,BN);b('H',-3.5,25.4,-3.5,3.5,30.2,3.9,BN);b('H',-3.9,26.4,2.2,-2.6,27.8,3.92,BN2);b('H',2.6,26.4,2.2,3.9,27.8,3.92,BN2);
  for(const s of[-1,1]){const x0=s<0?-3.0:1.0;b('H',x0,27.6,3.0,x0+2,29.6,3.95,DK);b('H',x0+.55,28.1,3.9,x0+1.45,29.0,3.99,S.eye,5)}
  b('H',-.6,26.5,3.5,.6,27.5,3.96,DK);b('H',-.3,27.5,3.5,.3,28.0,3.96,DK);
  b('H',-2.2,25.4,3.55,2.2,26.2,4.0,BN);if(!LD)for(const x of[-1.5,-.5,.5,1.5])b('H',x-.07,25.4,3.98,x+.07,26.2,4.03,'#3a2a1a');
  const jy=S.jawOff?-.8:0;b('H',-3.0,23.6+jy,-.8,3.0,25.0+jy,3.6,BN2);b('H',-2.0,24.6+jy,3.3,2.0,25.0+jy,3.75,BN);b('H',-2.2,25.0+jy,3.3,2.2,25.4,3.9,DK);
  if(S.crack&&!LD){b('H',rn(-2,1),29.6,3.19,rn(1.3,2.6),29.8,3.24,BND);b('H',-.2,30.4,3.19,0,31.9,3.24,BND)}
  if(half){const s=r()<.5?-1:1;b('H',s<0?-4.06:.4,24.8,-4.06,s<0?-.4:4.06,30.8,1.4,SKD,0,1);b('H',s<0?-4.08:1.6,27,-1,s<0?-1.6:4.08,29,3.94,SK,0,1);
   if(S.hair!=='none'&&S.head==='none')for(let i=0;i<(LD?3:7);i++){const x=rn(-3.8,3.2),side=r();if(side<.6)b('H',x,rn(25.4,28),-4.1,x+.5,32.15,-3.95,S.hairc);else b('H',side<.8?-4.1:3.95,rn(25.6,28.4),x,side<.8?-3.95:4.1,32.15,x+.5,S.hairc)}}}
 else{b('H',-4,24,-4,4,32,4,mum?SKD:SK,0,1);
  for(let i=0;i<(LD?2:S.patches);i++){const f=r(),x=rn(-3.8,2.6),y=rn(24.4,31),c=r()<.6?SKD:r()<.5?SKL:FL;
   if(f<.45)b('H',x,y,3.99,x+rn(.7,1.4),y+rn(.6,1.2),4.06,c,0,1);else if(f<.75)b('H',r()<.5?3.99:-4.06,y,x,r()<.5?4.06:-3.99,y+rn(.6,1.2),x+rn(.7,1.4),c,0,1);else b('H',x,31.99,rn(-3.6,2.6),x+rn(.8,1.4),32.06,rn(-1,3.8),c,0,1)}
  b('H',-3.7,29.3,3.99,3.7,30.0,4.16,SKD,0,1);
  for(const s of[-1,1]){const x0=s<0?-3.2:1.2;b('H',x0,27.4,3.99,x0+2,29.3,4.1,DK);b('H',x0+.6,27.9,4.05,x0+1.4,28.8,4.2,S.eye,5)}
  b('H',-.6,26.5,3.99,.6,27.5,4.1,DK);
  b('H',-2.4,24.8,3.99,2.4,26.3,4.08,DK);b('H',-2.2,25.6,4.02,2.2,26.3,4.14,BN);if(!LD)for(const x of[-1.4,-.4,.6,1.6])b('H',x-.07,25.6,4.1,x+.07,26.3,4.17,'#3a2a1a');b('H',-1.8,24.8,4.02,1.8,25.3,4.13,BN2);
  if(S.cheek&&!mum){const s=S.cheek,x0=s<0?-3.9:1.8,x1=s<0?-1.8:3.9;b('H',x0,24.3,3.99,x1,27.0,4.1,FL);b('H',x0+.3,24.5,4.06,x1-.3,26.6,4.16,BN);if(!LD)for(let i=0;i<3;i++){const x=x0+.4+i*.6;b('H',x,25.3,4.12,x+.12,26.4,4.2,'#3a2a1a')}}
  if(S.skullPatch&&S.head==='none'&&!mum&&S.hair!=='long'){const x=rn(-3,.4),zz=rn(-3,0);b('H',x,31.99,zz,x+2.6,32.07,zz+2.4,FL);b('H',x+.4,32.03,zz+.4,x+2.2,32.13,zz+2.0,BN)}
  if(dried&&!mum){b('H',-3.6,26.6,3.99,-2.4,27.8,4.12,BN2);b('H',2.4,26.6,3.99,3.6,27.8,4.12,BN2)}
  if(mum)for(let y=24.3;y<32;y+=1.4){if(y>27.1&&y<29.6){b('H',-4.06,y,-4.06,4.06,y+.9,-1,WR);for(const s of[-1,1])b('H',s<0?-4.06:3.4,y,-1,s<0?-3.4:4.06,y+.9,4.06,WR2);b('H',-.8,y,3.4,.8,y+.9,4.06,WR);continue}b('H',-4.06,y,-4.06,4.06,y+rn(.7,.95),4.06,r()<.5?WR:WR2)}
  if(!mum&&(S.head==='none'||S.head==='circlet')){const hc=S.hairc;
   if(S.hair==='long'){b('H',-4.08,31.0,-4.08,4.08,32.3,4.08,hc);b('H',-4.1,26,-4.1,4.1,31,-3.4,hc);for(const s of[-1,1])b('H',s<0?-4.12:3.6,25.4,-4.12,s<0?-3.6:4.12,31,-.6,hc)}
   else if(S.hair==='patchy'){const st=LD?4:2;for(let gx=-4;gx<4;gx+=st)for(let gz=-4;gz<4;gz+=st)if(r()<.55)b('H',gx-.06,31.2,gz-.06,gx+st+.06,32.25,gz+st+.06,hc)}
   else if(S.hair==='stringy')for(let i=0;i<(LD?4:9);i++){const x=rn(-3.8,3.2),side=r();if(side<.6)b('H',x,rn(25.2,28),-4.12,x+.55,32.2,-3.98,hc);else b('H',side<.8?-4.12:3.98,rn(25.5,28.5),x,side<.8?-3.98:4.12,32.2,x+.55,hc)}}}
 /* medieval headgear */
 const hd=S.head,IR='#6a6a66',IR2='#57564f';
 if(hd==='kettle'){b('H',-5.4,30.9,-5.4,5.4,31.5,5.4,IR,4);b('H',-4.25,31.5,-4.25,4.25,33.4,4.25,IR2,4);b('H',-2.8,33.4,-2.8,2.8,34.0,2.8,IR2,4);for(let i=0;i<(LD?1:4);i++){const x=rn(-4,3);b('H',x,rn(31.6,32.8),4.22,x+rn(.6,1.2),rn(33,33.4),4.3,RU)}}
 else if(hd==='nasal'){b('H',-4.3,30.0,-4.3,4.3,32.6,4.3,IR,4);b('H',-3.1,32.6,-3.1,3.1,33.6,3.1,IR,4);b('H',-1.6,33.6,-1.6,1.6,34.3,1.6,IR2,4);b('H',-.42,26.6,4.22,.42,30.2,4.55,IR2,4);b('H',-4.32,30.0,-4.32,4.32,30.5,4.32,'#4a4842',4);
  if(!LD)for(let i=0;i<3;i++){const x=rn(-3.6,2.8);b('H',x,rn(30.6,32),4.27,x+1,rn(32,32.6),4.34,RU)}}
 else if(hd==='coif'){const MA='#76787e';b('H',-4.3,24.2,-4.3,4.3,32.4,-1.2,MA,4);for(const s of[-1,1])b('H',s<0?-4.3:3.95,24.2,-1.2,s<0?-3.95:4.3,32.4,4.25,MA,4);b('H',-4.3,31.0,-1.2,4.3,32.4,4.25,MA,4);b('H',-4.3,24.2,3.0,4.3,25.0,4.3,MA,4)}
 else if(hd==='lcoif'){const LN='#cbbf9f';b('H',-4.15,29.8,-4.15,4.15,32.25,3.4,LN);for(const s of[-1,1])b('H',s<0?-4.15:3.85,25.6,-1.4,s<0?-3.85:4.15,29.8,3.0,LN);b('H',-2.8,23.8,1.4,2.8,24.3,2.6,LN)}
 else if(hd==='straw'){b('H',-5.6,31.3,-5.6,5.6,31.9,5.6,'#bfa458');b('H',-3.7,31.9,-3.7,3.7,33.7,3.7,'#cdb164');b('H',-3.72,32.1,-3.72,3.72,32.7,3.72,'#6a3a24');if(!LD)for(let i=0;i<3;i++){const x=rn(-5,3.6),zz=rn(-5,3.6);b('H',x,31.28,zz,x+1,31.94,zz+1,DK)}}
 else if(hd==='hood'||hd==='ghood'||hd==='shroud'){const HC=hd==='ghood'?ZCL.green:hd==='shroud'?WR:TUN;b('H',-4.4,25.4,-4.4,4.4,32.6,-1,HC);b('H',-4.4,31.0,-1,4.4,32.6,4.35,HC);for(const s of[-1,1])b('H',s<0?-4.4:3.95,25.4,-1,s<0?-3.95:4.4,31,4.35,HC);if(hd!=='shroud')b('H',-.55,29.5,-6.2,.55,30.6,-4.4,HC)}
 else if(hd==='circlet'){b('H',-4.12,30.0,-4.12,4.12,30.6,4.12,'#c8a040',4);b('H',-.45,30.0,4.1,.45,30.9,4.24,'#a02424')}
 /* ---- mutations (drawn on the re-proportioned body, in its final coordinates) ---- */
 mut=false;const FLM='#8e2f26',FLD='#5e1a14',IRN='#4a4844';
 /* brute: a hunched abomination - back hump with bone spikes, raw muscle, sunken tusked head, one giant shackled arm */
 if(S.kind==='brute'){
  b('T',-4.8,18.5,-5.8,4.8,25.8,-2.3,SK,0,1);b('T',-3.6,19.4,-6.5,3.6,25.1,-5.7,SKD,0,1);
  for(let i=0;i<4;i++){const x=-2.7+i*1.8,y=25.6+(i%2)*.7;b('T',x-.5,y-.8,-5.4,x+.5,y+2.4+(i%2)*.9,-4.3,BN);b('T',x-.3,y+2.2+(i%2)*.9,-5.2,x+.3,y+3.0+(i%2)*.9,-4.5,BN2)}
  b('T',-4.4,21.6,-6.2,-2.6,23.4,-5.7,FLM);b('T',1.6,19.4,-6.25,3.6,21.0,-5.7,FLM);
  b('T',2.6,19.2,-3.0,5.7,25.5,3.0,FLM);for(let y=19.8;y<25;y+=1.3)b('T',2.7,y,2.96,5.6,y+.45,3.06,FLD);
  b('T',-5.1,15,2.7,-2.4,19.6,2.9,DK);for(let y=15.4;y<19;y+=1.1)b('T',-4.9,y,2.8,-2.6,y+.5,3.02,BN);
  b('H',-3.4,26.7,4.6,3.4,27.6,5.3,BN2);b('H',-2.5,21.4,4.6,-1.6,24.2,5.5,BN);b('H',1.6,21.4,4.6,2.5,24.2,5.5,BN);b('H',-2.2,21.9,4.5,2.2,23.0,5.2,DK);
  for(let i=0;i<3;i++){const y=-6.5-i*3.4;b('AR',3.3,y-1.8,-.6,5.3,y,.6,BN);b('AR',5.2,y-1.2,-.35,6.1,y-.4,.35,BN2)}
  b('AR',-3.9,-19.4,-3.9,3.9,-16.0,3.9,SKD,0,1);for(const x of[-2.6,-.9,.8,2.5])b('AR',x-.65,-20.1,3.1,x+.65,-18.2,4.5,BN2);
  b('AR',-3.7,-9,-3.75,3.7,-6.4,3.75,FLM);b('AR',-3.8,-12.2,-3.8,3.8,-11.0,3.8,IRN,4);for(let i=0;i<4;i++)b('AR',-.55,-13.4-i*1.5,-4.2,.55,-12.3-i*1.5,-3.5,IRN,4);
  b('L',-.7,6.0,2.5,.7,7.6,4.1,BN);b('L',-2.6,2,-.6,-2.5,10,.6,FLD);for(const x of[-1.7,-.5,.7,1.9])b('L',x-.4,0,2.5,x+.4,.8,3.6,BN2);
  for(const y of[-4.6,-13.6])b('AR',-3.65,y,-3.65,3.65,y+1.6,3.65,FLM);b('AR',-3.66,-16,-1.2,-3.55,-2,1.2,FLD);b('AR',3.55,-15,-2.4,3.7,-3,-1.2,FLD);
  for(let i=0;i<3;i++){const y=-3.6-i*4.2;b('AR',-2.6,y-2.2,3.6,2.6,y,4.3,BN2);b('AR',-1.8,y-1.6,4.25,1.8,y-.6,4.6,BN)}
  const VN='#9cff4a';b('AR',-.2,-15.4,3.72,.2,-1.2,3.8,VN,5);b('AR',3.72,-11,-.2,3.8,-2.4,.2,VN,5);b('T',-1.4,14.2,2.95,-1.0,22.6,3.05,VN,5);b('T',-1.0,18.4,2.95,2.4,18.8,3.05,VN,5);b('T',-4.4,17.6,-2.9,-4.0,24.4,-2.75,VN,5);
  b('H',.9,24.1,5.18,2.7,26.0,5.3,DK);b('H',1.2,24.4,5.25,2.4,25.7,5.45,'#ffd23a',5)}
 /* runner: a lanky stalker - long bone claws, a ridge of vertebrae, a split jaw */
 if(S.kind==='runner'){
  for(const A of['AR','AL'])for(const x of[-1.1,0,1.1])b(A,x-.26,-20.2,-.3,x+.26,-15.0,.3,BN2);
  if(!LD)for(let i=0;i<3;i++){const y=15+i*3.1;b('T',-.45,y,-3.0,.45,y+1.6,-1.6,BN)}
  b('H',-2.3,21.9,2.4,2.3,23.8,4.9,SKD,0,1);b('H',-1.9,23.2,4.2,1.9,23.9,5.0,DK);if(!LD)for(const x of[-1.4,-.5,.4,1.3])b('H',x-.13,23.0,4.75,x+.13,23.9,5.05,BN)}
 /* bomber: a bloated walking blister - stretched belly glowing through its cracks, pustules everywhere */
 if(S.kind==='bomber'){const PU='#ffb03a',PU2='#ffe27a',CR='#ff7a1a',SW1=SKL,SW2=SK,VE='#5a2a3a';
  /* a round swollen mass: stacked boxes shrinking in every direction, hanging over the hips */
  b('T',-6.4,10.6,-3.2,6.4,22.6,5.8,SW2,0,1);b('T',-7.1,12.6,-2.2,7.1,20.6,5.0,SW2,0,1);b('T',-5.6,9.8,-3.9,5.6,23.4,6.9,SW2,0,1);b('T',-4.4,11.2,6.8,4.4,21.8,7.9,SW1,0,1);b('T',-2.8,12.8,7.8,2.8,20.2,8.5,SW1,0,1);
  b('T',-5.2,11.4,-4.6,5.2,22.4,-3.8,SW2,0,1);b('T',-7.7,14.2,-1.2,7.7,19.0,4.0,SW2,0,1);
  /* glowing cracks of the stretched skin */
  b('T',-3.6,16.6,8.45,1.6,17.1,8.6,CR,5);b('T',.9,13.6,8.5,1.4,18.8,8.62,CR,5);b('T',-1.8,18.6,7.95,-1.3,21.2,8.1,CR,5);b('T',-7.75,15.2,.4,-7.6,18.6,.9,CR,5);b('T',7.6,14.6,1.2,7.75,17.8,1.7,CR,5);
  /* big pustules: a dark rim, a raised blister, a glowing core */
  const PS=[[3.4,19.6,7.0,1.9],[-3.2,13.8,7.1,1.7],[-4.6,20.2,5.6,1.4],[0,21.8,6.5,1.3],[4.4,13.4,6.2,1.3],[-.6,16.4,8.5,1.2],[-3,22.2,-4.0,1.3],[2.6,17,-4.2,1.5],[-1,12.4,-4.2,1.0],[5.6,21.6,1,1.0],[-6.1,21.4,-.6,1.1]];
  for(const[x,y,z,s]of PS){const bz=z>0?1:-1,f=z>0?Math.max(z,0):z;b('T',x-s-.3,y-s-.3,f-.25*bz,x+s+.3,y+s+.3,f+.2*bz,'#6a3a2a');b('T',x-s,y-s,f,x+s,y+s,f+.55*bz,PU,5);b('T',x-s*.55,y-s*.55,f+.5*bz,x+s*.55,y+s*.55,f+.85*bz,PU2,5)}
  for(const[x,y,w]of[[-5.6,15.6,2.6],[2.4,21.6,2.4],[-1.4,11.2,3.0]])b('T',x,y,7.0,x+w,y+.34,7.4,VE);
  /* small sunken head: gaping mouth, a blister on the scalp */
  b('H',-1.9,23.0,3.55,1.9,24.4,3.85,DK);b('H',-1.5,22.2,3.6,-.9,23.2,3.9,PU2,5);b('H',-2.6,28.4,-1.2,-.6,29.4,1.0,PU,5);
  /* stubby arms with blisters */
  b('AR',-2.3,-7,-2.3,2.3,-5.6,2.3,PU,5);b('AL',-2.3,-5,-2.3,2.3,-3.8,2.3,PU,5)}
 /* acid spitter: hunched forward, three swollen acid sacs on the back, a bulging throat and an unhinged drooling jaw */
 if(S.kind==='acid'){const AC='#a8e030',AC2='#d0ff60',AV='#4a6a18';
  for(const[x0,y0,x1,y1,z]of[[-4.2,15,-.8,21.6,-2.3],[.2,16.8,4.0,23.6,-2.3],[-3.0,21.4,1.8,28.4,-2.1]]){b('T',x0,y0,z-2.4,x1,y1,z,AC,5);b('T',x0+.5,y0+.5,z-2.9,x1-.5,y1-.5,z-2.3,AC2,5);
   b('T',x0+.2,(y0+y1)/2,z-2.95,x1-.2,(y0+y1)/2+.3,z-2.85,AV);b('T',(x0+x1)/2,y0+.3,z-2.95,(x0+x1)/2+.3,y1-.3,z-2.85,AV)}
  b('T',-3.3,16.8,2.0,3.3,24.6,5.4,AC,5);b('T',-2.6,17.6,5.3,2.6,23.6,6.3,AC2,5);b('T',-.18,17.8,6.25,.18,23.4,6.4,AV);b('T',-2.2,20.4,6.25,2.2,20.7,6.4,AV);b('T',-3.35,16.6,1.9,3.35,17.2,5.0,SKD,0,1);b('T',2.4,21.6,-1.6,4.9,25.2,1.9,AC,5);b('T',2.9,22.2,-1.9,4.4,24.6,2.2,AC2,5);
  for(const[x,y,s]of[[-2.6,17.4,.8],[1.4,15.2,.7],[-.6,13.4,.6],[3.0,18.6,.55]]){b('T',x-s-.2,y-s-.2,1.98,x+s+.2,y+s+.2,2.25,SKD,0,1);b('T',x-s,y-s,2.2,x+s,y+s,2.55,AC,5)}
  for(const A of['AR','AL'])b(A,-.4,-15.4,-.4,.4,-13.6,.4,AC2,5);
  b('H',-3.0,19.4,2.6,3.0,21.6,6.2,SKD,0,1);b('H',-2.6,21.5,2.8,2.6,22.4,6.0,DK);for(const x of[-2,-1,0,1,2])b('H',x-.15,21.5,5.7,x+.15,22.3,6.05,BN);
  b('H',-.45,16.4,5.5,.3,19.6,6.0,AC2,5);b('H',1.1,17.6,5.3,1.6,19.6,5.8,AC,5);
  b('H',-3.5,27.6,-1.4,-.8,30.4,1.8,AC,5);b('H',1.4,28.6,-.4,3.2,30.2,1.4,AC,5);b('AR',-2.06,-10,-2.06,2.06,-7.6,2.06,'#6a7a28',0,1)}
 /* miner: a burrower - leather helmet and lamp on a thrust-out head, ore grown into its back, a forearm turned into a bone pick and digging claws */
 if(S.kind==='miner'){const LE='#5a4630',LE2='#463624',IRL='#9a9ca2',OR='#ffd23c',ST='#8a8a92';
  b('H',-4.1,28.6,-3.0,4.1,31.4,5.0,LE);b('H',-4.8,28.4,-3.7,4.8,29.0,5.8,LE2);b('H',-4.12,29.4,-3.02,4.12,29.9,5.02,'#3a2a1a');b('H',-1.2,29.0,4.9,1.2,31.0,5.7,'#5e5e5a',4);b('H',-.85,29.3,5.6,.85,30.7,6.0,'#ffe890',5);
  for(const[x,y,c,s]of[[-2.6,20,ST,1.4],[1.8,22.4,OR,1.0],[-.4,16.8,ST,1.2],[3.0,17.4,OR,.8],[-3.6,23.2,ST,1.0],[.6,19.6,'#6a6a72',.9]])b('T',x-s,y-s,-3.5,x+s,y+s,-2.4,c,c===OR?4:0);
  b('T',-3.6,12.4,2.5,3.6,20.4,2.8,'#6a4a2a');b('T',-4.66,14.4,-2.56,4.66,15.2,2.56,'#2e2014');
  b('AR',-2.3,-13,-2.3,2.3,-6,2.3,'#5a4632');b('AR',-1.7,-17,-1.7,1.7,-12,1.7,BN);b('AR',-1.3,-21,-1.3,1.3,-16.8,1.3,BN2);b('AR',-1.3,-23.6,-8.6,1.3,-20.8,9.4,BN);b('AR',-1,-23.2,9.2,1,-21.2,11.6,BN2);b('AR',-1,-23.2,-10.6,1,-21.2,-8.4,BN2);b('AR',-.6,-22.9,11.4,.6,-21.5,12.6,'#e8e2d0');b('AR',-.6,-22.9,-11.6,.6,-21.5,-10.4,'#e8e2d0');b('AL',-2.3,-12,-2.3,2.3,-6,2.3,'#5a4632');
  b('T',-3.8,19,-6.8,3.8,27.4,-2.5,'#6a5434');b('T',-3.0,26.8,-6.2,3.0,27.9,-3.0,'#4e3c24');b('T',-2.2,21.2,-6.9,-.6,22.8,-6.7,OR,4);b('T',.8,23.4,-6.9,2.6,25.0,-6.7,OR,4);b('T',-.4,24.8,-6.9,1.2,26.2,-6.7,'#8a8a92');
  for(const x of[-1.45,0,1.45])b('AL',x-.55,-16.6,-.9,x+.55,-11.4,.9,BN2)}}
/* unit models (Minecraft-style groups; 1 px = .46 vb) */
function zombieKit(type,ZV,P){if(PXON&&!window.__ZOLD){pxZombie(type,ZV,P);return}const{G,HG,LA,LG,AG}=P,k=.46,S=zSpec(type,ZV?ZV.v:0,ZV?ZV.hint:null);
/* fixed tiny epsilon (bxc's counter-based one could swallow sub-pixel details such as eyes) */
 const put=(Gx,m,yo,x0,y0,z0,x1,y1,z1,c)=>{const o=BMAT;BMAT=m;try{const e=.00012,q=k*VX;addBox(Gx,x0*q-e,(yo+y0*k)*VX-e,z0*q-e,x1*q+e,(yo+y1*k)*VX+e,z1*q+e,rgb(c))}finally{BMAT=o}};
 zBuild(S,(R,x0,y0,z0,x1,y1,z1,c,m)=>{
  if(R==='T')put(G,m,5.5-12*k,x0,y0,z0,x1,y1,z1,c);
  else if(R==='H')put(HG,m,11-24*k,x0,y0,z0,x1,y1,z1,c);
  else if(R==='AR')put(AG,m,0,x0,y0,z0,x1,y1,z1,c);
  else if(R==='AL')put(LA,m,10.45,-2.76/k-x1,y0,z0,-2.76/k-x0,y1,z1,c);
  else if(R==='L')put(LG,m,-5.5,x0,y0,z0,x1,y1,z1,c)});
 return S}
/* swarm geometry: same generator, swarm pixel units (SWPX), parts for the vertex animation, glow + skin flags; tiny details dropped */
function swGeoV(S){S.lod=1;if(PXON&&S.decay!=='dried'&&S.decay!=='mummy')S=Object.assign({},S,{sk:S.sk.map(pxZg)});const P=[],N=[],C=[],I=[],A=[],GL=[],SKA=[],u=SWPX;
 const box=(x0,y0,z0,x1,y1,z1,c,part,gl,sk)=>{const G=newG();addBox(G,x0*u,y0*u,z0*u,x1*u,y1*u,z1*u,rgb(c));const o=P.length/3;for(const v of G.P)P.push(v);for(const v of G.N)N.push(v);for(const v of G.C)C.push(v);for(const ix of G.I)I.push(ix+o);for(let q=0;q<G.P.length/3;q++){A.push(part);GL.push(gl);SKA.push(sk)}};
 zBuild(S,(R,x0,y0,z0,x1,y1,z1,c,m,sk)=>{const gl=m===5?1:0;if(!gl&&Math.max(x1-x0,y1-y0,z1-z0)<(R==='H'?.75:1.05))return;
  if(R==='T'||R==='H')box(x0,y0,z0,x1,y1,z1,c,0,gl,sk);
  else if(R==='AR')box(6+x0,24+y0,z0,6+x1,24+y1,z1,c,2,gl,sk);
  else if(R==='AL')box(-6-x1,24+y0,z0,-6-x0,24+y1,z1,c,1,gl,sk);
  else if(R==='L'){box(-2-x1,y0,z0,-2-x0,y1,z1,c,3,gl,sk);box(2+x0,y0,z0,2+x1,y1,z1,c,4,gl,sk)}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));
 g.setAttribute('aPart',new THREE.Float32BufferAttribute(A,1));g.setAttribute('aGl',new THREE.Float32BufferAttribute(GL,1));g.setAttribute('aSk',new THREE.Float32BufferAttribute(SKA,1));g.setIndex(I);return g}
const SWV=[];for(let v=0;v<16;v++)SWV.push(v<10?['zombie',100+v]:v<13?['husk',100+v]:['runner',100+v]);
const swVar=sd=>((sd>>3)^(sd>>9))&15;
const zKeyOf=u=>{const n=ZNV[u.type];if(!n||u.t!==1)return null;const h=(u.uid*2654435761)>>>0;return u.zk&&u.zk!=='zombie'?{v:h%6,hint:u.zk}:{v:h%n,hint:null}};

/* ================= v70: heater shields on their own mesh, heraldic banner, title army ================= */
let MVAR='';
const HER={
 chev:[
  ".....#.....",
  "....###....",
  "...##.##...",
  "..##...##..",
  ".##.....##.",
  "##.......##"],
 crown:[
  "#...#...#",
  "##.###.##",
  "#########",
  "#r#b#r#b#",
  "#########"],
 fleur:[
  ".........#.........",
  ".........#.........",
  "........###........",
  "........###........",
  ".......#####.......",
  ".......#####.......",
  ".####..#####..####.",
  ".#####.#####.#####.",
  "#######.###.#######",
  "###..##.###.##..###",
  ".#....##.#.##....#.",
  ".#....##.#.##....#.",
  ".......#.#.#.......",
  "....###########....",
  "....###########....",
  "......##.#.##......",
  ".....##..#..##.....",
  ".....#...#...#....."]};
/* pixel emblem -> boxes (horizontal runs merged); put(m,x,y0,z,w,h,d,c) with x = centre, y0 = bottom */
function embPut(rows,put,cx,ytop,z,px,d,col,keep){const W=rows[0].length;
 for(let r=0;r<rows.length;r++){const row=rows[r];let x=0;while(x<W){const ch=row[x];if(ch==='.'){x++;continue}let e=x;while(e+1<W&&row[e+1]===ch)e++;
  const n=e-x+1,mx=cx+(x+n/2-W/2)*px,y=ytop-(r+1)*px;if(!keep||keep(mx,y,n*px)){const q=col[ch]||col['#'];put(q[0],mx,y,z,n*px,px,d,q[1])}x=e+1}}}
/* heater shield, face toward +z, origin = strap point; kind knight|captain, AL armour level */
function shieldGeo(kind,AL){if(PXON&&/^knight/.test(kind))return pxShield(AL,kind.slice(6));if(PXON&&/^guard/.test(kind))return pxGuardShield(AL,kind.slice(5));if(PXON&&/^captain/.test(kind))return pxCaptainShield(AL,kind.slice(7));const G=newG(),put=(m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(G,x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}};
 if(kind==='guard'){const F=thp(),FL=lighten(F,.12),GD=HA.gd,GD2=HA.gd2,GDD=HA.gdd,W=4.9,Y0=-6.2,Y1=3.3,H=Y1-Y0,cy=-1.0;
  put(0,0,Y0,-.08,W,H,.34,'#5c4126');put(4,0,Y0-.1,.12,W+.2,H+.2,.18,GDD);put(0,0,Y0+.35,.24,W-.7,H-.7,.16,F);put(0,0,Y0+.9,.33,W-1.8,H-1.8,.06,FL);
  put(4,0,Y1-.38,.3,W,.38,.14,GD);put(4,0,Y0,.3,W,.38,.14,GD);for(const s of[-1,1])put(4,s*(W/2-.19),Y0,.3,.38,H,.14,GD);put(4,0,Y1-.05,.3,1.6,.42,.14,GD);put(4,0,Y1+.3,.3,.7,.3,.14,GD2);
  put(4,0,Y0+.6,.38,.3,H-1.2,.06,GDD);put(4,0,cy-.75,.42,1.5,1.5,.1,GD);put(4,0,cy-.45,.48,.9,.9,.08,GD2);
  for(let k=0;k<8;k++){const a=k*Math.PI/4;put(4,Math.sin(a)*1.35,cy+Math.cos(a)*1.35-.2,.42,.38,.4,.08,k%2?GDD:GD)}
  for(const[x,y]of[[-1.85,2.3],[1.85,2.3],[-1.85,-5.4],[1.85,-5.4]])put(4,x,y,.42,.42,.42,.1,GD2);return toGeo(G)}
 const cap=kind==='captain',W=cap?5.0:4.7,TOP=3.0,STR=cap?2.3:2.5,H=STR+W*.866,F=thp(),FD=thd(),FL=lighten(F,.1),
  gold=cap||AL>=2,RIM=gold?HA.gd:AL>=1?HA.sth:HA.st2,RIMD=gold?HA.gdd:HA.st3,EM=gold?HA.gd2:HA.em,
  hw=dy=>dy<=STR?W/2:Math.max(0,Math.sqrt(W*W-(dy-STR)*(dy-STR))-W/2);
 const rows=[[0,STR]];for(let a=STR;a<H-.04;){const s=Math.min(.3,H-a);rows.push([a,a+s]);a+=s}
 for(const[a,b]of rows){const w=hw(b>STR?(a+b)/2:a)*2,y0=TOP-b,h=b-a;if(w<.3)continue;
  put(0,0,y0,-.05,w,h,.32,FD);
  if(w>1.3)put(0,0,y0,.16,w-1.0,h,.14,F);
  if(w>2.7)put(0,0,y0,.25,w-2.5,h,.06,FL);
  put(0,0,y0,-.24,Math.max(.2,w-.5),h,.07,'#5c4126');
  put(4,-(w/2-.17),y0,.05,.36,h,.52,RIM);put(4,w/2-.17,y0,.05,.36,h,.52,RIM)}
 put(4,0,TOP-.36,.05,W,.38,.54,RIM);put(4,0,TOP-.06,.05,W-.4,.07,.56,RIMD);put(4,0,TOP-H-.05,.05,.4,.3,.5,RIM);
 /* enarmes on the back */
 put(0,-.85,-1.9,-.36,.32,2.8,.14,HA.lt2);put(0,.85,-1.9,-.36,.32,2.8,.14,HA.lt2);put(0,0,-.55,-.4,2.1,.34,.18,HA.lt);put(0,0,-1.75,-.4,2.1,.34,.18,HA.lt);
 const inside=(mx,y,w)=>Math.abs(mx)+w/2<=hw(TOP-y)-.3&&Math.abs(mx)+w/2<=hw(TOP-y-.3)-.3;
 if(cap){embPut(HER.crown,put,0,1.35,.33,.38,.1,{'#':[4,HA.gd2],'r':[5,'#ff5a4a'],'b':[5,HA.hx]},inside);put(4,0,-.95,.31,.34,.34,.08,HA.gd)}
 else{embPut(HER.chev,put,0,.95,.32,.28,.1,{'#':[gold?4:0,EM]},inside);if(AL>=2)put(5,0,-1.15,.34,.46,.46,.1,HA.hx);else put(4,0,-1.1,.31,.36,.36,.08,RIM)}
 if(AL>=1||cap)for(const dy of[.55,1.5,STR+.45,STR+1.35,STR+2.2]){const x=hw(dy+.1)-.17;if(x>.35){put(4,-x,TOP-dy-.09,.34,.17,.17,.06,HA.sth);put(4,x,TOP-dy-.09,.34,.17,.17,.06,HA.sth)}}
 return toGeo(G)}
/* the shield follows the forearm but stays upright; s = brace amount (0 rest .. 1 shield forward) */
function shdPose(d,s){if(!d.shd)return;d.shd.rotation.x=-d.armL.rotation.x+.03;d.shd.rotation.y=-.14+.1*s;d.shd.position.z=d.mdl.shp[2]+.03*s}
/* standard bearer: pole with gold ferrules, crossbar, spear finial; three chained cloth strips (ripple), fleur-de-lis, swallowtail with fringe, forked streamer */
function bannerKit(G){const X={ban:newG(),ban2:newG(),ban3:newG(),pen:newG(),tip:newG(),cape:newG()},F=thp(),FD=thd(),S2=ths(),WD='#6b4423',WD2='#8a5a2a',
  g=(m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{vb(G,x,y,z,w,h,d,c)}finally{BMAT=o}},
  q=(k,m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(X[k],x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}};
 const Z=-3.0,ZC=-3.95,ZB=-3.42,TB=31.6,BW=11.2,SH=5.6,TH=.5;
 g(2,0,2,Z,.8,34.4,.8,WD);for(const y of[12.2,21.4,28.8])g(4,0,y,Z,1.02,.42,1.02,HA.gd);
 g(2,0,TB,ZB,12.4,.7,.7,WD2);for(const s of[-1,1]){g(4,s*6.55,TB-.17,ZB,1.0,1.04,1.0,HA.gd);g(4,s*6.55,TB+.87,ZB,.46,.46,.46,HA.gd2)}
 g(4,0,36.3,Z,1.3,1.1,1.3,HA.gd);g(4,0,37.35,Z,.8,.5,.8,HA.gd2);g(4,0,37.85,Z,1.1,1.2,.42,HA.sth);g(4,0,39.0,Z,.72,1.1,.36,HA.sth);g(4,0,40.05,Z,.36,.9,.3,'#ffffff');
 g(0,0,9,-2.3,.8,.8,1.2,WD2);
 const LIM=[0,-SH,-2*SH,-99],KEYS=['ban','ban2','ban3'];
 const cb=(m,x,y0,w,h,c,d)=>{const a=y0,b=y0+h;for(let i=0;i<3;i++){const lo=Math.max(a,LIM[i+1]),hi=Math.min(b,LIM[i]);if(hi-lo>1e-4)q(KEYS[i],m,x,lo+SH*i,0,w,hi-lo,d||TH,c)}};
 cb(7,0,-12.6,BW,12.6,F);
 for(let k=0;k<10;k++){const y=-12.6-(k+1)*.4,nw=(k+1)*.33,sw=BW/2-nw;cb(7,-(nw+sw/2),y,sw,.4,F);cb(7,nw+sw/2,y,sw,.4,F)}
 for(const s of[-1,1]){cb(7,s*(BW/2-.36),-16.6,.72,16.6,S2,TH+.05);cb(4,s*(BW/2-.95),-15.3,.16,14.1,HA.gd2,TH+.07)}
 cb(4,0,-1.05,BW+.24,1.05,HA.gd,TH+.12);cb(7,0,-1.32,BW,.27,FD,TH+.07);cb(4,0,-12.0,BW-1.9,.24,HA.gd2,TH+.07);
 embPut(HER.fleur,(m,x,y,z,w,h,d,c)=>cb(m,x,y,w,h,c,d),0,-2.0,0,.44,TH+.14,{'#':[4,HA.gd2]});
 for(const s of[-1,1])for(let x=3.75;x<=5.45;x+=.56)cb(4,s*x,-17.25,.24,.65,HA.gd2,.3);
 q('pen',7,.6,-2.4,0,1.2,2.4,.24,F);q('pen',7,1.8,-2.15,0,1.2,1.9,.24,F);q('pen',7,3.0,-1.9,0,1.2,1.4,.24,F);q('pen',7,1.8,-1.32,0,3.6,.24,.28,S2);q('pen',4,.12,-2.5,0,.24,2.6,.3,HA.gd);
 q('tip',7,.6,-1.65,0,1.2,.9,.24,F);q('tip',7,1.6,-1.45,0,.8,.5,.24,F);q('tip',7,.6,-1.32,0,1.2,.24,.28,S2);
 q('cape',7,0,-.7,-.3,4.2,.7,.5,F);for(const s of[-1,1]){q('cape',7,s*1.4,-8,-.3,1.4,7.3,.5,F);q('cape',7,s*1.42,-8.2,-.3,1.5,.7,.7,S2)}
 return{X,parts:[{k:'ban',x:0,y:TB*VX,z:ZC*VX},{k:'ban2',par:'ban',x:0,y:-SH*VX,z:0},{k:'ban3',par:'ban2',x:0,y:-SH*VX,z:0},{k:'pen',x:.4*VX,y:36.1*VX,z:Z*VX},{k:'tip',par:'pen',x:3.6*VX,y:0,z:0},{k:'cape',x:0,y:10.6*VX,z:-1.3*VX}]}}
/* poses for the title army (applied after animUnit) */
function titlePose(u,d){if(!u.pose||u.atk>0||!d.armL)return;const s=Math.sin(TT*1.1+u.ph0);
 if(u.pose==='guard'){d.armL.rotation.x=-.66+s*.02;d.armL.rotation.z=.14;d.arm.rotation.x=-.45+s*.03;d.arm.rotation.z=-.08;if(d.weap)d.weap.rotation.x=-.62;shdPose(d,.7)}
 else if(u.pose==='shoulder'){d.arm.rotation.x=-1.0+s*.03;d.arm.rotation.z=-.28;if(d.weap)d.weap.rotation.x=-1.38;shdPose(d,0)}
 else{d.arm.rotation.x=-.15+s*.02;if(d.weap)d.weap.rotation.x=1.52;shdPose(d,0)}
 d.body.rotation.z=s*.01}
/* ---- instanced rear ranks of the title army (static posed soldiers, gentle sway) ---- */
let TRES=null;
function reserveDispose(){if(!TRES)return;for(const im of TRES.ims){TS3.remove(im);im.geometry.dispose()}TRES=null}
function mergePosed2(parts){const P=[],N=[],C=[],Mt=[],I=[];let off=0;
 for(const[geo,m]of parts){const g=geo.clone();g.applyMatrix4(m);const p=g.attributes.position.array,n=g.attributes.normal.array,c=g.attributes.color.array,ma=g.attributes.mat?g.attributes.mat.array:null,nv=p.length/3;
  for(let i=0;i<p.length;i++){P.push(p[i]);N.push(n[i]);C.push(c[i])}for(let i=0;i<nv;i++)Mt.push(ma?ma[i]:0);const ix=g.index.array;for(let i=0;i<ix.length;i++)I.push(ix[i]+off);off+=nv;g.dispose()}
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.Float32BufferAttribute(P,3));r.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));r.setAttribute('color',new THREE.Float32BufferAttribute(C,3));r.setAttribute('mat',new THREE.Float32BufferAttribute(Mt,1));r.setIndex(I);return r}
let PIKEG=null;
function pikeGeo(){if(PIKEG)return PIKEG;const G=newG(),t=(m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{tb(G,x,y,z,w,h,d,c)}finally{BMAT=o}};
 t(2,0,8.5,0,.44,33,.44,'#6b4423');t(0,0,0,0,.6,1.6,.6,'#4a2e16');t(4,0,25.3,0,.62,.9,.62,HA.st3);t(4,0,27.1,0,.78,2.8,.3,HA.sth);t(4,0,29.0,0,.4,1.1,.24,'#ffffff');t(4,0,24.6,0,1.6,.28,.36,HA.st2);
 PIKEG=toGeo(G);return PIKEG}
function soldierGeo(kind){const ty=kind==='pike'?'knight':kind,ab=ALB;ALB=2;let mdl;try{mdl=mkModel(ty,0)}finally{ALB=ab}
 const o=new THREE.Object3D(),M=(x,y,z,rx,ry,rz)=>{o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);o.updateMatrix();return o.matrix.clone()};
 const Q={knight:{ar:-1.0,arz:-.28,wr:-1.38,al:-.3,alz:0},pike:{ar:-.62,arz:-.05,wr:0,al:-.3,alz:0},archer:{ar:-.45,arz:0,wr:0,al:-1.28,alz:0}}[kind];
 const P=[[mdl.torso,M(0,0,0)],[mdl.head,M(0,mdl.neck,0,.05)],[mdl.leg,M(-mdl.lx,mdl.hip,0)],[mdl.leg,M(mdl.lx,mdl.hip,0)]];
 const A=M(mdl.ax,mdl.sh,0,Q.ar,0,Q.arz);P.push([mdl.arm,A]);const T2=toolGeos();
 if(kind==='knight')P.push([T2.sword,A.clone().multiply(M(0,HANDY*VX,.15*VX,Q.wr))]);
 if(kind==='pike'){const h=new THREE.Vector3(0,HANDY*VX,.15*VX).applyMatrix4(A);P.push([pikeGeo(),M(h.x,h.y,h.z)])}
 if(mdl.armL){const B=M(-mdl.ax,mdl.sh,0,Q.al,0,Q.alz);P.push([mdl.armL,B]);
  if(kind==='archer')P.push([T2.bow,B.clone().multiply(M(0,HANDY*VX,.1*VX))]);
  else if(mdl.shield)P.push([mdl.shield,B.clone().multiply(M(mdl.shp[0],mdl.shp[1],mdl.shp[2],-Q.al+.03,-.14))])}
 const g=mergePosed2(P);g.computeBoundingSphere();
 for(const q of[mdl.torso,mdl.head,mdl.leg,mdl.arm,mdl.armL,mdl.shield])if(q)q.dispose();return g}
function buildReserve(L){reserveDispose();const R=Math.random;TRES={ims:[],arr:[],arch:[]};
 for(const k in L){if(!L[k].length)continue;const g=soldierGeo(k),im=new THREE.InstancedMesh(g,matUI,L[k].length);im.frustumCulled=false;TS3.add(im);TRES.ims.push(im);
  L[k].forEach(([x,z],i)=>{TRES.arr.push({im,i,x,z,ry:Math.PI+(R()-.5)*.16,sc:1.35*TZ*(.96+R()*.08),ph:R()*6.28});if(k==='archer')TRES.arch.push({x:x*TS,y:z*TS,atk:0})})}
 resSway(0)}
function resSway(t){if(!TRES)return;for(const o of TRES.arr){const s=Math.sin(t*1.1+o.ph);_tm.position.set(o.x,0,o.z);_tm.rotation.set(0,o.ry+s*.02,s*.01);_tm.scale.set(o.sc,o.sc*(1+Math.abs(s)*.006),o.sc);_tm.updateMatrix();o.im.setMatrixAt(o.i,_tm.matrix)}
 for(const im of TRES.ims)im.instanceMatrix.needsUpdate=true}
/* the army: battalions of knights in front (2 animated ranks + an instanced third), archer companies behind, pike blocks in reserve, banners over every unit */
function buildArmy(){titleDispose();reserveDispose();const R=Math.random,J=a=>(R()-.5)*a,L={knight:[],archer:[],pike:[]};
 const mk=(type,x,z,face,pose)=>{const u=mkU(0,type,x*TS,z*TS);u.face=face===undefined?Math.PI:face;u.fa=u.face;u.dy=0;u.hp=1;u.ph0=Math.random()*9;u.ttl=1;u.pose=pose||null;ALF=2;let g;try{g=mkUnit(u)}finally{ALF=null}unitG.delete(u);g.scale.multiplyScalar(TZ);g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')o.visible=false});TS3.add(g);TARMY.push(u);return u};
 TCAP=null;
 for(const[cx,files]of[[-19.5,12],[0,15],[19.5,12]]){
  for(let r=0;r<3;r++)for(let f=0;f<files-(r%2);f++){const x=cx+(f-(files-1)/2)*1.12+(r%2?.56:0)+J(.16),dx=(x-cx)/(files*.56),z=-5.25+r*1.08+dx*dx*.55+J(.14);
   if(r<2){const u=mk('knight',x,z,Math.PI+J(.1),r===0?'guard':R()<.5?'shoulder':'rest');if(r===0)u.front=1}else L.knight.push([x,z])}
  if(cx)mk('bannerman',cx+J(.6),-1.95+J(.15),Math.PI+J(.06))}
 for(const s of[-1,1])for(let r=0;r<3;r++)for(let f=0;f<7;f++)L.knight.push([s*(30.2+f*1.12+(r%2?.56:0))+J(.16),-5.0+r*1.08+J(.14)]);
 for(const[cx,files]of[[-25.5,9],[-9,11],[9,11],[25.5,9]]){
  for(let r=0;r<3;r++)for(let f=0;f<files-(r%2);f++){const x=cx+(f-(files-1)/2)*1.1+(r%2?.55:0)+J(.18),z=-.45+r*1.05+J(.16);if(Math.abs(x-2.8)<2.4&&z>1.4)continue;
   if(r<2)mk('archer',x,z,Math.PI+J(.14));else L.archer.push([x,z])}
  mk('bannerman',cx+J(.6),2.75+J(.15),Math.PI+J(.06))}
 for(const[x0,x1]of[[-31.5,-7.6],[9.6,31.5]])for(let r=0;r<4;r++)for(let x=x0+(r%2?.56:0);x<=x1;x+=1.12)L.pike.push([x+J(.2),4.0+r*1.1+J(.18)]);
 /* King Naraige behind the centre with his royal guard */
 mk('king',0,-1.7,Math.PI);mk('guard',-.66,-1.12,Math.PI);mk('guard',.66,-1.12,Math.PI);for(const sd of[-1,1])mk('bannerman',sd*2.0,-1.8,Math.PI+J(.04));
 MVAR='cine';try{TCAP=mk('captain',-12,-7.6,Math.PI/2)}finally{MVAR=''}
 buildReserve(L)}

/* Minecraft-skin shading for characters: per-skin-pixel noise in model space (no world grid lines) */
const GLTOON=`
 {vec3 alb=max(diffuseColor.rgb,vec3(.004));vec3 irr=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/alb;float li=dot(irr,vec3(.299,.587,.114));float r=li/max(uLMax,.05);
  float bd=mix(.42,1.12,smoothstep(.04,1.2,r));vec3 tnt=mix(vec3(.76,.83,1.05),vec3(1.04,1.,.94),smoothstep(.25,.8,r));
  reflectedLight.directDiffuse=alb*irr/max(li,1e-4)*bd*uLMax*tnt;reflectedLight.indirectDiffuse=vec3(0.);}
`;
const GLUMAT=`
 {if(vMat>3.5&&vMat<4.5){vec3 Vv=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vv),0.,1.),2.);float gl=smoothstep(.62,.9,dot(normal,normalize(vec3(-.35,.8,.5))));
  reflectedLight.directDiffuse=reflectedLight.directDiffuse*(.88+.16*gl)+diffuseColor.rgb*(fr*.42+gl*.26)*uLMax+vec3(1.,.95,.86)*fr*.08*uLMax;}
  if(vMat>4.5&&vMat<5.5){reflectedLight.directDiffuse*=.35;totalEmissiveRadiance+=diffuseColor.rgb*1.3;}}
`;
function UNITSH(sh){sh.uniforms.uLMax=LMU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;attribute float mat;varying float vMat;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLP=position;vMat=mat;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLP;varying float vMat;uniform float uLMax;'+GLN).replace('#include <color_fragment>','#include <color_fragment>\n{float l0=dot(diffuseColor.rgb,vec3(.299,.587,.114));bool mt=vMat>3.5&&vMat<4.5;diffuseColor.rgb=mix(vec3(l0),diffuseColor.rgb,1.2)*(mt?.97+.05*vn3(vLP*22.):.93+.12*vn3(vLP*22.));}').replace('#include <lights_fragment_end>','#include <lights_fragment_end>'+GLTOON+GLUMAT).replace('#include <dithering_fragment>','#include <dithering_fragment>\n{float l=dot(gl_FragColor.rgb,vec3(.299,.587,.114));gl_FragColor.rgb=mix(vec3(l),gl_FragColor.rgb,1.07)*vec3(1.03,1.0,.96);}')}
const matUI=(()=>{const m=matV.clone();m.onBeforeCompile=UNITSH;return m})();
const cubeG=new THREE.BoxGeometry(1,1,1);
const RINGS={};function ringGeo(s){if(RINGS[s])return RINGS[s];const G=newG(),c=[1,.88,.29],t=.05;
 bxc(G,0,0,-s,2*s+t,.03,t,c);bxc(G,0,0,s,2*s+t,.03,t,c);bxc(G,-s,0,0,t,.03,2*s+t,c);bxc(G,s,0,0,t,.03,2*s+t,c);return RINGS[s]=toGeo(G)}
const ringMat=new THREE.MeshBasicMaterial({vertexColors:true});
const CARRYG=(()=>{const mk=f=>{const G=newG();f(G);return toGeo(G)};return{
 w:mk(G=>{[[0,0,.0],[.01,.11,.1],[.01,.11,-.1]].forEach(([x,y,z],k)=>bxc(G,x,y,z,.46,.12,.12,k?'#a8723a':'#8a5a2a'));bxc(G,0,.05,0,.1,.2,.36,'#5a3a1a')}),
 g:mk(G=>{bxc(G,0,0,0,.3,.32,.22,'#c8a060');bxc(G,0,.3,0,.2,.06,.16,'#b08848');bxc(G,0,.14,.12,.18,.1,.04,'#ffd23c');bxc(G,0,.34,0,.14,.08,.1,'#ffd23c')}),
 s:mk(G=>{bxc(G,0,0,0,.32,.24,.26,'#b8bec8');bxc(G,.05,.2,0,.2,.16,.2,'#d4dae4');bxc(G,-.1,0,.14,.14,.12,.1,'#8e95a2')})}})();
const RS3={king:.52,guard:.46,gunner:.3,gunner2:.3,cannon:.56,husk:.26,peasant:.3,knight:.4,archer:.34,bannerman:.34,captain:.45,zombie:.32,runner:.3,brute:.5,bomber:.4,acid:.32,miner:.34};
function buildUnitGroup(type,t,zv){ALB=t===0?alv():0;const k=type+t+'a'+ALB+MVAR+(zv?'v'+zv.v+(zv.hint||''):''),mdl=UM[k]||(UM[k]=(()=>{const zo=ZVAR;ZVAR=zv||null;try{return mkModel(type,t)}finally{ZVAR=zo}})()),g=new THREE.Group();
 const mat=matV.clone();mat.onBeforeCompile=UNITSH;mat.emissive=new THREE.Color(0,0,0);
 const mesh=geo=>{const m=new THREE.Mesh(geo,mat);m.castShadow=SHADOWS&&type!=='husk';return m};
 const body=new THREE.Group();body.position.y=mdl.hip;const tor=mesh(mdl.torso);tor.position.y=-mdl.hip;body.add(tor);
 const head=mesh(mdl.head);head.position.set(0,mdl.neck,0);tor.add(head);
 const arm=mesh(mdl.arm);arm.position.set(mdl.ax,mdl.sh,0);tor.add(arm);
 let armL=null,shd=null;if(mdl.armL){armL=mesh(mdl.armL);armL.position.set(-mdl.ax,mdl.sh,0);tor.add(armL);if(mdl.shield){shd=mesh(mdl.shield);shd.position.set(mdl.shp[0],mdl.shp[1],mdl.shp[2]);shd.rotation.set(.33,-.14,0);armL.add(shd)}}
 const lL=mesh(mdl.leg),lR=mesh(mdl.leg);lL.position.set(-mdl.lx,mdl.hip,0);lR.position.set(mdl.lx,mdl.hip,0);g.add(lL,lR,body);
 const ex={};if(mdl.parts)for(const p of mdl.parts){const m=mesh(p.geo);m.position.set(p.x,p.y,p.z);(p.par?ex[p.par]:tor).add(m);ex[p.k]=m}
 const tools={};if(mdl.tools)for(const k2 of['axe','pick','hammer','hoe']){const m=mesh(mdl.tools[k2]);m.visible=false;m.position.set(0,HANDY*VX,.15*VX);arm.add(m);tools[k2]=m}
 let weap=null;if(mdl.weap){const T2=toolGeos(),m=mesh(T2[mdl.weap]);if(mdl.weap==='bow'){if(armL){m.position.set(0,HANDY*VX,.1*VX);armL.add(m);weap=m}}else{m.position.set(0,HANDY*VX,.15*VX);arm.add(m);weap=m}}
 const ring=new THREE.Mesh(ringGeo(RS3[type]),ringMat);ring.position.y=.04;ring.visible=false;g.add(ring);
 const carry=new THREE.Mesh(CARRYG.w,mat);carry.position.set(0,mdl.sh*.55,-.26);carry.visible=false;tor.add(carry);
 g.userData={ex,body,tor,head,lL,lR,arm,armL,shd,tools,weap,ring,carry,mdl,mat,z:t,wr:0};return g}
/* ---- instanced units: the per-unit groups still pose every part (animation code unchanged), but their meshes sit on a hidden layer;
   each frame the posed matrices are copied into one InstancedMesh per part model (and per shadow flag) ---- */
const _uPV=new THREE.Matrix4(),_uFr=new THREE.Frustum(),_uSp=new THREE.Sphere(new THREE.Vector3(),3.2);
const UL=5,UIB=new Map(),_uM=new THREE.Matrix4(),_uS=new THREE.Matrix4().makeScale(-1,1,1);let UIM=null;
function uiMat(){if(UIM)return UIM;const m=matV.clone();m.onBeforeCompile=function(sh,r){UNITSH(sh,r);
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 iEm;varying vec3 vEm;').replace('#include <begin_vertex>','#include <begin_vertex>\nvEm=iEm;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vEm;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vEm;')};return UIM=m}
function uiGrow(b,need){let cap=Math.max(32,b.cap);while(cap<need)cap*=2;const g2=new THREE.BufferGeometry();for(const k in b.geo.attributes)g2.setAttribute(k,b.geo.attributes[k]);g2.setIndex(b.geo.index);
 const em=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);em.setUsage(THREE.DynamicDrawUsage);g2.setAttribute('iEm',em);
 const m=new THREE.InstancedMesh(g2,uiMat(),cap);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(cap*3),3);m.instanceColor.setUsage(THREE.DynamicDrawUsage);
 if(b.mesh){m.instanceMatrix.array.set(b.mesh.instanceMatrix.array);m.instanceColor.array.set(b.mesh.instanceColor.array);em.array.set(b.em.array);scene.remove(b.mesh);b.mesh.geometry.dispose()}
 m.frustumCulled=false;m.castShadow=b.sh;m.scale.set(-1,1,1);m.count=0;scene.add(m);m.updateMatrixWorld(true);b.mesh=m;b.em=em;b.cap=cap}
function uiAdd(g){const d=g.userData;if(!d.ip)return;const c=d.mat.color,e=d.mat.emissive;
 for(const m of d.ip){if(!m.visible)continue;let p=m.parent,vis=true;while(p&&p!==g){if(!p.visible){vis=false;break}p=p.parent}if(!vis)continue;
  const key=m.geometry.id*2+(m.castShadow?1:0);let b=UIB.get(key);if(!b){b={geo:m.geometry,sh:m.castShadow,cap:0,n:0,mesh:null,em:null};UIB.set(key,b)}
  if(b.n>=b.cap)uiGrow(b,b.n+1);const k=b.n++;_uM.multiplyMatrices(_uS,m.matrixWorld);b.mesh.setMatrixAt(k,_uM);b.mesh.instanceColor.setXYZ(k,c.r,c.g,c.b);b.em.setXYZ(k,e.r,e.g,e.b)}}
function uiUMW(force){if(this.visible)THREE.Object3D.prototype.updateMatrixWorld.call(this,force)}
function uiFlush(){for(const b of UIB.values())b.n=0;
 for(const[u,g]of unitG)if(g.userData.frame===frameN&&g.visible)uiAdd(g);
 for(const c of CORPSES)uiAdd(c.g);
 for(const b of UIB.values()){if(!b.mesh)continue;b.mesh.count=b.n;b.mesh.visible=b.n>0;if(b.n){b.mesh.instanceMatrix.needsUpdate=true;b.mesh.instanceColor.needsUpdate=true;b.em.needsUpdate=true}}}
/* units are drawn at 76% so a man stands about a quarter of a house high (the title screen keeps its own framing) */
const UNITK=.76;
const T_C=u=>T.cannon.cdt;
function cannonG(){if(PXON)return pxCannon();const G=newG(),WD='#5e4026',WL='#7a5532',IR='#9a7438',IR2='#c09048',BR='#2c2e33';
 for(const sx of[-1,1]){const x=sx*.27;bxc(G,x,.02,.36,.07,.4,.16,WD);bxc(G,x,.14,.36,.07,.16,.4,WD);bxc(G,x,.07,.36,.07,.3,.3,WL);bxc(G,x+sx*.04,.17,.36,.05,.1,.1,IR)}
 bxc(G,0,.17,.36,.6,.06,.06,IR);bxc(G,0,.2,.2,.36,.1,.5,WD);bxc(G,0,.12,-.1,.16,.08,.36,WD);bxc(G,0,.08,-.27,.2,.06,.08,IR);
 bxc(G,0,.29,.3,.17,.17,.62,IR);bxc(G,0,.27,.04,.22,.21,.14,IR2);bxc(G,0,.31,-.05,.08,.08,.06,IR);bxc(G,0,.28,.62,.21,.21,.07,IR2);bxc(G,0,.33,.66,.08,.08,.01,BR);
 for(const[x,z]of[[.13,-.06],[.2,-.02],[.16,.04]])bxc(G,x-.4,.01,z+.1,.07,.07,.07,BR);return toGeo(G)}
function mkUnit(u){const g=buildUnitGroup(u.type==='cannon'?'gunner':u.type,u.t===2?20+(u.ci||0):u.t,zKeyOf(u)||(u.type==='peasant'&&u.t!==1?{v:((u.uid|0)*2654435761>>>0)%6,hint:'p'}:null)),mdl=g.userData.mdl,mat=g.userData.mat;
 if(u.type==='cannon'){const s0=(mdl.sc||1.35)*UNITK,cn=new THREE.Mesh(GEO.cannonU||(GEO.cannonU=cannonG()),mat);cn.castShadow=SHADOWS;cn.scale.setScalar(.8/s0);cn.position.z=.26/s0;g.add(cn);g.userData.cn=cn;g.userData.cnz=.26/s0;
  const c2=buildUnitGroup('gunner2',u.t,null),e2=c2.userData;c2.remove(e2.ring);c2.traverse(o=>{if(o.isMesh)o.material=mat});c2.position.set(.36/s0,0,.34/s0);c2.rotation.y=-.35;g.add(c2);g.userData.c2=c2}
 if(u.type==='bannerman'){const au=new THREE.Mesh(GEO.auB||(GEO.auB=new THREE.RingGeometry(HEAL_R/TS/1.35/UNITK-.12,HEAL_R/TS/1.35/UNITK,64)),new THREE.MeshBasicMaterial({color:0x7dffa0,transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false}));au.rotation.x=-Math.PI/2;au.position.y=.22;au.renderOrder=1;g.add(au);const fill=new THREE.Mesh(GEO.auBf||(GEO.auBf=new THREE.CircleGeometry(HEAL_R/TS/1.35/UNITK,48)),new THREE.MeshBasicMaterial({color:0x7dffa0,transparent:true,opacity:.09,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.2;g.add(fill);g.userData.aura=au}
 if(u.type==='king'){const R=10/1.72/UNITK,au=new THREE.Mesh(GEO.auK||(GEO.auK=new THREE.RingGeometry(R-.14,R,72)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false}));au.rotation.x=-Math.PI/2;au.position.y=.22;au.renderOrder=1;g.add(au);const fill=new THREE.Mesh(GEO.auKf||(GEO.auKf=new THREE.CircleGeometry(R,56)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.06,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.2;g.add(fill);g.userData.aura=au}
 if(u.type==='captain'){const R=8/1.35/UNITK,au=new THREE.Mesh(GEO.auC||(GEO.auC=new THREE.RingGeometry(R-.14,R,64)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.38,side:THREE.DoubleSide,depthWrite:false}));au.rotation.x=-Math.PI/2;au.position.y=.22;au.renderOrder=1;g.add(au);const fill=new THREE.Mesh(GEO.auCf||(GEO.auCf=new THREE.CircleGeometry(R,48)),new THREE.MeshBasicMaterial({color:0xffd23c,transparent:true,opacity:.07,depthWrite:false}));fill.rotation.x=-Math.PI/2;fill.position.y=.2;g.add(fill);g.userData.aura=au}
 u.sv=u.sv||(.95+Math.random()*.1);const v=.93+Math.random()*.12;mat.color.setRGB(v,v,v);
 {const s0=(mdl.sc||1.35)*u.sv*(u.ttl?1:UNITK);g.scale.set(-s0,s0,s0);g.userData.sc=s0}if(!u.ttl){const ip=[];g.traverse(o=>{if(o.isMesh&&o.material===mat){o.layers.set(UL);ip.push(o)}});g.userData.ip=ip;g.updateMatrixWorld=uiUMW}u.m=g;u.mt=u.t;u.mal=u.t===0?alv():0;u.dy=gh(u.x/TS,u.y/TS);u.ap=Math.random()*6;u.fa=u.face||0;u.lph=0;scene.add(g);unitG.set(u,g);return g}
const angd=(a,b)=>{let d=b-a;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;return d};
const ATKT=.35,lerp=(a,b,t)=>a+(b-a)*t,sat=t=>Math.max(0,Math.min(1,t)),easeO=t=>1-(1-t)*(1-t),CHOPC={t:'#9d7a50',w:'#8b5a2b',s:'#cfd6e2',g:'#ffd23c',f:'#8a6a3a',p:'#6a5a3a'};
function animUnit(u,dt,anyDmg,frame){let g=u.m;if(g&&!u.ttl&&(u.mt!==u.t||(u.t===0&&u.mal!==alv()))){scene.remove(g);unitG.delete(u);g=null}if(!g)g=mkUnit(u);
 const d=g.userData,ty=u.type,z=u.t===1,wl=u.walk>0,T=clockT+u.ph0;d.frame=frame;
 if(u.atk>0)u.atk-=dt;if(u.hurt>0)u.hurt-=dt;
 const fast=ty==='runner',heavy=ty==='brute'||ty==='bomber',armored=ty==='knight'||ty==='captain'||ty==='king'||ty==='guard';
 if(u.rg&&u.cap&&wl&&u.cap.walk>0&&u.cap.m)u.ap=u.cap.ap;u.ap+=dt*(wl?(z?(fast?14:heavy?4.6:6.4):(armored?7.6:9.5)):0)*(u.ttl?1:1.25);u.dy+=((u.gar||u.onF?u.gz:gh(u.x/TS,u.y/TS))-u.dy)*Math.min(1,dt*(u.gar?6:12));
 u.fa+=angd(u.fa,u.face||0)*Math.min(1,dt*12);
 const k=Math.min(1,dt*16),sw=wl?Math.sin(u.ap)*(z?(fast?.95:.55):armored?.65:.85):0,ab=wl?Math.abs(Math.sin(u.ap)):0;
 /* attack / work phases */
 const atk=u.atk>0?1-u.atk/ATKT:-1,work=ty==='peasant'&&(!u.t||u.t===2)&&!wl&&!u.carry&&(u.job==='r'?anyDmg&&!u.o:u.work>0&&!u.o);
 let ar=0,al=0,lean=0,twist=0,lunge=0,headX=0,headY=0,headZ=0,sway=0,wr=0;
 if(wl){ar=sw*.85;al=-sw*.85;sway=Math.sin(u.ap)*(z?.1:.045);lean=z?.2:fast?.26:heavy?.12:.06;twist=Math.sin(u.ap)*.1;headX=z?.3:.02;headZ=z?Math.sin(u.ap*.5)*.2+.18:0}
 else{ar=Math.sin(T*1.3)*.05;al=-Math.sin(T*1.3)*.05;lean=z?.18:0;headY=Math.sin(T*.6)*.3*(atk<0?1:0);headX=z?.34+Math.sin(T*1.7)*.05:Math.sin(T*.9)*.03;headZ=z?.22:0}
 if(z){ar=-1.45+(wl?Math.sin(u.ap*.9)*.18:Math.sin(T*1.8)*.1);al=-1.35-(wl?Math.sin(u.ap*.9+1)*.18:Math.sin(T*1.6)*.1);const zr=(u.uid*2654435761)>>>0;ar+=((zr&15)/15-.5)*.36;al+=(((zr>>4)&15)/15-.5)*.36;if((zr>>8)%9===0)al=-.28+Math.sin(T*1.6)*.06;else if((zr>>12)%11===0)ar=-.24+Math.sin(T*1.4)*.06;headZ+=(((zr>>16)&15)/15-.5)*.34}
 if(ty==='brute'){if(wl){const s2=Math.sin(u.ap);ar=-.42-s2*.62;al=-.42+s2*.62;lean=.58+Math.abs(Math.cos(u.ap))*.06;sway=s2*.07;headX=-.42;headZ=0}else{ar=-.3+Math.sin(T*1.6)*.05;al=-.3-Math.sin(T*1.5)*.05;lean=.5;headX=-.36+Math.sin(T*1.7)*.04;headZ=0}}
 if(ty==='archer'){al=-1.28;ar=wl?-sw*.6-.2:-.45;lean=0}
 if(armored||ty==='bannerman'){al=d.shd?-.3+(wl?-sw*.14:Math.sin(T*1.3)*.02):wl?-sw*(armored?.25:.7):-Math.sin(T*1.3)*.03}
 if(armored&&u.atk<=0)ar=-.75+(wl?Math.sin(u.ap*.9)*.07:Math.sin(T*1.3)*.04);
 if(atk>=0){const p=atk;
  if(ty==='archer'){const dr=p<.55?easeO(p/.55):1-(p-.55)/.45*.6;ar=-1.35-.1*dr;al=-1.46;twist=.5*dr;lean=-.05*dr;if(p>.55&&p<.7)lean=-.12;headY=-.35*dr}
  else if(z){const t=p<.25?easeO(p/.25):p<.55?1-(p-.25)/.3*1.6:-.6*(1-(p-.55)/.45);ar=-1.45-.55*Math.max(0,t)+Math.max(0,-t)*1.3;al=ar+.1;lean=.18+.25*(p>.25&&p<.6?1:0);lunge=(p>.25&&p<.6)?.1:0;headX=.5}
  else{const wu=p<.25,st=p>=.25&&p<.5,t=wu?easeO(p/.25):st?(p-.25)/.25:1-(p-.5)/.5;
   ar=wu?-.2-2.3*t:st?-2.5+3.0*t:.5*(1-(p-.5)/.5)*(1);al=wu?-.5*t:st?-.5+.7*t:0;wr=wu?.55*t:st?.55-1.05*t:-.5*(1-(p-.5)/.5);twist=wu?.35*t:st?.35-.8*t:-.45*(1-(p-.5)/.5);lean=wu?-.12*t:st?-.12+.5*t:.38*(1-(p-.5)/.5);lunge=st?.14*t:p>=.5?.14*(1-(p-.5)/.5):0;headX=st?.2:0}}
 if(ty==='cannon'){ar=-1.15+(wl?Math.sin(u.ap)*.05:0);al=ar;lean=wl?.28:.1;twist=0;lunge=0;headX=0}
 if(ty==='guard'){if(wl)d.wasW=1;else if(d.wasW){d.wasW=0;d.pst=clockT}
  if(atk<0){if(wl){ar=-.3+Math.sin(u.ap*.9)*.05;u.gwr=-1.12}else{ar=-.14+Math.sin(T*1.2)*.01;u.gwr=-1.43;headX=-.03;headY=0;lean=-.02;const pk=clockT-(d.pst||-9);if(pk<.55){const e=Math.sin(Math.min(1,pk/.55)*Math.PI);ar-=.26*e;u.gwr-=.06*e}}}else{const p=atk,wu=p<.3,th=p>=.3&&p<.55,t=wu?easeO(p/.3):th?(p-.3)/.25:1-(p-.55)/.45;
  if(wu){ar=-.36-.24*t;u.gwr=-1.28+1.53*t;lunge=0;lean=0}else if(th){ar=-.6-.95*t;u.gwr=.25+1.25*t;lunge=.16*t;lean=.14*t}else{ar=-.36-1.19*t;u.gwr=-1.28+2.78*t;lunge=.16*t;lean=.14*t}twist=0}}
 let arz=0,alz=0,wy=0;
 if(ty==='king'){if(atk>=0)d.kcb=clockT;const rest=!wl&&atk<0&&clockT-(d.kcb||-99)>2.2;
  if(rest){const b=Math.sin(T*1.1)*.015;ar=-.5+b;al=-.5+b;arz=-.52;alz=.52;wy=.451;u.kwr=2.133-b;lean=-.03;headX=-.06+Math.sin(T*.5)*.02;headY=Math.sin(T*.37)*.16}
  else if(atk<0){ar=-.8+(wl?Math.sin(u.ap*.9)*.05:Math.sin(T*1.3)*.03);u.kwr=-1.4;al=wl?-sw*.3:-.1}
  else u.kwr=null}
 let sr=0;if(d.shd&&atk>=0&&!z){sr=atk<.25?easeO(atk/.25):atk<.6?1:1-(atk-.6)/.4;al=-.3-.55*sr}
 /* peasant work cycle */
 let tool=null;
 if(ty==='peasant'&&(!u.t||u.t===2)){const jb=u.job;tool=jb==='w'?'axe':(jb==='s'||jb==='g'||jb==='t')?'pick':jb==='r'?'hammer':(jb==='f'||jb==='p')?'hoe':null;if(u.carry)tool=null;
  if(work){const ph=((T*(jb==='r'?1.7:1.15))%1),pr=u.lph;const wu=ph<.55,st=ph>=.55&&ph<.72,t=wu?easeO(ph/.55):st?(ph-.55)/.17:1-(ph-.72)/.28;
   if(jb==='r'){const hs=Math.sin(ph*Math.PI*2)**2;ar=-.9-.8*hs;wr=.5*hs-.2;lean=.12;al=-.5}else{wr=wu?.6*t:st?.6-1.1*t:-.5*(1-(ph-.72)/.28);ar=wu?-.4-2.0*t:st?-2.4+3.0*t:.6*(1-(ph-.72)/.28);al=ar*.6;lean=wu?-.1*t:st?-.1+.4*t:.3*(1-(ph-.72)/.28);twist=wu?.2*t:st?.2-.4*t:-.2*(1-(ph-.72)/.28)}
   headX=.15;if(pr<.62&&ph>=.62){const tx2=Math.sin(u.fa)*18,ty2=Math.cos(u.fa)*18;puff(u.x+tx2,u.y+ty2,jb==='r'?'#d9c9a0':CHOPC[jb]||'#ccc',3,34);snd(jb==='w'?'chop':jb==='r'?'build':(jb==='t'||jb==='f'||jb==='p')?'dirt':'mine',u.x,u.y)}u.lph=ph}else u.lph=0}
 /* hurt flash */
 const hf=u.hurt>0?Math.min(1,u.hurt/.2)*.75:0;d.mat.emissive.setRGB(hf,hf*.25,hf*.25);
 /* apply pose */
 g.position.set(u.x/TS+Math.sin(u.fa)*lunge,u.dy,u.y/TS+Math.cos(u.fa)*lunge);g.rotation.y=u.fa;
 d.lL.rotation.x+=(sw-d.lL.rotation.x)*k;d.lR.rotation.x+=(-sw-d.lR.rotation.x)*k;
 const br=Math.sin(T*2.1)*.006;d.body.position.y=d.mdl.hip+(wl?ab*.03*(heavy?1.8:1):br);
 d.body.rotation.x+=(lean-d.body.rotation.x)*k;d.body.rotation.y+=(twist-d.body.rotation.y)*k;d.body.rotation.z+=(sway-d.body.rotation.z)*k;
 d.head.rotation.x+=(headX-d.head.rotation.x)*k;d.head.rotation.y+=(headY-d.head.rotation.y)*Math.min(1,dt*6);d.head.rotation.z+=(headZ-d.head.rotation.z)*k;
 const ka=Math.min(1,dt*(ty==='king'&&atk<0?7:22));d.arm.rotation.x+=(ar-d.arm.rotation.x)*ka;if(d.armL)d.armL.rotation.x+=(al-d.armL.rotation.x)*ka;if(d.shd){u.sr=(u.sr||0)+(sr-(u.sr||0))*Math.min(1,dt*14);d.armL.rotation.z+=(.2*u.sr-d.armL.rotation.z)*ka;shdPose(d,u.sr)}
 if(ty==='king'){const kz=Math.min(1,dt*7);d.arm.rotation.z+=(arz-d.arm.rotation.z)*kz;if(d.armL)d.armL.rotation.z+=(alz-d.armL.rotation.z)*kz;if(d.weap)d.weap.rotation.y+=(wy-d.weap.rotation.y)*kz}else if(d.arm.rotation.z!==0)d.arm.rotation.z*=.8;
 d.ring.visible=!!u.sel;
 for(const kk in d.tools)d.tools[kk].visible=tool===kk;
 if(ty==='archer'&&atk>=0)wr=0;else if(ty==='guard')wr=u.gwr;else if(ty==='king'&&u.kwr!=null)wr=u.kwr;else if(armored&&atk<0)wr=.18+(wl?Math.sin(u.ap*.9)*.06:0);
 d.wr+=(wr-d.wr)*Math.min(1,dt*(ty==='king'&&atk<0?7:20));if(tool&&d.tools[tool])d.tools[tool].rotation.x=d.wr;if(d.weap&&ty!=='archer')d.weap.rotation.x=d.wr;
 if(u.carry&&u.cj){d.carry.visible=true;if(d.carry.geometry!==CARRYG[u.cj])d.carry.geometry=CARRYG[u.cj]}else d.carry.visible=false;
 const X=d.ex;if(X.cape)X.cape.rotation.x=.1+(wl?.22+.22*Math.abs(Math.sin(u.ap)):0)+Math.sin(T*1.5)*.04+(atk>=0?.35:0);if(X.cape2)X.cape2.rotation.x=-.07+(wl?.12+.16*Math.abs(Math.sin(u.ap+.7)):0)+Math.sin(T*1.5-.9)*.05+(atk>=0?.2:0);
 if(X.plume){X.plume.rotation.x=-.15-(wl?.4:0)+Math.sin(T*3)*.07;X.plume.rotation.z=Math.sin(T*2.2)*.08+(wl?Math.sin(u.ap)*.12:0)}
 if(X.pen){X.pen.rotation.y=Math.sin(T*4.2)*.3-.1;X.pen.rotation.z=Math.sin(T*3)*.06;if(X.tip)X.tip.rotation.y=Math.sin(T*4.2-1.3)*.55}
 if(X.ban){X.ban.rotation.x=.05+Math.sin(T*2.4)*.05+(wl?.12:0);X.ban.rotation.z=Math.sin(T*1.8)*.05;if(X.ban2){X.ban2.rotation.x=.07+Math.sin(T*2.4-1.1)*.07+(wl?.07:0);X.ban2.rotation.y=Math.sin(T*1.7-.6)*.06}if(X.ban3){X.ban3.rotation.x=.1+Math.sin(T*2.4-2.2)*.1+(wl?.09:0);X.ban3.rotation.y=Math.sin(T*1.7-1.3)*.1}}
 if(d.aura)d.aura.material.opacity=.32+.1*Math.sin(clockT*3);
 if(ty==='cannon'){const rc=atk>=0?Math.max(0,1-atk*2.2):0;d.cn.position.z=d.cnz-rc*.14/(d.sc||1);d.cn.rotation.x=-rc*.06;const e2=d.c2.userData;e2.lL.rotation.x=d.lR.rotation.x;e2.lR.rotation.x=d.lL.rotation.x;
  const rl=!wl&&atk<0&&u.cd>.6,a2=wl?-1.0:atk>=0?-1.6+atk:rl?-1.3+Math.sin(T*6.5)*.42:-.35+Math.sin(T*1.4)*.05;e2.arm.rotation.x+=(a2-e2.arm.rotation.x)*ka;if(e2.armL)e2.armL.rotation.x+=((wl?-1.0:-.2)-e2.armL.rotation.x)*ka;e2.body.rotation.x=wl?.2:atk>=0?-.08:rl?.18+Math.sin(T*6.5)*.06:0;if(rl&&u.cd>T_C(u)*.75&&Math.random()<.08)puff(u.x+Math.sin(u.fa)*16,u.y+Math.cos(u.fa)*16,'#bbb4aa',1,10,{soft:1,T:1.2,s:.25,z:.45,vz:.4,g:-.1});e2.head.rotation.y=Math.sin(T*.5)*.3}}
/* ---- Minecraft death: tip over sideways, turn red, then poof ---- */
const CORPSES=[];
function mcCorpse(u){const g=u.m;if(!g)return false;unitG.delete(u);u.m=null;if(!g.visible){g.visible=true;g.position.set(u.x/TS,gh(u.x/TS,u.y/TS),u.y/TS)}g.rotation.order='YXZ';const d=g.userData;if(d.ring)d.ring.visible=false;if(d.aura)d.aura.visible=false;CORPSES.push({g,t:0,dir:Math.random()<.5?1:-1,x:u.x,y:u.y,z:u.t===1,big:u.type==='brute'});
 while(CORPSES.length>48){const o=CORPSES.shift();scene.remove(o.g);if(o.g.userData.mat)o.g.userData.mat.dispose()}return true}
function animCorpses(dt){for(let i=CORPSES.length-1;i>=0;i--){const c=CORPSES[i];c.t+=dt;const p=Math.min(1,c.t/.5),e=p*p*(3-2*p);c.g.rotation.z=c.dir*1.5708*e;const m=c.g.userData.mat;if(m&&m.emissive)m.emissive.setRGB(.6,0,0);
  if(c.t>1.0){const n=c.big?16:9;puff(c.x,c.y,'#efefef',n,c.big?44:30,{T:.85,z:.35,vz:1.5,g:-.7,s:c.big?.2:.13});puff(c.x,c.y,'#bdbdbd',n>>1,24,{T:.7,z:.25,vz:1.0,g:-.5,s:.1});if(c.z){puff(c.x,c.y,'#b8f040',2,22,{T:1.4,z:.3,vz:2.4,g:3.4,s:.08});puff(c.x,c.y,'#f0ff60',1,18,{T:1.4,z:.3,vz:2.6,g:3.4,s:.07})}
   scene.remove(c.g);if(m)m.dispose();CORPSES.splice(i,1)}}}
/* ---- death animation (legacy, unused) ---- */


