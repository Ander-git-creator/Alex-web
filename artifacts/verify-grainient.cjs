const {chromium}=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:5173/',{waitUntil:'networkidle'});
 await page.locator('#about').scrollIntoViewIfNeeded();await page.waitForTimeout(900);
 const canvas=page.locator('.grainient-container canvas');
 const before=await canvas.screenshot();await page.waitForTimeout(1000);const after=await canvas.screenshot();
 await page.screenshot({path:'artifacts/grainient-about.png'});
 await page.locator('#contact').scrollIntoViewIfNeeded();await page.waitForTimeout(700);
 await page.screenshot({path:'artifacts/grainient-contact.png'});
 const desktop=await page.evaluate(()=>({canvasCount:document.querySelectorAll('.grainient-container canvas').length,canvasSize:[document.querySelector('.grainient-container canvas').width,document.querySelector('.grainient-container canvas').height],backgroundTop:document.querySelector('.grainient-container').getBoundingClientRect().top,contactBackground:getComputedStyle(document.querySelector('.contact')).backgroundColor,overflow:document.documentElement.scrollWidth>innerWidth}));
 await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);const staticA=await canvas.screenshot();await page.waitForTimeout(350);const staticB=await canvas.screenshot();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(300);
 const mobile=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,canvasWidth:document.querySelector('.grainient-container canvas').getBoundingClientRect().width}));
 console.log(JSON.stringify({animated:!before.equals(after),reducedMotionStatic:staticA.equals(staticB),desktop,mobile,errors},null,2));
 await browser.close();
})();
