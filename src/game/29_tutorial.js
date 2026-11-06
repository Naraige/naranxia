/* ================= GUIDED TUTORIAL (#16) =================
   A short list of steps (about five minutes) shown at the top of the screen in a solo game, the first time only (or until skipped).
   Each step completes by itself when the game state shows it was done; nothing here touches the simulation. Restart it from the Esc menu. */
const TUTS=[
 ['Select your peasants: click one, or double-click to take them all',()=>units.some(u=>u.t===0&&u.type==='peasant'&&u.sel)],
 ['Right-click a tree, a rock or gold: your peasants gather it',()=>units.some(u=>u.t===0&&u.type==='peasant'&&(u.job||u.carry))],
 ['Build a house in the Town menu to raise your population limit',()=>structs.some(s=>s.t===0&&s.type==='house')],
 ['Train a knight in the Train bar: knights fight the zombies',()=>units.some(u=>u.t===0&&u.type==='knight')],
 ['Build walls or a tower in the Defense menu to hold the lanes',()=>structs.some(s=>s.t===0&&(s.type==='wall'||s.type==='tower'))],
 ['Try a spike trap in the Defense menu: zombies on it get hurt',()=>SPK.size>0],
 ['Zombies follow the red lines: the top bar counts down to the wave',()=>waveN>=1],
 ['Research Stonemasonry in the castle menu to build in stone',()=>RS.on||RS.done],
 ['Well done! Seasons change every 4 waves, a boss comes every 10. Good luck!',()=>false]];
function tutStart(force){let seen=false;try{seen=localStorage.getItem('dk_tut')==='1'}catch(e){}TUT.on=!!force||(!seen&&!MP.on&&!DEVU);TUT.i=0}
function tutEnd(){TUT.on=false;try{localStorage.setItem('dk_tut','1')}catch(e){}}
function tutBar(UW,y){if(!TUT.on||over||MP.on||!inGame||!started)return 0;
 while(TUT.i<TUTS.length-1&&TUTS[TUT.i][1]())TUT.i++;
 const n=TUT.i+1,last=TUT.i===TUTS.length-1,head='Tutorial '+n+'/'+TUTS.length,txt=TUTS[TUT.i][0],sw=last?64:42,w=Math.min(UW-12,Math.max(tw(txt,.85),tw(head,.75))+sw+26),x=Math.round((UW-w)/2);
 frame(x,y,w,28,CHAT,8);T_(head,x+9,y+4,'#f2d48a',.72);T_(txt,x+9,y+15,'#ffffff',.85);
 pill(x+w-sw-6,y+6,sw,16,last?'Close':'Skip',BTN,BTNH,()=>{tutEnd()},null,.7);return 32}
