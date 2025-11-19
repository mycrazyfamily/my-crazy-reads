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
      description: 'Créer le profil d\'un nouveau membre de la famille',
      icon: Baby,
      color: 'primary',
      onClick: () => navigate('/creer-profil-enfant'),
      disabled: false,
      gradient: 'from-mcf-primary/10 to-mcf-mint/20',
      hoverGradient: 'hover:from-mcf-primary/20 hover:to-mcf-mint/30',
      iconBg: 'bg-mcf-primary/15',
      iconColor: 'text-mcf-primary',
      borderColor: 'border-mcf-primary/30 hover:border-mcf-primary',
    },
    {
      id: 'relative',
      title: 'Ajouter un proche',
      description: 'Grands-parents, oncles, tantes, amis proches...',
      icon: Users,
      color: 'secondary',
      onClick: () => {
        if (childrenCount === 1 && firstChildId) {
          navigate(`/ajouter-proche/${firstChildId}`);
        } else {
          navigate('/ajouter-proche');
        }
      },
      disabled: childrenCount === 0,
      disabledMessage: 'Ajoutez d\'abord un enfant pour pouvoir ajouter ses proches.',
      gradient: 'from-mcf-mint/10 to-mcf-secondary/20',
      hoverGradient: 'hover:from-mcf-mint/20 hover:to-mcf-secondary/30',
      iconBg: 'bg-mcf-secondary/15',
      iconColor: 'text-mcf-secondary',
      borderColor: 'border-mcf-secondary/30 hover:border-mcf-secondary',
    },
    {
      id: 'pet',
      title: 'Ajouter un animal',
      description: 'Chat, chien, lapin ou tout autre compagnon',
      icon: Heart,
      color: 'orange',
      onClick: () => {
        if (childrenCount === 1 && firstChildId) {
          navigate(`/ajouter-animal/${firstChildId}`);
        } else {
          navigate('/ajouter-animal');
        }
      },
      disabled: childrenCount === 0,
      disabledMessage: 'Ajoutez d\'abord un enfant pour pouvoir ajouter ses animaux.',
      gradient: 'from-mcf-amber/10 to-mcf-orange/20',
      hoverGradient: 'hover:from-mcf-amber/20 hover:to-mcf-orange/30',
      iconBg: 'bg-mcf-orange/15',
      iconColor: 'text-mcf-orange',
      borderColor: 'border-mcf-orange/30 hover:border-mcf-orange',
    },
    {
      id: 'place',
      title: 'Ajouter un lieu',
      description: 'Maison, école, parc favori, lieu de vacances...',
      icon: MapPin,
      color: 'amber',
      onClick: () => {
        if (childrenCount === 1 && firstChildId) {
          navigate(`/ajouter-lieu/${firstChildId}`);
        } else {
          navigate('/ajouter-lieu');
        }
      },
      disabled: childrenCount === 0,
      disabledMessage: 'Ajoutez d\'abord un enfant pour pouvoir ajouter ses lieux de vie.',
      gradient: 'from-mcf-cream/30 to-mcf-amber/20',
      hoverGradient: 'hover:from-mcf-cream/40 hover:to-mcf-amber/30',
      iconBg: 'bg-mcf-amber/15',
      iconColor: 'text-mcf-amber',
      borderColor: 'border-mcf-amber/30 hover:border-mcf-amber',
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
                relative overflow-hidden border-2 transition-all duration-300 cursor-pointer
                ${action.disabled 
                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                  : `bg-gradient-to-br ${action.gradient} ${action.hoverGradient} ${action.borderColor} hover:shadow-lg hover:scale-[1.02]`
                }
              `}
              onClick={action.disabled ? undefined : action.onClick}
            >
              <div className="p-6 flex flex-col items-center text-center space-y-4">
                {/* Icône avec badge + */}
                <div className="relative">
                  <div className={`
                    p-4 rounded-2xl transition-all duration-300
                    ${action.disabled 
                      ? 'bg-gray-200' 
                      : `${action.iconBg} group-hover:scale-110`
                    }
                  `}>
                    <Icon 
                      className={`h-8 w-8 ${action.disabled ? 'text-gray-400' : action.iconColor}`} 
                      strokeWidth={2.5}
                    />
                  </div>
                  {/* Badge + */}
                  <div className={`
                    absolute -top-1 -right-1 rounded-full p-1
                    ${action.disabled ? 'bg-gray-300' : 'bg-white shadow-md'}
                  `}>
                    <Plus 
                      className={`h-4 w-4 ${action.disabled ? 'text-gray-500' : action.iconColor}`}
                      strokeWidth={3}
                    />
                  </div>
                </div>
                
                {/* Titre */}
                <h3 className={`
                  font-bold text-base
                  ${action.disabled ? 'text-gray-500' : 'text-mcf-orange-dark'}
                `}>
                  {action.title}
                </h3>
                
                {/* Description */}
                <p className={`
                  text-sm leading-relaxed
                  ${action.disabled ? 'text-gray-400' : 'text-gray-600'}
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
