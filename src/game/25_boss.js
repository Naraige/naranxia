/* ================= WAVE BOSS (#7) =================
   Every 10th wave (10, 20, 30...) one giant brute joins the horde on the first route. It is a normal brute (flag `boss`, scale 1.6, much more
   hp) with a stomp every 6.5 s when something is within 3 tiles: it hurts every unit and building around it. All of it runs in the
   simulation with its own timer `bt` (sim time), so both co-op machines agree; the units keep the flag in saves (units are saved whole). */
function bossSpawn(L0){if(waveN%10||waveN<10||!L0.length)return;const L=L0[0],an=spawnAnchor(L),zu=mkU(1,'brute',an.p[0]*TS,an.p[1]*TS,null,L);
 zu.boss=1;zu.sv=1.6;zu.hp*=3.5+waveN*.25;zu.bmax=zu.hp;zu.ph=an.ph;units.push(zu);bannerS2='BOSS - a giant brute walks with the horde! '+bannerS2}
function bossStomp(u){const R=TS*3.4,x=u.x,y=u.y;snd('boom',x,y);ring(x,y,'#d8c090',22,300);puff(x,y,'#8a7058',14,100,{T:.8,z:.3,vz:3.4,g:9,s:.15});shake(.4);
 for(const s of structs)if(s.hp>0&&s.t!==1&&s.prog>=1){const dd=Math.max(0,dist(s.x,s.y,x,y)-(s.rad||20));if(dd<R)s.hp-=(70+waveN*5)*(1-dd/R*.6)*(s.type==='castle'||s.type==='keep'?.5:1)}
 for(const e of units)if(e.t===0&&e.hp>0&&!e.gar&&!e.shel){const dd=Math.max(0,dist(e.x,e.y,x,y)-T[e.type].r);if(dd<R){e.hp-=(18+waveN*1.2)*(1-dd/R*.6);e.hurt=.25}}}
function bossAI(u,dt){u.bt=(u.bt||3)-dt;if(u.bt>0)return;const[b]=target(u,TS*3,0);if(b){u.bt=6.5;bossStomp(u)}else u.bt=.4}
function bossBar(UW,y){let b=null;for(const u of units)if(u.boss&&u.hp>0){b=u;break}if(!b)return 0;const bw=Math.min(240,UW-40),bx=Math.round((UW-bw)/2),by=y+11;
 TC('BOSS',UW/2,y+1,'#e9b6ff',.85);ctx.fillStyle='#000';ctx.fillRect(bx-1,by-1,bw+2,8);ctx.fillStyle='#2a0e3c';ctx.fillRect(bx,by,bw,6);const fw=Math.max(1,Math.round(bw*Math.max(0,Math.min(1,b.hp/(b.bmax||b.hp)))));
 ctx.fillStyle='#a63cff';ctx.fillRect(bx,by,fw,6);ctx.fillStyle='#d9a0ff';ctx.fillRect(bx,by,fw,1);return 20}
