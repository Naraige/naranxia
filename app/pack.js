const {packager}=require('@electron/packager');
(async()=>{for(const [platform,arch] of (process.argv[2]||'linux:x64').split(',').map(s=>s.split(':'))){
 const out=await packager({dir:'src',out:'dist',platform,arch,overwrite:true,asar:false,prune:true,electronVersion:require('electron/package.json').version,
  name:'Naranxia',executableName:platform==='linux'?'naranxia':'Naranxia',appBundleId:'com.naranxia.game',appCopyright:'Naranxia clan',icon:platform==='darwin'?'icon.icns':(platform==='win32'?'icon.ico':undefined),
  win32metadata:{CompanyName:'Naranxia',ProductName:'Naranxia',FileDescription:'Naranxia'}});
 console.log('built',out)}})().catch(e=>{console.error('ERR',e.message);process.exit(1)})
