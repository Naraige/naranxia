import { GQU } from './scene.js';
import { THREE } from './three.js';

/* ================= HD SURFACES =================
   smooth procedural detail in world space (no more 16x16 pixel noise), sharpened by distance-aware fading,
   per-pixel lighting with micro relief, material-aware: grass blades, stone cracks, earth strata, sand ripples */
export const GLN=`
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

export const LMU={value:1.4};
/* 0 by day, 1 at night: lights the window glass (material 8) of every building */
export const NGU={value:0};

/* ink: an anti-aliased line of constant screen width along an iso-contour of a value */
const GLINK=`
float inkL(float v,float lv,float w){float dv=max(fwidth(v),1e-4);return 1.-smoothstep(w*dv*.5,w*dv*1.6,abs(v-lv));}
float sdSeg(vec2 p,vec2 a,vec2 b){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);return length(pa-ba*h);}
`;

/* ARCANE-STYLE SURFACES: hand-painted brush strokes (warm / cool), flat painted planes, black ink contours in every texture,
   banded "toon" light with cool shadows and warm light, ink hatching inside the shadows */
export let matV;

export let matWater;
export const WUT = {value:0};

export let matT;

export function initializeMaterials() {
  matV = new THREE.MeshPhongMaterial({vertexColors:true,shininess:9,specular:0x0a0a0a});

  matV.userData.NGU=NGU;
  matV.onBeforeCompile=sh=>{sh.uniforms.uHQ=GQU;sh.uniforms.uLMax=LMU;sh.uniforms.uNight=NGU;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;attribute float mat;varying float vMat;').replace('#include <begin_vertex>','#include <begin_vertex>\nvMat=mat;\n#ifdef USE_INSTANCING\nvWP=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n#else\nvWP=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWP;varying float vMat;uniform float uHQ;uniform float uLMax;uniform float uNight;'+GLN+GLBUMP+GLINK).replace('#include <color_fragment>',`#include <color_fragment>
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
 float mId=floor(vMat+.5);if(mId>.5&&mId<9.5){kG=0.;kT=0.;kS=mId==1.?.55:0.;kD=mId==2.?1.:0.;kN=0.;}
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
  /* building materials, the block-game way: every brick, plank and roof tile gets one of 3-4 tones, shaded by pixels
     (ids 1 stone, 2 wood, 3 plaster, 6 tiles, 8 window glass, 9 thatch; units only use 0, 4, 5 and 7) */
  if(mId>.5){float pz=aN.y>.5?7.3:(aN.x>.5?3.1:5.7),pf=1.-.75*smoothstep(.6,1.7,fw*PXS),ry=mod(pc.y,4.);bool up=aN.y>.5;
   if(mId==1.){vec2 bid=up?floor(pc/8.):vec2(floor((pc.x+mod(row,2.)*4.)/8.),row);float bt=hn3(vec3(bid,pz+1.));
    float tn=bt<.22?.86:(bt<.58?.96:(bt<.86?1.04:1.13)),bv=up?1.:(ry>2.5?1.07:(ry<1.5?.93:1.));
    cS=c0*mix(1.,tn*bv,pf)*(.95+.1*pn)*mix(1.,.6,mor);if(bt>.93&&pn>.5)cS*=mix(vec3(1.),vec3(.8,.96,.74),pf);cO=cS;}
   else if(mId==2.){vec2 kid=up?vec2(floor(pc.x/4.),floor((pc.y+floor(pc.x/4.)*5.)/16.)):vec2(floor((pc.x+prow*5.)/16.),prow);float kt=hn3(vec3(kid,pz+2.));
    float tn=kt<.3?.88:(kt<.72?1.:1.09),gr=hn3(up?vec3(pc.x,floor(pc.y/3.),pz):vec3(floor(pc.x/3.),pc.y,pz))>.74?.9:1.;
    cW=c0*mix(1.,tn*gr,pf)*(.96+.08*pn)*mix(1.,.66,pli);}
   else if(mId==3.){float b=hn3(vec3(floor(pc/2.),pz));cO=c0*mix(1.,b<.1?.9:(b>.92?1.06:1.),pf)*(.97+.06*pn);}
   else if(mId==6.){float tr=floor(pc.y/4.),sx=pc.x+mod(tr,2.)*2.,tt=hn3(vec3(floor(sx/4.),tr,pz+3.));
    float ln=(ry<.5||mod(sx,4.)<.5)?1.:0.,tn=tt<.3?.87:(tt<.7?1.:1.11),lip=(!up&&ry>2.5)?1.08:1.;
    cO=c0*mix(1.,tn*lip,pf)*(.96+.08*pn)*mix(1.,.68,ln*max(pf,.4));}
   else if(mId==9.){float jt=floor(hn3(vec3(pc.x,1.,pz))*5.),sg=floor((pc.y+jt)/5.),st=hn3(vec3(pc.x,sg,pz+4.));
    float tn=st<.28?.82:(st<.7?1.:1.13),ed=mod(pc.y+jt,5.)<.5?.8:1.;cO=c0*mix(1.,tn*ed,pf)*(.97+.06*pn);}
   else if(mId==8.){float dg=mod(pc.x+pc.y,7.);cO=c0*(dg<1.?1.3:(dg<2.?1.12:.94));}
  }
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
  nI*=1.-h1*.42*(1.-.55*kT)*(vMat>4.5&&vMat<5.5?0.:1.)*((vMat>.5&&vMat<3.5)||(vMat>5.5&&vMat<6.5)||vMat>7.5?.3:1.);
  if(vMat>3.5&&vMat<4.5){vec3 Vv=normalize(vViewPosition);float fr=pow(1.-clamp(dot(normal,Vv),0.,1.),2.2);nI=nI*1.08+vec3(1.,.86,.56)*fr*.75*uLMax+vec3(1.,.95,.8)*smoothstep(.62,.9,r)*.35*uLMax;}
  reflectedLight.directDiffuse=alb*nI;reflectedLight.indirectDiffuse=vec3(0.);
  if(vMat>4.5&&vMat<5.5){reflectedLight.directDiffuse=alb*.3*uLMax;totalEmissiveRadiance+=alb*1.35;}
  /* window glass: candle-lit after dusk (a few houses stay dark) */
  if(vMat>7.5&&vMat<8.5&&uNight>.01){float lt=smoothstep(.22,.4,vn3(vWP*.8+3.))*uNight;vec3 wm=vec3(1.,.72,.34)*(.8+.4*vn3(vWP*9.));
   reflectedLight.directDiffuse=mix(reflectedLight.directDiffuse,wm*.25*uLMax,lt);totalEmissiveRadiance+=wm*lt*1.15;}}`).replace('#include <dithering_fragment>','#include <dithering_fragment>\n{gl_FragColor.rgb*=vec3(1.02,1.,.97);}');};
  matWater = new THREE.MeshPhongMaterial({vertexColors:true,transparent:true,opacity:.84,depthWrite:true,shininess:140,specular:0xa0b0bc});

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
}

export function initializeTerrainMaterial() {
  matT = matV.clone();
  matT.onBeforeCompile=matV.onBeforeCompile;
  matT.defines={TERR:''};
}
