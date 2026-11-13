import { newG } from '../geometry.js';
import { PD, pxBox, pxCat, pxRot, pxScene, shadeHex } from './pixel-geometry.js';
import { VX } from './unit-parts.js';
import { zSpec } from './zombies.js';

/* ================= MUTANTS, look B: monstrosities (docs/studio-boards/mutants, switch MUT2_ON in mutant-style.js) =================
   Same rig as every unit (torso G, head HG, right arm AG, left arm LA, one leg LG drawn twice) and the same pivots, so the animation code
   is untouched: only the boxes change. Each type is a deformed body that tells its role, readable by its outline alone:
   brute   one overgrown arm, hump with bone spikes, withered other arm        accent: raw red flesh
   runner  gaunt, bent double, long snout skull, arms ending in bone blades     accent: ash white, blood-red forearms
   bomber  a keg grown into a bloated body, the belly split by a glowing crack  accent: orange glow
   acid    throat sac, sacs on the back, unhinged dripping jaw                  accent: lime glow
   miner   rock and crystals grown over the body, lantern eye, pick forearm     accent: amber lantern, cyan crystals
   husk    dried and split in two from the skull down, linen grown into it      accent: pale linen, one pale eye
   boss    horned skull with a broken crown, a second maw in the chest, rib claws arching over the shoulders, two bladed arms  accent: violet
   Units are pixels (b: corner to corner). Glow = material 5 (emissive in the unit shader), no light is added. Visual only. */

