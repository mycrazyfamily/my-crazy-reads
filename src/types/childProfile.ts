
export type RelativeType = 
  | "mother" | "father" | "otherParent" 
  | "sister" | "brother" 
  | "grandmother" | "grandfather" 
  | "femaleCousin" | "maleCousin" 
  | "femaleFriend" | "maleFriend" 
  | "other";

export type RelativeData = {
  id: string;
  type: RelativeType;
  firstName: string;
  nickname: {
    type: "none" | "mamoune" | "papou" | "custom";
    custom?: string;
  };
  age: string;
  job: string;
  skinColor: {
    type: "light" | "medium" | "dark" | "custom";
    custom?: string;
  };
  hairColor: {
    type: "blonde" | "chestnut" | "brown" | "red" | "black" | "custom";
    custom?: string;
  };
  hairType: "straight" | "wavy" | "curly" | "coily";
  glasses: boolean;
  traits: string[];
  customTraits?: Record<string, string>; // Ajout de customTraits pour stocker les traits personnalisés
  otherTypeName?: string;
};

export type FamilyData = {
  selectedRelatives: RelativeType[];
  relatives: RelativeData[];
  otherRelativeType?: string;
};

export type ChildProfileFormData = {
  firstName: string;
  nickname: {
    type: "none" | "petitChou" | "tresor" | "boubou" | "custom";
    custom?: string;
  };
  age: "0-2" | "3-5" | "6-7" | "8-10";
  gender: "girl" | "boy" | "neutral";
  skinColor: {
    type: "light" | "medium" | "dark" | "custom";
    custom?: string;
  };
  eyeColor: {
    type: "blue" | "green" | "brown" | "black" | "custom";
    custom?: string;
  };
  hairColor: {
    type: "blonde" | "chestnut" | "brown" | "red" | "black" | "custom";
    custom?: string;
  };
  hairType: "straight" | "wavy" | "curly" | "coily";
  glasses: boolean;
  
  height: "small" | "medium" | "tall";
  superpowers: string[];
  passions: string[];
  challenges: string[];

  family: FamilyData;
};
