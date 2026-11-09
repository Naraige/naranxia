import { snd } from '../audio/sound.js';
import { dist, rnd } from '../core/math.js';
import { zcount } from './zombie-lanes.js';
import { solidAt } from '../world/traversal.js';
import { target } from '../gameplay/combat.js';
import { mkU } from '../gameplay/entities.js';
import { T, TS } from '../gameplay/rules.js';
import { sessionState } from '../gameplay/session.js';
import { spawnAnchor } from '../gameplay/waves.js';
import { TC } from '../i18n/language.js';
import { puff, ring, shake } from '../rendering/effects.js';
import { canvasesState } from '../ui/canvases.js';

/* ================= WAVE BOSS (#7) =================
   Every 10th wave (10, 20, 30...) one giant brute joins the horde on the first route. It is a normal brute (flag `boss`, scale 1.6, much more
   hp) with a stomp every 6.5 s when something is within 3 tiles: it hurts every unit and building around it. All of it runs in the
   simulation with its own timer `bt` (sim time), so both co-op machines agree; the units keep the flag in saves (units are saved whole). */
/* named bosses (lore: the old world's fallen leaders), by order of appearance; the index is stored on the unit */
export const BOSSN=['The Hollow Warden','The Bell-Bearer','The Frost King','The Hive Queen'];
/* legend shown on the banner when each boss appears (same order as BOSSN); text only, no effect on the simulation */
export const BOSSL=['Once he guarded the old gates. Now he guards nothing.','He rang the last bell of the old world. The dead still answer.','He ruled the northern snows. The cold still obeys him.','She fed a whole city to her brood. The brood remembers.'];
/* kingdom journal: sessionState.jrn = [[wave, kind (0 boss arrives, 1 boss falls), boss index], ...] (numbers only, saved in SAVA, absent = empty) */
export function jrnAdd(k,bn){const J=sessionState.jrn||(sessionState.jrn=[]);if(J.length<200)J.push([sessionState.waveN|0,k,bn|0])}
export function bossFell(u){jrnAdd(1,u.bn);sessionState.bannerT=4.5;sessionState.bannerS='BOSS SLAIN';sessionState.bannerS2=BOSSN[u.bn|0]+' - has fallen'}
export function bossSpawn(L0){if(sessionState.waveN%10||sessionState.waveN<10||!L0.length)return;const L=L0[0],an=spawnAnchor(L),zu=mkU(1,'brute',an.p[0]*TS,an.p[1]*TS,null,L);
 zu.boss=1;zu.bn=(sessionState.waveN/10-1)%BOSSN.length;zu.sv=1.6;zu.hp*=3.5+sessionState.waveN*.25;zu.bmax=zu.hp;zu.ph=an.ph;sessionState.units.push(zu);jrnAdd(0,zu.bn);sessionState.bannerS2=BOSSN[zu.bn]+' - '+BOSSL[zu.bn]}

export function bossStomp(u){const R=TS*3.4,x=u.x,y=u.y;snd('boom',x,y);ring(x,y,'#d8c090',22,300);puff(x,y,'#8a7058',14,100,{T:.8,z:.3,vz:3.4,g:9,s:.15});shake(.4);
 for(const s of sessionState.structs)if(s.hp>0&&s.t!==1&&s.prog>=1){const dd=Math.max(0,dist(s.x,s.y,x,y)-(s.rad||20));if(dd<R)s.hp-=(70+sessionState.waveN*5)*(1-dd/R*.6)*(s.type==='castle'||s.type==='keep'?.5:1)}
 for(const e of sessionState.units)if(e.t===0&&e.hp>0&&!e.gar&&!e.shel){const dd=Math.max(0,dist(e.x,e.y,x,y)-T[e.type].r);if(dd<R){e.hp-=(18+sessionState.waveN*1.2)*(1-dd/R*.6)*(e.wcT>sessionState.time?e.wcP||1:1);e.hurt=.25}}}

/* each named boss has one more ability on its own timer `bs` (sim time, saved with the unit):
   0 Hollow Warden regrows 4 % hp every 12 s, 1 Bell-Bearer calls 6 husks every 16 s, 2 Frost King chills troops within 6 tiles every 9 s,
   3 Hive Queen lays 4 runners every 12 s. Summons use the same seeded rnd as the wave spawns, so both co-op machines agree. */
function bossPower(u,dt){u.bs=(u.bs||8)-dt;if(u.bs>0)return;const n=u.bn|0,x=u.x,y=u.y,wn=sessionState.waveN;
 if(n===0){u.bs=12;u.hp=Math.min(u.bmax||u.hp,u.hp+(u.bmax||0)*.04);ring(x,y,'#b9ffb0',14,220)}
 else if(n===1||n===3){u.bs=n===1?16:12;const k=n===1?6:4,ty=n===1?'husk':'runner';snd('boom',x,y);ring(x,y,n===1?'#ffd070':'#e070ff',16,260);
  for(let i=0;i<k;i++){const px=x+rnd(-TS*2.2,TS*2.2),py=y+rnd(-TS*2.2,TS*2.2);if(solidAt(px,py)||zcount()>=720)continue;const z=mkU(1,ty,px,py,null,u.lane);z.hp*=1+.05*wn;z.ph=u.ph;sessionState.units.push(z)}}
 else{u.bs=9;ring(x,y,'#9ad8ff',20,320);puff(x,y,'#cfeaff',10,90,{T:.7,z:.3,vz:2.2,g:6,s:.14});const R=TS*6;
  for(const e of sessionState.units)if(e.t===0&&e.hp>0&&!e.gar&&!e.shel&&dist(e.x,e.y,x,y)<R){e.hp-=(8+wn*.8)*(e.wcT>sessionState.time?e.wcP||1:1);e.hurt=.25}}}

export function bossAI(u,dt){bossPower(u,dt);u.bt=(u.bt||3)-dt;if(u.bt>0)return;const[b]=target(u,TS*3,0);if(b){u.bt=6.5;bossStomp(u)}else u.bt=.4}

export function bossBar(UW,y){let b=null;for(const u of sessionState.units)if(u.boss&&u.hp>0){b=u;break}if(!b)return 0;const bw=Math.min(240,UW-40),bx=Math.round((UW-bw)/2),by=y+11;
 TC(BOSSN[b.bn|0]||'BOSS',UW/2,y+1,'#e9b6ff',.85);canvasesState.ctx.fillStyle='#000';canvasesState.ctx.fillRect(bx-1,by-1,bw+2,8);canvasesState.ctx.fillStyle='#2a0e3c';canvasesState.ctx.fillRect(bx,by,bw,6);const fw=Math.max(1,Math.round(bw*Math.max(0,Math.min(1,b.hp/(b.bmax||b.hp)))));
 canvasesState.ctx.fillStyle='#a63cff';canvasesState.ctx.fillRect(bx,by,fw,6);canvasesState.ctx.fillStyle='#d9a0ff';canvasesState.ctx.fillRect(bx,by,fw,1);return 20}
