/* ================= 3D ENGINE ================= */
const g3=document.getElementById('g3');
let GQ=1;try{const v=localStorage.getItem('dk_gfx');if(v!==null)GQ=+v?1:0}catch(e){}const GQU={value:GQ};
const renderer=new THREE.WebGLRenderer({canvas:g3,antialias:false,stencil:false,powerPreference:'high-performance'});
/* dynamic resolution: when the GPU (not our code) is the bottleneck, render fewer pixels; climb back when there is headroom */
const DRSL=[1,.86,.74,.62,.5],DRS={lv:0,sum:0,cs:0,n:0,t:0,lt:0,noDn:0,noUp:0,upT:-99,chk:0,ftb:0,ok:0,bk:60,ft:0,cpu:0};renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.97;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(42,1,.3,420);scene.autoUpdate=false;
const SKY=0x9ccaf0;scene.background=new THREE.Color(SKY);scene.fog=new THREE.Fog(SKY,50,140);
const SHADOWS=window.innerWidth>700;
const hemi=new THREE.HemisphereLight(0xdcecff,0x77704f,.62),sun=new THREE.DirectionalLight(0xfff1d2,.78);
scene.add(hemi,sun,sun.target);
if(SHADOWS){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.castShadow=true;{const ss=GQ?2048:1024;sun.shadow.mapSize.set(ss,ss)}renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
 const sc=sun.shadow.camera;sc.left=-36;sc.right=36;sc.top=36;sc.bottom=-36;sc.near=1;sc.far=220;sun.shadow.bias=-.0003;sun.shadow.normalBias=.03}
const CAM={x:CX,z:CY,y:LAND,yaw:0,pitch:.92,dist:24};
/* ---- geometry helpers ---- */
let BMAT=0;const newG=()=>({P:[],N:[],C:[],I:[],M:[],hm:0});
function quad(G,a,b,c,d,n,ca,cb,cc,cd){const o=G.P.length/3;if(G.M){if(G.M.length<o)for(let i=G.M.length;i<o;i++)G.M.push(0);G.M.push(BMAT,BMAT,BMAT,BMAT);if(BMAT)G.hm=1}G.P.push(...a,...b,...c,...d);G.N.push(...n,...n,...n,...n);G.C.push(...ca,...cb,...cc,...cd);G.I.push(o,o+1,o+2,o,o+2,o+3)}
function tri(G,A,B,C,n,c){const u=[B[0]-A[0],B[1]-A[1],B[2]-A[2]],v=[C[0]-A[0],C[1]-A[1],C[2]-A[2]],cr=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];if(cr[0]*n[0]+cr[1]*n[1]+cr[2]*n[2]<0){const t=B;B=C;C=t}quad(G,A,B,C,C,n,c,c,c,c)}
function toGeo(G){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.C,3));if(G.hm){const n=G.P.length/3,M=G.M.slice(0,n);while(M.length<n)M.push(0);g.setAttribute('mat',new THREE.Float32BufferAttribute(M,1))}g.setIndex(G.I);g.computeBoundingSphere();return g}
const rgb=h=>{const c=hex(h);return[c[0]/255,c[1]/255,c[2]/255]};
const shade=(c,k)=>[c[0]*k,c[1]*k,c[2]*k];
const FK=[1,.9,.8,.86,.77,.55];
function addBox(G,x0,y0,z0,x1,y1,z1,c){const s=k=>shade(c,FK[k]),d=k=>shade(c,FK[k]*.78);
 quad(G,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0],s(0),s(0),s(0),s(0));
 quad(G,[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],[1,0,0],d(1),s(1),s(1),d(1));
 quad(G,[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0],[-1,0,0],d(2),s(2),s(2),d(2));
 quad(G,[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[x0,y0,z1],[0,0,1],d(3),s(3),s(3),d(3));
 quad(G,[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[x1,y0,z0],[0,0,-1],d(4),s(4),s(4),d(4));
 quad(G,[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,-1,0],s(5),s(5),s(5),s(5))}
let WOODY=false;const WDP=['#4a321f','#5a3b23','#6b4a2c','#7a5333','#8a6038','#9a6c40','#a8814f'],WRF=['#86703c','#947c44','#a3894e'],WDC=new Map();
function woodOf(c,roof){const k=(roof?'r':'')+(typeof c==='string'?c:c.join(','));let v=WDC.get(k);if(v)return v;const q=typeof c==='string'?rgb(c):c,L=q[0]*.3+q[1]*.55+q[2]*.15;
 v=roof?WRF[Math.min(2,Math.max(0,((L-.25)*6)|0))]:WDP[Math.min(6,Math.max(0,((L-.18)*9.5)|0))];WDC.set(k,v);return v}
const bxm=m=>(G,cx,y0,cz,w,h,d,c)=>{const o=BMAT;let mm=m,cc=c;if(WOODY&&(m===1||m===6)&&!(m===1&&(c==='#9a5442'||c==='#87493a'))){cc=woodOf(c,m===6);if(m===1)mm=2}BMAT=mm;try{bxc(G,cx,y0,cz,w,h,d,cc)}finally{BMAT=o}};
let BXN=0;const bxc=(G,cx,y0,cz,w,h,d,c)=>{const e=Math.min((1+(BXN++%4))*.0006,Math.min(w,h,d)*.12);return addBox(G,cx-w/2-e,y0-e,cz-d/2-e,cx+w/2+e,y0+h+e,cz+d/2+e,typeof c==='string'?rgb(c):c)};
/* ================= HD SURFACES =================
   smooth procedural detail in world space (no more 16x16 pixel noise), sharpened by distance-aware fading,
   per-pixel lighting with micro relief, material-aware: grass blades, stone cracks, earth strata, sand ripples */
const GLN=`
float hn3(vec3 p){p=fract(p*.3183099+vec3(.71,.113,.419));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hn3(i),hn3(i+vec3(1.,0.,0.)),f.x),mix(hn3(i+vec3(0.,1.,0.)),hn3(i+vec3(1.,1.,0.)),f.x),f.y),
  mix(mix(hn3(i+vec3(0.,0.,1.)),hn3(i+vec3(1.,0.,1.)),f.x),mix(hn3(i+vec3(0.,1.,1.)),hn3(i+vec3(1.,1.,1.)),f.x),f.y),f.z);}
float fbm3(vec3 p){float s=.5*vn3(p);p=p*2.07+vec3(3.1,1.7,5.3);s+=.25*vn3(p);p=p*2.11+vec3(1.3,7.9,2.2);s+=.125*vn3(p);return s/.875;}
`;
/* bump: perturb the view-space normal from a procedural height (derivative method) */
const GLBUMP=`
vec3 bumpN(vec3 n,vec3 vp,float h,float k){vec3 dpx=dFdx(vp),dpy=dFdy(vp);float dhx=dFdx(h)*k,dhy=dFdy(h)*k;vec3 r1=cross(dpy,n),r2=cross(n,dpx);float det=dot(dpx,r1);vec3 g=sign(det)*(dhx*r1+dhy*r2);return normalize(abs(det)*n-g);}
`;
const LMU={value:1.4};
/* ink: an anti-aliased line of constant screen width along an iso-contour of a value */
const GLINK=`
float inkL(float v,float lv,float w){float dv=max(fwidth(v),1e-4);return 1.-smoothstep(w*dv*.5,w*dv*1.6,abs(v-lv));}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
`;
/* ARCANE-STYLE SURFACES: hand-painted brush strokes (warm / cool), flat painted planes, black ink contours in every texture,
   banded "toon" light with cool shadows and warm light, ink hatching inside the shadows */
const matV=new THREE.MeshPhongMaterial({vertexColors:true,shininess:9,specular:0x0a0a0a});
matV.onBeforeCompile=sh=>{sh.uniforms.uHQ=GQU;sh.uniforms.uLMax=LMU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;attribute float mat;varying float vMat;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMat=mat;\n#ifdef USE_INSTANCING\nvWP=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n#else\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying float vMat;uniform float uHQ;uniform float uLMax;'+GLN+GLBUMP+GLINK).replace('#include <color_fragment>',`#include <color_fragment>
 vec3 wN=normalize(cross(dFdx(vWP),dFdy(vWP)));vec3 aN=abs(wN);vec3 wq=vWP-wN*.002;
 vec2 uv=aN.y>.5?wq.xz:(aN.x>.5?wq.zy:wq.xy);
 float fw=max(length(dFdx(uv)),length(dFdy(uv)));
 #define FA(f) (1.-smoothstep(.22,.5,(f)*fw))
 bool HQ=uHQ>.5;
 vec3 bc=diffuseColor.rgb;float mxc=max(bc.r,max(bc.g,bc.b)),mnc=min(bc.r,min(bc.g,bc.b)),sat=mxc-mnc,lum=dot(bc,vec3(.299,.587,.114));
 bc=mix(vec3(lum),bc,1.12);
 float kG=clamp((bc.g-max(bc.r,bc.b))*7.,0.,1.);
#ifdef TERR
 float kT=kG;
#else
 float kT=0.;
#endif
 float kS=clamp(1.-sat*9.,0.,1.)*(1.-smoothstep(.78,.9,lum));
 float kD=clamp((bc.r-bc.b)*4.-.4,0.,1.)*(1.-kG)*(1.-smoothstep(.6,.74,lum));
 float kN=clamp((bc.r-bc.b)*3.,0.,1.)*smoothstep(.6,.72,lum)*(1.-kG);
 float mId=floor(vMat+.5);if(mId>.5&&mId<8.5){kG=0.;kT=0.;kS=mId==1.?.55:0.;kD=mId==2.?1.:0.;kN=0.;}
 float macro=vn3(wq*.15);
 bool hz=kD>.5&&aN.y<.5;vec2 rA=hz?uv:vec2(dot(uv,vec2(.866,.5)),dot(uv,vec2(-.5,.866))),rB=hz?uv:vec2(dot(uv,vec2(-.342,.94)),dot(uv,vec2(-.94,-.342)));
 float mk=hz?0.:smoothstep(.35,.65,vn3(wq*.21+11.));
 float sA=mix(vn3(vec3(rA.x*.8,rA.y*4.2,3.7)),vn3(vec3(rB.x*.8,rB.y*4.2,9.1)),mk),sB=HQ?mix(vn3(vec3(rA.x*1.9,rA.y*9.,8.1)),vn3(vec3(rB.x*1.9,rB.y*9.,2.3)),mk):.5;
 float stroke=mix(sA,sA*.75+sB*.25,FA(9.));float fS=FA(4.2);
 float sQ=mix(.5,mix(.5,smoothstep(.3,.7,stroke),.75),fS);
 float ink=0.;
 vec3 tw=mix(vec3(.93,.95,1.03),vec3(1.05,1.02,.95),sQ);
 if(kG>0.){float cl=vn3(wq*1.35+5.);
#ifdef TERR
  float m1=fbm3(wq*.06+3.),m2=vn3(wq*.2+17.);
  /* painted meadow: broad cool / warm patches, then blunt brush strokes of lighter (warm) and darker (cool) paint following a gentle flow */
  vec3 gb=bc*vec3(.66,.82,1.16);gb=mix(vec3(dot(gb,vec3(.3,.59,.11))),gb,.97);
  vec3 g=mix(gb*vec3(.8,.92,1.04),gb*vec3(1.12,1.04,.8),smoothstep(.25,.78,m1))*(.88+.22*m2)*(.95+.08*smoothstep(.25,.75,cl));
  if(aN.y>.5){
   float fD=FA(4.);
   if(fD>.001){vec2 p=uv*2.6,ic=floor(p),fc=fract(p);float ew=fw*2.6;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j)),c=ic+o;
     float h1=hn3(vec3(c,1.7)),h2=hn3(vec3(c,4.3)),h3=hn3(vec3(c,8.9)),h4=hn3(vec3(c,2.1));
     float an=vn3(vec3(c*.11,7.))*6.2832+(h3-.5)*.6,ca=cos(an),sa=sin(an);
     vec2 d=fc-o-vec2(h1,h2)*.8-.1,q=vec2(d.x*ca+d.y*sa,-d.x*sa+d.y*ca);
     float L=.24+.22*h2,Wd=.11+.06*h1;q.y+=sin(q.x*5.+h3*6.2832)*.025;
     float sd=length(vec2(max(abs(q.x)-L,0.),q.y))-Wd*(1.-.25*clamp(q.x/max(L,.01),-1.,1.));
     float a=(1.-smoothstep(-ew*.7,ew*.7,sd))*fD*.62,tn=h4*2.-1.;
     g=mix(g,g*(1.+tn*.15)*mix(vec3(.96,1.,1.05),vec3(1.05,1.02,.9),h4),a);}}
   float fF=HQ?FA(12.):0.;
   if(fF>.001){vec2 p=uv*6.3,ic=floor(p),fc=fract(p);float ew=fw*6.3;
    for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){vec2 o=vec2(float(i),float(j)),c=ic+o;
     float h1=hn3(vec3(c,3.3)),h2=hn3(vec3(c,6.1)),h3=hn3(vec3(c,9.7)),h4=hn3(vec3(c,1.9));
     float an=vn3(vec3(c*.045,7.))*6.2832+(h3-.5)*.8,ca=cos(an),sa=sin(an);
     vec2 d=fc-o-vec2(h1,h2)*.8-.1,q=vec2(d.x*ca+d.y*sa,-d.x*sa+d.y*ca);
     float L=.2+.2*h2,Wd=.1+.05*h1,sd=length(vec2(max(abs(q.x)-L,0.),q.y))-Wd;
     float a=(1.-smoothstep(-ew*.7,ew*.7,sd))*fF*.5,tn=h4*2.-1.;
     g=mix(g,g*(1.+tn*.12),a);}}
  }else g=mix(g,g*.62,inkL(cl,.6,1.4)*.45*FA(3.));
  bc=mix(bc,g,kG);
