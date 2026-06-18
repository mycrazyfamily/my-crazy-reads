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
        <div className="p-8 flex flex-col h-full relative z-10">
          <div className="text-5xl mb-6 group-hover:animate-float">{icon}</div>
          <h3 className="text-xl font-bold mb-4 text-mcf-primary transition-colors">
            {title}
          </h3>
          <p className="text-mcf-text/70 flex-grow leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default BenefitCard;
