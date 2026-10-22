// Development utility: creates a quiet, looping camera movement from the demo hero.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage();
  const data = fs.readFileSync('public/assets/hero.png').toString('base64');
  const bytes = await page.evaluate(async data => {
    const image = new Image(); image.src = `data:image/png;base64,${data}`; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width=1600; canvas.height=900;
    const context = canvas.getContext('2d');
    const chunks = [];
    const recorder = new MediaRecorder(canvas.captureStream(30), {mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:2600000});
    recorder.ondataavailable = event => chunks.push(event.data);
    const done = new Promise(resolve => { recorder.onstop = async () => resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer()))); });
    const duration = 8000;
    const start = performance.now();
    function draw(now) {
      const elapsed = now-start;
      const zoom = 1.025 - Math.cos(elapsed/duration*Math.PI*2)*.025;
      const w=1600*zoom, h=900*zoom;
      context.drawImage(image,(1600-w)/2,(900-h)/2,w,h);
      if (elapsed < duration) requestAnimationFrame(draw); else recorder.stop();
    }
    context.drawImage(image,0,0,1600,900); recorder.start(); requestAnimationFrame(draw);
    return done;
  },data);
  fs.writeFileSync('public/assets/hero-motion.webm',Buffer.from(bytes));
  await browser.close();
  console.log('Created public/assets/hero-motion.webm');
})();
