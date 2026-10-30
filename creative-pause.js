// Eine Momentaufnahme fällt auseinander. Das eigentliche Dokument bleibt erhalten.
(() => {
  const trigger = document.querySelector('[data-creative-pause]');
  if (!trigger || typeof HTMLDialogElement === 'undefined') return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const roots = [...document.querySelectorAll('body > header, body > main, body > footer')];
  const textProperties = ['font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'font-variant', 'font-feature-settings', 'font-kerning', 'letter-spacing', 'text-transform', 'text-decoration', 'text-shadow', 'color', '-webkit-text-fill-color', '-webkit-text-stroke'];
  let session = null;

  const dialog = document.createElement('dialog');
  dialog.className = 'creative-pause';
  dialog.id = 'creative-pause';
  dialog.setAttribute('aria-labelledby', 'creative-pause-title');
  dialog.innerHTML = `<div class="creative-pause-scene" aria-hidden="true" inert></div>
    <div class="creative-pause-message">
      <p class="meta">Kreative Pause</p>
      <h2 id="creative-pause-title">Gute Ideen brauchen<br><span>manchmal eine Pause.</span></h2>
      <button class="creative-pause-resume" type="button">Weiter geht’s <span aria-hidden="true">↗</span></button>
    </div>`;
  document.body.append(dialog);
  const scene = dialog.querySelector('.creative-pause-scene');
  const message = dialog.querySelector('.creative-pause-message');
  const resume = dialog.querySelector('.creative-pause-resume');
  trigger.setAttribute('aria-controls', dialog.id);
  trigger.hidden = false;

  const signal = active => window.dispatchEvent(new CustomEvent('creativepausechange', { detail: { active } }));
  const random = seed => {
    const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return value - Math.floor(value);
  };
  const visible = (rect, width, height) => rect.width > 1 && rect.height > 1 && rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width;

  function piece(content, rect) {
    const element = document.createElement('div');
    element.className = 'creative-pause-piece';
    Object.assign(element.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    element.append(content);
    scene.append(element);
    return { element, rect };
  }

  function extraMedia(width, height, used) {
    const candidates = [];
    const selector = '.person-card img, .feature-card img, .project-row-image img, .case-hero img, .journey-image img, .rigi-film-gallery img, .rigi-photo-gallery img, .case-gallery img';
    for (const source of document.querySelectorAll(selector)) {
      const url = source.currentSrc || source.src;
      // Ausserhalb des Ausschnitts nur bereits geladene Bilder derselben Seite verwenden.
      if (!source.complete || !source.naturalWidth || !source.naturalHeight || !url || used.has(url)) continue;
      const rect = source.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1 || visible(rect, width, height)) continue;
      const style = getComputedStyle(source);
      if (style.visibility !== 'visible' || style.display === 'none' || Number(style.opacity) === 0) continue;
      used.add(url);
      candidates.push({ source, style, team: Boolean(source.closest('.person-card')) });
    }

    // Auch auf langen Projektseiten kommen Bilder aus mehreren Kapiteln zum Zug.
    const spread = (items, count) => {
      count = Math.min(items.length, count);
      if (count <= 1) return items.slice(0, count);
      return Array.from({ length: count }, (_, index) => items[Math.round(index * (items.length - 1) / (count - 1))]);
    };
    const mobile = width < 700;
    const team = spread(candidates.filter(item => item.team), mobile ? 2 : 3);
    const projects = spread(candidates.filter(item => !item.team), (mobile ? 4 : 9) - team.length);
    const selected = [];
    for (let index = 0; index < Math.max(team.length, projects.length); index++) {
      if (team[index]) selected.push(team[index]);
      if (projects[index]) selected.push(projects[index]);
    }

    return selected.map(({ source, style }, index) => {
      const ratio = source.naturalWidth / source.naturalHeight;
      const maxWidth = Math.min(width * (mobile ? .34 : .18), mobile ? 145 : 245);
      const maxHeight = Math.min(height * .22, mobile ? 150 : 220);
      const cardWidth = Math.min(maxWidth, maxHeight * ratio);
      const cardHeight = cardWidth / ratio;
      // Verteilt über die Breite einregnen lassen; am Anfang komplett ausserhalb des Bilds.
      const columns = Math.min(selected.length, mobile ? 3 : 5);
      const centre = (index % columns + .5) * width / columns;
      const left = Math.max(8, Math.min(width - cardWidth - 8, centre - cardWidth / 2));
      const top = -cardHeight - 24 - random(index + 30) * 90;
      const rect = { left, top, width: cardWidth, height: cardHeight, right: left + cardWidth, bottom: top + cardHeight };
      const copy = document.createElement('canvas');
      const resolution = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));
      copy.width = Math.max(1, Math.round(cardWidth * resolution));
      copy.height = Math.max(1, Math.round(cardHeight * resolution));
      try {
        const context = copy.getContext('2d');
        if (!context) return null;
        context.drawImage(source, 0, 0, copy.width, copy.height);
      } catch { return null; }
      Object.assign(copy.style, { width: '100%', height: '100%', objectFit: style.objectFit, objectPosition: style.objectPosition });
      const item = piece(copy, rect);
      item.element.classList.add('creative-pause-extra');
      item.extra = true;
      item.entry = index;
      return item;
    }).filter(Boolean);
  }

  function snapshot(width, height) {
    const pieces = [], plates = [];
    const used = new Set();
    // Die sichtbaren Flächen erhalten den ersten Frame, bevor sie ins Schwarz übergehen.
    for (const element of document.querySelectorAll('.site-header, main, main section, .case-intro, .case-hero, .journey-end, .site-footer, .contact, .footer-bottom')) {
      const rect = element.getBoundingClientRect();
      if (!visible(rect, width, height)) continue;
      const color = getComputedStyle(element).backgroundColor;
      if (color === 'transparent' || /^rgba\([^)]*,\s*0\)$/.test(color)) continue;
      const plate = document.createElement('div');
      plate.className = 'creative-pause-surface';
      Object.assign(plate.style, { left: `${Math.max(0, rect.left)}px`, top: `${Math.max(0, rect.top)}px`, width: `${Math.min(width, rect.right) - Math.max(0, rect.left)}px`, height: `${Math.min(height, rect.bottom) - Math.max(0, rect.top)}px`, background: color });
      plates.push(plate);
    }
    scene.append(...plates);

    // Medien bleiben als ganze Blätter erhalten; laufende Filme werden eingefroren.
    for (const source of document.querySelectorAll('header img, main img, footer img, main video')) {
      const rect = source.getBoundingClientRect(), style = getComputedStyle(source);
      if (!visible(rect, width, height) || style.visibility !== 'visible' || Number(style.opacity) === 0) continue;
      let copy;
      if (source.tagName === 'VIDEO') {
        copy = document.createElement('canvas');
        copy.width = source.videoWidth || 1;
        copy.height = source.videoHeight || 1;
        try { copy.getContext('2d').drawImage(source, 0, 0, copy.width, copy.height); } catch { continue; }
      } else {
        copy = document.createElement('img');
        copy.src = source.currentSrc || source.src;
        copy.alt = '';
      }
      Object.assign(copy.style, { width: '100%', height: '100%', objectFit: style.objectFit, objectPosition: style.objectPosition, borderRadius: style.borderRadius });
      pieces.push(piece(copy, rect));
      if (source.tagName === 'IMG') used.add(source.currentSrc || source.src);
    }

    // Range misst Wörter ohne die Texte, Links oder Formularfelder aufzuteilen.
    const range = document.createRange();
    const limit = width < 700 ? 75 : 120;
    for (const root of roots) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode()) && pieces.length < limit) {
        const parent = node.parentElement;
        if (!node.textContent.trim() || parent.closest('script, style, noscript, svg, textarea, select, .sr-only, .form-honeypot, [hidden]')) continue;
        const style = getComputedStyle(parent);
        if (style.visibility !== 'visible' || style.display === 'none' || Number(style.opacity) === 0) continue;
        if (!visible(parent.getBoundingClientRect(), width, height)) continue;
        for (const word of node.textContent.matchAll(/\S+/g)) {
          if (pieces.length >= limit) break;
          range.setStart(node, word.index);
          range.setEnd(node, word.index + word[0].length);
          const rect = range.getBoundingClientRect();
          if (!visible(rect, width, height)) continue;
          const copy = document.createElement('span');
          copy.textContent = word[0];
          for (const property of textProperties) copy.style.setProperty(property, style.getPropertyValue(property));
          pieces.push(piece(copy, rect));
        }
      }
    }
    pieces.push(...extraMedia(width, height, used));
    return { pieces, plates };
  }

  function animate(element, frames, options, current) {
    const animation = element.animate(frames, { fill: 'both', ...options });
    animation.finished.catch(() => {}); // Abbruch durch Esc, Resize oder Seitenwechsel ist regulär.
    current.animations.push(animation);
    return animation;
  }

  function fall(current) {
    const { width, height } = current;
    let messageDelay = 850;
    current.pieces.forEach((item, index) => {
      const { element, rect } = item;
      const angle = (random(index + 2) - .5) * 42;
      const radians = Math.abs(angle) * Math.PI / 180;
      const scale = Math.min(1, width * .72 / rect.width, height * .23 / rect.height);
      const rotatedWidth = (rect.width * Math.cos(radians) + rect.height * Math.sin(radians)) * scale;
      const rotatedHeight = (rect.height * Math.cos(radians) + rect.width * Math.sin(radians)) * scale;
      const centre = rect.left + rect.width / 2;
      const x = Math.max(rotatedWidth / 2 + 8, Math.min(width - rotatedWidth / 2 - 8, centre + (random(index + 8) - .5) * width * .22));
      const dx = x - centre;
      const dy = height - 8 - random(index + 17) * Math.min(52, height * .06) - rotatedHeight / 2 - (rect.top + rect.height / 2);
      const transform = (y, turn = angle) => `translate(${dx}px, ${y}px) rotate(${turn}deg) scale(${scale})`;
      const bounce = Math.min(38, Math.max(5, Math.abs(dy) * .08));
      const duration = 1000 + random(index + 4) * 260;
      const delay = item.extra ? 300 + item.entry * 100 : random(index + 13) * 230;
      if (item.extra) messageDelay = Math.max(messageDelay, delay + duration - 100);
      item.landed = transform(dy);
      animate(element, [
        { transform: 'none', offset: 0, easing: 'cubic-bezier(.55,.04,.87,.53)' },
        { transform: item.landed, offset: .72, easing: 'cubic-bezier(.18,.65,.35,1)' },
        { transform: transform(dy - bounce, angle * .9), offset: .86, easing: 'cubic-bezier(.55,.04,.87,.53)' },
        { transform: item.landed, offset: 1 },
      ], { duration, delay }, current);
    });
    current.plates.forEach(plate => animate(plate, [{ opacity: 1 }, { opacity: 0 }], { duration: 650, delay: 120 }, current));
    animate(message, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: messageDelay, easing: 'ease-out' }, current);
  }

  function cleanup({ focus = true, playback = true } = {}) {
    const current = session;
    if (!current) return;
    session = null;
    current.animations.forEach(animation => animation.cancel());
    scene.replaceChildren();
    document.documentElement.classList.remove('is-creative-paused');
    if (dialog.open) dialog.close();
    signal(false);
    if (playback && !document.hidden) current.playing.forEach(video => video.play()?.catch(() => {}));
    if (focus && trigger.isConnected) trigger.focus({ preventScroll: true });
  }

  async function restore(immediate = false) {
    const current = session;
    if (!current || current.restoring) {
      if (immediate) cleanup({ focus: false });
      return;
    }
    if (immediate || motion.matches || !current.pieces.length) { cleanup({ focus: !immediate }); return; }
    current.restoring = true;
    try {
      // Auch ein früher Klick oder Esc kann die Fallbewegung direkt umkehren.
      const starts = current.pieces.map(({ element }) => getComputedStyle(element).transform);
      const opacity = getComputedStyle(message).opacity;
      const plates = current.plates.map(plate => getComputedStyle(plate).opacity);
      current.animations.forEach(animation => animation.cancel());
      current.animations = [];
      animate(message, [{ opacity }, { opacity: 0 }], { duration: 160 }, current);
      current.plates.forEach((plate, index) => animate(plate, [{ opacity: plates[index] }, { opacity: 1 }], { duration: 500, delay: 100 }, current));
      const returns = current.pieces.map(({ element }, index) => animate(element, [{ transform: starts[index] }, { transform: 'none' }], { duration: 620, delay: random(index + 9) * 120, easing: 'cubic-bezier(.22,.8,.25,1)' }, current).finished);
      await Promise.allSettled(returns);
      if (session === current) cleanup();
    } catch (error) {
      // Auch bei fehlgeschlagenem Rückweg bleibt der Dialog jederzeit verlassbar.
      if (session === current) cleanup();
      console.warn('Kreative Pause ohne Rückanimation beendet:', error.message);
    }
  }

  function calmPause(current, error) {
    // Ein einzelnes nicht erfassbares Element darf den Button nicht still abbrechen.
    current.animations.forEach(animation => animation.cancel());
    current.animations = [];
    current.pieces = [];
    current.plates = [];
    scene.replaceChildren();
    console.warn('Kreative Pause ohne Fallanimation:', error.message);
  }

  function resize() {
    if (!session) return;
    // showModal und die Scrollsperre können selbst visualViewport.resize auslösen.
    // innerWidth enthält die Scrollbar und bleibt dabei als Fensterreferenz stabil.
    if (Math.abs(window.innerWidth - session.viewportWidth) > 1 || Math.abs(window.innerHeight - session.viewportHeight) > 1) restore(true);
  }

  function start() {
    if (session) return;
    const current = { animations: [], pieces: [], plates: [], playing: [], width: document.documentElement.clientWidth, height: window.innerHeight, viewportWidth: window.innerWidth, viewportHeight: window.innerHeight };
    session = current;
    try {
      signal(true);
      try {
        if (!motion.matches && typeof dialog.animate === 'function') Object.assign(current, snapshot(current.width, current.height));
      } catch (error) { calmPause(current, error); }
      current.playing = [...document.querySelectorAll('video')].filter(video => !video.paused);
      current.playing.forEach(video => video.pause());
      dialog.showModal();
      if (session !== current) return;
      document.documentElement.classList.add('is-creative-paused');
      if (session !== current) return;
      try {
        if (current.pieces.length) fall(current);
      } catch (error) { calmPause(current, error); }
      resume.focus({ preventScroll: true });
    } catch (error) {
      cleanup();
      console.warn('Kreative Pause konnte nicht gestartet werden:', error.message);
    }
  }

  trigger.addEventListener('click', start);
  resume.addEventListener('click', () => restore());
  dialog.addEventListener('cancel', event => { event.preventDefault(); restore(); });
  dialog.addEventListener('close', () => { if (!dialog.open) cleanup(); });
  window.addEventListener('resize', resize, { passive: true });
  window.visualViewport?.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pagehide', () => cleanup({ focus: false, playback: false }));
  motion.addEventListener('change', () => restore(true));
})();
