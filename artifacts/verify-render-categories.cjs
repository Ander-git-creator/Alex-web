const { chromium } = require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const {renderWorkGroups}=await import('../src/data/renderWorks.js');
 const imported=renderWorkGroups.flatMap(g=>g.items).filter(i=>i.src.includes('/render-works/'));
 if(imported.length!==56||new Set(imported.map(i=>i.src)).size!==56) throw Error('Import coverage');
 for(const item of imported) if(!fs.existsSync('public'+item.src)) throw Error('Missing '+item.src);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('.project-card').first().click();
 await page.getByRole('button',{name:'切换到三维渲染',exact:true}).click();
 await page.getByRole('button',{name:'选择三维渲染',exact:true}).click();
 for(const group of renderWorkGroups){
  const button=page.getByRole('button',{name:new RegExp('^'+group.label)});
  await button.click();
  if(await button.getAttribute('aria-pressed')!=='true')throw Error('Selection '+group.label);
  if(await page.locator('.render-carousel-stage').getAttribute('aria-label')!==`${group.label}，${group.items.length} 张作品`)throw Error('Count '+group.label);
  await page.waitForTimeout(180);
 }
 await page.waitForTimeout(2500);await page.screenshot({path:'artifacts/render-categories-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:/^手持风扇/}).click();await page.waitForTimeout(2500);
 await page.screenshot({path:'artifacts/render-categories-mobile.png'});
 const mobileOverflow=await page.locator('dialog').evaluate(el=>el.scrollWidth>el.clientWidth);
 await page.getByRole('button',{name:'返回分类',exact:true}).click();await page.waitForTimeout(500);
 const returned=await page.locator('.product-carousel').count()===1;
 await page.getByRole('button',{name:'切换到渲染海报',exact:true}).click();
 await page.getByRole('button',{name:'选择渲染海报',exact:true}).click();
 const posterUnaffected=await page.locator('.render-product-filters').count()===0;
 console.log(JSON.stringify({imported:imported.length,groups:renderWorkGroups.map(g=>[g.label,g.items.length]),mobileOverflow,returned,posterUnaffected,errors}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
