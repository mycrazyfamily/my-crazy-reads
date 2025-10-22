import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StepDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  minYear?: number;
  maxYear?: number;
  className?: string;
}

type Step = 'year' | 'month' | 'day';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export const StepDatePicker: React.FC<StepDatePickerProps> = ({
  value,
  onChange,
  minYear = 1920,
  maxYear = new Date().getFullYear(),
  className
}) => {
  const [step, setStep] = useState<Step>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(value?.getFullYear() ?? null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(value ? value.getMonth() : null);
  const [selectedDay, setSelectedDay] = useState<number | null>(value?.getDate() ?? null);

  useEffect(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
      setSelectedDay(value.getDate());
    }
  }, [value]);

  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep('month');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setStep('day');
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    if (selectedYear !== null && selectedMonth !== null) {
      const newDate = new Date(selectedYear, selectedMonth, day);
      onChange(newDate);
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderYearPicker = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(undefined)}
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
            variant={selectedMonth === index ? "default" : "outline"}
            onClick={() => handleMonthSelect(index)}
            className="h-12"
          >
            {month}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderDayPicker = () => {
    if (selectedYear === null || selectedMonth === null) return null;
    
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const adjustedFirstDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptySlots = Array.from({ length: adjustedFirstDay }, (_, i) => i);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep('month')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h3 className="text-lg font-semibold">
            {MONTHS[selectedMonth]} {selectedYear}
          </h3>
          <div className="w-20" />
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="text-sm font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
          {emptySlots.map((slot) => (
            <div key={`empty-${slot}`} className="p-2" />
          ))}
          {days.map((day) => (
            <Button
              key={day}
              variant={selectedDay === day ? "default" : "ghost"}
              onClick={() => handleDaySelect(day)}
              className="h-10 w-10 p-0"
            >
              {day}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("p-4", className)}>
      {step === 'year' && renderYearPicker()}
      {step === 'month' && renderMonthPicker()}
      {step === 'day' && renderDayPicker()}
    </Card>
  );
};
