const {chromium}=require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1680,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5174/#works');await page.locator('.work-tilt').first().click();await page.locator('.slot-center .product-category-card').click();await page.waitForTimeout(500);
const result=[];
for(let i=0;i<5;i++){
 await page.getByRole('button',{name:`查看第${i+1}组案例`,exact:true}).click();await page.waitForTimeout(650);
 for(const format of ['square','wide']){
 const trigger=page.locator('.ecommerce-slide').nth(i).locator('.ecommerce-'+format);await trigger.click();
 const gallery=page.locator('.ecommerce-gallery');await gallery.waitFor();await page.waitForTimeout(400);
 const box=await gallery.locator('.ecommerce-gallery-image').first().boundingBox();const ratio=box.width/box.height;if(Math.abs(ratio-(format==='square'?1:2.4))>.01)throw Error('Bad ratio '+ratio);
 if(await gallery.locator('.ecommerce-gallery-pagination button').count()!==5)throw Error('Missing dots');
 await gallery.getByRole('button',{name:'查看第3张图片',exact:true}).click();await page.waitForTimeout(650);if(await gallery.locator('[aria-current=true]').getAttribute('aria-label')!=='查看第3张图片')throw Error('Dot navigation failed');
 await gallery.locator('.ecommerce-gallery-viewport').focus();await page.keyboard.press('ArrowDown');await page.waitForTimeout(650);if(await gallery.locator('[aria-current=true]').getAttribute('aria-label')!=='查看第4张图片')throw Error('Keyboard navigation failed');
 if(i===0){await page.screenshot({path:`artifacts/ecommerce-gallery-${format}.png`});}
 await page.keyboard.press('Escape');await gallery.waitFor({state:'detached'});if(!await page.locator('dialog').evaluate(d=>d.open))throw Error('Escape closed outer dialog');
 result.push({case:i+1,format,ratio});
 }
}
await page.locator('.ecommerce-slide').nth(4).locator('.ecommerce-square').click();await page.waitForTimeout(400);await page.setViewportSize({width:390,height:844});await page.waitForTimeout(350);const mobile=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));await page.screenshot({path:'artifacts/ecommerce-gallery-mobile.png'});console.log(JSON.stringify({result,mobile,errors}));await browser.close();if(errors.length)process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1)});
