/* ================= BLOCK WORLD (switch, default off) =================
   One block grid for the whole picture: BLK world units per block (0.5 = two blocks per tile, a unit is ~1.7 blocks tall),
   16 pixels per block. Visual only: the simulation heights, tiles and collisions are untouched.
   Parts (each can be kept or dropped once the King has answered the board, see docs/studio-boards/blocks/rows.json):
   terrain (block textures, grass lip, block paths, pixel water), decor (trees, rocks, ore, bushes, plants on the grid, with
   its own block size DBLK), build (building textures at 16 pixels per block), seasons (snow and autumn colours).
   The switch is read once at startup from localStorage `dk_blocks` ('1' = everything on, or a JSON object with the fields of
   blocksState, e.g. {"on":true,"DBLK":0.3333333333333333}) and can be flipped live with setBlocks(on, opts): the terrain
   chunks, the props and the shader uniforms follow; no simulation state is touched. */
export const blocksState = {
  on: true,
  /* world units per block: terrain (and building pixels), decor */
  BLK: 0.5,
  DBLK: 0.5,
  terrain: true,
  decor: true,
  build: true,
  seasons: true,
  /* derived: terrain / decor drawn as blocks right now */
  T: false,
  D: false,
  /* called after a change so the owners can rebuild their meshes */
  onChange: null,
};

/* shader uniforms: blocks per world unit for the terrain material and for the prop / building material (0 = off),
   and the pixels per world unit of the building textures (0 = the default 18) */
export const BLKU = { value: 0 };
export const BLKV = { value: 0 };
export const BPXU = { value: 0 };
/* season weights (spring, summer, autumn, winter), fed by the weather module: visual only */
export const BSEAS = { value: [1, 0, 0, 0] };
export function setSeasons(s) {
  const k = blocksState.on && blocksState.seasons;
  BSEAS.value[0] = k ? s[0] : 1;
  for (let i = 1; i < 4; i++) BSEAS.value[i] = k ? s[i] : 0;
}

/* material ids of the block kinds (attribute `mat` = 20 + kind, + 20 for terrain next to water) */
export const BK = {
  grass: 1,
  dirt: 2,
  stone: 3,
  sand: 4,
  snow: 5,
  gravel: 6,
  path: 7,
  cap: 8,
  cobble: 9,
  leaves: 10,
  bark: 11,
  ore: 12,
  rock: 13,
  pine: 14,
  birch: 15,
  plant: 16,
};

function apply() {
  const S = blocksState;
  S.T = S.on && S.terrain;
  S.D = S.on && S.decor;
  BLKU.value = S.T ? 1 / S.BLK : 0;
  BLKV.value = S.D ? 1 / S.DBLK : 0;
  BPXU.value = S.on && S.build ? 16 / S.BLK : 0;
  if (!(S.on && S.seasons)) setSeasons([1, 0, 0, 0]);
}

/* opts: a block size (terrain and decor), or an object with any field of blocksState */
export function setBlocks(on, opts) {
  blocksState.on = !!on;
  if (typeof opts === "number" && opts > 0) blocksState.BLK = blocksState.DBLK = opts;
  else if (opts && typeof opts === "object")
    for (const k of ["BLK", "DBLK", "terrain", "decor", "build", "seasons"]) if (k in opts) blocksState[k] = opts[k];
  apply();
  if (blocksState.onChange) blocksState.onChange();
}

export function initializeBlocks() {
  let v = null;
  try {
    v = localStorage.getItem("dk_blocks");
  } catch {
    /* A blocked store leaves the default block-rendering settings active. */
  }
  if (v === "1") blocksState.on = true;
  else if (v && v[0] === "{") {
    try {
      const o = JSON.parse(v);
      blocksState.on = o.on !== false;
      for (const k of ["BLK", "DBLK", "terrain", "decor", "build", "seasons"]) if (k in o) blocksState[k] = o[k];
    } catch {
      /* Ignore malformed saved graphics options and keep initialized defaults. */
    }
  }
  apply();
}

/* GLSL: pixel texture of a block face. m = block kind, c = base colour, pc = pixel coordinates (16 per block),
   fz = face seed, up = top face, pf / bf = pixel and block detail left at this distance (1 near, 0 far) */
