const wiriehornImageSizes = {"web/01_Skizze-Grob.webp": [1800, 1257], "web/02_Skizze-Mittel.webp": [1800, 1257], "web/03_Figma-Prototyp.webp": [508, 1048], "web/DJI_0480.webp": [1800, 1013], "web/IMG_5863.webp": [1050, 1400], "web/Mockup-Karte.webp": [1800, 1199], "web/Oeffnungsstatus.webp": [528, 314], "web/Popup-offen.webp": [1800, 951], "web/PXL_20260706_094326175.webp": [1800, 1355], "web/PXL_20260706_192508388.webp": [1800, 1350], "web/PXL_20260706_193214746.webp": [1800, 1355], "web/Skizze-Fein.webp": [1800, 1257], "web/Wiriehorn-Fotos-24.webp": [1800, 1200], "web/wiriehornkarte-sommer-v0.webp": [1800, 969], "content-steps/04/wiriehornkarte-sommer-v1.svg": [2145.92, 1106.17], "content-steps/04/wiriehornkarte-sommer-v20.svg": [2270.0, 1106.17], "content-steps/04/wiriehornkarte-sommer-v20_ Bildausschnitt 3.svg": [634.35, 356.82], "content-steps/04/wiriehornkarte-sommer-v20_Bildausschnitt 1.svg": [613.21, 344.93], "content-steps/04/wiriehornkarte-sommer-v20_Bildausschnitt 2.svg": [528.69, 297.39], "content-steps/07/wiriehornkarte-sommer-v20.svg": [2270.0, 1106.17], "content-steps/07/wiriehornkarte-winter-v14.svg": [2271.21, 1106.17]};
const wiriehornSteps = [
  {
    "number": "01",
    "title": "Ein Berg voller Möglichkeiten. Eine Übersicht fehlt.",
    "text": "Am Wiriehorn gibt es viel zu entdecken. Was fehlte, war eine aktuelle, vollständige Karte, die das vielfältige Angebot übersichtlich und familienfreundlich zusammenführt – besonders auf dem Smartphone."
  },
  {
    "number": "02",
    "title": "Die ersten Linien einer neuen Erlebniswelt.",
    "text": "Mit abstrakten Gebietsskizzen erkundeten wir Perspektive, Aufbau und Orientierung. Ein erster Figma-Prototyp machte die Idee greifbar und erlaubte uns, die mobile Nutzung früh mitzudenken."
  },
  {
    "number": "03",
    "title": "Vor Ort verstehen, was den Berg ausmacht.",
    "text": "Beim Besuch am Wiriehorn besprachen wir Wünsche und Anforderungen mit dem Kunden und sammelten Eindrücke aus nächster Nähe. Fotos und Drohnenaufnahmen bildeten die Grundlage für die detaillierte Kartenskizze."
  },
  {
    "number": "04",
    "title": "Das Wiriehorn bekommt seine eigene Bildwelt.",
    "text": "Schritt für Schritt entstand eine eigenständige Illustration: von der Landschaft und den Wegen bis zu Gebäuden, Tieren und dem Wiriespatz. Die Karte verbindet Orientierung mit dem Entdecken liebevoll gestalteter Details."
  },
  {
    "number": "05",
    "title": "Aus Anschauen wird Entdecken.",
    "text": "Wir machten die Illustration interaktiv. Über anklickbare Orte öffnen sich Bilder, Informationen und weiterführende Links zu den Angeboten – direkt dort, wo sie auf der Karte zu finden sind."
  },
  {
    "number": "06",
    "title": "Eine Karte, die den Betrieb mitdenkt.",
    "text": "Die Anbindung an InfoSnow ergänzt aktuelle Betriebsinformationen. Statussymbole zeigen geöffnete und geschlossene Angebote; die animierte Sesselbahn richtet sich nach dem effektiven Betriebsstatus."
  },
  {
    "number": "07",
    "title": "Ein Berg. Zwei Jahreszeiten.",
    "text": "Für den Winter entwickelten wir eine eigene Kartenwelt mit passenden Angeboten und Details. Animierte Skilifte und saisonale Betriebsinformationen machen auch das Winterangebot erlebbar."
  },
  {
    "number": "08",
    "title": "Noch tiefer in die Bergwelt eintauchen.",
    "text": "360°-Panoramen eröffnen zusätzliche Perspektiven auf das Wiriehorn. Ziehende Wolken im Sommer und fallender Schnee im Winter verleihen der illustrierten Landschaft Atmosphäre und Bewegung."
  },
  {
    "number": "09",
    "title": "Die Erlebniswelt findet ihren Platz.",
    "text": "Über die Verlinkung und Einbettung in die Wiriehorn-Webseite wird die Erlebniskarte Teil des digitalen Gästeangebots. So führt der Weg von der ersten Inspiration direkt zum Erkunden der Möglichkeiten am Berg."
  },
  {
    "number": "10",
    "title": "Die Karte weiterdenken – bis an den Berg.",
    "text": "Die illustrierte Bergwelt bietet auch über den Bildschirm hinaus Möglichkeiten. Eine Infotafel vor Ort könnte künftig die digitale Karte ergänzen und Gästen direkt am Wiriehorn Orientierung geben."
  }
];

