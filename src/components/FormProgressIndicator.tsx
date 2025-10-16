import React from 'react';
import { Check } from 'lucide-react';

interface FormProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

const FormProgressIndicator: React.FC<FormProgressIndicatorProps> = ({ 
  currentStep, 
  totalSteps,
  stepLabels = []
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
            
            return (
              <div key={index} className="flex flex-col items-center">
                {/* Circle */}
                <div 
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-300 border-2
                    ${isCompleted 
                      ? 'bg-mcf-primary border-mcf-primary text-white' 
                      : isCurrent
                        ? 'bg-white border-mcf-primary text-mcf-primary ring-4 ring-mcf-primary/20'
                        : 'bg-white border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Label */}
                {stepLabels[index] && (
                  <span 
                    className={`
                      mt-2 text-xs font-medium text-center max-w-[80px]
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
        </p>
      </div>
    </div>
  );
};

export default FormProgressIndicator;
