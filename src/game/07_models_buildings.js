/* ---- structures: connected voxel models ---- */
const ST='#7f7f7f',ST2='#8b8b8b',ST3='#979797',STD='#5f5f5f',STL='#b3b3b3',DK='#1b1b22',RED='#9b3b2e',WOOD='#9c7a46',IRON='#4a4a52';let BLU=thp();
const isW=(tx,ty)=>{const o=occ.get(ty*TW+tx);return !!o&&(o.type==='wall'||o.type==='gate'||o.type==='tower'||o.type==='castle'||o.type==='keep')};
const isWl=(tx,ty)=>{const o=occ.get(ty*TW+tx);return !!o&&o.type==='wall'};
const connMask=s=>{const x=s.tx,y=s.ty,n=isW(x,y-1),e=isW(x+1,y),so=isW(x,y+1),w=isW(x-1,y);let m=(n?1:0)|(e?2:0)|(so?4:0)|(w?8:0);if(s.type==='wall'){if(!e&&!so&&isWl(x+1,y+1))m|=16;if(!w&&!so&&isWl(x-1,y+1))m|=32}return m};
/* 2x2 tower: which of the 8 tiles around it hold rampart pieces (2 per side: N, E, S, W) */
const pMask=s=>{const x=s.tx,y=s.ty,q=(a,b)=>{const o=occ.get(b*TW+a);return o&&o!==s&&isW(a,b)};let m=0;[[x,y-1],[x+1,y-1],[x+2,y],[x+2,y+1],[x,y+2],[x+1,y+2],[x-1,y],[x-1,y+1]].forEach(([a,b],i)=>{if(gOK(a,b)&&q(a,b))m|=1<<i});return m};
const WH=1.7,WT=.3,CRS=[ST,ST2,ST3,ST2];

const DIRS=[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]];
/* box along an arm: t = distance along the arm, l = lateral */
const ab=(G,dx,dz,t,l,y,a,b,h,c)=>bxc(G,dx!==0?dx*t:l,y,dz!==0?dz*t:l,dx!==0?a:b,h,dx!==0?b:a,c);



/* gate: 2 tiles long (local x -1..1), depth .8 */



/* ---- siege turrets ---- */
const WD='#7a5230',WD2='#5a3a20',WD3='#92643a';
function ballBase(){const G=newG();bxc(G,0,0,0,.92,.14,.92,STD);bxc(G,0,.14,0,.84,.08,.84,'#6a4a28');
 for(let k=0;k<4;k++){const a=k*Math.PI/2;bxc(G,Math.cos(a)*.36,.0,Math.sin(a)*.36,.14,.18,.14,ST3)}
 bxc(G,0,.22,0,.26,.34,.26,WD2);bxc(G,0,.54,0,.4,.07,.4,IRON);[[.38,-.3],[-.36,.34],[.34,.36]].forEach(([x,z])=>{bxc(G,x,.22,z,.22,.12,.26,'#b89a60');bxc(G,x,.34,z,.14,.07,.18,'#a88a50')});
 bxc(G,-.36,.22,-.36,.1,.28,.1,WD);bxc(G,.36,.22,-.36,.1,.28,.1,WD);return toGeo(G)}
function ballBolt(){const G=newG();bxc(G,0,.11,.12,.055,.055,.96,'#e8dcb8');bxc(G,0,.11,.66,.09,.075,.14,'#d4dae6');bxc(G,0,.11,.73,.05,.05,.08,'#f4f8ff');bxc(G,0,.11,-.3,.05,.06,.06,'#c04030');return toGeo(G)}
function ballHead(){const G=newG();
 bxc(G,0,-.07,0,.15,.13,1.04,WD3);bxc(G,0,.06,.04,.07,.05,.86,IRON);bxc(G,0,-.12,.05,.1,.05,.8,WD2);
 bxc(G,0,-.04,.28,.34,.2,.17,WD2);bxc(G,0,-.04,.28,.38,.07,.19,IRON);
 [1,-1].forEach(sg=>{bxc(G,sg*.24,-.02,.28,.2,.12,.13,WD);bxc(G,sg*.42,-.01,.24,.18,.11,.12,WD3);bxc(G,sg*.57,0,.15,.14,.1,.12,WD);bxc(G,sg*.66,0,.05,.1,.1,.1,'#a89060');
  bxc(G,sg*.34,.04,.0,.62,.025,.04,'#efe6c8');bxc(G,sg*.62,.04,.1,.04,.025,.2,'#efe6c8');bxc(G,sg*.18,.04,-.12,.34,.025,.04,'#efe6c8')});
 bxc(G,0,-.02,-.46,.24,.2,.12,STD);bxc(G,0,.05,-.46,.34,.05,.05,IRON);bxc(G,.17,.05,-.46,.05,.18,.05,WD);
 bxc(G,0,.14,-.38,.04,.34,.04,'#3a2f20');bxc(G,.1,.38,-.38,.2,.1,.03,BLU);bxc(G,.05,.3,-.38,.1,.1,.03,BLU);return toGeo(G)}
function trebBase(){const G=newG();
 [.34,1.66].forEach(x=>{bxc(G,x,0,1,.16,.14,1.8,WD2);bxc(G,x,.14,.3,.12,.12,.4,WD);bxc(G,x,.14,1.7,.12,.12,.4,WD);
  [[.3,-1],[1.7,1]].forEach(([z,sg])=>{bxc(G,x,.14,z*.5+1*.5,.14,.1,.14,WD)});
  for(let k=0;k<5;k++){const t=k/4;bxc(G,x,.14+t*1.55,.55+t*.45*(1)-.02,.12,.4,.12,WD);bxc(G,x,.14+t*1.55,1.45-t*.45+.02,.12,.4,.12,WD)}
  bxc(G,x,1.5,1,.2,.34,.34,IRON)});
 bxc(G,1,0,.28,1.5,.12,.14,WD2);bxc(G,1,0,1.72,1.5,.12,.14,WD2);bxc(G,1,.14,1,1.4,.1,.1,WD);bxc(G,1,.7,.78,1.3,.08,.08,WD);bxc(G,1,.7,1.22,1.3,.08,.08,WD);
 bxc(G,1,1.78,1,1.34,.12,.12,'#3a2f20');
 bxc(G,1,0,1,.9,.06,1.6,'#6a5a3a');[[.3,.3],[1.7,.3],[.3,1.7],[1.7,1.7]].forEach(([x,z])=>{bxc(G,x,0,z,.28,.28,.28,ST3)});
 bxc(G,.1,.14,1.9,.2,.26,.2,'#b89a60');bxc(G,1.9,.14,.1,.22,.18,.26,'#b89a60');
 [.55,1.45].forEach(z=>{bxc(G,1.9,.0,z,.18,.28,.2,STD)});
 bxc(G,1.5,.5,1.82,.05,.34,.05,'#3a2f20');bxc(G,1.65,.78,1.82,.3,.1,.03,BLU);return toGeo(G)}
function trebArm(){const G=newG();
 bxc(G,0,-.06,.36,.16,.16,2.5,WD3);bxc(G,0,-.04,1.3,.12,.12,.95,WD);bxc(G,0,-.1,-.6,.2,.22,.5,WD2);bxc(G,0,.0,.3,.34,.2,.2,IRON);
 bxc(G,0,-.12,1.66,.05,.34,.05,'#d4c8a0');bxc(G,0,-.34,1.7,.34,.18,.3,'#8a7a50');bxc(G,0,-.2,1.7,.2,.2,.2,'#8a8d99');return toGeo(G)}
function trebCW(){const G=newG();bxc(G,0,-.62,0,.12,.58,.12,IRON);bxc(G,0,-.72,0,.9,.1,.1,IRON);
 bxc(G,0,-1.2,0,.8,.5,.56,STD);bxc(G,0,-1.2,0,.82,.12,.58,BLU);bxc(G,0,-.86,0,.84,.1,.6,ST3);bxc(G,0,-1.58,0,.82,.12,.58,BLU);bxc(G,.42,-1.2,0,.04,.2,.3,'#e0b030');return toGeo(G)}
const GEO={};

/* ---- wooden tier models ---- */
const LG1='#6b4f2e',LG2='#5b4326',LG3='#b8945f',LGD='#3f2d1a',THA='#7a5a34',THB='#6a4c2a',THC='#573e22',ROPE='#d9c28a';









/* ================= Minecraft-style small buildings (cobble, planks, logs, glass, stair roofs) ================= */
const COBL=['#7d7d7d','#8c8c8c','#6e6e6e','#838383'],PLKL=['#b8945f','#a98450'],SPRL=['#6e5230','#5f4527'],LGM='#5b4326',GLS='#bfe3f2',HAYC='#d8b23a';







/* houses merge with aligned neighbours (bits: 1 N, 2 E, 4 S, 8 W): shared walls, one continuous roof */

const RF0='#9b3b2e',RF1='#8a3228';


const CONNT=new Set(['storage','barracks','academy','market']);

function mergeMask(s){const T=s.type,tx=s.tx,ty=s.ty,P=s.pl|0,q=(x,y,ex,ey)=>{if(!gOK(x,y))return false;const o=occ.get(y*TW+x);return !!o&&o!==s&&o.type===T&&o.t===0&&(o.pl|0)===P&&o.tx===ex&&o.ty===ey};
 return (q(tx,ty-1,tx,ty-2)?1:0)|(q(tx+2,ty,tx+2,ty)?2:0)|(q(tx,ty+2,tx,ty+2)?4:0)|(q(tx-1,ty,tx-2,ty)?8:0)}
function scafGeo(w,d,h){const G=newG(),P='#9a6a38',Q='#6f4a24',B='#c9a36a';const x=w/2+.08,z=d/2+.08;
 [[-x,-z],[x,-z],[-x,z],[x,z]].forEach(([a,b])=>bxc(G,a,0,b,.1,h,.1,Q));
 for(let y=.55;y<h;y+=.65){bxc(G,0,y,z,2*x,.06,.07,P);bxc(G,0,y,-z,2*x,.06,.07,P);bxc(G,x,y,0,.07,.06,2*z,P);bxc(G,-x,y,0,.07,.06,2*z,P)}
 for(let y=1.1;y<h;y+=1.3){bxc(G,0,y,z+.06,2*x,.05,.18,B);bxc(G,0,y,-z-.06,2*x,.05,.18,B)}
 const dz=z+.01;for(let y=0;y+1.3<h;y+=1.3){const n=Math.max(2,Math.round(x*2/.5));for(let k=0;k<n;k++){const a=-x+(k+.5)*2*x/n,f=k%2?-1:1;bxc(G,a,y+.55,dz,.05,.7,.05,P);}}
 return toGeo(G)}

function sGeo(s,m){const MG=s.type==='house'||s.type==='farm'||s.type==='storage'||s.type==='barracks'||s.type==='academy'||s.type==='market',hm=MG?mergeMask(s):0;s.hm=hm;const op=s.type==='tower'&&!!s.weapon,sv=BLU,fx=s.t===2?'f'+s.ci:'';if(s.t===2)BLU=PAL[s.ci][1];try{const fixed=s.type==='castle'||s.type==='barracks'||s.type==='farm'||s.type==='storage'||s.type==='house'||s.type==='academy'||s.type==='market'||s.type==='forester'||s.type==='guild'||s.type==='torch'||s.type==='keep'||s.type==='gate'||s.type==='ballista'||s.type==='trebuchet',wd=s.tier===0&&s.type!=='ballista'&&s.type!=='trebuchet'&&s.type!=='torch',WDF={wall:1,gate:1,tower:1,castle:1,barracks:1,keep:1},k=s.type+(fixed?(hm?'m'+hm:''):m)+fx+(wd?'w':'')+(op?'o':'')+(s.sz===5?'5':'')+(s.type==='tower'&&s.sz===2?'2':'')+(s.type==='gate'&&s.gl===3?'3':'');if(wd&&!WDF[s.type]&&!GEO[k]){const kS=k.replace(fx+'w',fx),old=GEO[kS];delete GEO[kS];WOODY=true;try{GEO[k]=sGeo({...s,tier:1},m)}finally{WOODY=false;if(old)GEO[kS]=old;else delete GEO[kS]}return GEO[k]}return GEO[k]||(GEO[k]=wd?({wall:woodWallGeo,tower:s.sz===2?woodTowerGeo2:woodTowerGeo,gate:s.gl===3?woodGateGeo3:woodGateGeo,castle:s.sz===5?woodCastleGeo5:woodCastleGeo,barracks:woodBarracksGeo,keep:()=>keepGeo(true)})[s.type](MG?hm:m,op):({wall:wallGeo,tower:s.sz===2?towerGeo2:towerGeo,gate:s.gl===3?gateGeo3:gateGeo,castle:s.sz===5?castleGeo5:castleGeo,barracks:barracksGeo,farm:farmGeo,storage:storageGeo,house:houseGeo,academy:academyGeo,market:marketGeo,forester:foresterGeo,guild:guildGeo,torch:torchGeo,keep:()=>keepGeo(false),ballista:ballBase,trebuchet:trebBase})[s.type](MG?hm:m,op))}finally{BLU=sv}}
const flagMat=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),structO=new Set(),stairO=new Set();
const BANNER=cvs(128,192),bannerTex=new THREE.CanvasTexture(BANNER),bannerMat=new THREE.MeshBasicMaterial({map:bannerTex,transparent:true,alphaTest:.25,side:THREE.DoubleSide}),PLG={};
let BPLOFF=false;const bpl=(w,h,x,y,z,ry)=>{if(BPLOFF)return new THREE.Object3D();const k=w+'x'+h,g=PLG[k]||(PLG[k]=new THREE.PlaneGeometry(w,h)),m=new THREE.Mesh(g,bannerMat);m.position.set(x,y,z);m.rotation.y=ry||0;return m};
function retheme(){BLU=thp();for(const k in GEO)delete GEO[k];for(const k in UM)delete UM[k];thIcons();icons3D();drawBanner();bannerTex.needsUpdate=true;
 for(const s of structs)if(s.o3)buildStructMesh(s);for(const[u,g]of unitG){scene.remove(g)}unitG.clear();for(const u of units)u.m=null;titleDirty=true}
function buildStructMesh(s){BPLOFF=s.t===2||s.tier===0;try{buildStructMesh0(s)}finally{BPLOFF=false}}
function buildStructMesh0(s){const g=s.o3;while(g.children.length)g.remove(g.children[0]);let b=0;s.head=null;s.arm=null;s.bolt=null;s.tpv=null;
 for(const[i,j]of s.tiles)b=Math.max(b,HT[j*TW+i]);s.bh=b;
 const m=s.sz===1?connMask(s):s.type==='tower'?pMask(s):0,mesh=new THREE.Mesh(sGeo(s,m),matV);mesh.castShadow=SHADOWS;mesh.receiveShadow=SHADOWS;g.add(mesh);
 if(s.type==='gate'){g.position.set(s.x/TS,b,s.y/TS);g.rotation.y=s.ax?Math.PI/2:0}
 else if(s.sz===1){g.position.set(s.tx+.5,b,s.ty+.5);g.rotation.y=ROTT.has(s.type)&&!s.weapon?(s.rot|0)*Math.PI/2:0}else g.position.set(s.tx,b,s.ty);
 if(s.type==='gate'&&s.gl!==3)mesh.scale.x=(s.gl||2)/2;
 s.door=null;s.flag=null;
 if(s.type==='gate'){const g3=s.gl===3,gk=g3?1:(s.gl||2)/2;(g3?[-1,1]:[-.74*gk,.74*gk]).forEach(x=>{g.add(bpl(.3,.62,x,g3?1.55:1.15,g3?.457:.435,0));g.add(bpl(.3,.62,x,g3?1.55:1.15,g3?-.457:-.435,Math.PI))});let d;if(s.tier===0){const k=g3?1:gk,geo=GEO.doorw||(GEO.doorw=doorGeoW());d=new THREE.Group();d.position.set(0,1.32,0);d.userData.lv=[-1,1].map(sd=>{const pv=new THREE.Group();pv.position.x=sd*.46*k;const m=new THREE.Mesh(geo,matV);m.scale.x=k*.5;m.position.x=-sd*.23*k;m.castShadow=SHADOWS;pv.add(m);d.add(pv);return pv})}else{d=new THREE.Mesh(GEO.door||(GEO.door=doorGeo()),matV);d.scale.x=g3?1:gk;d.position.set(0,1.32,0);d.castShadow=SHADOWS}g.add(d);s.door=d;s.dop=s.dop||0}
 if(s.type==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.position.set(0,.6,0);h.castShadow=SHADOWS;g.add(h);s.head=h;h.rotation.y=s.aim||0;const bo=new THREE.Mesh(GEO.bbo||(GEO.bbo=ballBolt()),matV);h.add(bo);s.bolt=bo}
 if(s.type==='trebuchet'){const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.castShadow=SHADOWS;g.add(a);s.arm=a;a.rotation.y=s.aim||0;const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),matV);cw.position.set(0,0,-.86);cw.castShadow=SHADOWS;a.add(cw);s.cw=cw;a.rotation.order='YXZ';{const P=new THREE.Group();P.position.set(1,0,1);g.add(P);mesh.position.set(-1,0,-1);a.position.set(0,1.78,0);P.add(mesh);P.add(a);s.tpv=P;P.rotation.y=s.aim||0;a.rotation.y=0}}
 if(s.type==='tower'&&s.weapon==='ballista'){const h=new THREE.Mesh(GEO.bh||(GEO.bh=ballHead()),matV);h.scale.setScalar(s.sz===2?1:.82);if(s.sz===2)h.position.set(1,gtopOf(s)+.32,1);else h.position.set(0,3.28+.3,0);h.castShadow=SHADOWS;g.add(h);s.head=h;h.rotation.y=s.aim||0;const bo=new THREE.Mesh(GEO.bbo||(GEO.bbo=ballBolt()),matV);h.add(bo);s.bolt=bo}
 if(s.type==='tower'&&s.weapon==='trebuchet'){const wg=new THREE.Group();if(s.sz===2){wg.scale.setScalar(.7);wg.position.set(.3,gtopOf(s),.3)}else{wg.scale.setScalar(.4);wg.position.set(-.4,3.28,-.4)}const b2=new THREE.Mesh(GEO.tb||(GEO.tb=trebBase()),matV);b2.castShadow=SHADOWS;wg.add(b2);const a=new THREE.Mesh(GEO.ta||(GEO.ta=trebArm()),matV);a.position.set(1,1.78,1);a.rotation.order='YXZ';a.castShadow=SHADOWS;wg.add(a);const cw=new THREE.Mesh(GEO.tcw||(GEO.tcw=trebCW()),matV);cw.position.set(0,0,-.86);a.add(cw);g.add(wg);s.arm=a;s.cw=cw;{const P=new THREE.Group();P.position.set(1,0,1);wg.add(P);b2.position.set(-1,0,-1);a.position.set(0,1.78,0);P.add(b2);P.add(a);s.tpv=P;P.rotation.y=s.aim||0;a.rotation.y=0}}
 if(s.type==='tower'){if(s.sz===2){[[1,1.86,0],[1,.14,Math.PI],[1.86,1,Math.PI/2],[.14,1,-Math.PI/2]].forEach(([x,z,r])=>g.add(bpl(.4,.72,x,2.75,z,r)))}else[[0,.405,0],[0,-.405,Math.PI],[.405,0,Math.PI/2],[-.405,0,-Math.PI/2]].forEach(([x,z,r])=>g.add(bpl(.3,.5,x,2.0,z,r)))}
 if(s.type==='castle'&&s.sz===5){const st=s.tier!==0,fg=new THREE.Group();fg.position.set(C5.kx,st?C5.flag:C5.wflag,st?C5.kz:1.25);fg.add(bpl(.8,1.1,.43,-.55,0,0));g.add(fg);s.flag=fg;
  if(st){[1.3,3.7].forEach(x=>g.add(bpl(.36,.62,x,2.0,.003,Math.PI)));[[.6,.6,6.6],[4.4,.6,6.6],[.6,4.4,5.85],[4.4,4.4,5.85]].forEach(([x,z,y])=>{const f2=new THREE.Group();f2.position.set(x,y,z);f2.add(bpl(.42,.32,.23,0,0,0));g.add(f2)})}}
 else if(s.type==='castle'){const fg=new THREE.Group();fg.position.set(1.5,8.45,1.18);fg.add(bpl(.7,1.0,.38,-.5,0,0));g.add(fg);s.flag=fg;[.46,2.54].forEach(x=>g.add(bpl(.3,.55,x,2.2,3.007,0)));[1.2,1.8].forEach(x=>g.add(bpl(.34,.6,x,1.45,.044,Math.PI)));
  [[.46,.46,6.25],[2.54,.46,6.25],[.46,2.54,5.5],[2.54,2.54,5.5]].forEach(([x,z,y])=>{const f2=new THREE.Group();f2.position.set(x,y,z);f2.add(bpl(.4,.3,.22,0,0,0));g.add(f2)})}
 if(s.sz>=2){const sz=s.sz,inner=new THREE.Group();while(g.children.length)inner.add(g.children[0]);inner.position.set(-sz/2,0,-sz/2);g.add(inner);g.position.set(s.tx+sz/2,b,s.ty+sz/2);g.rotation.y=(ROTT.has(s.type)&&!s.hm?(s.rot|0):0)*Math.PI/2;}}
