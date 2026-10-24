const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/components/Hero.jsx', 'utf8');
const start = source.indexOf('    const players = [...videos.current];');
const end = source.indexOf('\n  }, [videoEnabled, mobileVideo]);', start);
assert.ok(start > 0 && end > start);

class Player extends EventTarget {
  style = {}; paused = true; ended = false; readyState = 4;
  frames = new Map(); serial = 0; plays = 0; rejectPlay = false;
  play() {
    this.plays++;
    if (this.rejectPlay) return Promise.reject(new Error('Media pipeline suspended'));
    this.paused = false;
    return Promise.resolve();
  }
  pause() { this.paused = true; }
  requestVideoFrameCallback(callback) { this.frames.set(++this.serial, callback); return this.serial; }
  cancelVideoFrameCallback(id) { this.frames.delete(id); }
  frame() { const callbacks = [...this.frames.values()]; this.frames.clear(); callbacks.forEach(fn => fn()); }
}
const fire = (target, type) => target.dispatchEvent(new Event(type));

for (const mobileVideo of [false, true]) {
  const players = [new Player(), new Player()];
  const document = new EventTarget(); document.hidden = false;
  const window = new EventTarget();
  const motion = new EventTarget(); motion.matches = false;
  window.matchMedia = () => motion;
  const timers = new Map(); let timerId = 0;
  const scene = { current: 0 };
  const context = {
    document, window, mobileVideo, videoEnabled: true, scene,
    videos: { current: players }, setPhase() {},
    background: { current: { closest: () => ({ dataset: { sceneReady: 'true' } }) } },
    MutationObserver: class { observe() {} disconnect() {} },
    setTimeout: fn => { timers.set(++timerId, fn); return timerId; },
    clearTimeout: id => timers.delete(id),
    requestAnimationFrame: fn => { timers.set(++timerId, fn); return timerId; },
    cancelAnimationFrame: id => timers.delete(id),
  };
  const cleanup = vm.runInNewContext(`(() => { ${source.slice(start, end)} })()`, context);
  const hide = () => { document.hidden = true; fire(document, 'visibilitychange'); };
  const show = () => { document.hidden = false; fire(document, 'visibilitychange'); };
  assert.equal(players[0].paused, false);
  hide();
  assert.equal(players[0].paused, false, 'site must not pause on tab switch');
  players[0].pause(); // Simulate an embedded browser suspending playback.
  show(); assert.equal(players[0].paused, false, 'return resumes active intro');

  players[0].ended = true; fire(players[0], 'ended');
  const oldFrame = [...players[1].frames.values()][0];
  hide(); players[1].pause(); show();
  oldFrame(); assert.equal(scene.current, 0, 'cancelled frame cannot reveal a stale cut');
  players[1].frame(); assert.equal(scene.current, 1);
  hide(); assert.equal(players[1].paused, false, 'loop keeps playing in background');
  players[1].pause(); players[1].rejectPlay = true;
  show(); assert.equal(players[1].paused, true);
  players[1].rejectPlay = false;
  const retries = [...timers.values()]; timers.clear(); retries.forEach(fn => fn());
  assert.equal(players[1].paused, false, 'delayed retry recovers a suspended media pipeline');
  players[1].pause(); fire(players[1], 'pause');
  assert.equal(players[1].paused, false, 'unexpected visible pause recovers');
  fire(window, 'pagehide'); assert.equal(players[1].paused, false);
  players[1].pause(); fire(window, 'pageshow'); assert.equal(players[1].paused, false);
  motion.matches = true; fire(motion, 'change');
  assert.ok(players.every(player => player.paused), 'reduced motion still respected');
  motion.matches = false; fire(motion, 'change');
  cleanup(); assert.equal(timers.size, 0);
  const plays = players[1].plays;
  fire(window, 'focus'); fire(document, 'resume');
  assert.equal(players[1].plays, plays, 'cleanup removes recovery listeners');
  console.log(`PASS ${mobileVideo ? 'mobile' : 'desktop'}: hidden playback, browser suspension, interrupted cut, delayed recovery, history restore, cleanup`);
}
