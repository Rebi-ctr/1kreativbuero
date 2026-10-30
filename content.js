// Inhalte für Büro, Team und Projekte.
const studio = {
  name: '1Kreativbüro',
  email: 'team@1kreativbuero.ch',
  // Hier nur die öffentliche Formular-Adresse und öffentliche Formularfelder eintragen.
  contactForm: { endpoint: 'api/contact.php', native: true, fields: {} },
};

const people = [
  {
    number: '01', name: 'Beni', email: 'beni@1kreativbuero.ch', role: 'Film · Web · Fotografie · Produktion',
    strengths: ['Film', 'Web', 'Fotografie'],
    description: 'Ein Multitalent: Filmer, Webkönner, Fotograf und Produzent mit Event- und Agenturerfahrung. Zudem leidenschaftlicher Volleyballer.',
    image: 'assets/Beni-640.webp', srcset: 'assets/Beni-320.webp 320w, assets/Beni-640.webp 640w, assets/Beni-1028.webp 1028w', imageClass: 'portrait-beni', width: 1028, height: 1588,
  },
  {
    number: '02', name: 'Rebecca', email: 'rebecca@1kreativbuero.ch', role: 'Gestaltung · Illustration · Web · Konzept',
    strengths: ['Ideen', 'Konzept', 'Details'],
    description: 'Ein kreativer Kopf mit vielen Ideen. Gestalterin und Illustratorin mit einem Gespür für Web und einem Auge fürs Detail, die in Konzepten denkt, schöne Dinge liebt und von Neuem fasziniert ist.',
    image: 'assets/Rebecca-640.webp', srcset: 'assets/Rebecca-320.webp 320w, assets/Rebecca-640.webp 640w, assets/Rebecca-1026.webp 1026w', imageClass: 'portrait-rebecca', width: 1026, height: 1590,
  },
  {
    number: '03', name: 'Mathis', email: 'mathis@1kreativbuero.ch', role: 'Film · FPV · Storytelling · Produktion',
    strengths: ['Film', 'FPV', 'Storytelling'],
    description: 'Ein Macher: Filmer, FPV-Pilot, Abenteurer, Storyteller und Produzent mit Eventerfahrung. Er liebt es, cinematische Aufnahmen einzufangen.',
    image: 'assets/Mathis-640.webp', srcset: 'assets/Mathis-320.webp 320w, assets/Mathis-640.webp 640w, assets/Mathis-1028.webp 1028w', imageClass: 'portrait-mathis', width: 1028, height: 1588,
  },
];

// Das Highlight nutzt dieselben Projektdaten wie die Übersicht.
const featuredProject = {
  slug: 'wiriehorn',
  title: 'Wiriehorn',
  lead: 'Das Wiriehorn im Sommer und im Winter.',
  views: [
    { season: 'Sommer', image: 'assets/Wiriehorn_Sommer_Test.webp', srcset: 'assets/Wiriehorn_Sommer_Test-800.webp 800w, assets/Wiriehorn_Sommer_Test-1600.webp 1600w, assets/Wiriehorn_Sommer_Test.webp 2464w', alt: 'Illustrierte Sommeransicht des Wiriehorns mit Wanderwegen und Bergbahnen.', width: 2464, height: 1336 },
    { season: 'Winter', image: 'assets/Wiriehorn_Winter_Test.webp', srcset: 'assets/Wiriehorn_Winter_Test-800.webp 800w, assets/Wiriehorn_Winter_Test-1600.webp 1600w, assets/Wiriehorn_Winter_Test.webp 2461w', alt: 'Illustrierte Winteransicht des Wiriehorns mit Skipisten und verschneiten Bergen.', width: 2461, height: 1333 },
  ],
};

// Filmstills und Fotoshooting bleiben als eigene Bildstrecken im Rigi-Projekt.
const rigiFilmFrames = [
  { image: 'assets/projects/rigi/Rigi8-verkleinert.jpg', alt: 'Eine Frau und Kinder schauen aus dem offenen Fenster eines historischen Bahnwagens.', width: 2304, height: 1296, caption: 'Unterwegs mit der Bahn' },
  { image: 'assets/projects/rigi/Rigi6-verkleinert.jpg', alt: 'Eine Frau und Kinder blicken während der Bahnfahrt in einen sonnenbeschienenen Wald.', width: 1920, height: 1080, caption: 'Mitten im Wald' },
  { image: 'assets/projects/rigi/Rigi3-verkleinert.jpg', alt: 'Kinder sitzen im Sonnenlicht mit Blick auf die Berglandschaft.', width: 2304, height: 1296, caption: 'Gemeinsam unterwegs' },
  { image: 'assets/projects/rigi/Rigi11-verkleinert.jpg', alt: 'Mit einer Schaufel wird Kohle in die glühende Feuerung einer Dampflokomotive gegeben.', width: 2304, height: 1296, caption: 'Ganz nah am Detail' },
];

