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
- `projekt.html?projekt=studie-01`: Projektvorlage mit Ausgangslage, Idee, Entwicklung, Bilderstrecke und Ergebnis. Die weiteren Layoutstudien öffnen dieselbe Vorlage mit eigenen Bildern.
- `content.js`: Zentraler Ort für Teamtexte, Rollen, Leistungen, Kontakt und Projekte.
- `styles.css`: Gestaltung, Raster, mobile Ansichten, Bewegungen und reduzierte Animationen.
- `app.js`: Highlight-Wechsel, Projektfilter, Personenbeschriebe, Schlagwortband und Projektnavigation.
- `assets/study-*.svg`: Selbst erstellte, austauschbare Layoutstudien, keine Kundenreferenzen.
- `assets/references/`: Unveränderte, vom User gelieferte Bildreferenzen für die lokale Entwurfsarbeit. Die verwendeten Referenzporträts sind im Entwurf ausdrücklich gekennzeichnet.
- [Gestaltungskonzept](docs/GESTALTUNGSKONZEPT.md): Gestaltungsgrundlage, Bildzuordnung und Interaktionen.
- [Inhaltsvorlagen](docs/INHALTE.md): Ausfüllbare Vorlage für die echten Inhalte.

## Entwurfsstatus

Die Site ist lokal vorbereitet und nicht veröffentlicht. Texte, Rollen und Stärken sind Vorschläge; die dargestellten Personen sind Referenzporträts. Die Projekte sind eigene Gestaltungsstudien, die später durch echte Arbeiten ersetzt werden. Die fehlende Kontaktadresse ist als Textplatzhalter dargestellt; sobald `studio.email` in `content.js` gesetzt ist, erscheint ein funktionierender E-Mail-Link.

Der Bild-zu-Hero-Übergang nutzt progressive native View Transitions in unterstützten Browsern. Sonst bleiben die normalen Seitenlinks nutzbar. Die Ansicht unterstützt kleine Bildschirme, Tastaturbedienung und `prefers-reduced-motion`. Das Schlagwortband lässt sich zusätzlich pausieren. Für einen späteren Livegang müssen Inhalte, Bildrechte und die passenden rechtlichen Angaben ergänzt und die Entwurfskennzeichnungen einschliesslich `noindex` entfernt werden.
