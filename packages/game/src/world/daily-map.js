import { rngf } from '../core/random.js';
import { mpWorldSync } from '../multiplayer/lobby.js';
import { terrainState } from './terrain.js';

/* ---- daily map ---- */
export function dailyMap(){const d=Math.floor(Date.now()/864e5),R=rngf(d*2654435761%4294967296);terrainState.SEED=R()*500;terrainState.GPR={fq:.009+R()*.007,wl:.28+R()*.08,mt:.5+R()*.1,rv:.008+R()*.008,rg:.93+R()*.03,am:.7+R()*.5,tr:.5+R()*.2,gd:.8+R()*.5,tc:.003+R()*.01};if(typeof mpWorldSync==='function')mpWorldSync()}
