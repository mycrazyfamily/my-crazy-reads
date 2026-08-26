// FormProgressIndicator v1.2
// Changelog v1.2 (chantier D2) : les etapes DEJA VISITEES deviennent cliquables.
//   Un parent qui veut corriger une reponse de l'etape 2 depuis l'etape 6 devait cliquer
//   quatre fois sur « Etape precedente ». Il peut desormais cliquer sur le rond 2.
//
//   SEUL LE RETOUR EN ARRIERE EST AUTORISE, et c'est deliberé : aller en avant permettrait
//   de sauter des champs obligatoires, et le blocage n'apparaitrait qu'a la validation
//   finale, loin de l'endroit ou il manque quelque chose. Les etapes a venir restent donc
//   inertes, avec le meme aspect qu'avant.
//
//   RETROCOMPATIBLE : onStepClick est optionnel. Sans cette prop, le composant se comporte
//   exactement comme en v1.1, ce qui laisse le choix ecran par ecran de brancher ou non la
//   navigation. Utilise par FormSteps (formulaire enfant, 8 etapes) et par les quatre pages
//   d'ajout (2 etapes).
// FormProgressIndicator v1.1
// Changelog v1.1 (MOBILE) : les libellés sous chaque cercle (Infos, Personnalité, Famille…)
//   débordaient / se chevauchaient sur mobile (8 étapes). On les masque sur mobile (hidden sm:block)
//   et on affiche le nom de l'étape COURANTE dans le compteur (« Étape X sur N · Libellé »).
//   Les cercles 1→N restent visibles. Desktop strictement inchangé (libellés sous chaque cercle).
import React from 'react';
import { Check } from 'lucide-react';

interface FormProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  /** v1.2 : si fournie, les etapes deja visitees deviennent cliquables. */
  onStepClick?: (step: number) => void;
}

const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps,
  stepLabels = [],
  onStepClick
}) => {
  return (
    <div className="w-full mb-8">
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full" />
        
        {/* Active progress line */}
        <div 
          className="absolute top-5 left-0 h-1 bg-mcf-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const stepNumber = index + 1;
            // v1.2 : seules les etapes deja franchies sont atteignables.
            const estCliquable = !!onStepClick && isCompleted;
            
            return (
              <div key={index} className="flex flex-col items-center">
                {/* Circle */}
                <button
                  type="button"
                  onClick={estCliquable ? () => onStepClick(index) : undefined}
                  disabled={!estCliquable}
                  aria-label={
                    estCliquable
                      ? `Revenir à l'étape ${stepNumber}${stepLabels[index] ? ` : ${stepLabels[index]}` : ''}`
                      : undefined
                  }
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300 border-2
                    ${isCompleted 
                      ? 'bg-mcf-primary border-mcf-primary text-white' 
                      : isCurrent
                        ? 'bg-white border-mcf-primary text-mcf-primary ring-4 ring-mcf-primary/20'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                    ${estCliquable
                      ? 'cursor-pointer hover:opacity-80 hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-mcf-primary/30'
                      : 'cursor-default'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </button>
                
                {/* Label */}
                {stepLabels[index] && (
                  <span 
                    className={`
                      mt-2 text-xs font-medium text-center max-w-[80px] hidden sm:block
                      ${isCurrent ? 'text-mcf-primary' : 'text-gray-500'}
                    `}
                  >
                    {stepLabels[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Step counter text */}
      <div className="text-center mt-6">
        <p className="text-sm font-medium text-gray-600">
          Étape <span className="text-mcf-primary font-bold">{currentStep + 1}</span> sur {totalSteps}
          {stepLabels[currentStep] && (
            <span className="sm:hidden">
              {' · '}
              <span className="text-mcf-primary font-semibold">{stepLabels[currentStep]}</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default FormProgressIndicator;