function renderWiriehorn(container) {
  const base = 'assets/projects/wiriehorn/';
  const dimensions = (path) => { const size = wiriehornImageSizes[path]; return size ? `width="${size[0]}" height="${size[1]}"` : ''; };
  const photo = (name, caption, extra = '') => `<figure class="${extra}"><img src="${base}web/${name}.webp" ${dimensions(`web/${name}.webp`)} alt="${escapeHTML(caption)}" loading="lazy" decoding="async"><figcaption>${escapeHTML(caption)}</figcaption></figure>`;
  const svg = (name, caption) => `<figure><img src="${base}content-steps/${name}" ${dimensions(`content-steps/${name}`)} alt="${escapeHTML(caption)}" loading="lazy" decoding="async"><figcaption>${escapeHTML(caption)}</figcaption></figure>`;
  const video = (name, caption, poster = '') => `<figure><video style="aspect-ratio:40 / 21" controls playsinline preload="none" ${poster ? `poster="${base}web/${poster}.webp"` : ''}><source src="${base}content-steps/${name}" type="video/mp4"><a href="${base}content-steps/${name}">Video öffnen</a></video><figcaption>${caption}</figcaption></figure>`;
  const embed = (url, title) => `<div class="journey-embed"><iframe src="${url}" title="${title}" loading="lazy" allow="fullscreen" allowfullscreen></iframe><a class="text-link" href="${url}" target="_blank" rel="noopener">${title} separat öffnen ↗</a></div>`;
  const media = [
    '',
    `<div class="journey-sketches">${photo('01_Skizze-Grob', '01 / Die erste Perspektive')}${photo('02_Skizze-Mittel', '02 / Wege und Orientierung')}${photo('03_Figma-Prototyp', '03 / Früher Figma-Prototyp', 'journey-phone')}</div>`,
    `<div class="journey-report">${photo('DJI_0480', 'Der Blick von oben: Gelände und Wege')}${photo('PXL_20260706_094326175', 'Gemeinsam vor Ort: die Karte im Gespräch')}${photo('Wiriehorn-Fotos-24', 'Bildmaterial für die digitale Erlebniswelt')}${photo('PXL_20260706_193214746', 'Perspektiven sammeln – bis zum Gipfel')}${photo('Skizze-Fein', 'Von den Eindrücken zur ausgearbeiteten Skizze', 'journey-wide')}</div>`,
    `<div class="journey-evolution">${photo('wiriehornkarte-sommer-v0', '01 / Grundriss der Illustration')}${svg('04/wiriehornkarte-sommer-v1.svg', '02 / Die erste SVG-Version')}${svg('04/wiriehornkarte-sommer-v20.svg', '03 / Die ausgearbeitete Sommerwelt')}</div><div class="journey-details">${svg('04/wiriehornkarte-sommer-v20_Bildausschnitt 1.svg', 'Ein Blick auf die Details der Bergwelt')}${svg('04/wiriehornkarte-sommer-v20_Bildausschnitt 2.svg', 'Eigene Figuren und liebevolle Einzelheiten')}${svg('04/wiriehornkarte-sommer-v20_ Bildausschnitt 3.svg', 'Illustration bis ins kleinste Detail')}</div>`,
    `<div class="journey-interaction">${video('05/PopUp.mp4', 'Hotspot antippen, Informationen öffnen, Bilder entdecken.', 'PopUp-Video')}${photo('Popup-offen', 'Angebote und Informationen direkt auf der Karte')}</div>`,
    `<div class="journey-operation">${photo('Oeffnungsstatus', 'Betriebsstatus und Öffnungszeiten auf einen Blick')}${video('06/SesselStart.mp4', 'Die Sesselbahn bewegt sich passend zum Betriebsstatus.', 'SesselStart')}</div>`,
    `<figure class="season-figure"><div class="season-compare" style="--split:50%"><img src="${base}content-steps/07/wiriehornkarte-sommer-v20.svg" alt="Illustrierte Sommerkarte des Wiriehorns" loading="lazy"><img class="season-winter" src="${base}content-steps/07/wiriehornkarte-winter-v14.svg" alt="Illustrierte Winterkarte des Wiriehorns" loading="lazy"><span class="season-label summer">Sommer</span><span class="season-label winter">Winter</span><span class="season-divider" aria-hidden="true">↔</span></div><figcaption><label for="season-range">Jahreszeiten vergleichen <span aria-hidden="true">↔</span></label><input id="season-range" type="range" min="0" max="100" value="50" aria-label="Anteil der Winterkarte" aria-valuetext="50 Prozent Winterkarte"><span>Regler verschieben oder Pfeiltasten verwenden.</span></figcaption></figure>`,
    embed('https://erlebniskarte.wiriehorn.ch/360/?embed=1#wiriehorn-gipfel', '360°-Panorama Wiriehorn-Gipfel'),
    (['https://erlebniskarte.wiriehorn.ch', 'https://wiriehorn.ch', 'https://www.wiriehorn.ch', 'https://wiriehorn.cmsbox.cloud'].includes(window.location.origin)
      ? embed('https://erlebniskarte.wiriehorn.ch/', 'Interaktive Erlebniskarte Wiriehorn')
      : `<a class="journey-map-preview" href="https://erlebniskarte.wiriehorn.ch/" target="_blank" rel="noopener"><img src="assets/Wiriehorn_Sommer_Test.jpg" alt="Vorschau der Wiriehorn-Erlebniskarte – interaktive Karte in einem neuen Tab öffnen" width="2464" height="1336" loading="lazy"><span class="text-link">Erlebniskarte interaktiv entdecken ↗</span></a>`),
    photo('Mockup-Karte', 'Ausblick / Visualisierung einer möglichen Infotafel – noch keine realisierte Anwendung.')
  ];
  const labels = ['Ausgangslage', 'Skizzen', 'Vor Ort', 'Illustration', 'Interaktion', 'Betrieb', 'Jahreszeiten', '360°', 'Erlebniskarte', 'Ausblick'];
  document.title = 'Wiriehorn – Eine Bergwelt wird interaktiv. — 1Kreativbüro';
  document.querySelector('meta[name="description"]').content = 'In zehn Schritten von der ersten Skizze zur interaktiven Wiriehorn-Erlebniskarte: Illustration, Sommer und Winter, Betriebsinformationen und 360°-Panoramen.';
  document.body.classList.add('wiriehorn-page');
  $('.preview-badge .badge-detail').textContent = '/ Wiriehorn';
  container.innerHTML = `<section class="case-intro" aria-labelledby="case-title"><div class="case-breadcrumb meta"><a href="index.html#highlight">← Zur Projektübersicht</a><span>WIRIEHORN / PROJEKTGESCHICHTE</span></div><h1 class="case-title" id="case-title">Ein Berg.<br>Eine Erlebniswelt.</h1><div class="case-meta"><p>Von der ersten Linie zur interaktiven Karte.<br>Das Wiriehorn entdecken – im Sommer und im Winter.</p><div class="case-tags"><span class="meta">PROJEKT<br>Wiriehorn</span><span class="meta">LEISTUNGEN<br>Konzept · Illustration · Digital</span></div></div></section><figure class="case-hero"><img data-case-cover="wiriehorn" src="assets/Wiriehorn_Sommer_Test.jpg" alt="Die illustrierte Sommerwelt des Wiriehorns mit Bergen, Wegen und Angeboten" width="2464" height="1336" fetchpriority="high"></figure><nav class="journey-nav" aria-label="Projektschritte">${labels.map((label, i) => `<a href="#schritt-${twoDigits(i + 1)}"><span>${twoDigits(i + 1)}</span> ${label}</a>`).join('')}</nav><div class="journey">${wiriehornSteps.map((step, i) => `<section class="journey-step" id="schritt-${step.number}" aria-labelledby="step-title-${step.number}"><div class="journey-marker"><span>${step.number}</span><span class="meta">${labels[i]}</span></div><div class="journey-content"><div class="journey-copy"><h2 id="step-title-${step.number}">${escapeHTML(step.title)}</h2><p>${escapeHTML(step.text)}</p></div>${media[i]}</div></section>`).join('')}</div><section class="journey-end"><span class="meta">VOM GEDANKEN ZUM ERLEBNIS</span><h2>Jetzt selbst<br>auf Entdeckung gehen.</h2><a class="text-link" href="https://erlebniskarte.wiriehorn.ch/" target="_blank" rel="noopener">Zur Wiriehorn-Erlebniskarte ↗</a><a class="text-link" href="index.html#projekte">Weitere Projekte entdecken ↗</a></section>`;
  $('#season-range').addEventListener('input', (event) => {
    $('.season-compare').style.setProperty('--split', `${event.target.value}%`);
    event.target.setAttribute('aria-valuetext', `${event.target.value} Prozent Winterkarte`);
  });
}
