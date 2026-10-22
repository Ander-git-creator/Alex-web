const { chromium } = require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
 const browser = await chromium.launch({channel:'chrome',headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror', e=>errors.push(e.message));
 page.on('console', m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5173/');
 await page.evaluate(()=>document.fonts.ready);
 for (const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  for (const id of ['about','works','contact']) {
   await page.locator('#'+id).scrollIntoViewIfNeeded();
   await page.waitForTimeout(700);
   console.log(JSON.stringify(await page.evaluate((id)=>{
    const canvas=document.querySelector('.grainient-canvas');
    const r=canvas.getBoundingClientRect();
    const gl=canvas.getContext('webgl2');
    return {id,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,canvas:{width:canvas.width,height:canvas.height,top:r.top,bottom:r.bottom},webgl:!!gl,glError:gl?.getError()};
   },id)));
   if(id==='works')await page.screenshot({path:`artifacts/grainient-${width}.png`});
  }
 }
 console.log('errors',JSON.stringify(errors));
 await browser.close();
})();
