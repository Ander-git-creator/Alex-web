const fs = require('fs');
const { chromium } = require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage();
 const data = fs.readFileSync('C:/Users/xfcha/Documents/xwechat_files/wxid_we5tcuhy9l5j22_84d2/msg/video/2026-10/19d4b9ac5ce657c571b253b964fad00b.mp4').toString('base64');
 const result = await page.evaluate(async data => {
 const v=document.createElement('video'); v.src='data:video/mp4;base64,'+data; v.muted=true;
 await new Promise((resolve,reject)=>{v.onloadeddata=resolve;v.onerror=reject});
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=900;const ctx=canvas.getContext('2d');
 const times=Array.from({length:12},(_,i)=>i*v.duration/12);
 for(let i=0;i<times.length;i++){v.currentTime=times[i]+.001;await new Promise(r=>v.onseeked=r);const x=i%4*300,y=Math.floor(i/4)*300;ctx.drawImage(v,x,y,300,265);ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.fillText(times[i].toFixed(2)+'s',x+10,y+285);}
 return {duration:v.duration,image:canvas.toDataURL('image/png').split(',')[1]};
 },data);
 fs.writeFileSync('artifacts/strengths-video-reference.png',Buffer.from(result.image,'base64'));console.log({duration:result.duration});await browser.close();
})();
