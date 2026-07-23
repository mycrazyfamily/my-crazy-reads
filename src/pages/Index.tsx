// Index v1.5
// Changelog v1.5 (PERFORMANCE) : les 6 visuels de livres passent du PNG au WebP. Ils étaient tous
//   en 1024x1024 pour un affichage dans des cartes de ~400px, et pesaient 9,60 Mo au total ; ils
//   font désormais 458 Ko (800x800, WebP q90) — soit 95% de moins, pour un écart mesuré entre 39
//   et 41 dB, imperceptible à l'œil. `book-jules` est au passage rapatrié depuis /__l5e/assets-v1/
//   vers /lovable-uploads/, où se trouvent les cinq autres.
// Index v1.4
// Changelog v1.4 (C4, MOBILE) : les effets de survol des 3 cartes « spécialistes » (soulèvement
//   -translate-y-2, ombre renforcée, bordure blanche) sont désormais réservés à md:. Sur mobile,
//   un appui déclenche l'état :hover simulé par iOS/Android : la carte sautait puis redescendait à
//   chaque tap, sans que cela apporte quoi que ce soit — ces cartes ne sont pas cliquables. Les
//   effets restent identiques sur desktop, où le survol à la souris a du sens. Seules les cartes
//   « spécialistes » sont concernées ; les cartes de livres et les autres composants gardent leur
//   comportement actuel.
// Index v1.3
// Changelog v1.3 (C4 — hiérarchie de la section « spécialistes », MOBILE) : la v1.2 avait compacté
//   les 3 cartes en les rétrécissant, ce qui a inversé la hiérarchie : « Psychologues / Chercheurs
//   / Enseignants » (14px) — la preuve de crédibilité de la section — se retrouvaient dans la PLUS
//   PETITE police, sous des paragraphes explicatifs à 18px et un « Notre objectif » à 24px. L'œil
//   allait donc au texte d'accompagnement plutôt qu'à la preuve.
//   Rééquilibrage, sans toucher au contenu rédactionnel :
//     • les 3 cartes passent en LIGNES horizontales (icône à gauche, texte à droite), ce qui permet
//       de remonter le titre à 18px gras et le sous-titre à 14px sans rallonger la section ;
//     • sous-titre de section 20px → 18px (il était aussi le seul de la page à 20px : les autres
//       sections sont déjà à 18px, donc c'est aussi une mise en cohérence) ;
//     • paragraphes explicatifs 18px → 16px, « Notre objectif » 24px → 20px ;
//     • marges intérieures des deux blocs blancs réduites sur mobile (elles ajoutaient à leur poids
//       visuel) ;
//     • titre de section INCHANGÉ à 30px : les 5 titres de section de la page sont à 30px, en
//       modifier un seul créerait une incohérence au défilement.
//   Desktop strictement inchangé : toutes les valeurs d'origine sont restaurées dès md:.
// Index v1.2
// Changelog v1.2 (C4, MOBILE) : les 3 cartes « spécialistes » (Psychologues / Chercheurs /
//   Enseignants) s'empilaient en pleine largeur sur mobile — environ 500px de haut pour une dizaine
//   de mots au total, juste avant une autre série de cartes empilées. Elles passent sur 3 colonnes
//   dès le mobile (~150px au lieu de 500) : leur contenu est minuscule, il tient largement. Icône,
//   titre et sous-titre sont réduits en conséquence, et repassent aux tailles d'origine dès md:.
//   Comme pour la galerie de livres, les 3 cartes sont décrites dans un tableau `SPECIALISTS` et
//   rendues par un composant unique `SpecialistCard` — sinon les classes responsives auraient dû
//   être triplées à l'identique. Desktop strictement inchangé.
// Index v1.1
// Changelog v1.1 (C3, MOBILE) : la galerie des 6 exemples d'histoires s'empilait verticalement sur
//   mobile — six cartes carrées à la suite, soit un défilement interminable qui décourageait
//   d'atteindre la suite de la page. Elle devient un CARROUSEL sur mobile (carte suivante visible
//   sur le bord + points indicateurs), et reste une GRILLE 3 colonnes sur desktop, à l'identique.
//   Pour éviter de dupliquer 110 lignes de JSX entre les deux affichages, les 6 livres sont
//   désormais décrits dans un tableau `BOOKS` et rendus par un composant `BookCard` unique : une
//   seule source de vérité, et ajouter un livre revient à ajouter une entrée au tableau.
//   Les visuels des livres passent en `loading="lazy"` (ils sont sous la ligne de flottaison).
import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, Sparkles, Brain, GraduationCap, BookOpen, Library, Globe, Gift, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Navbar from '../components/Navbar';
import NewHero from '../components/NewHero';
import ExpertQuote from '../components/ExpertQuote';
import BenefitCard from '../components/BenefitCard';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { useAuth } from '../hooks/useAuth';

