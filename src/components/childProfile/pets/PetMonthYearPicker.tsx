import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PetMonthYearPickerProps {
  value?: string; // Format: "YYYY-MM"
  onChange: (value: string) => void;
  className?: string;
}

type Step = 'year' | 'month';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const PetMonthYearPicker: React.FC<PetMonthYearPickerProps> = ({
  value,
  onChange,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // Parse value when it changes
  useEffect(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number);
      if (year && month) {
        setSelectedYear(year);
        setSelectedMonth(month - 1); // month is 0-indexed
      }
    }
  }, [value]);

  // Generate years from current year back to 25 years ago
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 25;
  const years = Array.from({ length: currentYear - minYear + 1 }, (_, i) => currentYear - i);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep('month');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    if (selectedYear !== null) {
      const formattedValue = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
      onChange(formattedValue);
      setIsOpen(false);
      setStep('year'); // Reset for next time
    }
  };

  const calculateAge = () => {
    if (!value) return null;
    
    const [year, month] = value.split('-').map(Number);
    const birthDate = new Date(year, month - 1, 1);
    const now = new Date();
    
    const years = differenceInYears(now, birthDate);
    const months = differenceInMonths(now, birthDate) % 12;

    if (years === 0) {
      return `${months} mois`;
    } else if (months === 0) {
      return `${years} an${years > 1 ? 's' : ''}`;
    } else {
      return `${years} an${years > 1 ? 's' : ''} et ${months} mois`;
    }
  };

  const formatDisplayValue = () => {
    if (!value) return '';
    const [year, month] = value.split('-').map(Number);
    return `${String(month).padStart(2, '0')}/${year}`;
  };

  const renderYearPicker = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="text-muted-foreground"
        >
          Annuler
        </Button>
        <h3 className="text-lg font-semibold">Sélectionnez l'année</h3>
        <div className="w-20" />
      </div>
      <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
        {years.map((year) => (
          <Button
            key={year}
            type="button"
            variant={selectedYear === year ? "default" : "outline"}
            onClick={() => handleYearSelect(year)}
            className="h-12"
          >
            {year}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderMonthPicker = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setStep('year')}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        <h3 className="text-lg font-semibold">{selectedYear}</h3>
        <div className="w-20" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {MONTHS.map((month, index) => (
          <Button
            key={month}
            type="button"
            variant={selectedMonth === index ? "default" : "outline"}
            onClick={() => handleMonthSelect(index)}
            className="h-12"
          >
            {month}
          </Button>
        ))}
      </div>
      {selectedYear !== null && selectedMonth !== null && (
        <div className="text-center text-sm text-primary mt-4">
          Âge : {calculateAge()}
        </div>
      )}
    </div>
  );

  return (
    <div className={className}>
      <Input
        type="text"
        value={formatDisplayValue()}
        onClick={() => setIsOpen(!isOpen)}
        readOnly
        placeholder="Sélectionner la date"
        className="cursor-pointer"
      />
      {value && (
        <div className="text-center text-sm text-primary mt-2">
          Âge : {calculateAge()}
        </div>
      )}
      {isOpen && (
        <Card className={cn("p-4 mt-2", className)}>
          {step === 'year' && renderYearPicker()}
          {step === 'month' && renderMonthPicker()}
        </Card>
      )}
    </div>
  );
};
