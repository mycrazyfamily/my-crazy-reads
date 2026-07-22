// ExpertQuote v1.2
// Changelog v1.2 (C2, MOBILE) : le bloc occupait ~700pt de haut sur iPhone — près de deux écrans —
//   alors que sur desktop c'est une note d'appui compacte sous le hero. La hiérarchie était donc
//   inversée sur mobile. Compactage : citation en 16px au lieu de 18 (≈8 lignes au lieu de 10),
//   marges de section et de carte réduites, écart photo/texte resserré. La photo garde sa taille
//   (128px) : c'est le texte qui déséquilibrait le rapport, pas elle. Desktop inchangé (tous les
//   changements repassent aux valeurs d'origine dès md:).
// ExpertQuote v1.1
// Changelog v1.1 (C-Home, MOBILE) : en une colonne, `items-center` centrait la photo alors que le
//   texte gardait l'alignement à gauche par défaut → bloc visuellement décalé. Le texte (citation,
//   nom, fonction) est désormais centré sur mobile et repasse à gauche dès md:. Le guillemet
//   décoratif, accroché en absolute à gauche, est masqué sur mobile où il restait orphelin avec un
//   texte centré (et son compensateur pt-4 avec lui). Desktop strictement inchangé.
import React from 'react';
import violainePhoto from '@/assets/violaine-lallour.png';
const ExpertQuote: React.FC = () => {
  return <section className="py-10 md:py-16 px-4 bg-mcf-gradient-start/20">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5 md:gap-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              <img src={violainePhoto} alt="Violaine Lallour, Psychologue pour enfants" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md" loading="lazy" />
            </div>
            
            {/* Citation — texte centré sur mobile pour s'aligner avec la photo (que `items-center`
                centre déjà), et aligné à gauche dès md: où la mise en page passe en 2 colonnes. */}
            <div className="flex-1 text-center md:text-left">
              <div className="relative">
                {/* Guillemet décoratif — masqué sur mobile : accroché en absolute à gauche, il
                    restait orphelin une fois le texte centré. Réapparaît dès md:. */}
                <div className="hidden md:block absolute -top-4 -left-2 text-6xl text-mcf-secondary/30 font-serif leading-none">
                  "
                </div>
                
                <blockquote className="relative pt-0 md:pt-4">
                  <p className="text-base md:text-xl italic text-mcf-text/90 leading-relaxed mb-4 md:mb-6">Impliquer les proches dans la lecture est l'un des moyens les plus puissants pour détourner les enfants des écrans.
Avec My Crazy Family, ils retrouvent leurs repères affectifs et s'identifient à des personnages familiers, ce qui stimule l'apprentissage et renforce la confiance en soi.</p>
                  
                  <footer className="text-base md:text-lg font-semibold text-mcf-text">
                    <span className="text-mcf-secondary">Violaine Lallour</span>
                    <span className="block mt-1 text-mcf-text/70 font-normal">
                      Psychologue pour enfants depuis 20 ans
                    </span>
                  </footer>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default ExpertQuote;
