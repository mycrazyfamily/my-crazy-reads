
import { useState, useEffect } from 'react';

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number;
    height: number;
  }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Écouter le redimensionnement de la fenêtre
    window.addEventListener('resize', handleResize);

    // Nettoyer l'écouteur d'événement au démontage
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};
