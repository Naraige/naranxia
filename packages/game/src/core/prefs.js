/* small yes/no player options kept in localStorage (key dk_<name>) */
export const pref=(k,d)=>{try{const v=localStorage.getItem('dk_'+k);return v===null?d:v==='1'}catch(e){return d}};
export const setPref=(k,v)=>{try{localStorage.setItem('dk_'+k,v?'1':'0')}catch(e){}};
