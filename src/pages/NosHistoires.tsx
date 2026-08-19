// NosHistoires v1.6
// Changelog v1.6 (chantier icones IA, lot 1) : retrait de Sparkles ET de Wand2. Wand2 est un
//   ALIAS de WandSparkles dans lucide-react 0.462 : son glyphe contient trois etoiles a quatre
//   branches, c'est exactement le motif que l'on cherche a retirer.
//   [1] bouton d'appel a l'action du hero -> Heart, pour s'aligner sur le meme bouton
//       « Commencer l'aventure » de la page d'accueil, qui porte deja un Heart.
//   [2] mode « guide » -> Compass. Le sens porte est l'accompagnement, et la boussole contraste
//       proprement avec la Palette du mode « creatif » juste a cote.
//   [3] « L'aventure MCF se construit dans la duree, avec vous » -> Heart. Sens porte :
//       la relation, l'affectif.
//   [4] bloc « Qualite premium » -> BookOpen. Les trois puces parlent d'impression, de papier et
//       de finitions : le sens porte est l'objet livre lui-meme.
// NosHistoires v1.5
// Changelog v1.5 (section 3) : SUPPRESSION de la phrase de conclusion « Que vous ayez envie de
//   simplicité ou de créer votre propre histoire, chaque mois devient une aventure personnalisée
//   pour vous et votre enfant », allégée en v1.4 puis retirée ici. Motif : elle ne faisait que
//   paraphraser les deux sous-titres situés juste au-dessus — « Pour ceux qui préfèrent la
//   simplicité » (mode guidé) et « Pour ceux qui veulent façonner l'histoire » (mode créatif) —
//   tandis que sa seconde moitié reprenait la promesse générale déjà énoncée dans le hero de la
//   page et en section 6. Aucun mot n'y travaillait.
//   Conséquence à ne pas manquer : la grille des deux cartes portait `mb-12`. Devenue le dernier
//   enfant du conteneur, elle aurait laissé 48px de vide mort s'ajoutant aux 96px du `py-24` de
//   la section, soit un trou de 144px avant la section suivante. `mb-12` est donc retiré : c'est
//   le `py-24` de la section qui assure seul l'espacement bas, comme dans les sections 5 et 6.
//   Cette version contient l'intégralité des changements de la v1.4 : elle peut être commitée
//   directement, que la v1.4 ait été déployée ou non.
// NosHistoires v1.4
// Changelog v1.4 (allègement des sections 3-fin et 4) — MOBILE ET DESKTOP.
//   Ces deux blocs pesaient plus lourd que le reste de la page et captaient l'œil au détriment
//   des sections voisines. Le problème n'était pas seulement leur taille :
//   BLOC A — la phrase de conclusion « Que vous ayez envie de simplicité… » était posée dans une
//     carte blanche arrondie à ombre XL, sur un fond de section où figurent déjà DEUX cartes
//     blanches (les deux modes). Elle se lisait donc comme un 3e mode. La carte est supprimée :
//     le texte passe en blanc à même le dégradé, avec le drop-shadow déjà utilisé par le h2 et le
//     sous-titre de la section. p-10/shadow-xl/border-2 retirés, texte text-xl→text-lg (md: 2xl→xl),
//     font-semibold→font-medium. Hauteur ~160px→~60px en desktop, ~240px→~110px en mobile.
//   BLOC B (section 4) — reproduisait le patron d'en-tête des sections 3/5/6 (badge d'icône
//     centré, puis titre centré) et se présentait donc comme une section majeure, alors que c'est
//     un complément. L'icône passe EN LIGNE à gauche du titre. py-24→py-16, carte p-8/md:p-12→
//     p-6/md:p-8, badge p-3+icône 28px→p-2+icône 20px, titre 2xl/md:3xl→xl/md:2xl,
//     shadow-lg→shadow-sm, border-2→border, marges mb-6/mb-4→mb-4/mb-3.
//     Corps de texte text-lg (18px) → text-base (16px) : c'est la taille employée partout
//     ailleurs sur la page, le 18px était une exception. Hauteur ~460px→~270px en desktop.
//   Corrections embarquées :
//   (1) L'icône Sparkles du dernier paragraphe n'avait pas de `shrink-0` : elle était écrasée et
//       tassée en bas à gauche dès que le texte passait à deux lignes (visible sur mobile).
//       `shrink-0` + `mt-0.5`, et `items-center`→`items-start` pour l'aligner sur la 1re ligne.
//   (2) `max-w-7xl` retiré du container de la section 4 : sans effet, l'enfant immédiat est en
//       max-w-4xl.
//   (3) Le titre de la section 4 était un <h3> alors que la section n'avait aucun <h2> —
//       hiérarchie de titres cassée (SEO, lecteurs d'écran). Passé en <h2>. Sa taille visuelle
//       reste volontairement inférieure à celle des autres h2 : le niveau sémantique n'impose pas
//       la taille.
//   (4) `text-left` ajouté sur la carte de la section 4. Conséquence directe de (3) : le titre
//       étant désormais aligné à gauche, les paragraphes ne pouvaient plus rester centrés par
//       héritage du `#root { text-align: center }` d'App.css. Même correctif que la v1.1 sur les
//       CardContent de la section 5. À retirer lors du nettoyage d'App.css.
//   Aucune autre section touchée. HowItWorks (section 2) n'est pas modifié.
// NosHistoires v1.3
// Changelog v1.3 (hero) : hauteur fixe → hauteur MINIMALE. La section était en h-[70vh] md:h-[80vh]
//   avec overflow-hidden : sur un viewport court, 70% de la hauteur ne suffit pas au contenu
//   (titre sur 3 lignes + paragraphe sur 5 lignes + bouton), qui se retrouvait rogné en haut ET en
//   bas. Constaté dans le cadre de prévisualisation Lovable, mais le défaut est réel : il se
//   produit aussi sur un petit téléphone, en orientation paysage, ou si l'utilisateur a agrandi la
//   taille de texte dans ses réglages d'accessibilité. Avec min-h-, la section conserve sa hauteur
//   d'origine quand le contenu tient, et s'étend sinon. Ajout d'une marge basse pour que le bouton
//   ne colle pas au bord dans ce cas.
// NosHistoires v1.2
// Changelog v1.2 (hero) : suppression du calque d'image posé sur le dégradé du hero. Il chargeait
//   une photo Unsplash externe, affichée à 30% d'opacité en mix-blend-overlay : le résultat ne
//   ressemblait ni à une image ni à un fond propre, mais à des formes fantômes qu'on prend pour un
//   défaut d'affichage (constaté sur mobile ET desktop). Trois raisons de la retirer plutôt que de
//   l'ajuster : (a) le visuel était un cliché de banque d'images sans rapport avec le produit ;
//   (b) il créait une dépendance à un domaine tiers — si Unsplash modifie ou retire la photo, le
//   fond casse sans prévenir ; (c) chaque visite transmettait l'IP du visiteur à Unsplash, ce qui
//   n'est pas souhaitable au vu de la politique de confidentialité du site. Le dégradé de la
//   charte est conservé tel quel.
// NosHistoires v1.1
// Changelog v1.1 (C6, section « Ce qui rend My Crazy Family unique ») :
//   (a) ALIGNEMENT — le texte des deux listes héritait d'un centrage venant du composant Card
//       (la section 3, qui utilise un <div> simple et non <CardContent>, ne souffrait pas du
//       problème). Effet : sur une ligne courte rien ne se voyait, mais dès qu'un élément passait
//       à la ligne, la puce restait à gauche et le texte se centrait — d'où la puce isolée suivie
//       d'un grand vide. `text-left` est désormais forcé sur les deux CardContent : correction
//       locale, plutôt que de modifier le composant Card partagé par tout le site.
//   (b) PUCES — le caractère « • » en text-2xl (interligne 32px) face à un texte en text-base
//       (interligne 24px) ne pouvait pas s'aligner proprement. Remplacé par une vraie pastille
//       ronde de 6px, positionnée au centre de la première ligne de texte.
//   (c) SURVOL — les effets de survol (soulèvement de carte, ombre, agrandissement d'icône,
//       décalage des lignes) passent en md: uniquement : sur mobile un appui déclenchait le :hover
//       simulé et faisait sauter la carte, sans utilité puisqu'elle n'est pas cliquable.
//   Desktop strictement inchangé.
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';
import { Heart, BookOpen, Compass, Users, MessageCircle, Award, Globe, Zap, Palette, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const NosHistoires: React.FC = () => {
  const {
    isAuthenticated,
    isLoading
  } = useAuth();
  const getDestinationPath = () => {
    return isAuthenticated ? '/espace-famille' : '/creer-profil-enfant';
  };
  const getButtonText = () => {
    return isAuthenticated ? 'Continuer l\'aventure' : 'Commencer l\'aventure';
  };
  return <div className="min-h-screen bg-background">
      <Navbar />

      <main className="relative">
        {/* SECTION 1 - Hero Section */}
        <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden pt-20 md:pt-24 pb-12 md:pb-16">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-mcf-primary/20 via-mcf-mint/30 to-mcf-secondary/20" />

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 md:px-6 text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-mcf-primary mb-6 drop-shadow-sm">
              Des histoires uniques<br />pour chaque enfant
            </h1>
            <p className="text-lg md:text-2xl text-mcf-text/90 leading-relaxed max-w-3xl mx-auto mb-10 font-light">
              Chez My Crazy Family, chaque livre est plus qu'un récit : c'est une expérience personnalisée, 
              conçue pour nourrir l'imaginaire, la confiance en soi et l'expression des enfants de 0 à 10 ans.
            </p>
            {/* Anti-flash A3 : placeholder tant que l'auth n'est pas résolue (voir NewHero/Index). */}
            {isLoading ? (
              <span className="inline-flex items-center gap-2 bg-mcf-primary text-white font-bold text-lg px-12 py-5 rounded-full shadow-xl opacity-70 cursor-default">
                <Loader2 className="w-5 h-5 animate-spin" />
                Chargement…
              </span>
            ) : (
              <Link to={getDestinationPath()} className="inline-flex items-center gap-2 bg-mcf-primary text-white font-bold text-lg px-12 py-5 rounded-full hover:bg-mcf-secondary transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                <Heart className="w-5 h-5" />
                {getButtonText()}
              </Link>
            )}
          </div>
        </section>

        {/* SECTION 2 - Comment ça marche (3 étapes) — provient de l'accueil */}
        <HowItWorks />

        {/* SECTION 3 - Deux façons de vivre l'aventure — provient de l'accueil */}
        <section className="py-24 bg-gradient-to-br from-mcf-primary/95 via-mcf-mint/90 to-mcf-secondary/95 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Users className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                Deux façons de vivre l'aventure
              </h2>
              <p className="text-xl md:text-2xl text-white/95 font-light drop-shadow-md">
                Choisissez le niveau d'implication qui vous convient
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Option 1 - Guidé */}
              <div className="relative overflow-hidden border-2 border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 group bg-white/95 rounded-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-mint/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="pt-10 p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-mcf-mint/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-4xl shadow-md">
                      <Compass className="w-10 h-10 text-mcf-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-mcf-primary">
                        Mode "guidé"
                      </h3>
                      <p className="text-base text-mcf-secondary/90 font-semibold mt-1">
                        Pour ceux qui préfèrent la simplicité
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80 mt-6">
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-mint text-xl mt-0.5">✓</span>
                      <span className="text-base">Vous suivez le thème proposé par My Crazy Family et nos spécialistes de l'enfance chaque mois</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-mint text-xl mt-0.5">✓</span>
                      <span className="text-base">Le livre reste 100 % personnalisé (prénoms, proches, lieux, animaux…)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-mint text-xl mt-0.5">✓</span>
                      <span className="text-base">Vous pouvez ajouter des détails ou simplement vous laisser porter</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Option 2 - Créatif */}
              <div className="relative overflow-hidden border-2 border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 group bg-white/95 rounded-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-secondary/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="pt-10 p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-mcf-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-4xl shadow-md">
                      <Palette className="w-10 h-10 text-mcf-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-mcf-primary">
                        Mode "créatif"
                      </h3>
                      <p className="text-base text-mcf-secondary/90 font-semibold mt-1">
                        Pour ceux qui veulent façonner l'histoire
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80 mt-6">
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-secondary text-xl mt-0.5">✓</span>
                      <span className="text-base">Vous proposez un thème ou une idée totalement différente chaque mois où vous le souhaitez</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-mcf-secondary text-xl mt-0.5">✓</span>
                      <span className="text-base">L'équipe crée un livre personnalisé sur mesure, selon votre demande</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 - Chaque histoire commence par vous (callout, désormais autonome) */}
        <section className="py-16 bg-gradient-to-br from-mcf-secondary/5 via-transparent to-mcf-mint/5 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              {/* text-left : sans lui, les paragraphes héritent du `#root { text-align: center }`
                  d'App.css et se centrent — même correctif que la v1.1 sur les CardContent
                  de la section 5. À retirer le jour où App.css sera nettoyé. */}
              <div className="bg-gradient-to-br from-mcf-mint/10 via-mcf-secondary/10 to-mcf-primary/10 rounded-2xl p-6 md:p-8 border border-mcf-mint/30 shadow-sm text-left">
                {/* Icône EN LIGNE avec le titre, et non empilée au-dessus : empilée + centrée,
                    elle reproduisait le patron d'en-tête des sections 3/5/6, ce qui donnait à ce
                    complément le rang visuel d'une section majeure. */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-mcf-primary/10 p-2 rounded-xl shrink-0">
                    <MessageCircle className="w-5 h-5 text-mcf-primary" />
                  </span>
                  <h2 className="text-xl md:text-2xl font-bold text-mcf-primary">
                    Chaque histoire commence par vous
                  </h2>
                </div>
                <p className="text-base text-mcf-text/80 mb-3 leading-relaxed">
                  Ces livres sont conçus comme des <strong className="text-mcf-primary">trames personnalisables</strong>, 
                  enrichies grâce à <strong className="text-mcf-primary">vos échanges avec My Crazy Family</strong>, 
                  et selon les éléments que <strong className="text-mcf-primary">vous choisissez de partager</strong> (âge, 
                  lien familial, souvenirs, traits de caractère…).
                </p>
                <p className="text-base text-mcf-text/80 mb-3 leading-relaxed">
                  Vous pouvez même sortir du cadre et demander un <strong className="text-mcf-primary">scénario 
                  100 % inédit</strong> imaginé pour votre famille.
                </p>
                <p className="text-base text-mcf-text/80 leading-relaxed flex items-start gap-2">
                  <Heart className="w-5 h-5 text-mcf-secondary shrink-0 mt-0.5" />
                  <em>L'aventure MCF se construit dans la durée, avec vous.</em>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 - Ce qui rend My Crazy Family unique */}
        <section className="py-24 bg-gradient-to-br from-mcf-primary/95 via-mcf-mint/90 to-mcf-secondary/95 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="w-10 h-10 text-white drop-shadow-md" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
                Ce qui rend My Crazy Family unique
              </h2>
              <p className="text-lg text-white/95">
                Des livres d'exception, des valeurs fortes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Bloc 1 - Qualité premium */}
              <Card className="relative overflow-hidden border-2 border-mcf-mint/30 md:hover:border-mcf-mint transition-all duration-300 md:hover:shadow-2xl md:hover:-translate-y-2 group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mcf-mint to-mcf-secondary" />
                <CardContent className="pt-10 pb-8 text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-mint/50 rounded-2xl flex items-center justify-center md:group-hover:scale-110 transition-transform">
                      <BookOpen className="w-8 h-8 text-mcf-secondary" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-mcf-primary">
                      Qualité premium
                    </h3>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80">
                    <li className="flex items-start gap-3 md:hover:translate-x-1 transition-transform">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mcf-mint shrink-0" aria-hidden="true" />
                      <span className="text-base">Livres <strong className="text-mcf-primary">imprimés en France</strong> 🇫🇷</span>
                    </li>
                    <li className="flex items-start gap-3 md:hover:translate-x-1 transition-transform">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mcf-mint shrink-0" aria-hidden="true" />
                      <span className="text-base"><strong className="text-mcf-primary">Bel objet</strong> pour les bibliothèques</span>
                    </li>
                    <li className="flex items-start gap-3 md:hover:translate-x-1 transition-transform">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mcf-mint shrink-0" aria-hidden="true" />
                      <span className="text-base">Papier épais, formats adaptés, finitions haut de gamme</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Bloc 2 - Contenus engagés */}
              <Card className="relative overflow-hidden border-2 border-mcf-secondary/30 md:hover:border-mcf-secondary transition-all duration-300 md:hover:shadow-2xl md:hover:-translate-y-2 group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mcf-secondary to-mcf-primary" />
                <CardContent className="pt-10 pb-8 text-left">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-secondary/20 rounded-2xl flex items-center justify-center md:group-hover:scale-110 transition-transform">
                      <Globe className="w-8 h-8 text-mcf-secondary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-mcf-primary">
                      Contenus engagés
                    </h3>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80">
                    <li className="flex items-start gap-3 md:hover:translate-x-1 transition-transform">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                      <span className="text-base">Thèmes responsables : <strong className="text-mcf-primary">écologie, diversité, civilisations, émotions…</strong></span>
                    </li>
                    <li className="flex items-start gap-3 md:hover:translate-x-1 transition-transform">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                      <span className="text-base">Outils de sensibilisation accessibles pour enfants et parents</span>
                    </li>
                    <li className="flex items-start gap-3 md:hover:translate-x-1 transition-transform">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-mcf-secondary shrink-0" aria-hidden="true" />
                      <span className="text-base"><strong className="text-mcf-primary">Morale et résumé pédagogique</strong> à la fin de chaque histoire</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION 6 - Profitez de l'expérience MCF — provient de l'accueil */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Zap className="w-10 h-10 text-mcf-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-8">
                Profitez de l'expérience MCF
              </h2>
              <p className="text-lg md:text-xl text-mcf-text/70 max-w-3xl mx-auto mb-12">
                Abonnez votre enfant et recevez chaque mois son livre personnalisé.
              </p>

              <div className="flex justify-center">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2 bg-mcf-primary text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg opacity-70 cursor-default">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Chargement…
                  </span>
                ) : (
                  <Link
                    to={getDestinationPath()}
                    className="bg-mcf-primary hover:bg-mcf-secondary text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
                  >
                    {getButtonText()}
                  </Link>
                )}
              </div>

              {/* Éléments décoratifs */}
              <div className="mt-16 relative">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-mcf-secondary/30 rounded-full animate-float"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-mcf-gradient-end/40 rounded-full animate-float animation-delay-300"></div>

                <div className="relative bg-gradient-to-br from-mcf-gradient-start to-mcf-gradient-end/20 rounded-2xl p-8 md:p-12 shadow-lg">
                  <p className="text-xl md:text-2xl font-medium text-mcf-text">
                    Embarquez dans cette aventure familiale exceptionnelle !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};
export default NosHistoires;