#else
  float dr=fbm3(wq*.08+3.);bc*=vec3(.84,.93,.96);vec3 g0=bc*vec3(.72,.86,.9),g1=bc*vec3(1.08,1.04,.84);
  bc=mix(bc,mix(g0,g1,clamp(sQ*.6+cl*.5-.05,0.,1.))*mix(1.,1.06,smoothstep(.45,.85,dr)),kG);
  if(aN.y<.5)ink=max(ink,inkL(cl,.6,1.1)*.5*FA(3.)*kG);
#endif
 }
 if(kS>0.){float rr=max(1.-abs(vn3(wq*2.4)*2.-1.),(1.-abs(vn3(wq*4.9+9.)*2.-1.))*.95);
  float pl=floor(vn3(wq*1.6+2.)*3.)/2.;bc=mix(bc,bc*(.86+.26*pl),kS*.85);
  ink=max(ink,smoothstep(.93,.985,rr)*FA(9.)*kS*.9);}
 if(kD>0.){float gr=vn3(vec3(rA.x*.9,rA.y*9.,4.));ink=max(ink,inkL(gr,.5,1.1)*.5*FA(9.)*kD);}
 if(kN>0.){float rp=vn3(vec3(wq.x*.5+wq.z*.9,0.,wq.z*.3)*3.);ink=max(ink,inkL(rp,.5,1.)*.25*FA(3.)*kN);}
 bc*=mix(tw*(.9+.2*macro),vec3(1.),kT*.9);if(aN.y<.5)bc*=.94;
 diffuseColor.rgb=mix(bc,bc*vec3(.1,.085,.12),ink*.3);
#ifndef TERR
 {float PXS=18.;vec2 pc=floor(uv*PXS+.001);float pn=hn3(vec3(pc,aN.y>.5?7.3:(aN.x>.5?3.1:5.7)));vec3 c0=diffuseColor.rgb;
  float row=floor(pc.y/4.),bx=mod(pc.x+mod(row,2.)*4.,8.),mor=(mod(pc.y,4.)<.5||bx<.5)?1.:0.;
  float prow=floor(pc.y/4.),pe=mod(pc.x+prow*5.,16.)<.5?1.:0.,pli=(mod(pc.y,4.)<.5||pe>.5)?1.:0.;
  if(aN.y>.5){mor=(mod(pc.x,8.)<.5||mod(pc.y,8.)<.5)?1.:0.;pli=mod(pc.x,4.)<.5?1.:0.;}
  vec3 cS=c0*(.9+.2*pn)*mix(1.,.64,mor),cW=c0*(.86+.2*pn)*mix(1.,.68,pli),cO=c0*(.93+.14*pn);
  float wS=clamp(kS*1.6,0.,1.),wW=clamp(kD*1.4,0.,1.)*(1.-wS);
  diffuseColor.rgb=mix(mix(cO,cW,wW),cS,wS);}
#endif
#ifdef TERR
 if(vWP.y<11.9&&vMat<8.5){float dw=clamp((11.92-vWP.y)*.32+.25,0.,1.);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.09,.24,.3),dw*.85);}
