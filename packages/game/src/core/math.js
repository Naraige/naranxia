export function hyp(a,b){return Math.sqrt(a*a+b*b)}

export const rnd=(a,b)=>a+Math.random()*(b-a),dist=(a,b,c,d)=>hyp(a-c,b-d);

export function hs(x,y,s){let h=Math.imul((x*16)|0,0x27d4eb2d)^Math.imul((y*16)|0,0x165667b1)^Math.imul((s*1024)|0,0x2c1b3c6d);h^=h>>>15;h=Math.imul(h,0x85ebca6b);h^=h>>>13;h=Math.imul(h,0xc2b2ae35);h^=h>>>16;return(h>>>0)/4294967296}

function vn(x,y,s){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),a=hs(xi,yi,s),b=hs(xi+1,yi,s),c=hs(xi,yi+1,s),d=hs(xi+1,yi+1,s);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}

export const fb=(x,y,s)=>vn(x,y,s)*.6+vn(x*2.1,y*2.1,s+9)*.3+vn(x*4.3,y*4.3,s+19)*.1;

export const hex=c=>c.length===4?[parseInt(c[1]+c[1],16),parseInt(c[2]+c[2],16),parseInt(c[3]+c[3],16)]:[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
