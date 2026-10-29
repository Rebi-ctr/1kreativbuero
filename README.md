# 1Kreativbüro

Lokaler, klickbarer Gestaltungsentwurf für die Agenturwebsite. Grundlage sind das Briefing und die sechs Bildreferenzen sowie das 14,7 Sekunden lange Referenzvideo für die Projektunterseite.

## Entwurf öffnen

`index.html` lässt sich wie bisher direkt im Browser öffnen. Styles, Bilder und Projektlinks funktionieren auch per `file://`. Ein einfacher lokaler Dateiserver (zum Beispiel Python oder VS Code Live Server) kann ebenfalls weiterverwendet werden. In diesen lokalen Ansichten führen Links zu den HTML-Dateien.

Für eine Vorschau mit denselben sauberen URLs wie auf dem Hosting im Projektordner mit Node.js starten:

```sh
node scripts/preview.cjs
```

Dann `http://127.0.0.1:4173/` im Browser öffnen. Optional kann ein anderer Port angegeben werden, etwa `node scripts/preview.cjs 4174`. Es gibt keine Build-Abhängigkeiten und keinen Installationsschritt. Diese Vorschau leitet lokale Dateilinks auf die sauberen URLs um; ein einfacher Dateiserver liefert stattdessen die ursprünglichen HTML-Adressen aus.

## Saubere URLs auf METANET

Die Website wird im Hauptverzeichnis der Domain bereitgestellt:

| Seite | Öffentliche URL | Intern ausgelieferte Datei |
| --- | --- | --- |
| Startseite | `/` | `index.html` |
| Kontakt | `/kontakt` | `kontakt.html` |
| Wiriehorn | `/projekte/wiriehorn` | `projekt.html` |
| Rigi | `/projekte/rigi` | `projekt.html` |

Die `.htaccess` gehört neben die drei HTML-Dateien ins Web-Hauptverzeichnis (bei METANET gewöhnlich `httpdocs`). Beim Upload auch diese versteckte Datei übertragen. Voraussetzung ist Apache 2.4 mit erlaubten Rewrite-Regeln und `Options -MultiViews`. Eine schon auf dem Hosting vorhandene `.htaccess` vor dem Zusammenführen sichern und deren Regeln berücksichtigen.

Direkte Aufrufe von `/index.html` und `/kontakt.html` werden mit HTTP 301 auf `/` beziehungsweise `/kontakt` weitergeleitet; zusätzliche Query-Parameter bleiben erhalten. Alte Links wie `/projekt.html?projekt=wiriehorn` werden auf `/projekte/wiriehorn` weitergeleitet, wobei die bisherige Query-Zeichenfolge entfällt. Unterseiten verwenden keinen abschliessenden Schrägstrich. Anker wie `/#projekte` und `/kontakt#kontaktformular` bleiben nutzbar. Medien und `/api/contact.php` werden regulär ausgeliefert. Unbekannte Projektpfade liefern auf dem Hosting einen normalen HTTP-404-Fehler.

Die Projektauswahl und nativen Bildübergänge lesen den Projektnamen aus dem URL-Pfad oder aus einem bisherigen Projektlink. Für ein zusätzliches Projekt neben den Daten in `content.js` auch die freigegebenen Projektpfade in `.htaccess` und `scripts/preview.cjs` ergänzen. Ressourcen verwenden relative Pfade; `projekt.html` setzt nur unter verschachtelten Projekt-URLs eine passende Basisadresse. `navigation.js` erhält Kapitelanker auf der aktuellen Seite und verwendet bei direkten Dateien und auf localhost Dateilinks. Auf dem Hosting werden die sauberen Adressen verlinkt.

Nach dem Upload auf dem echten Hosting prüfen: alle vier URLs direkt öffnen und neu laden, Logo und Navigation verwenden, alte Links auf die jeweilige Weiterleitung prüfen sowie Bilder, Projektübergänge und Kontaktformular kontrollieren. Die lokale Node-Vorschau bildet die vorgesehenen URLs und Weiterleitungen nach; sie führt weder Apache-Regeln noch PHP aus und ersetzt diesen Hosting-Test nicht.

## Aufbau

