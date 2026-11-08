/* small yes/no player options kept in localStorage (key dk_<name>) */
export const pref=(k,d)=>{try{const v=localStorage.getItem('dk_'+k);return v===null?d:v==='1'}catch(e){return d}};
export const setPref=(k,v)=>{try{localStorage.setItem('dk_'+k,v?'1':'0')}catch(e){}};

/* reduce motion, cached for the per-frame callers (camera shake, weather particles, fireflies, lightning) */
let _rm=false,_rmT=-1e9;
export const rmotion=()=>{const n=performance.now();if(n-_rmT>400){_rmT=n;_rm=pref('rm',false)}return _rm};
