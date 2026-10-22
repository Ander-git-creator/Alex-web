const { chromium }=require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5174/');
 await page.waitForTimeout(350);
 assert.equal(await page.locator('.portfolio-root').getAttribute('data-opening'),'playing');
 await page.mouse.wheel(0,250);
 await page.waitForTimeout(100);
 assert.equal(await page.locator('.portfolio-root').getAttribute('data-opening'),'complete');
 console.log('opening can be skipped by scrolling');
 await page.goto('http://127.0.0.1:5174/');
 await page.waitForTimeout(300);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForTimeout(150);
 assert(await page.locator('[data-motion-card]').evaluateAll(cs=>cs.every(c=>getComputedStyle(c).clipPath==='none')));
 assert.equal(await page.locator('.opening-curtain').evaluate(e=>getComputedStyle(e).display),'none');
 console.log('changing motion preference during opening restores all content');
 await page.emulateMedia({reducedMotion:'no-preference'});
 for (const width of [1440,820,390,320]) {
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:5174/');
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>document.querySelector('.portfolio-root').dataset.opening==='complete');
  const metrics=await page.locator('.hero-copy').evaluate(e=>{
   const title=e.querySelector('h1'),r=title.getBoundingClientRect();
   return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,fontSize:getComputedStyle(title).fontSize,titleLeft:r.left,titleRight:r.right};
  });
  assert.equal(metrics.scrollWidth,width);
  await page.screenshot({path:`artifacts/motion-final-home-${width}.png`});
  await page.locator('#strengths').scrollIntoViewIfNeeded();await page.waitForTimeout(2800);
  const grid=await page.locator('.strengths-grid').evaluate(e=>{
   const r=e.getBoundingClientRect();
   return [...e.children].every(c=>{const b=c.getBoundingClientRect();return b.width>0&&b.height>0&&b.right<=r.right+1;});
  });
  assert(grid);
  console.log('layout passed',metrics);
 }
 // Verify focus reveals and the gallery retains its own opening control.
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://127.0.0.1:5174/');
 await page.keyboard.press('Tab');
 await page.locator('.hero-gallery [data-gallery-list] button').first().focus();
 await page.keyboard.press('Enter');await page.waitForTimeout(800);
 assert(await page.locator('.hero-gallery .circular-gallery').evaluate(e=>e.hasAttribute('data-open')));
 await page.locator('.hero-gallery [data-gallery-close]').click();
 console.log('hero gallery interaction passed');
 assert.deepEqual(errors,[]);console.log('browser errors',errors);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
