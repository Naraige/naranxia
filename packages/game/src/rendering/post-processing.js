import { sessionState } from '../gameplay/session.js';
import { nightK } from './lighting.js';
import { renderer } from './scene.js';
import { THREE } from './three.js';

/* ================= ARCANE POST-PROCESS =================
   pass 1: the scene into a colour + depth target; pass 2: black ink outlines where the depth bends or jumps (silhouettes AND creases),
   painted sky, painterly grade (cool shadows, warm light, rich colour, soft S-curve, vignette); pass 3: FXAA */
export let POST;

let _pv;
let _pm;

export function postRender(scn,cmr,sky){const P=POST;if(!P.ok){renderer.render(scn,cmr);return}
 renderer.getDrawingBufferSize(_pv);const w=_pv.x|0,h=_pv.y|0;
 if(w!==P.w||h!==P.h||!P.rt){P.w=w;P.h=h;if(P.rt){P.rt.depthTexture.dispose();P.rt.dispose();P.rt2.dispose()}
  P.rt=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.NearestFilter,magFilter:THREE.NearestFilter,format:THREE.RGBAFormat,depthBuffer:true,stencilBuffer:false});P.rt.depthTexture=new THREE.DepthTexture(w,h);P.rt.depthTexture.type=renderer.capabilities.isWebGL2?THREE.FloatType:THREE.UnsignedIntType;
  P.rt2=new THREE.WebGLRenderTarget(w,h,{minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,format:THREE.RGBAFormat,depthBuffer:false,stencilBuffer:false});
  P.U.tC.value=P.rt.texture;P.U.tD.value=P.rt.depthTexture;P.U2.tC.value=P.rt2.texture;P.U.px.value.set(1/w,1/h)}
 const U=P.U;U.nf.value.set(cmr.near,cmr.far);U.lw.value=Math.max(1.25,renderer.getPixelRatio()*1.2);U.uN.value=typeof nightK==='number'?nightK:0;U.uT.value=sessionState.clockT;U.uSky.value=sky?1:0;U.uInk.value=1;
 if(scn.fog){U.fogR.value.set(scn.fog.near,scn.fog.far);U.uHor.value.copy(scn.fog.color)}else U.fogR.value.set(1e4,2e4);
 U.uZen.value.copy(U.uHor.value).multiply(_zenK.setRGB(.5+.12*U.uN.value,.64-.1*U.uN.value,.94));
 cmr.updateMatrixWorld();_pm.multiplyMatrices(cmr.projectionMatrix,cmr.matrixWorldInverse);U.uIPV.value.copy(_pm).invert();U.uCam.value.setFromMatrixPosition(cmr.matrixWorld);
 renderer.setRenderTarget(P.rt);renderer.render(scn,cmr);renderer.setRenderTarget(P.rt2);renderer.render(P.sc,P.cam);renderer.setRenderTarget(null);renderer.render(P.sc2,P.cam)}

let _zenK;