type Book = {
  id: number;
  image: string;
  title: string;
  description: string;
  tag: string;
  /** Teinte de bordure : les 3 premiers livres sont en menthe, les 3 suivants en secondaire. */
  accent: 'mint' | 'secondary';
};

const BOOKS: Book[] = [
  {
    id: 1,
    image: '/lovable-uploads/book-ambre.webp',
    title: "Les super-parents d'Ambre",
    description: 'Une histoire tendre pour valoriser le lien parent-enfant',
    tag: 'Sécurité affective',
    accent: 'mint',
  },
  {
    id: 2,
    image: '/lovable-uploads/book-gabriel.webp',
    title: 'Les aventures de Gabriel et Biscuit',
    description: 'Un lien unique entre enfant et animal pour grandir ensemble',
    tag: 'Lien enfant-animal',
    accent: 'mint',
  },
  {
    id: 3,
    image: '/lovable-uploads/book-noel.webp',
    title: 'Le Noël des petits lutins',
    description: 'Une magie de Noël où aider compte autant que recevoir',
    tag: 'Entraide et participation',
    accent: 'mint',
  },
  {
    id: 4,
    image: '/lovable-uploads/book-jules.webp',
    title: 'Jules et les protecteurs de la planète bleue',
    description: 'Une aventure écologique pour sauver la planète, ensemble',
    tag: 'Éveil à la nature & responsabilité collective',
    accent: 'secondary',
  },
  {
    id: 5,
    image: '/lovable-uploads/book-lena.webp',
    title: 'Léna et le mystère de la pyramide endormie',
    description: "Une plongée dans l'Égypte ancienne pour les petits explorateurs",
    tag: "Curiosité historique & esprit d'équipe",
    accent: 'secondary',
  },
  {
    id: 6,
    image: '/lovable-uploads/book-foret.webp',
    title: 'Les secrets de la forêt endormie',
    description: 'Réveiller la nature avec des rires et des histoires',
    tag: 'Coopération joyeuse avec la nature',
    accent: 'secondary',
  },
];

type Specialist = {
  id: number;
  Icon: React.ComponentType<{ className?: string }>;
  /** Classes Tailwind écrites en entier (pas d'interpolation) : le compilateur ne génère que les
      classes qu'il trouve littéralement dans le code source. */
  circleClass: string;
  iconClass: string;
  title: string;
  subtitle: string;
};

const SPECIALISTS: Specialist[] = [
  {
    id: 1,
    Icon: Brain,
    circleClass: 'bg-mcf-mint/20',
    iconClass: 'text-mcf-primary',
    title: 'Psychologues',
    subtitle: "de l'enfance",
  },
  {
    id: 2,
    Icon: Sparkles,
    circleClass: 'bg-mcf-secondary/20',
    iconClass: 'text-mcf-secondary',
    title: 'Chercheurs',
    subtitle: 'en développement personnel',
  },
  {
    id: 3,
    Icon: GraduationCap,
    circleClass: 'bg-mcf-primary/20',
    iconClass: 'text-mcf-primary',
    title: 'Enseignants',
    subtitle: '& auteurs jeunesse',
  },
];

