
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RELATIVE_TYPE_OPTIONS } from '@/constants/childProfileOptions';
import type { RelativeType } from '@/types/childProfile';

type RelativeTypeSelectionProps = {
  selectedRelatives: RelativeType[];
  handleRelativeTypeToggle: (relativeType: RelativeType) => void;
};

const RelativeTypeSelection: React.FC<RelativeTypeSelectionProps> = ({
  selectedRelatives,
  handleRelativeTypeToggle,
}) => {
  return (
    <>
      <FormField
        name="family.selectedRelatives"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold flex items-center gap-2">
              <span className="text-xl">👪</span> Qui accompagnera votre enfant dans son aventure ?
            </FormLabel>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {RELATIVE_TYPE_OPTIONS.map((option) => {
                const isChecked = selectedRelatives.includes(option.value as RelativeType);
                
                return (
                  <div 
                    key={option.value}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                      isChecked 
                        ? "border-mcf-orange bg-mcf-amber/10" 
                        : "border-gray-200 hover:border-mcf-amber"
                    }`}
                    onClick={() => handleRelativeTypeToggle(option.value as RelativeType)}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        <div className={`h-4 w-4 border ${isChecked ? "bg-primary border-primary" : "border-primary"} rounded-sm flex items-center justify-center`}>
                          {isChecked && <span className="text-white text-xs">✓</span>}
                        </div>
                      </div>
                      <div>
                        <div className="text-xl mb-1">{option.icon}</div>
                        <div>{option.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <FormMessage />
          </FormItem>
        )}
      />
      
      {selectedRelatives.includes('other') && (
        <FormField
          name="family.otherRelativeType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold flex items-center gap-2">
                <span className="text-xl">✨</span> Précisez quel(s) autre(s) type(s) de proche(s)
              </FormLabel>
              <Input 
                placeholder="Ex: nounou, ami de la famille..." 
                {...field} 
                className="border-mcf-amber" 
              />
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
};

export default RelativeTypeSelection;
