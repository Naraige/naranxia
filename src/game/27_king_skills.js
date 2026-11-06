/* ================= KING SKILLS (#8) =================
   War cry [<]: every unit of yours within 10 tiles hits 35% harder for 8 s (45 s cooldown).
   Royal charge [>]: the King runs 2.2x faster and hits 1.8x harder for 4 s and throws every zombie within 3 tiles for damage (35 s cooldown).
   In co-op the key sends a command (kingSkill wrapper + case 'ks' in mpExec); timers use sim time and live on the King (units are saved whole). */
const KSK={cry:{cd:45,name:'War cry',key:'cry'},charge:{cd:35,name:'Royal charge',key:'charge'}};
function kingOf(p){for(const u of units)if(u.t===0&&u.type==='king'&&u.hp>0&&!u.kdead&&(u.pl|0)===p)return u;return null}
const kskLeft=(k,n)=>Math.max(0,(k['sk_'+n]||0)-time);
function kingSkill0(n){const k=kingOf(CURPL|0);if(!k||!KSK[n]||kskLeft(k,n)>0)return;k['sk_'+n]=time+KSK[n].cd;
 if(n==='cry'){for(const a of units)if(a.t===0&&a.hp>0&&(a.pl|0)===(k.pl|0)&&dist(a.x,a.y,k.x,k.y)<TS*10)a.wcT=time+8;ring(k.x,k.y,'#ffd23c',34,340);ring(k.x,k.y,'#fff3c0',20,200);snd('horn',k.x,k.y);shake(.15);msgS='War cry!';msgT=2}
 else{k.chT=time+4;for(const e of units)if(e.t===1&&e.hp>0&&dist(e.x,e.y,k.x,k.y)<TS*3){e.hp-=60+waveN*2;e.hurt=.25}puff(k.x,k.y,'#e8d8a8',14,120,{T:.6,z:.2,vz:1.2,g:-.3,s:.2});snd('boom',k.x,k.y);shake(.2);msgS='Royal charge!';msgT=2}}
function kingTick(){for(const u of units)if(u.t===0&&u.type==='king'){u.spdK=u.chT>time?2.2:1}}
function kingBar(UW,y){const k=started&&!over?kingOf(CURPL|0):null;if(!k)return 0;const w=Math.min(112,(UW-24)/2),x0=Math.round(UW/2-w-3);
 [['cry','War cry','<'],['charge','Royal charge','>']].forEach(([n,lab,def],i)=>{const l=kskLeft(k,n),ky=kdisp(KB[n]||def),act=(n==='cry'?k.wcT:k.chT)>time;
  pill(x0+i*(w+6),y,w,15,l>0?lab+' ['+ky+'] '+Math.ceil(l)+'s':lab+' ['+ky+']',act?GRN:BTN,act?GRNH:BTNH,()=>kingSkill(n),null,.68,act,l>0)});return 19}
function kingSkill(n){kingSkill0(n)}/* replaced in 18_coop.js by the command wrapper */
