async()=>{//@PRELUDE
 grown('wave5');waveN=4;/* a level 2 King with talents belongs to a kingdom a few waves old, not to wave 0 */
 put(['forge','sanctuary','warroom','embassy']);
 let kg=kingOf(0);if(!kg){kg=mkU(0,'king',(CS.tx+3.5)*TS,(CS.ty+3.5)*TS,null,-1);units.push(kg)}
 settle(5);kingXp(kg,60);kingTalent0(0);kingTalent0(1);
 army(['knight','archer','knight','knight','archer','knight','archer','knight'],-4,5,4);
 kg.x=cast.x+TS*0;kg.y=cast.y+TS*6;
 for(const u of units)if(u.t===0&&u!==kg&&u.type!=='castle'){u.x=kg.x+(((u.id||units.indexOf(u))*37)%9-4)*TS*.8;u.y=kg.y+(((u.id||units.indexOf(u))*53)%7-3)*TS*.7}
 explore(30);kg.sk_cry=0;kingSkill0('cry');settle(3);calm(127);
 look(kg.x/TS,kg.y/TS-1.5,19,.95,.0);await quiet(5000);noToast();render3D(.05);Math.random=RR;return 'lvl '+kxLevel(kg)}