#endif
 float hB=stroke*.6*fS;`).replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>').replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
 {vec3 alb=max(diffuseColor.rgb,vec3(.004));vec3 irr=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/alb;float li=dot(irr,vec3(.299,.587,.114));
  float r=li/max(uLMax,.05);
  float bd=.4+.3*smoothstep(.24,.36,r)+.3*smoothstep(.52,.64,r)+.16*smoothstep(1.,1.25,r);
  vec3 tnt=mix(vec3(.64,.74,1.08),vec3(1.06,1.,.88),smoothstep(.36,.7,r));
  vec3 nI=irr/max(li,1e-4)*bd*uLMax*tnt;
  float h1=0.;if(r<.5){float hl=fract((uv.x+uv.y)*4.+vn3(vec3(uv*2.,1.))*.7);h1=(1.-smoothstep(.06,.17,hl))*(1.-smoothstep(.28,.5,r));
   if(r<.34){float hl2=fract((uv.x-uv.y)*4.+vn3(vec3(uv*2.,2.))*.7);h1=max(h1,(1.-smoothstep(.06,.17,hl2))*(1.-smoothstep(.18,.34,r)));}h1*=FA(4.);}
  nI*=1.-h1*.42*(1.-.55*kT)*(vMat>4.5&&vMat<5.5?0.:1.);
  if(vMat>3.5&&vMat<4.5){vec3 Vv=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vv),0.,1.),2.2);nI=nI*1.08+vec3(1.,.86,.56)*fr*.75*uLMax+vec3(1.,.95,.8)*smoothstep(.62,.9,r)*.35*uLMax;}
  reflectedLight.directDiffuse=alb*nI;reflectedLight.indirectDiffuse=vec3(0.);
  if(vMat>4.5&&vMat<5.5){reflectedLight.directDiffuse=alb*.3*uLMax;totalEmissiveRadiance+=alb*1.35;}}`).replace('#include <dithering_fragment>','#include <dithering_fragment>\n{gl_FragColor.rgb*=vec3(1.02,1.,.97);}');};
const matWater=new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:.84,depthWrite:true,shininess:140,specular:0xa0b0bc}),WUT={value:0};
matWater.onBeforeCompile=sh=>{sh.uniforms.uT=WUT;sh.uniforms.uHQ=GQU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform float uT;').replace('#include <begin_vertex>','#include <begin_vertex>\nvec3 wp0=(modelMatrix*vec4(position,1.0)).xyz;transformed.y+=(sin(wp0.x*1.3+uT*1.4)+sin(wp0.z*1.7+uT*1.1))*.025;vWP=(modelMatrix*vec4(transformed,1.0)).xyz;');
 sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;uniform float uT;uniform float uHQ;'+GLN+GLBUMP).replace('#include <color_fragment>',`#include <color_fragment>
 float w1=vn3(vec3(vWP.xz*1.25+vec2(uT*.33,uT*.21),uT*.14)),w2=vn3(vec3(vWP.xz*3.2-vec2(uT*.47,-uT*.29),uT*.25+7.)),w3=vn3(vec3(vWP.xz*8.5+vec2(uT*.9,uT*.6),uT*.4+3.));
 float fwW=length(fwidth(vWP.xz));float hW=w1*.55+w2*.3*(1.-smoothstep(.07,.16,3.2*fwW))+w3*.15*(1.-smoothstep(.22,.5,8.5*fwW));
 float shf=smoothstep(.3,.8,vColor.r);vec3 wc=mix(vec3(.08,.34,.58),vec3(.16,.58,.64),smoothstep(.2,.3,vColor.r));
 float fp=smoothstep(.5,.78,vn3(vec3(vWP.xz*2.7+vec2(uT*.22,-uT*.17),uT*.45)))*shf+smoothstep(.85,1.,shf)*.35;fp=min(fp,1.);
 diffuseColor.rgb=mix(wc*(.9+.2*w1),vec3(.9,.96,1.),fp*.85);diffuseColor.a=mix(mix(.88,.68,smoothstep(.2,.32,vColor.r)),.95,fp);hW+=fp*.6;float fwF=max(fwidth(fp),1e-4);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*.25,(1.-smoothstep(fwF*.6,fwF*1.8,abs(fp-.42)))*.6*step(.05,shf));`).replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=bumpN(normal,-vViewPosition,hW,uHQ>.5?.17:.08);').replace('#include <tonemapping_fragment>',`{vec3 Vw=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vw),0.,1.),4.);
 #ifdef USE_FOG
 gl_FragColor.rgb=mix(gl_FragColor.rgb,fogColor*1.02,fr*.25);
 #endif
 gl_FragColor.a=mix(gl_FragColor.a,1.,fr*.35);}
#include <tonemapping_fragment>`);};
function gh(x,z){const tx=Math.max(0,Math.min(TW-1,x|0)),ty=Math.max(0,Math.min(TH-1,z|0)),i=ty*TW+tx;
 if(stairs.size){const s=stairs.get(i);if(s){const f=s.ax?z-ty:x-tx,t=s.sg>0?f:1-f;return s.lo+(s.hi-s.lo)*Math.max(0,Math.min(1,t))}}return HT[i]}
/* ---- terrain chunk meshes ---- */
const unitG=new Map(),CHK=new Map(),dirtyT=new Set(),dirtyP=new Set(),RM=3;
const keyOf=(cx,cy)=>cy*NCX+cx;
function markT(tx,ty){const cx=(tx/CH)|0,cy=(ty/CH)|0;dirtyT.add(keyOf(cx,cy));const ex=tx%CH,ey=ty%CH;if(ex===0&&cx>0)dirtyT.add(keyOf(cx-1,cy));if(ex===CH-1&&cx<NCX-1)dirtyT.add(keyOf(cx+1,cy));if(ey===0&&cy>0)dirtyT.add(keyOf(cx,cy-1));if(ey===CH-1&&cy<NCY-1)dirtyT.add(keyOf(cx,cy+1))}
function markP(tx,ty){dirtyP.add(keyOf((tx/CH)|0,(ty/CH)|0))}
const DIRT=[.53,.38,.26],GRASS=[.37,.6,.25],AOK=[1,.8,.66,.55];
function topCol(i,x,y,np){const h=HT[i],v=ter[i],al=h-LAND,j=.97+.06*hs(x,y,9);let b;
 if(!np&&pth[i]===2)return shade([.56,.56,.57],.9+.12*hs(x,y,19)+(((x+y)&1)?.07:0));
 if(!np&&pth[i])return shade([.6,.49,.3],.92+.12*hs(x,y,19)+(((x+y)&1)?.04:0));
 if(v===0&&SCRT.has(i))return shade([.34,.27,.2],.82+.22*hs(x,y,31));
 if(v===1)return shade(FLG[i]&4?[.42,.44,.36]:[.26,.34,.36],j);
 if(v===0&&TFL[i]&&h<LAND){if(h<=BED)return shade([.2,.2,.23],.85+.25*hs(x,y,37));if(h<=LAND-3)return shade([.5,.5,.52],.88+.2*hs(x,y,37)+(((x+y)&1)?.04:0));return shade(DIRT,.9+.16*hs(x,y,37))}
 if(v===5||al>=15){b=h>=SNOW?[.95,.97,.99]:al>=19?[.6,.6,.62]:[.49,.49,.5]}
 else{const m=fb(x*.05,y*.05,SEED+500),dry=Math.max(0,Math.min(1,(m-.5)*3));b=[GRASS[0]+(.62-GRASS[0])*dry*.5,GRASS[1]+(.6-GRASS[1])*dry*.3,GRASS[2]+(.3-GRASS[2])*dry*.5];
  if(al>=8){const t=Math.min(1,(al-8)/12);b=[b[0]+(.5-b[0])*t,b[1]+(.54-b[1])*t,b[2]+(.42-b[2])*t]}
  if(al<=1&&(FLG[i]&4||ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1))b=[.88,.82,.6];else if(FLG[i]&8&&al<=1)b=[(b[0]+.88)/2,(b[1]+.82)/2,(b[2]+.6)/2];
  if(v===2)b=shade(b,.78);else if(v===3)b=[.5,.5,.46];else if(v===4)b=[.42,.4,.36]}
 return shade(b,j)}
function sideCol(i,k,x,y){let b;if(k+1>=SNOW)b=[.9,.92,.95];else if(ter[i]===5||k>=LAND+9)b=shade([.49,.49,.5],1+(k-LAND)*.004);else if(FLG[i]&4&&k>=LAND-2)b=[.8,.74,.52];else b=DIRT;
 if(k<=BED)b=[.2,.2,.23];return shade(b,(((k>>1)&1)?.98:1)*(.94+.12*hs(x*3+k,y*5,k)))}
const OB=(a,b)=>a<0||b<0||a>=TW||b>=TH,SKB=BED-4;
/* ---- v79 paths: a real trail on the grass - the path is drawn as a band joining its neighbours (no more square tiles),
   with a grassy verge; wood = packed earth with wheel ruts and log edging, stone = cobbles with curb stones.
   Along the edges it picks up what grows next to it: leaves and mushrooms by the woods, reeds by water, pebbles by rocks,
   flowers by houses, tufts and wild flowers in the meadow ---- */