const _rcS=new THREE.Raycaster(),_v2S=new THREE.Vector2();
function pickStruct(p){try{_v2S.set(p.x/cv.width*2-1,1-p.y/cv.height*2);_rcS.setFromCamera(_v2S,camera);const L=[],M=new Map();for(const s of structs){if(!s.o3||s.hp<=0)continue;s.o3.traverse(o=>{if(o.isMesh&&o.visible){L.push(o);M.set(o,s)}})}const h=_rcS.intersectObjects(L,false);return h.length?M.get(h[0].object):null}catch(e){return null}}
function addStruct(s){const g=new THREE.Group();s.o3=g;structO.add(g);buildStructMesh(s);scene.add(g)}
function rmStruct(s){if(s.o3){scene.remove(s.o3);structO.delete(s.o3);s.o3=null}}
function refreshNear(s){const seen=new Set(),rw=s.type==='wall'||s.type==='gate'||s.type==='tower'||s.type==='castle'||s.type==='keep';for(const[tx,ty]of s.tiles)for(const[dx,dy]of D8){const o=occ.get((ty+dy)*TW+tx+dx);if(o&&o!==s&&o.o3&&(o.sz===1&&(dx===0||dy===0||o.type==='wall')||(o.type==='tower'&&rw)||(o.type===s.type&&(dx===0||dy===0)&&(o.type==='house'||o.type==='farm'||CONNT.has(o.type))))&&!seen.has(o)){seen.add(o);buildStructMesh(o)}}if(s.o3&&s.hp>0)buildStructMesh(s)}
function addStairs(i,si){const tx=i%TW,ty=(i/TW)|0,df=si.hi-si.lo,n=df,G=newG();
 for(let k=0;k<n;k++){const u0=k/n,u1=(k+1)/n,a=si.sg>0?u0:1-u1,b=si.sg>0?u1:1-u0,h=(k+1)*df/n,c=rgb(k%2?'#a8a9b4':'#8f909c');
  if(si.ax===0)addBox(G,a,0,0,b,h,1,c);else addBox(G,0,0,a,1,h,b,c)}
 const m=new THREE.Mesh(toGeo(G),matV);m.position.set(tx,si.lo,ty);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);stairO.add(m)}
function build3D(){for(const k of[...CHK.keys()])dropChunk(k);dirtyT.clear();dirtyP.clear();
 for(const g of structO)scene.remove(g);structO.clear();for(const m of stairO){scene.remove(m);m.geometry.dispose()}stairO.clear();
 for(const[,g]of unitG)scene.remove(g);unitG.clear();
 for(const s of structs)addStruct(s);buildRoutes();home();
 const cx0=(CAM.x/CH)|0,cy0=(CAM.z/CH)|0;for(let j=-RM;j<=RM;j++)for(let i=-RM;i<=RM;i++)loadChunk(cx0+i,cy0+j)}
/* ================= Medieval Minecraft buildings: timber frames, stone bricks, steep roofs =================
   (these declarations replace the earlier building models; footprints, door sides and heights are unchanged) */
const MDK='#3b2a1a',MDK2='#4a3523',MSP='#6a4e2e',MSP2='#5a4126',MOK='#a6844f',MOK2='#977648',MPL='#e9e1cc',
 MSB=['#8f8f8f','#848484','#999999','#8a8a8a'],MSB2='#6e6e6e',MCB=['#7b7b7b','#8a8a8a','#6c6c6c','#828282'],MMS=['#6a8a52','#5d7d48'],
 MSL=['#4c4e57','#42444c','#575963'],MRF=['#3f2c1c','#4b3522'],MPU=['#5b3d8a','#4c3175'],MBK=['#904c3b','#7f4233'],MGL='#bfe0f0',MLT='#ffd36a',MIR='#38383f',MLOG='#5a4128',MLOGT='#9c7a48',MBAR='#5b5e66';
/* ---- kit ---- */









/* steep stair roof with plaster gables and a dark ridge beam; returns the ridge top */








/* ---- house (merges with aligned neighbours: bits 1 N, 2 E, 4 S, 8 W) ---- */

/* ---- farm (merges like houses) ---- */

/* ---- storage: timber warehouse with an open porch full of barrels and crates ---- */

/* ---- barracks: stone or timber hall with a training yard (weapon rack + archery target) ---- */



/* ---- academy: stone library with bookshelves, timber upper floor, purple roof and a wizard tower ---- */

/* ---- market: timber stall under a striped awning, goods on the counter, scales, barrels and a coin sign ---- */

/* ---- torch: a post with an iron fire basket that lights the night ---- */

/* ---- walls: stone bricks with a walkway and crenels / spruce log palisade ---- */


/* ---- towers ---- */


/* ---- gates: stone gatehouse with a portcullis / log gatehouse with plank doors ---- */




/* ---- castle (stone): curtain walls, round towers with slate cones, a keep and a gatehouse with portcullis ---- */

/* ---- castle (wood): spruce palisade, log watchtowers and a half-timbered great hall ---- */

/* ---- keep (four merged towers) ---- */

/* ================= REWORKED BUILDINGS (v67): warm limestone, brass, hextech lamps; slate / copper / terracotta roofs =================
   face materials: 1 stone, 2 wood, 3 smooth (plaster, iron, soil), 4 brass, 5 glow, 6 roof tiles, 7 cloth.
   Every 2x2 building merges with aligned neighbours of the same type (bits 1 N, 2 E, 4 S, 8 W): shared walls and roofs, and the
   north-west building of a merged block gets the upgrade (windmill, crane, watch turret, observatory, clock post, dormers). */
const bS=bxm(1),bW=bxm(2),bP=bxm(3),bM=bxm(4),bL=bxm(5),bR=bxm(6),bC=bxm(7);
const QS=['#d6c196','#cbb58a','#dfcba2','#c4ad82'],QSD='#9b8565',QSD2='#7f6c52',QTR='#ebdab2',QW1='#7a5333',QW2='#5a3b23',QW3='#9a6c40',QPL='#efe3c6',QIR='#3b3b45',QBR='#c9a24f',QBR2='#e8c873',QHX='#62e4ff',QFI='#ffb24a',QGL='#a9cbd9',
 QSL=['#66615f','#5b5755','#716c69'],QCU=['#3f7e74','#376f67','#4a8b81'],QTC=['#a8563c','#954a33','#b66246'],QMS='#6c8a4c',QBK=['#9a5442','#87493a'],QLOG='#6b4a2c',QLOGT='#a8814f';
const qab=(f,G,dx,dz,t,l,y,a,b,h,c)=>f(G,dx!==0?dx*t:l,y,dz!==0?dz*t:l,dx!==0?a:b,h,dx!==0?b:a,c);
const qP=(G,x,y,z,ax,n)=>(f,dx,dy,dn,w,h,dd,c)=>ax?f(G,x+dx,y+dy,z+n*dn,w,h,dd,c):f(G,x+n*dn,y+dy,z+dx,dd,h,w,c);
function qStone(G,x,y0,z,w,d,h,o){o=o||{};const n=Math.max(1,Math.round(h/.22)),q=h/n;for(let k=0;k<n;k++)bS(G,x,y0+k*q,z,w,q,d,o.moss&&k===0?QMS:QS[(k+(o.ph|0))%4])}
function qPlinth(G,x,y0,z,w,d,h){bS(G,x,y0,z,w,h,d,QSD);bS(G,x,y0+h,z,w-.04,.04,d-.04,QSD2)}
function qCornice(G,x,y,z,w,d,h){bS(G,x,y,z,w,h||.07,d,QTR)}
function qQuoin(G,x0,z0,x1,z1,y0,h){const n=Math.max(1,Math.round(h/.22)),q=h/n;for(let k=0;k<n;k+=2)for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])bS(G,x,y0+k*q,z,.13,q,.13,QTR)}
function qWin(G,x,y,z,ax,n,o){o=o||{};const W=o.w||.2,H=o.h||.3,P=qP(G,x,y,z,ax,n),mf=o.wood?bW:bS,fr=o.wood?QW2:QTR,gc=o.glow?'#ffd98c':QGL,gf=o.glow?bL:bP;
 P(gf,0,0,0,W,H,.03,gc);P(gf,0,H,0,W*.56,.05,.03,gc);
 P(mf,0,-.05,.012,W+.1,.05,.06,fr);P(mf,-W/2-.03,0,.012,.05,H,.05,fr);P(mf,W/2+.03,0,.012,.05,H,.05,fr);
 P(mf,-W*.36,H,.012,W*.3,.05,.05,fr);P(mf,W*.36,H,.012,W*.3,.05,.05,fr);P(mf,0,H+.05,.012,W*.62,.05,.05,fr);if(!o.wood)P(bS,0,H+.08,.018,.07,.07,.06,QTR);
 P(bP,0,0,.016,.022,H,.02,QIR);P(bP,0,H*.5,.016,W,.02,.02,QIR);
 if(o.shut){P(bW,-W/2-.1,0,.022,.1,H,.03,o.sc||QW1);P(bW,W/2+.1,0,.022,.1,H,.03,o.sc||QW1)}
 if(o.box){P(bW,0,-.12,.06,W+.08,.07,.1,QW2);[[-.06,'#c8282a'],[0,'#f0d020'],[.06,'#e05a8a']].forEach(([a,c])=>P(bP,a,-.05,.06,.045,.05,.045,c));P(bP,-.03,-.05,.07,.03,.04,.03,'#4a8e32');P(bP,.03,-.05,.07,.03,.04,.03,'#4a8e32')}}
function qLamp(G,x,y,z,hex){bP(G,x,y+.06,z,.02,.06,.02,QIR);bM(G,x,y+.04,z,.1,.025,.1,QBR);bL(G,x,y-.06,z,.07,.1,.07,hex?QHX:QFI);bM(G,x,y-.09,z,.1,.03,.1,QBR);bM(G,x,y-.12,z,.03,.03,.03,QBR)}
function qPost(G,x,y,z,h,hex){bS(G,x,y,z,.16,.1,.16,QSD);bM(G,x,y+.1,z,.05,h,.05,QBR);bM(G,x,y+.1+h,z,.12,.03,.12,QBR);bL(G,x,y+.13+h,z,.09,.12,.09,hex?QHX:QFI);bM(G,x,y+.25+h,z,.12,.03,.12,QBR);bM(G,x,y+.28+h,z,.04,.06,.04,QBR)}
function qDoor(G,x,z,ax,n,o){o=o||{};const y0=o.y==null?.18:o.y,W=o.w||.32,H=o.h||.56,P=qP(G,x,y0,z,ax,n),fr=o.wood?bW:bS,fc=o.wood?QW2:QTR;
 P(fr,0,0,0,W+.12,H+.06,.04,fc);P(fr,0,H+.06,0,W*.78,.06,.05,fc);if(!o.wood)P(bS,0,H+.1,.006,.1,.08,.06,QTR);
 P(bW,0,0,.012,W,H,.04,o.c||QW1);P(bW,0,H,.012,W*.62,.05,.04,o.c||QW1);for(const a of[-W/3,0,W/3])P(bW,a,0,.03,.015,H,.01,QW2);
 P(bP,0,H*.22,.035,W,.035,.01,QIR);P(bP,0,H*.72,.035,W,.035,.01,QIR);P(bM,W*.3,H*.45,.04,.045,.045,.03,QBR);
 P(bS,0,-.06,.1,W+.16,.06,.16,QSD);if(o.lamp)qLamp(G,ax?x+W/2+.13:x+n*.09,y0+H+.08,ax?z+n*.09:z+W/2+.13,o.hex)}
function qBan(G,x,y,z,ax,n,w,h){w=w||.22;h=h||.5;const P=qP(G,x,y,z,ax,n);
 P(bM,0,0,.035,w+.08,.035,.035,QBR);P(bC,0,-h,.02,w,h,.02,BLU);P(bC,0,-h-.06,.02,w*.46,.06,.02,BLU);P(bM,0,-h+.04,.033,w,.03,.01,QBR2);P(bC,0,-h*.6,.033,.05,h*.38,.01,'#f4ecd8');P(bC,0,-h*.45,.033,w*.6,.045,.01,'#f4ecd8')}
function qFlag(G,x,y,z,h){h=h||.7;bP(G,x,y,z,.045,h,.045,QIR);bM(G,x,y+h,z,.08,.08,.08,QBR2);bC(G,x+.16,y+h-.3,z,.28,.22,.025,BLU);bC(G,x+.32,y+h-.27,z,.06,.15,.025,BLU)}
function qGem(G,x,y,z,ax,n,s){s=s||.12;const P=qP(G,x,y,z,ax,n);P(bM,0,-s*.25,0,s*1.6,s*1.5,.04,QBR);P(bL,0,0,.022,s,s,.04,QHX)}
function qMerl(G,x0,z0,x1,z1,y,h,step){step=step||.3;const s=.15,put=(x,z)=>{bS(G,x,y,z,s,h,s,QS[0]);bS(G,x,y+h,z,s+.02,.035,s+.02,QTR)};
 for(let x=x0+s/2;x<=x1-s/2+1e-6;x+=step){put(x,z0+s/2);put(x,z1-s/2)}for(let z=z0+s/2+step;z<=z1-s/2-step+1e-6;z+=step){put(x0+s/2,z);put(x1-s/2,z)}}
function qSlit(G,x,y,z,ax){bP(G,x,y,z,ax?.06:.03,.28,ax?.03:.06,'#1b1a20');bS(G,x,y+.28,z,ax?.12:.035,.035,ax?.035:.12,QTR)}
function qRound(G,x,z,y0,h,R,o){o=o||{};const n=Math.max(1,Math.round(h/.25)),q=h/n;for(let k=0;k<n;k++){const c=o.moss&&k===0?QMS:QS[k%4];bS(G,x,y0+k*q,z,R,q,R*.7,c);bS(G,x,y0+k*q,z,R*.7,q,R,c)}}
function qRing(G,x,z,y,R,h,c,f){(f||bS)(G,x,y,z,R,h,R*.7,c);(f||bS)(G,x,y,z,R*.7,h,R,c)}
function qCone(G,x,z,y0,R,cols,st){st=st||.15;let k=0;for(let a=R;a>.1;a-=st,k++){const c=cols[k%cols.length];bR(G,x,y0+k*.18,z,a,.18,a*.72,c);bR(G,x,y0+k*.18,z,a*.72,.18,a,c)}return y0+k*.18}
function qPyr(G,x,z,y0,w,d,cols,st,rs){st=st||.17;rs=rs||.1;let k=0;for(let a=w,b=d;a>.1&&b>.1;a-=2*rs,b-=2*rs,k++)bR(G,x,y0+k*st,z,a,st,b,cols[k%cols.length]);return y0+k*st}
function qRoof(G,cx,cz,len,span,y0,cols,alongX,o){o=o||{};const rise=o.rise||.22,run=o.run||.18,ov0=o.ov0==null?.12:o.ov0,ov1=o.ov1==null?.12:o.ov1,g0=o.g0!==false,g1=o.g1!==false,FL=o.fill||QPL,gf=o.stone?bS:bP;
 const L=len+ov0+ov1,ca=(ov1-ov0)/2,put=(f,al,la,y,lA,wd,h,c)=>alongX?f(G,cx+al,y,cz+la,lA,h,wd,c):f(G,cx+la,y,cz+al,wd,h,lA,c);
 let half=span/2+(o.side==null?.1:o.side),k=0;
 for(;half>run*1.05;k++,half-=run){const y=y0+k*rise,c=cols[k%cols.length];put(bR,ca,half-run/2,y,L,run+.012,rise,c);put(bR,ca,-(half-run/2),y,L,run+.012,rise,c);
  put(bR,ca,half-.012,y-.012,L,.035,.035,lighten(c,.14));put(bR,ca,-(half-.012),y-.012,L,.035,.035,lighten(c,.14));
  const inner=2*(half-run);if(inner>.02){if(g0)put(gf,-len/2+.05,0,y,.08,inner,rise,FL);if(g1)put(gf,len/2-.05,0,y,.08,inner,rise,FL)}}
 const yt=y0+k*rise,rw=Math.max(.12,2*half);put(bR,ca,0,yt,L,rw+.012,rise*.6,cols[k%cols.length]);put(bM,ca,0,yt+rise*.6,L+.02,.08,.06,o.ridge||QBR);
 if(o.fin){if(g0)put(bM,-len/2-ov0+.05,0,yt+rise*.6+.06,.06,.06,.18,QBR2);if(g1)put(bM,len/2+ov1-.05,0,yt+rise*.6+.06,.06,.06,.18,QBR2)}
 if(!o.stone){const F=o.frame||QW2;if(g0)put(bW,-len/2+.03,0,y0,.05,span,.06,F);if(g1)put(bW,len/2-.03,0,y0,.05,span,.06,F)}
 return yt+rise*.6+.06}
