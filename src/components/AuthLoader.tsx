
import React from 'react';
import { Loader2 } from 'lucide-react';

interface AuthLoaderProps {
  message?: string;
}

const AuthLoader = ({ message = "Connexion en cours..." }: AuthLoaderProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-mcf-cream">
      <div className="p-8 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg text-center max-w-md mx-auto">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-mcf-orange animate-spin" />
            <div className="absolute inset-0 animate-ping opacity-50">
              <div className="h-12 w-12 rounded-full bg-mcf-orange/20" />
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-mcf-orange-dark">
              {message}
            </p>
            <p className="text-sm text-gray-500">
              Merci d'avoir confirmé ton email ! Nous préparons ton espace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoader;
