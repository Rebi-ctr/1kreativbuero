const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

function createHero(compact = false) {
  function element() {
    const attributes = {}, events = {}, classes = new Set();
    return {
      attributes, style: {}, events, classes,
      setAttribute(key, value) { attributes[key] = String(value); },
      addEventListener(type, listener) { (events[type] ||= []).push(listener); },
      dispatch(type, event) { for (const listener of events[type] || []) listener(event); },
      classList: { add(name) { classes.add(name); }, remove(name) { classes.delete(name); } },
      matches() { return false; },
      setPointerCapture() { this.captured = true; },
      hasPointerCapture() { return !!this.captured; },
      releasePointerCapture() { this.captured = false; },
    };
  }
  const handles = [element(), element(), element()], masks = [element(), element(), element()];
  const mask = element(), rect = element(), images = [element(), element()];
  mask.querySelector = () => rect;
  const stage = element();
  stage.querySelector = selector => {
    if (selector === '#hero-reveal-mask') return mask;
    if (selector === '#reveal-description') return element();
    return (selector.includes('hole') ? masks : handles)[Number(selector.match(/"(\d)"/)[1])];
  };
  stage.querySelectorAll = () => images;
  stage.getScreenCTM = () => ({ inverse() { return {}; } });
  const window = element();
  let frame;
  const context = {
    window,
    document: { hidden: false, querySelector(selector) { return selector.includes('hint') ? element() : stage; }, addEventListener() {} },
    matchMedia(query) { return { matches: compact && query.includes('max-width'), addEventListener() {} }; },
    requestAnimationFrame(callback) { frame = callback; return 1; }, cancelAnimationFrame() {},
    IntersectionObserver: class { observe() {} },
    DOMPoint: class { constructor(x, y) { this.x = x; this.y = y; } matrixTransform() { return this; } },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'hero-reveal.js'), 'utf8'), context);
  let time = 0;
  return {
    handles, stage, window,
    tick() { time += 16; frame(time); },
    point(handle, type = 'mouse') { return { pointerType: type, pointerId: 1, button: 0, clientX: +handle.attributes.cx, clientY: +handle.attributes.cy, timeStamp: 1000, preventDefault() {} }; },
  };
}

for (const compact of [false, true]) {
  const mode = compact ? 'Mobile' : 'Desktop';
  test(`${mode}: gehaltenes Loch bleibt am Rand ruhig und lässt sich sofort zurückziehen`, () => {
    const hero = createHero(compact), handle = hero.handles[0];
    let pointer = hero.point(handle);
    handle.dispatch('pointerenter', pointer);
    // Langsam bis über die Begrenzung schieben; das Loch bleibt am Rand stehen.
    for (let step = 0; step < 220; step++) {
      pointer = { ...pointer, clientX: pointer.clientX + 8, timeStamp: pointer.timeStamp + 20 };
      hero.window.dispatch('pointermove', pointer);
      hero.tick();
    }
    const edge = +handle.attributes.cx;
    handle.dispatch('pointerleave', pointer);
    for (let step = 0; step < 100; step++) hero.tick();
    assert.equal(+handle.attributes.cx, edge);
    assert(handle.classes.has('is-dragging'));
    pointer = { ...pointer, clientX: pointer.clientX - 8, timeStamp: pointer.timeStamp + 20 };
    hero.window.dispatch('pointermove', pointer);
    assert.equal(+handle.attributes.cx, edge - 8);
    // Eine schnelle Geste löst das Loch weiterhin.
    hero.window.dispatch('pointermove', { ...pointer, clientX: pointer.clientX - 100, timeStamp: pointer.timeStamp + 10 });
    assert(!handle.classes.has('is-dragging'));
  });

  test(`${mode}: Touch-Ziehen und Loslösen am Hero-Rand bleiben erhalten`, () => {
    const hero = createHero(compact), handle = hero.handles[0];
    const touch = hero.point(handle, 'touch');
    handle.dispatch('pointerdown', touch);
    hero.window.dispatch('pointermove', { ...touch, clientX: -1000, clientY: -1000, timeStamp: 2000 });
    const edge = [handle.attributes.cx, handle.attributes.cy];
    for (let step = 0; step < 40; step++) hero.tick();
    assert.deepEqual([handle.attributes.cx, handle.attributes.cy], edge);
    handle.dispatch('pointerup', { ...touch, timeStamp: 2200 });
    assert(!handle.captured);
    assert(!handle.classes.has('is-dragging'));
    for (let step = 0; step < 500; step++) hero.tick();
    assert(Number.isFinite(+handle.attributes.cx));
    assert(Number.isFinite(+handle.attributes.cy));
    const top = compact ? 230 : 265, bottom = compact ? 490 : 445;
    assert(+handle.attributes.cy >= top && +handle.attributes.cy <= bottom);
    const hover = hero.point(handle);
    handle.dispatch('pointerenter', { ...hover, timeStamp: 15000 });
    hero.stage.dispatch('pointerleave', { ...hover, timeStamp: 15020 });
    assert(!handle.classes.has('is-dragging'));
  });
}