const rigiPhotoshootImages = [
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-26.webp', alt: 'Spielplatz in Rigi Kaltbad mit Holzturm, Rutsche und Schaukeln vor dem Bergpanorama.', width: 3000, height: 2000 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-02.webp', alt: 'Eine Frau und zwei Kinder betrachten gemeinsam eine Karte.', width: 3000, height: 2000 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-10.webp', alt: 'Ein Kind sitzt auf einem Holzstamm und lacht mit einer Frau neben dem Spielgerät.', width: 3000, height: 2000 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-13.webp', alt: 'Drei Kinder schauen über ein Geländer zwischen Gräsern und Sträuchern.', width: 3000, height: 2000 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-14.webp', alt: 'Kinder rutschen gemeinsam eine rote Rutsche hinunter, aufgenommen vom unteren Ende der Rutsche.', width: 3000, height: 2000 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-18.webp', alt: 'Eine Frau hält ein Kind auf dem Arm vor der Berglandschaft bei Rigi Kaltbad.', width: 3000, height: 1996 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-22.webp', alt: 'Ein Kind schaukelt hoch in die Luft, während ein anderes daneben steht.', width: 3000, height: 2000 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-28.webp', alt: 'Zwei Kinder klettern in einem Seilnetz, fotografiert durch eine runde Öffnung im Holzturm.', width: 3000, height: 2000 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-39.webp', alt: 'Kinder klettern die Holzwand eines Spielturms hinauf, aus tiefer Perspektive aufgenommen.', width: 3000, height: 1996 },
  { image: 'assets/projects/rigi/0710-Familien-Fotoshooting-Rigi-46.webp', alt: 'Mehrere Kinder schaukeln gemeinsam auf einer grossen Nestschaukel.', width: 3000, height: 2000 },
];

// Nur bestätigte Projekte; noch fehlende Inhalte bleiben als solche erkennbar.
const projects = [
  {
    ...featuredProject,
    number: '01', category: 'Interaktive Übersichtskarte',
    image: featuredProject.views[0].image, srcset: featuredProject.views[0].srcset, alt: featuredProject.views[0].alt,
    width: featuredProject.views[0].width, height: featuredProject.views[0].height,
  },
  {
    slug: 'rigi', number: '02', title: 'Rigi',
    headline: ['Ein Berg.', 'Viele Augenblicke.'],
    category: 'Imagefilm & Fotoshooting',
    lead: 'Ein Imagefilm von unterwegs und neue Bilder für das Familienangebot in Rigi Kaltbad.',
    ...rigiPhotoshootImages.find(view => view.image.endsWith('0710-Familien-Fotoshooting-Rigi-28.webp')),
    coverCaption: 'Fotoshooting / Familienzeit in Rigi Kaltbad',
    film: {
      title: 'Die Rigi in Bewegung.',
      text: 'Menschen, Natur und die Fahrt mit der Bahn. Vier Einblicke in unseren Rigi-Imagefilm.',
      video: '', // Hier später die lokale Filmdatei eintragen.
      frames: rigiFilmFrames,
    },
    photoshoot: {
      title: 'Familienzeit im Bild.',
      text: 'Für Rigi Kaltbad sollte neues Bildmaterial entstehen, das die Spielplätze und das Familienangebot sichtbar macht. Dafür haben wir zwei Familien für das Shooting organisiert und beim Spielen und Entdecken begleitet. Wir wechselten zwischen nahen Momenten, ungewöhnlichen Blickwinkeln und weiten Ansichten der Spielplätze in ihrer Umgebung. So entstand eine abwechslungsreiche Bildstrecke, die zeigt, was Familien auf der Rigi gemeinsam erleben können.',
      images: rigiPhotoshootImages,
    },
  },
];
