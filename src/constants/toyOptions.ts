
import type { ToyType, ToyRole } from "@/types/childProfile";

export const toyTypeOptions: { value: ToyType; label: string; emoji: string }[] = [
  { value: "plush", label: "Peluche", emoji: "🐻" },
  { value: "blanket", label: "Couverture", emoji: "🧣" },
  { value: "doll", label: "Poupée", emoji: "🧍" },
  { value: "miniCar", label: "Véhicule miniature", emoji: "🚗" },
  { value: "figurine", label: "Figurine", emoji: "🦸" },
  { value: "other", label: "Autre", emoji: "📦" }
];

export const toyRoleOptions: { value: ToyRole; label: string; emoji: string }[] = [
  { value: "sleepGuardian", label: "Garde du sommeil", emoji: "🛏️" },
  { value: "invisibleFriend", label: "Ami invisible", emoji: "🤝" },
  { value: "magicProtector", label: "Protecteur magique", emoji: "🪄" },
  { value: "secretHero", label: "Super-héros secret", emoji: "🦸" },
  { value: "playmate", label: "Compagnon de jeux", emoji: "🎮" },
  { value: "noSpecificRole", label: "Aucun rôle particulier", emoji: "❓" },
  { value: "otherRole1", label: "Autre", emoji: "✨" },
  { value: "otherRole2", label: "Autre", emoji: "✨" }
];