function qTimber(G,x0,z0,x1,z1,y0,y1,o){o=o||{};const cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0,h=y1-y0,F=o.frame||QW2,t=.07,p=.03,sk=o.skip||'';
 bP(G,cx,y0,cz,w,h,d,o.fill||QPL);
 const face=(nm,fx,fz,L,ax)=>{if(sk.includes(nm))return;const W=ax?L:p,D=ax?p:L;bW(G,fx,y0,fz,W,t,D,F);bW(G,fx,y1-t,fz,W,t,D,F);
  const n=Math.max(1,Math.round(L/(o.span||.5)));for(let i=0;i<=n;i++){const a=-L/2+t/2+i*(L-t)/n;bW(G,ax?fx+a:fx,y0,ax?fz:fz+a,ax?t:p,h,ax?p:t,F)}
  if(o.brace&&h>.35){const pw=(L-t)/n;for(let i=0;i<n;i++){if((i+(nm==='N'||nm==='E'?1:0))%2)continue;const st=4,bw=(pw-t)/st,bh=(h-2*t)/st,a0=-L/2+t+i*pw;
    for(let s=0;s<st;s++){const aa=a0+s*bw+bw/2,yy=y0+t+(i%4<2?s:(st-1-s))*bh;bW(G,ax?fx+aa:fx,yy,ax?fz:fz+aa,ax?bw+.012:p,bh,ax?p:bw+.012,F)}}}};
 face('N',cx,z0-p/2,w+2*p,true);face('S',cx,z1+p/2,w+2*p,true);face('W',x0-p/2,cz,d+2*p,false);face('E',x1+p/2,cz,d+2*p,false)}
function qChim(G,x,z,y0,h){const n=Math.max(1,Math.round(h/.18));for(let k=0;k<n;k++)bS(G,x,y0+k*h/n,z,.24,h/n,.24,QBK[k%2]);bS(G,x,y0+h,z,.29,.05,.29,QTR);bP(G,x,y0+h+.05,z,.13,.05,.13,'#262222')}
function qBarrel(G,x,z,y){y=y||0;bW(G,x,y,z,.26,.34,.26,'#8a6038');bP(G,x,y+.06,z,.275,.035,.275,QIR);bP(G,x,y+.26,z,.275,.035,.275,QIR);bW(G,x,y+.34,z,.22,.012,.22,'#6a4a2a')}
function qCrate(G,x,z,y,s){bW(G,x,y,z,s,s,s,'#a87e4c');bW(G,x,y,z,s+.012,.035,s+.012,QW2);bW(G,x,y+s-.035,z,s+.012,.035,s+.012,QW2);bW(G,x,y,z,s*.18,s,s+.012,QW2)}
const mBits=m=>({N:m&1,E:m&2,S:m&4,W:m&8,sk:((m&1)?'N':'')+((m&2)?'E':'')+((m&4)?'S':'')+((m&8)?'W':''),nw:!(m&1)&&!(m&8)&&!!(m&6)});
/* ---- house: stone ground floor, plastered timber upper floor (colour varies), terracotta roof; merged rows get dormers ---- */
function houseGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk}=mBits(m),alongX=!((N||S)&&!(E||W)),FL=['#efe3c6','#ecd3a2','#dde3e3','#f0d8c6'][(m*5+1)%4];
 const fx0=W?0:.06,fx1=E?2:1.94,fz0=N?0:.06,fz1=S?2:1.94;qPlinth(G,(fx0+fx1)/2,0,(fz0+fz1)/2,fx1-fx0,fz1-fz0,.16);
 const x0=W?0:.24,x1=E?2:1.76,z0=N?0:.24,z1=S?2:1.76;qStone(G,(x0+x1)/2,.2,(z0+z1)/2,x1-x0,z1-z0,.3);
 qTimber(G,x0,z0,x1,z1,.5,1.0,{skip:sk,fill:FL});
 const j=.07,jx0=W?0:x0-(alongX?0:j),jx1=E?2:x1+(alongX?0:j),jz0=N?0:z0-(alongX?j:0),jz1=S?2:z1+(alongX?j:0);
 bW(G,(jx0+jx1)/2,1.0,(jz0+jz1)/2,jx1-jx0,.08,jz1-jz0,QW2);qTimber(G,jx0,jz0,jx1,jz1,1.08,1.6,{skip:sk,brace:true,fill:FL});
 const dr=!S?'S':!N?'N':!E?'E':!W?'W':null,wo={wood:1,shut:1,box:1};
 if(!S){qWin(G,.5,.58,z1+.016,true,1,wo);qWin(G,1.5,.58,z1+.016,true,1,wo);qWin(G,.62,1.2,jz1+.016,true,1,{wood:1});qWin(G,1.38,1.2,jz1+.016,true,1,{wood:1});if(dr==='S')qDoor(G,1,z1+.016,true,1,{wood:1,lamp:1})}
 if(!N){qWin(G,.62,1.2,jz0-.016,true,-1,{wood:1});qWin(G,1.38,1.2,jz0-.016,true,-1,{wood:1});if(dr==='N')qDoor(G,1,z0-.016,true,-1,{wood:1,lamp:1});else qWin(G,1,.58,z0-.016,true,-1,{wood:1,shut:1})}
 if(!E){qWin(G,jx1+.016,1.2,1,false,1,{wood:1});if(dr==='E')qDoor(G,x1+.016,1,false,1,{wood:1,lamp:1});else qWin(G,x1+.016,.58,1,false,1,wo)}
 if(!W){qWin(G,jx0-.016,1.2,1,false,-1,{wood:1});if(dr==='W')qDoor(G,x0-.016,1,false,-1,{wood:1,lamp:1});else qWin(G,x0-.016,.58,1,false,-1,wo)}
 let top;if(alongX)top=qRoof(G,(jx0+jx1)/2,(jz0+jz1)/2,jx1-jx0,jz1-jz0,1.6,QTC,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1,fill:FL});
 else top=qRoof(G,(jx0+jx1)/2,(jz0+jz1)/2,jz1-jz0,jx1-jx0,1.6,QTC,false,{ov0:N?0:.12,ov1:S?0:.12,g0:!N,g1:!S,side:(E||W)?0:.1,fill:FL});
 if(alongX&&!E)qChim(G,x1-.24,(z0+z1)/2-.4,1.0,top-.85);else if(!alongX&&!S)qChim(G,(x0+x1)/2+.4,z1-.24,1.0,top-.85);
 if(m&&alongX&&!S){const dz=jz1-.3,dy=1.66;bP(G,1,dy,dz,.38,.32,.36,FL);bW(G,1,dy,dz+.18,.42,.05,.02,QW2);qWin(G,1,dy+.06,dz+.185,true,1,{wood:1,w:.16,h:.18});qPyr(G,1,dz,dy+.32,.5,.48,QTC,.1,.1)}
 return toGeo(G)}
/* ---- farm: crop rows, fences on the outer sides, scarecrow, hay; a merged field gets a windmill ---- */
function farmGeo(m){m=m||0;const G=newG(),{N,E,S,W,nw}=mBits(m);bP(G,1,0,1,2,.1,2,'#6e4a2c');
 const mill=nw?[.42,.42]:null;
 for(let r=0;r<5;r++){const z=.22+r*.39;if(r===2){bP(G,1,.06,z,2,.05,.22,'#3a6fd0');continue}bP(G,1,.1,z,2,.03,.26,'#4a3020');
  for(let i=0;i<7;i++){const x=.15+i*.285,gr=(i*3+r*5)%4;if(mill&&x<.85&&z<.85)continue;
   if(r%2===0){const h=.12+gr*.07,c=gr>=3?'#d8b43a':gr===2?'#b8b040':'#5e9a36';bxc(G,x-.05,.13,z-.05,.035,h,.035,c);bxc(G,x+.05,.13,z+.05,.035,h,.035,c);if(gr>=2)bxc(G,x,.13+h,z,.07,.05,.07,gr>=3?'#e8c84a':'#c8c050')}
   else{bxc(G,x,.13,z,.12,.08,.1,'#4a8e32');bxc(G,x,.2,z,.06,.06,.06,'#5ea83e');if(gr>=2)bxc(G,x,.12,z+.05,.06,.03,.03,'#e07a1a')}}}
 const fence=(ax,fixed)=>{for(let i=0;i<=8;i++){const t=.06+i*.235;ax?bW(G,t,.1,fixed,.08,.42,.08,QW1):bW(G,fixed,.1,t,.08,.42,.08,QW1);ax?bW(G,t,.52,fixed,.05,.04,.05,QW3):bW(G,fixed,.52,t,.05,.04,.05,QW3)}for(const y of[.26,.42])ax?bW(G,1,y,fixed,1.9,.05,.04,QW3):bW(G,fixed,y,1,.04,.05,1.9,QW3)};
 if(!N)fence(true,.04);if(!S)fence(true,1.96);if(!W)fence(false,.04);if(!E)fence(false,1.96);
 if(!N&&!E){const x=1.74,z=.32;bW(G,x,.1,z,.05,.62,.05,QW1);bW(G,x,.5,z,.42,.05,.05,QW1);bC(G,x,.4,z,.18,.2,.12,'#b8542e');bC(G,x,.7,z,.18,.17,.18,'#e0b05a');bP(G,x-.045,.78,z+.092,.04,.04,.01,'#2a1a0a');bP(G,x+.045,.78,z+.092,.04,.04,.01,'#2a1a0a');bC(G,x,.87,z,.26,.04,.26,HAYC);bC(G,x,.91,z,.12,.08,.12,HAYC)}
 if(!S&&!W){bW(G,.32,.1,1.7,.3,.3,.3,QW1);bP(G,.32,.36,1.7,.24,.05,.24,'#5a3a1a');bP(G,.32,.4,1.7,.18,.02,.18,'#6b8a3a')}
 if(!S&&!E){bC(G,1.66,.1,1.66,.38,.36,.38,HAYC);bC(G,1.66,.24,1.66,.4,.07,.4,'#a98a2a');bC(G,1.36,.1,1.74,.24,.24,.24,HAYC)}
 if(mill){const[x,z]=mill;qRound(G,x,z,.1,1.3,.74,{moss:1});qRing(G,x,z,.7,.78,.05,QW2,bW);bW(G,x,1.4,z,.82,.07,.82,QW2);qCone(G,x,z,1.47,.86,QTC,.16);
  qDoor(G,x,z+.37,true,1,{wood:1,y:.1,w:.2,h:.36});qWin(G,x+.37,.8,z,false,1,{wood:1,w:.12,h:.18});const hy=1.3,hz=z+.47;bW(G,x,hy-.04,hz-.06,.1,.1,.16,QW2);bM(G,x,hy-.03,hz+.03,.07,.07,.04,QBR);
  for(const[ax,sg]of[[0,1],[0,-1],[1,1],[1,-1]]){const L=1.0;if(ax)bW(G,x+sg*L/2,hy,hz+.04,L,.04,.03,QW2);else bW(G,x,hy+(sg>0?0:-L)+.02,hz+.04,.04,L,.03,QW2);
   if(ax)bC(G,x+sg*(L/2+.02),hy+(sg>0?.03:-.15),hz+.05,L*.82,.12,.015,'#efe6d0');else bC(G,x+(sg>0?-.09:.09),hy+(sg>0?.1:-L+.1),hz+.05,.12,L*.82,.015,'#efe6d0')}}
 return toGeo(G)}
/* ---- storage: warehouse with stone footing, timber walls and a terracotta roof; merged halls share the roof and the north-west one hoists crates ---- */
function storageGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m),alongX=!((N||S)&&!(E||W));
 const x0=W?0:.12,x1=E?2:1.88,z0=N?0:.12,z1=S?2:1.56;qPlinth(G,(x0+x1)/2,0,(z0+z1)/2,x1-x0+(W?0:.06)+(E?0:.06),z1-z0+(N?0:.06)+(S?0:.06),.14);
 qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.3,{moss:1});qTimber(G,x0,z0,x1,z1,.48,1.18,{skip:sk,brace:true,fill:'#e8d8b4'});
 const top=alongX?qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,1.18,QTC,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1}):qRoof(G,(x0+x1)/2,(z0+z1)/2,z1-z0,x1-x0,1.18,QTC,false,{ov0:N?0:.12,ov1:S?0:.12,g0:!N,g1:!S,side:(E||W)?0:.1});
 if(!S){const P=qP(G,1,.18,z1+.016,true,1);P(bW,0,0,0,.72,.66,.04,QW2);P(bW,-.17,0,.012,.32,.6,.04,QW1);P(bW,.17,0,.012,.32,.6,.04,QW1);P(bW,-.17,0,.032,.3,.03,.01,QW2);P(bW,.17,0,.032,.3,.03,.01,QW2);
  for(const a of[-.17,.17]){P(bW,a,.3,.032,.03,.42,.01,QW2)}P(bP,0,.3,.04,.6,.035,.01,QIR);qLamp(G,1.48,.98,z1+.09,false);qWin(G,.4,.62,z1+.016,true,1,{wood:1,shut:1});qWin(G,1.62,.62,z1+.016,true,1,{wood:1,shut:1});
  qBarrel(G,.36,1.8);qBarrel(G,.64,1.86);qCrate(G,1.42,1.8,0,.26);qCrate(G,1.7,1.84,0,.22);qCrate(G,1.47,1.8,.26,.2);bC(G,1.06,0,1.86,.2,.16,.16,'#cbb88a')}
 if(!N){qWin(G,.6,.66,z0-.016,true,-1,{wood:1,shut:1});qWin(G,1.4,.66,z0-.016,true,-1,{wood:1,shut:1})}
 if(!E)qWin(G,x1+.016,.66,(z0+z1)/2,false,1,{wood:1,shut:1});if(!W)qWin(G,x0-.016,.66,(z0+z1)/2,false,-1,{wood:1,shut:1});
 if(nw){const hy=top-.5;if(alongX){bW(G,x0-.22,hy,(z0+z1)/2,.56,.08,.08,QW2);bP(G,x0-.46,hy-.36,(z0+z1)/2,.015,.36,.015,ROPE);qCrate(G,x0-.46,(z0+z1)/2,hy-.62,.22);bW(G,x0-.05,hy-.3,(z0+z1)/2,.05,.32,.05,QW2)}
  else{bW(G,(x0+x1)/2,hy,z0-.22,.08,.08,.56,QW2);bP(G,(x0+x1)/2,hy-.36,z0-.46,.015,.36,.015,ROPE);qCrate(G,(x0+x1)/2,z0-.46,hy-.62,.22)}}
 return toGeo(G)}
/* ---- barracks: stone (slate roof) or timber (terracotta) hall with a training yard; merged halls get a watch turret ---- */
function mdBarracks(stone,m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m);
 const x0=W?0:.12,x1=E?2:1.88,z0=N?0:.14,z1=S?2:1.5;qPlinth(G,1,0,1,2,2,.14);
 if(stone){qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.92,{moss:1});if(!m)qQuoin(G,x0,z0,x1,z1,.18,.92);qCornice(G,(x0+x1)/2,1.1,(z0+z1)/2,x1-x0+.04,z1-z0+.04,.08)}
 else{qStone(G,(x0+x1)/2,.18,(z0+z1)/2,x1-x0,z1-z0,.25);qTimber(G,x0,z0,x1,z1,.43,1.1,{skip:sk,fill:'#e6d6b2'});bW(G,(x0+x1)/2,1.1,(z0+z1)/2,x1-x0,.08,z1-z0,QW2)}
 qTimber(G,x0,z0-(N?0:.07),x1,z1+(S?0:.07),1.18,1.7,{skip:sk,brace:true,fill:stone?'#e2d6bc':'#e6d6b2'});
 const top=qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0+(N?0:.07)+(S?0:.07),1.7,stone?QSL:WRF,true,{ov0:W?0:.12,ov1:E?0:.12,g0:!W,g1:!E,side:(N||S)?0:.1,fin:stone});
 if(!S){qDoor(G,1,z1+.016,true,1,{w:.42,h:.64,y:.18,wood:!stone});if(stone)qGem(G,1,1.0,z1+.02,true,1,.09);qBan(G,.42,1.04,z1,true,1);qBan(G,1.58,1.04,z1,true,1);qLamp(G,.72,.98,z1+.07,stone);qLamp(G,1.28,.98,z1+.07,stone);
  qWin(G,.55,1.32,z1+.086,true,1,{wood:1});qWin(G,1.45,1.32,z1+.086,true,1,{wood:1});
  for(const x of[.22,.72])bW(G,x,.14,1.8,.06,.56,.06,QW2);bW(G,.47,.6,1.8,.56,.05,.06,QW2);[.32,.47,.62].forEach(x=>{bM(G,x,.26,1.84,.035,.3,.02,'#dadde4');bM(G,x,.52,1.84,.1,.03,.03,QBR);bW(G,x,.55,1.84,.03,.07,.03,QW1)});
  bC(G,.88,.14,1.84,.08,.3,.24,BLU);bM(G,.925,.2,1.84,.01,.18,.06,QBR2);
  bW(G,1.55,.14,1.82,.06,.3,.06,QW2);bC(G,1.55,.32,1.82,.36,.36,.14,HAYC);bC(G,1.55,.34,1.893,.3,.3,.01,'#f0f0f0');bC(G,1.55,.39,1.896,.2,.2,.01,'#c8282a');bC(G,1.55,.44,1.899,.1,.1,.01,'#f0f0f0');bC(G,1.55,.47,1.902,.04,.04,.01,'#c8282a')}
 if(!N){qWin(G,.55,1.32,z0-.086,true,-1,{wood:1});qWin(G,1.45,1.32,z0-.086,true,-1,{wood:1});if(stone){qSlit(G,.45,.55,z0-.016,true);qSlit(G,1.55,.55,z0-.016,true)}}
 if(!W){if(stone)qSlit(G,x0-.016,.55,(z0+z1)/2,false);else qWin(G,x0-.016,.6,(z0+z1)/2,false,-1,{wood:1,shut:1})}
 if(!E){if(stone)qSlit(G,x1+.016,.55,(z0+z1)/2,false);else qWin(G,x1+.016,.6,(z0+z1)/2,false,1,{wood:1,shut:1})}
 if(nw){const tx=x0+.3,tz=z0+.3;if(stone){qRound(G,tx,tz,.18,3.1,.5,{moss:1});qRing(G,tx,tz,3.28,.62,.08,QTR);for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]]){bS(G,tx+a*.25,3.36,tz+b*.25,.12,.18,.12,QS[0]);bS(G,tx+a*.25,3.54,tz+b*.25,.14,.03,.14,QTR)}qRing(G,tx,tz,2.2,.56,.05,QBR,bM);qFlag(G,tx,3.36,tz,.8)}
  else{for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.2,.14,tz+b*.2,.1,3.0,.1,QLOG);bW(G,tx,3.0,tz,.6,.08,.6,QW2);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.27,3.08,tz+b*.27,.05,.3,.05,QW1);const t=qPyr(G,tx,tz,3.4,.72,.72,WRF,.14,.1);qFlag(G,tx,t,tz,.6)}}
 else if(!m)qFlag(G,1,top-.02,(z0+z1)/2);
 return toGeo(G)}
