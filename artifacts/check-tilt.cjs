const {chromium}=require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5174/#works',{waitUntil:'domcontentloaded'});
 const cards=page.locator('.work-tilt');
 await cards.first().scrollIntoViewIfNeeded();
 await page.waitForTimeout(2400);
 const results=[];
 for(let i=0;i<3;i++){
  const card=cards.nth(i);await card.scrollIntoViewIfNeeded();
  const box=await card.boundingBox();
  await page.mouse.move(box.x+box.width*.72,box.y+box.height*.35);
  await page.waitForTimeout(700);
  const state=await card.evaluate(el=>({transform:el.querySelector('.tilted-card__body').style.transform,edge:getComputedStyle(el.querySelector('.tilted-card__edge')).display,width:el.clientWidth,height:el.clientHeight}));
  if(!state.transform||state.transform.includes('rotateX(0.000deg) rotateY(0.000deg)'))throw Error('Card did not tilt '+i);
  if(state.edge!=='none')throw Error('Edge still visible');
  await card.click();await page.waitForTimeout(500);
  if(!await page.locator('dialog').evaluate(d=>d.open))throw Error('Dialog failed '+i);
  await page.locator('.dialog-close').click();await page.waitForTimeout(400);
  results.push(state);
 }
 await page.mouse.move(10,10);await page.waitForTimeout(1200);
 await page.locator('#works').screenshot({path:'artifacts/works-tilt-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.waitForTimeout(400);
 const mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('.work-tilt')].map(el=>({width:el.clientWidth,height:el.clientHeight}))}));
 console.log(JSON.stringify({results,mobile,errors}));
 await browser.close();
 if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
