
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Vérifier si nous sommes sur un appareil mobile
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile) {
      // Sur mobile, pas besoin d'effet de souris
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      try {
        if (!heroRef.current) return;
        
        const { clientX, clientY } = e;
        const rect = heroRef.current.getBoundingClientRect();
        
        // Vérifier si le rectangle a une taille valide
        if (rect.width === 0 || rect.height === 0) return;
        
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        
        const moveX = (x - 0.5) * 20;
        const moveY = (y - 0.5) * 20;
        
        heroRef.current.style.backgroundPosition = `${50 + moveX * 0.5}% ${50 + moveY * 0.5}%`;
        setIsHovering(true);
      } catch (error) {
        console.error("Erreur lors du mouvement de souris:", error);
        // Ne pas propager l'erreur pour éviter de faire crasher l'application
      }
    };
    
    const handleMouseLeave = () => {
      if (heroRef.current) {
        // Revenir à la position initiale
        heroRef.current.style.backgroundPosition = '50% 50%';
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  console.log("Hero component rendering");

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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-mcf-orange-dark leading-tight mb-4 opacity-0 animate-fade-in">
            Bienvenue dans My Crazy Family
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl opacity-0 animate-fade-in animation-delay-200">
            Chaque mois, une nouvelle histoire imprimée personnalisée, pour vivre des aventures magiques en famille, à lire et à garder pour toujours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in animation-delay-300">
            <Link 
              to="/creer-profil-enfant" 
              className="bg-mcf-orange hover:bg-mcf-orange-dark text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg text-lg"
            >
              Commencer l'aventure
            </Link>
            
            <Link 
              to="/offrir-livre" 
              className="bg-white hover:bg-mcf-amber text-mcf-orange-dark font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 border-mcf-orange text-lg"
            >
              Offrir un livre
            </Link>
          </div>
          
          <div className="mt-16 relative w-full max-w-2xl opacity-0 animate-fade-in animation-delay-400">
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-mcf-amber rounded-full opacity-50 animate-float"></div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-mcf-orange rounded-full opacity-50 animate-float animation-delay-300"></div>
            
            <div className="relative glassmorphism rounded-2xl overflow-hidden card-shadow">
              <div className="bg-mcf-cream/50 p-6 md:p-10 flex flex-col items-center">
                <p className="text-lg md:text-xl font-medium text-gray-700 mb-6">
                  Plus qu'un livre, c'est le début d'une aventure familiale exceptionnelle.
                </p>
                
                <div className="font-display text-xl md:text-2xl text-mcf-orange-dark font-bold">
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