export function initializePostProcessing() {
  POST = (()=>{const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
   const FS=`uniform sampler2D tC,tD;uniform vec2 px,nf,fogR;uniform float lw,uN,uT,uSky,uInk;uniform mat4 uIPV;uniform vec3 uCam,uHor,uZen;varying vec2 vUv;
 float W(vec2 u){float d=texture2D(tD,u).x;return(nf.y-d*(nf.y-nf.x))/(nf.x*nf.y);}
 float hs2(vec2 p){p=fract(p*vec2(.1031,.103));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
 float vn2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(hs2(i),hs2(i+vec2(1.,0.)),f.x),mix(hs2(i+vec2(0.,1.)),hs2(i+vec2(1.,1.)),f.x),f.y);}
 void main(){vec3 c=texture2D(tC,vUv).rgb;float d0=texture2D(tD,vUv).x;
  if(d0>=.99999){if(uSky>.5){vec4 pw=uIPV*vec4(vUv*2.-1.,1.,1.);vec3 rd=normalize(pw.xyz/pw.w-uCam);float el=clamp(rd.y,0.,1.);
    vec3 sky=mix(uHor,uZen,smoothstep(0.,.55,el));vec2 cp=rd.xz/(rd.y+.18)*1.4+vec2(uT*.012,uT*.004);
    float cl=vn2(cp)*.58+vn2(cp*2.3+3.)*.3+vn2(cp*5.2+7.)*.12;float cm=smoothstep(.5,.66,cl)*smoothstep(.02,.22,el);
    sky=mix(sky,mix(uHor*1.1+vec3(.07,.05,.03),vec3(1.,.92,.84),.45),cm*.7);float ce=(1.-smoothstep(0.,.05,abs(cl-.5)))*smoothstep(.02,.22,el);sky=mix(sky,sky*.55,ce*.5);c=sky;}}
  else if(uInk>.5){vec2 o=px*lw;
   float w0=W(vUv),wl=W(vUv-vec2(o.x,0.)),wr=W(vUv+vec2(o.x,0.)),wd=W(vUv-vec2(0.,o.y)),wu=W(vUv+vec2(0.,o.y)),wa=W(vUv+o),wb=W(vUv-o),wc=W(vUv+vec2(o.x,-o.y)),we=W(vUv+vec2(-o.x,o.y));
   float lap=abs(wl+wr-2.*w0)+abs(wd+wu-2.*w0)+.5*(abs(wa+wb-2.*w0)+abs(wc+we-2.*w0));
   float jmp=max(max(abs(wl-w0),abs(wr-w0)),max(abs(wd-w0),abs(wu-w0)));
   float z=1./w0,e=max(smoothstep(.0035,.011,lap/w0),smoothstep(.02,.06,jmp/w0));
   e*=1.-smoothstep(fogR.x,mix(fogR.x,fogR.y,.7),z);
   c=mix(c,c*vec3(.07,.06,.09),e*.95);}
  float L=dot(c,vec3(.299,.587,.114));c=mix(vec3(L),c,1.08);
  vec3 cool=mix(vec3(.85,.96,1.1),vec3(.8,.78,1.16),uN),warm=mix(vec3(1.06,1.,.9),vec3(1.14,.9,.86),uN);
  c*=mix(cool,warm,smoothstep(.12,.72,L));c=clamp(c,0.,1.);c=mix(c,c*c*(3.-2.*c),.32);
  vec2 q=vUv-.5;c*=1.-dot(q,q)*.5;gl_FragColor=vec4(c,1.);}`;
   const FX=`uniform sampler2D tC;uniform vec2 px;uniform float uVig;varying vec2 vUv;
 void main(){vec3 nw=texture2D(tC,vUv+vec2(-1.,-1.)*px).rgb,ne=texture2D(tC,vUv+vec2(1.,-1.)*px).rgb,sw=texture2D(tC,vUv+vec2(-1.,1.)*px).rgb,se=texture2D(tC,vUv+vec2(1.,1.)*px).rgb,m=texture2D(tC,vUv).rgb;
  vec3 lu=vec3(.299,.587,.114);float a=dot(nw,lu),b=dot(ne,lu),c=dot(sw,lu),d=dot(se,lu),e=dot(m,lu),mn=min(e,min(min(a,b),min(c,d))),mx=max(e,max(max(a,b),max(c,d)));
  vec2 dir=vec2(-((a+b)-(c+d)),((a+c)-(b+d)));float rd=max((a+b+c+d)*.03125,1./128.),rcp=1./(min(abs(dir.x),abs(dir.y))+rd);dir=clamp(dir*rcp,vec2(-8.),vec2(8.))*px;
  vec3 A=.5*(texture2D(tC,vUv+dir*(1./3.-.5)).rgb+texture2D(tC,vUv+dir*(2./3.-.5)).rgb),B=A*.5+.25*(texture2D(tC,vUv-dir*.5).rgb+texture2D(tC,vUv+dir*.5).rgb);
  float l=dot(B,lu);vec3 o=(l<mn||l>mx)?A:B;if(uVig>0.){vec2 rs=1./px,p=(vUv-.5)*rs;float r0=min(rs.x,rs.y)*.45,r1=length(rs)*.62;o=mix(o,vec3(.0314,.0235,.0627),.38*uVig*clamp((length(p)-r0)/(r1-r0),0.,1.));}gl_FragColor=vec4(o,1.);}`;
   const U={tC:{value:null},tD:{value:null},px:{value:new THREE.Vector2(1,1)},nf:{value:new THREE.Vector2(.3,420)},fogR:{value:new THREE.Vector2(50,140)},lw:{value:1},uN:{value:0},uT:{value:0},uSky:{value:1},uInk:{value:1},
    uIPV:{value:new THREE.Matrix4()},uCam:{value:new THREE.Vector3()},uHor:{value:new THREE.Color()},uZen:{value:new THREE.Color()}};
   const geo=new THREE.PlaneGeometry(2,2),mk=(fs,u)=>{const m=new THREE.Mesh(geo,new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false}));m.frustumCulled=false;const sc=new THREE.Scene();sc.add(m);return sc};
   const U2={tC:{value:null},px:U.px,uVig:{value:0}};
   return{U,U2,sc:mk(FS,U),sc2:mk(FX,U2),cam:new THREE.OrthographicCamera(-1,1,1,-1,0,1),rt:null,rt2:null,w:0,h:0,
    ok:renderer.capabilities.isWebGL2||!!renderer.extensions.get('WEBGL_depth_texture')}})();
  _pv = new THREE.Vector2();
  _pm = new THREE.Matrix4();
  _zenK = new THREE.Color();
}
