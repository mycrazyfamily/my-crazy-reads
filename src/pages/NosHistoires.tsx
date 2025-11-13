import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Book, Heart, Sparkles, Users, Award, MessageCircle } from 'lucide-react';
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
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          
          {/* SECTION 1 - Introduction */}
          <section className="mb-20 text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-mcf-primary mb-6">
              Des histoires uniques pour chaque enfant
            </h1>
            <p className="text-lg md:text-xl text-mcf-text/80 leading-relaxed max-w-3xl mx-auto">
              Chez My Crazy Family, chaque livre est plus qu'un récit : c'est une expérience personnalisée, conçue pour nourrir l'imaginaire, la confiance en soi et l'expression des enfants de 0 à 10 ans.
            </p>
          </section>

          {/* SECTION 2 - Fonctionnement & méthode */}
          <section className="mb-20 animate-fade-in animation-delay-200">
            <div className="flex items-center gap-3 mb-6">
              <Book className="w-8 h-8 text-mcf-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-mcf-primary">
                Une collection pensée par des spécialistes de l'enfance
              </h2>
            </div>
            
            <div className="space-y-6 text-mcf-text/80 leading-relaxed">
              <p className="text-lg">Chaque livre repose sur un tronc commun narratif, spécifiquement adapté à chaque tranche d’âge de 0 à 10 ans.<strong>tronc commun narratif</strong>, spécifiquement adapté 
                à chaque tranche d'âge de 0 à 10 ans.
              </p>
              <p className="text-lg">Ces histoires sont conçues avec l’appui de psychologues de l’enfance, chercheurs en développement et enseignants.<strong>psychologues de l'enfance</strong>, 
                chercheurs en développement et enseignants.
              </p>
              <p className="text-lg">
                Elles sont relues par des <strong>auteurs jeunesse</strong> pour un rythme et un ton 
                parfaitement adaptés.
              </p>
              
              <div className="bg-mcf-mint/10 border-l-4 border-mcf-mint p-6 rounded-r-lg mt-8">
                <p className="text-lg font-semibold text-mcf-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Notre objectif
                </p>
                <p className="mt-2 text-mcf-text/80">
                  Renforcer la confiance, stimuler la curiosité, encourager l'expression de soi.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 3 - Implication des parents */}
          <section className="mb-20 animate-fade-in animation-delay-400">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-mcf-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-mcf-primary">
                Deux façons de vivre l'aventure
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Option 1 */}
              <div className="bg-white rounded-2xl p-8 border-2 border-mcf-mint/30 hover:border-mcf-mint transition-all duration-300 hover:shadow-lg">
                <h3 className="text-2xl font-bold text-mcf-secondary mb-4">
                  Option 1 – Mode "flemmard"
                </h3>
                <ul className="space-y-3 text-mcf-text/80">
                  <li className="flex items-start gap-2">
                    <span className="text-mcf-mint mt-1">✓</span>
                    <span>Vous suivez le thème proposé chaque mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-mcf-mint mt-1">✓</span>
                    <span>Le livre reste 100% personnalisé (prénoms, animaux, proches, lieux, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-mcf-mint mt-1">✓</span>
                    <span>Vous pouvez enrichir avec quelques détails… ou laisser MCF tout gérer</span>
                  </li>
                </ul>
              </div>

              {/* Option 2 */}
              <div className="bg-white rounded-2xl p-8 border-2 border-mcf-secondary/30 hover:border-mcf-secondary transition-all duration-300 hover:shadow-lg">
                <h3 className="text-2xl font-bold text-mcf-primary mb-4">
                  Option 2 – Mode "action"
                </h3>
                <ul className="space-y-3 text-mcf-text/80">
                  <li className="flex items-start gap-2">
                    <span className="text-mcf-secondary mt-1">✓</span>
                    <span>Vous proposez un thème ou une idée totalement différente</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-mcf-secondary mt-1">✓</span>
                    <span>L'équipe crée un livre personnalisé en fonction de votre demande</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-center text-lg md:text-xl font-semibold text-mcf-primary italic">
              Que vous soyez ultra impliqué… ou un peu flemmard, chaque mois devient une aventure personnalisée.
            </p>
          </section>

          {/* SECTION 4 - Points qui font la différence */}
          <section className="mb-20 animate-fade-in animation-delay-600">
            <div className="bg-gradient-to-br from-mcf-mint/20 to-mcf-secondary/10 rounded-3xl p-8 md:p-12 border-2 border-mcf-mint/40">
              <div className="flex items-center gap-3 mb-8">
                <Award className="w-8 h-8 text-mcf-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-mcf-primary">
                  Ce qui rend My Crazy Family unique
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Bloc 1 - Qualité premium */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-mcf-mint/20">
                  <h3 className="text-2xl font-bold text-mcf-secondary mb-4">
                    ✨ Qualité premium
                  </h3>
                  <ul className="space-y-3 text-mcf-text/80">
                    <li className="flex items-start gap-2">
                      <span className="text-mcf-mint mt-1">•</span>
                      <span>Livres <strong>imprimés en France</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-mcf-mint mt-1">•</span>
                      <span><strong>Bel objet</strong> pour les bibliothèques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-mcf-mint mt-1">•</span>
                      <span>Papier épais, formats adaptés, finitions haut de gamme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-mcf-mint mt-1">•</span>
                      <span>Justifie pleinement le prix</span>
                    </li>
                  </ul>
                </div>

                {/* Bloc 2 - Contenus engagés */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-mcf-secondary/20">
                  <h3 className="text-2xl font-bold text-mcf-primary mb-4">
                    🌍 Contenus engagés
                  </h3>
                  <ul className="space-y-3 text-mcf-text/80">
                    <li className="flex items-start gap-2">
                      <span className="text-mcf-secondary mt-1">•</span>
                      <span>Thèmes responsables : <strong>écologie, diversité, civilisations, émotions…</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-mcf-secondary mt-1">•</span>
                      <span>Outils de sensibilisation pour enfants et parents</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-mcf-secondary mt-1">•</span>
                      <span><strong>Morale et résumé pédagogique</strong> à la fin de chaque histoire</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 5 - Témoignages (à venir) */}
          <section className="mb-20 animate-fade-in animation-delay-800">
            <div className="flex items-center gap-3 mb-6">
              <MessageCircle className="w-8 h-8 text-mcf-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-mcf-primary">
                Ils ont adopté My Crazy Family
              </h2>
            </div>
            
            <div className="bg-mcf-mint/5 rounded-2xl p-12 border-2 border-dashed border-mcf-mint/30 text-center">
              <p className="text-lg text-mcf-text/60 italic">
                Galerie de témoignages à venir
              </p>
              <p className="text-sm text-mcf-text/50 mt-2">
                Photos d'enfants et parents • Témoignages clients
              </p>
            </div>
          </section>

          {/* SECTION 6 - Illustrations IA (à venir) */}
          <section className="mb-20 animate-fade-in animation-delay-1000">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-mcf-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-mcf-primary">
                Nos livres en images
              </h2>
            </div>
            
            <div className="bg-mcf-secondary/5 rounded-2xl p-12 border-2 border-dashed border-mcf-secondary/30 text-center">
              <p className="text-lg text-mcf-text/60 italic">
                Galerie d'illustrations à venir
              </p>
              <p className="text-sm text-mcf-text/50 mt-2">
                Enfants avec leurs livres • Scènes de lecture en famille • Mise en scène
              </p>
            </div>
          </section>

          {/* SECTION 7 - Call-to-action */}
          <section className="animate-fade-in animation-delay-1200">
            <div className="bg-gradient-to-r from-mcf-primary to-mcf-secondary rounded-3xl p-12 text-center text-white shadow-xl">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Prêt à créer des souvenirs magiques ?
              </h2>
              <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Rejoignez les familles qui offrent à leurs enfants des histoires uniques, 
                créées rien que pour eux.
              </p>
              <Link to={getDestinationPath()} className="inline-block bg-white text-mcf-primary font-bold text-lg px-10 py-4 rounded-full hover:bg-mcf-mint hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg">
                {getButtonText()}
              </Link>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>;
};
export default NosHistoires;