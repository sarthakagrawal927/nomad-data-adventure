import {mkdir,copyFile,readdir,stat} from 'node:fs/promises';
const files=['index.html','style.css','app.js','model.js','favicon.svg','cities.json'];
await mkdir('dist',{recursive:true});
const unexpected=(await readdir('dist')).filter(f=>!files.includes(f));
if(unexpected.length)throw new Error(`Unexpected publication files: ${unexpected.join(', ')}`);
for(const file of files)await copyFile(file,`dist/${file}`);
const bytes=(await Promise.all(files.map(f=>stat(`dist/${f}`)))).reduce((n,s)=>n+s.size,0);
console.log(`Built ${files.length} static files (${(bytes/1e6).toFixed(2)} MB). Local data and collection logs excluded.`);
