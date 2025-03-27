
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

export type PetType = "dog" | "cat" | "rabbit" | "bird" | "fish" | "reptile" | "other";

export type PetTrait = 
  | "playful" | "lazy" | "protective" | "clingy" 
  | "clever" | "grumpy" | "gentle" | "noisy" | "talkative" 
  | "other" | "other2"; // Ajout du second trait personnalisé "other2"

export type PetData = {
  id: string;
  name: string;
  type: PetType;
  otherType?: string;
  traits: PetTrait[];
  customTraits?: Record<string, string>; // Added custom traits field
};

export type PetsData = {
  hasPets: boolean;
  pets: PetData[];
};

// Nouveaux types pour les doudous et objets magiques
export type ToyType = "plush" | "blanket" | "doll" | "miniCar" | "figurine" | "other";

export type ToyRole = 
  | "sleepGuardian" | "invisibleFriend" | "magicProtector" 
  | "secretHero" | "playmate" | "noSpecificRole"
  | "otherRole1" | "otherRole2";

export type ToyData = {
  id: string;
  name: string;
  type: ToyType;
  otherType?: string;
  appearance: string;
  roles: ToyRole[];
  customRoles?: {
    otherRole1?: string;
    otherRole2?: string;
  };
};

export type ToysData = {
  hasToys: boolean;
  toys: ToyData[];
};

// Nouveaux types pour les univers préférés et découvertes
export type FavoriteWorldType = 
  | "animals" | "nature" | "magic" | "space" 
  | "princesses" | "dragons" | "pirates" | "superheroes" 
  | "dinosaurs" | "robots" | "monsters" | "fairytales" 
  | "food" | "wizards" 
  | "other1" | "other2"; // Ajout des options "Autre 1" et "Autre 2"

export type DiscoveryType = 
  | "countries" | "worldAnimals" | "traditions" | "geography" 
  | "emotions" | "values" | "history" | "legends" 
  | "ecology" | "nothing"
  | "other1" | "other2"; // Ajout des options "Autre 1" et "Autre 2"

export type WorldsData = {
  favoriteWorlds: FavoriteWorldType[];
  discoveries: DiscoveryType[];
  customWorlds?: {
    other1?: string;
    other2?: string;
  };
  customDiscoveries?: {
    other1?: string;
    other2?: string;
  };
};

export type ChildProfileFormData = {
  firstName: string;
  nickname: {
    type: "none" | "petitChou" | "tresor" | "boubou" | "custom";
    custom?: string;
  };
  birthDate?: Date; // Champ ajouté pour la date de naissance
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
  pets: PetsData;
  toys: ToysData; // Ajout des doudous et objets magiques
  worlds: WorldsData; // Ajout des univers préférés et découvertes
};
