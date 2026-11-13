/* storage: desktop files, else IndexedDB */
const SVDB={db:null,open(){return this.db||(this.db=new Promise((ok,ko)=>{const r=indexedDB.open('naranxia_saves',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>ok(r.result);r.onerror=()=>ko(r.error)}))},
 async tx(mode,fn){const d=await this.open();return new Promise((ok,ko)=>{const t=d.transaction('s',mode),st=t.objectStore('s'),q=fn(st);t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>ko(t.error)})}};

export const SVST={async list(){if(window.NARX)return window.NARX.list();const keys=await SVDB.tx('readonly',s=>s.getAllKeys())||[];const out=[];for(const k of keys){const m=await SVDB.tx('readonly',s=>s.get('meta:'+k));if(!String(k).startsWith('meta:'))out.push({name:k,t:m&&m.date||0})}return out.filter(o=>o.name).sort((a,b)=>b.t-a.t)},
 async put(n,d,meta){if(window.NARX)return window.NARX.save(n,d);await SVDB.tx('readwrite',s=>s.put(d,n));await SVDB.tx('readwrite',s=>s.put(meta||{},'meta:'+n))},
 async get(n){if(window.NARX)return window.NARX.load(n);return SVDB.tx('readonly',s=>s.get(n))},
 async del(n){if(window.NARX)return window.NARX.del(n);await SVDB.tx('readwrite',s=>s.delete(n));await SVDB.tx('readwrite',s=>s.delete('meta:'+n))}};
