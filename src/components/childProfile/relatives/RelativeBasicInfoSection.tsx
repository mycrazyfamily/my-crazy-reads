import React, { useEffect, useState } from 'react';

import { Input } from "@/components/ui/input";
import { StepDatePicker } from "@/components/ui/step-date-picker";
import ErrorBoundary from "@/components/util/ErrorBoundary";
import { STANDALONE_RELATIVE_ROLE_OPTIONS, getRoleKeyFromRoleAndGender, roleNeedsGenderSelector } from '@/constants/childProfileOptions';
import type { RelativeType, RelativeGender } from '@/types/childProfile';
import { differenceInMonths, differenceInYears, isAfter } from "date-fns";

type RelativeBasicInfoSectionProps = {
  type: RelativeType;
  setType: (type: RelativeType) => void;
  firstName: string;
  setFirstName: (name: string) => void;
  otherTypeName: string | undefined;
  setOtherTypeName: (name: string) => void;
  age: string;
  setAge: (age: string) => void;
  birthDate?: Date;
  setBirthDate: (date: Date | undefined) => void;
  job: string;
  setJob: (job: string) => void;
  gender: RelativeGender;
  setGender: (gender: RelativeGender) => void;
};

const RelativeBasicInfoSection: React.FC<RelativeBasicInfoSectionProps> = ({
  type,
  setType,
  firstName,
  setFirstName,
  otherTypeName,
  setOtherTypeName,
  age,
  setAge,
  birthDate,
  setBirthDate,
  job,
  setJob,
  gender,
  setGender
}) => {
  const [ageDisplay, setAgeDisplay] = useState<string>("");
  
  // Reconstruct the UI key from current type + gender
  const [selectedKey, setSelectedKey] = useState<string>(() => 
    getRoleKeyFromRoleAndGender(type, gender)
  );

  // Sync selectedKey when type/gender change externally (e.g. edit prefill)
  useEffect(() => {
    const newKey = getRoleKeyFromRoleAndGender(type, gender);
    if (newKey !== selectedKey) {
      setSelectedKey(newKey);
    }
  }, [type, gender]);

  useEffect(() => {
    if (birthDate) {
      calculateExactAge(birthDate);
    } else {
      setAgeDisplay("");
      setAge("");
    }
  }, [birthDate]);


  const calculateExactAge = (birthDate: Date) => {
    const today = new Date();
    const years = differenceInYears(today, birthDate);
    const monthDiff = differenceInMonths(today, birthDate) % 12;
    
    let ageString = "";
    if (years > 0) {
      ageString += `${years} an${years > 1 ? 's' : ''}`;
      if (monthDiff > 0) {
        ageString += ` et ${monthDiff} mois`;
      }
    } else if (monthDiff > 0) {
      ageString = `${monthDiff} mois`;
    } else {
      ageString = "moins d'un mois";
    }
    
    setAgeDisplay(ageString);
    setAge(ageString);
  };

  const handleDateChange = (date: Date | null) => {
    try {
      if (date && !isAfter(date, new Date())) {
        setBirthDate(date);
      } else {
        setBirthDate(undefined);
      }
    } catch (error) {
      console.error("Error handling date change:", error);
    }
  };

  const handleKeyChange = (key: string) => {
    setSelectedKey(key);
    const option = STANDALONE_RELATIVE_ROLE_OPTIONS.find(o => o.key === key);
    if (option) {
      setType(option.role as RelativeType);
      if (option.gender) {
        setGender(option.gender);
      }
      // If gender is null (babysitter/other), don't auto-set - user must choose
    }
  };

  const needsGender = roleNeedsGenderSelector(selectedKey);

  return (
    <>
      {/* Type de proche */}
      <div className="form-group">
        <label className="block text-lg font-semibold mb-2">
          Qui est ce proche ?
        </label>
        <select
          value={selectedKey}
          onChange={(e) => handleKeyChange(e.target.value)}
          className="w-full border-2 border-mcf-amber rounded-md px-3 py-2 text-sm 
                     bg-white focus:outline-none focus:ring-2 focus:ring-mcf-amber"
        >
          {STANDALONE_RELATIVE_ROLE_OPTIONS.map(option => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Gender selector for roles without implicit gender */}
      {needsGender && (
        <div className="form-group">
          <label className="block text-lg font-semibold mb-2">
            Genre
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`rounded-lg border-2 p-3 cursor-pointer transition-all text-center ${
                gender === 'male' ? 'border-mcf-orange bg-mcf-amber/10 font-semibold' : 'border-gray-200 hover:border-mcf-amber'
              }`}
              onClick={() => setGender('male')}
            >
              Homme
            </div>
            <div
              className={`rounded-lg border-2 p-3 cursor-pointer transition-all text-center ${
                gender === 'female' ? 'border-mcf-orange bg-mcf-amber/10 font-semibold' : 'border-gray-200 hover:border-mcf-amber'
              }`}
              onClick={() => setGender('female')}
            >
              Femme
            </div>
          </div>
        </div>
      )}
      
      {/* Nom personnalisé pour "autre" */}
      {type === 'other' && (
        <div className="form-group">
          <label className="block text-lg font-semibold mb-2">
            Précisez
          </label>
          <Input 
            value={otherTypeName || ''} 
            onChange={(e) => setOtherTypeName(e.target.value)}
            placeholder="Ex: ami de la famille, parrain..." 
            className="border-mcf-amber"
          />
        </div>
      )}
      
      {/* Prénom */}
      <div className="form-group">
        <label className="block text-lg font-semibold mb-2">
          Prénom
        </label>
        <Input 
          value={firstName} 
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Son prénom" 
          className="border-mcf-amber"
        />
      </div>
      
      {/* Date de naissance */}
      <div className="form-group">
        <label className="block text-lg font-semibold mb-2">
          Date de naissance
        </label>
        <div style={{ position: 'relative' }}>
          <ErrorBoundary
            fallback={
              <Input
                type="date"
                value={birthDate ? birthDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setBirthDate(e.target.value ? new Date(e.target.value) : undefined)}
                className="border-mcf-amber"
              />
            }
          >
            <StepDatePicker
              value={birthDate}
              onChange={handleDateChange as (d: Date | undefined) => void}
            />
          </ErrorBoundary>
        </div>
        {ageDisplay && (
          <div className="mt-2 p-2 bg-mcf-amber/10 rounded-md text-center">
            <p className="text-sm font-medium text-mcf-primary-dark">
              Âge: {ageDisplay}
            </p>
          </div>
        )}
      </div>
      
      {/* Métier */}
      <div className="form-group">
        <label className="block text-lg font-semibold mb-2">
          Métier/Activité (facultatif)
        </label>
        <Input 
          value={job} 
          onChange={(e) => setJob(e.target.value)}
          placeholder="Ex: Professeur, écolier..." 
          className="border-mcf-amber"
        />
      </div>
    </>
  );
};

export default RelativeBasicInfoSection;
