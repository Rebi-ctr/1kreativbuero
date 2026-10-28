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
- `projekt.html?projekt=wiriehorn`: Wiriehorn-Vorschau mit Sommer- und Winterbild. Die Layoutstudien nutzen dieselbe HTML-Datei mit einer eigenen Projektvorlage.
- `content.js`: Zentraler Ort für Teamtexte, Rollen, Leistungen, Kontakt und Projekte.
- `styles.css`: Gestaltung, Raster, mobile Ansichten, Bewegungen und reduzierte Animationen.
- `app.js`: Sommer-/Winter-Kartenstapel, Büro-Scrollytelling, Teamfächer, Projektfilter und Projektnavigation.
- `background-motion.js`: Lokaler Wasserfarbenzug der Hintergründe auf Start- und Projektseiten. Ein kleines Bewegungsfeld zieht und verwischt die Farbe entlang der Mausspur; die Verformung klingt nach wenigen Zehntelsekunden ab. Die WebGL-Textur enthält nur Farbflächen. Bilder, Grafiken und Texte werden nicht erfasst. Auf Touch-Geräten, bei reduzierter Bewegung und ohne WebGL bleiben die normalen CSS-Hintergründe aktiv.
- `assets/study-*.svg`: Selbst erstellte, austauschbare Layoutstudien, keine Kundenreferenzen.
- `assets/references/`: Unveränderte, vom User gelieferte Bildreferenzen für die lokale Entwurfsarbeit. Die verwendeten Referenzporträts sind im Entwurf ausdrücklich gekennzeichnet.
- [Gestaltungskonzept](docs/GESTALTUNGSKONZEPT.md): Gestaltungsgrundlage, Bildzuordnung und Interaktionen.
- [Inhaltsvorlagen](docs/INHALTE.md): Ausfüllbare Vorlage für die echten Inhalte.

## Entwurfsstatus

Die Site ist lokal vorbereitet und nicht veröffentlicht. Das Highlight «Unser neustes Projekt.» zeigt das Wiriehorn-Projekt als interaktive Übersichtskarte mit den bereitgestellten Sommer- und Winterbildern. Sommer liegt zuerst vorne. Hover auf die hintere Karte, Tastaturfokus oder Klick holen das Bild mit einer kleinen Verschiebung und Drehung nach vorne. Der Kartenwechsel dauert 450 ms; die Ebene wechselt nach 180 ms. Die Trefferflächen bleiben fest, damit unter dem Mauszeiger kein wiederholter Wechsel entsteht. Ein separater Link öffnet die Projektvorschau. Die Daten dazu stehen in `featuredProject` in `content.js`.

«Das Büro.» steht horizontal und vertikal zentriert vor einem weissen Raster auf Schwarz. Direkt hinter dem Titel bleibt das Raster ausgespart. Hover, Tastaturfokus oder Antippen lösen einen kurzen Buchstabenwechsel des Titels aus. Der kompakte Rasterbereich bleibt im normalen Scrollfluss: Zeitlich gestaffelte Linien beginnen ihren Aufbau erst gut sichtbar im Viewport. Der linke Rand bleibt offen. Das Raster reicht bis in den Kartenfächer und blendet dort weich aus. Drei getrennte Hotspots setzen «Foto», «Video» und «Web» ausschliesslich aus Buchstaben zusammen, sobald der jeweilige Hotspot sichtbar wird. Beim Zurückscrollen läuft die Sequenz zurück. Einführungstexte, Bildfläche, Schlagwortband und Scrollhinweise sind entfernt.

«Das Kreative.» liegt direkt über dem Teamfächer. Die gefüllte Schrift steht hinter den Karten; eine zweite, invertierende Kontur wird ausschliesslich auf den tatsächlichen Kartenflächen sichtbar. Eine gemeinsame SVG-Maske berücksichtigt Drehung, Skalierung und den Kartenwechsel. Beim Hover auf eine Karte oder Tastaturfokus treten die Konturen hinter die Karten zurück. Die drei Personen lassen sich per Hover, Tastatur oder Antippen wählen. Ihre Beschreibung und Stärken stehen unter dem Fächer; zusätzliche Auswahlknöpfe machen alle drei Personen direkt erreichbar.

Texte, Rollen und Stärken sind Vorschläge; die dargestellten Personen sind Referenzporträts. Die vier Projekte im Archiv sind eigene Gestaltungsstudien, die später durch echte Arbeiten ersetzt werden. Die fehlende Kontaktadresse ist als Textplatzhalter dargestellt; sobald `studio.email` in `content.js` gesetzt ist, erscheint ein funktionierender E-Mail-Link.

Der Bild-zu-Hero-Übergang nutzt progressive native View Transitions in unterstützten Browsern. Sonst bleiben die normalen Seitenlinks nutzbar. Die Ansicht unterstützt kleine Bildschirme, Tastaturbedienung und `prefers-reduced-motion`. Bei reduzierter Bewegung stehen Raster und Wörter sofort vollständig da. Ohne JavaScript bleiben die drei Wörter ebenfalls sichtbar. Für einen späteren Livegang müssen Inhalte, Bildrechte und die passenden rechtlichen Angaben ergänzt und die Entwurfskennzeichnungen einschliesslich `noindex` entfernt werden.
