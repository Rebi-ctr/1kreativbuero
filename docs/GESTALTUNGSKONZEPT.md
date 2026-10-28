# 1Kreativbüro – Gestaltungsgrundlage

Stand: 28. Oktober 2026. Diese Grundlage beschreibt einen lokalen, klickbaren Entwurf und die Richtung für die spätere Umsetzung. Namen, Leistungen, Texte und Projektmaterial werden mit echten Inhalten ergänzt.

## 1. Anforderungen aus dem Briefing

- Die Agentur und ihre drei Kreativköpfe vorstellen sowie Projekte zeigen.
- Eine cleane, moderne, kompetente Wirkung mit Schwarz und Weiss als Grundfarben.
- Eine Hero Section nach der Bildreferenz mit prägnanter Typografie gestalten.
- Ein ausgewähltes Projekt mit Bild und überlagertem Text hervorheben.
- Im Über-uns-Bereich zuerst Fähigkeiten und Team als Ganzes vorstellen, danach die einzelnen Personen und ihre Stärken.
- «Das Büro» mit Raster-Scrollytelling für Foto, Video und Web; danach «Das Kreative» mit drei Gesichtern in einem Kartenfächer. Dies ersetzt das ursprünglich vorgesehene Schlagwortkarussell.
- Alle Projekte in einer Übersicht zugänglich machen.
- Projekte anklickbar machen und auf eigenen Unterseiten ihre Entstehung erklären; die Videovorlage gibt die gestalterische Richtung vor.

## 2. Gestalterische Entscheidungen für den Entwurf

### Gemeinsame Gestaltung

Schwarzweiss bildet die ruhige Grundfläche. Farbe entsteht vor allem durch Projektbilder und Porträts. Grosse Schrift, feine Linien, klare Bildkanten und bewusst gesetzter Weissraum verbinden die Abschnitte. Die unterschiedlichen Referenzen liefern einzelne Prinzipien für ein gemeinsames Erscheinungsbild.

Gross gesetzte Überschriften stehen einer kleinen, gut lesbaren Informationsebene gegenüber. Eine klare Groteskschrift trägt das Erscheinungsbild; Navigation, Beschriftungen und Projektangaben bleiben sachlich. Raster, Nummerierungen und Linien geben Orientierung.

### Mausbewegung der Farbflächen

Auf Start- und Projektseiten reagiert die Hintergrundfarbe lokal auf den Mauszug: Ein weiches Bewegungsfeld mit etwa 72–110 Pixeln Radius zieht Farbe in Bewegungsrichtung und mischt sie in der frischen Spur unscharf. Die Spur klingt exponentiell ab; nach etwa 330 Millisekunden sind über 94 Prozent der Feldstärke abgebaut. Es gibt kein Verschieben oder Neigen der ganzen Fläche. Besonders sichtbar wird der Effekt an Übergängen zwischen unterschiedlichen Hintergrundfarben.

Ein WebGL-Canvas rendert ausschliesslich die CSS-Farbflächen. Bilder, Höhenlinien, Grafiken, Texte und Bedienelemente bleiben ausserhalb der Textur; ihre bestehenden Hover-Interaktionen bleiben erhalten. Scrollen und Grössenänderungen löschen alte Spuren und aktualisieren die Farbgeometrie. Im Ruhezustand läuft keine dauernde Animationsschleife. Auf Touch-Geräten, bei reduzierter Bewegung, ohne WebGL und ohne JavaScript bleiben die normalen Hintergründe bestehen.

### Hero

- Schwarzer Hintergrund, übergrosse helle „1K.“-Typografie.
- Freigestellt wirkende Bildausschnitte und feine Ellipsen greifen die Komposition von `Herosection.jpg` auf.
- Eine kurze Positionierung und direkte Links zu Projekten sowie Team ergänzen die visuelle Ebene.
- Die Recyclingbegriffe und Motive der Vorlage werden als Referenzinhalt behandelt. Der spätere Hero erhält eine eigene Aussage und eigene Bilder.

