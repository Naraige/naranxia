import { diagnosticsState } from '../debug/diagnostics.js';
import { LPL } from './players.js';

/* ---- Minecraft-style advancements (toasts) ---- */
export const ACH=new Set(),TOASTS=[];

export const ACHD={house:['Home Sweet Home','Build a house'],barracks:['Call to Arms','Build a barracks'],academy:['Enchanter','Build an academy'],farm:['A Seedy Place','Build a farm'],storage:['Storage Box','Build a storage'],tower:['Watchtower','Build a tower'],wall:['Stone Wall','Build a wall'],gate:['Open Sesame','Build a gate'],keep:['Keep Calm','Merge four towers into a keep'],move:['Moving Day','Move your castle'],
 w1:['Survivor','Survive your first wave'],w5:['Night Watch','Survive 5 waves'],w10:['Monsters Hunted','Survive 10 waves'],k1:['Monster Hunter','Slay a zombie'],k100:['Zombie Slayer','Slay 100 zombies'],k500:['The End?','Slay 500 zombies'],res:['Getting an Upgrade','Finish a research']};

export function ach(k){if(diagnosticsState.DEVU||ACH.has(k)||!ACHD[k])return;ACH.add(k);TOASTS.push({k,t:0});if(TOASTS.length>3)TOASTS.shift()}

export function achB(s){if((s.pl|0)!==LPL())return;ach(s.type)}
