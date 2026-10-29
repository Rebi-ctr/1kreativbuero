// Bild und Overlay bleiben fest. Maske und greifbare Kontur bewegen sich gemeinsam.
(() => {
  const stage = document.querySelector('.hero-reveal-stage');
  if (!stage) return;
  const mobile = matchMedia('(max-width: 650px)');
  let width = 1474.02, bandTop = 265, bandBottom = 445;
  let minSpeed = 65, maxSpeed = 110;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const positions = [
    { x: 310, y: 255, rx: 154, ry: 103, angle: 0 },
    { x: 700, y: 378, rx: 103, ry: 81, angle: -22 },
    { x: 1180, y: 324, rx: 83, ry: 88, angle: 16 },
  ];
  let frame = 0;
  let visible = true;
  let active = null;
  let lastTime = null;
  const allHoles = positions.map((position, index) => ({
    ...position, vx: [78, -64, -88][index], vy: [23, -31, 19][index], scale: 1, phase: index * 2.1, focused: false, cooldown: 0, returning: false,
    mask: stage.querySelector(`[data-reveal-hole="${index}"]`),
    handle: stage.querySelector(`[data-reveal-handle="${index}"]`),
  }));

  let holes = allHoles;

  function render(hole) {
    const x = hole.x;
    const y = hole.y;
    for (const element of [hole.mask, hole.handle]) {
      element.setAttribute('cx', x);
      element.setAttribute('cy', y);
      element.setAttribute('rx', hole.rx * hole.scale);
      element.setAttribute('ry', hole.ry * hole.scale);
      element.setAttribute('transform', `rotate(${hole.angle} ${x} ${y})`);
    }
  }

  const locked = hole => active?.hole === hole || hole.focused;

  // Ausdehnung eines gedrehten Ovals entlang einer Kollisionsnormalen.
  function extent(hole, nx, ny) {
    const angle = hole.angle * Math.PI / 180;
    const localX = nx * Math.cos(angle) + ny * Math.sin(angle);
    const localY = -nx * Math.sin(angle) + ny * Math.cos(angle);
    return Math.hypot(hole.rx * localX, hole.ry * localY) * hole.scale;
  }

  function bounds(hole, bounce = true, free = false) {
    const mx = extent(hole, 1, 0) + 2;
    // Die Mittelpunkte bleiben im schmalen Band des Schriftzugs.
    const fullHeight = free || locked(hole) || hole.returning;
    const margin = extent(hole, 0, 1) + 2;
    const top = fullHeight ? margin : bandTop;
    const bottom = fullHeight ? 680.31 - margin : bandBottom;
    if (bounce) {
      if (hole.x < mx && hole.vx < 0 || hole.x > width - mx && hole.vx > 0) hole.vx *= -1;
      if (hole.y < top && hole.vy < 0 || hole.y > bottom && hole.vy > 0) hole.vy *= -1;
    }
    hole.x = Math.max(mx, Math.min(width - mx, hole.x));
    hole.y = Math.max(top, Math.min(bottom, hole.y));
  }

  function collide(a, b) {
    const dx = b.x - a.x, dy = b.y - a.y;
    const distance = Math.hypot(dx, dy);
    const nx = distance > .001 ? dx / distance : 1;
    const ny = distance > .001 ? dy / distance : 0;
    const overlap = extent(a, nx, ny) + extent(b, nx, ny) - distance;
    if (overlap <= 0) return;
    const wa = locked(a) ? 0 : 1 / (a.rx * a.ry);
    const wb = locked(b) ? 0 : 1 / (b.rx * b.ry);
    if (!wa && !wb) return;
    const total = wa + wb;
    a.x -= nx * overlap * wa / total;
    a.y -= ny * overlap * wa / total;
    b.x += nx * overlap * wb / total;
    b.y += ny * overlap * wb / total;
    const approach = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
    if (approach < 0) {
      const impulse = -2 * approach / total;
      a.vx -= impulse * wa * nx; a.vy -= impulse * wa * ny;
      b.vx += impulse * wb * nx; b.vy += impulse * wb * ny;
    }
  }

  function draw(time) {
    frame = 0;
    const elapsed = lastTime === null ? 0 : Math.min(time - lastTime, 50) / 1000;
    lastTime = time;
    const steps = Math.max(1, Math.ceil(elapsed * 120));
    const dt = elapsed / steps;
    for (let step = 0; step < steps; step++) {
      holes.forEach(hole => {
        if (locked(hole)) return;
        hole.phase += dt;
        hole.scale = 1 + Math.sin(hole.phase / 2.1) * .025;
        // Wurfgeschwindigkeit klingt sanft auf das freie Flugtempo ab.
        const speed = Math.hypot(hole.vx, hole.vy);
        const target = Math.max(minSpeed, Math.min(maxSpeed, speed));
        if (!hole.returning && speed > 0) {
          const factor = (speed + (target - speed) * (1 - Math.exp(-dt * .65))) / speed;
          hole.vx *= factor; hole.vy *= factor;
        } else if (!speed) hole.vx = minSpeed;
        if (hole.returning) {
          const targetY = hole.y < (bandTop + bandBottom) / 2 ? bandTop + 15 : bandBottom - 15;
          // Gedämpfte Rückkehr statt eines Sprungs an die Bandgrenze.
          hole.vy += ((targetY - hole.y) * 3 - hole.vy * 3.5) * dt;
          if (hole.y >= bandTop && hole.y <= bandBottom && Math.abs(hole.vy) < 35) {
            hole.returning = false;
          }
        }
        hole.x += hole.vx * dt;
        hole.y += hole.vy * dt;
        bounds(hole);
      });
      for (let i = 0; i < holes.length; i++) {
        for (let j = i + 1; j < holes.length; j++) collide(holes[i], holes[j]);
      }
      holes.forEach(hole => { if (!locked(hole)) bounds(hole); });
    }
    holes.forEach(render);
    schedule();
  }

  function schedule() {
    if (!frame && visible && !document.hidden && !reducedMotion.matches) frame = requestAnimationFrame(draw);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
    if (reducedMotion.matches) holes.forEach(hole => {
      hole.scale = 1;
      render(hole);
    });
    schedule();
  }

  function point(event) {
    const matrix = stage.getScreenCTM();
    return matrix ? new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse()) : null;
  }

  function move(hole, x, y) {
    // Genug Rand lassen, damit jedes Oval immer wieder greifbar bleibt.
    hole.x = x;
    hole.y = y;
    bounds(hole, false, true);
    hole.returning = hole.y < bandTop || hole.y > bandBottom;
    render(hole);
  }

  holes.forEach(hole => {
    bounds(hole, false);
    render(hole);
    const handle = hole.handle;
    function detachHover(event) {
      if (active?.hole !== hole || active.mode !== 'hover') return;
      active = null;
      hole.cooldown = event.timeStamp + 700;
      handle.classList.remove('is-dragging');
    }
    handle.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || active || event.timeStamp < hole.cooldown) return;
      const cursor = point(event);
      if (!cursor) return;
      hole.focused = false;
      active = { mode: 'hover', hole, id: event.pointerId,
        offsetX: cursor.x - hole.x, offsetY: cursor.y - hole.y,
        time: event.timeStamp, clientX: event.clientX, clientY: event.clientY, moved: false };
      handle.classList.add('is-dragging');
    });
    // Am Rand kann die begrenzte Kontur den Cursor nicht weiter begleiten.
    // Erst das Verlassen des Hero-Bereichs löst die Haftung, nicht die Kontur.
    stage.addEventListener('pointerleave', detachHover);
    handle.addEventListener('pointerdown', event => {
      if (active?.hole === hole && active.mode === 'hover') return;
      if (active || (event.pointerType === 'mouse' && event.button !== 0)) return;
      const cursor = point(event);
      if (!cursor) return;
      event.preventDefault();
      hole.focused = false;
      active = { mode: 'drag', time: event.timeStamp, moved: false, hole, id: event.pointerId, offsetX: cursor.x - hole.x, offsetY: cursor.y - hole.y };
      handle.setPointerCapture(event.pointerId);
      handle.classList.add('is-dragging');
      render(hole);
    });
    window.addEventListener('pointermove', event => {
      if (active?.hole !== hole || active.id !== event.pointerId) return;
      const cursor = point(event);
      if (active.mode === 'hover') {
        const elapsed = event.timeStamp - active.time;
        const speed = Math.hypot(event.clientX - active.clientX, event.clientY - active.clientY) / Math.max(1, elapsed);
        if (speed > 1.15) {
          detachHover(event);
          return;
        }
        active.clientX = event.clientX;
        active.clientY = event.clientY;
      }
      if (cursor) {
        const oldX = hole.x, oldY = hole.y;
        move(hole, cursor.x - active.offsetX, cursor.y - active.offsetY);
        // Überschüssige Bewegung am Rand nicht aufstauen: Zurückziehen folgt sofort.
        active.offsetX = cursor.x - hole.x;
        active.offsetY = cursor.y - hole.y;
        const dt = Math.max(8, event.timeStamp - active.time) / 1000;
        hole.vx = Math.max(-400, Math.min(400, (hole.x - oldX) / dt));
        hole.vy = Math.max(-400, Math.min(400, (hole.y - oldY) / dt));
        active.time = event.timeStamp;
        active.moved = true;
      }
    });
    const release = event => {
      if (active?.id !== event.pointerId || active.hole !== hole) return;
      if (active.moved && event.timeStamp - active.time > 120) {
        hole.vx = minSpeed; hole.vy = 20;
      }
      hole.cooldown = event.timeStamp + 700;
      active = null;
      handle.classList.remove('is-dragging');
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    };
    handle.addEventListener('pointerup', release);
    handle.addEventListener('pointercancel', release);
    handle.addEventListener('lostpointercapture', release);
    handle.addEventListener('focus', () => { hole.focused = handle.matches(':focus-visible'); });
    handle.addEventListener('blur', () => { hole.focused = false; });
    handle.addEventListener('keydown', event => {
      const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!direction) return;
      event.preventDefault();
      hole.focused = true;
      const step = event.shiftKey ? 40 : 12;
      move(hole, hole.x + direction[0] * step, hole.y + direction[1] * step);
    });
  });

  function configure() {
    if (active) {
      const { handle } = active.hole;
      handle.classList.remove('is-dragging');
      if (handle.hasPointerCapture(active.id)) handle.releasePointerCapture(active.id);
      active = null;
    }
    const compact = mobile.matches;
    width = compact ? 623.62 : 1474.02;
    bandTop = compact ? 230 : 265;
    bandBottom = compact ? 490 : 445;
    minSpeed = compact ? 40 : 65;
    maxSpeed = compact ? 65 : 110;
    stage.setAttribute('viewBox', `0 0 ${width} 680.31`);
    const mask = stage.querySelector('#hero-reveal-mask');
    mask.setAttribute('width', width);
    mask.querySelector('rect').setAttribute('width', width);
    const images = stage.querySelectorAll('image');
    images[0].setAttribute('href', compact ? 'assets/Mobile_backround.png' : 'assets/Background.png');
    images[1].setAttribute('href', compact ? 'assets/Mobile_LogoHeroOverlay.svg' : 'assets/LogoHeroOverlay.svg');
    images.forEach(image => image.setAttribute('width', width));
    const layout = compact ? [
      { x: 175, y: 315, rx: 95, ry: 76, angle: -15 },
      { x: 445, y: 405, rx: 78, ry: 96, angle: 18 },
    ] : positions;
    allHoles.forEach((hole, index) => {
      const enabled = index < layout.length;
      hole.mask.style.display = hole.handle.style.display = enabled ? '' : 'none';
      hole.handle.setAttribute('tabindex', enabled ? '0' : '-1');
      hole.handle.setAttribute('aria-hidden', String(!enabled));
      if (!enabled) return;
      Object.assign(hole, layout[index], {
        vx: (compact ? [46, -53] : [78, -64, -88])[index],
        vy: [23, -31, 19][index], scale: 1, phase: index * 2.1,
        focused: false, returning: false, cooldown: 0,
      });
      bounds(hole, false);
      render(hole);
    });
    holes = allHoles.slice(0, layout.length);
    stage.querySelector('#reveal-description').textContent = compact
      ? 'Zwei bewegliche Gucklöcher zeigen die bunten Buchstaben und Ideen unter dem weissen Logo. Mit dem Finger verschieben und loslassen, um sie sanft zum Logo zurückkehren zu lassen.'
      : 'Drei bewegliche Gucklöcher zeigen die bunten Buchstaben und Ideen unter dem weissen Logo. Mit dem Cursor mitnehmen und durch eine schnelle Bewegung lösen. Alternativ mit den Pfeiltasten verschieben.';
    sync();
  }
  mobile.addEventListener('change', configure);
  configure();

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(stage);
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  schedule();
})();
