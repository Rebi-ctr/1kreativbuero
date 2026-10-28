// Projektübersicht, Projektseiten und native Seitenübergänge.
(() => {
  function renderFeature() {
    const stage = $('#feature-stage');
    if (!stage) return;
    stage.innerHTML = `<h3 class="feature-title">${escapeHTML(featuredProject.title)}</h3>${featuredProject.views.map((view, index) => `<button class="feature-card${index === 0 ? ' is-active' : ''}" type="button" aria-label="${escapeHTML(view.season)}bild in den Vordergrund holen" aria-pressed="${index === 0}">
        <span class="feature-sheet"><img src="${view.image}" alt="${escapeHTML(view.alt)}" width="${view.width}" height="${view.height}" loading="lazy"></span>
      </button>`).join('')}
      <a class="feature-open" data-project="${featuredProject.slug}" href="${projectURL(featuredProject)}" aria-label="Ab ins Projektbüro: Wiriehorn-Projekt im Detail">Ab ins Projektbüro <span aria-hidden="true">↗</span></a>`;

    const cards = stage.querySelectorAll('.feature-card');
    const hoverAvailable = window.matchMedia('(hover: hover) and (pointer: fine)');
    const selectCard = (selected) => {
      if (!selected || selected.classList.contains('is-active')) return;
      cards.forEach((card) => {
        const active = card === selected;
        card.classList.toggle('is-active', active);
        card.setAttribute('aria-pressed', String(active));
      });
    };
    cards.forEach((card) => {
      // Die Trefferflächen bleiben fest; nur das innere Bild bewegt sich.
      card.addEventListener('pointerenter', (event) => {
        if (hoverAvailable.matches && event.pointerType !== 'touch') selectCard(card);
      });
      card.addEventListener('focus', () => selectCard(card));
    });
    stage.addEventListener('click', (event) => selectCard(event.target.closest('.feature-card')));
  }

  function projectVisual(project, hero = false) {
    if (!project.image) {
      return `<div class="project-placeholder" aria-hidden="true"><span class="project-placeholder-title">${escapeHTML(project.title)}.</span><span class="meta">Projektbilder folgen</span></div>`;
    }
    return `<img${hero ? ` data-case-cover="${escapeHTML(project.slug)}"` : ''} src="${escapeHTML(project.image)}" alt="${escapeHTML(project.alt)}" width="${project.width}" height="${project.height}" ${hero ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
  }

  function renderProjects() {
    const list = $('#project-list');
    if (!list) return;
    list.innerHTML = projects.map((project) => `<a class="project-row" data-project="${project.slug}" href="${projectURL(project)}" aria-label="${escapeHTML(project.title)}: Projekt entdecken">
      <div><h3 class="project-row-title">${escapeHTML(project.title)}</h3>${project.category ? `<span class="project-row-label">${escapeHTML(project.category)}</span>` : ''}</div>
      <div class="project-row-image">${projectVisual(project)}</div>
      <div class="project-row-type"><span class="meta">Projekt entdecken</span><span class="project-row-arrow" aria-hidden="true">↗</span></div>
    </a>`).join('');
  }

  function caseFigures(images) {
    return images.map((view) => `<figure><img src="${escapeHTML(view.image)}" alt="${escapeHTML(view.alt)}" width="${view.width}" height="${view.height}" loading="lazy" decoding="async">${view.caption ? `<figcaption class="meta">${escapeHTML(view.caption)}</figcaption>` : ''}</figure>`).join('');
  }

  function renderProjectStory(project) {
    if (project.film) {
      const { film, photoshoot } = project;
      return `<div class="journey">
      <section class="journey-step" id="imagefilm" aria-labelledby="case-film-title">
        <div class="journey-marker"><span>01</span><span class="meta">Imagefilm</span></div>
        <div class="journey-content"><div class="journey-copy"><h2 id="case-film-title">${escapeHTML(film.title)}</h2><p>${escapeHTML(film.text)}</p></div>
        ${film.video ? `<figure class="rigi-film-player"><video src="${escapeHTML(film.video)}" poster="${escapeHTML(project.image)}" controls playsinline preload="none">Dein Browser unterstützt dieses Video nicht. <a href="${escapeHTML(film.video)}">Imagefilm öffnen</a></video><figcaption>Imagefilm / ${escapeHTML(project.title)}</figcaption></figure>` : ''}
        <div class="journey-report rigi-film-gallery" role="group" aria-label="Filmstills aus dem Rigi-Imagefilm">${caseFigures(film.frames)}</div></div>
      </section>
      <section class="journey-step" id="fotoshooting" aria-labelledby="case-photo-title">
        <div class="journey-marker"><span>02</span><span class="meta">Fotoshooting</span></div>
        <div class="journey-content"><div class="journey-copy"><h2 id="case-photo-title">${escapeHTML(photoshoot.title)}</h2><p>${escapeHTML(photoshoot.text)}</p></div>
        ${photoshoot.images.length ? `<div class="journey-report rigi-photo-gallery">${caseFigures(photoshoot.images)}</div>` : '<div class="rigi-photo-placeholder" aria-hidden="true"><span>Fotoshooting.</span><span class="meta">Bilder folgen</span></div>'}</div>
      </section>
      </div>`;
    }
    const gallery = project.views?.slice(1) || [];
    return gallery.length ? `<div class="case-gallery case-gallery-featured">${gallery.map((view) => `<figure><img src="${view.image}" alt="${escapeHTML(view.alt)}" width="${view.width}" height="${view.height}" loading="lazy"><figcaption class="meta">${escapeHTML(view.season)}</figcaption></figure>`).join('')}</div>` : `<section class="case-description" aria-labelledby="case-story-title"><span class="meta">PROJEKTEINBLICK</span><div><h2 id="case-story-title">Die Geschichte folgt.</h2><p>Hier zeigen wir bald Bilder und Einblicke in unser ${escapeHTML(project.title)}-Projekt.</p></div></section>`;
  }

  function renderFilmCase(container, project) {
    const nextProject = projects[(projects.indexOf(project) + 1) % projects.length];
    const headline = project.headline || [project.title];
    document.title = `${project.title} – Imagefilm & Fotoshooting — 1Kreativbüro`;
    document.querySelector('meta[name="description"]').content = `${project.title}: Einblicke in den Imagefilm und das Fotoshooting von 1Kreativbüro.`;
    document.body.classList.add('project-story-page', 'rigi-page');
    container.innerHTML = `<article class="case-project" aria-labelledby="case-title">
      <section class="case-intro" aria-labelledby="case-title">
        <div class="case-breadcrumb meta"><a href="index.html#projekte">← Zur Projektübersicht</a><span>${escapeHTML(project.title.toUpperCase())} / PROJEKTGESCHICHTE</span></div>
        <h1 class="case-title" id="case-title">${headline.map(escapeHTML).join('<br>')}</h1>
        <div class="case-meta"><p>${escapeHTML(project.lead)}</p><div class="case-tags"><span class="meta">PROJEKT<br>${escapeHTML(project.title)}</span><span class="meta">LEISTUNGEN<br>${escapeHTML(project.category)}</span></div></div>
      </section>
      <figure class="case-hero">${projectVisual(project, true)}${project.coverCaption ? `<figcaption class="sr-only">${escapeHTML(project.coverCaption)}</figcaption>` : ''}</figure>
      <nav class="journey-nav" aria-label="Projektbereiche"><a href="#imagefilm"><span>01</span> Imagefilm</a><a href="#fotoshooting"><span>02</span> Fotoshooting</a></nav>
      ${renderProjectStory(project)}
      <section class="journey-end"><span class="meta">AUS UNSEREM KREATIVBÜRO</span><h2>Noch mehr<br>zu entdecken.</h2><a class="text-link" data-project="${nextProject.slug}" href="${projectURL(nextProject)}">${escapeHTML(nextProject.title)} entdecken ↗</a><a class="text-link" href="index.html#projekte">Weitere Projekte entdecken ↗</a></section>
      </article>`;
  }

  function renderCase() {
    const container = $('#case-content');
    if (!container) return;
    const slug = new URLSearchParams(window.location.search).get('projekt');
    if (slug === featuredProject.slug) {
      renderWiriehorn(container);
      return;
    }
    const project = projects.find((item) => item.slug === slug);
    if (!project) {
      document.title = 'Projekt nicht gefunden - 1Kreativbüro';
      container.innerHTML = '<section class="case-not-found"><span class="meta">404 / PROJEKT</span><h1>Hier ist noch<br>Raum für Ideen.</h1><p>Dieses Projekt gibt es im Entwurf noch nicht.</p><a class="text-link" href="index.html#projekte">Zur Projektübersicht <span>↗</span></a></section>';
      return;
    }
    if (project.film) {
      renderFilmCase(container, project);
      return;
    }
    const index = projects.indexOf(project);
    const nextProject = projects[(index + 1) % projects.length];
    document.title = `${project.title} - 1Kreativbüro`;
    container.innerHTML = `
      <article class="case-project" aria-labelledby="case-title">
      <section class="case-intro" aria-labelledby="case-title">
        <div class="case-breadcrumb meta"><a href="index.html#projekte">← Projektübersicht</a><span>${escapeHTML(project.title.toUpperCase())}</span></div>
        <h1 class="case-title" id="case-title">${escapeHTML(project.title)}</h1>
        <div class="case-meta"><p>${escapeHTML(project.lead)}</p></div>
      </section>
      <figure class="case-hero${project.image ? '' : ' is-placeholder'}">${projectVisual(project, true)}</figure>
      ${renderProjectStory(project)}
      <section class="case-next" aria-label="Nächstes Projekt"><a data-project="${nextProject.slug}" href="${projectURL(nextProject)}"><div><span class="meta">NÄCHSTES PROJEKT</span><h2>${escapeHTML(nextProject.title)}</h2><span class="text-link">Ab ins Projektbüro <span aria-hidden="true">↗</span></span></div><div class="case-next-visual">${projectVisual(nextProject)}</div></a></section>
      </article>`;
  }


  // Native, progressive Bild-zu-Bild-Übergänge. Ohne API navigieren normale Links.
  function setupProjectTransitions() {
    let activatedImage = null;
    const slugFromURL = (url) => url.searchParams.get('projekt');
    const resetNames = () => document.querySelectorAll('[style*="view-transition-name"]').forEach((element) => element.style.removeProperty('view-transition-name'));
    const coverForLink = (link) => link.querySelector('img') || link.closest('.feature-stage')?.querySelector('.feature-card.is-active img');
    const projectImage = (slug) => {
      const images = Array.from(document.querySelectorAll('a[data-project]')).filter((link) => link.dataset.project === slug).map(coverForLink).filter(Boolean);
      return images.find((image) => {
        const rect = image.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < innerHeight;
      }) || images.at(-1);
    };
    document.addEventListener('click', (event) => {
      const link = event.target.closest('a[data-project]');
      if (link && !event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0) activatedImage = coverForLink(link);
    });
    window.addEventListener('pageswap', (event) => {
      if (!event.viewTransition) return;
      event.viewTransition.ready.catch(() => {});
      event.viewTransition.finished.catch(() => {});
      if (reducedMotion.matches) { event.viewTransition.skipTransition(); return; }
      resetNames();
      const destination = event.activation?.entry?.url;
      if (!destination) return;
      const destinationURL = new URL(destination);
      const slug = slugFromURL(destinationURL);
      const image = slug ? (activatedImage || projectImage(slug)) : $('[data-case-cover]');
      if (image) image.style.viewTransitionName = 'project-cover';
    });
    window.addEventListener('pagereveal', (event) => {
      if (!event.viewTransition) return;
      event.viewTransition.ready.catch(() => {});
      event.viewTransition.finished.catch(() => {});
      if (reducedMotion.matches) { event.viewTransition.skipTransition(); return; }
      resetNames();
      const hero = $('[data-case-cover]');
      const from = window.navigation?.activation?.from?.url;
      const image = hero || (from ? projectImage(slugFromURL(new URL(from))) : null);
      if (image) {
        image.style.viewTransitionName = 'project-cover';
        event.viewTransition.finished.finally(() => image.style.removeProperty('view-transition-name')).catch(() => {});
      }
    });
    window.addEventListener('pageshow', (event) => { if (event.persisted) { resetNames(); activatedImage = null; } });
  }

  renderFeature();
  renderProjects();
  renderCase();
  setupProjectTransitions();
})();
