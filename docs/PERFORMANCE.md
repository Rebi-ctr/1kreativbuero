# Performance-Prüfung vom 30. Oktober 2026

Grundlage: Site-Spark-Bericht vom 29. Oktober. Die damaligen zwei Long Tasks (142 ms insgesamt) sind ohne Trace nicht einzelnen Funktionen zuzuordnen. Browser-Erweiterungen können diese Messung beeinflussen. Es wurde deshalb kein pauschaler Geschwindigkeitsgewinn für JavaScript behauptet.

## Umgesetzt

- Die neuen Sommer-/Winter-WebPs ersetzen die JPGs auf Start- und Wiriehorn-Projektseite. Originalgrösse zusammen 714 KB statt 1'542 KB (54 % weniger).
- Karten zusätzlich als 800- und 1600-Pixel-Varianten mit `srcset`/`sizes`: der Browser wählt passend zur Anzeigegrösse und Pixeldichte. Beide 800er-Versionen zusammen 228 KB.
- Hero: 3072 Pixel breite WebP-Ableitung statt 6142 Pixel breitem PNG. 843 KB statt 4'193 KB (80 % weniger). Die reduzierte Auflösung reicht für rund 1500 CSS-Pixel bei doppelter Pixeldichte; auf grösseren hochauflösenden Displays ist die Detailauflösung geringer. Das Motiv und der Ausschnitt bleiben erhalten.
- Freigestellte Teamfotos als WebP mit Transparenz in drei Grössen. Die 640er-Versionen zusammen 1'225 KB statt 5'939 KB PNG (79 % weniger); auf hochauflösenden Displays kann der Browser grössere Varianten auswählen. Die WebP-Kompression der PNG-Ableitungen ist verlustfrei, die kleineren Varianten sind herunterskaliert.
- Asynchrones Dekodieren der Karten, Projektcover und Porträts. Lazy Loading bleibt bei Bildern unterhalb des Einstiegs erhalten; das Projektcover wird priorisiert, die Erlebniskarten-Vorschau erst bei Annäherung geladen.
- Apache-Regeln für Textkompression und Browser-Caching ergänzt: CSS/JS eine Stunde, Bilder eine Woche, HTML sofort wieder prüfen. Kein unveränderlicher Jahrescache; PHP behält seine eigene `no-store`-Regel.
- Geänderte Scripts erhalten neue Versionsparameter. Originaldateien bleiben erhalten. Bildvarianten können mit `python scripts/build-images.py` (Pillow benötigt) neu erzeugt werden.

## Bewusst beibehalten

Alle eigentlichen Seitenscripts laden bereits mit `defer`. Das kleine synchrone Script der Projektvorlage setzt den Ressourcen-Basispfad vor dem Laden der Styles; JSON-LD ist kein ausführbares Script. CSS bleibt vor dem ersten Zeichnen geladen, damit die Seite nicht kurz ungestaltet erscheint. Google Fonts nutzt bereits `display=swap` und vorbereitete Verbindungen. Die Animationslogik hat bereits Schutz bei reduzierter Bewegung und pausiert in relevanten Ruhezuständen. Ohne reproduzierbaren Engpass ist eine umfassende Umstrukturierung nicht gerechtfertigt.

## Doppelte ID `shadowLL`

Weder im aktuellen Repository (einschliesslich SVGs) noch im gerenderten Live-Dokument der Startseite vorhanden. Die Live-Prüfung ergab auch keine anderen doppelten IDs. Der Bericht nennt nur den Namen, nicht das zugehörige Element. Eine Browser-Erweiterung oder ein früherer Seitenstand ist möglich; die konkrete Herkunft ist damit nicht bewiesen. Im aktuellen Website-Code gibt es keine entsprechende Stelle zu reparieren.

Falls die Meldung im eigenen Browser erneut erscheint, zeigt die Konsole mit folgendem Ausdruck die betroffenen Elemente samt Umgebung:

```js
[...document.querySelectorAll('[id="shadowLL"]')].map(el => ({
  element: el.outerHTML,
  parent: el.parentElement?.outerHTML.slice(0, 3000)
}))
```

## Nach Veröffentlichung

1. Alle neuen WebPs zusammen mit Scripts, HTML und `.htaccess` hochladen. Bei späterem Überschreiben gecachter Bilder einen neuen Dateinamen verwenden.
2. In einem Browser ohne Erweiterungen mit ausgeschaltetem Cache und gedrosseltem Mobilnetz prüfen. Mehrere gleichartige Messungen vergleichen; Byte-Einsparungen sind keine garantierten Ladezeit-Prozente.
3. Im Netzwerk prüfen: Hero lädt `Background-3072.webp`; Karten und Teamfotos verwenden passende WebP-Grössen. Keine alten PNG-Porträts oder Karten-JPGs im normalen Seitenaufruf.
4. Desktop/Mobil: Hero, Kartenwechsel, Porträts und Kreative Pause visuell prüfen. Nach dem Scrollen müssen alle Bilder erscheinen.
5. Beim Hoster `Content-Encoding` für Textressourcen und `Cache-Control`/`Expires` prüfen. Apache-Module bzw. vorgeschalteter nginx bestimmen die tatsächliche Wirkung; die lokale Vorschau simuliert diese Server-Kompression und das Caching nicht.

Grundlage für die responsive Bildauswahl: [web.dev – Responsive images](https://web.dev/learn/design/responsive-images).
