# 1Kreativbüro

Lokaler, klickbarer Gestaltungsentwurf für die Agenturwebsite. Grundlage sind das Briefing und die sechs Bildreferenzen sowie das 14,7 Sekunden lange Referenzvideo für die Projektunterseite.

## Entwurf öffnen

`index.html` direkt im Browser öffnen. Der Entwurf funktioniert ohne Installation und ohne laufenden Server; auch die Projektlinks bleiben lokal nutzbar.

Für die Entwicklung und die browserabhängigen Bildübergänge alternativ im Projektordner einen lokalen Server starten:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Dann `http://127.0.0.1:4173` im Browser öffnen. Es gibt keine Build-Abhängigkeiten und keinen Installationsschritt.

## Aufbau

- `index.html`: Hero, Highlight-Projekt, Büro, drei Personen, Projektarchiv und Kontakt.
- `projekt.html?projekt=wiriehorn`: Wiriehorn-Vorschau mit Sommer- und Winterbild.
- `projekt.html?projekt=rigi`: Rigi-Detailansicht mit grossformatigem Einstieg, vier Filmstills zum Imagefilm und einem vorbereiteten Bereich für das Fotoshooting.
- `content.js`: Zentraler Ort für Teamtexte, Rollen, Leistungen, Kontakt und Projekte.
- `styles.css`: Gestaltung, Raster, mobile Ansichten, Bewegungen und reduzierte Animationen.
- `app.js`: Sommer-/Winter-Kartenstapel, Büro-Scrollytelling, Teamfächer, Projektübersicht und Projektnavigation.
- `background-motion.js`: Lokaler Wasserfarbenzug der Hintergründe auf Start- und Projektseiten. Ein kleines Bewegungsfeld zieht und verwischt die Farbe entlang der Mausspur; die Verformung klingt nach wenigen Zehntelsekunden ab. Die WebGL-Textur enthält nur Farbflächen. Bilder, Grafiken und Texte werden nicht erfasst. Auf Touch-Geräten, bei reduzierter Bewegung und ohne WebGL bleiben die normalen CSS-Hintergründe aktiv.
- `assets/study-*.svg`: Frühere Layoutstudien; in der aktuellen Projektübersicht nicht mehr eingebunden.
- `assets/references/`: Unveränderte, vom User gelieferte Bildreferenzen für die lokale Entwurfsarbeit. Die verwendeten Referenzporträts sind im Entwurf ausdrücklich gekennzeichnet.
- [Gestaltungskonzept](docs/GESTALTUNGSKONZEPT.md): Gestaltungsgrundlage, Bildzuordnung und Interaktionen.
- [Inhaltsvorlagen](docs/INHALTE.md): Ausfüllbare Vorlage für die echten Inhalte.

## Entwurfsstatus

Die Site ist lokal vorbereitet und nicht veröffentlicht. Das Highlight «Unser neustes Projekt.» zeigt das Wiriehorn-Projekt als interaktive Übersichtskarte mit den bereitgestellten Sommer- und Winterbildern. Sommer liegt zuerst vorne. Hover auf die hintere Karte, Tastaturfokus oder Klick holen das Bild mit einer kleinen Verschiebung und Drehung nach vorne. Der Kartenwechsel dauert 450 ms; die Ebene wechselt nach 180 ms. Die Trefferflächen bleiben fest, damit unter dem Mauszeiger kein wiederholter Wechsel entsteht. Ein separater Link öffnet die Projektvorschau. Die Daten dazu stehen in `featuredProject` in `content.js`.

«Das Büro.» steht horizontal und vertikal zentriert vor einem weissen Raster auf Schwarz. Direkt hinter dem Titel bleibt das Raster ausgespart. Hover, Tastaturfokus oder Antippen lösen einen kurzen Buchstabenwechsel des Titels aus. Der kompakte Rasterbereich bleibt im normalen Scrollfluss: Zeitlich gestaffelte Linien beginnen ihren Aufbau erst gut sichtbar im Viewport. Der linke Rand bleibt offen. Das Raster reicht bis in den Kartenfächer und blendet dort weich aus. Drei getrennte Hotspots setzen «Foto», «Video» und «Web» ausschliesslich aus Buchstaben zusammen, sobald der jeweilige Hotspot sichtbar wird. Beim Zurückscrollen läuft die Sequenz zurück. Einführungstexte, Bildfläche, Schlagwortband und Scrollhinweise sind entfernt.

