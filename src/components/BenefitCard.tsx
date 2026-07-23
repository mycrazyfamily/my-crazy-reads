// BenefitCard v1.1
// Changelog v1.1 (C4, MOBILE) : la carte était toujours en colonne — grosse icône centrée, puis
//   titre, puis description — soit environ 285px de haut par carte, donc plus de 1 100px pour les
//   quatre empilées sur mobile. Elle passe en disposition HORIZONTALE sous md: (icône à gauche,
//   texte à droite, aligné à gauche) : chaque carte tombe à ~140px et les 4 arguments de vente
//   restent tous visibles — un carrousel en aurait masqué trois, ce qui est acceptable pour des
//   exemples mais coûteux pour des arguments.
//   Desktop : la disposition d'origine est restaurée à l'identique dès md:. Le conteneur du texte
//   utilise `md:contents`, qui le fait disparaître de la mise en page — le titre et la description
//   redeviennent alors des enfants directs du conteneur flex, exactement comme avant ce
//   changement. C'est ce qui garantit qu'aucun réglage desktop n'est modifié au passage.
import React from 'react';
interface BenefitCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: string;
}
const BenefitCard: React.FC<BenefitCardProps> = ({ title, description, icon, delay }) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-mcf-mint/20 hover:border-mcf-mint transition-all duration-300 hover:-translate-y-2 group ${delay}`}>
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-mcf-mint/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
        {/* Mobile : rangée « icône | texte ». Desktop : colonne centrée, comme à l'origine. */}
        <div className="p-5 md:p-8 flex flex-row md:flex-col h-full relative z-10 items-start md:items-center gap-4 md:gap-0 text-left md:text-center">
          {/* shrink-0 : l'icône ne doit pas être écrasée par le texte placé à côté d'elle. */}
          <div className="text-5xl shrink-0 mb-0 md:mb-6 md:mx-auto group-hover:animate-float">{icon}</div>
          {/* md:contents → sur desktop ce conteneur ne produit aucune boîte : le h3 et le p
              redeviennent enfants directs du flex ci-dessus, donc rendu identique à avant. */}
          <div className="flex-1 min-w-0 md:contents">
            <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 text-mcf-primary transition-colors">
              {title}
            </h3>
            <p className="text-sm md:text-base text-mcf-text/70 flex-grow leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default BenefitCard;
