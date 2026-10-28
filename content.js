// Inhalte für Büro, Team und Projekte.
const studio = {
  name: '1Kreativbüro',
  email: '',
};

const people = [
  {
    number: '01', name: 'Beni', role: 'Film · Web · Fotografie · Produktion',
    strengths: ['Film', 'Web', 'Fotografie'],
    description: 'Ein Multitalent: Filmer, Webkönner, Fotograf und Produzent mit Event- und Agenturerfahrung. Zudem leidenschaftlicher Volleyballer.',
    image: 'assets/Beni.png', imageClass: 'portrait-beni', width: 1028, height: 1588,
  },
  {
    number: '02', name: 'Rebecca', role: 'Gestaltung · Illustration · Web · Konzept',
    strengths: ['Ideen', 'Konzept', 'Details'],
    description: 'Ein kreativer Kopf mit vielen Ideen. Gestalterin und Illustratorin mit einem Gespür für Web und einem Auge fürs Detail, die in Konzepten denkt, schöne Dinge liebt und von Neuem fasziniert ist.',
    image: 'assets/Rebecca.png', imageClass: 'portrait-rebecca', width: 1026, height: 1590,
  },
  {
    number: '03', name: 'Mathis', role: 'Film · FPV · Storytelling · Produktion',
    strengths: ['Film', 'FPV', 'Storytelling'],
    description: 'Ein Macher: Filmer, FPV-Pilot, Abenteurer, Storyteller und Produzent mit Eventerfahrung. Er liebt es, cinematische Aufnahmen einzufangen.',
    image: 'assets/Mathis.png', imageClass: 'portrait-mathis', width: 1028, height: 1588,
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
    headline: ['Ein Berg.', 'Viele Augenblicke.'],
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
