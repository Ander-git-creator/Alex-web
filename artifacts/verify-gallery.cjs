const { chromium } = require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  window.__gallery={positions:{},times:{}};
  for(const type of [WebGLRenderingContext,WebGL2RenderingContext]){
   const locations=new WeakMap();let next=0;
   const originalGet=type.prototype.getUniformLocation;
   type.prototype.getUniformLocation=function(program,name){const loc=originalGet.call(this,program,name);if(loc)locations.set(loc,{name,id:next++});return loc;};
   const originalMatrix=type.prototype.uniformMatrix4fv;
   type.prototype.uniformMatrix4fv=function(loc,transpose,data){const meta=locations.get(loc);if(meta?.name==='modelViewMatrix')window.__gallery.positions[meta.id]=data[12];return originalMatrix.call(this,loc,transpose,data);};
   const originalFloat=type.prototype.uniform1f;
   type.prototype.uniform1f=function(loc,value){const meta=locations.get(loc);if(meta?.name==='uTime')window.__gallery.times[meta.id]=value;return originalFloat.call(this,loc,value);};
  }
 });
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 const sample=()=>page.evaluate(()=>structuredClone(window.__gallery));
 const before=await sample();await page.waitForTimeout(1500);const after=await sample();
 const key=Object.keys(before.positions)[0];const timeKey=Object.keys(before.times)[0];
 const box=await page.locator('.circular-gallery').boundingBox();
 await page.mouse.move(800,box.y+box.height/2);await page.mouse.down();
 await page.waitForTimeout(400);const heldA=await sample();await page.waitForTimeout(600);const heldB=await sample();
 await page.mouse.move(620,box.y+box.height/2,{steps:12});await page.mouse.up();await page.waitForTimeout(2500);
 const resumedA=await sample();await page.waitForTimeout(1000);const resumedB=await sample();
 await page.locator('.circular-gallery').focus();for(let i=0;i<24;i++)await page.keyboard.press('ArrowRight');await page.waitForTimeout(2000);
 const cycled=await sample();
 const widths=await page.evaluate(()=>['.about','.works','.strengths','.contact-main'].map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {selector,width:r.width,left:r.left,right:innerWidth-r.right};}));
 await page.locator('#about').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.screenshot({path:'artifacts/about-centered.png'});
 console.log(JSON.stringify({autoMovesLeft:after.positions[key]<before.positions[key],waveAdvances:after.times[timeKey]>before.times[timeKey],heldPositionDelta:heldB.positions[key]-heldA.positions[key],waveContinuesWhileHeld:heldB.times[timeKey]>heldA.times[timeKey],resumesLeft:resumedB.positions[key]<resumedA.positions[key],planesAfterMultipleCycles:Object.keys(cycled.positions).length,finitePositions:Object.values(cycled.positions).every(Number.isFinite),widths,errors},null,2));
 await browser.close();
})();
