#!/usr/bin/env python3
"""Builds j_board.js (the in-page render script) from tools/preview/j_show2.js (same shot() helper)."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
s=(ROOT/'tools/preview/j_show2.js').read_text(encoding='utf-8')
head=s[:s.index(' const out={};')]
tail=r''' const out={};
 const mkIco=(type,team)=>{const u=mkU(team,type,0,0);u.face=0;u.fa=0;u.hp=1;u.ttl=1;animUnit(u,.016,false,0);const g=u.m;scene.remove(g);unitG.delete(u);u.m=null;g.position.set(0,0,0);{const rm=[];g.traverse(o=>{if(o.material&&o.material.transparent&&o.material.type==='MeshBasicMaterial')rm.push(o)});rm.forEach(o=>o.parent&&o.parent.remove(o))}const w=new THREE.Group();w.add(g);return w};
 const SP=+(window.__SP||.85);
 for(const row of (window.__ROWS||[])){const g=new THREE.Group();row.units.forEach((t,i)=>{const w=mkIco(t,0);w.position.x=(i-(row.units.length-1)/2)*SP;g.add(w)});
  (row.yaws||[0,Math.PI]).forEach((y,j)=>{out[row.name+'_'+(j?'back':'front')]=shot(g.clone(true),y,window.__UPI!==undefined?window.__UPI:.1,+(window.__FILL||1.0))})}
 for(const row of (window.__BROWS||[])){const g=new THREE.Group(),BSP=+(window.__BSP||2.6),n=row.units.length;
  row.units.forEach((t,i)=>{const s={type:t,t:0,tier:1,sz:2,tiles:[],tx:0,ty:0,pl:0,hm:0,rot:0};const m=new THREE.Mesh(sGeo(s,0),matV);const w=new THREE.Group();w.add(m);w.position.x=(i-(n-1)/2)*BSP;g.add(w)});
  const bg=new THREE.Mesh(new THREE.PlaneGeometry(n*BSP+1.5,4.6),new THREE.MeshLambertMaterial({color:0x6a8a42}));bg.rotation.x=-Math.PI/2;bg.position.set(0,-.002,1);g.add(bg);
  (row.views||[[.35,.95]]).forEach((v,j)=>{out[row.name+'_v'+j]=shot(g.clone(true),v[0],v[1],+(window.__BFILL||1.0))})}
 return JSON.stringify(out)}'''
(ROOT/'docs/studio-boards/model/_src/j_board.js').write_text(head+tail,encoding='utf-8')
