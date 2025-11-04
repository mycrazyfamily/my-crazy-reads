import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PhysicalDetailsInputProps = {
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
};

const PhysicalDetailsInput: React.FC<PhysicalDetailsInputProps> = ({
  value = [],
  onChange,
  label = "🧬 Un détail physique marquant ?",
  placeholder = "Ex : un grain de beauté sur la joue gauche, une cicatrice derrière l'oreille, une tache de naissance sur la main..."
}) => {
  // Convert array to string for textarea
  const textValue = value.join('\n');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Split by newlines and filter out empty strings
    const details = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    onChange(details);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="physical-details" className="text-base font-medium">
        {label}
      </Label>
      <p className="text-sm text-muted-foreground">
        Grain de beauté, cicatrice, tache de naissance… Donne-nous tous les petits détails, et surtout dis-nous exactement où ils sont !
      </p>
      <Textarea
        id="physical-details"
        placeholder={placeholder}
        value={textValue}
        onChange={handleChange}
        className="min-h-[100px] resize-y"
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        Vous pouvez saisir plusieurs détails (un par ligne)
      </p>
    </div>
  );
};

export default PhysicalDetailsInput;