### Featured Projekt

- Ein dominantes Bild mit gross überlagertem Projekttitel und kurzem Einstieg.
- Unter «Unser neustes Projekt.» zeigt ein Kartenstapel die Sommer- und Winterbilder des Wiriehorn-Projekts. «Interaktive Übersichtskarte» beschreibt das Projekt neben der Überschrift. Sommer liegt beim Öffnen vorne. Hover auf die hintere Karte, Tastaturfokus oder Klick holen das Bild mit 12 Pixeln seitlichem Versatz, 6 Pixeln vertikalem Versatz und 1 Grad Drehung nach vorne. Die Bewegung dauert 450 ms; die Ebene wechselt nach 180 ms. Die Trefferflächen bleiben fest. Bei reduzierter Bewegung erfolgt der Wechsel direkt.
- Feine Höhenlinien liegen mit 10 Prozent Deckkraft auf der dunklen Fläche hinter den Bildern. Zusätzliche Sommer-/Winter-Beschriftungen auf den Karten entfallen; für Screenreader bleiben die Ansichten benannt.
- Ein separater Link «Ab ins Projektbüro» öffnet die Wiriehorn-Vorschau. Der Bildwechsel bleibt innerhalb des Abschnitts.
- Grosszügigere Abstände um Überschrift, Kartenstapel und Abschnittsende geben den Bildern Raum. Die obere Beschriftungszeile, die Bildunterschrift sowie die bisherigen Vor-/Zurück-Schaltflächen entfallen.

### Das Büro und das Raster-Scrollytelling

- Der kompakte Bereich beginnt mit einem weissen Raster auf Schwarz. «Das Büro.» steht horizontal und vertikal mittig. Eine schwarze Aussparung um den Titel hält die Linien hinter dem Text frei. Beim Hover, Tastaturfokus oder Antippen wechseln die Buchstaben kurz durch und finden nach etwa 520 Millisekunden zum Titel zurück. Die bisherigen Einführungstexte und Hinweise sind entfernt.
- Acht Spalten und sechs Hauptzeilen greifen das Rasterprinzip aus `ueberunshero.jpg` beziehungsweise `assets/references/about-grid.jpg` auf. Die durchgehende linke Randlinie entfällt. Zusätzliche Zeilen führen bis in den Kartenfächer, wo das Raster weich ausblendet.
- Der Linienaufbau setzt später im sichtbaren Viewport ein und erfolgt gestaffelt mit kurzen Übergängen. Es gibt kein Festhalten und keine zusätzliche Scrollstrecke. «Foto», «Video» und «Web» besetzen drei getrennte Hotspots; «Video» steht vertikal, die anderen Wörter horizontal.
- Jeder Hotspot beginnt seine Buchstabensequenz beim eigenen Eintritt ins sichtbare Bild. Die bewegten Zufallszeichen sind ausschliesslich Buchstaben. Beim Zurückscrollen läuft die Sequenz reproduzierbar zurück.
- Ohne JavaScript sowie bei reduzierter Bewegung erscheinen Raster und Wörter statisch und vollständig. Zufallszeichen sind für Screenreader verborgen; die drei echten Begriffe bleiben zugänglich.

### Das Kreative und die drei Personen

