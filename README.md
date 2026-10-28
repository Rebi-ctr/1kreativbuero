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
- `projekt.html?projekt=wiriehorn`: Wiriehorn-Projektgeschichte mit zehn Timeline-Schritten, Prozessbildern, Videos, Sommer-/Wintervergleich und Live-Einbettungen. Die Layoutstudien nutzen dieselbe HTML-Datei mit einer eigenen Projektvorlage.
- `content.js`: Zentraler Ort für Teamtexte, Rollen, Leistungen, Kontakt und Projekte.
- `styles.css`: Gestaltung, Raster, mobile Ansichten, Bewegungen und reduzierte Animationen.
- `app.js`: Sommer-/Winter-Kartenstapel, Projektfilter, Personenbeschriebe, Schlagwortband und Projektnavigation.
- `background-motion.js`: Lokaler Wasserfarbenzug der Hintergründe auf Start- und Projektseiten. Ein kleines Bewegungsfeld zieht und verwischt die Farbe entlang der Mausspur; die Verformung klingt nach wenigen Zehntelsekunden ab. Die WebGL-Textur enthält nur Farbflächen. Bilder, Grafiken und Texte werden nicht erfasst. Auf Touch-Geräten, bei reduzierter Bewegung und ohne WebGL bleiben die normalen CSS-Hintergründe aktiv.
- `assets/study-*.svg`: Selbst erstellte, austauschbare Layoutstudien, keine Kundenreferenzen.
- `assets/references/`: Unveränderte, vom User gelieferte Bildreferenzen für die lokale Entwurfsarbeit. Die verwendeten Referenzporträts sind im Entwurf ausdrücklich gekennzeichnet.
- [Gestaltungskonzept](docs/GESTALTUNGSKONZEPT.md): Gestaltungsgrundlage, Bildzuordnung und Interaktionen.
- [Inhaltsvorlagen](docs/INHALTE.md): Ausfüllbare Vorlage für die echten Inhalte.

## Entwurfsstatus

Die Site ist lokal vorbereitet und nicht veröffentlicht. Das Highlight «Unser neustes Projekt.» zeigt das Wiriehorn-Projekt als interaktive Übersichtskarte mit den bereitgestellten Sommer- und Winterbildern. Sommer liegt zuerst vorne. Hover auf die hintere Karte, Tastaturfokus oder Klick holen das Bild mit einer kleinen Verschiebung und Drehung nach vorne. Der Kartenwechsel dauert 450 ms; die Ebene wechselt nach 180 ms. Die Trefferflächen bleiben fest, damit unter dem Mauszeiger kein wiederholter Wechsel entsteht. Ein separater Link öffnet die Projektvorschau. Die Daten dazu stehen in `featuredProject` in `content.js`.

Texte, Rollen und Stärken sind Vorschläge; die dargestellten Personen sind Referenzporträts. Die vier Projekte im Archiv sind eigene Gestaltungsstudien, die später durch echte Arbeiten ersetzt werden. Die fehlende Kontaktadresse ist als Textplatzhalter dargestellt; sobald `studio.email` in `content.js` gesetzt ist, erscheint ein funktionierender E-Mail-Link.

Der Bild-zu-Hero-Übergang nutzt progressive native View Transitions in unterstützten Browsern. Sonst bleiben die normalen Seitenlinks nutzbar. Die Ansicht unterstützt kleine Bildschirme, Tastaturbedienung und `prefers-reduced-motion`. Das Schlagwortband lässt sich zusätzlich pausieren. Für einen späteren Livegang müssen Inhalte, Bildrechte und die passenden rechtlichen Angaben ergänzt und die Entwurfskennzeichnungen einschliesslich `noindex` entfernt werden.

## Wiriehorn-Projektgeschichte

`projekt.html?projekt=wiriehorn` zeigt alle zehn Schritte aus `assets/projects/wiriehorn/content-steps/Beschreibung-Projektschritte.docx`. Inhalte und Darstellung stehen in `wiriehorn.js`; die Originalmedien bleiben unverändert. Komprimierte Rasterbilder liegen in `assets/projects/wiriehorn/web/`. Videos starten nur auf Anfrage. Der Jahreszeitenregler unterstützt Touch und Tastatur. Das Panorama lädt als externer, verzögert geladener iFrame. Die Karte bietet je nach Host einen iFrame oder eine verlinkte Vorschau. Die Infotafel ist ausdrücklich ein Zukunfts-Mockup.

Die Karte erlaubt per `Content-Security-Policy: frame-ancestors` aktuell nur Wiriehorn-Domains. Auf anderen Hosts erscheint deshalb eine Bildvorschau mit Direktlink. Für eine Einbettung auf der späteren Agenturdomain muss diese am Kartenserver freigegeben und in der Hostliste in `wiriehorn.js` ergänzt werden. Das Gipfelpanorama lässt sich bereits einbetten.
