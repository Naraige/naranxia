export const inputState = {
  ptr: null,
  box: null,
  panMode: false,
  mouse: {x:-1,y:-1},
  DPR: 1,
  /* touch mode (set by a first finger touch or a coarse pointer): bigger UI scale, 44 px hit slop, long-press tips, floating buttons. Visual and input only. */
  touch: (()=>{try{return matchMedia('(pointer:coarse)').matches}catch(e){return false}})(),
  lp: null,
};

export let keys = {};
