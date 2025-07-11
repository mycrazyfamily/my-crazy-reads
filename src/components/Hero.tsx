
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  // État removed: const [debug, setDebug] = useState(false);

  useEffect(() => {
    // Vérifier si nous sommes sur un appareil mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
      // Sur mobile, pas besoin d'effet de souris
      return;
    }

    const element = heroRef.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      try {
        const current = heroRef.current;
        if (!current) {
          console.log("Hero ref is null during mousemove");
          return;
        }
        
        const { clientX, clientY } = e;
        const rect = current.getBoundingClientRect();
        
        // Vérifier si le rectangle a une taille valide
        if (rect.width === 0 || rect.height === 0) {
          console.log("Invalid dimensions", rect);
          return;
        }
        
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        
        const moveX = (x - 0.5) * 20;
        const moveY = (y - 0.5) * 20;
        
        // Vérification explicite avant de modifier le style
        if (current && current.style) {
          current.style.backgroundPosition = `${50 + moveX * 0.5}% ${50 + moveY * 0.5}%`;
          setIsHovering(true);
        }
      } catch (error) {
        console.error("Erreur lors du mouvement de souris:", error);
        // Ne pas propager l'erreur pour éviter de faire crasher l'application
      }
    };
    
    const handleMouseLeave = () => {
      console.log("MouseLeave triggered");
      const current = heroRef.current;
      if (current && current.style) {
        // Revenir à la position initiale
        current.style.backgroundPosition = '50% 50%';
        setIsHovering(false);
      }
    };

    // Attacher les événements sur l'élément Hero, pas sur document
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Code de debug supprimé
    
    return () => {
      // Nettoyer les événements sur l'élément spécifique
      if (element) {
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  console.log("Hero component rendering", { hasRef: !!heroRef.current, isHovering });

  return (
    <div 
      ref={heroRef}
      className={`hero-gradient min-h-screen flex items-center justify-center pt-16 pb-10 transition-all duration-300 ease-out ${
        isHovering ? 'bg-[length:120%_120%]' : 'bg-[length:110%_110%]'
      }`}
      style={{ backgroundPosition: '50% 50%' }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 opacity-1 animate-fade-in"
               style={{ color: '#F97316' }}>
            Bienvenue dans My Crazy Family
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl opacity-1 animate-fade-in animation-delay-200">
            Chaque mois, une nouvelle histoire imprimée personnalisée, pour vivre des aventures magiques en famille, à lire et à garder pour toujours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 opacity-1 animate-fade-in animation-delay-300">
            <Link 
              to="/creer-profil-enfant" 
              className="text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg"
              style={{ backgroundColor: '#FB923C', color: 'white' }}
            >
              Commencer l'aventure
            </Link>
            
            <Link 
              to="/offrir-livre" 
              className="bg-white hover:bg-mcf-amber text-mcf-orange-dark font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 text-lg"
              style={{ borderColor: '#FB923C', color: '#F97316', backgroundColor: 'white' }}
            >
              Offrir un livre
            </Link>
          </div>
          
          <div className="mt-16 relative w-full max-w-2xl opacity-1 animate-fade-in animation-delay-400">
            <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full opacity-50 animate-float" 
                 style={{ backgroundColor: '#FCD34D' }}></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-50 animate-float animation-delay-300" 
                 style={{ backgroundColor: '#FB923C' }}></div>
            
            <div className="relative glassmorphism rounded-2xl overflow-hidden card-shadow">
              <div className="bg-mcf-cream/50 p-6 md:p-10 flex flex-col items-center" style={{ backgroundColor: 'rgba(255, 251, 235, 0.5)' }}>
                <p className="text-lg md:text-xl font-medium text-gray-700 mb-6">
                  Plus qu'un livre, c'est le début d'une aventure familiale exceptionnelle.
                </p>
                
                <div className="font-display text-xl md:text-2xl font-bold" style={{ color: '#F97316' }}>
                  Embarquez avec nous !
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