- `index.html`: Hero, Highlight-Projekt, Büro, drei Personen, Projektarchiv und Kontakt.
- `/projekte/wiriehorn` (`projekt.html`): Wiriehorn-Projektgeschichte mit zehn Schritten, Bildern, Videos, Sommer-/Winter-Vergleich und eingebetteten Karten.
- `/projekte/rigi` (`projekt.html`): Rigi-Detailansicht mit grossformatigem Einstieg, vier Filmstills zum Imagefilm und einem vorbereiteten Bereich für das Fotoshooting.
- `content.js`: Zentraler Ort für Teamtexte, Rollen, Leistungen, Kontakt und Projekte.
- `styles.css`: Gestaltung, Raster, mobile Ansichten, Bewegungen und reduzierte Animationen.
- `shared.js`: Gemeinsame DOM-, Text- und URL-Hilfsfunktionen sowie die Einstellung für reduzierte Bewegung. Wird vor den Seiten-Scripts geladen.
- `app.js`: Sommer-/Winter-Kartenstapel, Projektübersicht, allgemeine Projektseiten und native Seitenübergänge.
- `studio.js`: Büro-Scrollytelling, Schriftanimation und Teamfächer; nur auf der Startseite geladen.
- `hero-reveal.js`: Responsive SVG-Masken mit drei Gucklöchern auf Desktop und zwei auf Mobile, Kollisionen, Cursor-Haftung, Touch-Ziehen und sanfter Rückkehr zum Logo.
- `wiriehorn.js`: Zehnteilige Projektgeschichte, Sommer-/Winter-Vergleich und Videosteuerung. Auf Projektseiten vor `app.js` laden.
- `background-motion.js`: Lokaler Wasserfarbenzug der Hintergründe bei Mausbewegung auf einer ruhenden Seite. Beim Scrollen und im Ruhezustand zeichnet der Browser die normalen CSS-Farbflächen. Der Effekt pausiert bei Mausrad, Scroll-Tasten und Scroll-Ereignissen und kehrt erst bei einer neuen Mausbewegung nach einer kurzen Scrollpause zurück. Seine WebGL-Textur enthält nur Farbflächen; Bilder, Grafiken und Texte werden nicht erfasst. Auf Touch-Geräten, bei reduzierter Bewegung und ohne WebGL bleiben die normalen CSS-Hintergründe aktiv.
- `creative-pause.js`: «Kreative Pause» im gemeinsamen Footer öffnet einen bildschirmfüllenden Dialog. Kopien der sichtbaren Wörter, Bilder und Logos fallen zeitversetzt an den unteren Bildschirmrand. Danach erscheinen «Gute Ideen brauchen manchmal eine Pause.» und «Weiter geht’s». Der Button oder Esc bauen die Ansicht wieder auf. Das Dokument einschliesslich Formulareingaben und Scrollposition bleibt erhalten. Reduzierte Bewegung öffnet die ruhige Pause ohne Fallanimation. Eine Grössenänderung beendet den Effekt; der Wasserfarbenzug ruht während der Pause. Kein zusätzliches Paket erforderlich.

  Der Grössenabgleich verwendet `window.innerWidth` und `window.innerHeight`. Resize-Ereignisse allein, insbesondere beim Öffnen des Dialogs und Aktivieren der Scrollsperre, brechen die Pause nicht ab. Falls eine Momentaufnahme oder Animation fehlschlägt, bleibt die ruhige Pause mit funktionierendem Zurück-Button offen.

  Zusätzlich fallen bereits geladene Team- und Projektbilder ausserhalb des sichtbaren Ausschnitts von oben nach. Auf der Startseite sind das bis zu drei Teamfotos und drei verschiedene Projektbilder. Desktop erlaubt maximal neun zusätzliche Bildkarten (höchstens drei Teamfotos), Mobile maximal vier (höchstens zwei Teamfotos). Lange Projektgeschichten erhalten eine über mehrere Kapitel verteilte Auswahl. Doppelte, schon sichtbare, ausgeblendete und ungeladene Bilder werden ausgelassen. Die kleinen Canvas-Kopien entstehen aus den geladenen Originalbildern ohne neue Bildabrufe; ihre Auflösung ist auf maximal 1,5-fache Kartengrösse begrenzt. Beim Wiederaufbau fliegen sie nach oben zurück. Der Pausentext erscheint nach dem Nachfallen.
