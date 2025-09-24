
import React from 'react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFormContext } from 'react-hook-form';
import type { ChildProfileFormData } from '@/types/childProfile';

const HeightSelector = () => {
  const form = useFormContext<ChildProfileFormData>();

  return (
    <FormField
      control={form.control}
      name="height"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-lg font-semibold flex items-center gap-2">
            <span className="text-xl">📏</span> Comment est sa taille par rapport à son âge ?
          </FormLabel>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
            {[
              { value: "small", label: "Petit(e) pour son âge" },
              { value: "medium", label: "Taille moyenne" },
              { value: "tall", label: "Grand(e) pour son âge" },
            ].map((option) => (
              <div
                key={option.value}
                className={`p-4 rounded-lg border-2 cursor-pointer text-center transition-all ${
                  field.value === option.value
                    ? "border-mcf-primary bg-mcf-secondary-light/50"
                    : "border-gray-200 hover:border-mcf-primary/50"
                }`}
                onClick={() => form.setValue("height", option.value as any)}
              >
                {option.label}
              </div>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default HeightSelector;