«Das Kreative.» liegt direkt über dem Teamfächer. Die gefüllte Schrift steht hinter den Karten; eine zweite, invertierende Kontur wird ausschliesslich auf den tatsächlichen Kartenflächen sichtbar. Eine gemeinsame SVG-Maske berücksichtigt Drehung, Skalierung und den Kartenwechsel. Beim Hover auf eine Karte oder Tastaturfokus treten die Konturen hinter die Karten zurück. Die drei Personen lassen sich per Hover, Tastatur oder Antippen wählen. Ihre Beschreibung und Stärken stehen unter dem Fächer; zusätzliche Auswahlknöpfe machen alle drei Personen direkt erreichbar.

Unter «Aus unserem Kreativbüro.» stehen ausschliesslich Wiriehorn und Rigi, jeweils mit eigener Detailansicht. Filter, Studienzählung und die bisherige Abschnittsbeschriftung sind entfernt. Das Bahn-Motiv aus dem Rigi-Imagefilm dient als Vorschaubild. Die Detailseiten verlinken jeweils auf das andere Projekt sowie zurück zur Übersicht.

Die Rigi-Seite trennt Imagefilm und Fotoshooting in zwei Kapitel mit direkten Sprunglinks. Das Bahn-Motiv eröffnet die Seite; Wald, Kinder und Lokomotivdetail folgen in einer versetzten Filmstill-Galerie. Alle vier bereitgestellten Bilder gehören zum Imagefilm. Im Fotoshooting-Kapitel steht bis zur Bildlieferung ein eigener Platzhalter. In `content.js` lassen sich eine lokale Filmdatei unter `film.video` und die späteren Fotos unter `photoshoot.images` ergänzen; dann erscheinen Videoplayer beziehungsweise Fotogalerie. Titel und Einleitungstext können dort ebenfalls angepasst werden. Ohne Filmdatei erscheint kein Wiedergabeknopf.

Texte, Rollen und Stärken sind Vorschläge; die dargestellten Personen sind Referenzporträts. Die fehlende Kontaktadresse ist als Textplatzhalter dargestellt; sobald `studio.email` in `content.js` gesetzt ist, erscheint ein funktionierender E-Mail-Link.

Der Bild-zu-Hero-Übergang nutzt progressive native View Transitions in unterstützten Browsern. Sonst bleiben die normalen Seitenlinks nutzbar. Die Ansicht unterstützt kleine Bildschirme, Tastaturbedienung und `prefers-reduced-motion`. Bei reduzierter Bewegung stehen Raster und Wörter sofort vollständig da. Ohne JavaScript bleiben die drei Wörter ebenfalls sichtbar. Für einen späteren Livegang müssen Inhalte, Bildrechte und die passenden rechtlichen Angaben ergänzt und die Entwurfskennzeichnungen einschliesslich `noindex` entfernt werden.

## Wiriehorn-Projektgeschichte

`projekt.html?projekt=wiriehorn` zeigt alle zehn Schritte aus `assets/projects/wiriehorn/content-steps/Beschreibung-Projektschritte.docx`. Inhalte und Interaktionen stehen in `wiriehorn.js`, komprimierte Rasterbilder in `assets/projects/wiriehorn/web/`. Die Originalmedien bleiben unverändert.

Kompakte Bildraster und wechselnde Rosé-, Salbei-, Blau- und dunkle Flächen orientieren sich an der aktuellen Hauptseite. Der Jahreszeitenvergleich lässt sich direkt im Bild per Ziehen, Touch und Tastatur bedienen. Videos spielen im sichtbaren Bereich stumm und in Schleife; native Steuerelemente sind ausgeblendet. Ein dezenter Pause-/Play-Schalter erscheint bei Hover, Tastaturfokus oder auf Touch-Geräten. Reduzierte Bewegung verhindert automatisches Abspielen. Ausserhalb des sichtbaren Bereichs pausieren die Videos.

Panorama und Erlebniskarte laden als verzögerte iFrames mit ergänzenden Direktlinks. Die frühere Einbettungssperre der Karte wurde entfernt und am 28. Oktober 2026 erneut geprüft. Die Infotafel bleibt als Zukunfts-Mockup gekennzeichnet.

Die Karte startet nach einem Klick innerhalb des iFrames. Dadurch zieht ihr automatischer Fokus die Projektseite beim Lesen nicht unerwartet zum Kartenabschnitt.