- `assets/study-*.svg`: Frühere Layoutstudien; in der aktuellen Projektübersicht nicht mehr eingebunden.
- `assets/references/`: Unveränderte, vom User gelieferte Bildreferenzen für die lokale Entwurfsarbeit. Die verwendeten Referenzporträts sind im Entwurf ausdrücklich gekennzeichnet.
- [Gestaltungskonzept](docs/GESTALTUNGSKONZEPT.md): Gestaltungsgrundlage, Bildzuordnung und Interaktionen.
- [Inhaltsvorlagen](docs/INHALTE.md): Ausfüllbare Vorlage für die echten Inhalte.

## Entwurfsstatus

Header und Footer sind auf Startseite und Projektseiten identisch. Die Hauptnavigation führt immer zu Projekten, Büro und Kontakt auf der Startseite. Beide Bereiche verwenden `assets/LogoNavbar.svg`; der Footer enthält keine Entwurfsangabe mehr. Die feste Konzept-Plakette ist vollständig entfernt.

Die Site ist lokal vorbereitet und nicht veröffentlicht. Das Highlight «Unser neustes Projekt.» zeigt das Wiriehorn-Projekt als interaktive Übersichtskarte mit den bereitgestellten Sommer- und Winterbildern. Sommer liegt zuerst vorne. Hover auf die hintere Karte, Tastaturfokus oder Klick holen das Bild mit einer kleinen Verschiebung und Drehung nach vorne. Der Kartenwechsel dauert 450 ms; die Ebene wechselt nach 180 ms. Die Trefferflächen bleiben fest, damit unter dem Mauszeiger kein wiederholter Wechsel entsteht. Ein separater Link öffnet die Projektvorschau. Die Daten dazu stehen in `featuredProject` in `content.js`.

«Das Büro.» steht horizontal und vertikal zentriert vor einem weissen Raster auf Schwarz. Direkt hinter dem Titel bleibt das Raster ausgespart. Hover, Tastaturfokus oder Antippen lösen einen kurzen Buchstabenwechsel des Titels aus. Der kompakte Rasterbereich bleibt im normalen Scrollfluss: Zeitlich gestaffelte Linien beginnen ihren Aufbau erst gut sichtbar im Viewport. Der linke Rand bleibt offen. Das Raster reicht bis in den Kartenfächer und blendet dort weich aus. Drei getrennte Hotspots setzen «Foto», «Video» und «Web» ausschliesslich aus Buchstaben zusammen, sobald der jeweilige Hotspot sichtbar wird. Beim Zurückscrollen läuft die Sequenz zurück. Einführungstexte, Bildfläche, Schlagwortband und Scrollhinweise sind entfernt.

«Das Kreative.» liegt direkt über dem Teamfächer. Die gefüllte Schrift steht hinter den Karten; eine zweite, invertierende Kontur wird ausschliesslich auf den tatsächlichen Kartenflächen sichtbar. Eine gemeinsame SVG-Maske berücksichtigt Drehung, Skalierung und den Kartenwechsel. Beim Hover auf eine Karte oder Tastaturfokus treten die Konturen hinter die Karten zurück. Die drei Personen lassen sich per Hover, Tastatur oder Antippen wählen. Ihre Beschreibung und Stärken stehen unter dem Fächer; zusätzliche Auswahlknöpfe machen alle drei Personen direkt erreichbar.

Unter «Aus unserem Kreativbüro.» stehen ausschliesslich Wiriehorn und Rigi, jeweils mit eigener Detailansicht. Filter, Studienzählung und die bisherige Abschnittsbeschriftung sind entfernt. Das Bahn-Motiv aus dem Rigi-Imagefilm dient als Vorschaubild. Die Detailseiten verlinken jeweils auf das andere Projekt sowie zurück zur Übersicht.