- «Das Kreative.» überlagert den Fächer. Die gefüllte Schrift liegt hinter den Karten. Eine gemeinsame Konturebene mit invertierender Farbmischung wird auf die gedrehten Kartenflächen begrenzt. Die Maske folgt der Geometrie während des Kartenwechsels. Hover beziehungsweise sichtbarer Tastaturfokus lassen die Konturen nach hinten verschwinden; ausserhalb der Karten bleibt die gefüllte Schrift bestehen. Der bisherige Begleittext entfällt.
- Drei leicht gedrehte Porträtkarten überlappen sich als Fächer. Name, Rolle und eine hervorgehobene Stärke stehen auf den Karten.
- Fokusrahmen aus `Personenbeschrieb.jpg` und das Wechselspiel von Porträt und Textfeldern aus `Personenbeschrieb_2.jpg` werden zu einem gemeinsamen Bildprinzip verbunden.
- Hover, Tastaturfokus oder Antippen holen eine Karte mit demselben sanften Versatz und Ebenenwechsel wie beim Wiriehorn-Stapel nach vorne. Die mittlere Person ist zunächst aktiv. Feste Trefferflächen verhindern unbeabsichtigte Hover-Wechsel. Drei zusätzliche Auswahlknöpfe halten alle Personen auch mobil erreichbar.
- Fokusrahmen beziehungsweise Rasterlinien strukturieren die Porträts. Die persönliche Vorstellung und weitere Stärken der ausgewählten Person stehen in einem gemeinsamen Bereich unter dem Fächer.
- Die drei späteren Porträts erhalten eine abgestimmte Bildbearbeitung. Unterschiedliche Kompetenzen dürfen sich in Ausschnitt und Akzenten zeigen.
- Die abgebildeten Personen in den Vorlagen sind Referenzpersonen und keine Mitglieder von 1Kreativbüro. Auch die Kampagnentexte der Vorlagen werden nicht als Agenturinhalt übernommen.

### Projektarchiv

- Eine helle, zeilenbasierte Übersicht nach `Projektübersicht_2.png` zeigt sämtliche Projekte.
- Jede Zeile kombiniert Projekttitel, Kategorie oder Leistung, Bild und einen eindeutigen Link.
- Feine Trennlinien und grosszügige Bildflächen bilden einen ruhigen Rahmen. Im aktuellen Entwurf stehen die Titel neben den Bildern; auf schmalen Bildschirmen darüber.
- Filter nach Disziplin grenzen die sichtbaren Arbeiten ein. „Alle“ zeigt die vollständige Übersicht.
- Das dunkle Kartenstapelmotiv aus `Projektübersicht.jpg` bleibt dem Featured Bereich zugeordnet. Dadurch bleibt das vollständige Archiv einfach zu überblicken und lässt sich um weitere Arbeiten ergänzen.

### Projektunterseite

Beobachtungen aus `UnterseiteProjekt.mov` laut Videoauswertung:

- Eine minimale weisse Projektübersicht arbeitet mit mittigen beziehungsweise versetzten Bildern und links überlagernden Projekttiteln.
- Bei Auswahl wird das Projektbild zu einer grossen Heroansicht erweitert.
- Die Detailseite zeigt grosse und kleine Bilder in asymmetrischer Anordnung, kurze Beschreibungen und viel Weissraum.
- Ein Rücklink führt zur Projektübersicht.

Für den Entwurf wird daraus ein Bild-zu-Hero-Übergang mit anschliessender luftiger, versetzter Bilderstrecke. Der Übergang nutzt die Unterstützung des Browsers für Ansichtswechsel zwischen Seiten; ohne diese Unterstützung öffnen sich die Projektlinks direkt. Ergänzend setzen kurze Textblöcke den Wunsch um, die Entstehung zu erklären: **Ausgangslage → Idee → Entwicklung → Ergebnis**. Diese inhaltliche Gliederung ist eine Empfehlung zur Umsetzung des Briefings, keine Beobachtung aus dem Video.

Am Ende steht ein nächstes Projekt; oben führt ein Rücklink ins Archiv. Beim Ergänzen der echten Inhalte sollen Projektrollen und Bildbeschriftungen nachvollziehbar zeigen, welchen Beitrag das Team geleistet hat.

## 3. Empfohlene Seitenstruktur

1. Hero mit Positionierung und Navigation.
2. Featured Projekt als visueller Einstieg in die Arbeiten.
3. Das Büro: zentrierter Titel und Rasteraufbau im normalen Scrollfluss für Foto, Video und Web.
4. Das Kreative: drei Personen als Kartenfächer mit individuellen Stärken.
5. Vollständige Projektübersicht.
6. Kontakt und abschliessende Navigation.
7. Eigene Detailansicht pro Projekt.

