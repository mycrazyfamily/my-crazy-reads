import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Baby, Users, Heart, MapPin, Plus } from 'lucide-react';
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {actions.map((action) => {
          const Icon = action.icon;
          
          const cardContent = (
            <Card 
              className={`
                relative overflow-hidden transition-all duration-300 cursor-pointer
                ${action.disabled 
                  ? 'bg-gray-50/50 border-gray-200 opacity-60 cursor-not-allowed' 
                  : 'bg-white border-[#B3D4F5] hover:border-[#4A90E2] hover:shadow-lg hover:scale-[1.02]'
                }
              `}
              onClick={action.disabled ? undefined : action.onClick}
            >
              <div className="p-8 flex flex-col items-center text-center space-y-5">
                {/* Icône dans un cercle */}
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                  ${action.disabled ? 'bg-gray-200' : action.iconBg}
                `}>
                  <Icon 
                    className={`h-10 w-10 ${action.disabled ? 'text-gray-400' : action.iconColor}`} 
                    strokeWidth={2}
                  />
                </div>
                
                {/* Titre */}
                <h3 className={`
                  font-semibold text-lg
                  ${action.disabled ? 'text-gray-500' : 'text-[#4A90E2]'}
                `}>
                  {action.title}
                </h3>
                
                {/* Description */}
                <p className={`
                  text-sm leading-relaxed
                  ${action.disabled ? 'text-gray-400' : 'text-[#555555]'}
                `}>
                  {action.description}
                </p>
              </div>
            </Card>
          );

          if (action.disabled && action.disabledMessage) {
            return (
              <Tooltip key={action.id}>
                <TooltipTrigger asChild>
                  {cardContent}
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{action.disabledMessage}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={action.id}>{cardContent}</div>;
        })}
      </div>
    </TooltipProvider>
  );
};

export default QuickActionsSection;