function pbox(G,x0,y0,z0,x1,y1,z1,c){const t=shade(c,1.08),s1=shade(c,.86),s2=shade(c,.74);
 quad(G,[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0],t,t,t,t);
 quad(G,[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],s1,s1,s1,s1);quad(G,[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1],s2,s2,s2,s2);
 quad(G,[x1,y0,z1],[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[1,0,0],s1,s1,s1,s1);quad(G,[x0,y0,z0],[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[-1,0,0],s2,s2,s2,s2)}
function pathTop(G,i,x,y,h,gc){const st=pth[i]===2,m=.17,H=h+.012;gc=gc||GRASS;
 quad(G,[x,h,y],[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[0,1,0],gc,gc,gc,gc);
 const cn=(dx,dy)=>{const a=x+dx,b=y+dy;if(a<0||b<0||a>=TW||b>=TH)return false;const j=b*TW+a;if(pth[j])return true;const o=occ.get(j);return !!o&&o.t===0&&(o.type==='gate'||o.type==='castle')},
  N=cn(0,-1),S=cn(0,1),E=cn(1,0),Wd=cn(-1,0),x0=Wd?0:m,x1=E?1:1-m,z0=N?0:m,z1=S?1:1-m;
 /* the band: a centre square plus an arm to each joined side */
 const rects=[[x+m,y+m,x+1-m,y+1-m]];if(N)rects.push([x+m,y,x+1-m,y+m]);if(S)rects.push([x+m,y+1-m,x+1-m,y+1]);if(Wd)rects.push([x,y+m,x+m,y+1-m]);if(E)rects.push([x+1-m,y+m,x+1,y+1-m]);
 if(!st){const base=[.56,.42,.27];
  for(const[a0,b0,a1,b1]of rects){const n=2;for(let u=0;u<n;u++)for(let v=0;v<n;v++){const A=a0+(a1-a0)*u/n,B=b0+(b1-b0)*v/n,C2=a0+(a1-a0)*(u+1)/n,D2=b0+(b1-b0)*(v+1)/n,c=shade(base,.88+.2*hs(x*7+A*13,y*5+B*11,61));quad(G,[A,H,B],[A,H,D2],[C2,H,D2],[C2,H,B],[0,1,0],c,c,c,c)}}
  /* wheel ruts along the main direction */
  const ns=N||S,ew=E||Wd,ax=ew&&!ns?1:0,rc=shade(base,.7);for(const r of[.37,.63]){if(ax){if(Wd||E)quad(G,[x0,H+.002,y+r-.03],[x0,H+.002,y+r+.03],[x1,H+.002,y+r+.03],[x1,H+.002,y+r-.03],[0,1,0],rc,rc,rc,rc)}else quad(G,[x+r-.03,H+.002,z0],[x+r-.03,H+.002,z1],[x+r+.03,H+.002,z1],[x+r+.03,H+.002,z0],[0,1,0],rc,rc,rc,rc)}
  for(let k=0;k<3;k++){const px=x+m+.06+hs(x+k,y,71)*(1-2*m-.12),pz=y+m+.06+hs(x,y+k,73)*(1-2*m-.12),s=.03+hs(x+k,y+k,75)*.03,c=shade([.6,.58,.54],.9+.2*hs(k,x,77));pbox(G,px-s,H,pz-s,px+s,H+s*.9,pz+s,c)}}
 else{for(const[a0,b0,a1,b1]of rects){const nx=Math.max(1,Math.round((a1-a0)/.17)),nz=Math.max(1,Math.round((b1-b0)/.17));for(let u=0;u<nx;u++)for(let v=0;v<nz;v++){const o=(v%2)*.5/nx*(a1-a0);let A=a0+(a1-a0)*u/nx+o,C2=a0+(a1-a0)*(u+1)/nx+o;A=Math.max(a0,A)+.012;C2=Math.min(a1,C2)-.012;if(C2<=A)continue;const B=b0+(b1-b0)*v/nz+.012,D2=b0+(b1-b0)*(v+1)/nz-.012,c=shade([.64,.63,.62],.8+.3*hs(x*9+u,y*7+v,63));pbox(G,A,h,B,C2,H+.02,D2,c)}
   const gm=shade([.36,.35,.33],1);quad(G,[a0,H-.004,b0],[a0,H-.004,b1],[a1,H-.004,b1],[a1,H-.004,b0],[0,1,0],gm,gm,gm,gm)}}
 /* edging along the open sides of the band */
 const edge=(ax0,az0,ax1,az1)=>{if(st)pbox(G,ax0,h,az0,ax1,H+.05,az1,shade([.74,.72,.68],.9+.15*hs(ax0*9,az0*7,67)));else pbox(G,ax0,h,az0,ax1,H+.045,az1,shade([.42,.29,.17],.9+.15*hs(ax0*9,az0*7,69)))};
 const ew2=.05;if(!N)edge(x+m-ew2,y+m-ew2,x+1-m+ew2,y+m);if(!S)edge(x+m-ew2,y+1-m,x+1-m+ew2,y+1-m+ew2);if(!Wd)edge(x+m-ew2,y+m,x+m,y+1-m);if(!E)edge(x+1-m,y+m,x+1-m+ew2,y+1-m);
 if(N){if(!Wd)edge(x+m-ew2,y,x+m,y+m);if(!E)edge(x+1-m,y,x+1-m+ew2,y+m)}if(S){if(!Wd)edge(x+m-ew2,y+1-m,x+m,y+1);if(!E)edge(x+1-m,y+1-m,x+1-m+ew2,y+1)}
 if(Wd){if(!N)edge(x,y+m-ew2,x+m,y+m);if(!S)edge(x,y+1-m,x+m,y+1-m+ew2)}if(E){if(!N)edge(x+1-m,y+m-ew2,x+1,y+m);if(!S)edge(x+1-m,y+1-m,x+1,y+1-m+ew2)}
 /* what grows on the verge depends on the neighbourhood */
 let tr=0,wa=0,rk=0,ho=0;for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){const xx=x+a,yy=y+b;if(xx<0||yy<0||xx>=TW||yy>=TH)continue;const j=yy*TW+xx,t=ter[j];if(t===2)tr++;else if(t===1)wa++;else if(t===3||t===5)rk++;const o=occ.get(j);if(o&&o.t===0&&o.type!=='wall'&&o.type!=='gate')ho++}
 const spots=[];for(let k=0;k<6;k++){const side=(hs(x,y,80+k)*4)|0,t=.1+hs(x+k,y,90)*.8,d=.03+hs(x,y+k,95)*(m-.06);let px,pz;
  if(side===0){if(N&&t>m&&t<1-m)continue;px=x+t;pz=y+d}else if(side===1){if(S&&t>m&&t<1-m)continue;px=x+t;pz=y+1-d}else if(side===2){if(Wd&&t>m&&t<1-m)continue;px=x+d;pz=y+t}else{if(E&&t>m&&t<1-m)continue;px=x+1-d;pz=y+t}spots.push([px,pz,k])}
 for(const[px,pz,k]of spots){const r=hs(px*13,pz*17,99);
  if(wa>2&&r<.6){const hh=.14+r*.2;pbox(G,px-.012,h,pz-.012,px+.012,h+hh,pz+.012,[.35,.55,.22]);pbox(G,px+.02,h,pz-.01,px+.04,h+hh*.8,pz+.01,[.42,.6,.25]);if(r<.2)pbox(G,px-.018,h+hh,pz-.018,px+.018,h+hh+.05,pz+.018,[.45,.3,.15])}
  else if(tr>3&&r<.55){if(r<.18){pbox(G,px-.012,h,pz-.012,px+.012,h+.05,pz+.012,[.9,.88,.8]);pbox(G,px-.035,h+.05,pz-.035,px+.035,h+.075,pz+.035,r<.09?[.8,.18,.15]:[.62,.45,.3])}else{const c=r<.36?[.75,.45,.15]:[.55,.32,.12];quad(G,[px-.04,h+.004,pz-.03],[px-.03,h+.004,pz+.04],[px+.04,h+.004,pz+.03],[px+.03,h+.004,pz-.04],[0,1,0],c,c,c,c)}}
  else if(rk>2&&r<.6){const s=.025+r*.04;pbox(G,px-s,h,pz-s,px+s,h+s*1.2,pz+s*.8,shade([.58,.58,.6],.85+r*.3))}
  else if(ho>3&&r<.5){pbox(G,px-.01,h,pz-.01,px+.01,h+.08,pz+.01,[.3,.55,.22]);const fc=[[.9,.3,.35],[.95,.85,.3],[.6,.4,.9],[1,1,1]][(r*8|0)%4];pbox(G,px-.025,h+.08,pz-.025,px+.025,h+.11,pz+.025,fc)}
  else if(r<.45){const c=shade(gc,.8+r*.3);pbox(G,px-.01,h,pz-.01,px+.01,h+.06+r*.08,pz+.01,c);pbox(G,px+.012,h,pz-.008,px+.03,h+.05+r*.06,pz+.008,c);if(r<.08)pbox(G,px-.02,h+.09,pz-.02,px+.02,h+.115,pz+.02,[.95,.9,.35])}}}
/* the world ends in a cut: earth and stone walls down the map border, and the rivers that reach it end in a wall of water */
function waterSkirt(G,x,y,h){for(let q=0;q<4;q++){const dx=q===0?1:q===1?-1:0,dy=q===2?1:q===3?-1:0;if(!OB(x+dx,y+dy))continue;const k=[.9,.8,.95,.75][q];
 const face=(b,t,s,s2)=>{if(q===0)quad(G,[x+1,b,y],[x+1,t,y],[x+1,t,y+1],[x+1,b,y+1],[1,0,0],s,s2,s2,s);else if(q===1)quad(G,[x,b,y+1],[x,t,y+1],[x,t,y],[x,b,y],[-1,0,0],s,s2,s2,s);else if(q===2)quad(G,[x+1,b,y+1],[x+1,t,y+1],[x,t,y+1],[x,b,y+1],[0,0,1],s,s2,s2,s);else quad(G,[x,b,y],[x,t,y],[x+1,t,y],[x+1,b,y],[0,0,-1],s,s2,s2,s)};
 for(let b=SKB;b<h;b++){const s=shade(b<h-2?[.5,.5,.5]:DIRT,k*(.9+.2*hs(x*3+b,y*5,b)));face(b,b+1,s,s)}
 face(h,WLV,shade([.14,.33,.6],k),shade([.32,.6,.84],k))}}
function buildChunk(cx,cy){try{return buildChunk0(cx,cy)}finally{BMAT=0}}
const wetT=(x,y)=>{for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(gOK(x+i,y+j)&&ter[(y+j)*TW+x+i]===1)return true;return false};
function buildChunk0(cx,cy){const G=newG(),WG=newG(),x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH);
 const nh=(x,y,h)=>gOK(x,y)?HT[y*TW+x]:h;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x,h=HT[i],c=topCol(i,x,y);BMAT=wetT(x,y)?0:9;
  const rs=stairs.size?stairs.get(i):null;
  if(rs&&rs.nat){const hl=rs.lo,hh2=rs.hi,sg=rs.sg>0,ax=rs.ax,ns=Math.max(2,Math.round((hh2-hl)*2)),st=(hh2-hl)/ns,rc=shade(DIRT,.8*(.9+.2*hs(x,y,5))),gc=shade(c,.88);
   for(let k=0;k<ns;k++){const u0=k/ns,u1=(k+1)/ns,yt=hl+(k+1)*st,yb=yt-st,p0=sg?u0:1-u1,p1=sg?u1:1-u0,ck=shade(c,.96+.04*(k&1));
    if(ax===0){quad(G,[x+p0,yt,y],[x+p0,yt,y+1],[x+p1,yt,y+1],[x+p1,yt,y],[0,1,0],ck,ck,ck,ck);const rx=sg?x+p0:x+p1,nx=sg?-1:1;
     if(nx<0)quad(G,[rx,yb,y+1],[rx,yt,y+1],[rx,yt,y],[rx,yb,y],[-1,0,0],shade(rc,.75),gc,gc,shade(rc,.75));else quad(G,[rx,yb,y],[rx,yt,y],[rx,yt,y+1],[rx,yb,y+1],[1,0,0],shade(rc,.75),gc,gc,shade(rc,.75));
     for(const sd of[0,1]){const nb=nh(x,y+(sd?1:-1),h);if(nb>=yt)continue;const z=y+sd,yb2=Math.max(h,nb);if(sd)quad(G,[x+p1,yb2,z],[x+p1,yt,z],[x+p0,yt,z],[x+p0,yb2,z],[0,0,1],rc,rc,rc,rc);else quad(G,[x+p0,yb2,z],[x+p0,yt,z],[x+p1,yt,z],[x+p1,yb2,z],[0,0,-1],rc,rc,rc,rc)}}
    else{quad(G,[x,yt,y+p0],[x,yt,y+p1],[x+1,yt,y+p1],[x+1,yt,y+p0],[0,1,0],ck,ck,ck,ck);const rz=sg?y+p0:y+p1,nz=sg?-1:1;
     if(nz<0)quad(G,[x,yb,rz],[x,yt,rz],[x+1,yt,rz],[x+1,yb,rz],[0,0,-1],shade(rc,.75),gc,gc,shade(rc,.75));else quad(G,[x+1,yb,rz],[x+1,yt,rz],[x,yt,rz],[x,yb,rz],[0,0,1],shade(rc,.75),gc,gc,shade(rc,.75));
     for(const sd of[0,1]){const nb=nh(x+(sd?1:-1),y,h);if(nb>=yt)continue;const xx=x+sd,yb2=Math.max(h,nb);if(sd)quad(G,[xx,yb2,y+p0],[xx,yt,y+p0],[xx,yt,y+p1],[xx,yb2,y+p1],[1,0,0],rc,rc,rc,rc);else quad(G,[xx,yb2,y+p1],[xx,yt,y+p1],[xx,yt,y+p0],[xx,yb2,y+p0],[-1,0,0],rc,rc,rc,rc)}}}
   {const bxn=ax===0?(sg?x+1:x-1):x,byn=ax===0?y:(sg?y+1:y-1),nb=nh(bxn,byn,h);if(nb<hh2){const yb2=Math.max(h,nb),s=shade(rc,.85);if(ax===0){const X=sg?x+1:x;if(sg)quad(G,[X,yb2,y],[X,hh2,y],[X,hh2,y+1],[X,yb2,y+1],[1,0,0],s,s,s,s);else quad(G,[X,yb2,y+1],[X,hh2,y+1],[X,hh2,y],[X,yb2,y],[-1,0,0],s,s,s,s)}else{const Z=sg?y+1:y;if(sg)quad(G,[x+1,yb2,Z],[x+1,hh2,Z],[x,hh2,Z],[x,yb2,Z],[0,0,1],s,s,s,s);else quad(G,[x,yb2,Z],[x,hh2,Z],[x+1,hh2,Z],[x+1,yb2,Z],[0,0,-1],s,s,s,s)}}}
   if(false){
const hl=rs.lo,hh2=rs.hi,sg=rs.sg>0,a0=sg?hl:hh2,a1=sg?hh2:hl,nn=rs.ax===0?[-(a1-a0),1,0]:[0,1,-(a1-a0)],nl=Math.hypot(...nn),n2=nn.map(v=>v/nl),c2=shade(c,.97);
   if(rs.ax===0)quad(G,[x,a0,y],[x,a0,y+1],[x+1,a1,y+1],[x+1,a1,y],n2,c2,c2,c2,c2);else quad(G,[x,a0,y],[x,a1,y+1],[x+1,a1,y+1],[x+1,a0,y],n2,c2,c2,c2,c2);
   const sc=shade(DIRT,.85*(.9+.2*hs(x,y,5)));
   for(const sd of[0,1]){if(rs.ax===0){const z=y+sd,nb=nh(x,y+(sd?1:-1),h);if(nb>=hh2)continue;const xl=sg?x:x+1,xh=sg?x+1:x,nz=sd?1:-1;tri(G,[xl,h,z],[xh,h,z],[xh,hh2,z],[0,0,nz],sc)}
    else{const xx=x+sd,nb=nh(x+(sd?1:-1),y,h);if(nb>=hh2)continue;const zl=sg?y:y+1,zh=sg?y+1:y,nx=sd?1:-1;tri(G,[xx,h,zl],[xx,h,zh],[xx,hh2,zh],[nx,0,0],sc)}}}}
  else if(pth[i]&&ter[i]===0&&!occ.has(i))pathTop(G,i,x,y,h,topCol(i,x,y,1));
  else{const oc=(xx,yy)=>gOK(xx,yy)&&HT[yy*TW+xx]>h?1:0,av=(a,b,cn)=>a&&b?3:a+b+cn,L=oc(x-1,y),Rr=oc(x+1,y),U=oc(x,y-1),D=oc(x,y+1),a0=av(L,U,oc(x-1,y-1)),a1=av(L,D,oc(x-1,y+1)),a2=av(Rr,D,oc(x+1,y+1)),a3=av(Rr,U,oc(x+1,y-1));
   if(a0|a1|a2|a3){const c0=shade(c,AOK[a0]),c1=shade(c,AOK[a1]),c2=shade(c,AOK[a2]),c3=shade(c,AOK[a3]);if(a0+a2>a1+a3)quad(G,[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[x,h,y],[0,1,0],c1,c2,c3,c0);else quad(G,[x,h,y],[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[0,1,0],c0,c1,c2,c3)}
   else quad(G,[x,h,y],[x,h,y+1],[x+1,h,y+1],[x+1,h,y],[0,1,0],c,c,c,c)}
  if(ter[i]===1){const cv=(a,b)=>{let ld=0,dp=0,n=0;for(const[u,v]of[[a-2,b-2],[a-1,b-2],[a,b-2],[a+1,b-2],[a-2,b-1],[a-1,b-1],[a,b-1],[a+1,b-1],[a-2,b],[a-1,b],[a,b],[a+1,b],[a-2,b+1],[a-1,b+1],[a,b+1],[a+1,b+1]]){n++;if(!gOK(u,v)||ter[v*TW+u]!==1){if(Math.abs(u-a+.5)<1&&Math.abs(v-b+.5)<1)ld++;continue}dp+=Math.min(4,WLV-HT[v*TW+u])}const t=Math.min(1,dp/n/2.6),c=[.24-.13*t,.5-.2*t,.7-.12*t];if(!ld)return c;const f=Math.min(.22,ld*.07);return[c[0]+(.86-c[0])*f,c[1]+(.94-c[1])*f,c[2]+(.96-c[2])*f]};quad(WG,[x,WLV,y],[x,WLV,y+1],[x+1,WLV,y+1],[x+1,WLV,y],[0,1,0],cv(x,y),cv(x,y+1),cv(x+1,y+1),cv(x+1,y));if(x===0||y===0||x===TW-1||y===TH-1)waterSkirt(G,x,y,h)}
  let e;const capOK=ter[i]===0&&!pth[i]&&h-LAND<8&&!(ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1);
  for(let q=0;q<4;q++){const dx=q===0?1:q===1?-1:0,dy=q===2?1:q===3?-1:0,k=[.9,.8,.95,.75][q];e=OB(x+dx,y+dy)?SKB:nh(x+dx,y+dy,h);
   const face=(b,t,s,sb)=>{sb=sb||s;if(q===0)quad(G,[x+1,b,y],[x+1,t,y],[x+1,t,y+1],[x+1,b,y+1],[1,0,0],sb,s,s,sb);
    else if(q===1)quad(G,[x,b,y+1],[x,t,y+1],[x,t,y],[x,b,y],[-1,0,0],sb,s,s,sb);
    else if(q===2)quad(G,[x+1,b,y+1],[x+1,t,y+1],[x,t,y+1],[x,b,y+1],[0,0,1],sb,s,s,sb);
    else quad(G,[x,b,y],[x,t,y],[x+1,t,y],[x+1,b,y],[0,0,-1],sb,s,s,sb)};
   for(let b=e;b<h;b++){const t=b+1,dep=h-t;let s=shade(sideCol(i,b,x,y),k);
    if(ter[i]!==5&&h-LAND<9&&t<WLV+99){if(dep>=3&&dep>=0&&h-LAND<15)s=shade([.5,.5,.5],k*(.9+.2*hs(x*3+b,y*5,b)))}
    if(t<=WLV&&ter[(y+dy)*TW+x+dx]===1){const dd=Math.max(0,Math.min(1,(WLV-t)/4));s=shade([.36-.14*dd,.32-.1*dd,.24-.04*dd],k)}
    const sb=b===e&&ter[(y+dy)*TW+x+dx]!==1?shade(s,.7):s;if(t===h&&capOK){face(b,t-.28,s,sb);face(t-.28,t,shade(c,k*.92))}else face(b,t,s,sb)}}}
 const m=new THREE.Mesh(toGeo(G),matT);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);
 let w=null;if(WG.P.length){w=new THREE.Mesh(toGeo(WG),matWater);scene.add(w)}return{m,w}}
/* ---- props (trees, rocks, gold, flowers) merged per chunk ---- */
const LEAF=[['#3f7f2a','#4a8e32','#336f22','#5a9c3a'],['#46862e','#549638','#3a7626','#62a442'],['#3a7a34','#468a3e','#2f6a2a','#56984a']],PINEC=[['#2f7a4a','#3d8f58','#276a3e','#4ea068'],['#2a6e48','#37835a','#215c3a','#46966a']],BIRCH=['#a8c85a','#bcd86a','#92b04a','#d0e684'];





function forestGeo(v){const G=newG(),R=rngf(v*389+17),L=LEAF[v%3],T='#5b4326';bxc(G,0,0,0,.3,.6,.3,T);bxc(G,.02,.2,.151,.1,.12,.02,'#4a361e');
 const lc=()=>[L[0],L[1],L[2],L[0]][(R()*4)|0];for(const[a,b]of[[-.25,-.25],[.25,-.25],[-.25,.25],[.25,.25]]){bxc(G,a,.55,b,.5,.5,.5,lc());if(R()<.78)bxc(G,a,1.05,b,.5,.5,.5,lc())}
 if(v>=1){bxc(G,0,1.55,0,.5,.5,.5,lc())}if(v===2){bxc(G,.25,1.55,-.25,.5,.25,.5,lc())}if(v>=3){bxc(G,-.25,1.55,.25,.5,.5,.5,lc());bxc(G,.25,1.55,.25,.5,.25,.5,lc())}
 if(v%2&&R()<.5)bxc(G,.26,.8,.51,.08,.08,.02,'#c8282a');return toGeo(G)}
const FOR=[0,1,2,3,4,5].map(forestGeo);
/* ---- Minecraft-style props: everything built from .3 cubes ---- */
const MC_=.3;
function mcLeaves(G,R,cols,layers,s){layers.forEach(([y,pat])=>{const cells=pat==='sq'?[[-1,-1],[0,-1],[1,-1],[-1,0],[0,0],[1,0],[-1,1],[0,1],[1,1]]:pat==='plus'?[[0,0],[1,0],[-1,0],[0,1],[0,-1]]:[[0,0]];
  cells.forEach(([a,b])=>{if(pat==='sq'&&a&&b&&R()<.22)return;bxc(G,a*MC_*s,y*s,b*MC_*s,MC_*s*1.02,MC_*s*1.02,MC_*s*1.02,cols[(R()*cols.length)|0])})})}
function oakGeo(v){const G=newG(),R=rngf(v*977+13),L=LEAF[v%3],s=.95+(v>>1)*.1;
 for(let k=0;k<3;k++)bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,k%2?'#6b4a2a':'#5b3f22');
 mcLeaves(G,R,[L[0],L[1],L[2]],[[.6,'sq'],[.9,'sq'],[1.2,'plus'],[1.5,'one']],s);
 if(v%3===1)[[.3,.9,.45],[-.35,.6,.42]].forEach(([x,y,z])=>bxc(G,x*s,y*s,z*s,.1,.1,.1,'#e04a3a'));return toGeo(G)}
