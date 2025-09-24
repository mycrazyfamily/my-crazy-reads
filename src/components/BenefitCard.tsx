
import React from 'react';

interface BenefitCardProps {
  title: string;
  description: string;
  icon: string;
  delay: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ title, description, icon, delay }) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl border border-mcf-mint/20 transition-all duration-300 hover:scale-105 group ${delay}`}>
      <div className="p-6 flex flex-col h-full">
        <div className="text-4xl mb-6 group-hover:animate-float">{icon}</div>
        <h3 className="text-xl font-bold mb-4 text-mcf-text group-hover:text-mcf-primary transition-colors">
          {title}
        </h3>
        <p className="text-mcf-text/70 flex-grow leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default BenefitCard;
