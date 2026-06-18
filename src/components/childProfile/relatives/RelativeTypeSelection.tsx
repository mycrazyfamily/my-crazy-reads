import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { RELATIVE_TYPE_OPTIONS } from '@/constants/childProfileOptions';
import type { RelativeType } from '@/types/childProfile';
type RelativeTypeSelectionProps = {
  selectedRelatives: RelativeType[];
  handleRelativeTypeToggle: (relativeType: RelativeType) => void;
  onAddRelative: (relativeType: RelativeType) => void;
};
const RelativeTypeSelection: React.FC<RelativeTypeSelectionProps> = ({
  selectedRelatives,
  handleRelativeTypeToggle,
  onAddRelative
}) => {
  return (
    <>
      <FormField
        name="family.selectedRelatives"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold">
              Qui accompagnera votre enfant dans son aventure ?
            </FormLabel>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {RELATIVE_TYPE_OPTIONS.map((option) => {
                return (
                  <div 
                    key={option.value}
                    className="relative rounded-lg border-2 p-4 cursor-pointer transition-all border-gray-200 hover:border-mcf-amber hover:bg-mcf-amber/5"
                    onClick={() => {
                      handleRelativeTypeToggle(option.value as RelativeType);
                      onAddRelative(option.value as RelativeType);
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1">
                        <div className="h-4 w-4 border border-primary rounded-sm flex items-center justify-center">
                          {selectedRelatives.includes(option.value as RelativeType) && <Check className="h-3 w-3 text-white" />}
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
              <FormLabel className="text-lg font-semibold">
                Précisez quel(s) autre(s) type(s) de proche(s)
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