function barracksGeo(m){return mdBarracks(true,m)}
function woodBarracksGeo(m){return mdBarracks(false,m)}
/* ---- academy: limestone library with arched glowing windows, a portico and a copper roof; its tower becomes a hextech observatory when merged ---- */
function academyGeo(m){m=m||0;const G=newG(),{N,E,S,W,sk,nw}=mBits(m),alongX=!((N||S)&&!(E||W)),tw=!m||nw;
 const x0=W?0:.16,x1=E?2:1.84,z0=N?0:.3,z1=S?2:1.66;qPlinth(G,1,0,1,2,2,.16);
 qStone(G,(x0+x1)/2,.2,(z0+z1)/2,x1-x0,z1-z0,1.1);if(!m)qQuoin(G,x0,z0,x1,z1,.2,1.1);qCornice(G,(x0+x1)/2,1.3,(z0+z1)/2,x1-x0+.06,z1-z0+.06,.08);
 const top=alongX?qRoof(G,(x0+x1)/2,(z0+z1)/2,x1-x0,z1-z0,1.38,QCU,true,{ov0:W?0:.1,ov1:E?0:.1,g0:!W,g1:!E,side:(N||S)?0:.08,stone:1,fill:QS[2],fin:1}):qRoof(G,(x0+x1)/2,(z0+z1)/2,z1-z0,x1-x0,1.38,QCU,false,{ov0:N?0:.1,ov1:S?0:.1,g0:!N,g1:!S,side:(E||W)?0:.08,stone:1,fill:QS[2],fin:1});
 const wins=(n,ax,fixed,a0,a1)=>{for(let a=a0;a<=a1+1e-6;a+=.42){qWin(G,ax?a:fixed,.5,ax?fixed:a,ax,n,{glow:1,w:.18,h:.42})}};
 if(!S){wins(1,true,z1+.016,.36,.6);wins(1,true,z1+.016,1.4,1.64);bS(G,1,.2,z1+.12,.62,.06,.24,QTR);bS(G,1,.26,z1+.08,.52,.06,.16,QTR);
  for(const x of[.74,1.26]){bS(G,x,.32,z1+.14,.1,.9,.1,QTR);bS(G,x,1.2,z1+.14,.14,.06,.14,QTR)}bS(G,1,1.26,z1+.14,.68,.08,.18,QTR);qPyr(G,1,z1+.12,1.34,.72,.24,[QTR,QS[2]],.1,.08);
  qDoor(G,1,z1+.016,true,1,{y:.32,w:.3,h:.6});qGem(G,1,1.12,z1+.24,true,1,.09);qPost(G,.5,.2,z1+.24,.4,true);qPost(G,1.5,.2,z1+.24,.4,true)}
 if(!N)wins(-1,true,z0-.016,.4,1.6);if(!E)wins(1,false,x1+.016,z0+.25,z1-.25);if(!W&&!tw)wins(-1,false,x0-.016,z0+.25,z1-.25);
 if(tw){const tx=x0+.3,tz=z0+.3,H=nw?2.6:2.3;qRound(G,tx,tz,.2,H,.6,{moss:1});qRing(G,tx,tz,.2+H,.7,.08,QTR);qRing(G,tx,tz,1.5,.64,.05,QBR,bM);
  for(const a of[0,1])qWin(G,tx,1.1+a*.7,tz+.31,true,1,{glow:1,w:.12,h:.26});
  if(nw){const y=.28+H;qRing(G,tx,tz,y,.62,.1,QBR,bM);for(let k=0;k<4;k++){const r=.5-k*.11;qRing(G,tx,tz,y+.1+k*.13,r,.13,k%2?QCU[0]:QCU[2],bR)}bL(G,tx,y+.18,tz,.26,.3,.26,QHX);
   for(const[a,b]of[[-1,0],[1,0],[0,-1],[0,1]])bM(G,tx+a*.28,y+.1,tz+b*.28,.04,.5,.04,QBR);bM(G,tx,y+.66,tz,.08,.2,.08,QBR2);bL(G,tx,y+.86,tz,.07,.07,.07,QHX)}
  else{const t=qCone(G,tx,tz,.28+H,.72,QCU);bM(G,tx,t,tz,.06,.18,.06,QBR2);bL(G,tx,t+.18,tz,.07,.07,.07,QHX)}}
 return toGeo(G)}
/* ---- forester's hut: a mossy log cabin with a sapling nursery, a log pile and a chopping stump; front = +z ---- */
const QMOSS=['#5b7a3e','#4d6a35','#668845'];
function foresterGeo(hm){hm=hm|0;const G=newG();
 const wing=(a0,a1,b0,b1,ax)=>{const cx=(a0+a1)/2,cz=(b0+b1)/2,L=a1-a0,D=b1-b0;qStone(G,cx,.11,cz,L,D,.16);for(let k=0;k<5;k++){const y=.27+k*.14,c=k%2?QLOG:'#5d3f25';if(ax){bW(G,cx,y,b0+.04,L,.13,.09,c);bW(G,cx,y,b1-.04,L,.13,.09,c)}else{bW(G,a0+.04,y,cz,.09,.13,D,c);bW(G,a1-.04,y,cz,.09,.13,D,c)}}
  bW(G,cx,.97,cz,L,.05,D,QW2);qRoof(G,cx,cz,ax?L:D,ax?D:L,1.0,QMOSS,ax,{rise:.13,run:.12,fill:'#8a6a42',ov0:0,ov1:0,side:.08,ridge:QW2,g0:false,g1:false})};
 if(hm&2)wing(1.26,2,.36,.9,true);if(hm&8)wing(0,.22,.36,.9,true);if(hm&1)wing(.96,1.3,0,.32,false);if(hm&4)wing(.96,1.3,1.24,2,false);bP(G,1,0,1,2,.08,2,'#5f6f38');bP(G,1,.08,1,1.94,.03,1.94,'#6f8a44');
 /* cabin of horizontal logs */
 const x0=.18,x1=1.3,z0=.28,z1=1.28,xc=(x0+x1)/2,zc=(z0+z1)/2;qStone(G,xc,.11,zc,x1-x0+.08,z1-z0+.08,.16);
 for(let k=0;k<6;k++){const y=.27+k*.14,c=k%2?QLOG:'#5d3f25',L=x1-x0,D=z1-z0;bW(G,xc,y,z1-.04,L+(k%2?.12:0),.13,.09,c);bW(G,xc,y,z0+.04,L+(k%2?.12:0),.13,.09,c);bW(G,x0+.04,y,zc,.09,.13,D+(k%2?0:.12),c);bW(G,x1-.04,y,zc,.09,.13,D+(k%2?0:.12),c)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])for(let k=0;k<6;k+=2)bW(G,x,.27+k*.14,z,.12,.13,.12,QLOGT);
 qDoor(G,.6,z1+.016,true,1,{y:.27,w:.26,h:.5,wood:1,lamp:1});if(!(hm&4))qWin(G,1.02,.55,z1+.016,true,1,{wood:1,shut:1,glow:1,w:.16,h:.2});if(!(hm&8))qWin(G,x0-.016,.55,zc,false,-1,{wood:1,shut:1,glow:1,w:.16,h:.2});
 const rt=qRoof(G,xc,zc,x1-x0,z1-z0,1.11,QMOSS,true,{rise:.17,run:.13,fill:'#8a6a42',ov0:.1,ov1:.1,side:.12,ridge:QW2});
 qChim(G,.42,.52,.8,rt-.62);
 /* nursery: saplings in planters, the tallest at the back */
 for(let r=(hm&2)?2:0;r<3;r++)for(let c=0;c<2;c++){const x=1.55+c*.28,z=.42+r*.42,h=.16+(2-r)*.07+c*.03;bW(G,x,.11,z,.22,.1,.22,QW1);bP(G,x,.21,z,.18,.02,.18,'#4a3020');
  bW(G,x,.23,z,.03,h,.03,'#6b4a2c');bC(G,x,.23+h,z,.13,.11,.13,r===1?'#5fa845':'#4f9a3c');bC(G,x,.34+h,z,.07,.06,.07,'#6fbe52')}
 if(!(hm&2)){for(let k=0;k<=5;k++){bW(G,1.98,.11,.25+k*.3,.05,.22,.05,QW1)}bW(G,1.98,.26,1,.03,.04,1.55,QW3)}
 /* yard: log pile, chopping stump with an axe, a watering can */
 for(let k=0;k<3;k++){bW(G,.42+k*.17,.11,1.66,.16,.16,.42,QLOG);bW(G,.42+k*.17,.11,1.876,.12,.12,.012,QLOGT)}for(let k=0;k<2;k++){bW(G,.5+k*.17,.27,1.66,.16,.16,.42,QLOG);bW(G,.5+k*.17,.27,1.876,.12,.12,.012,QLOGT)}
 if(!(hm&4)){bW(G,1.25,.11,1.68,.24,.18,.24,'#7a5a34');bW(G,1.25,.29,1.68,.2,.01,.2,QLOGT);bW(G,1.25,.3,1.62,.03,.03,.2,'#9a6a34');bM(G,1.25,.33,1.71,.02,.08,.1,'#b9c0cc')}
 bM(G,1.62,.11,1.72,.12,.1,.09,QBR);bM(G,1.68,.17,1.72,.08,.02,.02,QBR2);
 return toGeo(G)}
/* ---- builders' guild: a timber workshop on a stone base, a treadwheel crane lifting a block, cut stone and planks in the yard ---- */
function guildGeo(hm){hm=hm|0;const G=newG();
 const wing=(a0,a1,b0,b1,ax)=>{const cx=(a0+a1)/2,cz=(b0+b1)/2,L=a1-a0,D=b1-b0;qStone(G,cx,.13,cz,L,D,.42);qTimber(G,a0,b0,a1,b1,.55,1.25,{brace:true,fill:'#e8d6b0',skip:ax?'EW':'NS'});bW(G,cx,1.25,cz,L,.06,D,QW2);
  qRoof(G,cx,cz,ax?L:D,ax?D:L,1.31,QSL,ax,{rise:.17,run:.13,ov0:0,ov1:0,side:.08,g0:false,g1:false})};
 if(hm&2)wing(1.31,2,.32,.9,true);if(hm&8)wing(0,.19,.32,.9,true);if(hm&1)wing(.95,1.3,0,.24,false);if(hm&4)wing(.95,1.3,1.26,2,false);qPlinth(G,1,0,1,2,2,.1);bS(G,1,.1,1,1.9,.03,1.9,QS[2]);
 const x0=.15,x1=1.35,z0=.2,z1=1.3,xc=(x0+x1)/2,zc=(z0+z1)/2;qStone(G,xc,.13,zc,x1-x0,z1-z0,.42);qQuoin(G,x0,z0,x1,z1,.13,.42);
 qTimber(G,x0,z0,x1,z1,.55,1.25,{brace:true,fill:'#e8d6b0'});bW(G,xc,1.25,zc,x1-x0+.08,.06,z1-z0+.08,QW2);qTimber(G,x0-.04,z0-.04,x1+.04,z1+.04,1.31,1.86,{fill:'#efe3c6',skip:'N'});
 const rt=qRoof(G,xc,zc,x1-x0+.08,z1-z0+.08,1.86,QSL,true,{rise:.2,run:.15,ov0:.12,ov1:.12,fin:1});
 qDoor(G,.55,z1+.016,true,1,{y:.13,w:.36,h:.62,wood:1,lamp:1});if(!(hm&4))qWin(G,1.08,.36,z1+.016,true,1,{wood:1,shut:1,box:1,w:.18,h:.18});
 qWin(G,.45,1.5,z1+.056,true,1,{wood:1,glow:1});qWin(G,1.05,1.5,z1+.056,true,1,{wood:1,glow:1});qWin(G,x1+.056,1.5,zc,false,1,{wood:1,glow:1});if(!(hm&2))qWin(G,x1+.016,.85,zc,false,1,{wood:1,shut:1});
 /* guild sign: crossed hammer and trowel over the door */
 const sy=.98;bW(G,.55,sy,z1+.1,.05,.05,.16,QW2);bW(G,.55,sy-.24,z1+.18,.3,.24,.03,QW1);bM(G,.55,sy-.24,z1+.2,.32,.26,.01,QBR);
 bM(G,.49,sy-.2,z1+.21,.04,.17,.012,QIR);bM(G,.49,sy-.06,z1+.21,.1,.05,.012,QIR);bM(G,.61,sy-.2,z1+.21,.04,.12,.012,QW3);bM(G,.61,sy-.08,z1+.21,.08,.07,.012,'#b9c0cc');
 /* treadwheel crane at the front right: the wheel faces the street, the jib reaches back over the stone pile */
 const cx=1.68,cz=1.66;bW(G,cx,.13,cz,.14,2.5,.14,QW2);for(const s of[-1,1])bW(G,cx+s*.26,.13,cz,.07,.72,.07,QW1);bW(G,cx,.82,cz,.6,.06,.08,QW2);
 for(let k=0;k<16;k++){const a=k/16*6.2832,r=.34;bW(G,cx+Math.cos(a)*r,.66+Math.sin(a)*r,cz+.1,.09,.09,.07,k%2?QW1:QW3)}
 for(let k=0;k<4;k++){const a=k/4*3.1416,c=Math.cos(a),n=Math.sin(a);bW(G,cx,.66-Math.abs(n)*.32,cz+.1,Math.abs(c)*.64+.04,Math.abs(n)*.64+.04,.04,QW3)}bM(G,cx,.62,cz+.14,.08,.08,.04,QIR);
 const jy=2.5;bW(G,cx,jy,cz-.42,.1,.09,1.04,QW2);bW(G,cx,jy-.44,cz-.2,.05,.46,.05,QW3);bW(G,cx,jy-.2,cz-.3,.05,.05,.26,QW3);bW(G,cx,jy+.09,cz-.92,.07,.07,.07,QW3);
 bP(G,cx,1.12,cz-.88,.015,jy-1.12,.015,'#c8b890');bM(G,cx,1.08,cz-.88,.06,.04,.06,QIR);qStone(G,cx,.82,cz-.88,.24,.24,.24,{ph:2});
 /* yard: cut stone blocks under the crane, a plank stack, a workbench with tools, scaffold poles */
 if(!(hm&2)){for(const[x,z,y]of[[1.56,.62,.13],[1.82,.6,.13],[1.69,.61,.33]])bS(G,x,y,z,.22,.2,.24,QS[(x*10|0)%4]);
 for(let k=0;k<4;k++)bW(G,1.7,.13+k*.05,.24,.5,.045,.14,k%2?QW3:QW1)}else for(const[x,z,y]of[[1.62,1.12,.13],[1.86,1.1,.13]])bS(G,x,y,z,.22,.2,.24,QS[(x*10|0)%4]);
 bW(G,.62,.13,1.72,.62,.04,.22,QW3);for(const s of[-1,1])bW(G,.62+s*.27,.13,1.72,.05,.26,.18,QW2);bW(G,.62,.39,1.72,.62,.04,.22,QW3);bM(G,.5,.43,1.72,.18,.03,.04,'#b9c0cc');bW(G,.72,.43,1.7,.04,.03,.18,QW1);
 if(!(hm&9)){for(const[x,z]of[[.06,.12],[.06,1.38],[1.42,.12]]){bW(G,x,.1,z,.05,2.1,.05,'#b08a58');for(const y of[.75,1.45])bW(G,x,y,z,.05,.03,.05,QW2)}
 for(const y of[.75,1.45]){bW(G,.06,y+.03,.75,.04,.03,1.26,'#b08a58');bW(G,.74,y+.03,.12,1.36,.03,.04,'#b08a58')}}
 return toGeo(G)}
