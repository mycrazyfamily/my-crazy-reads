// QuickActionsSection v1.4
// Changelog v1.4 (chantier icones IA, lot 2) : carte « Ajouter un doudou », Sparkles -> Moon.
//   Sparkles est devenue le marqueur generique de l'IA depuis 2023, et elle ne disait de toute
//   facon pas « doudou ». lucide n'a ni peluche ni doudou : Rabbit aurait ete lu « animal de
//   compagnie », or la carte voisine est justement « Ajouter un animal ». Moon deplace le sens
//   vers le coucher et l'histoire du soir, sans collision avec les quatre autres cartes
//   (Baby, Users, Heart, MapPin).
//   NOTE : `Plus` est importe sans etre utilise dans ce fichier. Import mort ANTERIEUR a ce
//   chantier, volontairement laisse en place (modifications chirurgicales). A retirer lors d'un
//   passage de nettoyage.
// QuickActionsSection v1.3
// Changelog v1.3 (C12, MOBILE) : les 5 cartes empilées occupaient ~1 460px, soit près de deux
//   écrans avant d'atteindre « Mes enfants » — chaque carte faisait ~280px (padding 32px, cercle
//   d'icône de 80px, hauteur de description réservée à 60px). Elles passent en disposition
//   HORIZONTALE sous sm: (icône à gauche, titre et description à droite, alignés à gauche) :
//   ~95px par carte, soit ~530px au total, une réduction de 64% SANS rien masquer.
//   Choix assumé de ne pas faire de carrousel : quand la famille est vide, 4 des 5 cartes sont
//   désactivées ; en liste compacte l'utilisateur voit immédiatement que « Ajouter un enfant » est
//   la seule action disponible, alors qu'un carrousel lui ferait défiler 4 cartes inactives.
//   Le point de rupture est sm: (et non md:) pour coïncider avec celui de la grille, qui passe à
//   2 colonnes à 640px : au-delà, les cartes sont assez étroites pour la disposition verticale.
//   Desktop et tablette strictement inchangés — toutes les valeurs d'origine sont restaurées
//   dès sm:, y compris la hauteur réservée de la description (qui sert à égaliser les cartes
//   d'une même ligne, ce qui n'a plus lieu d'être quand elles sont empilées).
// QuickActionsSection v1.2
// Changelog v1.2 : fix hauteur de carte non homogène — cause réelle = la description (2 vs 3
// lignes selon le texte) ne réservait pas d'espace fixe. Ajout de h-full sur Card + wrappers, et
// min-h-[3.75rem] sur la description pour réserver systématiquement ~3 lignes, quelle que soit
// la longueur réelle du texte.
// Changelog v1.1 : ajout de la carte "Ajouter un doudou" (entre animal et lieu) + grille passée à 5 colonnes en desktop
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Baby, Users, Heart, MapPin, Plus, Moon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface QuickActionsSectionProps {
  childrenCount: number;
  firstChildId?: string;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({ childrenCount, firstChildId }) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'child',
      title: 'Ajouter un enfant',
      description: 'Créez le profil de votre enfant pour enrichir les histoires',
      icon: Baby,
      onClick: () => navigate('/creer-profil-enfant'),
      disabled: false,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      id: 'relative',
      title: 'Ajouter un proche',
      description: 'Ajoutez un proche important de votre famille',
      icon: Users,
      onClick: () => {
        if (childrenCount === 1 && firstChildId) {
          navigate(`/ajouter-proche/${firstChildId}`);
        } else {
          navigate('/ajouter-proche');
        }
      },
      disabled: childrenCount === 0,
      disabledMessage: 'Ajoutez d\'abord un enfant pour pouvoir ajouter ses proches.',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      id: 'pet',
      title: 'Ajouter un animal',
      description: 'Ajoutez votre compagnon pour le retrouver dans les histoires',
      icon: Heart,
      onClick: () => {
        if (childrenCount === 1 && firstChildId) {
          navigate(`/ajouter-animal/${firstChildId}`);
        } else {
          navigate('/ajouter-animal');
        }
      },
      disabled: childrenCount === 0,
      disabledMessage: 'Ajoutez d\'abord un enfant pour pouvoir ajouter ses animaux.',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      id: 'toy',
      title: 'Ajouter un doudou',
      description: 'Ajoutez le doudou ou objet fétiche de votre enfant',
      icon: Moon,
      onClick: () => {
        if (childrenCount === 1 && firstChildId) {
          navigate(`/ajouter-doudou/${firstChildId}`);
        } else {
          navigate('/ajouter-doudou');
        }
      },
      disabled: childrenCount === 0,
      disabledMessage: 'Ajoutez d\'abord un enfant pour pouvoir ajouter ses doudous.',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
    {
      id: 'place',
      title: 'Ajouter un lieu',
      description: 'Ajoutez un lieu de vie pour situer les aventures',
      icon: MapPin,
      onClick: () => {
        if (childrenCount === 1 && firstChildId) {
          navigate(`/ajouter-lieu/${firstChildId}`);
        } else {
          navigate('/ajouter-lieu');
        }
      },
      disabled: childrenCount === 0,
      disabledMessage: 'Ajoutez d\'abord un enfant pour pouvoir ajouter ses lieux de vie.',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-500',
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
        {actions.map((action) => {
          const Icon = action.icon;
          
          const cardContent = (
            <Card 
              className={`
                relative overflow-hidden transition-all duration-300 cursor-pointer h-full
                ${action.disabled 
                  ? 'bg-gray-50/50 border-gray-200 opacity-60 cursor-not-allowed' 
                  : 'bg-white border-[#B3D4F5] hover:border-[#4A90E2] hover:shadow-lg hover:scale-[1.02]'
                }
              `}
              onClick={action.disabled ? undefined : action.onClick}
            >
              {/* Mobile : rangée « icône | texte ». Dès sm: : colonne centrée, comme à l'origine. */}
              <div className="p-4 sm:p-8 h-full flex flex-row sm:flex-col items-center gap-4 sm:gap-5 text-left sm:text-center">
                {/* Icône dans un cercle — shrink-0 pour qu'elle ne soit pas écrasée par le texte */}
                <div className={`
                  w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-full flex items-center justify-center transition-all duration-300
                  ${action.disabled ? 'bg-gray-200' : action.iconBg}
                `}>
                  <Icon 
                    className={`h-7 w-7 sm:h-10 sm:w-10 ${action.disabled ? 'text-gray-400' : action.iconColor}`} 
                    strokeWidth={2}
                  />
                </div>

                {/* sm:contents → au-delà de 640px ce conteneur ne produit aucune boîte : le titre et
                    la description redeviennent enfants directs du flex ci-dessus, donc rendu
                    identique à l'origine. */}
                <div className="min-w-0 sm:contents">
                  {/* Titre */}
                  <h3 className={`
                    font-semibold text-base sm:text-lg mb-1 sm:mb-0
                    ${action.disabled ? 'text-gray-500' : 'text-[#4A90E2]'}
                  `}>
                    {action.title}
                  </h3>

                  {/* Description — la hauteur réservée (~3 lignes) sert à égaliser les cartes d'une
                      même ligne ; elle n'a plus lieu d'être quand elles sont empilées, donc elle
                      ne s'applique qu'à partir de sm: */}
                  <p className={`
                    text-sm leading-relaxed sm:min-h-[3.75rem] sm:flex sm:items-center sm:justify-center
                    ${action.disabled ? 'text-gray-400' : 'text-[#555555]'}
                  `}>
                    {action.description}
                  </p>
                </div>
              </div>
            </Card>
          );

          if (action.disabled && action.disabledMessage) {
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  <div className="h-full">{cardContent}</div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{action.disabledMessage}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={action.id} className="h-full">{cardContent}</div>;
        })}
      </div>
    </TooltipProvider>
  );
};

export default QuickActionsSection;