Die Rigi-Seite übernimmt die Gestaltung der Wiriehorn-Projektgeschichte: dunkler Einstieg mit grossem zweizeiligem Titel und Projektangaben, eingerücktes Hero-Bild, Kapitelnavigation, nummerierte Abschnitte auf ruhigen Farbflächen und ein dunkler Abschluss. Beide Seiten verwenden gemeinsame Stile unter `project-story-page` sowie das `journey`-Kapitelraster. Das Bahn-Motiv eröffnet Rigi; Wald, Kinder und Lokomotivdetail folgen im Bildraster des Imagefilm-Kapitels. Alle vier bereitgestellten Bilder gehören zum Imagefilm. Im eigenen Fotoshooting-Kapitel steht bis zur Bildlieferung ein Platzhalter. In `content.js` lassen sich eine lokale Filmdatei unter `film.video` und die späteren Fotos unter `photoshoot.images` ergänzen; dann erscheinen Videoplayer beziehungsweise Fotogalerie. Der Titel steht als Zeilenliste in `headline`. Ohne Filmdatei erscheint kein Wiedergabeknopf.

Texte, Rollen und Stärken sind Vorschläge; die dargestellten Personen sind Referenzporträts. Die fehlende Kontaktadresse ist als Textplatzhalter dargestellt; sobald `studio.email` in `content.js` gesetzt ist, erscheint ein funktionierender E-Mail-Link.

Der Bild-zu-Hero-Übergang nutzt progressive native View Transitions in unterstützten Browsern. Sonst bleiben die normalen Seitenlinks nutzbar. Die Ansicht unterstützt kleine Bildschirme, Tastaturbedienung und `prefers-reduced-motion`. Bei reduzierter Bewegung stehen Raster und Wörter sofort vollständig da. Ohne JavaScript bleiben die drei Wörter ebenfalls sichtbar. Für einen späteren Livegang müssen Inhalte, Bildrechte und die passenden rechtlichen Angaben ergänzt und die Entwurfskennzeichnungen einschliesslich `noindex` entfernt werden.

Der Wischeffekt erfasst auch den Titelbereich der Startseite sowie die dunklen Einstiege und Kapitel der Projektseiten. Seine Farbtextur enthält die tatsächlichen CSS-Flächenfarben in DOM-Reihenfolge; vollständig transparente Bereiche lassen die Elternfarbe bestehen. Sie wird erst für eine tatsächliche Mausspur vermessen und hochgeladen. Nach dem Ausklingen wird die Canvas ausgeblendet, die normalen CSS-Farben übernehmen und die Render-Schleife endet. Beim Scrollen werden weder Abschnittspositionen gemessen noch Farbtexturen aktualisiert; so können die Farbgrenzen nicht unabhängig vom Inhalt hinterherlaufen. Der Effekt rendert höchstens in CSS-Pixelauflösung und aktualisiert bestehende Texturen ohne laufende Neuanlage. Bilder, Logos, Videos und Grafiken bleiben ausserhalb der Textur.

## Wiriehorn-Projektgeschichte

`/projekte/wiriehorn` zeigt alle zehn Schritte aus `assets/projects/wiriehorn/content-steps/Beschreibung-Projektschritte.docx`. Inhalte und Interaktionen stehen in `wiriehorn.js`, komprimierte Rasterbilder in `assets/projects/wiriehorn/web/`. Die Originalmedien bleiben unverändert.

Kompakte Bildraster und wechselnde helle und dunkle monochrome Flächen orientieren sich an der aktuellen Hauptseite. Der Jahreszeitenvergleich lässt sich direkt im Bild per Ziehen, Touch und Tastatur bedienen. Videos spielen im sichtbaren Bereich stumm und in Schleife; native Steuerelemente sind ausgeblendet. Ein dezenter Pause-/Play-Schalter erscheint bei Hover, Tastaturfokus oder auf Touch-Geräten. Reduzierte Bewegung verhindert automatisches Abspielen. Ausserhalb des sichtbaren Bereichs pausieren die Videos.

Panorama und Erlebniskarte laden als verzögerte iFrames mit ergänzenden Direktlinks. Die frühere Einbettungssperre der Karte wurde entfernt und am 28. Oktober 2026 erneut geprüft. Die Infotafel bleibt als Zukunfts-Mockup gekennzeichnet.

Die Karte startet nach einem Klick innerhalb des iFrames. Dadurch zieht ihr automatischer Fokus die Projektseite beim Lesen nicht unerwartet zum Kartenabschnitt.

## Prüfung nach Änderungen

