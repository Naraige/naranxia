async()=>{//@PRELUDE
 put(['granary','sanctuary','orchard','forge','bell','beacon']);
 army(['knight','archer','knight','archer','knight','knight','archer'],-4,4,4);
 explore(30);waveN=5;wave();/* wave 6: merchant caravan (choice banner) */
 for(const u of units)if(u.t===1)u.hp=0;settle(90);
 calm(154);look(CX,CY+2.5,26,.95,.0);await quiet(3000);render3D(.05);Math.random=RR;return JSON.stringify({ev:EVS.cur&&EVS.cur.k})}
