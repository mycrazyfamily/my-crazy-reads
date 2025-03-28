
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import type { ChildProfileFormData } from '@/types/childProfile';
import OptionCard from './OptionCard';

type Option = {
  value: string;
  label: string;
  icon: string;
};

type MultiSelectOptionsGroupProps = {
  fieldName: 'superpowers' | 'passions' | 'challenges';
  options: Option[];
  label: string;
  icon: string;
  maxItems?: number;
};

const MultiSelectOptionsGroup: React.FC<MultiSelectOptionsGroupProps> = ({
  fieldName,
  options,
  label,
  icon,
  maxItems = 3
}) => {
  const form = useFormContext<ChildProfileFormData>();

  const handleOptionToggle = (value: string) => {
    const currentValues = form.watch(fieldName) || [];
    
    if (currentValues.includes(value)) {
      // Remove value
      form.setValue(
        fieldName, 
        currentValues.filter(val => val !== value)
      );
    } else {
      // Add value if less than maxItems selected
      if (currentValues.length < maxItems) {
        form.setValue(fieldName, [...currentValues, value]);
      } else {
        toast.error(`Vous pouvez sélectionner ${maxItems} ${
          fieldName === 'superpowers' ? 'super-pouvoirs' : 
          fieldName === 'passions' ? 'passions' : 'défis'
        } maximum`);
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name={fieldName}
      render={() => (
        <FormItem>
          <FormLabel className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">{icon}</span> {label}
          </FormLabel>
          
          <div className={`grid grid-cols-2 ${fieldName === 'passions' ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-3'} gap-3 mt-3`}>
            {options.map((option) => {
              const isSelected = form.watch(fieldName)?.includes(option.value);
              const totalSelected = form.watch(fieldName)?.length || 0;
              const isDisabled = !isSelected && totalSelected >= maxItems;
              
              return (
                <OptionCard
                  key={option.value}
                  isSelected={isSelected}
                  isDisabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled || isSelected) {
                      handleOptionToggle(option.value);
                    }
                  }}
                  icon={option.icon}
                  label={option.label}
                />
              );
            })}
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default MultiSelectOptionsGroup;
