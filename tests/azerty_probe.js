async()=>{/* NOT in the suite: which default actions have a plain key (one press, no Shift, no AltGr) on a French AZERTY keyboard?
   python3 tools/run.py tests/azerty_probe.js   -> one line per action whose key is a sign, then the summary.
   Each default key is looked up in the AZERTY layout below (character -> physical key and modifiers), then the event a browser would send
   is dispatched in a running game: for a key that is not a letter or a digit the handler calls preventDefault() exactly when it found an
   action. A digit-row key without Shift stands for its digit (input/desktop.js), so a sign typed by that row is never seen. */
 renderer.render=function(){};
 const LS=localStorage,k0=LS.getItem('dk_keys');LS.removeItem('dk_keys');loadKB();
 rollWorld();randomSite();pickPos={tx:pickPos.tx,ty:pickPos.ty,ok:true};confirmPick();waveT=1e9;for(let i=0;i<5;i++)update(.1);
 /* French AZERTY (PC): [code, plain, shift, altgr] */
 const AZ=[['Backquote','²','',''],['Digit1','&','1',''],['Digit2','é','2','~'],['Digit3','"','3','#'],['Digit4',"'",'4','{'],['Digit5','(','5','['],['Digit6','-','6','|'],['Digit7','è','7','`'],['Digit8','_','8','\\'],['Digit9','ç','9','^'],['Digit0','à','0','@'],['Minus',')','°',']'],['Equal','=','+','}'],
  ['BracketLeft','Dead','Dead',''],['BracketRight','$','£','¤'],['Semicolon','m','M',''],['Quote','ù','%',''],['Backslash','*','µ',''],['IntlBackslash','<','>',''],['KeyM',',','?',''],['Comma',';','.',''],['Period',':','/',''],['Slash','!','§',''],['Space',' ',' ','']];
 /* US QWERTY, the same way (only the signs) */
 const US=[['Backquote','`','~'],['Minus','-','_'],['Equal','=','+'],['BracketLeft','[','{'],['BracketRight',']','}'],['Backslash','\\','|'],['Semicolon',';',':'],['Quote',"'",'"'],['Comma',',','<'],['Period','.','>'],['Slash','/','?'],['Space',' ',' ']];
 const find=(T,c)=>{for(const r of T)for(let m=1;m<r.length;m++)if(r[m]===c)return {code:r[0],mod:['','plain','shift','altgr'][m]};return null};
 const act=k=>Object.keys(KB).find(a=>KB[a]===k)||'';
 const send=(k,code,o)=>{const e=new KeyboardEvent('keydown',Object.assign({key:k,code,cancelable:true,bubbles:true},o||{}));document.body.dispatchEvent(e);const p=e.defaultPrevented;
  document.body.dispatchEvent(new KeyboardEvent('keyup',{key:k,code,bubbles:true}));mode=null;selB=null;showMap=false;paused=false;return p};
 const out=[],bad=[];
 for(const a of Object.keys(KB)){const k=KB[a];if(/^[a-z0-9]$/.test(k)||/^f\d+$/.test(k))continue;/* letters: same character on both; digits: by physical key (tests/ui.js) */
  const z=find(AZ,k),u=find(US,k);let why='';
  if(!z)why='not on the keyboard';
  else if(z.mod==='plain'&&/^Digit\d$/.test(z.code)){send(k,z.code);why='is the '+z.code[5]+' key: the digit wins ('+act(z.code[5])+')'}
  else if(z.mod==='plain'){if(!send(k,z.code)&&k!==' ')why='event not taken'}
  else if(z.mod==='shift'){const p=send(k,z.code,{shiftKey:true});why='needs Shift ('+z.code+')'+(p?', taken with Shift':', NOT taken')}
  else{const p=send(k,z.code,{ctrlKey:true,altKey:true});why='needs AltGr ('+z.code+')'+(p?', taken with AltGr':', NOT taken')}
  const row={action:a,key:k,azerty:why||'plain ('+z.code+')',qwerty:u?u.mod+' ('+u.code+')':'?'};out.push(row);if(why)bad.push(row)}
 /* letters exist on both, but the camera cluster moves: W A S D of QWERTY are Z Q S D on AZERTY, and z / q are other actions */
 const cam=['up','left','down','right'].map(a=>a+'='+KB[a]).join(' ')+' | the same physical keys type z q s d on AZERTY: z='+act('z')+', q='+act('q');
 /* keys that are one plain press on both layouts and bound to nothing (f5 f11 f12 belong to the browser; f1 f2 f8 f10, tab, delete are wired) */
 const taken=new Set(Object.values(KB));
 const both=['f3','f6','f7','f9','insert','end'].filter(k=>!taken.has(k));
 if(k0!==null)LS.setItem('dk_keys',k0);loadKB();
 for(const r of out)console.log(JSON.stringify(r));
 return 'NOT PLAIN ON AZERTY: '+bad.map(r=>r.action+' ['+r.key+'] '+r.azerty+' | qwerty '+r.qwerty).join('; ')+'\nCAMERA: '+cam+'\nFREE ON BOTH: '+both.join(' ')}
