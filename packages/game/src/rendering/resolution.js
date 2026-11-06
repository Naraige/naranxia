import { frameLoopState } from '../core/frame-loop.js';
import { sessionState } from '../gameplay/session.js';
import { inputState } from '../input/state.js';
import { camera, DRS, DRSL, renderer, sceneState } from './scene.js';
import { cv, cw } from '../ui/canvases.js';
import { hudDisplayState } from '../ui/hud-state.js';
import { uiMul } from '../ui/settings.js';

export function rs(){inputState.DPR=Math.min(window.devicePixelRatio||1,2);const w=window.innerWidth,h=window.innerHeight;cv.width=Math.floor(w*inputState.DPR);cv.height=Math.floor(h*inputState.DPR);
 hudDisplayState.UIS=Math.max(1.5,Math.round(inputState.DPR*(w<600?1.5:w>=1600?2.5:2)*uiMul*2)/2);cw.width=cv.width;cw.height=cv.height;frameLoopState.CWD=1;frameLoopState.UIT=-1;renderer.setPixelRatio(Math.min(inputState.DPR,sceneState.GQ?2:1)*DRSL[DRS.lv]);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}

function drsApply(){renderer.setPixelRatio(Math.min(inputState.DPR,sceneState.GQ?2:1)*DRSL[DRS.lv]);renderer.setSize(window.innerWidth,window.innerHeight)}

export function drsTick(ts,t0){const cpu=performance.now()-t0,iv=DRS.lt?ts-DRS.lt:16.7;DRS.lt=ts;if(iv>250||iv<=0||document.hidden)return;
 DRS.sum+=iv;DRS.cs+=cpu;DRS.n++;DRS.t+=iv;if(DRS.t<2000)return;
 const ft=DRS.sum/DRS.n,cp=DRS.cs/DRS.n;DRS.ft=ft;DRS.cpu=cp;DRS.sum=DRS.cs=DRS.n=DRS.t=0;
 if(DRS.chk){DRS.chk=0;if(ft>DRS.ftb*.92){DRS.lv--;DRS.noDn=sessionState.clockT+90;DRS.ok=0;drsApply();return}}
 if(ft>24&&ft-cp>5&&DRS.lv<DRSL.length-1&&sessionState.clockT>DRS.noDn){if(sessionState.clockT-DRS.upT<12){DRS.noUp=sessionState.clockT+DRS.bk;DRS.bk=Math.min(600,DRS.bk*2)}DRS.ftb=ft;DRS.chk=1;DRS.ok=0;DRS.lv++;drsApply()}
 else if(ft<18.5){if(DRS.lv>0&&sessionState.clockT>DRS.noUp&&++DRS.ok>=3){DRS.ok=0;DRS.lv--;DRS.upT=sessionState.clockT;drsApply()}}else DRS.ok=0}
