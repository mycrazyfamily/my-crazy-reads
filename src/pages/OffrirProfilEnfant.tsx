
import React from 'react';
import { useLocation } from 'react-router-dom';
import CreateChildProfile from './CreateChildProfile';

const OffrirProfilEnfant = () => {
  const location = useLocation();
  const familyCode = location.state?.familyCode;

  return (
    <div>
      <CreateChildProfile 
        isGiftMode={true} 
        familyCode={familyCode} 
        nextPath="/offrir/theme"
      />
    </div>
  );
};

export default OffrirProfilEnfant;