function pineGeo(v){const G=newG(),R=rngf(v*733+5),L=PINEC[v%2],s=.95+(v>>1)*.15;
 for(let k=0;k<4;k++)bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,k%2?'#4f3418':'#3f2a14');
 mcLeaves(G,R,[L[0],L[1],L[2]],[[.45,'sq'],[.75,'plus'],[1.05,'sq'],[1.35,'plus'],[1.65,'one'],[1.95,'one']],s);
 if(v>1)[[1.65,0,0],[1.35,.3,0],[1.35,-.3,0]].forEach(([y,x,z])=>bxc(G,x*s,(y+.27)*s,z*s,.2,.06,.2,'#eef4f2'));return toGeo(G)}
function birchGeo(v){const G=newG(),R=rngf(v*511+3),s=.95+v*.1;
 for(let k=0;k<4;k++){bxc(G,0,k*MC_*s,0,MC_*s,MC_*s,MC_*s,'#e8e4d8');if(k%2===0)bxc(G,.03,k*MC_*s+.05,MC_*s/2,.12,.06,.03,'#2a2a2a')}
 mcLeaves(G,R,[BIRCH[0],BIRCH[1],BIRCH[2]],[[.9,'sq'],[1.2,'sq'],[1.5,'plus'],[1.8,'one']],s);return toGeo(G)}
