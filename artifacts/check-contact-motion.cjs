const { chromium } = require('C:/Users/xfcha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const baseline = JSON.parse(fs.readFileSync('artifacts/contact-layout-before.json', 'utf8'));
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('http://127.0.0.1:5173/');
    await page.evaluate(() => document.fonts.ready);
    for (const [selector, expected] of Object.entries(baseline[width])) {
      const actual = await page.locator(selector).evaluate(e => {
        const r = e.getBoundingClientRect();
        return { width: r.width, height: r.height, font: getComputedStyle(e).fontSize };
      });
      assert.deepEqual(actual, expected, `${width}: preserve ${selector} layout`);
    }
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('http://127.0.0.1:5173/#works');
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.querySelector('#contact').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    const samples = await page.evaluate(() => new Promise(resolve => {
      const card = document.querySelector('.contact-reveal');
      const start = performance.now();
      const frames = [];
      function sample(now) {
        const s = getComputedStyle(card), r = card.getBoundingClientRect();
        frames.push({ time: now - start, top: r.top, opacity: +s.opacity, clip: s.clipPath, transform: s.transform });
        if (now - start < 1800) requestAnimationFrame(sample);
        else resolve(frames);
      }
      requestAnimationFrame(sample);
    }));
    assert(samples.every(s => s.clip === 'none'), 'contact card is never clipped');
    const end = samples.at(-1);
    assert(samples.some(s => s.opacity < 0.95), 'card entry actually ran');
    assert(end.top < 900, 'contact card is in the viewport');
    assert.equal(end.opacity, 1);
    const tail = samples.filter(s => s.time > 1100);
    assert(Math.max(...tail.map(s => s.top)) - Math.min(...tail.map(s => s.top)) < 1, 'no card jump at completion');
    assert.equal(await page.locator('.contact-glyph').first().evaluate(e => e.style.transform), '', 'entry does not own hover transforms');
    assert(await page.locator('.contact-line-content').evaluateAll(lines => lines.every(e => getComputedStyle(e).opacity === '1' && !e.style.transform)));
    await page.screenshot({ path: `artifacts/contact-motion-fixed-${width}.png` });
    fs.writeFileSync(`artifacts/contact-motion-frames-${width}.json`, JSON.stringify(samples));
    console.log(`${width}: layout preserved, entry completed, no clipping or end jump`);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  const letter = page.locator('.contact-letter').first();
  await letter.hover();
  await page.waitForTimeout(350);
  assert.notEqual(await letter.locator('.contact-glyph').evaluate(e => getComputedStyle(e).transform), 'matrix(1, 0, 0, 1, 0, 0)');
  await page.mouse.move(0, 0);
  await page.locator('.contact-rows button').first().focus();
  assert.equal(await page.locator('.contact-reveal').evaluate(e => getComputedStyle(e).opacity), '1');
  await page.keyboard.press('Enter');
  assert.match(await page.locator('.contact-message').innerText(), /隐藏/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.contact-reveal').evaluate(e => getComputedStyle(e).opacity), '1');
  assert.deepEqual(errors, []);
  console.log('hover, keyboard, reduced motion and browser errors passed');
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
