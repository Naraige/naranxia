async()=>{//@PRELUDE
 put(['tower','tower','barracks','tower','barracks','tower']);
 army(['knight','archer','knight','archer','knight','archer','knight','knight','archer','archer'],-4,3,5);
 explore(30);settle(10);
 waveN=2;wave();/* wave 3 = blood moon: banner and a bigger horde */
 /* bring part of the horde next to the bastion so the night falls (it falls as the horde closes in) */
 let k=0;const put1=(o)=>{const a=k++,x=cast.x+(((a*37)%19)-9)*TS,y=cast.y+(7+(a*53)%5)*TS;o.x=x;o.y=y};
 for(let i=0;i<SW.n&&i<220;i++){SW.x[i]=cast.x+(((i*37)%21)-10)*TS;SW.y[i]=cast.y+(8+(i*53)%6)*TS}
 for(const u of units)if(u.t===1&&u.lane>=0&&k<80)put1(u);
 settle(3);look(CX,CY+3,24,.9,.0);
 await quiet(14000);render3D(.05);Math.random=RR;return JSON.stringify({n:units.filter(u=>u.t===1).length,sw:SW.n})}
