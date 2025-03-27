
import { FavoriteWorldType, DiscoveryType } from '@/types/childProfile';

export const FAVORITE_WORLDS_OPTIONS = [
  { value: "animals" as FavoriteWorldType, label: "Animaux", icon: "🐻" },
  { value: "nature" as FavoriteWorldType, label: "Nature", icon: "🌳" },
  { value: "magic" as FavoriteWorldType, label: "Magie", icon: "✨" },
  { value: "space" as FavoriteWorldType, label: "Espace", icon: "🚀" },
  { value: "princesses" as FavoriteWorldType, label: "Princesses", icon: "👑" },
  { value: "dragons" as FavoriteWorldType, label: "Dragons", icon: "🐉" },
  { value: "pirates" as FavoriteWorldType, label: "Pirates", icon: "🏴‍☠️" },
  { value: "superheroes" as FavoriteWorldType, label: "Super-héros", icon: "🦸" },
  { value: "dinosaurs" as FavoriteWorldType, label: "Dinosaures", icon: "🦖" },
  { value: "robots" as FavoriteWorldType, label: "Robots", icon: "🤖" },
  { value: "monsters" as FavoriteWorldType, label: "Monstres", icon: "👹" },
  { value: "fairytales" as FavoriteWorldType, label: "Contes classiques", icon: "📚" },
  { value: "food" as FavoriteWorldType, label: "Nourriture", icon: "🍕" },
  { value: "wizards" as FavoriteWorldType, label: "Sorciers", icon: "🧙‍♂️" },
];

export const DISCOVERY_OPTIONS = [
  { value: "countries" as DiscoveryType, label: "De nouveaux pays", icon: "🗺️" },
  { value: "worldAnimals" as DiscoveryType, label: "Des animaux du monde", icon: "🌍" },
  { value: "traditions" as DiscoveryType, label: "Des traditions et cultures", icon: "🎎" },
  { value: "geography" as DiscoveryType, label: "La géographie", icon: "🧭" },
  { value: "emotions" as DiscoveryType, label: "Les émotions", icon: "🧠" },
  { value: "values" as DiscoveryType, label: "Des valeurs fortes (entraide, courage…)", icon: "🤝" },
  { value: "history" as DiscoveryType, label: "L'histoire des civilisations", icon: "🏛️" },
  { value: "legends" as DiscoveryType, label: "Les légendes et mythologies anciennes", icon: "🐉" },
  { value: "ecology" as DiscoveryType, label: "La planète et l'écologie", icon: "🌱" },
  { value: "nothing" as DiscoveryType, label: "Rien de tout cela", icon: "😅" },
];