const hx=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,c,t)=>{const A=hx(a),B=hx(c);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')};
const N=(k,u,v)=>{const x=Math.sin(u*12.9898+v*78.233+k*37.719)*43758.5453;return x-Math.floor(x)};

function arms2(P,fR,fL){const TR=newG(),TL=newG();pxScene(()=>fR(TR));pxScene(()=>fL(TL));pxCat(P.AG,TR);pxCat(P.LA,TL,p=>[-p[0]-2.76*VX,p[1]+10.45*VX,p[2]],q=>[-q[0],q[1],q[2]],true)}

export function pxMutant(kind,type,ZV,P){
 const S=zSpec(type,ZV?ZV.v:0,null),sd=S.seed>>>0,K=sd%97,C=PD,PP=a=>a.map(C);
 const b=(G,x0,y0,z0,x1,y1,z1,p,o)=>{o=o||{};const g=o.g||[Math.max(1,Math.round(x1-x0)),Math.max(1,Math.round(y1-y0)),Math.max(1,Math.round(z1-z0))];pxBox(G,x0,y0,z0,x1-x0,y1-y0,z1-z0,p,{mat:o.m||0,grid:g,ao:o.ao!==false&&o.m!==5})};
 /* materials: [dark, base, light]; blotches of the dark tone, specks of the light one, dark hem and lit top row on tall faces */
 const tone=(Pl,k,o)=>{o=o||{};const bl=o.bl===undefined?.2:o.bl,hl=o.hl===undefined?.1:o.hl;return(f,u,v,W,H)=>{if(f==='D')return Pl[0];const fc=f.charCodeAt(0),q=N(k+fc,u>>1,v>>1),n=N(k+fc+3,u,v);
  let c=q<bl?Pl[0]:n>1-hl?Pl[2]:Pl[1];if(f!=='T'&&H>=5){if(v===0)c=Pl[0];else if(v===H-1&&c===Pl[1])c=Pl[2]}return c}};
 const over=(base,fn)=>(f,u,v,W,H)=>{const r=fn(f,u,v,W,H,H-1-v);return r===undefined?base(f,u,v,W,H):r};
 const bev=Pl=>(f,u,v,W,H)=>f==='T'||v===H-1?Pl[2]:(f==='D'||v===0?Pl[0]:Pl[1]);
 const flat=c=>()=>c;
 const glw=(a,c,k)=>(f,u,v,W,H)=>{if(f==='T')return c;const e=u===0||v===0||u===W-1||v===H-1;return e&&(W>2||H>2)?a:(N(k||1,u,v)<.3?a:c)};
 const sk3=(hue,t)=>PP([mix(S.sk[1],shadeHex(hue,.7),t),mix(S.sk[0],hue,t),mix(S.sk[2],shadeHex(hue,1.28),t)]);
 const BN=PP(['#8e8264',S.bn[1],S.bn[0]]),BNH=C('#f4eed8'),FL=PP(['#5e1612','#96281e','#c8442f']),IR=PP(['#2c2826','#544e48','#88827a']),DK=C('#150d0a'),
  ST=PP(['#484c54','#6e737c','#989ea6']),WD=PP(['#3a2512','#684422','#8e6434']),LN=PP(['#8a7e5e','#bfb18c','#e2d6b2']);
 const bone=bev(BN),iron=bev(IR),EYE=C(S.eye);
 const{G,HG,LG}=P;
 const ground=()=>pxBox(LG,-30,-40,-30,60,28,60,()=>null,{only:true});

 /* ---------------- BRUTE ---------------- */
 if(kind==='brute'){const SK=sk3('#735a78',.62),SKD=[shadeHex(SK[0],.8),SK[0],SK[1]],skin=tone(SK,K,{bl:.13,hl:.05}),dskin=tone(SKD,K+5,{bl:.13,hl:.05}),flesh=over(tone(FL,K+9,{bl:.2,hl:.08}),(f,u,v)=>f!=='T'&&f!=='D'&&v%3===2?FL[0]:undefined);
  pxScene(()=>{
   /* a waist that hangs below the hips, a chest pushed to the big arm's side, two humps with bone spikes */
   b(G,-4.5,10,-2.6,4.5,17,2.6,over(skin,(f,u,v,W,H,r)=>r>=H-3&&f!=='T'?(N(K+2,u,0)<.5&&r===H-3?undefined:C('#4a3a26')):undefined));
   b(G,-5.5,16,-3.6,7.6,25,4,over(skin,(f,u,v,W,H,r)=>{if(f==='F'&&u<=5&&r>=1&&r<=7){if(u===0||u===5||r===1||r===7)return FL[0];return r%2?BN[1]:DK}if(f==='F'&&u>=8&&r>=3&&(u+r)%5===0)return FL[1]}));
   b(G,0,23,-6.6,8.6,29,.6,over(skin,(f,u,v,W,H,r)=>f==='T'&&u>=2&&u<=6&&v>=2&&v<=5?((u+v)%2?FL[1]:FL[2]):f==='B'&&r<=1&&u>=2&&u<=6?FL[1]:undefined));
   b(G,-4.4,22,-5.6,1,26.6,-1.4,dskin);
   b(G,2,28.6,-5,3.6,32.6+(sd&1),-3.4,bone);b(G,4.8,28.6,-3.4,6.4,34.4,-1.8,bone);b(G,6.4,27,-8,8,29,-6,bone);b(G,-2.6,26.2,-4.6,-1.2,29.4,-3.2,bone);
   b(G,-6.4,18.6,3.4,-1,19.7,4.8,bone,{g:[5,1,1]});b(G,-6.4,21.2,3.4,-1.6,22.3,4.8,bone,{g:[5,1,1]});
   b(G,7.5,17,-2.2,8.3,24,3,flesh,{g:[1,7,5]});
   /* small head sunk into the chest on the weak side: heavy brow, underbite with tusks, one big eye */
   b(HG,-4.6,22.6,.6,1.6,28.6,7,over(skin,(f,u,v,W,H,r)=>{if(f==='F'){if(r===2&&u>=3&&u<=4)return DK;if(r===2&&u===1)return DK;if(r>=4)return u%2?DK:FL[0]}if(f==='T'&&(u+v)%4===0)return FL[1]}));
   b(HG,-4.9,27.2,6.4,1.9,28.6,7.8,dskin,{g:[7,1,1]});
   b(HG,-5.1,20.6,2.6,2.1,23.4,8.2,over(dskin,(f,u,v,_W,_H,_r)=>f==='T'&&v<=1?DK:undefined));
   b(HG,-4.9,23.4,7,-3.7,26.2,8.2,bone);b(HG,.7,23.4,7,1.9,25.6,8.2,bone);
   b(HG,-1.4,25.4,7,.4,26.9,7.16,flat(C('#ffb02a')),{m:5});b(HG,-3.7,25.8,7,-2.9,26.6,7.14,flat(EYE),{m:5});
   /* thick legs, clawed feet */
   b(LG,-2.6,-12,-2.6,2.6,0,2.8,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r<=3&&N(K+4,u,r)<(r<2?1:.5)?C('#4a3a26'):f!=='T'&&r>=10?SKD[0]:undefined));
   b(LG,-2.9,-12,-2.4,2.9,-10.4,4,dskin);for(const x of[-2.2,-.5,1.2])b(LG,x,-12,4,x+1,-11.2,5.1,bone);ground()});
  arms2(P,T=>{/* the overgrown arm: shoulder mass, skinned upper arm, plated forearm, a fist that reaches the knees */
   b(T,-2.6,-4,-3.6,5.6,3,3.6,skin);b(T,-2,-9.4,-3,4.6,-3.6,3,flesh);
   b(T,-2.6,-16,-4,6,-8.6,4,over(dskin,(f,u,v,W,H,r)=>(f==='R'||f==='F')&&r>=1&&r<=5&&u>=1&&u<=W-2&&(r!==3)?BN[(u+r)%3?1:2]:undefined));
   b(T,-3,-20.4,-4.6,6.6,-15.4,5,over(dskin,(f,u,v,W,H,r)=>f==='F'&&r>=3&&u%2?DK:undefined));
   for(const x of[-2.2,.6,3.4])b(T,x,-21.2,3.6,x+2,-19,5.8,bone);
   b(T,5.8,-13.4,-1,8,-11.8,.8,bone);b(T,5.8,-10.6,-.8,7.4,-9.4,.6,bone);b(T,.2,-9.4,-5.6,1.8,-6.2,-2.8,bone);
   b(T,.6,3,-1.2,2.2,5.4,.4,bone);b(T,3.2,3,.2,4.6,4.6,1.6,bone)},
  T=>{/* the other arm withered to the bone, still wearing its shackle and chain */
   b(T,-1.5,-9.6,-1.5,1.5,0,1.5,dskin);b(T,-1,-15,-1,1,-9.4,1,bone);b(T,-2,-11.6,-2,2,-9.8,2,iron);
   for(let i=0;i<3;i++)b(T,-.5,-13.2-i*1.5,1.9,.5,-12-i*1.5,2.6,flat(IR[i%2?0:2]),{m:4,ao:false});
   b(T,-1,-17.6,-.4,-.3,-15,.4,bone);b(T,.3,-17,-.4,1,-15,.4,bone)});
  return}

 /* ---------------- BOSS ---------------- */
 if(kind==='boss'){const SK=PP(['#342f3c','#544c5e','#766c84']),SKD=[shadeHex(SK[0],.78),SK[0],SK[1]],skin=tone(SK,K),dskin=tone(SKD,K+5),VI=C('#b04aff'),VL=C('#e2b0ff'),
   GO=PP(['#7a5a14','#c49a2e','#f0cc5c']),FLG=C(['#8a1c1c','#5a2a7a','#1c5a4a','#8a5a1c','#2a3a7a','#6a1c4a'][(ZV&&ZV.v|0)%6]),FLD=shadeHex(FLG,.7),
   vein=(k,p)=>(f,u,v)=>f==='F'&&N(k,u>>1,v)<p&&N(k+1,u,v)<.6?VI:null;
  pxScene(()=>{
   b(G,-5,9.6,-3,5,16,3,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r>=H-3?(r===H-3&&u%3===1?undefined:IR[r===H-3?2:1]):undefined));
   b(G,-7.6,15,-4,7.6,25.6,4.6,skin);
   /* the second maw: lips of raw flesh, a glowing gullet, teeth closing from both sides */
   b(G,-3.8,15.2,4.4,-2.2,24.6,5.3,tone(FL,K+3),{g:[2,9,1]});b(G,2.2,15.2,4.4,3.8,24.6,5.3,tone(FL,K+4),{g:[2,9,1]});
   b(G,-2.2,15.6,4.5,2.2,24.2,4.9,flat(DK),{g:[1,1,1],ao:false});b(G,-1,16.6,4.9,1,23.2,5.1,(f,u,v,_W,_H)=>v%3===1?VL:VI,{m:5,g:[2,7,1]});
   for(let i=0;i<4;i++){b(G,-2.6,16.4+i*2,4.6,-.6,17.4+i*2,6.2,bone,{g:[2,1,1]});b(G,.6,17.4+i*2,4.6,2.6,18.4+i*2,6.2,bone,{g:[2,1,1]})}
   b(G,-7.6,15,4.62,7.6,25.6,4.7,vein(K+11,.2),{m:5,g:[15,10,1]});
   /* rib claws arching over the shoulders, spine spikes, the torn banner of the fallen leader */
   for(const s of[-1,1])for(const[x,z,h,l]of[[4.2,-5.4,32.4,7],[7.2,-4.6,30,5.4]]){const x0=s>0?x:-x-1.5;b(G,x0,22,z,x0+1.5,h,z+1.5,bone);b(G,x0,h-1.4,z+1.5,x0+1.5,h,z+l,bone);b(G,x0,h-3.6,z+l-1.4,x0+1.5,h-1.4,z+l,bone)}
   for(let i=0;i<3;i++)b(G,-.8,17+i*3.6,-5.6-(i===1?1:0),.8,18.8+i*3.6,-3.8,bone);
   b(G,-.5,13,-5.4,.5,40,-4.4,(f,u,v)=>v%6===0?WD[0]:WD[1],{g:[1,13,1]});
   b(G,-.5,28.5,-5.2,6.5,39.5,-4.6,(f,u,v,W,H)=>(v<2&&u%3===1)||(v<4&&N(K+8,u,v)<.25)?null:v===H-1?GO[1]:((u===2||u===3)&&(v===6||v===7))||((u===1||u===4)&&v===5)?C('#e6dcc4'):(u%3===0?FLD:FLG),{g:[6,10,1],ao:false});
   /* a bare skull under a broken crown, long horns, an iron jaw */
   b(HG,-3.6,24.4,0,3.6,31,7,over(tone(BN,K+6,{bl:.14}),(f,u,v,W,H,r)=>{if(f==='F'){if((r===2||r===3)&&(u===1||u===2||u===4||u===5))return DK;if(r===4&&u===3)return DK;if(r>=5)return u%2?BN[0]:BN[2]}}));
   for(const s of[-1,1]){const xe=s>0?.7:-2.3;b(HG,xe,27.2,7,xe+1.6,28.4,7.16,(f,u)=>u?VL:VI,{m:5,g:[2,1,1]});
    const x0=s>0?3.6:-8;b(HG,x0,27.6,1.6,x0+4.4,29.8,3.8,bone,{g:[4,2,2]});const x1=s>0?6.4:-8.4;b(HG,x1,29.8,1.6,x1+2,34.6,3.6,bone);b(HG,x1+.3,34.6,2.4,x1+1.7,37,5.4,bone)}
   b(HG,-3.9,30.2,-.3,3.9,32.6,7.3,(f,u,v,W,H)=>f==='T'||f==='D'?null:(v===H-1?(u%2||N(K+7,u,3)<.3?null:GO[2]):v===0?GO[0]:GO[1]),{m:4,g:[7,3,7],ao:false});
   b(HG,-3.9,22.4,3,3.9,25.2,7.8,(f,u,v,W,H)=>f==='F'&&v===H-1&&u%2?null:(v===0?IR[0]:(u%2?IR[1]:IR[2])),{m:4,g:[7,3,5]});
   b(LG,-3,-12,-3,3,0,3,over(skin,(f,u,v,W,H,r)=>f!=='T'&&(r===7||r===8)?IR[r===7?2:1]:undefined));b(LG,-3.3,-12,-2.8,3.3,-10.4,4,dskin);for(const x of[-2.8,-.7,1.4])b(LG,x,-12,4,x+1.4,-10.8,5.6,bone);ground()});
  const arm=R=>T=>{b(T,-3,-4,-4,5.6,3.4,4,skin);b(T,-2.4,-10,-3,4.6,-3.6,3,dskin);
   b(T,-3,-16.6,-3.8,5.6,-9.4,3.8,over(skin,(f,u,v,W,H,r)=>f!=='T'&&f!=='D'&&(r===1||r===2)?IR[r===1?2:1]:undefined));
   b(T,-3,-16.6,3.82,5.6,-9.4,3.9,vein(K+13+(R?0:3),.22),{m:5,g:[9,7,1]});
   for(const x of[-2.6,.5,3.6])b(T,x,-23,-1,x+1.6,-16,1.2,over(bone,(f,u,v)=>v<=1?BNH:undefined),{g:[2,7,2]});
   b(T,-.4,3.4,-2.4,1.4,6.4,-.6,bone);b(T,2.6,3.4,.4,4.2,5.6,2,bone);
   if(R)b(T,-3.3,-1.6,-4.3,5.9,1.4,4.3,(f,u,v,W,H)=>f==='T'?((u%3===1)&&(v%3===1)?IR[2]:IR[1]):(v===H-1?IR[2]:v===0?IR[0]:IR[1]),{m:4,g:[9,3,9]})};
  arms2(P,arm(1),arm(0));return}

 /* ---------------- RUNNER ---------------- */
 if(kind==='runner'){const SK=sk3('#c4c0b4',.72),skin=tone(SK,K,{bl:.16}),BL=PP(['#4e0e0c','#84201a','#b03a2c']),a=.56;
  pxScene(()=>{
   pxRot(G,()=>{/* bent double: starved belly, rib cage showing, vertebrae standing out of the back */
    b(G,-3,11,-1.6,3,14.2,1.6,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r>=1?C('#4a3a26'):undefined));b(G,-2,13.8,-1.2,2,18.2,1.2,tone([SK[0],SK[0],SK[1]],K+2));
    b(G,-3.6,17.6,-2,3.6,23.8,2.3,over(skin,(f,u,v,W,H,r)=>{if((f==='F'||f==='R'||f==='L')&&r>=1&&r<=5)return r%2?(f==='F'&&(u===3||u===4)?BN[0]:BN[2]):DK;if(f==='B'&&(u===3||u===4))return BN[1]}));
    for(let i=0;i<5;i++)b(G,-.6,12.6+i*2.5,-3.4-(i===2||i===3?.9:0),.6,14+i*2.5,-1.6,bone);
    for(const s of[-1,1])b(G,s>0?3.2:-4.8,22,-1.4,s>0?4.8:-3.2,24.6,1.6,bone)},[a,0,0],[0,12,0]);
   /* long skull carried low and forward: snout, hanging split jaw, back-swept quills */
   b(HG,-3,22.4,5,3,28,11.6,over(skin,(f,u,v,W,H,r)=>{if(f==='T'&&u>=2&&u<=3)return BN[1];if((f==='R'||f==='L')&&r===2&&u>=1&&u<=2)return DK}));
   b(HG,-2.2,22.4,11.6,2.2,25.6,15.4,over(tone([SK[0],SK[1],SK[2]],K+4),(f,u,v,W,H,r)=>f!=='T'&&f!=='B'&&r===H-1?(u%2?BN[2]:DK):f==='F'&&r===0?DK:undefined));
   pxRot(HG,()=>{b(HG,-2,20.6,8,2,22.2,14.6,over(tone(BL,K+5),(f,u,v,W,_H,_r)=>f==='T'?(u===0||u===W-1||v===0?BN[2]:BL[0]):undefined))},[.5,0,0],[0,22.4,8]);
   for(const s of[-1,1])b(HG,s>0?1.2:-2.6,25.7,11.6,s>0?2.6:-1.2,26.8,11.76,flat(C('#ff3a2a')),{m:5});
   b(HG,-.6,27.4,1.4,.6,29,6.4,bone);b(HG,-2.4,26.4,2.4,-1.4,27.6,5.6,bone);b(HG,1.4,26.4,2.4,2.4,27.6,5.6,bone);
   /* stilt legs: thigh, thin shin, knee spur, long clawed foot */
   b(LG,-1.6,-6.2,-1.6,1.6,0,1.8,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r<=2?C('#4a3a26'):undefined));b(LG,-1.1,-12,-1.1,1.1,-6,1.1,skin);b(LG,-.8,-7.6,1.1,.8,-5,2.7,bone);
   b(LG,-1.5,-12,-1,1.5,-11,3.4,bone);ground()});
  const arm=k=>T=>{/* arms start at the bent shoulders (5 px down the arm axis), blood to the elbows, three bone blades */
   b(T,-2.6,-13,-1.2,-.2,-4.6,1.2,skin);b(T,-2.9,-14.2,-1.6,.1,-12.4,2.2,bone);
   b(T,-2.5,-22,-1.1,-.3,-13.6,1.1,over(tone(BL,K+k),(f,u,v,W,H,r)=>r<=1&&N(K+k,u,r)<.6?SK[1]:undefined));
   for(const[x,l,z]of[[-3.2,5.4,.3],[-1.75,6.6,0],[-.3,5,-.3]])b(T,x,-22-l,z-.4,x+.7,-21.4,z+.5,over(bone,(f,u,v)=>v<=1?BNH:undefined),{g:[1,6,1]})};
  arms2(P,arm(1),arm(2));return}

 /* ---------------- BOMBER ---------------- */
 if(kind==='bomber'){const SK=sk3('#cc8478',.78),skin=tone(SK,K),CH=PP(['#1c1410','#3a2a22','#5a4034']),OR=C('#ff8a1e'),YL=C('#ffe27a'),RD=C('#d83a12'),
   swell=over(skin,(f,u,v,_W,_H,_r)=>{const n=N(K+6,u>>1,v>>1);if(n>.9)return CH[1];if(f!=='T'&&N(K+7,u,v)>.93)return C('#e8b070')}),
   crack=(k,th)=>(f,u,v,W,H)=>{if(f!=='F')return null;const c=W/2+Math.sin(v*1.3+k)*W*.22,d=Math.abs(u+.5-c),br=Math.abs(v-H*.5)<1&&Math.abs(u+.5-W/2)<W*.36;return d<th*.5?YL:d<th||br?OR:d<th+1&&N(k,u,v)<.5?RD:null};
  pxScene(()=>{
   /* a bloated barrel of a body hanging over the hips */
   b(G,-6,10,-4.6,6,23,5.6,swell);b(G,-5,11,5.6,5,21,7.6,swell);b(G,-7.2,13,-3,7.2,20,4.2,swell);
   /* the keg grown into the back: staves, iron hoops, flesh creeping over it */
   b(G,-4.6,12,-8.8,4.6,23,-4.6,(f,u,v,W,H)=>{if(f==='T'||f==='D')return (u+v)%3?WD[1]:WD[0];if(v===1||v===H-2)return IR[v===1?1:2];if(v===5&&f==='B')return IR[1];return u%3===0?WD[0]:(N(K+3,u,v)<.25?WD[2]:WD[1])});
   b(G,-5.2,19.6,-7,-3,23.6,-4.4,skin);b(G,2.4,11.4,-6.6,5.2,14.4,-4.4,skin);b(G,1.6,21.6,-9.2,4.4,23.8,-6.6,skin);
   b(G,-.4,23,-7.2,.4,26.4,-6.4,flat(CH[0]),{ao:false});b(G,-.8,26.4,-7.6,.8,28,-6,(f,u,v)=>(u+v)%2?YL:OR,{m:5,g:[2,2,2]});
   /* the unstable core shows through the split belly and the sides */
   b(G,-5,11,7.62,5,21,7.72,crack(K,1.3),{m:5,g:[10,10,1]});
   b(G,7.2,13.6,-.6,7.34,19.4,3.4,(f,u,v,_W,_H)=>f==='R'&&Math.abs(u-1.5-Math.sin(v+K))<.8?OR:null,{m:5,g:[1,6,4]});b(G,-7.34,13.6,-.6,-7.2,19.4,3.4,(f,u,v,_W,_H)=>f==='L'&&Math.abs(u-1.5-Math.sin(v*1.4+K))<.8?OR:null,{m:5,g:[1,6,4]});
   b(G,-6,23.02,-4.6,6,23.12,5.6,(f,u,v,W,H)=>{if(f!=='T')return null;const d=Math.abs(v+.5-(H/2+Math.sin(u*1.1+K)*H*.28));return d<.6?YL:d<1.3?OR:null},{m:5,g:[12,1,10]});
   b(G,3,20.4,4.4,6.4,23.8,7,glw(OR,YL,K),{m:5});b(G,-6.6,19.6,1,-4.2,22.6,4.4,glw(OR,YL,K+1),{m:5});b(G,-2.4,22.6,2.4,0,24.4,5,glw(RD,OR,K+2),{m:5,g:[2,2,2]});
   /* small swollen head sunk between the shoulders, the fire behind its teeth */
   b(HG,-3,22.4,.4,3,28.2,6.2,over(skin,(f,u,v,W,H,r)=>{if(f==='F'){if(r===2&&(u===1||u===4))return DK;if(r===4&&u>=1&&u<=4)return u%2?DK:BN[1]}if(f==='T'&&u<=2&&v>=2&&v<=4)return CH[1]}));
   b(HG,-3.8,23,2,-3,26,5.4,swell);b(HG,-1.6,23.2,6.2,1.6,24.2,6.34,(f,u)=>u%2?YL:OR,{m:5,g:[4,1,1]});
   for(const s of[-1,1])b(HG,s>0?.9:-2.1,25.5,6.2,s>0?2.1:-.9,26.5,6.34,flat(C('#ffb02a')),{m:5});
   b(LG,-2.5,-12,-2.5,2.5,0,2.5,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r>=9?CH[r===9?2:r===11?0:1]:f!=='T'&&r<=2?C('#4a3a26'):undefined));ground()});
  const arm=k=>T=>{b(T,-2,-8.4,-2,2.2,0,2,skin);b(T,-2.4,-11.4,-2.4,2.6,-7.4,2.4,over(swell,(f,u,v,W,H,r)=>f!=='T'&&r>=3?CH[1]:undefined));b(T,2.2,-5.2+k,-1.2,3,-3+k,1,glw(OR,YL,K+k),{m:5,g:[1,2,2]})};
  arms2(P,arm(0),arm(1.4));return}

 /* ---------------- ACID SPITTER ---------------- */
 if(kind==='acid'){const SK=PP(['#5c6a24','#8a983c','#b4c260']),skin=over(tone(SK,K),(f,u,v)=>{const n=N(K+6,u,v);if(n>.92)return C('#3e4a16');if(n<.05)return C('#d8f070')}),
   AC=C('#9ae030'),AL=C('#d4ff6a'),AD=C('#4f8a1c'),AW=C('#f4ffc0'),
   sac=k=>(f,u,v,W,H)=>{if(f==='D')return AD;if((u+k)%4===3||(v+k)%4===0)return AD;if(u===1&&v===H-2)return AW;return N(K+k,u,v)<.35?AL:AC},a=.42;
  pxScene(()=>{
   pxRot(G,()=>{b(G,-3.5,11.4,-2,3.5,18,2,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r>=H-3?C('#4a3a26'):undefined));b(G,-4,17.6,-2.2,4,24,2.2,skin);
    /* sacs of acid: one swelling from chest to chin, three on the back, held by strips of skin */
    b(G,-3,17,2.2,3,23.6,5.6,sac(1),{m:5});b(G,-2,18,5.6,2,22.6,6.8,sac(2),{m:5});
    b(G,-4.6,16.6,-6.6,-.4,22.4,-2.2,sac(3),{m:5});b(G,.4,18.6,-7.6,5.2,25,-2.2,sac(0),{m:5});b(G,-2.6,22.4,-6,2,27.6,-2,sac(2),{m:5});
    b(G,-4.8,16.2,-3.2,5.4,17.2,-2,tone([SK[0],SK[0],SK[1]],K+3),{g:[10,1,1]});b(G,-.4,17,-7.9,.4,26,-7.4,flat(SK[0]),{g:[1,9,1],ao:false})},[a,0,0],[0,12,0]);
   /* the head: a wide skull with no lower face, the jaw hanging a hand lower, acid pooling in it and running down in strands */
   b(HG,-4,24,1.6,4,29.6,9,over(skin,(f,u,v,W,H,r)=>{if(f==='F'&&r>=4)return u%2?DK:C('#3e4a16');if(f==='F'&&r===1&&(u===1||u===2||u===5||u===6))return DK}));
   b(HG,-3,23.2,8.5,3,24,9.1,(f,u)=>u%2?null:BN[2],{g:[6,1,1],ao:false});
   b(HG,-3.6,19.4,3.4,3.6,21.4,10,over(skin,(f,u,v,W,_H)=>f==='T'?(u===0||u===W-1||v===0?(u%2?BN[2]:SK[0]):AD):undefined));
   b(HG,-2.6,21.4,4.6,2.6,22,9.4,(f,u,v)=>(u+v)%2?AL:AC,{m:5,g:[5,1,5]});
   for(const s of[-1,1])b(HG,s>0?3:-3.8,21.4,3,s>0?3.8:-3,24,4.6,tone([SK[0],SK[0],SK[1]],K+4),{g:[1,3,2]});
   b(HG,-2.3,16.4,9.4,-1.6,19.4,10,flat(AC),{m:5});b(HG,1,17.4,9.4,1.7,19.4,10,flat(AL),{m:5});b(HG,-.3,14.8,9.3,.3,19.4,9.9,(f,u,v)=>v?AC:AL,{m:5,g:[1,5,1]});
   for(const s of[-1,1])b(HG,s>0?1.4:-3,26.6,9,s>0?3:-1.4,27.8,9.16,flat(C('#e8ff50')),{m:5});
   b(LG,-2,-12,-2,2,0,2,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r>=10?(N(K+9,u,r)<.6?AC:AD):f!=='T'&&r<=2?C('#4a3a26'):undefined));ground()});
  arms2(P,T=>{b(T,-1.5,-9,-1.5,1.5,-2,1.5,skin);b(T,-.8,-14,-.8,.8,-8.6,.8,bone);b(T,-1.2,-10.2,-1.2,1.2,-8.6,1.2,over(skin,(f,u,v)=>v===0?AC:undefined));
    for(const x of[-.9,.3])b(T,x,-16.4,-.3,x+.6,-13.8,.3,(f,u,v)=>v?BN[2]:AL,{g:[1,3,1]});b(T,-.3,-18.4,-.3,.3,-16.4,.3,flat(AC),{m:5})},
   T=>{b(T,-1.5,-13,-1.5,1.5,-2,1.5,skin);b(T,-1.9,-13.4,-1.9,1.9,-10.4,1.9,sac(1),{m:5});for(const x of[-1.2,.5])b(T,x,-15.4,-.3,x+.7,-13.2,.4,bone)});
  return}

 /* ---------------- MINER ---------------- */
 if(kind==='miner'){const SK=sk3('#6e747c',.6),skin=tone(SK,K),CY=C('#52e0ff'),CL=C('#c8f8ff'),CD=C('#1e86b4'),AM=C('#ffb428'),AML=C('#fff0a0'),AMD=C('#f08a14'),RS=C('#4e3220'),PK=bev(PP(['#4a4e56','#7c828c','#b2b8c0'])),LE=PP(['#3a2a18','#5e4630','#7e6244']),
   stone=over(tone(ST,K+2,{bl:.1,hl:.08}),(f,u,v)=>{const n=N(K+8,u,v);if(n>.96)return C('#d4a234');if((u%4===3&&v%3===0)||(v%3===2&&u%4!==1))return ST[0]}),
   cry=(f,u,v,W,H)=>f==='T'||v===H-1?CL:(u+v)%3===0?CD:CY,a=.24;
  pxScene(()=>{
   pxRot(G,()=>{/* a leather apron over grey flesh, rock grown over the back, one shoulder and a hip, crystals breaking out of it */
    b(G,-4,12,-2,4,24,2,over(skin,(f,u,v,W,H,r)=>f==='F'&&r>=3&&u>=1&&u<=6?LE[N(K+4,u,r)<.2?0:r===3?2:1]:(f!=='T'&&(r===8)?LE[0]:undefined)));
    b(G,-4.6,15.6,-6.6,3.6,25,-2,stone);b(G,2,21.6,-4,8.2,27.6,3,stone);b(G,-6.6,12.6,-3.4,-3.8,17,1.6,stone);
    b(G,-2.2,25,-5.6,-.6,30.4,-4,cry,{m:5});b(G,.4,25,-4.6,1.8,28,-3.2,cry,{m:5});b(G,-4.2,21.6,-8.2,-2.8,23.2,-6.4,cry,{m:5});b(G,5,27.6,-1.2,6.4,31.4,.2,cry,{m:5});b(G,6.6,27.6,.8,7.6,29.4,1.8,cry,{m:5})},[a,0,0],[0,12,0]);
   /* the head: iron cap rusted on, a stone jaw, and one lantern where the face was */
   b(HG,-4,23.4,-.6,4,31.4,7,over(skin,(f,u,v,W,H,r)=>{if(f!=='T'&&r>=5)return (u%3===2&&r<7)?ST[0]:ST[r===5?2:1];if(f==='F'&&r===5&&u>=1&&u<=6)return u%2?DK:ST[2]}));
   b(HG,-4.6,29.2,-1.2,4.6,30.2,7.6,(f,u,v,_W,_H)=>f==='T'?IR[1]:(N(K+5,u,v)<.2?RS:IR[2]),{m:4,g:[9,1,9]});b(HG,-3.6,30.2,-.2,3.6,32.6,6.6,(f,u,v,_W,_H)=>N(K+5,u>>1,(v>>1)+f.charCodeAt(0))<.22?RS:f==='T'?IR[1]:v===0?IR[0]:IR[2],{m:4,g:[7,2,7]});
   b(HG,-1.8,25.2,6.4,1.8,29.2,11,(f,u,v,_W,_H)=>u===1&&v===1?AML:(u+v)%2?AM:AMD,{m:5,g:[3,3,3]});b(HG,-1.4,29.2,6.2,1.4,30,10.4,iron,{m:4,g:[3,1,3]});b(HG,-2.1,24.5,6.2,2.1,25.2,11.3,iron,{m:4,g:[3,1,3]});
   b(LG,-2,-12,-2,2,0,2,over(tone(LE,K+6),(_f,_u,_v,_W,_H,_r)=>undefined));b(LG,-2.6,-12,-2.6,2.6,-8.4,3.2,stone);ground()});
  arms2(P,T=>{/* the right forearm turned to stone, a pick grown out of the wrist */
    b(T,-2,-7,-2,2,-1,2,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r<=2?LE[1]:undefined));b(T,-2.6,-14,-2.6,2.6,-6.4,2.6,stone);
    b(T,-1,-17.6,-1,1,-14,1,PK,{m:4});b(T,-1,-19.2,-7.6,1,-16.6,7.6,PK,{m:4,g:[2,2,8]});
    b(T,-.8,-21,5.8,.8,-19,8.8,PK,{m:4});b(T,-.8,-21,-8.8,.8,-19,-5.8,PK,{m:4});b(T,-.5,-22.4,7.6,.5,-21,8.8,flat(BNH),{m:4});b(T,-.5,-22.4,-8.8,.5,-21,-7.6,flat(BNH),{m:4});
    b(T,1.2,-11,2.6,2.4,-8.6,4,cry,{m:5})},
   T=>{/* the left hand a boulder */
    b(T,-2,-8,-2,2,-1,2,over(skin,(f,u,v,W,H,r)=>f!=='T'&&r<=2?LE[1]:undefined));b(T,-3,-14.6,-3,3,-7.4,3.2,stone);b(T,-1.6,-16,-1.6,1.8,-14.6,2,stone);b(T,-3.2,-10.4,.6,-2.2,-8,2,cry,{m:5})});
  return}

 /* ---------------- HUSK ---------------- */
 {const SK=sk3('#7a5a3c',.55),skin=tone(SK,K),EP=C('#c8f0ff'),a=.3,
   wrapd=over(skin,(f,u,v,W,H,r)=>{if(f==='T'||f==='D')return undefined;const n=N(K+9,(u>>1)+f.charCodeAt(0),r);if(r%3===1&&n<.7)return LN[N(K+3,u,r)<.25?0:1];if(r%3===2&&n<.25)return LN[2]}),
   linen=tone(LN,K+4,{bl:.25}),astrip=(f,u,v)=>LN[(u+v)%2?1:2],strip=(f,u,v,W,_H)=>v===0&&N(K+5,u,W)<.5?null:LN[v%3===0?0:v%3===1?1:2];
  pxScene(()=>{
   pxRot(G,()=>{/* split from the collar to the hips: two dried halves that no longer line up, the spine between them, ribs across the gap */
    b(G,-3,11.4,-1.6,3,13.6,1.6,linen);
    b(G,-4,12.6,-1.8,-.8,23.4,1.8,wrapd);b(G,.8,13.8,-1.8,3.7,24.4,1.8,wrapd);
    b(G,-1.1,13,-1.1,1.1,22.6,.9,(f,u,v)=>f==='F'&&v%2?BN[1]:DK,{g:[2,10,2]});
    b(G,-1.2,16,1,1.2,16.9,2,bone,{g:[2,1,1]});b(G,-1.2,19.4,1,1.2,20.3,2,bone,{g:[2,1,1]});
    /* the shroud grown into the flesh: a lump of cloth on one shoulder, strips trailing behind */
    b(G,-4.7,21.4,-2.6,-.9,24.8,2.5,linen);b(G,-3.6,12.4,-3.3,-2.2,22,-2.5,strip,{g:[1,10,1],ao:false});b(G,1.5,9.4,-3.2,2.7,19.4,-2.4,strip,{g:[1,10,1],ao:false})},[a,0,0],[0,12,0]);
   /* the skull cracked in two, the smaller half slipped down; one pale eye left */
   b(HG,-4,24,-.4,-.4,31.6,7.2,over(wrapd,(f,u,v,W,H,r)=>{if(f==='F'&&r===6&&u>=1)return u%2?DK:BN[1];if(f==='F'&&r===3&&u===1)return DK}));
   pxRot(HG,()=>{b(HG,.5,23,-.2,4,30,7,over(wrapd,(f,u,v,W,H,r)=>f==='F'&&(r===3||r===2)&&u>=1&&u<=2?DK:(f==='F'&&r>=6?null:undefined)))},[0,0,-.16],[2,23,3]);
   b(HG,-.9,24,.2,.9,29.6,6.6,flat(DK),{g:[1,1,1]});
   b(HG,-4.3,28.4,-.7,-.2,30.6,7.5,(f,u,v,W,H)=>f==='D'?null:LN[v===H-1?2:N(K+6,u,v)<.25?0:1],{g:[4,2,8],ao:false});
   b(HG,-2.9,27,7.2,-1.7,28,7.36,flat(EP),{m:5});
   b(HG,2,17.6,-1.3,3.5,25,-.5,strip,{g:[1,7,1],ao:false});b(HG,-3.4,20.6,-1.3,-2,25,-.5,strip,{g:[1,5,1],ao:false});
   b(LG,-1.5,-12,-1.5,1.5,0,1.5,wrapd);b(LG,-1.9,-3.4,-1.9,1.9,0,1.9,linen);ground()});
  const arm=k=>T=>{b(T,-1.3,-13,-1.3,1.3,-2.4,1.3,wrapd);for(const x of[-.9,.2])b(T,x,-15.4,-.3,x+.7,-12.8,.4,bone);
   b(T,-.6,-9.6-k,-6.4+k,.6,-8.2-k,-1.3,astrip,{g:[1,1,5],ao:false});b(T,-.6,-5.4,-4.6-k,.6,-4.2,-1.3,astrip,{g:[1,1,3],ao:false})};
  arms2(P,arm(0),arm(1.2))}
}
