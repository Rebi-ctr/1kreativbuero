// Büro-Szene, Schriftanimation und Teamfächer der Startseite.
(() => {
  function renderStudio() {
    const deck = $('#people-grid');
    if (!deck) return;
    const switches = $('#people-switches');
    const panel = $('#person-panel');
    const initial = 0;
    const title = $('#creative-title', deck)?.textContent || 'DAS KREATIVE.';
    deck.innerHTML = `<h3 class="creative-title creative-title-fill" id="creative-title"><span>${escapeHTML(title)}</span></h3>` + people.map((person, index) => `<article class="person-card${index === initial ? ' is-active' : ''}" data-person="${index}" aria-labelledby="person-name-${index}">
      <div class="person-sheet"><div class="person-visual">
        <img src="${person.image}" class="${person.imageClass}" alt="${escapeHTML(person.name)} von 1Kreativbüro" loading="lazy" width="${person.width}" height="${person.height}">
      </div>
      <div class="person-info"><div class="person-title"><h4 id="person-name-${index}">${escapeHTML(person.name)}</h4></div>
      <p class="person-role">${escapeHTML(person.role)}</p></div></div>
      <button class="person-select" type="button" data-person="${index}" aria-label="Perspektive von ${escapeHTML(person.name)} anzeigen" aria-controls="person-panel" aria-pressed="${index === initial}"></button>
    </article>`).join('') + `<svg class="creative-clip" aria-hidden="true" focusable="false"><defs><clipPath id="creative-card-clip" clipPathUnits="userSpaceOnUse">${people.map(() => '<polygon></polygon>').join('')}</clipPath></defs></svg><div class="creative-title creative-title-outline" aria-hidden="true"><span>${escapeHTML(title)}</span></div>`;
    switches.innerHTML = people.map((person, index) => `<button class="people-switch meta" type="button" data-person="${index}" aria-controls="person-panel" aria-pressed="${index === initial}">${escapeHTML(person.name)}</button>`).join('');
    const cards = Array.from(deck.querySelectorAll('.person-card'));
    const controls = [...deck.querySelectorAll('.person-select'), ...switches.querySelectorAll('button')];
    // Die Namensauswahl folgt der tatsächlichen Kartenhöhe statt einer festen Leerfläche.
    let deckFrame = 0;
    function fitPeopleDeck() {
      if (deckFrame) return;
      deckFrame = requestAnimationFrame(() => {
        deckFrame = 0;
        const top = deck.getBoundingClientRect().top;
        const bottom = Math.max(...cards.map(card => $('.person-sheet', card).getBoundingClientRect().bottom));
        const height = Math.ceil(bottom - top + 20);
        if (deck.style.height !== `${height}px`) deck.style.height = `${height}px`;
      });
    }
    if ('ResizeObserver' in window) {
      const cardObserver = new ResizeObserver(fitPeopleDeck);
      cards.forEach(card => cardObserver.observe($('.person-sheet', card)));
    }
    window.addEventListener('resize', fitPeopleDeck, { passive: true });
    cards.forEach(card => card.addEventListener('transitionend', fitPeopleDeck));
    document.fonts.ready.then(fitPeopleDeck);
    fitPeopleDeck();
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const refreshTitle = setupLayeredTitle(deck, cards);
    let current = -1;
    const selectPerson = (index) => {
      if (index === current || !people[index]) return;
      current = index;
      cards.forEach((card, i) => card.classList.toggle('is-active', i === index));
      controls.forEach((control) => control.setAttribute('aria-pressed', String(Number(control.dataset.person) === index)));
      const person = people[index];
      panel.innerHTML = `<div><div class="person-heading"><h4>${escapeHTML(person.name)}</h4><p class="person-panel-role">${escapeHTML(person.role)}</p></div><a class="person-email" href="mailto:${escapeHTML(person.email)}">${escapeHTML(person.email)}</a></div><div><p class="person-description">${escapeHTML(person.description)}</p><div class="strength-tags">${person.strengths.map((strength) => `<span>${escapeHTML(strength)}</span>`).join('')}</div></div>`;
      refreshTitle();
    };
    cards.forEach((card, index) => {
      card.addEventListener('pointerenter', (event) => {
        if (hover.matches && event.pointerType !== 'touch') selectPerson(index);
      });
      card.addEventListener('focusin', () => selectPerson(index));
    });
    controls.forEach((control) => control.addEventListener('click', () => selectPerson(Number(control.dataset.person))));
    selectPerson(initial);

    if (studio.email) {
      const container = $('#contact-action');
      container?.querySelectorAll('[data-studio-email]').forEach(link => {
        link.href = `mailto:${studio.email}`;
        if (link.hasAttribute('data-email-address')) link.textContent = studio.email;
      });
    }
  }

  function setupStudioTitle() {
    const label = $('#studio-title-label');
    if (!label) return;
    const visual = $('span', label);
    const original = label.getAttribute('aria-label');
    const prefix = 'DAS ';
    const capacity = Math.max(original.length, studioHoverText(original, 1).length) - prefix.length;
    visual.innerHTML = `<span class="studio-title-prefix">${prefix}</span><span class="studio-title-change">${Array.from({ length: capacity }, () => '<span class="studio-title-char"></span>').join('')}</span>`;
    const changing = $('.studio-title-change', visual);
    const letters = Array.from(changing.children);
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, start = 0;
    function show(text) {
      letters.forEach((letter, index) => { letter.textContent = text[index + prefix.length] || ''; });
      label.setAttribute('aria-label', text);
    }
    function restore() {
      cancelAnimationFrame(frame);
      frame = 0;
      show(original);
    }
    function measure() {
      restore();
      const originalWidth = label.getBoundingClientRect().width;
      show(studioHoverText(original, 1));
      const hoverWidth = label.getBoundingClientRect().width;
      label.style.setProperty('--title-hit-width', `${Math.max(originalWidth, hoverWidth)}px`);
      show(original);
    }
    function tick(time) {
      const progress = Math.min(1, (time - start) / 250);
      const text = studioHoverText(original, progress);
      show(text);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else frame = 0;
    }
    function play() {
      restore();
      if (reducedMotion.matches) { show(studioHoverText(original, 1)); return; }
      start = performance.now();
      frame = requestAnimationFrame(tick);
    }
    label.addEventListener('pointerenter', (event) => { if (hover.matches && event.pointerType !== 'touch') play(); });
    label.addEventListener('pointerleave', restore);
    label.addEventListener('focus', play);
    label.addEventListener('blur', restore);
    label.addEventListener('click', play);
    window.addEventListener('resize', measure, { passive: true });
    reducedMotion.addEventListener('change', restore);
    document.addEventListener('visibilitychange', () => { if (document.hidden) restore(); });
    measure();
    document.fonts.ready.then(measure);
  }

  function setupStudioStory() {
    const story = $('#studio-story');
    if (!story) return;
    const scene = $('#studio-scene');
    const grid = $('#studio-grid');
    const clamp = (value) => Math.max(0, Math.min(1, value));
    let lines = [];
    let columns = 0;
    function buildGrid() {
      const style = getComputedStyle(scene);
      const nextColumns = Number(style.getPropertyValue('--studio-columns')) || 16;
      const offset = Number(style.getPropertyValue('--studio-offset')) || 0;
      if (nextColumns === columns) return;
      columns = nextColumns;
      grid.innerHTML = [
        ...Array.from({ length: Math.ceil(columns) + 1 }, (_, i) => `<span class="studio-line is-vertical" style="--line-position:${offset + i / columns * 100}%"></span>`),
        ...Array.from({ length: 32 }, (_, i) => `<span class="studio-line is-horizontal" style="--line-row:${i - 4}"></span>`),
      ].join('');
      lines = Array.from(grid.querySelectorAll('.studio-line'));
    }
    const hotspots = Array.from(story.querySelectorAll('.studio-word')).map((element, index) => {
      const word = element.dataset.word;
      element.innerHTML = Array.from(word, (letter) => `<span class="studio-letter"><svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><text fill="currentColor">${escapeHTML(letter)}</text></svg></span>`).join('');
      return { element: element.parentElement, word, letters: Array.from(element.children), seed: index * 11 };
    });
    const metricsCanvas = document.createElement('canvas');
    const metricsContext = metricsCanvas.getContext('2d');
    const glyphMetrics = new Map();

    function fitGlyph(cell, character) {
      const text = cell.querySelector('text');
      const font = getComputedStyle(cell);
      const key = `${font.fontWeight}|${font.fontFamily}|${character}`;
      let fitted = glyphMetrics.get(key);
      if (!fitted) {
        metricsContext.font = `${font.fontWeight} 100px ${font.fontFamily}`;
        const metrics = metricsContext.measureText(character);
        const width = metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
        const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        // Die sichtbaren Konturen passen mit einem kleinen Rand in die 100er-Zelle.
        const scaleY = 96 / Math.max(1, height);
        const scaleX = Math.min(scaleY, 96 / Math.max(1, width));
        fitted = {
          scaleX, scaleY,
          x: (100 - width * scaleX) / 2 + metrics.actualBoundingBoxLeft * scaleX,
          y: 2 + metrics.actualBoundingBoxAscent * scaleY,
        };
        glyphMetrics.set(key, fitted);
      }
      text.textContent = character;
      text.setAttribute('font-size', 100);
      text.setAttribute('x', 0);
      text.setAttribute('y', 0);
      text.setAttribute('transform', `translate(${fitted.x} ${fitted.y}) scale(${fitted.scaleX} ${fitted.scaleY})`);
    }

    const deck = $('#people-grid');
    let frame = 0;
    let lastState = '';

    function paint(progress, wordProgress = hotspots.map(() => progress)) {
      const state = [progress, ...wordProgress].map((value) => value.toFixed(4)).join('|');
      if (state === lastState) return;
      lastState = state;
      lines.forEach((line, index) => {
        const delay = index <= Math.ceil(columns) ? .06 + index * .018 : (index - Math.ceil(columns) - 1) * .025;
        line.style.setProperty('--line-progress', clamp((progress - delay) / .55).toFixed(4));
      });
      hotspots.forEach(({ element, word, letters, seed }, hotspotIndex) => {
        const local = wordProgress[hotspotIndex];
        element.style.setProperty('--hotspot-visibility', clamp(local / .15).toFixed(4));
        letters.forEach((letter, index) => {
          const state = studioGlyph(word, index, local, seed);
          fitGlyph(letter, state.character);
        });
      });
    }

    function update() {
      frame = 0;
      if (reducedMotion.matches) { paint(1); return; }
      const bounds = story.getBoundingClientRect();
      if (bounds.bottom < 0 || bounds.top > innerHeight) return;
      // Der normale Eintritt in den Viewport steuert den Aufbau, ohne Scrollpause.
      const travel = Math.max(1, Math.min(bounds.height, innerHeight) * .9);
      const progress = clamp((innerHeight * .72 - bounds.top) / travel);
      // Jeder Hotspot rattert erst, wenn er selbst sichtbar ins Bild kommt.
      const wordProgress = hotspots.map(({ element }) => clamp((innerHeight * .9 - element.getBoundingClientRect().top) / Math.max(1, innerHeight * .4)));
      paint(progress, wordProgress);
    }
    function schedule() {
      if (!frame && !document.hidden) frame = requestAnimationFrame(update);
    }
    function refresh() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastState = '';
      buildGrid();
      story.classList.toggle('is-enhanced', !reducedMotion.matches);
      const cell = scene.getBoundingClientRect().width / columns;
      const breathing = parseFloat(getComputedStyle(story).paddingTop);
      const rowOffset = scene.getBoundingClientRect().width > 700 ? -cell * 6 / 85 : 0;
      lines.filter(line => line.classList.contains('is-horizontal')).forEach(line => {
        const row = Number(line.style.getPropertyValue('--line-row'));
        line.style.setProperty('--line-dark-height', row * cell + rowOffset < -breathing ? '1px' : '0px');
      });
      if (deck) {
        const sceneBounds = scene.getBoundingClientRect();
        const deckBounds = deck.getBoundingClientRect();
        const end = deckBounds.top + Math.min(deckBounds.height * .7, 470);
        const overlap = Math.max(80, end - sceneBounds.bottom);
        grid.style.setProperty('--grid-overlap', `${overlap.toFixed(1)}px`);
        grid.style.setProperty('--grid-fade-start', `${Math.max(0, deckBounds.top - sceneBounds.top + deckBounds.height * .08).toFixed(1)}px`);
      }
      if (reducedMotion.matches) paint(1);
      else update();
    }
    document.fonts.ready.then(() => { glyphMetrics.clear(); refresh(); });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', refresh, { passive: true });
    window.addEventListener('pageshow', refresh);
    reducedMotion.addEventListener('change', refresh);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
    refresh();
  }

  renderStudio();
  setupStudioStory();
  setupStudioTitle();
})();