function rockGeo(v){const G=newG(),R=rngf(v*331+9),C=[['#9aa1ac','#a9b0bb','#7e8590'],['#868d98','#9ea5b0','#6a717e'],['#a8aeb8','#b8bec8','#8c929e'],['#707784','#868d9a','#5a606c'],['#9c9a92','#adab9f','#7f7d74'],['#8a9098','#9aa0aa','#6f757f']][v%6];
 bxc(G,0,0,0,.75,.4,.75,C[0]);bxc(G,.18,.4,.1,.42,.3,.42,C[1]);bxc(G,-.25,0,-.3,.34,.3,.34,C[2]);if(v%2)bxc(G,-.28,.3,-.28,.2,.14,.2,C[0]);bxc(G,-.3,.4,.2,.2,.08,.22,'#5d8a4a');
 [[.2,.2,.38],[-.2,.1,.38],[.38,.25,-.1]].forEach(([x,y,z])=>bxc(G,x,y,z,.14,.14,.05,C[2]));return toGeo(G)}
function goldGeo(v){const G=newG();bxc(G,0,0,0,.8,.8,.8,'#7d7d7d');
 [[-.2,.2,.41],[.2,.5,.41],[0,.62,.41],[.41,.3,-.1],[.41,.55,.2],[-.41,.4,.0],[-.15,.82,.1],[.1,.82,-.2],[-.1,.1,-.41],[.25,.35,-.41]].forEach(([x,y,z],k)=>{const q=k%3?.18:.24;bxc(G,x,y,z,Math.abs(x)>.4?.06:q,q,Math.abs(z)>.4?.06:q,k%2?'#ffd23c':'#f0b020')});
 bxc(G,0,.8,0,.5,.04,.5,'#8d8d8d');return toGeo(G)}
