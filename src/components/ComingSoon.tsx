import React from 'react';
import { Link } from 'react-router-dom';
import { Clock } from 'lucide-react';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFDFD] px-4">
      <div className="text-center max-w-lg">
        <h1 className="text-2xl font-display font-bold text-[#4A90E2] mb-2">
          My Crazy Family
        </h1>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-[#7BC5AE]" />
          <h2 className="text-xl font-semibold text-gray-800">
            Bientôt disponible
          </h2>
        </div>
        <p className="text-gray-600 mb-8">
          Cette page est en cours de préparation. Revenez très prochainement pour la découvrir !
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#4A90E2] text-white rounded-full font-medium hover:bg-[#3A7BC8] transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;
