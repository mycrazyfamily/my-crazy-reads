import React from 'react';
import violainePhoto from '@/assets/violaine-lallour.png';
const ExpertQuote: React.FC = () => {
  return <section className="py-16 px-4 bg-mcf-gradient-start/20">
      <div className="container mx-auto">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Photo */}
            <div className="flex-shrink-0">
              <img src={violainePhoto} alt="Violaine Lallour, Psychologue pour enfants" className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-md" loading="lazy" />
            </div>
            
            {/* Citation */}
            <div className="flex-1">
              <div className="relative">
                {/* Guillemet décoratif */}
                <div className="absolute -top-4 -left-2 text-6xl text-mcf-secondary/30 font-serif leading-none">
                  "
                </div>
                
                <blockquote className="relative pt-4">
                  <p className="text-lg md:text-xl italic text-mcf-text/90 leading-relaxed mb-6">Impliquer les proches dans la lecture est l'un des moyens les plus puissants pour détourner les enfants des écrans.
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