const VAR={t:[0,1,2,3,4,5].map(oakGeo).concat([0,1,2,3].map(pineGeo)).concat([0,1,2].map(birchGeo)),r:[0,1,2,3,4,5].map(rockGeo),g:[0,1,2].map(goldGeo)};
/* decor (grass-level, non blocking) */
function bushGeo(v){const G=newG(),L=LEAF[v%3];bxc(G,0,0,0,.44,.38,.44,L[0]);bxc(G,.12,.2,.12,.22,.22,.22,L[1]);bxc(G,-.14,.06,-.1,.2,.2,.2,L[2]);if(v%2)[[.18,.3,.22],[-.2,.22,.16],[.1,.12,-.23]].forEach(([x,y,z])=>bxc(G,x,y,z,.06,.06,.06,'#c8282a'));return toGeo(G)}
function flowerGeo(v){const G=newG(),C=[['#f0f0e8','#e8c020'],['#f0d020','#e8a010'],['#c8282a','#2a2a2a'],['#4a6ad8','#2a3a8a'],['#b060d8','#7a2a9a']][v%5];[[0,0],[.2,.14],[-.16,.12]].forEach(([x,z],k)=>{const h=.18+.05*(k%2);bxc(G,x,0,z,.03,h,.03,'#3f7f2a');bxc(G,x+.04,h*.4,z,.06,.03,.03,'#4a8e32');bxc(G,x,h,z,.1,.08,.1,C[0]);bxc(G,x,h+.03,z,.04,.06,.04,C[1])});return toGeo(G)}
function tuftGeo(v){const G=newG(),c=['#4a8e32','#5a9c3a','#3f7f2a'];[[0,0,.32],[.07,.05,.24],[-.07,.04,.28],[.03,-.07,.22],[-.04,-.06,.2],[.1,-.02,.18]].forEach(([x,z,h],k)=>bxc(G,x,0,z,.03,h,.03,c[k%3]));return toGeo(G)}
function mushGeo(v){const G=newG();bxc(G,0,0,0,.06,.12,.06,'#e8e0d0');bxc(G,0,.12,0,.18,.08,.18,'#c8282a');[[.05,.2,.05],[-.05,.2,-.04]].forEach(([x,y,z])=>bxc(G,x,y,z,.04,.01,.04,'#ffffff'));bxc(G,.15,0,.1,.04,.08,.04,'#e8e0d0');bxc(G,.15,.08,.1,.1,.04,.1,'#9a6a4a');return toGeo(G)}
function reedGeo(v){const G=newG();[[0,0,.75],[.11,.06,.9],[-.09,.08,.6]].forEach(([x,z,h])=>{for(let y=0;y<h;y+=.15){bxc(G,x,y,z,.05,.14,.05,'#94c86a');bxc(G,x,y+.13,z,.06,.02,.06,'#6a9a48')}bxc(G,x+.04,h*.6,z,.06,.02,.03,'#a8d878')});return toGeo(G)}
function logGeo(v){const G=newG();bxc(G,0,0,0,.8,.24,.24,'#5b4326');bxc(G,.4,0,0,.02,.24,.24,'#a88a52');bxc(G,-.4,0,0,.02,.24,.24,'#a88a52');bxc(G,.4,.08,0,.025,.08,.08,'#8a6a3a');bxc(G,-.1,.24,.02,.2,.03,.14,'#4a8e32');return toGeo(G)}
const DEC={b:[0,1,2].map(bushGeo),f:[0,1,2,3,4].map(flowerGeo),t:[0,1].map(tuftGeo),m:[mushGeo(0)],r:[reedGeo(0)],l:[logGeo(0)]};
function mergeVar(G,geo,x,y,z,rk,sc,sy){const p=geo.attributes.position.array,n=geo.attributes.normal.array,c=geo.attributes.color.array,ix=geo.index.array,o=G.P.length/3,cs=[1,0,-1,0][rk],sn=[0,1,0,-1][rk];
 for(let k=0;k<p.length;k+=3){const px=p[k]*sc,pz=p[k+2]*sc;G.P.push(x+px*cs+pz*sn,y+p[k+1]*sy,z-px*sn+pz*cs);G.N.push(n[k]*cs+n[k+2]*sn,n[k+1],-n[k]*sn+n[k+2]*cs);G.C.push(c[k],c[k+1],c[k+2])}
 for(let k=0;k<ix.length;k++)G.I.push(ix[k]+o)}
