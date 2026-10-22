const {chromium}=require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
const {renderWorks}=await import('../src/data/renderWorks.js');if(renderWorks.length!==48||new Set(renderWorks.map(i=>i.src)).size!==48)throw Error('Image coverage');
const browser=await chromium.launch({channel:'chrome',headless:true});const page=await browser.newPage({viewport:{width:1600,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});await page.locator('.project-card').first().click();await page.getByRole('button',{name:'切换到三维渲染',exact:true}).click();await page.getByRole('button',{name:'选择三维渲染',exact:true}).click();await page.waitForTimeout(2600);
if(await page.locator('.render-product-filters').count())throw Error('Filters still visible');
await page.screenshot({path:'artifacts/render-continuous-desktop.png'});await page.setViewportSize({width:390,height:844});await page.waitForTimeout(600);const overflow=await page.locator('dialog').evaluate(e=>e.scrollWidth>e.clientWidth);await page.getByRole('button',{name:'返回分类',exact:true}).click();await page.waitForTimeout(400);
console.log(JSON.stringify({images:renderWorks.length,noFilters:true,mobileOverflow:overflow,returned:await page.locator('.product-carousel').count()===1,errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