/* ---- market: striped awnings over a counter of goods; merged stalls become one covered bazaar with a clock post ---- */
function marketGeo(m){m=m||0;const G=newG(),{N,E,S,W,nw}=mBits(m);bP(G,1,0,1,2,.1,2,'#a99a7e');for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i+j)%2)bS(G,.25+i*.5,.1,.25+j*.5,.48,.012,.48,QS[(i+j)%4]);
 const x0=W?0:.22,x1=E?2:1.78,z0=N?0:.34,z1=S?2:1.5,y1=1.32;
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])if(!((x===0||x===2)&&(z===0||z===2))&&!(x===0&&W)&&!(x===2&&E)&&!(z===0&&N)&&!(z===2&&S)){bW(G,x,.1,z,.1,y1+(z===z0?.3:0)-.1,.1,QW2);bM(G,x,.1,z,.14,.06,.14,QBR)}
 if(!N){for(let k=0;k<4;k++)bW(G,(x0+x1)/2,.1+k*.25,z0,x1-x0-.08,.24,.06,k%2?QW1:QW3)}
 if(!W)bW(G,x0,.1,(z0+z1)/2,.06,.5,z1-z0-.08,QW3);if(!E)bW(G,x1,.1,(z0+z1)/2,.06,.5,z1-z0-.08,QW3);
 const yt=y1+.3,ay=(z)=>yt-(z-z0)/(Math.max(.5,z1-z0+.36))*.5;
 for(let x=0;x<2-1e-6;x+=.25){const a=Math.max(x,x0-.1),b=Math.min(x+.25,x1+.1);if(b<=a)continue;const c=Math.round(x/.25)%2?'#f2ead8':'#b83a2b';
  for(let k=0;k<6;k++){const zz0=z0-.06+k*(z1-z0+.36)/6,zz1=zz0+(z1-z0+.36)/6;bC(G,(a+b)/2,ay((zz0+zz1)/2),(zz0+zz1)/2,b-a+.004,.05,zz1-zz0+.012,c)}
  if(!S){bC(G,(a+b)/2,ay(z1+.3)-.12,z1+.31,(b-a)*.72,.12,.03,c);bC(G,(a+b)/2,ay(z1+.3)-.16,z1+.31,(b-a)*.36,.05,.03,c)}}
 if(!S){bW(G,1,.1,z1-.06,x1-x0-.1,.42,.22,QW3);bW(G,1,.52,z1-.04,x1-x0+.02,.05,.3,QW2);
  bW(G,.5,.57,z1-.04,.32,.12,.22,QW1);for(let i=0;i<3;i++)for(let j=0;j<2;j++)bP(G,.4+i*.1,.69,z1-.09+j*.1,.07,.06,.07,(i+j)%2?'#c8282a':'#e04030');
  bC(G,.9,.57,z1-.04,.16,.22,.16,'#d8c08a');bC(G,.9,.79,z1-.04,.1,.06,.1,'#e8d29a');bC(G,1.18,.57,z1-.04,.2,.08,.2,'#3a5a9a');bC(G,1.18,.65,z1-.04,.2,.06,.2,'#7a3a8a');
  bM(G,1.5,.57,z1-.04,.04,.24,.04,QBR);bM(G,1.5,.81,z1-.04,.34,.03,.03,QBR);bM(G,1.36,.68,z1-.04,.12,.02,.12,QBR2);bM(G,1.64,.68,z1-.04,.12,.02,.12,QBR2);bM(G,1.36,.7,z1-.04,.06,.04,.06,'#ffd23c');
  qLamp(G,x1+.06,1.22,z1+.1,false);qLamp(G,x0-.06,1.22,z1+.1,false)}
 if(!E){qBarrel(G,1.86,.5,.1);qBarrel(G,1.86,.82,.1)}if(!W){qCrate(G,.12,.62,.1,.24);qCrate(G,.12,.66,.34,.18)}
 if(!m||nw){const sx=nw?x0+.12:1,sz=nw?z0+.12:z0;if(nw){bS(G,sx,.1,sz,.24,.12,.24,QSD);bM(G,sx,.22,sz,.08,2.0,.08,QBR);bM(G,sx,2.22,sz,.4,.4,.4,QBR);for(const[ax,n]of[[1,1],[1,-1],[0,1],[0,-1]]){const P=qP(G,sx,2.42,sz,ax,n);P(bP,0,-.15,.205,.28,.28,.01,'#f4ecd8');P(bP,0,-.03,.21,.02,.12,.01,QIR);P(bP,.04,-.02,.21,.1,.02,.01,QIR)}bM(G,sx,2.62,sz,.14,.14,.14,QBR2);qLamp(G,sx+.26,1.6,sz,true);qLamp(G,sx-.26,1.6,sz,true)}
  else{bW(G,1,1.86,z0,.06,.26,.06,QW2);bW(G,1,2.1,z0,.5,.06,.06,QW2);bW(G,1.15,1.82,z0+.04,.03,.28,.03,QW2);bW(G,1.15,1.62,z0+.04,.34,.22,.04,QW1);bM(G,1.15,1.67,z0+.07,.13,.13,.02,'#ffd23c');qFlag(G,x0,1.62,z0,.6)}}
 return toGeo(G)}
/* ---- torch: a brass brazier on a stone post ---- */
function torchGeo(){const G=newG();bS(G,0,0,0,.36,.1,.36,QSD);qStone(G,0,.1,0,.2,.2,.66);bS(G,0,.76,0,.26,.06,.26,QTR);bM(G,0,.82,0,.08,.36,.08,QBR);
 bM(G,0,1.18,0,.3,.05,.3,QBR);[[-.12,0,.03,.28],[.12,0,.03,.28],[0,-.12,.28,.03],[0,.12,.28,.03]].forEach(([x,z,w,d])=>bP(G,x,1.23,z,w,.16,d,QIR));
 bL(G,0,1.23,0,.2,.13,.2,'#ff8a2a');bL(G,0,1.36,0,.13,.11,.13,'#ffc040');bL(G,0,1.47,0,.06,.08,.06,'#fff1b0');return toGeo(G)}
/* ---- walls: limestone with a cornice and crenels / log palisade with iron bands ---- */
/* ---- v79 walls: a lower, wider wall with a clear wall walk (units stand on the deck), merlons on the edges only ---- */
const WALLH=1.45,WALLT=.74,WDH=1.42;
function wallGeo(m){const G=newG(),T=WALLT,H=WALLH;qPlinth(G,0,0,0,T+.12,T+.12,.14);qStone(G,0,.18,0,T,T,H-.18,{moss:1});
 for(const[bit,dx,dz]of DIRS)if(m&bit){qab(bS,G,dx,dz,.41,0,0,.2,T+.12,.18,QSD);for(let k=0;k<6;k++)qab(bS,G,dx,dz,.415,0,.18+k*(H-.18)/6,.19,T,(H-.18)/6,k===0?QMS:QS[(k+1)%4])}
 bS(G,0,H,0,T+.05,.07,T+.05,QTR);for(const[bit,dx,dz]of DIRS)if(m&bit)qab(bS,G,dx,dz,.41,0,H,.2,T+.05,.07,QTR);
 const e=T/2-.06;
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(const l of[-1,1]){qab(bS,G,dx,dz,.42,l*e,H+.07,.13,.12,.2,QS[0]);qab(bS,G,dx,dz,.42,l*e,H+.27,.15,.14,.03,QTR)}}
 for(const[bit,dx,dz]of[[1,0,-1],[2,1,0],[4,0,1],[8,-1,0]]){if(m&bit)continue;for(const l of[-1,1]){const a=dx?dx*e:l*e*.7,b=dx?l*e*.7:dz*e;bS(G,a,H+.07,b,.13,.2,.13,QS[0]);bS(G,a,H+.27,b,.15,.03,.15,QTR)}if(dx)qSlit(G,dx*(T/2+.005),.7,0,false);else qSlit(G,0,.7,dz*(T/2+.005),true)}
 for(const[bit,dx,dz]of DIRS)if(m&bit)qab(bS,G,dx,dz,.4,0,.92,.2,T+.012,.05,QTR);bS(G,0,.92,0,T+.012,.05,T+.012,QTR);
 for(const[bit,dx]of[[16,1],[32,-1]])if(m&bit){const x=dx*.5,z=.5,c=.5;qPlinth(G,x,0,z,c+.1,c+.1,.14);qStone(G,x,.18,z,c,c,H-.18,{moss:1});bS(G,x,H,z,c+.05,.07,c+.05,QTR);bS(G,x+dx*.13,H+.07,z+.13,.13,.2,.13,QS[0]);bS(G,x+dx*.13,H+.27,z+.13,.15,.03,.15,QTR);bS(G,x,.92,z,c+.012,.05,c+.012,QTR)}
 if(!(m&15))qPost(G,0,H+.07,0,.22,true);
 return toGeo(G)}
/* log palisade with a plank fighting deck on top and pointed stakes along both edges */
function woodWallGeo(m){const G=newG(),D=WDH,stake=(x,z,h)=>{bW(G,x,0,z,.13,h,.13,QLOG);bW(G,x,h,z,.09,.06,.09,QLOGT);bW(G,x,h+.06,z,.045,.05,.045,QLOGT)};
 for(const[a,b]of[[-.21,-.21],[.21,-.21],[-.21,.21],[.21,.21]])stake(a,b,D+.3+((a+b)>0?.04:0));
 for(const a of[-.07,.07])for(const b of[-.21,.21]){bW(G,a,0,b,.14,D,.14,QLOG);bW(G,b,0,a,.14,D,.14,QLOG)}
 bW(G,0,D,0,.5,.06,.5,QW3);for(let k=0;k<3;k++)bW(G,-.16+k*.16,D+.06,0,.012,.006,.5,QW2);
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(const t of[.3,.43])for(const l of[-.21,.21]){const x=dx?dx*t:l,z=dz?dz*t:l;stake(x,z,D+.3+(((t*10|0)+(l>0?1:0))%2)*.05)}
  for(const t of[.3,.43])for(const l of[-.07,.07])bW(G,dx?dx*t:l,0,dz?dz*t:l,.14,D,.14,QLOG);
  qab(bW,G,dx,dz,.375,0,D,.25,.5,.06,QW3);for(const y of[.42,1.0])for(const l of[-.21,.21])qab(bP,G,dx,dz,.36,l,y,.3,.05,.06,QIR)}
 for(const y of[.42,1.0])for(const[a,b]of[[-.21,0],[.21,0],[0,-.21],[0,.21]])bP(G,a,y,b,a?.05:.46,.06,a?.46:.05,QIR);
 for(const[bit,dx]of[[16,1],[32,-1]])if(m&bit){const x=dx*.5,z=.5;for(const[a,b]of[[-.13,-.13],[.13,-.13],[-.13,.13],[.13,.13],[0,0]])stake(x+a,z+b,D+.3+((a+b)>0?.05:0));for(const a of[-.07,.07])for(const b of[-.07,.07])bW(G,x+a,0,z+b,.14,D,.14,QLOG);bW(G,x,D,z,.4,.06,.4,QW3);for(const y of[.42,1.0])bP(G,x,y,z,.44,.06,.44,QIR)}
 if(!(m&15))qLamp(G,0,D+.5,0,false);
 return toGeo(G)}
/* ---- v79 gate: three tiles - two square towers and an arched passage in the middle with a wall walk over it ---- */
function gateGeo3(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*1.0;qPlinth(G,x,0,0,1.0,.98,.14);qStone(G,x,.18,0,.9,.9,2.44,{moss:1,ph:sg>0?1:0});qQuoin(G,x-.45,-.45,x+.45,.45,.18,2.44);
  qCornice(G,x,2.62,0,.98,.98,.08);bS(G,x,2.7,0,.94,.03,.94,QSD2);qMerl(G,x-.47,-.47,x+.47,.47,2.7,.24,.3);
  qSlit(G,x+sg*.455,1.2,0,false);qSlit(G,x,1.75,.455,true);qSlit(G,x,1.75,-.455,true);qWin(G,x+sg*.457,2.15,0,false,sg,{w:.13,h:.22,glow:1});
  qLamp(G,x-sg*.36,1.3,.5,true);qLamp(G,x-sg*.36,1.3,-.5,true);qGem(G,x,2.3,.455,true,1,.09);qGem(G,x,2.3,-.455,true,-1,.09)});
 qStone(G,0,1.5,0,1.12,.8,.72,{ph:2});bP(G,0,1.44,0,1.12,.06,.1,'#1b1a20');
 for(const sg of[-1,1]){bS(G,sg*.44,1.3,0,.14,.18,.82,QTR);bS(G,sg*.36,1.4,0,.1,.1,.82,QTR)}
 qCornice(G,0,2.22,0,1.12,.86,.08);bS(G,0,2.3,0,1.1,.03,.82,QSD2);
 qMerlL(G,-.44,.37,.44,.37,2.33,.22,.15);qMerlL(G,-.44,-.37,.44,-.37,2.33,.22,.15);
 qBan(G,0,2.2,.42,true,1,.3,.44);qBan(G,0,2.2,-.42,true,-1,.3,.44);bS(G,0,0,0,3.0,.05,.84,QSD2);return toGeo(G)}
function woodGateGeo3(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*1.0;for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,x+a*.36,0,b*.36,.17,2.75,.17,QLOG);bW(G,x+a*.36,2.75,b*.36,.11,.06,.11,QLOGT)}
  for(const s of[-1,1]){bW(G,x,0,s*.37,.62,1.9,.05,QW1);bW(G,x+s*.37,0,0,.05,1.9,.62,QW1)}for(const y of[.6,1.4])for(const s of[-1,1]){bP(G,x,y,s*.39,.8,.05,.03,QIR);bP(G,x+s*.39,y,0,.03,.05,.8,QIR)}
  bW(G,x,1.95,0,.94,.1,.94,QW3);for(const s of[-1,1]){bW(G,x,2.05,s*.45,.94,.36,.05,QW1);bW(G,x+s*.45,2.05,0,.05,.36,.94,QW1)}
  const t=qPyr(G,x,0,2.81,1.06,1.06,QSH,.1,.034);bW(G,x,t,0,.08,.1,.08,QW2);qLamp(G,x-sg*.3,1.25,.42,false);qLamp(G,x-sg*.3,1.25,-.42,false)});
 bW(G,0,1.46,0,1.2,.16,.5,QW2);bW(G,0,1.62,0,1.16,.28,.46,QLOG);bW(G,0,1.9,0,1.2,.06,.56,QW3);
 for(let i=0;i<5;i++){const x=-.4+i*.2;bW(G,x,1.96,.25,.12,.28+(i%2)*.08,.08,QLOG);bW(G,x,1.96,-.25,.12,.28+((i+1)%2)*.08,.08,QLOG)}
 qBan(G,0,1.56,.26,true,1,.26,.36);qBan(G,0,1.56,-.26,true,-1,.26,.36);bP(G,0,0,0,3.0,.05,.84,'#6a5a3a');return toGeo(G)}
/* ---- v79 towers: 2x2 keeps of their own (coordinates 0..2, centre 1,1) - four archers stand on the roof ---- */
const TT2S=3.55,TT2W=3.1;
const TSTB=[[.5,0],[1.5,0],[2,.5],[2,1.5],[.5,2],[1.5,2],[0,.5],[0,1.5]];
function towerStubs(G,m,wood){for(let i=0;i<8;i++){if(!(m&(1<<i)))continue;const sd=i>>1,ax=sd===0||sd===2,[px,pz]=TSTB[i],L=wood?.24:.2,cn=(ax?pz:px)===0?L/2-.01:2-L/2+.01,x=ax?px:cn,z=ax?cn:pz;
 if(wood){const D=WDH;for(const l of[-.21,-.07,.07,.21]){const a=ax?x+l:x,b=ax?z:z+l;bW(G,a,0,b,.14,D+(Math.abs(l)>.1?.3:0),.14,QLOG);if(Math.abs(l)>.1){bW(G,a,D+.3,b,.09,.06,.09,QLOGT)}}bW(G,x,D,z,ax?.5:L,.06,ax?L:.5,QW3);for(const y of[.42,1.0])bP(G,x,y,z,ax?.5:L+.02,.06,ax?L+.02:.5,QIR)}
 else{const T=WALLT,H=WALLH,w=ax?T:L,d=ax?L:T;bS(G,x,0,z,ax?T+.12:L,.18,ax?L:T+.12,QSD);qStone(G,x,.18,z,w,d,H-.18,{moss:1});bS(G,x,H,z,ax?T+.05:L,.07,ax?L:T+.05,QTR);bS(G,x,.92,z,ax?T+.012:L,.05,ax?L:T+.012,QTR);
  for(const l of[-1,1]){const e=T/2-.06,a=ax?x+l*e:x,b=ax?z:z+l*e;bS(G,a,H+.07,b,ax?.12:L,.2,ax?L:.12,QS[0]);bS(G,a,H+.27,b,ax?.14:L,.03,ax?L:.14,QTR)}}}}
function towerGeo2(m,op){const G=newG(),c=1,W=1.7,H=3.0;towerStubs(G,m|0,false);qPlinth(G,c,0,c,W+.2,W+.2,.18);qStone(G,c,.18,c,W,W,H,{moss:1});qQuoin(G,c-W/2,c-W/2,c+W/2,c+W/2,.18,H);
 for(const[x,z,ax,n]of[[c,c+W/2,true,1],[c,c-W/2,true,-1],[c+W/2,c,false,1],[c-W/2,c,false,-1]]){for(const o of[-.45,.45])qSlit(G,ax?x+o:x+n*.005,1.3,ax?z+n*.005:z+o,ax);qSlit(G,ax?x:x+n*.005,2.3,ax?z+n*.005:z,ax);qWin(G,ax?x-.42:x+n*.01,2.35,ax?z+n*.01:z-.42,ax,n,{w:.13,h:.24,glow:1});qWin(G,ax?x+.42:x+n*.01,2.35,ax?z+n*.01:z+.42,ax,n,{w:.13,h:.24,glow:1})}
 qDoor(G,c,c+W/2+.016,true,1,{y:.18,w:.42,h:.66});qRing(G,c,c,1.85,W+.06,.05,QBR,bM);
 for(let i=0;i<8;i++){const a=-W/2+.12+i*(W-.24)/7;bS(G,c+a,H+.04,c+W/2+.05,.1,.14,.1,QSD);bS(G,c+a,H+.04,c-W/2-.05,.1,.14,.1,QSD);bS(G,c+W/2+.05,H+.04,c+a,.1,.14,.1,QSD);bS(G,c-W/2-.05,H+.04,c+a,.1,.14,.1,QSD)}
 bS(G,c,H+.18,c,W+.2,.1,W+.2,QSD);qStone(G,c,H+.28,c,W+.26,W+.26,.22,{ph:2});qCornice(G,c,TT2S-.05,c,W+.3,W+.3,.05);
 qMerl(G,c-(W+.26)/2,c-(W+.26)/2,c+(W+.26)/2,c+(W+.26)/2,TT2S,.24,.3);
 if(!op){qCyl(G,bS,c,c,TT2S,.6,.62,QS[1]);qCorbR(G,c,c,TT2S+.62,.74,8);qTowR(G,c,c,TT2S+.6,.2,.74,{ph:2});qCyl(G,bC,c,c,TT2S+.8,.05,.78,BLU);const t=qSpire(G,c,c,TT2S+.85,.76,1.1,QSL,{band:2,eave:'#4c4846'});bM(G,c,t,c,.07,.09,.07,QBR2);qFlag(G,c,t+.09,c,.62);
  for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])qWin(G,c+a*.31,TT2S+.2,c+b*.31,a===0,a||b,{w:.1,h:.18,glow:1})}
 qLamp(G,c-.5,1.1,c+W/2+.08,true);qLamp(G,c+.5,1.1,c+W/2+.08,true);return toGeo(G)}