const FCOL=['#ffffff','#ffe14a','#ff8fb8','#ff5a5a','#b48cff'].map(rgb),TUFT=rgb('#3f8a38');
function buildProps(cx,cy){const G=newG(),x0=cx*CH,y0=cy*CH,x1=Math.min(TW,x0+CH),y1=Math.min(TH,y0+CH);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*TW+x,v=ter[i],h=hs(x,y,4),hh=HT[i],al=hh-LAND;
  if(v===0){if(pth[i]||occ.has(i)||stairs.has(i)||hh<LAND)continue;const q=hs(x,y,201);if(q>.07)continue;
   const jx0=(hs(x,y,61)-.5)*.5,jy0=(hs(x,y,62)-.5)*.5,rk0=(hs(x,y,63)*4)|0,wet=ter[i+1]===1||ter[i-1]===1||ter[i+TW]===1||ter[i-TW]===1;
   if(wet){if(q<.05)mergeVar(G,DEC.r[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1+hs(x,y,66)*.6);continue}if(FLG[i]&12)continue;
   if(al>=9||FLG[i]&1)continue;
   if(q<.022)mergeVar(G,DEC.f[(hs(x,y,202)*5)|0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   else if(q<.04)mergeVar(G,DEC.t[(hs(x,y,203)*2)|0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1+hs(x,y,67)*.5);
   else if(q<.056)mergeVar(G,DEC.b[(hs(x,y,204)*3)|0],x+.5+jx0*.6,hh,y+.5+jy0*.6,rk0,.9+hs(x,y,68)*.4,.9+hs(x,y,69)*.4);
   else if(q<.062)mergeVar(G,DEC.m[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   else if(q<.066&&fb(x*.03,y*.03,SEED+88)>.5)mergeVar(G,DEC.l[0],x+.5+jx0,hh,y+.5+jy0,rk0,1,1);
   continue}
  if(v===1||v===5)continue;
  const jx=(hs(x,y,61)-.5)*.3,jy=(hs(x,y,62)-.5)*.3,rk=(hs(x,y,63)*4)|0,sc=.85+hs(x,y,65)*.3,sy=sc*(.9+hs(x,y,64)*.25);
  if(v===2){let nb=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&gOK(x+dx,y+dy)&&ter[i+dy*TW+dx]===2)nb++;
   if(nb>=3)mergeVar(G,FOR[(h*6)|0],x+.5,hh,y+.5,(hs(x,y,63)*4)|0,1,1);else mergeVar(G,VAR.t[0],x+.5,hh,y+.5,0,1,1)}
  else if(v===3)mergeVar(G,VAR.r[(hs(x,y,6)*6)|0],x+.5+jx,hh,y+.5+jy,rk,sc,sy);
  else mergeVar(G,VAR.g[(hs(x,y,8)*3)|0],x+.5+jx,hh,y+.5+jy,rk,1,1)}
 if(!G.P.length)return null;const m=new THREE.Mesh(toGeo(G),matV);m.castShadow=SHADOWS;m.receiveShadow=SHADOWS;scene.add(m);return m}
function dropChunk(k){const o=CHK.get(k);if(!o)return;for(const q of[o.m,o.w,o.p])if(q){scene.remove(q);q.geometry.dispose()}CHK.delete(k)}
function loadChunk(cx,cy){const k=keyOf(cx,cy);if(MP.on)for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=cx+i,y=cy+j;if(x>=0&&y>=0&&x<NCX&&y<NCY&&!genF[y*NCX+x])return}for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)genChunk(cx+i,cy+j);const o=buildChunk(cx,cy);o.p=buildProps(cx,cy);CHK.set(k,o)}
function updateChunks(ms){const t0=performance.now(),cx0=(CAM.x/CH)|0,cy0=(CAM.z/CH)|0;
 for(const k of dirtyT){dirtyT.delete(k);const o=CHK.get(k);if(!o)continue;for(const q of[o.m,o.w])if(q){scene.remove(q);q.geometry.dispose()}const n=buildChunk(k%NCX,(k/NCX)|0);o.m=n.m;o.w=n.w}
 for(const k of dirtyP){dirtyP.delete(k);const o=CHK.get(k);if(!o)continue;if(o.p){scene.remove(o.p);o.p.geometry.dispose()}o.p=buildProps(k%NCX,(k/NCX)|0)}
 const need=[];for(let j=-RM;j<=RM;j++)for(let i=-RM;i<=RM;i++){const cx=cx0+i,cy=cy0+j;if(cx<0||cy<0||cx>=NCX||cy>=NCY)continue;if(!CHK.has(keyOf(cx,cy)))need.push([i*i+j*j,cx,cy])}
 need.sort((a,b)=>a[0]-b[0]);for(const[,cx,cy]of need){if(performance.now()-t0>ms)break;loadChunk(cx,cy)}
 for(const[k]of CHK){const cx=k%NCX,cy=(k/NCX)|0;if(Math.abs(cx-cx0)>RM+1||Math.abs(cy-cy0)>RM+1)dropChunk(k)}}
/* ================= FOG OF WAR (shader-level, works on every material) ================= */
const FWC=2,FW=Math.ceil(TW/FWC),FH=Math.ceil(TH/FWC);
const fowVis=new Uint8Array(FW*FH),fowSeen=new Uint8Array(FW*FH),fowTex=new Uint8Array(FW*FH);
const fowT=new THREE.DataTexture(fowTex,FW,FH,THREE.LuminanceFormat,THREE.UnsignedByteType);fowT.minFilter=fowT.magFilter=THREE.LinearFilter;fowT.generateMipmaps=false;fowT.wrapS=fowT.wrapT=THREE.ClampToEdgeWrapping;fowT.unpackAlignment=1;
const FOWU={tFow:{value:fowT},fowP:{value:new THREE.Vector4(1/TW,1/TH,0,0)}};
const LITN=320,litTex=new Uint8Array(LITN*LITN),litT=new THREE.DataTexture(litTex,LITN,LITN,THREE.LuminanceFormat,THREE.UnsignedByteType);litT.minFilter=litT.magFilter=THREE.LinearFilter;litT.generateMipmaps=false;litT.wrapS=litT.wrapT=THREE.ClampToEdgeWrapping;litT.unpackAlignment=1;FOWU.tLit={value:litT};FOWU.litP={value:new THREE.Vector4(0,0,1/LITN,0)};
THREE.Material.prototype.onBeforeCompile=function(sh){
 if(!sh.vertexShader.includes('#include <fog_vertex>')||!sh.fragmentShader.includes('#include <fog_fragment>')||!(sh.vertexShader.includes('#include <begin_vertex>')||sh.vertexShader.includes('vec3 transformed')))return;
 sh.uniforms.tFow=FOWU.tFow;sh.uniforms.fowP=FOWU.fowP;sh.uniforms.tLit=FOWU.tLit;sh.uniforms.litP=FOWU.litP;
 sh.vertexShader='varying vec2 vFow;\n'+sh.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\n{vec4 fp=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nfp=instanceMatrix*fp;\n#endif\nfp=modelMatrix*fp;vFow=fp.xz;}');
 sh.fragmentShader='uniform sampler2D tFow;uniform sampler2D tLit;uniform vec4 fowP;uniform vec4 litP;varying vec2 vFow;\n'+sh.fragmentShader.replace('#include <fog_fragment>','#include <fog_fragment>\nif(fowP.w>.5){vec2 fq=vFow*fowP.xy;float fv=texture2D(tFow,fq).r;float fk=fv<.5?mix(.0,.4,fv*2.):mix(.4,1.,(fv-.5)*2.);vec3 c=gl_FragColor.rgb;if(fowP.z>.01){vec2 lq=(vFow-litP.xy)*litP.z;float L=(lq.x>0.&&lq.y>0.&&lq.x<1.&&lq.y<1.)?texture2D(tLit,lq).r:0.;c*=mix(1.,.1+.9*L,fowP.z);c=mix(c,c*vec3(1.12,.94,.76),fowP.z*L*.35);}c*=mix(vec3(.62,.7,.88),vec3(1.),smoothstep(.45,.95,fk));gl_FragColor.rgb=mix(vec3(.01,.014,.03),c,fk);}')};
/* the pixel shaders of blocks, units and water used to replace this hook (the 3D fog of war had silently vanished): chain it back in */
const FOWH=THREE.Material.prototype.onBeforeCompile;
{const wrap=f=>{const g=function(sh,r){f.call(this,sh,r);FOWH.call(this,sh,r)},k=f.toString()+'/*fow*/';g.toString=()=>k;return g};matV.onBeforeCompile=wrap(matV.onBeforeCompile);matWater.onBeforeCompile=wrap(matWater.onBeforeCompile);UNITSH=wrap(UNITSH)}
const matT=matV.clone();matT.onBeforeCompile=matV.onBeforeCompile;matT.defines={TERR:''};
const FOWC=cvs(FW,FH),FOWG=FOWC.getContext('2d'),FOWI=FOWG.createImageData(FW,FH),FLUT=new Uint8Array(256);
for(let i=0;i<256;i++)FLUT[i]=Math.round(i<128?238-(i/128)*112:126-((i-128)/127)*126);
for(let i=0;i<FW*FH;i++){FOWI.data[i*4]=6;FOWI.data[i*4+1]=9;FOWI.data[i*4+2]=16}
let fowTm=-9;const fowIdx=(x,y)=>Math.min(FH-1,Math.max(0,(y/TS/FWC)|0))*FW+Math.min(FW-1,Math.max(0,(x/TS/FWC)|0));
const fowVisAt=(x,y)=>fowTex[fowIdx(x,y)]>=190,fowSeenAt=(x,y)=>fowSeen[fowIdx(x,y)]>0;
const fowRA=new Uint8Array(FH),fowLo=new Int16Array(FH).fill(32767),fowHi=new Int16Array(FH).fill(-1);
function fowReset(){fowSeen.fill(0);fowTex.fill(0);fowVis.fill(0);fowTm=-9;fowT.needsUpdate=true;fowRA.fill(8);fowLo.fill(0);fowHi.fill(FW-1)}
function fowStamp(x,y,r){const cx=x/TS/FWC,cy=y/TS/FWC,rr=r/FWC,r2=rr*rr,r3=Math.max(0,rr-1.5)*Math.max(0,rr-1.5),x0=Math.max(0,Math.floor(cx-rr)),x1=Math.min(FW-1,Math.ceil(cx+rr)),y0=Math.max(0,Math.floor(cy-rr)),y1=Math.min(FH-1,Math.ceil(cy+rr));
 for(let j=y0;j<=y1;j++){fowRA[j]=8;if(x0<fowLo[j])fowLo[j]=x0;if(x1>fowHi[j])fowHi[j]=x1;const dy=j+.5-cy,dy2=dy*dy;for(let i=x0;i<=x1;i++){const dx=i+.5-cx,d=dx*dx+dy2;if(d>r2)continue;const k=j*FW+i,v=d<=r3?2:1;if(fowVis[k]<v)fowVis[k]=v}}}
const VRN={cannon:13,peasant:9,knight:11,archer:14,bannerman:11,captain:13,king:14,guard:11},VSN={castle:28,tower:19,barracks:13,gate:8,wall:6,market:9,torch:8,ballista:19,trebuchet:33,forester:9,guild:9};const vsnOf=s=>s.weapon?Math.max(VSN[s.type]||6,VSN[s.weapon]||0):(VSN[s.type]||6);
function fowUpdate(dt){fowTm-=dt;if(fowTm>0)return;fowTm=.2;
 for(const u of units)if(u.t===0&&u.hp>0)fowStamp(u.x,u.y,VRN[u.type]||10);
 for(const s of structs)if(s.t===0)fowStamp(s.x,s.y,s.prog>=1?vsnOf(s):4);
 if(SW.n){const st=Math.max(1,Math.ceil(SW.n/450));for(let i=0;i<SW.n;i+=st)if(SW.hp[i]>0)fowStamp(SW.x[i],SW.y[i],5)}
 for(const u of units)if(u.t===1&&u.hp>0&&u.lane>=0)fowStamp(u.x,u.y,5);
 /* a texel settles at most 6 refreshes after it was last in sight, so a row untouched for 8 refreshes is final */
 const im=FOWI.data;let r0=FH,r1=-1,c0=FW,c1=-1;
 for(let j=0;j<FH;j++){if(!fowRA[j])continue;fowRA[j]--;const lo=fowLo[j],hi=fowHi[j];if(j<r0)r0=j;r1=j;if(lo<c0)c0=lo;if(hi>c1)c1=hi;
  for(let k=j*FW+lo,ke=j*FW+hi;k<=ke;k++){const v=fowVis[k];let c=fowTex[k];if(v){fowVis[k]=0;fowSeen[k]=1;const t=v===2?255:205;c=c<t?Math.min(t,c+70):Math.max(t,c-30)}else{const t=fowSeen[k]?128:0;c=c<t?Math.min(t,c+70):Math.max(t,c-24)}fowTex[k]=c;im[k*4+3]=FLUT[c]}
  if(!fowRA[j]){fowLo[j]=32767;fowHi[j]=-1}}
 if(r1>=0){fowT.needsUpdate=true;FOWG.putImageData(FOWI,0,0,c0,r0,c1-c0+1,r1-r0+1)}}
