/* ================= CO-OP SHARED GOALS (#11) =================
   Two goals run at the same time in a co-op game: reach wave 5, 10, 15... and slay 150, 375... zombies together. Reaching one pays BOTH players.
   Pure simulation (checked once per update from waveN and kills, which are equal on both machines), the progress is OBJ, saved with the game. */
function objReset(){OBJ={w:1,k:1}}
const objWave=()=>OBJ.w*5,objKills=()=>Math.round(150*OBJ.k*(1+.25*OBJ.k));
function objTick(){if(!MP.on||over||!inGame)return;
 if(waveN>=objWave()){const k=OBJ.w,g=150*k,w=100*k,s=100*k;OBJ.w++;for(const R of RESP){R.g+=g;R.w+=w;R.s+=s}msgS='Co-op goal: wave '+(k*5)+' reached! Both players get +'+g+' gold, +'+w+' wood, +'+s+' stone';msgT=8;if(typeof snd==='function')snd('click')}
 if(kills>=objKills()){const k=OBJ.k,g=120*k,f=50*k;OBJ.k++;for(const R of RESP){R.g+=g;R.f=(R.f||0)+f}msgS='Co-op goal: zombies slain together! Both players get +'+g+' gold, +'+f+' food';msgT=8}}
function objBar(UW,y){if(!MP.on||over||!inGame)return 0;const a='Co-op goals: wave '+objWave()+' (now '+waveN+')',b='  /  zombies slain '+objKills()+' (now '+kills+')';
 TC(a+b,UW/2,y+1,'#9fe3ff',.72);return 13}