Mit Node.js lassen sich die Prüfungen ohne zusätzliche Pakete starten:

```sh
node --test tests/site.test.cjs
```

Sie prüfen lokale HTML-Verweise, eindeutige Script-Einbindungen, deren Ladefolge und den tatsächlichen Seitenaufbau aller Projekte. Die Wiriehorn-Prüfung kontrolliert zusätzlich die zehn Schritte, Vergleich, Videos und lokalen Medien. Browser-APIs werden dabei vereinfacht nachgebildet; die visuellen Interaktionen müssen zusätzlich im Browser geprüft werden.

Gemeinsame Styles und Typografie liegen in `styles.css`. Titel verwenden Sansation, Absätze und Aktionsbuttons Inter mit Gewicht 300. Änderungen am Hero müssen auf beiden Seiten des 650-px-Breakpoints geprüft werden. Die SVG-Konturen und Masken müssen stets gemeinsam verändert werden.

## Kontaktseite und Formular

`kontakt.html` enthält das Kontaktformular. Der Kontaktbereich ist Bestandteil des gemeinsamen Footers in `index.html`, `projekt.html` und `kontakt.html`. Die Navigation und «Melde dich bei uns» verlinken auf die Formularseite; der direkte E-Mail-Link bleibt erhalten.

Für direkten Versand wird ein Formular-Dienst benötigt. Dessen öffentliche Formular-Adresse und öffentliche Felder werden in `studio.contactForm` in `content.js` eingetragen. Solange keine Adresse eingerichtet ist, bleibt der Versand deaktiviert. `contact.js` prüft die Formularfelder, verhindert doppelte Absendungen und zeigt einen Erfolg erst nach bestätigter Antwort des Dienstes. Bei Fehlern bleiben die Eingaben erhalten. Keine geheimen Server- oder Kontoschlüssel in diese Browser-Konfiguration eintragen.

Alle Prüfungen inklusive Formular- und Hero-Verhalten:

```sh
node --test tests/*.test.cjs
```

### Versand auf METAhost S

Das Formular ist für `api/contact.php` vorbereitet. `api/contact-config.php` enthält einen Aktivierungsschalter sowie Absender, Empfänger und erlaubte Website-Domains. Es werden keine SMTP-Passwörter im Browser benötigt. Der Versand nutzt den auf dem Hosting eingerichteten PHP-Mailtransport; falls dieser nicht verfügbar ist, muss die Versandkonfiguration mit METANET abgestimmt bzw. SMTP serverseitig eingerichtet werden.

Vor der Aktivierung:

1. Die Website einschliesslich `api/` auf das PHP-Webhosting hochladen und HTTPS verwenden.
2. Prüfen, dass `team@1kreativbuero.ch` als zulässiger Absender und als erreichbarer Empfänger eingerichtet ist. Die tatsächlichen Website-Adressen unter `allowed_hosts` eintragen.
3. Auf dem Hosting `php -l api/contact.php` und `php -l api/contact-config.php` prüfen.
4. In `api/contact-config.php` `enabled` auf `true` setzen. Danach eine kontrollierte Testnachricht senden und den Eingang im Team-Postfach prüfen; eine Bestätigung des Mailservers allein beweist noch keine Zustellung.

Der Endpunkt prüft Pflichtfelder, E-Mail-Adressen und Feldlängen. Er verwendet ein sitzungsgebundenes Token, einen Honeypot und eine serverseitige Mengenbegrenzung (maximal fünf Versuche pro IP in 15 Minuten und 30 pro Stunde insgesamt). Die temporäre Limitdatei enthält nur Zeitpunkte und gehashte IP-Kennungen, keine Nachrichten. Der Webserver muss sein temporäres Verzeichnis schreiben können.

Die lokale Node-Vorschau führt PHP nicht aus und antwortet für `/api/contact.php` mit einem nicht verfügbaren Dienst. Die Vorschau lässt das Formular deshalb deaktiviert und liefert keine PHP-Quelltexte aus. Auf dieser Entwicklungsumgebung ist PHP derzeit nicht installiert; Syntaxprüfung und Zustelltest des PHP-Endpunkts stehen noch aus. Der JavaScript-Versand und die Fehlerfälle sind separat automatisiert geprüft.
