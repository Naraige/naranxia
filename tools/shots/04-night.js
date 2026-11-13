async()=>{//@PRELUDE
 put(['tower','tower','barracks','tower','barracks','tower']);
 army(['knight','archer','knight','archer','knight','archer','knight','knight','archer','archer'],-4,3,5);
 explore(30);settle(10);grown('market');
 startWave(3);/* wave 3 = blood moon: banner and a bigger horde */
 /* bring part of the horde next to the bastion: the night falls as the horde closes in (nightLv, set by nightTick every half second of
    simulation while the horde is on), and the picture darkens over the next frames (nightK eases toward it in applyDay) */
 let k=0;const put1=(o)=>{const a=k++,x=cast.x+(((a*37)%19)-9)*TS,y=cast.y+(7+(a*53)%5)*TS;o.x=x;o.y=y};
 for(let i=0;i<SW.n&&i<220;i++){SW.x[i]=cast.x+(((i*37)%21)-10)*TS;SW.y[i]=cast.y+(8+(i*53)%6)*TS}
 for(const u of units)if(u.t===1&&u.lane>=0&&k<80)put1(u);
 settle(8);look(CX,CY+3,24,.9,.0);
 await quiet(14000);noToast();render3D(.05);Math.random=RR;return JSON.stringify({n:units.filter(u=>u.t===1).length,sw:SW.n,waveOn,hordeOn,nightLv:+nightLv.toFixed(2),nightK:+nightK.toFixed(2)})}