function woodTowerGeo2(m,op){const G=newG(),c=1,D=2.95;towerStubs(G,m|0,true);bS(G,c,0,c,1.9,.14,1.9,QSD);
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,c+a*.8,.14,c+b*.8,.2,D+.55,.2,QLOG);bW(G,c+a*.8,D+.69,c+b*.8,.13,.07,.13,QLOGT);for(const y of[.6,1.8])bP(G,c+a*.8,y,c+b*.8,.22,.04,.22,QIR)}
 for(const s of[-1,1]){bW(G,c,.14,c+s*.8,1.5,1.4,.06,QW1);bW(G,c+s*.8,.14,c,.06,1.4,1.5,QW1);for(const y of[1.5,2.4]){bW(G,c,y,c+s*.8,1.62,.08,.07,QW2);bW(G,c+s*.8,y,c,.07,.08,1.62,QW2)}
  for(let k=0;k<5;k++){const u=-.6+k*.3,y=1.6+k*.16;bW(G,c+u,y,c+s*.8,.18,.12,.05,QW2);bW(G,c+s*.8,y,c+u,.05,.12,.18,QW2)}}
 qDoor(G,c,c+.836,true,1,{y:.14,w:.4,h:.62,wood:1});
 bW(G,c,D,c,1.92,.1,1.92,QW3);bW(G,c,D-.1,c,1.7,.1,1.7,QW2);
 for(const s of[-1,1]){bW(G,c,D+.1,c+s*.94,1.92,.38,.05,QW1);bW(G,c+s*.94,D+.1,c,.05,.38,1.92,QW1);bW(G,c,D+.48,c+s*.945,1.96,.06,.06,QW2);bW(G,c+s*.945,D+.48,c,.06,.06,1.96,QW2)}
 if(!op){for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,c+a*.28,D+.1,c+b*.28,.09,.9,.09,QLOG);bW(G,c,D+.1,c,.4,.5,.4,QW1);const t=qPyr(G,c,c,D+1.0,.86,.86,QSH,.1,.04);qFlag(G,c,t,c,.6)}
 qLamp(G,c+.5,1.2,c+.86,false);qLamp(G,c-.5,1.2,c+.86,false);return toGeo(G)}
/* garrison height of a building: where its men really stand */
function gtopOf(s){const st=s.tier!==0;if(s.type==='wall')return st?WALLH+.07:WDH+.06;if(s.type==='gate')return (s.gl||2)===3?(st?2.72:2.05):2.1;if(s.type==='tower')return s.sz===2?(st?TT2S:TT2W+.02):(st?3.28:3.2);return GTOP[s.type]||2}
/* ---- towers ---- */
function qArms(G,m,H){for(const[bit,dx,dz]of DIRS)if(m&bit){for(let k=0;k<5;k++)qab(bS,G,dx,dz,.4,0,k*H/5,.2,2*WT,H/5,k===0?QSD:QS[k%4]);
 qab(bS,G,dx,dz,.4,0,H,.2,2*WT+.04,.07,QTR);for(const l of[1,-1]){qab(bS,G,dx,dz,.4,l*(WT-.05),H+.07,.12,.1,.2,QS[0]);qab(bS,G,dx,dz,.4,l*(WT-.05),H+.27,.13,.11,.035,QTR)}}}
function towerGeo(m,op){const G=newG();qArms(G,m,1.5);qPlinth(G,0,0,0,1.0,1.0,.16);qStone(G,0,.2,0,.8,.8,2.66,{moss:1});qQuoin(G,-.4,-.4,.4,.4,.2,2.66);
 for(const[a,b]of[[0,.4],[0,-.4],[.4,0],[-.4,0]]){const z=Math.abs(b)>0;qSlit(G,a+(z?.2:0),1.25,b,z);qSlit(G,a,2.25,b+(z?0:.2),z)}
 bW(G,0,.2,.405,.28,.48,.03,QW1);bS(G,0,.68,.405,.38,.06,.05,QTR);bS(G,0,.74,.41,.1,.07,.05,QTR);bM(G,.08,.42,.425,.035,.035,.02,QBR);
 qRing(G,0,0,1.72,.86,.05,QBR,bM);bS(G,0,2.86,0,.92,.08,.92,QSD);for(const[a,b]of[[-.42,-.42],[.42,-.42],[-.42,.42],[.42,.42],[0,-.44],[0,.44],[-.44,0],[.44,0]])bS(G,a,2.74,b,.1,.14,.1,QSD);
 bS(G,0,2.94,0,1.04,.1,1.04,QS[0]);bS(G,0,3.04,0,1.06,.2,1.06,QS[1]);qCornice(G,0,3.24,0,1.1,1.1,.05);
 if(op){[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]].forEach(([a,b])=>{bS(G,a,3.29,b,.14,.18,.14,QS[0]);bS(G,a,3.47,b,.16,.03,.16,QTR)})}
 else{for(const[a,b]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45],[0,-.45],[0,.45],[-.45,0],[.45,0]]){bS(G,a,3.29,b,.16,.2,.16,QS[0]);bS(G,a,3.49,b,.18,.03,.18,QTR)}
  bC(G,0,3.52,0,1.12,.06,1.12,BLU);bM(G,0,3.58,0,1.1,.03,1.1,QBR);const t=qPyr(G,0,0,3.61,1.06,1.06,QSL,.2,.1);bM(G,0,t,0,.08,.1,.08,QBR2);qFlag(G,0,t+.1,0,.62)}
 qLamp(G,0,1.0,.48,true);return toGeo(G)}
function woodTowerGeo(m,op){const G=newG();
 for(const[bit,dx,dz]of DIRS)if(m&bit){for(let k=0;k<2;k++){const t=.42;for(const l of[-.09,.09]){const x=dx?dx*t:l,z=dz?dz*t:l;bW(G,x,0,z,.16,WH-.05+(k?.1:0),.16,QLOG)}}qab(bP,G,dx,dz,.42,0,.42,.18,.46,.06,QIR);qab(bP,G,dx,dz,.42,0,1.12,.18,.46,.06,QIR)}
 bS(G,0,0,0,.96,.14,.96,QSD);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bW(G,a*.36,.14,b*.36,.16,2.96,.16,QLOG);bP(G,a*.36,.6,b*.36,.18,.04,.18,QIR);bP(G,a*.36,1.9,b*.36,.18,.04,.18,QIR)}
 for(const[a,b,ax]of[[0,.37,1],[0,-.37,1],[.37,0,0],[-.37,0,0]]){bW(G,a,.14,b,ax?.58:.04,1.06,ax?.04:.58,QW1);bW(G,a,1.2,b,ax?.6:.05,.07,ax?.05:.6,QW2);bW(G,a,2.1,b,ax?.6:.05,.07,ax?.05:.6,QW2)}
 for(const[a,b,ax]of[[0,.37,1],[0,-.37,1],[.37,0,0],[-.37,0,0]])for(let s=0;s<4;s++){const u=-.22+s*.15,y=1.3+s*.18;bW(G,ax?a+u:a,y,ax?b:b+u,ax?.14:.04,.16,ax?.04:.14,QW2)}
 bW(G,-.09,.14,.41,.03,2.9,.03,QW3);bW(G,.09,.14,.41,.03,2.9,.03,QW3);for(let y=.35;y<3;y+=.22)bW(G,0,y,.415,.18,.03,.03,QW3);
 bW(G,0,2.98,0,.9,.1,.9,QW2);bW(G,0,3.08,0,1.14,.12,1.14,QW3);
 for(const[a,b]of[[-.54,-.54],[.54,-.54],[-.54,.54],[.54,.54],[0,-.54],[0,.54],[-.54,0],[.54,0]])bW(G,a,3.2,b,.07,.32,.07,QW2);
 for(const s of[-1,1]){bW(G,s*.54,3.44,0,.05,.05,1.1,QW3);bW(G,0,3.44,s*.54,1.1,.05,.05,QW3)}
 if(!op){for(const[a,b]of[[-.5,-.5],[.5,-.5],[-.5,.5],[.5,.5]])bW(G,a,3.2,b,.08,.72,.08,QLOG);const t=qPyr(G,0,0,3.9,1.3,1.3,QTC,.17,.1);qFlag(G,0,t,0,.6)}
 qLamp(G,.3,1.1,.46,false);return toGeo(G)}
/* ---- gates ---- */
function gateGeo(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*.74;qPlinth(G,x,0,0,.62,.92,.14);qStone(G,x,.18,0,.52,.84,2.02,{moss:1,ph:sg>0?1:0});qQuoin(G,x-.26,-.42,x+.26,.42,.18,2.02);
  qCornice(G,x,2.2,0,.6,.92,.08);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){bS(G,x+a*.2,2.28,b*.37,.15,.24,.15,QS[0]);bS(G,x+a*.2,2.52,b*.37,.17,.035,.17,QTR)}
  qSlit(G,sg*1.005,1.2,0,false);qLamp(G,x-sg*.3,1.32,.47,true);qLamp(G,x-sg*.3,1.32,-.47,true);qGem(G,x,1.86,.425,true,1,.08);qGem(G,x,1.86,-.425,true,-1,.08)});
 qStone(G,0,1.42,0,.96,.84,.52,{ph:2});bP(G,0,1.36,0,.96,.06,.12,'#1b1a20');[-1,1].forEach(sg=>{bS(G,sg*.42,1.26,0,.12,.16,.84,QTR);bS(G,sg*.34,1.34,0,.08,.08,.84,QTR)});
 qCornice(G,0,1.94,0,.96,.9,.1);[-.34,0,.34].forEach(x=>{bS(G,x,2.04,.37,.14,.22,.14,QS[0]);bS(G,x,2.04,-.37,.14,.22,.14,QS[0]);bS(G,x,2.26,.37,.16,.03,.16,QTR);bS(G,x,2.26,-.37,.16,.03,.16,QTR)});
 qBan(G,0,1.9,.42,true,1,.28,.42);qBan(G,0,1.9,-.42,true,-1,.28,.42);bS(G,0,0,0,1.0,.05,.84,QSD2);return toGeo(G)}
function woodGateGeo(){const G=newG();
 [-1,1].forEach(sg=>{const x=sg*.78;for(const[a,b]of[[-.1,-.2],[.1,-.2],[-.1,.2],[.1,.2]]){const h=2.35+((a+b)>0?.08:0);bW(G,x+a,0,b,.17,h,.17,QLOG);bW(G,x+a,h,b,.12,.07,.12,QLOGT);bW(G,x+a,h+.07,b,.06,.06,.06,QLOGT)}
  for(const y of[.5,1.4])bP(G,x,y,0,.42,.07,.52,QIR);qLamp(G,x-sg*.26,1.12,.32,false);qLamp(G,x-sg*.26,1.12,-.32,false)});
 bW(G,0,1.42,0,1.2,.16,.5,QW2);bW(G,0,1.58,0,1.16,.3,.46,QLOG);bW(G,0,1.88,0,1.3,.08,.56,QW3);
 for(let i=0;i<7;i++){const x=-.6+i*.2;bW(G,x,1.96,.24,.12,.3+(i%2)*.08,.08,QLOG);bW(G,x,1.96,-.24,.12,.3+((i+1)%2)*.08,.08,QLOG)}
 qBan(G,0,1.56,.25,true,1,.26,.36);qBan(G,0,1.56,-.25,true,-1,.26,.36);bP(G,0,0,0,1.0,.05,.84,'#6a5a3a');return toGeo(G)}
function doorGeo(){const G=newG(),w=.92;for(let k=0;k<9;k++){const x=-w/2+.05+k*(w-.1)/8;bP(G,x,-1.3,0,.045,1.28,.05,QIR);bM(G,x,-1.4,0,.03,.1,.03,QBR)}
 for(const y of[-1.15,-.75,-.35])bP(G,0,y,0,w,.045,.06,QIR);bM(G,0,-.06,0,w,.06,.07,QBR);return toGeo(G)}
function doorGeoW(){const G=newG(),w=.92;for(let k=0;k<6;k++){const x=-w/2+w/12+k*w/6;bW(G,x,-1.3,0,w/6-.01,1.3,.07,k%2?QW1:QW3)}bW(G,0,-1.3,0,.03,1.3,.09,QW2);
 for(const y of[-1.1,-.42])bP(G,0,y,0,w,.07,.09,QIR);for(const x of[-.12,.12])bM(G,x,-.72,.05,.05,.05,.03,QBR);return toGeo(G)}
/* ---- castle helpers: round masonry from three boxes (a near-circular outline), smooth cones, merlon rings ---- */
function qCyl(G,f,x,z,y0,h,D,c){f(G,x,y0,z,D,h,D*.4,c);f(G,x,y0,z,D*.4,h,D,c);f(G,x,y0,z,D*.72,h,D*.72,c)}
function qTowR(G,x,z,y0,h,D,o){o=o||{};const n=Math.max(1,Math.round(h/.21)),q=h/n;for(let k=0;k<n;k++)qCyl(G,bS,x,z,y0+k*q,q,D,o.moss&&k===0?QMS:QS[(k+(o.ph|0))%4])}
function qSpire(G,x,z,y0,D,H,cols,o){o=o||{};const n=Math.max(3,Math.round(H/.1)),q=H/n,b=o.band||2;qCyl(G,bR,x,z,y0-.05,.07,D+.1,o.eave||cols[0]);
 for(let k=0;k<n;k++){const w=Math.max(.05,D*(1-(k+.35)/n)),c=cols[((k/b)|0)%cols.length];if(o.sq)bR(G,x,y0+k*q,z,w,q,w,c);else qCyl(G,bR,x,z,y0+k*q,q,w,c)}return y0+H}
function qMerlR(G,x,z,y,D,n,h){for(let k=0;k<n;k++){const a=(k+.5)/n*6.2832,r=D/2-.065,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;bS(G,px,y,pz,.13,h,.13,QS[k%2]);bS(G,px,y+h,pz,.15,.03,.15,QTR)}}
function qCorbR(G,x,z,y,D,n){for(let k=0;k<n;k++){const a=(k+.5)/n*6.2832,r=D/2-.01,px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;bS(G,px,y-.13,pz,.09,.13,.09,QSD);bS(G,px,y-.2,pz,.06,.07,.06,QSD2)}}
function qMerlL(G,x0,z0,x1,z1,y,h,step){const L=Math.hypot(x1-x0,z1-z0),n=Math.max(1,Math.round(L/step));for(let k=0;k<=n;k+=2){const t=k/n,px=x0+(x1-x0)*t,pz=z0+(z1-z0)*t;bS(G,px,y,pz,.14,h,.14,QS[(k/2)%2]);bS(G,px,y+h,pz,.16,.03,.16,QTR)}}
/* ---- castle (stone): a tall keep with a lantern belfry under a copper spire, four round towers with slate cones,
   crenellated curtain walls and a gatehouse with a portcullis; front = +z ---- */
