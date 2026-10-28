// Alle Texte sind Entwürfe. Hier später die echten Team- und Projektinhalte ergänzen.
const studio = {
  name: '1Kreativbüro',
  email: '',
};

const people = [
  {
    number: '01', name: 'Kopf 01', role: 'Konzept & Strategie',
    strengths: ['Weiterdenken', 'Zusammenhänge', 'Klarheit'],
    description: 'Hier lernen wir den Menschen hinter der Idee kennen: Was treibt dich an und welche Perspektive bringst du ins Büro?',
    image: 'assets/references/portrait-focus.jpg', imageClass: 'portrait-blue',
  },
  {
    number: '02', name: 'Kopf 02', role: 'Design & Identität',
    strengths: ['Formgefühl', 'Neugier', 'Details'],
    description: 'Hier steht deine persönliche Vorstellung. Ein paar eigene Worte erzählen mehr als ein austauschbarer Agenturtext.',
    image: 'assets/references/portrait-grid.jpg', imageClass: 'portrait-beige',
  },
  {
    number: '03', name: 'Kopf 03', role: 'Digital & Bewegung',
    strengths: ['Experiment', 'Rhythmus', 'Umsetzung'],
    description: 'Hier zeigen wir, wie du arbeitest, was dich begeistert und was durch deine Perspektive im Team möglich wird.',
    image: 'assets/references/portrait-focus.jpg', imageClass: 'portrait-mono',
  },
];

// Das Highlight ist unabhängig von den Layoutstudien in der Projektübersicht.
const featuredProject = {
  slug: 'wiriehorn',
  title: 'Wiriehorn',
  lead: 'Das Wiriehorn im Sommer und im Winter.',
  views: [
    { season: 'Sommer', image: 'assets/Wiriehorn_Sommer_Test.jpg', alt: 'Illustrierte Sommeransicht des Wiriehorns mit Wanderwegen und Bergbahnen.', width: 2464, height: 1336 },
    { season: 'Winter', image: 'assets/Wiriehorn_Winter_Test.jpg', alt: 'Illustrierte Winteransicht des Wiriehorns mit Skipisten und verschneiten Bergen.', width: 2461, height: 1333 },
  ],
};

// Eigenständig erstellte Layoutstudien, keine behaupteten Kundenreferenzen.
const projects = [
  {
    slug: 'studie-01', number: '01', title: 'Anders denken.', category: 'Identität',
    descriptor: 'Eine Idee bekommt eine Form.', year: 'Entwurf', image: 'assets/study-type.svg',
    alt: 'Typografische Layoutstudie mit blauem Ring und dem Schriftzug anders denken.',
    lead: 'Wie aus einem Gedanken ein eigenständiger Auftritt entsteht.',
    stages: [
      { title: 'Der Anfang ist eine Frage.', text: 'Was sollte dieses Projekt verändern? Hier beschreiben wir die Ausgangslage, die Menschen dahinter und die Aufgabe, die es zu lösen galt.' },
      { title: 'Ein Gedanke wird konkret.', text: 'Hier erzählen wir, welche Idee das Projekt trägt. Skizzen, erste Entwürfe und bewusste Entscheidungen machen den Weg sichtbar.' },
      { title: 'Ausprobieren. Verfeinern. Machen.', text: 'Hier zeigen wir die Entwicklung: Varianten, Materialtests oder Prototypen – und warum am Ende genau diese Richtung überzeugt hat.' },
      { title: 'Eine Idee, die sichtbar wird.', text: 'Hier kommt das fertige Ergebnis hin. Mit echten Anwendungen und einer ehrlichen Einordnung dessen, was entstanden ist.' },
    ],
    gallery: ['assets/study-type.svg', 'assets/study-grid.svg', 'assets/study-form.svg'],
  },
  {
    slug: 'studie-02', number: '02', title: 'Neue Perspektiven.', category: 'Design',
    descriptor: 'Raum für einen anderen Blick.', year: 'Entwurf', image: 'assets/study-form.svg',
    alt: 'Abstrakte silberne Ringe vor grauem Hintergrund als eigenständige Formstudie.',
    lead: 'Ein Blick auf Form, Raum und das Spiel mit Perspektiven.',
    gallery: ['assets/study-form.svg', 'assets/study-grid.svg', 'assets/study-type.svg'],
  },
  {
    slug: 'studie-03', number: '03', title: 'In Bewegung.', category: 'Bewegtbild',
    descriptor: 'Wenn ein Gedanke Kreise zieht.', year: 'Entwurf', image: 'assets/study-motion.svg',
    alt: 'Schwarze elliptische Linien auf einer orangefarbenen grafischen Layoutstudie.',
    lead: 'Eine visuelle Studie über Rhythmus, Wiederholung und Veränderung.',
    gallery: ['assets/study-motion.svg', 'assets/study-form.svg', 'assets/study-type.svg'],
  },
  {
    slug: 'studie-04', number: '04', title: 'Drei. Mal. Eins.', category: 'Digital',
    descriptor: 'Ein System. Viele Möglichkeiten.', year: 'Entwurf', image: 'assets/study-grid.svg',
    alt: 'Schwarzweisse Rasterkomposition mit übergrossen Buchstaben Drei Mal Eins.',
    lead: 'Drei Perspektiven finden in einem gemeinsamen Gestaltungsraster zusammen.',
    gallery: ['assets/study-grid.svg', 'assets/study-type.svg', 'assets/study-motion.svg'],
  },
];
