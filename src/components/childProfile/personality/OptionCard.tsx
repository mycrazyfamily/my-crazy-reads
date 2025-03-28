
import React from 'react';

type OptionCardProps = {
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  icon: string;
  label: string;
};

const OptionCard: React.FC<OptionCardProps> = ({
  isSelected,
  isDisabled,
  onClick,
  icon,
  label,
}) => {
  return (
    <div 
      className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
        isSelected 
          ? "border-mcf-orange bg-mcf-amber/10" 
          : isDisabled 
            ? "border-gray-200 opacity-60 cursor-not-allowed"
            : "border-gray-200 hover:border-mcf-amber"
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <div className="mt-1">
          <div className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
            isSelected ? "border-primary bg-primary text-primary-foreground" : "border-primary"
          }`}>
            {isSelected && <span className="text-xs text-white">✓</span>}
          </div>
        </div>
        <div>
          <div className="text-xl mb-1">{icon}</div>
          <div>{label}</div>
        </div>
      </div>
    </div>
  );
};

export default OptionCard;