function castleGeo(){const G=newG();qPlinth(G,1.5,0,1.5,3,3,.2);
 for(let i=0;i<6;i++)for(let j=0;j<6;j++)bS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=2.3;
 /* curtain walls between the towers (the gatehouse closes the front) */
 const cw=(x,z,w,d,ax)=>{qStone(G,x,.2,z,w,d,WT-.2,{moss:1});qCornice(G,x,WT,z,w+.05,d+.05,.07);bS(G,x,WT+.07,z,w,.025,d,QSD2)};
 cw(1.5,.2,1.3,.3);cw(.2,1.5,.3,1.3);cw(2.8,1.5,.3,1.3);
 qMerlL(G,.9,.09,2.1,.09,WT+.07,.22,.15);qMerlL(G,.09,.9,.09,2.1,WT+.07,.22,.15);qMerlL(G,2.91,.9,2.91,2.1,WT+.07,.22,.15);
 for(const z of[1.2,1.8])qSlit(G,.045,1.2,z,false),qSlit(G,2.955,1.2,z,false);
 /* round corner towers: the back pair taller */
 for(const[x,z]of[[.46,.46],[2.54,.46],[.46,2.54],[2.54,2.54]]){const bk=z<1.5,Ht=bk?3.55:3.05,D=.92,ox=x<1.5?-1:1,oz=z<1.5?-1:1;
  qCyl(G,bS,x,z,0,.22,D+.12,QSD);qTowR(G,x,z,.2,Ht-.2,D,{moss:1,ph:bk?1:0});qCyl(G,bM,x,z,1.75,.05,D+.02,QBR);
  qCorbR(G,x,z,Ht+.02,D+.14,10);qTowR(G,x,z,Ht,.32,D+.14,{ph:2});qCyl(G,bS,x,z,Ht+.32,.05,D+.18,QTR);qCyl(G,bC,x,z,Ht+.37,.05,D+.16,BLU);
  const t=qSpire(G,x,z,Ht+.42,D+.12,bk?1.85:1.6,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.08,.1,.08,QBR2);bP(G,x,t+.1,z,.035,.42,.035,QIR);bM(G,x,t+.5,z,.06,.06,.06,QBR2);
  qSlit(G,x+ox*(D/2+.005),1.25,z,false);qSlit(G,x,1.25,z+oz*(D/2+.005),true);qSlit(G,x+ox*(D/2+.005),2.35,z,false);qSlit(G,x,2.35,z+oz*(D/2+.005),true);
  qWin(G,x+ox*(D/2+.075),Ht+.08,z,false,ox,{w:.11,h:.16,glow:1});qWin(G,x,Ht+.08,z+oz*(D/2+.075),true,oz,{w:.11,h:.16,glow:1})}
 /* keep */
 const kx=1.5,kz=1.18,KW=1.34,KD=1.3,KH=4.45;qPlinth(G,kx,.2,kz,KW+.1,KD+.1,.1);qStone(G,kx,.3,kz,KW,KD,KH-.3,{ph:1});qQuoin(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.3,KH-.3);
 qCornice(G,kx,2.62,kz,KW+.06,KD+.06,.06);
 for(let i=0;i<7;i++){const a=-KW/2+.1+i*(KW-.2)/6;bS(G,kx+a,KH-.14,kz+KD/2+.04,.09,.14,.09,QSD);bS(G,kx+a,KH-.14,kz-KD/2-.04,.09,.14,.09,QSD);const b=-KD/2+.1+i*(KD-.2)/6;bS(G,kx+KW/2+.04,KH-.14,kz+b,.09,.14,.09,QSD);bS(G,kx-KW/2-.04,KH-.14,kz+b,.09,.14,.09,QSD)}
 qStone(G,kx,KH,kz,KW+.14,KD+.14,.24,{ph:3});qCornice(G,kx,KH+.24,kz,KW+.18,KD+.18,.05);bC(G,kx,KH+.29,kz,KW+.12,.04,KD+.12,BLU);
 qMerl(G,kx-KW/2-.06,kz-KD/2-.06,kx+KW/2+.06,kz+KD/2+.06,KH+.29,.2,.28);
 for(const[x,z,ax,n]of[[kx,kz+KD/2,true,1],[kx,kz-KD/2,true,-1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){
  qWin(G,ax?x-.3:x+n*.01,3.12,ax?z+n*.01:z-.3,ax,n,{w:.15,h:.34,glow:1});qWin(G,ax?x+.3:x+n*.01,3.12,ax?z+n*.01:z+.3,ax,n,{w:.15,h:.34,glow:1});
  qGem(G,ax?x:x+n*.012,3.62,ax?z+n*.012:z,ax,n,.1);qSlit(G,ax?x:x+n*.005,1.9,ax?z+n*.005:z,ax)}
 /* belfry lantern and copper spire */
 const by=KH+.29,BW=.74;qStone(G,kx,by,kz,BW,BW,.95,{ph:1});
 for(const[x,z,ax,n]of[[kx,kz+BW/2,true,1],[kx,kz-BW/2,true,-1],[kx+BW/2,kz,false,1],[kx-BW/2,kz,false,-1]])qWin(G,x+(ax?0:n*.01),by+.32,z+(ax?n*.01:0),ax,n,{w:.2,h:.34,glow:1});
 qCornice(G,kx,by+.95,kz,BW+.14,BW+.14,.07);bM(G,kx,by+1.02,kz,BW+.1,.03,BW+.1,QBR);
 const kt=qPyr(G,kx,kz,by+1.05,BW+.12,BW+.12,QCU,.19,.042);bM(G,kx,kt,kz,.1,.12,.1,QBR2);bP(G,kx,kt+.12,kz,.04,.7,.04,QIR);bM(G,kx,kt+.82,kz,.07,.07,.07,QBR2);
 /* gatehouse */
 const gz0=2.42,gz1=3.0,gx0=.9,gx1=2.1,GH=2.78,gzc=(gz0+gz1)/2,GW=gx1-gx0,GD=gz1-gz0;
 qStone(G,1.5,.2,gzc,GW,GD,GH-.2,{moss:1,ph:2});qQuoin(G,gx0,gz0,gx1,gz1,.2,GH-.2);
 for(let i=0;i<6;i++){const a=gx0+.1+i*(GW-.2)/5;bS(G,a,GH-.14,gz1+.04,.09,.14,.09,QSD);bS(G,a,GH-.2,gz1+.04,.06,.06,.06,QSD2)}
 qStone(G,1.5,GH,gzc+.02,GW+.04,GD+.1,.18,{ph:1});qCornice(G,1.5,GH+.18,gzc+.02,GW+.08,GD+.14,.05);
 qMerlL(G,gx0+.02,gz1+.04,gx1-.02,gz1+.04,GH+.23,.22,.14);qMerlL(G,gx0+.02,gz0+.02,gx1-.02,gz0+.02,GH+.23,.22,.14);
 /* the arch: dark opening, stone voussoirs, raised portcullis and oak doors inside */
 const ax0=1.5,aw=.6,ah=1.0,az=gz1+.005;bP(G,ax0,.2,az-.02,aw,ah,.06,'#18171c');bP(G,ax0,.2+ah,az-.02,aw*.78,.07,.06,'#18171c');bP(G,ax0,.27+ah,az-.02,aw*.5,.06,.06,'#18171c');
 for(const s of[-1,1]){bS(G,ax0+s*(aw/2+.05),.2,az,.1,ah,.05,QTR);bS(G,ax0+s*(aw/2+.01),.2+ah,az,.1,.08,.05,QTR);bS(G,ax0+s*(aw*.3),.27+ah,az,.12,.07,.05,QTR)}bS(G,ax0,.33+ah,az,aw*.44,.07,.05,QTR);bS(G,ax0,.4+ah,az+.005,.1,.09,.06,QTR);
 bW(G,ax0,.2,az-.1,aw-.02,ah-.02,.04,QW1);for(const a of[-aw/4,0,aw/4])bW(G,ax0+a,.2,az-.075,.02,ah-.04,.01,QW2);bP(G,ax0,.45,az-.07,aw-.04,.03,.01,QIR);bP(G,ax0,.95,az-.07,aw-.04,.03,.01,QIR);
 for(let i=0;i<6;i++)bP(G,ax0-aw/2+.06+i*(aw-.12)/5,.75,az-.035,.022,ah-.48,.022,QIR);bP(G,ax0,.75,az-.035,aw-.04,.022,.022,QIR);for(let i=0;i<6;i++)bM(G,ax0-aw/2+.06+i*(aw-.12)/5,.7,az-.035,.03,.05,.03,QBR);
 bS(G,ax0,.2,az+.12,aw+.24,.04,.26,QSD2);qBan(G,1.5,2.42,gz1+.04,true,1,.34,.62);qGem(G,1.5,2.52,gz1+.03,true,1,.09);
 for(const s of[-1,1]){qLamp(G,1.5+s*.45,1.36,gz1+.1,true);qSlit(G,1.5+s*.42,1.9,gz1+.005,true)}
 return toGeo(G)}
/* ---- castle (wood): a sharpened-log palisade, four watchtowers under shingle roofs, a gate with a fighting platform,
   and a timber great hall under a steep thatch roof ---- */
const QTH=['#c9a35c','#b8924c','#d4b06c'],QSH=['#6e5236','#5e4630','#7a5c3c'];
function woodCastleGeo(){const G=newG();bP(G,1.5,0,1.5,3,.2,3,'#5a4a32');bP(G,1.5,.2,1.5,2.92,.06,2.92,'#75664a');
 const pal=(x,z,h)=>{bW(G,x,.26,z,.21,h,.21,QLOG);bW(G,x,.26+h,z,.14,.08,.14,QLOGT);bW(G,x,.34+h,z,.07,.09,.07,QLOGT)};
 const hh=i=>1.4+((i*7)%3)*.09;
 for(let i=0;i<10;i++){const t=.15+i*.3;pal(t,.13,hh(i));if(t<2.2)pal(.13,t,hh(i+2)),pal(2.87,t,hh(i+4))}
 for(const t of[.93,2.07])pal(t,2.87,hh(t>1.5?1:3));
 for(const y of[.6,1.22]){bP(G,1.5,y,.13,2.94,.06,.26,QIR);bP(G,.13,y,1.2,.26,.06,2.0,QIR);bP(G,2.87,y,1.2,.26,.06,2.0,QIR)}
 /* front watchtowers */
 for(const x of[.42,2.58]){const z=2.58,P=1.95;
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.31,.2,z+b*.31,.16,P+.6,.16,QLOG);
  for(const y of[.8,1.45])for(const s of[-1,1]){bW(G,x+s*.31,y,z,.06,.06,.6,QW2);bW(G,x,y,z+s*.31,.6,.06,.06,QW2)}
  bW(G,x,P,z,.88,.1,.88,QW3);bW(G,x,P-.08,z,.72,.08,.72,QW2);
  for(const s of[-1,1]){bW(G,x+s*.41,P+.1,z,.05,.4,.82,QW1);bW(G,x,P+.1,z+s*.41,.82,.4,.05,QW1);bW(G,x+s*.415,P+.4,z,.05,.06,.86,QW2);bW(G,x,P+.4,z+s*.415,.86,.06,.05,QW2)}
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.39,P+.5,z+b*.39,.07,.36,.07,QLOG);
  const t=qPyr(G,x,z,P+.84,1.08,1.08,QSH,.095,.032);bW(G,x,t,z,.1,.12,.1,QW2);qLamp(G,x,P+.74,z,false)}
 /* gate: two big posts, a fighting platform with a little roof, oak doors */
 for(const s of[-1,1]){const x=1.5+s*.47;bW(G,x,.2,2.86,.24,2.1,.24,QLOG);bW(G,x,2.3,2.86,.18,.08,.18,QLOGT);qLamp(G,x+s*.2,1.15,3.02,false)}
 bW(G,1.5,1.58,2.86,1.22,.14,.36,QW2);bW(G,1.5,1.72,2.86,1.3,.06,.42,QW3);for(let i=0;i<6;i++)bW(G,1.04+i*.184,1.78,3.03,.08,.26+(i%2)*.05,.06,QLOG);
 qRoof(G,1.5,2.86,1.18,.5,2.08,QSH,true,{rise:.14,run:.16,fill:QW1});
 for(const s of[-1,1]){bW(G,1.5+s*.18,.26,2.88,.34,1.3,.08,QW1);for(const y of[.5,1.2])bP(G,1.5+s*.18,y,2.93,.34,.06,.03,QIR)}bW(G,1.5,.26,2.92,.03,1.3,.05,QW2);
 qBan(G,1.5,1.56,3.06,true,1,.28,.4);
 /* yard */
 qBarrel(G,.95,2.2,.26);qBarrel(G,1.12,2.32,.26);qCrate(G,2.05,2.25,.26,.22);qCrate(G,2.0,2.27,.48,.16);
 /* great hall: log walls, a steep thatch roof, crossed gable boards */
 const x0=.52,x1=2.48,z0=.42,z1=1.74,zc=(z0+z1)/2;qStone(G,1.5,.26,zc,x1-x0+.06,z1-z0+.06,.22);
 for(let k=0;k<7;k++){const y=.48+k*.155,c=k%2?QLOG:'#5d3f25';bW(G,1.5,y,z1-.045,x1-x0,.15,.09,c);bW(G,1.5,y,z0+.045,x1-x0,.15,.09,c);bW(G,x0+.045,y,zc,.09,.15,z1-z0,c);bW(G,x1-.045,y,zc,.09,.15,z1-z0,c)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])bW(G,x,.48,z,.16,1.1,.16,QLOGT);
 qDoor(G,1.5,z1+.016,true,1,{y:.48,w:.34,h:.6,wood:1,lamp:1});for(const x of[.92,2.08])qWin(G,x,.86,z1+.016,true,1,{wood:1,shut:1,glow:1});
 qWin(G,x0-.016,.86,zc,false,-1,{wood:1,shut:1,glow:1});qWin(G,x1+.016,.86,zc,false,1,{wood:1,shut:1,glow:1});
 const rt=qRoof(G,1.5,zc,x1-x0,z1-z0,1.565,QTH,true,{rise:.2,run:.115,fill:'#e2cfa4',ov0:.14,ov1:.14,side:.16,ridge:QW2});
 for(const s of[-1,1]){const gx=1.5+s*((x1-x0)/2+.14);for(const d of[-1,1]){bW(G,gx,rt-.2,zc+d*.1,.06,.34,.06,QW2);bW(G,gx,rt+.12,zc+d*.17,.06,.12,.06,QW3)}}
 qChim(G,2.12,.78,1.4,rt-1.25);
 /* lookout tower rising through the roof */
 const tx=1.5,tz=.95,TW2=.72,TB=2.75;bW(G,tx,1.5,tz,TW2,TB-1.5,TW2,QW1);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*TW2/2,1.5,tz+b*TW2/2,.12,TB-1.5+.06,.12,QLOG);
 for(const y of[2.1,2.7])bW(G,tx,y,tz,TW2+.04,.06,TW2+.04,QW2);qWin(G,tx,2.24,tz+TW2/2+.012,true,1,{wood:1,glow:1});qWin(G,tx+TW2/2+.012,2.24,tz,false,1,{wood:1,glow:1});qWin(G,tx-TW2/2-.012,2.24,tz,false,-1,{wood:1,glow:1});
 bW(G,tx,TB,tz,TW2+.24,.1,TW2+.24,QW3);for(const s of[-1,1]){bW(G,tx+s*.46,TB+.1,tz,.05,.34,.96,QW1);bW(G,tx,TB+.1,tz+s*.46,.96,.34,.05,QW1)}
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.45,TB+.44,tz+b*.45,.07,.36,.07,QLOG);qLamp(G,tx,TB+.66,tz,false);
 const tt=qPyr(G,tx,tz,TB+.78,1.16,1.16,QSH,.1,.03);bW(G,tx,tt,tz,.1,.1,.1,QW2);qFlag(G,tx,tt+.08,tz,.85);
 return toGeo(G)}
/* ---- keep (four merged towers) ---- */
/* ---- castle 5x5 (stone): a tall keep with a copper spire at the back, four round corner towers, square flank towers,
   crenellated curtain walls with a wall walk, a twin-turret gatehouse and a lived-in courtyard; front = +z ---- */
const C5={kx:2.5,kz:1.6,flag:8.9,wflag:6.2};
function castleGeo5(){if(PXON)return (window.__CV==='B'?pxCastleB:pxCastleA)(false);const G=newG();qPlinth(G,2.5,0,2.5,5,5,.2);
 for(let i=0;i<10;i++)for(let j=0;j<10;j++)bS(G,.25+i*.5,.2,.25+j*.5,.49,.025,.49,QS[(i*3+j*5)%4]);
 const WT=2.5,TH=.42;
 const cw=(x,z,w,d)=>{qStone(G,x,.2,z,w,d,WT-.2,{moss:1});qCornice(G,x,WT,z,w+.05,d+.05,.07);bS(G,x,WT+.07,z,w-.04,.025,d-.04,QSD2)};
 cw(2.5,.22,3.6,TH);cw(.22,2.5,TH,3.6);cw(4.78,2.5,TH,3.6);cw(1.08,4.78,1.0,TH);cw(3.92,4.78,1.0,TH);
 /* merlons on the outer edge only, so the wall walk stays clear */
 qMerlL(G,.95,.06,4.05,.06,WT+.07,.24,.16);qMerlL(G,.06,.95,.06,4.05,WT+.07,.24,.16);qMerlL(G,4.94,.95,4.94,4.05,WT+.07,.24,.16);qMerlL(G,.95,4.94,1.55,4.94,WT+.07,.24,.16);qMerlL(G,3.45,4.94,4.05,4.94,WT+.07,.24,.16);
 for(const z of[1.3,2.5,3.7]){qSlit(G,.005,1.3,z,false);qSlit(G,4.995,1.3,z,false)}for(const x of[1.6,3.4])qSlit(G,x,1.3,.005,true);
 /* round corner towers, the back pair taller */
 for(const[x,z]of[[.6,.6],[4.4,.6],[.6,4.4],[4.4,4.4]]){const bk=z<2.5,Ht=bk?4.0:3.5,D=1.15,ox=x<2.5?-1:1,oz=z<2.5?-1:1;
  qCyl(G,bS,x,z,0,.22,D+.14,QSD);qTowR(G,x,z,.2,Ht-.2,D,{moss:1,ph:bk?1:0});qCyl(G,bM,x,z,2.0,.05,D+.02,QBR);
  qCorbR(G,x,z,Ht+.02,D+.16,12);qTowR(G,x,z,Ht,.34,D+.16,{ph:2});qCyl(G,bS,x,z,Ht+.34,.05,D+.2,QTR);qCyl(G,bC,x,z,Ht+.39,.05,D+.18,BLU);
  const t=qSpire(G,x,z,Ht+.44,D+.14,bk?2.0:1.75,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.08,.1,.08,QBR2);bP(G,x,t+.1,z,.035,.42,.035,QIR);bM(G,x,t+.5,z,.06,.06,.06,QBR2);
  qSlit(G,x+ox*(D/2+.005),1.3,z,false);qSlit(G,x,1.3,z+oz*(D/2+.005),true);qSlit(G,x+ox*(D/2+.005),2.6,z,false);qSlit(G,x,2.6,z+oz*(D/2+.005),true);
  qWin(G,x+ox*(D/2+.085),Ht+.08,z,false,ox,{w:.12,h:.17,glow:1});qWin(G,x,Ht+.08,z+oz*(D/2+.085),true,oz,{w:.12,h:.17,glow:1})}
 /* square flank towers in the middle of each side wall */
 for(const s of[-1,1]){const x=2.5+s*2.28,z=2.5,W=.86,H=3.05;qPlinth(G,x,0,z,W+.12,W+.12,.2);qStone(G,x,.2,z,W,W,H-.2,{moss:1,ph:1});qQuoin(G,x-W/2,z-W/2,x+W/2,z+W/2,.2,H-.2);
  qCornice(G,x,H,z,W+.08,W+.08,.06);qMerl(G,x-W/2-.02,z-W/2-.02,x+W/2+.02,z+W/2+.02,H+.06,.2,.26);qSlit(G,x+s*(W/2+.005),1.5,z,false);qSlit(G,x+s*(W/2+.005),2.4,z,false);qWin(G,x-s*(W/2+.012),2.2,z,false,-s,{w:.14,h:.26,glow:1})}
 /* keep */
 const kx=C5.kx,kz=C5.kz,KW=2.0,KD=1.8,KH=5.0;qPlinth(G,kx,.2,kz,KW+.12,KD+.12,.12);qStone(G,kx,.32,kz,KW,KD,KH-.32,{ph:1});qQuoin(G,kx-KW/2,kz-KD/2,kx+KW/2,kz+KD/2,.32,KH-.32);
 qCornice(G,kx,2.9,kz,KW+.06,KD+.06,.06);
 for(let i=0;i<9;i++){const a=-KW/2+.1+i*(KW-.2)/8;bS(G,kx+a,KH-.14,kz+KD/2+.04,.09,.14,.09,QSD);bS(G,kx+a,KH-.14,kz-KD/2-.04,.09,.14,.09,QSD);const b=-KD/2+.1+i*(KD-.2)/8;bS(G,kx+KW/2+.04,KH-.14,kz+b,.09,.14,.09,QSD);bS(G,kx-KW/2-.04,KH-.14,kz+b,.09,.14,.09,QSD)}
 qStone(G,kx,KH,kz,KW+.14,KD+.14,.26,{ph:3});qCornice(G,kx,KH+.26,kz,KW+.18,KD+.18,.05);bC(G,kx,KH+.31,kz,KW+.12,.04,KD+.12,BLU);
 qMerl(G,kx-KW/2-.06,kz-KD/2-.06,kx+KW/2+.06,kz+KD/2+.06,KH+.31,.22,.28);
 for(const[x,z,ax,n]of[[kx,kz+KD/2,true,1],[kx,kz-KD/2,true,-1],[kx+KW/2,kz,false,1],[kx-KW/2,kz,false,-1]]){const L=ax?KW:KD;
  for(const o of[-.5,0,.5]){const w=o*L*.62;qWin(G,ax?x+w:x+n*.01,3.35,ax?z+n*.01:z+w,ax,n,{w:.16,h:.36,glow:1})}qWin(G,ax?x-.4:x+n*.01,1.6,ax?z+n*.01:z-.4,ax,n,{w:.15,h:.3,glow:1});qWin(G,ax?x+.4:x+n*.01,1.6,ax?z+n*.01:z+.4,ax,n,{w:.15,h:.3,glow:1});
  qGem(G,ax?x:x+n*.012,4.25,ax?z+n*.012:z,ax,n,.12)}
 qDoor(G,kx,kz+KD/2+.016,true,1,{y:.32,w:.5,h:.78});qBan(G,kx-.62,3.0,kz+KD/2+.04,true,1,.3,.7);qBan(G,kx+.62,3.0,kz+KD/2+.04,true,1,.3,.7);
 /* bartizans on the keep corners */
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]]){const x=kx+a*KW/2,z=kz+b*KD/2;qCorbR(G,x,z,KH-.3,.5,6);qTowR(G,x,z,KH-.3,.7,.46,{ph:1});const t=qSpire(G,x,z,KH+.4,.52,.7,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.05,.06,.05,QBR2)}
 /* belfry and copper spire */
 const by=KH+.31,BW=.9;qStone(G,kx,by,kz,BW,BW,1.05,{ph:1});
 for(const[x,z,ax,n]of[[kx,kz+BW/2,true,1],[kx,kz-BW/2,true,-1],[kx+BW/2,kz,false,1],[kx-BW/2,kz,false,-1]])qWin(G,x+(ax?0:n*.01),by+.34,z+(ax?n*.01:0),ax,n,{w:.22,h:.38,glow:1});
 qCornice(G,kx,by+1.05,kz,BW+.14,BW+.14,.07);bM(G,kx,by+1.12,kz,BW+.1,.03,BW+.1,QBR);
 const kt=qPyr(G,kx,kz,by+1.15,BW+.14,BW+.14,QCU,.19,.045);bM(G,kx,kt,kz,.1,.12,.1,QBR2);bP(G,kx,kt+.12,kz,.04,.6,.04,QIR);bM(G,kx,kt+.72,kz,.07,.07,.07,QBR2);C5.flag=kt+.8;
 /* gatehouse with two round turrets */
 const gx0=1.6,gx1=3.4,gz0=4.2,gz1=5.04,GH=3.1,gzc=(gz0+gz1)/2,GW=gx1-gx0,GD=gz1-gz0;
 qStone(G,2.5,.2,gzc,GW,GD,GH-.2,{moss:1,ph:2});qQuoin(G,gx0,gz0,gx1,gz1,.2,GH-.2);
 for(let i=0;i<8;i++){const a=gx0+.1+i*(GW-.2)/7;bS(G,a,GH-.14,gz1+.04,.09,.14,.09,QSD)}
 qStone(G,2.5,GH,gzc+.02,GW+.04,GD+.1,.18,{ph:1});qCornice(G,2.5,GH+.18,gzc+.02,GW+.08,GD+.14,.05);
 qMerlL(G,gx0+.02,gz1+.04,gx1-.02,gz1+.04,GH+.23,.22,.15);qMerlL(G,gx0+.02,gz0+.02,gx1-.02,gz0+.02,GH+.23,.22,.15);
 for(const s of[-1,1]){const x=2.5+s*1.0,z=gz1-.05,D=.62,H=3.5;qTowR(G,x,z,.2,H-.2,D,{moss:1,ph:1});qCorbR(G,x,z,H,D+.1,8);qTowR(G,x,z,H,.26,D+.1,{ph:2});const t=qSpire(G,x,z,H+.26,D+.1,1.1,QSL,{band:2,eave:'#4c4846'});bM(G,x,t,z,.06,.08,.06,QBR2);qSlit(G,x,1.6,z+D/2+.005,true);qSlit(G,x,2.6,z+D/2+.005,true)}
 const ax0=2.5,aw=.82,ah=1.25,az=gz1+.005;bP(G,ax0,.2,az-.02,aw,ah,.06,'#18171c');bP(G,ax0,.2+ah,az-.02,aw*.78,.08,.06,'#18171c');bP(G,ax0,.28+ah,az-.02,aw*.5,.07,.06,'#18171c');
 for(const s of[-1,1]){bS(G,ax0+s*(aw/2+.05),.2,az,.1,ah,.05,QTR);bS(G,ax0+s*(aw/2+.01),.2+ah,az,.1,.09,.05,QTR);bS(G,ax0+s*(aw*.3),.29+ah,az,.13,.08,.05,QTR)}bS(G,ax0,.35+ah,az,aw*.44,.08,.05,QTR);bS(G,ax0,.43+ah,az+.005,.12,.1,.06,QTR);
 bW(G,ax0,.2,az-.1,aw-.02,ah-.02,.04,QW1);for(const a of[-aw/3,0,aw/3])bW(G,ax0+a,.2,az-.075,.02,ah-.04,.01,QW2);bP(G,ax0,.5,az-.07,aw-.04,.03,.01,QIR);bP(G,ax0,1.1,az-.07,aw-.04,.03,.01,QIR);
 for(let i=0;i<7;i++)bP(G,ax0-aw/2+.07+i*(aw-.14)/6,.95,az-.035,.022,ah-.6,.022,QIR);bP(G,ax0,.95,az-.035,aw-.04,.022,.022,QIR);
 bS(G,ax0,.2,az+.14,aw+.3,.04,.3,QSD2);qBan(G,2.5,2.9,gz1+.04,true,1,.38,.7);qGem(G,2.5,2.0,gz1+.03,true,1,.1);
 for(const s of[-1,1])qLamp(G,2.5+s*.58,1.5,gz1+.1,true);
 /* courtyard: a well, a smithy lean-to, stacked supplies, a cart and lamp posts */
 {const x=1.35,z=3.35;qCyl(G,bS,x,z,.22,.32,.5,QSD);qCyl(G,bP,x,z,.5,.03,.34,'#2a4a6a');for(const s of[-1,1])bW(G,x+s*.22,.54,z,.05,.5,.05,QW2);bW(G,x,1.04,z,.56,.05,.08,QW2);qPyr(G,x,z,1.09,.62,.36,QSL,.08,.06);bP(G,x,.6,z,.02,.44,.02,'#c8b890');bW(G,x,.58,z,.1,.1,.1,QW3)}
 {const x=3.75,z=3.4;bW(G,x,.22,z-.36,1.0,1.0,.06,QW1);for(const s of[-1,1])bW(G,x+s*.46,.22,z+.1,.07,.8,.07,QW2);qRoof(G,x,z-.02,1.05,.82,1.02,QTC,true,{rise:.1,run:.2,g0:false,g1:false});
  bS(G,x-.2,.22,z-.1,.36,.3,.3,QSD);bL(G,x-.2,.52,z-.1,.16,.06,.16,QFI);bM(G,x+.22,.22,z,.12,.24,.12,QIR);bM(G,x+.22,.46,z,.3,.06,.14,QIR)}
 qBarrel(G,3.2,3.05,.22);qBarrel(G,3.35,2.85,.22);qCrate(G,1.7,2.75,.22,.26);qCrate(G,1.72,2.78,.48,.18);
 {const x=3.15,z=3.75;bW(G,x,.32,z,.46,.08,.28,QW3);for(const s of[-1,1])qCyl(G,bW,x+s*.16,z-.18,.2,.06,.22,QW2);bW(G,x,.34,z+.3,.04,.04,.4,QW2)}
 for(const[x,z]of[[1.7,4.05],[3.3,4.05]])qPost(G,x,.22,z,.55,true);
 return toGeo(G)}
