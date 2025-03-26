
export type RelativeType = 
  | "mother" | "father" | "otherParent" 
  | "sister" | "brother" 
  | "grandmother" | "grandfather" 
  | "femaleCousin" | "maleCousin" 
  | "femaleFriend" | "maleFriend" 
  | "other";

export type RelativeGender = "male" | "female" | "neutral";

export type RelativeTypeInfo = {
  type: RelativeType;
  gender: RelativeGender;
};

export type NicknameType = 
  | "none" | "custom"
  | "mamoune" | "mamandamour"
  | "papou" | "papaours"
  | "tata" | "tonton"
  | "soeurette" | "chouquette"
  | "frerot" | "loulou" 
  | "mamie" | "maminou"
  | "papi" | "papinou"
  | "cousinette" | "lili"
  | "cousinou" | "nino"
  | "copinedecoeur" | "bff"
  | "copainfidele";

export type RelativeData = {
  id: string;
  type: RelativeType;
  gender: RelativeGender;
  firstName: string;
  nickname: {
    type: NicknameType;
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
  customTraits?: Record<string, string>;
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
