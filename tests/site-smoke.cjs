const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const html=fs.readFileSync('index.html','utf8');
for(const item of ['id="who"','id="parks"','id="msg"','id="notifBar"','name="viewport"'])assert.ok(html.includes(item),'Missing '+item);
const scripts=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!/\bsrc\s*=/.test(m[1]));
assert.ok(scripts.length>=2,'Expected check-in scripts');
scripts.forEach((m,i)=>new vm.Script(m[2],{filename:'inline-'+i+'.js'}));
console.log('Court Check-In HTML and inline JavaScript syntax verified.');
