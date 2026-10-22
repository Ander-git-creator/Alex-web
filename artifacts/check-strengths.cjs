const { chromium } = require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1685,height:1100},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/#strengths');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1200);
 const section=page.locator('#strengths');await section.screenshot({path:'artifacts/strengths-front.png'});
 const cards=page.locator('.strength-flip');
 console.log('initial',await cards.evaluateAll(cs=>cs.map(c=>c.getAttribute('aria-pressed'))));
 for(let i=0;i<5;i++){await cards.nth(i).click();await page.waitForTimeout(650);}
 await page.mouse.move(0,0);await page.waitForTimeout(400);await section.screenshot({path:'artifacts/strengths-back.png'});
 console.log('flipped',await cards.evaluateAll(cs=>cs.map(c=>c.getAttribute('aria-pressed'))));
 await cards.first().focus();await page.keyboard.press('Enter');await page.waitForTimeout(700);console.log('keyboard',await cards.first().getAttribute('aria-pressed'));
 const box=await cards.first().boundingBox();await page.mouse.move(box.x+box.width*.2,box.y+box.height*.6);await page.mouse.down();await page.mouse.move(box.x+box.width*.9,box.y+box.height*.6,{steps:12});await page.mouse.up();await page.waitForTimeout(1000);console.log('drag',await cards.first().getAttribute('aria-pressed'));
 for(const width of [390,320,820,1280]){
 await page.setViewportSize({width,height:900});await page.waitForTimeout(500);
 const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('.strength-flip')].map(c=>{const face=c.querySelector('.strength-flip-back');const r=face.getBoundingClientRect();return [...face.querySelectorAll('.strength-bubble')].every(b=>{const a=b.getBoundingClientRect();return a.left>=r.left-1&&a.right<=r.right+1&&a.bottom<=r.bottom+1;});})}));console.log('layout',metrics);
 if(width===390)await section.screenshot({path:'artifacts/strengths-mobile.png'});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await cards.first().focus();await page.keyboard.press('Space');await page.waitForTimeout(250);console.log('reduced',await cards.first().getAttribute('data-fade'));
 console.log('errors',errors);await browser.close();
})();
