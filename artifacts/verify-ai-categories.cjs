const { chromium } = require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1600,height:1000}});
const errors=[]; page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
await page.locator('.project-card').nth(1).click();
const results=[];
for(const [label,count] of [['高速手持风扇',11],['迷你手持风扇',5],['头盔蓝牙耳机',10]]){
 await page.getByRole('button',{name:new RegExp(label)}).click();
 await page.waitForTimeout(500);
 const selected=await page.getByRole('button',{name:new RegExp(label)}).getAttribute('aria-pressed');
 const description=await page.locator('.render-carousel-stage').getAttribute('aria-label');
 if(selected!=='true'||description!==`${label}，${count} 张作品`) throw Error('Category failed: '+label);
 results.push({label,count,selected});
}
await page.waitForTimeout(2400); await page.screenshot({path:'artifacts/ai-product-categories-desktop.png'});
await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:/迷你手持风扇/}).click();
await page.waitForTimeout(2400);
await page.screenshot({path:'artifacts/ai-product-categories-mobile.png'});
const overflow=await page.locator('dialog').evaluate(el=>el.scrollWidth>el.clientWidth);
await page.keyboard.press('Escape');await page.waitForTimeout(350);
console.log(JSON.stringify({results,mobileOverflow:overflow,dialogClosed:await page.locator('dialog').evaluate(el=>!el.open),errors}));
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

