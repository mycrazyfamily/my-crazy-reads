
import React, { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RELATIVE_TYPE_OPTIONS } from '@/constants/childProfileOptions';
import type { RelativeType, RelativeGender } from '@/types/childProfile';
import { differenceInMonths, differenceInYears, isAfter } from "date-fns";
import { fr } from 'date-fns/locale';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

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

// Helper function to determine gender based on relative type
const getRelativeGender = (type: RelativeType): RelativeGender => {
  const femaleTypes = ["mother", "sister", "grandmother", "femaleCousin", "femaleFriend"];
  const maleTypes = ["father", "brother", "grandfather", "maleCousin", "maleFriend"];
  
  if (femaleTypes.includes(type)) return "female";
  if (maleTypes.includes(type)) return "male";
  return "neutral";
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
    if (date && !isAfter(date, new Date())) {
      setBirthDate(date);
    } else {
      setBirthDate(undefined);
    }
  };
  // Update gender whenever the type changes
  useEffect(() => {
    const newGender = getRelativeGender(type);
    if (newGender !== gender) {
      setGender(newGender);
    }
  }, [type, gender, setGender]);

  const handleTypeChange = (value: RelativeType) => {
    setType(value);
    // Update gender immediately when type changes
    setGender(getRelativeGender(value));
  };

  return (
    <>
      {/* Type de proche */}
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">👤</span> Qui est ce proche ?
        </label>
        <Select 
          value={type} 
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="border-mcf-amber">
            <SelectValue placeholder="Type de proche" />
          </SelectTrigger>
          <SelectContent>
            {RELATIVE_TYPE_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.icon} {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Nom personnalisé pour "autre" */}
      {type === 'other' && (
        <div className="form-group">
          <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
            <span className="text-xl">✨</span> Précisez
          </label>
          <Input 
            value={otherTypeName || ''} 
            onChange={(e) => setOtherTypeName(e.target.value)}
            placeholder="Ex: ami de la famille, nounou..." 
            className="border-mcf-amber"
          />
        </div>
      )}
      
      {/* Prénom */}
      <div className="form-group">
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">👤</span> Prénom
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
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">🎂</span> Date de naissance
        </label>
        <div className="relative">
          <DatePicker
            selected={birthDate}
            onChange={handleDateChange}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            dateFormat="dd/MM/yyyy"
            placeholderText="JJ/MM/AAAA"
            locale={fr}
            maxDate={new Date()}
            yearDropdownItemNumber={50}
            customInput={
              <Input 
                className="border-mcf-amber"
              />
            }
            portalId="portal-root"
            className="z-50"
            onCalendarOpen={() => console.log('📅 Relative DatePicker opened')}
            onCalendarClose={() => console.log('📅 Relative DatePicker closed')}
          />
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
        <label className="block text-lg font-semibold flex items-center gap-2 mb-2">
          <span className="text-xl">💼</span> Métier/Activité (facultatif)
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
