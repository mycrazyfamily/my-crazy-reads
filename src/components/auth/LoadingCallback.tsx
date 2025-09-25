
import React from 'react';
import { Loader2, Mail } from 'lucide-react';

const LoadingCallback = () => {
  console.log('LoadingCallback component in auth folder - RECREATED and rendered');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mcf-cream to-mcf-beige">
      <div className="p-8 rounded-xl bg-card backdrop-blur-sm shadow-lg text-center max-w-md mx-4">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-mcf-primary animate-spin" />
            <div className="absolute -inset-2">
              <div className="h-12 w-12 rounded-full bg-mcf-primary/20" />
            </div>
            <Mail className="absolute inset-0 h-12 w-12 text-mcf-primary opacity-20" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-mcf-primary">
              Bienvenue dans l'aventure !
            </h1>
            <p className="text-muted-foreground">
              Nous finalisons ton inscription... Quelques secondes de patience ⏳
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingCallback;
