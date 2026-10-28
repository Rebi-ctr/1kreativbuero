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

// Das Highlight nutzt dieselben Projektdaten wie die Übersicht.
const featuredProject = {
  slug: 'wiriehorn',
  title: 'Wiriehorn',
  lead: 'Das Wiriehorn im Sommer und im Winter.',
  views: [
    { season: 'Sommer', image: 'assets/Wiriehorn_Sommer_Test.jpg', alt: 'Illustrierte Sommeransicht des Wiriehorns mit Wanderwegen und Bergbahnen.', width: 2464, height: 1336 },
    { season: 'Winter', image: 'assets/Wiriehorn_Winter_Test.jpg', alt: 'Illustrierte Winteransicht des Wiriehorns mit Skipisten und verschneiten Bergen.', width: 2461, height: 1333 },
  ],
};

// Die bereitgestellten Rigi-Bilder gehören zum Imagefilm, nicht zum Fotoshooting.
const rigiFilmFrames = [
  { image: 'assets/Rigi8-verkleinert.jpg', alt: 'Eine Frau und Kinder schauen aus dem offenen Fenster eines historischen Bahnwagens.', width: 2304, height: 1296, caption: 'Unterwegs mit der Bahn' },
  { image: 'assets/Rigi6-verkleinert.jpg', alt: 'Eine Frau und Kinder blicken während der Bahnfahrt in einen sonnenbeschienenen Wald.', width: 1920, height: 1080, caption: 'Mitten im Wald' },
  { image: 'assets/Rigi3-verkleinert.jpg', alt: 'Kinder sitzen im Sonnenlicht mit Blick auf die Berglandschaft.', width: 2304, height: 1296, caption: 'Gemeinsam unterwegs' },
  { image: 'assets/Rigi11-verkleinert.jpg', alt: 'Mit einer Schaufel wird Kohle in die glühende Feuerung einer Dampflokomotive gegeben.', width: 2304, height: 1296, caption: 'Ganz nah am Detail' },
];

// Nur bestätigte Projekte; noch fehlende Inhalte bleiben als solche erkennbar.
const projects = [
  {
    ...featuredProject,
    number: '01', category: 'Interaktive Übersichtskarte',
    image: featuredProject.views[0].image, alt: featuredProject.views[0].alt,
    width: featuredProject.views[0].width, height: featuredProject.views[0].height,
  },
  {
    slug: 'rigi', number: '02', title: 'Rigi',
    category: 'Imagefilm & Fotoshooting',
    lead: 'Die Rigi in Bewegung. Und in Bildern.',
    ...rigiFilmFrames[0],
    coverCaption: 'Imagefilm / Unterwegs mit der Bahn',
    film: {
      title: 'Die Rigi in Bewegung.',
      text: 'Menschen, Natur und die Fahrt mit der Bahn. Vier Einblicke in unseren Rigi-Imagefilm.',
      video: '', // Hier später die lokale Filmdatei eintragen.
      frames: rigiFilmFrames.slice(1),
    },
    photoshoot: {
      title: 'Die Rigi im Fokus.',
      text: 'Der zweite Blick aufs Projekt: Die Bildstrecke aus dem Fotoshooting folgt.',
      images: [], // Eigene Fotos separat ergänzen; die Filmstills bleiben beim Imagefilm.
    },
  },
];
