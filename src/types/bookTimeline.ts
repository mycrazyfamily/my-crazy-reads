// Types pour la timeline des livres

export type BookStatus = 
  | 'upcoming'           // À venir (peut être personnalisé)
  | 'pending_choice'     // En attente de choix du parent
  | 'pending_details'    // Choix fait, en attente de détails
  | 'details_complete'   // Détails complétés
  | 'in_production'      // En production
  | 'printing'           // En impression
  | 'shipped'            // Expédié
  | 'delivered';         // Livré

export interface BookTheme {
  id: string;
  label: string;
  emoji: string;
  description: string;
  pedagogicalGoals: string[];
  ageRange: string;
}

export interface MainBook {
  id: string;
  title: string;
  subtitle?: string;
  theme: BookTheme;
  description: string;
  pedagogicalSummary: string;
  coverImageUrl?: string;
  estimatedPages: number;
  canCustomize: boolean;
  suggestedCharacters?: string[];
  suggestedQuestions?: string[];
}

export interface AlternativeBook {
  id: string;
  title: string;
  theme: BookTheme;
  description: string;
  coverImageUrl?: string;
  estimatedPages: number;
}

export interface CustomBookRequest {
  childId: string;
  monthIndex: number;
  storyIdea: string;
  selectedCharacters: string[];
  selectedPlaces: string[];
  specialRequests?: string;
  themes?: string[];
}

export interface MonthBookSlot {
  monthIndex: number; // 0-11 (0 = ce mois, 11 = dans 11 mois)
  monthLabel: string; // "Décembre 2025"
  deliveryDate: string; // "15 décembre 2025"
  status: BookStatus;
  
  // Livre principal (tronc commun)
  mainBook: MainBook;
  
  // Alternatives disponibles
  alternativeBooks: AlternativeBook[];
  
  // Choix de l'utilisateur
  selectedBookId?: string; // ID du livre choisi (main ou alternative)
  isCustomBook?: boolean;   // true si l'utilisateur crée un livre 100% inédit
  customBookData?: CustomBookRequest;
  
  // Personnalisation
  userDetails?: {
    selectedCharacters?: string[];
    customQuestions?: string[];
    additionalNotes?: string;
  };
}

export interface ChildBookTimeline {
  childId: string;
  childName: string;
  childAge: string;
  childAvatar?: string;
  childEmoji: string;
  
  // 12 slots mensuels
  monthlySlots: MonthBookSlot[];
  
  // Statistiques
  totalBooksPlanned: number;
  booksCustomized: number;
  booksDelivered: number;
}
