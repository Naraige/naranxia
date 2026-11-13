import { TH, TW } from '../gameplay/rules.js';
import { CH, FLG, HT, LAND, mg, pth, SNOW, ter } from './terrain-state.js';

export function mmRGB(i){const v=ter[i],h=HT[i];if(v===1)return FLG[i]&4?[74,150,196]:[45,111,174];if(v===0&&FLG[i]&4&&h<=LAND+1)return[214,200,150];if(v===2)return[42,116,56];if(v===3)return[154,161,172];if(v===4)return[255,210,60];if(pth[i]===2)return[146,150,162];if(pth[i])return[169,123,73];
 if(v===5)return h>=SNOW?[238,242,248]:[138,143,153];const k=Math.max(0,Math.min(1,(h-LAND)/24));return[(79+60*k)|0,(157-20*k)|0,(69+30*k)|0]}

export function mmChunk(cx,cy){const x0=cx*CH,y0=cy*CH,w=Math.min(CH,TW-x0),h=Math.min(CH,TH-y0),im=mg.createImageData(w,h);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=mmRGB((y0+y)*TW+x0+x),o=(y*w+x)*4;im.data[o]=c[0];im.data[o+1]=c[1];im.data[o+2]=c[2];im.data[o+3]=255}mg.putImageData(im,x0,y0)}

export function mmTile(i){const c=mmRGB(i);mg.fillStyle='rgb('+c[0]+','+c[1]+','+c[2]+')';mg.fillRect(i%TW,(i/TW)|0,1,1)}