/* ---- castle 5x5 (wood): sharpened-log palisade with a wall walk, four watchtowers, a gate with a fighting platform,
   a great hall with a lookout tower and a busy yard; front = +z ---- */
function woodCastleGeo5(){if(PXON&&window.__CV!=='B'){const r=pxCastleA(true);PXCW=false;return r}const G=newG();bP(G,2.5,0,2.5,5,.2,5,'#5a4a32');bP(G,2.5,.2,2.5,4.92,.06,4.92,'#75664a');
 const pal=(x,z,h)=>{bW(G,x,.26,z,.21,h,.21,QLOG);bW(G,x,.26+h,z,.14,.08,.14,QLOGT);bW(G,x,.34+h,z,.07,.09,.07,QLOGT)};
 const hh=i=>1.75+((i*7)%3)*.1;
 for(let i=0;i<17;i++){const t=.14+i*.295;pal(t,.13,hh(i));if(t>.6&&t<4.4){pal(.13,t,hh(i+2));pal(4.87,t,hh(i+4))}if((t<1.75||t>3.25)&&t>.6&&t<4.4)pal(t,4.87,hh(i+1))}
 for(const y of[.62,1.38]){bP(G,2.5,y,.13,4.9,.06,.26,QIR);bP(G,.13,y,2.5,.26,.06,4.0,QIR);bP(G,4.87,y,2.5,.26,.06,4.0,QIR)}
 /* wall walk inside the palisade */
 for(const[x,z,w,d]of[[2.5,.42,4.2,.32],[.42,2.5,.32,3.8],[4.58,2.5,.32,3.8]]){bW(G,x,1.5,z,w,.07,d,QW3);for(let k=0;k<7;k++){const t=k/6-.5;bW(G,w>d?x+t*w*.95:x,.26,w>d?z:z+t*d*.95,.09,1.24,.09,QW2)}}
 /* corner watchtowers */
 for(const[x,z]of[[.5,.5],[4.5,.5],[.5,4.5],[4.5,4.5]]){const P=2.25;
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.34,.2,z+b*.34,.17,P+.62,.17,QLOG);
  for(const y of[.85,1.6])for(const s of[-1,1]){bW(G,x+s*.34,y,z,.06,.06,.66,QW2);bW(G,x,y,z+s*.34,.66,.06,.06,QW2)}
  bW(G,x,P,z,.96,.1,.96,QW3);bW(G,x,P-.08,z,.78,.08,.78,QW2);
  for(const s of[-1,1]){bW(G,x+s*.45,P+.1,z,.05,.42,.9,QW1);bW(G,x,P+.1,z+s*.45,.9,.42,.05,QW1);bW(G,x+s*.455,P+.42,z,.05,.06,.94,QW2);bW(G,x,P+.42,z+s*.455,.94,.06,.05,QW2)}
  for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.43,P+.52,z+b*.43,.07,.4,.07,QLOG);
  const t=qPyr(G,x,z,P+.9,1.18,1.18,QSH,.1,.034);bW(G,x,t,z,.1,.12,.1,QW2);qLamp(G,x,P+.8,z,false)}
 /* gate */
 for(const s of[-1,1]){const x=2.5+s*.72;bW(G,x,.2,4.86,.3,2.5,.3,QLOG);bW(G,x,2.7,4.86,.22,.09,.22,QLOGT);qLamp(G,x+s*.24,1.3,5.04,false)}
 bW(G,2.5,1.85,4.86,1.7,.15,.42,QW2);bW(G,2.5,2.0,4.86,1.8,.06,.48,QW3);for(let i=0;i<9;i++)bW(G,1.7+i*.2,2.06,5.06,.09,.28+(i%2)*.06,.06,QLOG);
 qRoof(G,2.5,4.86,1.7,.56,2.42,QSH,true,{rise:.15,run:.16,fill:QW1});
 for(const s of[-1,1]){bW(G,2.5+s*.27,.26,4.88,.52,1.5,.08,QW1);for(const y of[.55,1.35])bP(G,2.5+s*.27,y,4.93,.5,.06,.03,QIR)}bW(G,2.5,.26,4.92,.03,1.5,.05,QW2);
 qBan(G,2.5,1.84,5.07,true,1,.3,.46);
 /* great hall */
 const x0=1.2,x1=3.8,z0=.75,z1=2.55,zc=(z0+z1)/2;qStone(G,2.5,.26,zc,x1-x0+.06,z1-z0+.06,.22);
 for(let k=0;k<8;k++){const y=.48+k*.155,c=k%2?QLOG:'#5d3f25';bW(G,2.5,y,z1-.045,x1-x0,.15,.09,c);bW(G,2.5,y,z0+.045,x1-x0,.15,.09,c);bW(G,x0+.045,y,zc,.09,.15,z1-z0,c);bW(G,x1-.045,y,zc,.09,.15,z1-z0,c)}
 for(const[x,z]of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]])bW(G,x,.48,z,.18,1.26,.18,QLOGT);
 qDoor(G,2.5,z1+.016,true,1,{y:.48,w:.42,h:.72,wood:1,lamp:1});for(const x of[1.65,3.35])qWin(G,x,.95,z1+.016,true,1,{wood:1,shut:1,glow:1});
 qWin(G,x0-.016,.95,zc,false,-1,{wood:1,shut:1,glow:1});qWin(G,x1+.016,.95,zc,false,1,{wood:1,shut:1,glow:1});
 const rt=qRoof(G,2.5,zc,x1-x0,z1-z0,1.72,QTH,true,{rise:.2,run:.115,fill:'#e2cfa4',ov0:.15,ov1:.15,side:.18,ridge:QW2});
 for(const s of[-1,1]){const gx=2.5+s*((x1-x0)/2+.15);for(const d of[-1,1]){bW(G,gx,rt-.2,zc+d*.1,.06,.34,.06,QW2);bW(G,gx,rt+.12,zc+d*.17,.06,.12,.06,QW3)}}
 qChim(G,3.3,1.1,1.6,rt-1.35);
 const tx=2.5,tz=1.25,TW2=.8,TB=3.2;bW(G,tx,1.7,tz,TW2,TB-1.7,TW2,QW1);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*TW2/2,1.7,tz+b*TW2/2,.12,TB-1.7+.06,.12,QLOG);
 for(const y of[2.4,3.0])bW(G,tx,y,tz,TW2+.04,.06,TW2+.04,QW2);qWin(G,tx,2.6,tz+TW2/2+.012,true,1,{wood:1,glow:1});qWin(G,tx+TW2/2+.012,2.6,tz,false,1,{wood:1,glow:1});qWin(G,tx-TW2/2-.012,2.6,tz,false,-1,{wood:1,glow:1});
 bW(G,tx,TB,tz,TW2+.26,.1,TW2+.26,QW3);for(const s of[-1,1]){bW(G,tx+s*.5,TB+.1,tz,.05,.36,1.04,QW1);bW(G,tx,TB+.1,tz+s*.5,1.04,.36,.05,QW1)}
 for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,tx+a*.49,TB+.46,tz+b*.49,.07,.38,.07,QLOG);qLamp(G,tx,TB+.7,tz,false);
 const tt=qPyr(G,tx,tz,TB+.84,1.26,1.26,QSH,.1,.03);bW(G,tx,tt,tz,.1,.1,.1,QW2);C5.wflag=tt+.08;
 /* yard: well, hay, woodpile, a hut with a workbench, crates and a cart */
 {const x=1.25,z=3.45;for(let k=0;k<8;k++){const a=k/8*6.283;bW(G,x+Math.cos(a)*.22,.26,z+Math.sin(a)*.22,.1,.28,.1,QLOG)}bP(G,x,.5,z,.32,.02,.32,'#2a4a6a');for(const s of[-1,1])bW(G,x+s*.24,.26,z,.05,.62,.05,QW2);bW(G,x,.88,z,.58,.05,.06,QW2);qPyr(G,x,z,.93,.6,.36,QSH,.08,.06)}
 {const x=3.85,z=3.45;bW(G,x,.26,z,.7,.6,.6,QW1);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1]])bW(G,x+a*.33,.26,z+b*.28,.08,.62,.08,QLOG);qRoof(G,x,z,.84,.74,.88,QTH,true,{rise:.16,run:.12,fill:'#e2cfa4'});qDoor(G,x,z+.31,true,1,{y:.26,w:.22,h:.42,wood:1})}
 for(let k=0;k<3;k++)bW(G,3.2,.26+k*.1,4.05,.6,.1,.18,k%2?QLOGT:QLOG);bW(G,1.85,.26,4.1,.36,.26,.3,'#d4b06c');bW(G,1.85,.52,4.1,.3,.1,.24,'#c9a35c');
 qBarrel(G,2.05,3.0,.26);qBarrel(G,3.0,2.95,.26);qCrate(G,1.9,3.1,.26,.24);
 return toGeo(G)}
function keepGeo(wd){const G=newG();
 if(!wd){qPlinth(G,1,0,1,2,2,.2);qStone(G,1,.2,1,1.8,1.8,3.2,{moss:1});qQuoin(G,.1,.1,1.9,1.9,.2,3.2);qRing(G,1,1,1.9,1.84,.05,QBR,bM);
  for(const[x,z,ax,n]of[[1,1.9,true,1],[1,.1,true,-1],[1.9,1,false,1],[.1,1,false,-1]]){qWin(G,x,2.3,z+n*.01,ax,n,{w:.22,h:.34,glow:1});qSlit(G,ax?x-.5:x+n*.01,1.3,ax?z+n*.01:z-.5,ax);qSlit(G,ax?x+.5:x+n*.01,1.3,ax?z+n*.01:z+.5,ax);qGem(G,ax?x:x+n*.012,2.85,ax?z+n*.012:z,ax,n,.1)}
  bS(G,1,3.4,1,1.94,.1,1.94,QSD);bS(G,1,3.5,1,2.0,.2,2.0,QS[1]);qCornice(G,1,3.7,1,2.04,2.04,.04);qMerl(G,0,0,2,2,3.74,.22,.3);
  for(const[x,z]of[[.22,.22],[1.78,.22],[.22,1.78],[1.78,1.78]]){qRound(G,x,z,3.5,.8,.5);qRing(G,x,z,4.3,.56,.05,BLU,bC);qRing(G,x,z,4.35,.56,.03,QBR,bM);const t=qCone(G,x,z,4.38,.58,QSL,.14);qFlag(G,x,t,z,.5)}
  qDoor(G,1,1.916,true,1,{y:.2,w:.36,h:.66,lamp:1,hex:1});qBan(G,.5,1.62,1.9,true,1);qBan(G,1.5,1.62,1.9,true,1)}
 else{bP(G,1,0,1,2,.2,2,'#5a4a32');for(let k=0;k<12;k++){const y=.2+k*.27,c=k%2?QLOG:'#58402a';bW(G,1,y,1,1.84,.27,1.7,c);bW(G,1,y,1,1.7,.27,1.84,c)}
  for(const[a,b]of[[.1,.1],[1.9,.1],[.1,1.9],[1.9,1.9]]){bW(G,a,.2,b,.22,3.3,.22,QLOGT);for(const y of[.9,2.2])bP(G,a,y,b,.24,.05,.24,QIR)}
  bW(G,1,3.44,1,2.04,.12,2.04,QW3);for(let i=0;i<9;i++){const t=.1+i*.225;for(const[x,z]of[[t,.04],[t,1.96],[.04,t],[1.96,t]])bW(G,x,3.56,z,.08,.3,.08,QW2)}
  for(const[x,z]of[[.22,.22],[1.78,.22],[.22,1.78],[1.78,1.78]]){const t=qPyr(G,x,z,3.86,.62,.62,QTC,.14,.08);qFlag(G,x,t,z,.5)}
  qDoor(G,1,1.936,true,1,{y:.2,w:.34,h:.62,wood:1,lamp:1});for(const x of[.5,1.5])qWin(G,x,1.6,1.936,true,1,{wood:1,shut:1});qBan(G,1,2.6,1.92,true,1,.3,.5)}
 return toGeo(G)}

