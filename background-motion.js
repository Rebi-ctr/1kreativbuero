// Lokaler Wasserfarbenzug bei ruhender Seite. Beim Scrollen zeichnet allein CSS.
// Die Textur enthält nur Farbflächen, nie Seiteninhalte.
(() => {
  const media = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const selector = '.site-header, .hero, .hero-composition, .featured, .feature-stage, .about, .projects, .contact, .contact-page-main, .case-intro, .case-hero, .journey-nav, .journey-step, .journey-end, .case-next, .site-footer';
  const isTransparent = (color) => color === 'transparent' || /^rgba\([^)]*,\s*0(?:\.0+)?\s*\)$/.test(color);
  const MAX_PULL = 76;
  const GRID_WIDTH = 160;
  const SCROLL_PAUSE = 160;
  const vertexSource = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * .5 + .5;
      gl_Position = vec4(aPosition, 0., 1.);
    }
  `;
  const fragmentSource = `
    precision highp float;
    uniform sampler2D uColors;
    uniform sampler2D uFlow;
    uniform vec2 uSize;
    varying vec2 vUv;
    void main() {
      vec3 field = texture2D(uFlow, vec2(vUv.x, 1. - vUv.y)).rgb;
      float wet = field.b;
      vec2 pull = (field.rg * 2. - 1.) * ${MAX_PULL.toFixed(1)} * wet;
      pull.y = -pull.y;
      vec2 uv = clamp(vUv - pull / uSize, vec2(0.), vec2(1.));
      vec2 along = normalize(pull + vec2(.001));
      vec2 across = vec2(-along.y, along.x);
      float radius = wet * (1.5 + length(pull) * .15);
      vec2 a = along * radius / uSize;
      vec2 b = across * radius * .7 / uSize;
      // Weiche, gerichtete Farbmischung nur innerhalb der frischen Pinselspur.
      vec3 paint = texture2D(uColors, uv).rgb * .2;
      paint += texture2D(uColors, clamp(uv + a, 0., 1.)).rgb * .15;
      paint += texture2D(uColors, clamp(uv - a, 0., 1.)).rgb * .15;
      paint += texture2D(uColors, clamp(uv + b, 0., 1.)).rgb * .1;
      paint += texture2D(uColors, clamp(uv - b, 0., 1.)).rgb * .1;
      paint += texture2D(uColors, clamp(uv + a + b, 0., 1.)).rgb * .075;
      paint += texture2D(uColors, clamp(uv + a - b, 0., 1.)).rgb * .075;
      paint += texture2D(uColors, clamp(uv - a + b, 0., 1.)).rgb * .075;
      paint += texture2D(uColors, clamp(uv - a - b, 0., 1.)).rgb * .075;
      gl_FragColor = vec4(paint, 1.);
    }
  `;

  let canvas, gl, program, buffer, colors, flow, context, source, observer;
  let surfaces = [];
  let strokes = [];
  let lastPointer = null;
  let velocityX, velocityY, wetness, pixels;
  let width = 0, height = 0, rows = 0;
  let frame = 0, lastTime = 0;
  let painting = false, scrollUntil = 0;
  let layoutDirty = true;
  let baseColor = '#f0efe9';
  let creativePause = false;

  function schedule() {
    if (canvas && !frame) frame = requestAnimationFrame(draw);
  }

  function clearFlow() {
    velocityX?.fill(0);
    velocityY?.fill(0);
    wetness?.fill(0);
    strokes = [];
    lastPointer = null;
  }

  function hide() {
    if (!painting) return;
    canvas.hidden = true;
    document.body.classList.remove('has-fluid-background');
    surfaces.forEach(({ element }) => element.classList.remove('has-fluid-surface'));
    painting = false;
  }

  function invalidate() {
    layoutDirty = true;
    lastPointer = null;
    // Keine Messungen, Textur-Uploads oder Render-Schleifen durch Scroll-Ereignisse.
    if (!painting && !frame && !strokes.length) return;
    if (frame) cancelAnimationFrame(frame);
    frame = lastTime = 0;
    hide();
    clearFlow();
  }

  function suspend() {
    scrollUntil = performance.now() + SCROLL_PAUSE;
    invalidate();
  }

  function compile(type, code) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(error);
    }
    return shader;
  }

  function texture(unit) {
    const result = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, result);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return result;
  }

  function measure() {
    const w = Math.max(1, document.documentElement.clientWidth || innerWidth);
    const h = Math.max(1, innerHeight);
    const resized = w !== width || h !== height;
    if (resized) {
      width = w; height = h;
      // Weiche Farbflächen benötigen keine zusätzliche HiDPI-Auflösung.
      canvas.width = w;
      canvas.height = h;
      source.width = w; source.height = h;
      rows = Math.max(64, Math.min(256, Math.round(GRID_WIDTH * h / w)));
      const count = GRID_WIDTH * rows;
      velocityX = new Float32Array(count);
      velocityY = new Float32Array(count);
      wetness = new Float32Array(count);
      pixels = new Uint8Array(count * 4);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(gl.getUniformLocation(program, 'uSize'), w, h);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, flow);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, GRID_WIDTH, rows, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    }
    const rects = surfaces.map(({ element }) => element.getBoundingClientRect());
    context.fillStyle = baseColor;
    context.fillRect(0, 0, width, height);
    surfaces.forEach(({ color }, index) => {
      const r = rects[index];
      if (r.bottom < 0 || r.top > height) return;
      context.fillStyle = color;
      // Ganze Pixel decken auch Bruchteile an Abschnittskanten lückenlos ab.
      const left = Math.floor(r.left), top = Math.floor(r.top);
      context.fillRect(left, top, Math.ceil(r.left + r.width) - left, Math.ceil(r.top + r.height) - top);
    });
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, colors);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    if (resized) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    else gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
    layoutDirty = false;
  }

  function stamp(stroke) {
    const cx = stroke.x / width * GRID_WIDTH;
    const cy = stroke.y / height * rows;
    const rx = stroke.radius / width * GRID_WIDTH;
    const ry = stroke.radius / height * rows;
    for (let gy = Math.max(0, Math.floor(cy - ry)); gy <= Math.min(rows - 1, Math.ceil(cy + ry)); gy++) {
      for (let gx = Math.max(0, Math.floor(cx - rx)); gx <= Math.min(GRID_WIDTH - 1, Math.ceil(cx + rx)); gx++) {
        const distance = ((gx - cx) / rx) ** 2 + ((gy - cy) / ry) ** 2;
        if (distance >= 1) continue;
        const weight = (1 - distance) ** 2;
        const i = gy * GRID_WIDTH + gx;
        const blend = weight * .8;
        velocityX[i] += (stroke.dx - velocityX[i]) * blend;
        velocityY[i] += (stroke.dy - velocityY[i]) * blend;
        wetness[i] = Math.max(wetness[i], weight);
      }
    }
  }

  function draw(time) {
    frame = 0;
    if (!canvas) return;
    if (performance.now() < scrollUntil || document.hidden) { invalidate(); return; }
    if (layoutDirty) measure();
    const elapsed = lastTime ? Math.max(1, time - lastTime) : 16;
    lastTime = time;
    const decay = Math.exp(-elapsed / 110);
    for (let i = 0; i < wetness.length; i++) {
      velocityX[i] *= decay;
      velocityY[i] *= decay;
      wetness[i] *= decay;
    }
    strokes.forEach(stamp);
    strokes = [];
    let active = false;
    for (let i = 0; i < wetness.length; i++) {
      if (wetness[i] < .008) { wetness[i] = 0; velocityX[i] = velocityY[i] = 0; }
      else active = true;
      const p = i * 4;
      pixels[p] = Math.round(128 + velocityX[i] / MAX_PULL * 127);
      pixels[p + 1] = Math.round(128 + velocityY[i] / MAX_PULL * 127);
      pixels[p + 2] = Math.round(wetness[i] * 255);
      pixels[p + 3] = 255;
    }
    if (!active) {
      hide();
      lastTime = 0;
      return;
    }
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, flow);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, GRID_WIDTH, rows, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (!painting) {
      // Erst nach einem erfolgreichen Bild die CSS-Flächen kurzzeitig ersetzen.
      canvas.hidden = false;
      document.body.classList.add('has-fluid-background');
      surfaces.forEach(({ element }) => element.classList.add('has-fluid-surface'));
      painting = true;
    }
    schedule();
  }

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = lastTime = 0;
    observer?.disconnect();
    observer = null;
    hide();
    surfaces = [];
    if (gl) {
      gl.deleteTexture(colors); gl.deleteTexture(flow);
      gl.deleteBuffer(buffer); gl.deleteProgram(program);
    }
    canvas?.remove();
    canvas = gl = program = buffer = colors = flow = context = source = null;
    width = height = 0;
    clearFlow();
    velocityX = velocityY = wetness = pixels = null;
  }

  function sync() {
    if (!media.matches || document.hidden || creativePause) { stop(); return; }
    if (canvas) return;
    try {
      const bodyColor = getComputedStyle(document.body).backgroundColor;
      baseColor = isTransparent(bodyColor) ? getComputedStyle(document.documentElement).getPropertyValue('--paper').trim() || '#f0efe9' : bodyColor;
      // Transparente Kinder lassen die bereits gemalte Elternfarbe durch.
      // Sie dürfen dunkle Abschnitte niemals mit der hellen Grundfarbe ersetzen.
      surfaces = Array.from(document.querySelectorAll(selector)).map((element) => {
        const color = getComputedStyle(element).backgroundColor;
        return { element, color };
      }).filter(({ color }) => !isTransparent(color));
      if (!surfaces.length) return;
      canvas = document.createElement('canvas');
      canvas.className = 'site-background';
      canvas.hidden = true;
      canvas.setAttribute('aria-hidden', 'true');
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL nicht verfügbar');
      source = document.createElement('canvas');
      context = source.getContext('2d', { alpha: false });
      if (!context) throw new Error('Canvas nicht verfügbar');
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
      program = gl.createProgram();
      gl.attachShader(program, vertex); gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex); gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'aPosition');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      colors = texture(0); flow = texture(1);
      gl.uniform1i(gl.getUniformLocation(program, 'uColors'), 0);
      gl.uniform1i(gl.getUniformLocation(program, 'uFlow'), 1);
      canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); stop(); });
      // Solange die Maus ruht, bleiben Canvas und Render-Schleife inaktiv.
      layoutDirty = true;
      document.body.prepend(canvas);
      if ('ResizeObserver' in window) {
        observer = new ResizeObserver(invalidate);
        surfaces.forEach(({ element }) => observer.observe(element));
      }
    } catch (error) {
      stop(); // Bei fehlender GPU-Unterstützung bleiben die normalen CSS-Farbflächen.
      console.warn('Hintergrundeffekt deaktiviert:', error.message);
    }
  }

  function move(event) {
    if (!canvas) return;
    if (event.pointerType !== 'mouse' || event.buttons || performance.now() < scrollUntil) { lastPointer = null; return; }
    const point = { x: event.clientX, y: event.clientY, time: event.timeStamp };
    if (lastPointer && point.time - lastPointer.time < 100) {
      const dx = point.x - lastPointer.x;
      const dy = point.y - lastPointer.y;
      const distance = Math.hypot(dx, dy);
      if (distance > .25) {
        const speed = distance / Math.max(8, point.time - lastPointer.time);
        const strength = Math.min(MAX_PULL, speed * 24);
        const radius = 72 + strength * .5;
        const steps = Math.min(24, Math.max(1, Math.ceil(distance / (radius * .25))));
        for (let step = 1; step <= steps; step++) {
          strokes.push({ x: lastPointer.x + dx * step / steps, y: lastPointer.y + dy * step / steps, dx: dx / distance * strength, dy: dy / distance * strength, radius });
        }
        if (strokes.length > 96) strokes.splice(0, strokes.length - 96);
        schedule();
      }
    }
    lastPointer = point;
  }

  window.addEventListener('pointermove', move, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { lastPointer = null; });
  window.addEventListener('blur', invalidate);
  // Mausrad und Scroll-Tasten schon vor der Standardaktion abfangen.
  window.addEventListener('wheel', suspend, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) suspend();
  });
  window.addEventListener('scroll', suspend, { passive: true });
  window.addEventListener('resize', invalidate, { passive: true });
  window.addEventListener('pagehide', stop);
  window.addEventListener('creativepausechange', event => {
    creativePause = event.detail.active;
    sync();
  });
  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', sync);
  media.addEventListener('change', sync);
  sync();
})();
