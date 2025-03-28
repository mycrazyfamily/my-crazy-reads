
import React from 'react';

interface BenefitCardProps {
  title: string;
  description: string;
  icon: string;
  delay: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ title, description, icon, delay }) => {
  return (
    <div className={`bg-white rounded-2xl overflow-hidden card-shadow transition-all duration-300 hover:shadow-xl ${delay}`}
         style={{ opacity: 1, animation: 'scale-up 0.8s ease-out forwards' }}>
      <div className="p-6 flex flex-col h-full">
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-4" style={{ color: '#F97316' }}>{title}</h3>
        <p className="text-gray-700 flex-grow">{description}</p>
      </div>
    </div>
  );
};

export default BenefitCard;
