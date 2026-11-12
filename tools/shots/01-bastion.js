async()=>{//@PRELUDE
 put(['granary','bell','sanctuary','beacon','orchard','forge','embassy','warroom']);
 /* one ruin in view (real ruins lie 48+ tiles away): same record as world/terrain.js mkRuin */
 const rf=ft(CS.tx+2+10,CS.ty+2-6);RUINS.set('shot',{x:(rf[0]+.5)*TS,y:(rf[1]+.5)*TS,tx:rf[0],ty:rf[1],h:HT[rf[1]*TW+rf[0]],d:60,done:false,cx:0,cy:0,v:0});
 army(['knight','knight','archer','knight','archer','knight','brute','archer','knight','archer','knight','knight'],-4,4,6);
 army(['knight','archer','knight','archer'],-3,7,4);
 explore(30);settle(10);calm(95);look(CX,CY+2.5,26,.95,.0);await quiet(5000);noToast();render3D(.05);Math.random=RR;return 'ok'}
