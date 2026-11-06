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
 TOOLG.sword=sword('#e8edf5','#a9b2c2','#d9b13a','#fff0a8');TOOLG.gsword=sword('#ffe9a0','#d0a03a','#c8862a','#fff6c8');
 TOOLG.rsword=mk(G=>{const GDc='#d4a234',GD2c='#ecc964',ST='#dfe5ee',SD='#9aa3b2',SL='#f7f9fc';
  tb(G,0,0,-.1,.62,.62,2.5,'#1f2c5c');for(const z of[-.9,-.1,.7])tb(G,0,0,z,.68,.68,.16,GDc);
  tb(G,0,0,-1.75,1.0,1.0,.8,GDc);tb(G,0,0,-2.3,.62,.62,.4,GD2c);tb(G,0,0,-1.75,1.08,.42,.42,'#d8283a');
  tb(G,0,0,1.55,.95,5.4,.8,GDc);for(const s of[1,-1]){tb(G,0,s*2.9,1.75,.85,.7,1.1,GD2c);tb(G,0,s*2.95,2.35,.6,.45,.5,GDc)}tb(G,0,0,1.55,1.02,.9,.9,GD2c);tb(G,0,0,1.55,1.06,.46,.46,'#3a7aff');
  tb(G,0,0,2.4,.5,1.7,.9,GDc);
  tb(G,0,0,6.6,.38,1.6,7.6,ST);tb(G,0,0,11.5,.34,1.25,2.2,ST);tb(G,0,0,13.1,.3,.82,1.0,ST);tb(G,0,0,13.9,.24,.4,.6,SL);
  tb(G,0,0,7.2,.42,.36,8.6,SD);for(const s of[1,-1])tb(G,0,s*.74,7.6,.3,.12,10.2,SL)});
 TOOLG.halberd=mk(G=>{const WD='#5e3f24',WD2='#3b2614',ST='#c9d0dc',SD='#7e8797',SL='#f2f5fa',GDc='#d4a234',GD2c='#ecc964',H=15.6;
  tb(G,0,0,5.0,.56,.56,21.6,WD);for(const z of[-1.9,-1.1,-.3,.5])tb(G,0,0,z,.64,.64,.3,WD2);
  tb(G,0,0,-5.75,.74,.74,.6,GDc);tb(G,0,0,-6.15,.5,.5,.3,GD2c);tb(G,0,0,7.2,.66,.66,.36,GDc);
  for(const s of[-1,1])tb(G,0,s*.32,H-1.9,.3,.1,3.6,SD);tb(G,0,0,H+.1,.84,.84,.9,GDc);tb(G,0,0,H-.5,.72,.72,.3,GD2c);
  tb(G,0,0,H+1.1,.42,1.12,1.2,ST);tb(G,0,0,H+2.4,.38,.9,1.4,ST);tb(G,0,0,H+3.8,.32,.64,1.4,ST);tb(G,0,0,H+5.0,.26,.4,1.0,SL);tb(G,0,0,H+5.75,.2,.2,.5,SL);tb(G,0,0,H+2.8,.46,.16,4.4,SL);
  tb(G,0,-.85,H,.34,1.0,2.3,SD);tb(G,0,-1.75,H,.3,.9,3.5,ST);tb(G,0,-2.55,H,.3,.8,4.3,ST);tb(G,0,-3.15,H,.3,.5,4.8,ST);tb(G,0,-3.48,H,.24,.24,4.6,SL);
  tb(G,0,-3.36,H-2.55,.26,.42,.5,ST);tb(G,0,-3.36,H+2.55,.26,.42,.5,ST);tb(G,0,-1.95,H,.38,.62,.62,GDc);tb(G,0,-1.95,H,.42,.28,.28,'#c42a36');
  tb(G,0,.85,H+.1,.3,1.0,.7,SD);tb(G,0,1.7,H-.1,.26,.8,.55,ST);tb(G,0,2.35,H-.4,.22,.6,.45,ST);tb(G,0,2.8,H-.75,.18,.4,.4,SL);
  tb(G,0,0,H-2.6,1.0,1.0,.16,GDc);tb(G,0,0,H-3.1,.96,.96,.8,'#a3202a');tb(G,0,0,H-3.8,.8,.8,.7,'#86161f');tb(G,0,0,H-4.35,.6,.6,.45,'#6a1018')});
 /* bow: grip in the fist, limbs along z, bent toward the archer (+y), string on the archer side */
 TOOLG.bow=mk(G=>{tb(G,0,0,0,.8,.95,1.5,'#4a2e16');for(let k=0;k<6;k++){const z=1.05+k*1.08,y=.07*k*k;[1,-1].forEach(sg=>tb(G,0,y,sg*z,.55-.04*k,.75,1.2,k===5?'#5a3a1a':'#8a5a2a'))}[1,-1].forEach(sg=>tb(G,0,2.6,sg*6.75,.5,.5,.5,'#d9b13a'));
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

let ALB=0,ALF=null;const alv=()=>ALF!=null?ALF:(RS2.done.plate?1:0)+(RS2.done.mail?1:0);
const HA={st:'#a9b0be',st2:'#878e9d',st3:'#666c7a',sth:'#cfd5df',ml:'#7f8591',ml2:'#61666f',br:'#c39a45',br2:'#e2c06a',gd:'#d4a234',gd2:'#ecc964',gdd:'#9a6e1e',lt:'#6b4423',lt2:'#4a2e16',lt3:'#8a5a32',em:'#f4ecd8',hx:'#62e4ff',dk:'#141218'};
function hkPut(Gx,m){return(x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(Gx,x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}}}
function humanKit(type,AL,P){
 const{G,HG,LA,LG,AG}=P,t=hkPut(G,0),tm=hkPut(G,4),tc=hkPut(G,7),tg=hkPut(G,5),hd=hkPut(HG,0),hm=hkPut(HG,4),hc=hkPut(HG,7),hg=hkPut(HG,5),k=hkPut(LG,0),km=hkPut(LG,4),
  A=(m,dx,y,z,w,h,d,c)=>{hkPut(AG,m)(dx,y,z,w,h,d,c);hkPut(LA,m)(-2.76-dx,y+10.45,z,w,h,d,c)},AE=(m,dx,y,z,w,h,d,c)=>hkPut(AG,m)(dx,y,z,w,h,d,c),AW=(m,dx,y,z,w,h,d,c)=>hkPut(LA,m)(-2.76-dx,y+10.45,z,w,h,d,c),
  L=(m,x,y,z,w,h,d,c)=>hkPut(LA,m)(x,y,z,w,h,d,c),P1=thp(),P2=ths(),PD=thd(),skin='#c68a5e';
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
  if(type==='bannerman'){h=40;const B=bannerKit(G);P0.X=B.X;parts=B.parts}
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
   parts=[{k:'cape',x:0,y:10.8*VX,z:-1.3*VX},{k:'plume',x:0,y:15.55*VX,z:.9*VX}]}

 }
 const T=toolGeos(),r=fin({G,HG,LA,LG,AG,parts:parts,X:P0.X},{hip:5.5,sh:10.4,neck:11,lx:.95,ax:2.76,h,sc});r.tools=type==='peasant'?T:null;r.weap=NOWEAP||MVAR==='cine'?null:type==='knight'?'sword':type==='captain'?'gsword':type==='king'?'rsword':type==='guard'?'halberd':type==='archer'?'bow':null;r.shield=(type==='knight'||type==='captain'||type==='guard')&&MVAR!=='cine'?shieldGeo(type,ALB):null;r.shp=[.2*VX,-5.0*VX,2.1*VX];RT=null;return r}

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
function zombieKit(type,ZV,P){const{G,HG,LA,LG,AG}=P,k=.46,S=zSpec(type,ZV?ZV.v:0,ZV?ZV.hint:null);
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
function swGeoV(S){S.lod=1;const P=[],N=[],C=[],I=[],A=[],GL=[],SKA=[],u=SWPX;
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
function shieldGeo(kind,AL){const G=newG(),put=(m,x,y,z,w,h,d,c)=>{const o=BMAT;BMAT=m;try{bxc(G,x*VX,y*VX,z*VX,w*VX,h*VX,d*VX,c)}finally{BMAT=o}};
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
  float bd=.42+.3*smoothstep(.24,.36,r)+.28*smoothstep(.52,.64,r)+.16*smoothstep(1.,1.25,r);vec3 tnt=mix(vec3(.66,.76,1.08),vec3(1.06,1.,.9),smoothstep(.36,.7,r));
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
function cannonG(){const G=newG(),WD='#5e4026',WL='#7a5532',IR='#9a7438',IR2='#c09048',BR='#2c2e33';
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