export const GLBLK = `
uniform float uBlk;uniform float uBpx;uniform vec4 uSeas;
float bq4(float t,float a,float b,float c,float d){return t<.22?a:(t<.58?b:(t<.86?c:d));}
vec3 blkTex(float m,vec3 c,vec2 pc,float fz,bool up,float pf,float bf,vec3 wp){
 vec2 pin=mod(pc,16.),bid=floor(pc/16.);float pn=hn3(vec3(pc,fz)),bn=hn3(vec3(bid,fz+1.)),t=1.,e=1.;
 bool ed=pin.x<.5||pin.y<.5;float aut=uSeas.z,win=uSeas.w;
 if(m==1.||m==8.){t=bq4(pn,.82,.94,1.04,1.13);if(hn3(vec3(floor(pc*.5),fz+2.))>.86)t*=.9;
  c*=mix(vec3(1.),vec3(1.06,1.03,.9),uSeas.y*.5);c=mix(c,c.g*vec3(1.2,.98,.5),aut*.28);if(ed)e=up?.95:1.;
  if(win>.01&&hn3(vec3(pc,9.1))<win*1.1-.08){c=vec3(.9,.93,.97);t=pn<.15?.94:1.;}}
 else if(m==2.||m==7.){float p2=hn3(vec3(floor((pc+vec2(bn*7.,0.))*.5),fz+2.));t=p2<.16?.82:bq4(pn,.92,.99,1.04,1.1);if(p2>.93)t=1.16;if(ed)e=m==7.?.9:(up?.95:.9);
  if(up&&win>.01&&hn3(vec3(pc,9.1))<win*.5-.08){c=vec3(.9,.93,.97);t=1.;}}
 else if(m==3.||m==13.||m==12.){float r=pc.y,sx=floor((pc.x+floor(hn3(vec3(r,bid.x,fz))*5.))/3.);t=bq4(hn3(vec3(sx,r,fz+3.)),.87,.96,1.03,1.1)*(.97+.06*pn);
  if(m==13.){float row=floor(pc.y/8.),bx=mod(pc.x+mod(row,2.)*4.,8.);if(mod(pc.y,8.)<.5||bx<.5)t*=.76;if(bn>.6&&pn>.7)c*=vec3(.8,1.,.72);}
  else if(ed)e=up?.93:.86;
  if(m==12.){vec2 cq=floor(pc/4.),q=mod(pc,4.);float g=hn3(vec3(cq,fz+7.)),k=hn3(vec3(pc,fz+8.));if(g>.4&&q.x>.5&&q.y>.5&&k>.14){c=k>.7?vec3(1.,.92,.4):vec3(1.,.74,.12);t=1.;}}
  if(up&&win>.01&&hn3(vec3(pc,9.1))<win*.7-.08){c=vec3(.9,.93,.97);t=1.;}}
 else if(m==4.){t=pn<.14?.93:(pn>.86?1.06:1.);if(ed)e=.96;}
 else if(m==5.){t=pn<.12?.95:(pn>.9?1.03:1.);if(ed)e=.97;}
 else if(m==6.){t=bq4(hn3(vec3(floor(pc*.5),fz+5.)),.8,.94,1.05,1.16)*(.97+.06*pn);if(ed)e=.92;}
 else if(m==9.){float row=floor(pc.y/4.),sx=pc.x+mod(row,2.)*3.;t=bq4(hn3(vec3(floor(sx/6.),row,fz)),.86,.96,1.04,1.12)*((mod(pc.y,4.)<.5||mod(sx,6.)<.5)?.66:1.);}
 else if(m==10.||m==14.){t=bq4(pn,.7,.9,1.04,1.18);if(ed)e=.86;
  if(m==10.){float a=vn3(wp*.42+7.);vec3 ac=a<.4?vec3(.93,.74,.2):(a<.58?vec3(.9,.48,.15):vec3(.72,.25,.14));c=mix(c,ac*(.7+.6*c.g),aut*.92);c=mix(c,vec3(dot(c,vec3(.3,.5,.2)))*vec3(1.05,.95,.8),win*.55);}
  if(win>.01&&hn3(vec3(pc,9.1))<(up?win*1.05:win*.22)-.06){c=vec3(.92,.95,.98);t=1.;}}
 else if(m==11.||m==15.){
  if(up){float rg=max(abs(pin.x-7.5),abs(pin.y-7.5));c=m==15.?c*vec3(.95,.9,.74):c*vec3(1.5,1.38,1.1);t=rg>6.6?(m==15.?.9:.6):(mod(floor(rg),2.)<.5?1.08:.92);}
  else if(m==11.){float st=hn3(vec3(pc.x,floor((pc.y+floor(hn3(vec3(pc.x,0.,fz))*6.))/5.),fz));t=bq4(st,.78,.94,1.04,1.14);}
  else{t=pn<.2?.95:1.02;if(hn3(vec3(floor((pc.x+floor(pc.y)*2.)/3.),pc.y,fz))>.86&&hn3(vec3(pc.y,1.,fz))>.35)t=.28;}}
 else{t=bq4(pn,.9,.97,1.03,1.08);}
 return c*mix(1.,t,pf)*mix(1.,e,bf)*(m<6.5?.94+.12*bn:1.);}
`;