/** Carte « spécialiste ».
    Mobile : une ligne horizontale pleine largeur (icône à gauche, texte à droite) — c'est ce qui
    permet d'afficher le titre en 18px gras sans faire exploser la hauteur de la section, alors
    qu'en 3 colonnes il fallait descendre à 14px pour que ça tienne.
    Desktop : bloc centré, exactement comme à l'origine (md:block + md:contents). */
const SpecialistCard: React.FC<{ specialist: Specialist }> = ({ specialist }) => {
  const { Icon } = specialist;
  return (
    <Card className="border-2 border-white/50 md:hover:border-white transition-all duration-300 md:hover:shadow-2xl md:hover:-translate-y-2 bg-white/95 backdrop-blur shadow-lg h-full">
      <CardContent className="px-5 py-4 md:px-6 md:pt-8 md:pb-8 flex flex-row items-center gap-4 md:block text-left md:text-center">
        <div className={`w-14 h-14 md:w-20 md:h-20 ${specialist.circleClass} rounded-full flex items-center justify-center shrink-0 md:mx-auto mb-0 md:mb-4 shadow-md`}>
          <Icon className={`w-7 h-7 md:w-10 md:h-10 ${specialist.iconClass}`} />
        </div>
        {/* md:contents → sur desktop ce conteneur ne produit aucune boîte : h3 et p redeviennent
            enfants directs de CardContent, donc rendu identique à l'origine. */}
        <div className="min-w-0 md:contents">
          <h3 className="text-lg md:text-xl font-bold text-mcf-primary mb-0.5 md:mb-2 leading-tight">
            {specialist.title}
          </h3>
          <p className="text-sm md:text-base text-mcf-text/70 leading-snug">
            {specialist.subtitle}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/** Carte d'un exemple de livre — utilisée à l'identique par la grille desktop et le carrousel mobile. */
const BookCard: React.FC<{ book: Book }> = ({ book }) => (
  <Card
    className={`border-2 ${
      book.accent === 'mint'
        ? 'border-mcf-mint/20 hover:border-mcf-mint'
        : 'border-mcf-secondary/20 hover:border-mcf-secondary'
    } transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group overflow-hidden h-full`}
  >
    <div className="aspect-square overflow-hidden">
      <img
        src={book.image}
        alt={book.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <CardContent className="pt-6 pb-8">
      <h3 className="text-xl font-bold text-mcf-primary mb-3">{book.title}</h3>
      <p className="text-mcf-text/80 mb-3 leading-relaxed">{book.description}</p>
      <p className="text-sm text-mcf-secondary font-semibold">{book.tag}</p>
    </CardContent>
  </Card>
);

const NewIndex: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // C3 — suivi de position du carrousel mobile des exemples de livres.
  // `any` volontaire : selon la version de components/ui/carousel.tsx, le type CarouselApi n'est
  // pas toujours exporté, et un import de type manquant casserait le build. Si `setApi` n'était
  // pas supporté, booksCount resterait à 0 et les points ne s'afficheraient simplement pas.
  const [booksApi, setBooksApi] = React.useState<any>(null);
  const [booksCurrent, setBooksCurrent] = React.useState(0);
  const [booksCount, setBooksCount] = React.useState(0);

  React.useEffect(() => {
    if (!booksApi) return;
    setBooksCount(booksApi.scrollSnapList().length);
    setBooksCurrent(booksApi.selectedScrollSnap());
    const onSelect = () => setBooksCurrent(booksApi.selectedScrollSnap());
    booksApi.on('select', onSelect);
    return () => {
      booksApi.off?.('select', onSelect);
    };
  }, [booksApi]);
  const location = useLocation();

  useEffect(() => {
    const st = location.state as { scrollTo?: string } | null;
    if (!st?.scrollTo) {
      window.scrollTo(0, 0);
    }
    document.body.classList.add('bg-white');

    return () => {
      document.body.classList.remove('bg-white');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll vers une section après navigation inter-pages (ex: Footer "Nos Histoires").
  // Dormant tant qu'aucune navigation ne passe location.state.scrollTo.
  useEffect(() => {
    const st = location.state as { scrollTo?: string } | null;
    if (st?.scrollTo) {
      const id = st.scrollTo;
      const timer = setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // Détermine la destination selon l'état de connexion
  const getDestinationPath = () => {
    return isAuthenticated ? '/espace-famille' : '/creer-profil-enfant';
  };

  // Détermine le texte du bouton selon l'état de connexion
  const getButtonText = () => {
    return isAuthenticated ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
  };

  const benefits = [
    {
      title: "Une aventure magique chaque mois",
      description: "Des histoires enchanteresses qui nourrissent l'imagination de votre enfant et renforcent votre lien familial.",
      icon: <BookOpen className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-100"
    },
    {
      title: "Des livres imprimés de qualité à garder",
      description: "Des ouvrages soigneusement imprimés, conçus pour résister au temps et devenir de précieux souvenirs familiaux.",
      icon: <Library className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-200"
    },
    {
      title: "Des thèmes essentiels et éducatifs",
      description: "Découvrez des aventures abordant l'écologie, les émotions, la culture et bien d'autres sujets important pour l'épanouissement de votre enfant.",
      icon: <Globe className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-300"
    },
    {
      title: "Un cadeau touchant et original",
      description: "Offrez une expérience unique qui se renouvelle chaque mois et crée des moments privilégiés en famille.",
      icon: <Gift className="w-12 h-12 text-mcf-primary" />,
      delay: "animation-delay-400"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <NewHero />

        {/* Citation Experte */}
        <ExpertQuote />

        {/* Quelques exemples d'histoires personnalisées (6 livres) — section ancrable */}
        <section id="nos-histoires" className="py-24 bg-gradient-to-br from-mcf-secondary/5 via-transparent to-mcf-mint/5 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4 flex items-center justify-center gap-3">
                <Sparkles className="w-10 h-10" />
                Quelques exemples d'histoires personnalisées
              </h2>
              <p className="text-xl text-mcf-text/70 mb-6">
                🇫🇷 <em>Made in France</em>
              </p>
            </div>

            {/* Galerie de livres — DESKTOP : grille 3 colonnes, strictement identique à avant. */}
            <div className="hidden md:grid md:grid-cols-3 gap-8 mb-16">
              {BOOKS.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Galerie de livres — MOBILE (C3) : carrousel. La carte suivante dépasse volontairement
                sur le bord droit (basis-[85%]) : c'est le signal le plus lisible qu'il y a du
                contenu à faire défiler, complété par les points ci-dessous. */}
            <div className="md:hidden mb-12">
              <Carousel
                setApi={setBooksApi}
                opts={{ align: 'start', loop: true }}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  {BOOKS.map((book) => (
                    <CarouselItem key={book.id} className="pl-2 basis-[85%]">
                      <BookCard book={book} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {booksCount > 1 && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  {Array.from({ length: booksCount }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => booksApi?.scrollTo(index)}
                      aria-label={`Aller à l'exemple ${index + 1}`}
                      aria-current={index === booksCurrent}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === booksCurrent ? 'w-6 bg-mcf-primary' : 'w-2 bg-mcf-primary/30'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Une collection pensée par des spécialistes de l'enfance */}
        <section className="py-24 bg-gradient-to-br from-mcf-primary/95 via-mcf-mint/90 to-mcf-secondary/95 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Une collection pensée par des spécialistes de l'enfance
              </h2>
              <p className="text-lg md:text-2xl text-white/95 max-w-2xl mx-auto font-light drop-shadow-md">
                Des histoires élaborées avec rigueur et passion
              </p>
            </div>

            {/* C4 v1.3 : une ligne par spécialiste sur mobile (voir SpecialistCard), 3 colonnes
                dès md: comme à l'origine. */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-8 mb-10 md:mb-12">
              {SPECIALISTS.map((specialist) => (
                <SpecialistCard key={specialist.id} specialist={specialist} />
              ))}
            </div>

            <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 text-center">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 md:p-12 space-y-4 md:space-y-6 shadow-lg border border-white/50">
                <p className="text-base md:text-xl text-mcf-text/90 leading-relaxed">
                  Chaque histoire suit un <strong className="text-mcf-primary font-semibold">tronc narratif structuré</strong>,
                  conçu avec des spécialistes de l'enfance et spécifiquement adapté à chaque tranche d'âge de 0 à 10 ans.
                </p>
                <p className="text-base md:text-xl text-mcf-text/90 leading-relaxed">
                  Elles sont relues et enrichies par des <strong className="text-mcf-primary font-semibold">auteurs jeunesse</strong> pour
                  assurer un ton et un rythme parfaitement adaptés.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-10 shadow-xl border-2 border-mcf-primary/20">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-mcf-mint/20 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-mcf-primary" />
                  </div>
                  <p className="text-xl md:text-2xl font-bold text-mcf-primary">
                    Notre objectif
                  </p>
                </div>
                <p className="text-base md:text-xl text-mcf-text/90 leading-relaxed">
                  Renforcer la confiance, stimuler la curiosité, encourager l'expression de soi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pourquoi choisir MCF */}
        <section className="py-24 bg-gradient-to-br from-mcf-secondary/5 via-transparent to-mcf-mint/5 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Heart className="w-10 h-10 text-mcf-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4">
                Pourquoi choisir My Crazy Family ?
              </h2>
              <p className="text-lg text-mcf-text/70">
                Un abonnement qui grandit avec votre famille
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
              {benefits.map((benefit, index) => (
                <BenefitCard
                  key={index}
                  title={benefit.title}
                  description={benefit.description}
                  icon={benefit.icon}
                  delay={benefit.delay}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-24 bg-gradient-to-br from-mcf-mint via-mcf-primary to-mcf-secondary animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ils ont adopté My Crazy Family
              </h2>
              <p className="text-lg text-white/90">
                Les témoignages de nos familles heureuses
              </p>
            </div>
            <Testimonials />
          </div>
        </section>

        {/* CTA final - Prêt à créer des souvenirs magiques */}
        <section className="py-24 bg-white animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-5xl">
            <div className="relative overflow-hidden bg-gradient-to-br from-mcf-primary via-mcf-secondary to-mcf-mint rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32 blur-3xl" />
              <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mb-40 blur-3xl" />

              <div className="relative z-10">
                <Sparkles className="w-12 h-12 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  Prêt à créer des souvenirs magiques ?
                </h2>
                <p className="text-lg md:text-2xl mb-10 opacity-95 max-w-3xl mx-auto font-light leading-relaxed">
                  Rejoignez les familles qui offrent à leurs enfants des histoires uniques,
                  créées rien que pour eux.
                </p>
                {/* Anti-flash A3 : tant que l'auth n'est pas résolue (isLoading), on affiche un
                    placeholder non-cliquable au lieu du bouton — sinon « Commencer l'aventure »
                    flashe pour un utilisateur connecté et un clic pendant ce court instant le
                    renvoie vers le login (via le RouteGuard de /creer-profil-enfant). */}
                {isLoading ? (
                  <span className="inline-flex items-center gap-3 bg-white text-mcf-primary font-bold text-lg md:text-xl px-12 py-5 rounded-full shadow-2xl opacity-70 cursor-default">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Chargement…
                  </span>
                ) : (
                  <Link to={getDestinationPath()} className="inline-flex items-center gap-3 bg-white text-mcf-primary font-bold text-lg md:text-xl px-12 py-5 rounded-full hover:bg-mcf-mint hover:text-white transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl">
                    <Heart className="w-5 h-5" />
                    {getButtonText()}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default NewIndex;
