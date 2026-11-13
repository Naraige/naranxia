async()=>{//@PRELUDE
 put(['granary','sanctuary','orchard','forge','bell','beacon']);
 army(['knight','archer','knight','archer','knight','knight','archer'],-4,4,4);
 explore(30);grown('siege');
 /* wave 6 brings the merchant caravan (choice banner). The first seconds of the raid, as a player sees them: the bar counts the horde,
    which is still far away, so it is still day (the picture used to show "Next 2:34" over a raid bar: wave() without its flags) */
 startWave(6);settle(30);look(CX,CY+2.5,26,.95,.0);await quiet(3000);noToast();render3D(.05);Math.random=RR;return JSON.stringify({ev:EVS.cur&&EVS.cur.k})}
