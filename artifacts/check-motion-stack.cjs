const { chromium } = require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto('http://127.0.0.1:5173/#works');
    await page.locator('.project-2 .work-tilt').click();
    const gallery = page.locator('.motion-gallery');
    await gallery.waitFor();
    if (await gallery.locator('img').count() !== 8) throw Error('Expected eight animations');
    await gallery.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode()))); await page.waitForTimeout(300); await gallery.locator('.ecommerce-gallery-pagination button').nth(3).click();
    await page.waitForTimeout(1000);
    if (await gallery.locator('[aria-current=true]').getAttribute('aria-label') !== '查看第4张图片') throw Error('Pagination failed');
    await page.screenshot({ path: `artifacts/motion-stack-${width}.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    if (await page.locator('dialog').evaluate(el => el.open)) throw Error('Close failed');
    console.log(`${width}: eight animations, pagination and close passed`);
    await page.close();
  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });


