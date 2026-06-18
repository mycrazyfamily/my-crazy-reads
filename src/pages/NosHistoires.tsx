import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HowItWorks from '@/components/HowItWorks';
import { Sparkles, Users, MessageCircle, Award, Globe, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const NosHistoires: React.FC = () => {
  const {
    isAuthenticated
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
        <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden pt-20 md:pt-24">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-mcf-primary/20 via-mcf-mint/30 to-mcf-secondary/20">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532012197267-da84d127e765?w=1200')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-4 md:px-6 text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-mcf-primary mb-6 drop-shadow-sm">
              Des histoires uniques<br />pour chaque enfant
            </h1>
            <p className="text-lg md:text-2xl text-mcf-text/90 leading-relaxed max-w-3xl mx-auto mb-10 font-light">
              Chez My Crazy Family, chaque livre est plus qu'un récit : c'est une expérience personnalisée, 
              conçue pour nourrir l'imaginaire, la confiance en soi et l'expression des enfants de 0 à 10 ans.
            </p>
            <Link to={getDestinationPath()} className="inline-flex items-center gap-2 bg-mcf-primary text-white font-bold text-lg px-12 py-5 rounded-full hover:bg-mcf-secondary transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
              <Sparkles className="w-5 h-5" />
              {getButtonText()}
            </Link>
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

            <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-5xl mx-auto">
              {/* Option 1 - Guidé */}
              <div className="relative overflow-hidden border-2 border-white/50 hover:border-white transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-2 group bg-white/95 rounded-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-mint/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                <div className="pt-10 p-8 relative z-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-20 h-20 bg-mcf-mint/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform text-4xl shadow-md">
                      🪄
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
                      🎨
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

            <div className="text-center bg-white rounded-2xl p-10 max-w-4xl mx-auto shadow-xl border-2 border-mcf-primary/20">
              <p className="text-xl md:text-2xl font-semibold text-mcf-primary italic leading-relaxed">
                Que vous ayez envie de simplicité ou de créer votre propre histoire, <br className="hidden md:block" />
                chaque mois devient une aventure personnalisée pour vous et votre enfant ✨
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 - Chaque histoire commence par vous (callout, désormais autonome) */}
        <section className="py-24 bg-gradient-to-br from-mcf-secondary/5 via-transparent to-mcf-mint/5 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-mcf-mint/10 via-mcf-secondary/10 to-mcf-primary/10 rounded-2xl p-8 md:p-12 border-2 border-mcf-mint/30 shadow-lg">
                <div className="flex justify-center mb-4">
                  <span className="bg-mcf-primary/10 p-3 rounded-xl">
                    <MessageCircle className="w-7 h-7 text-mcf-primary" />
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-mcf-primary mb-6 text-center">
                  Chaque histoire commence par vous
                </h3>
                <p className="text-lg text-mcf-text/80 mb-4 leading-relaxed">
                  Ces livres sont conçus comme des <strong className="text-mcf-primary">trames personnalisables</strong>, 
                  enrichies grâce à <strong className="text-mcf-primary">vos échanges avec My Crazy Family</strong>, 
                  et selon les éléments que <strong className="text-mcf-primary">vous choisissez de partager</strong> (âge, 
                  lien familial, souvenirs, traits de caractère…).
                </p>
                <p className="text-lg text-mcf-text/80 mb-4 leading-relaxed">
                  Vous pouvez même sortir du cadre et demander un <strong className="text-mcf-primary">scénario 
                  100 % inédit</strong> imaginé pour votre famille.
                </p>
                <p className="text-lg text-mcf-text/80 leading-relaxed flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-mcf-secondary" />
                  <em>L'aventure MCF se construit dans la durée, avec vous.</em>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5 - Ce qui rend My Crazy Family unique */}
        <section className="py-24 bg-gradient-to-br from-mcf-mint/10 via-transparent to-mcf-secondary/10 animate-fade-in">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Award className="w-10 h-10 text-mcf-primary" />
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-mcf-primary mb-4">
                Ce qui rend My Crazy Family unique
              </h2>
              <p className="text-lg text-mcf-text/70">
                Des livres d'exception, des valeurs fortes
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {/* Bloc 1 - Qualité premium */}
              <Card className="relative overflow-hidden border-2 border-mcf-mint/30 hover:border-mcf-mint transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mcf-mint to-mcf-secondary" />
                <CardContent className="pt-10 pb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-mint/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-8 h-8 text-mcf-secondary" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-mcf-primary">
                      Qualité premium
                    </h3>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80">
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-mint text-2xl">•</span>
                      <span className="text-base">Livres <strong className="text-mcf-primary">imprimés en France</strong> 🇫🇷</span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-mint text-2xl">•</span>
                      <span className="text-base"><strong className="text-mcf-primary">Bel objet</strong> pour les bibliothèques</span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-mint text-2xl">•</span>
                      <span className="text-base">Papier épais, formats adaptés, finitions haut de gamme</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Bloc 2 - Contenus engagés */}
              <Card className="relative overflow-hidden border-2 border-mcf-secondary/30 hover:border-mcf-secondary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-mcf-secondary to-mcf-primary" />
                <CardContent className="pt-10 pb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-mcf-secondary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="w-8 h-8 text-mcf-secondary" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-mcf-primary">
                      Contenus engagés
                    </h3>
                  </div>
                  <ul className="space-y-4 text-mcf-text/80">
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-secondary text-2xl">•</span>
                      <span className="text-base">Thèmes responsables : <strong className="text-mcf-primary">écologie, diversité, civilisations, émotions…</strong></span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-secondary text-2xl">•</span>
                      <span className="text-base">Outils de sensibilisation accessibles pour enfants et parents</span>
                    </li>
                    <li className="flex items-start gap-3 hover:translate-x-1 transition-transform">
                      <span className="text-mcf-secondary text-2xl">•</span>
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
                <Link
                  to={getDestinationPath()}
                  className="bg-mcf-primary hover:bg-mcf-secondary text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl text-lg shadow-lg"
                >
                  {getButtonText()}
                </Link>
              </div>

              {/* Éléments décoratifs */}
              <div className="mt-16 relative">
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-mcf-secondary/30 rounded-full animate-float"></div>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-mcf-gradient-end/40 rounded-full animate-float animation-delay-300"></div>

                <div className="relative bg-gradient-to-br from-mcf-gradient-start to-mcf-gradient-end/20 rounded-2xl p-8 md:p-12 shadow-lg">
                  <div className="text-6xl mb-6">📖✨</div>
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