## 4. Verhalten auf verschiedenen Geräten

Die folgenden Punkte ergänzen das Briefing als Umsetzungsempfehlungen:

- Auf schmalen Bildschirmen werden Raster und Projektzeilen untereinander angeordnet. Grosse Typografie darf den Bildschirm prägen, aber keine Bedienelemente verdecken.
- Überlagerte Texte benötigen eine ausreichend ruhige beziehungsweise kontrastreiche Fläche. Wesentliche Angaben bleiben als echter Text verfügbar.
- Der Rasteraufbau folgt dem normalen Scrollfluss ohne Festhalten. Bei reduzierter Bewegung bleiben Raster und Wörter vollständig sichtbar.
- Animationen unterstützen den Wechsel zwischen Ansichten. Bei reduzierter Bewegung entfallen räumliche Übergänge und automatisch laufende Effekte.
- Projektlinks, Navigation und aufklappbare Personeninformationen sind auch ohne Hover erreichbar. Sichtbare Fokuszustände und Bildbeschreibungen sind angelegt. Ein echter Kontaktlink entsteht nach dem Eintragen einer Kontaktadresse.
- Bilder werden passend zur Anzeigegrösse bereitgestellt. Ein späteres Video startet mit einem geeigneten Vorschaubild.

## 5. Referenzen und echte Inhalte

Die ursprünglichen sechs Bildreferenzen und das Video sind Gestaltungsreferenzen. Daraus wird keine Erlaubnis zur produktiven Werbenutzung der abgebildeten Personen, Projekte, Logos oder Bilder abgeleitet. Im lokalen Entwurf verwendete Referenzmotive bleiben sichtbar als solche gekennzeichnet. Die zusätzlich bereitgestellten Wiriehorn-Bilder werden im Highlight und in der zugehörigen Projektvorschau verwendet.

Für die spätere Website werden echte Teamdaten und Projektgeschichten benötigt. Wo diese fehlen, stehen klar erkennbare Platzhalter. Die vier Projektmotive im Entwurf sind selbst erstellte Gestaltungsstudien; die Porträts nutzen gekennzeichnete Bildreferenzen. Das Büro-Raster besteht aus HTML und CSS und verwendet kein Referenzfoto. Die ausfüllbare Vorlage steht in [INHALTE.md](INHALTE.md).

Noch offen sind insbesondere die endgültige Positionierung, das Leistungsangebot, Namen und Porträts der drei Personen, die ausführliche Wiriehorn-Projektgeschichte sowie weitere veröffentlichbare Projektbilder und Kontaktangaben. Diese Inhalte lassen sich ergänzen, ohne die beschriebene Seitenstruktur neu aufzubauen.

## Wiriehorn-Timeline

Die zehn Schritte nutzen kompakte Bildraster und zweispaltige Textköpfe am Desktop. Rosé, Salbei, Eisblau und einzelne dunkle Flächen verbinden die Projektgeschichte mit dem aktuellen Hero und seinen farbigen Materialdetails. Mobil bleiben die Bildgruppen überwiegend zweispaltig; Videos und Einbettungen erhalten ausreichend Platz.

Der Sommer-/Wintervergleich wird unmittelbar am Trennpfeil im Bild bedient, inklusive Touch und Tastatur. Stumme Videos laufen in Schleife, solange sie sichtbar sind; eine reduzierte Bewegungseinstellung und manuelles Pausieren werden respektiert. Native Videosteuerleisten entfallen. Karte und Gipfelpanorama sind eingebettet.

Die Karte startet nach einem Klick innerhalb des iFrames. Dadurch zieht ihr automatischer Fokus die Projektseite beim Lesen nicht unerwartet zum Kartenabschnitt.
