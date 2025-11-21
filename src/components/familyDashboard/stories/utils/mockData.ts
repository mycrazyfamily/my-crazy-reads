// Données de mock pour les livres - à remplacer par de vraies données depuis la DB

import { ChildBookTimeline, MonthBookSlot, BookTheme, MainBook, AlternativeBook } from '@/types/bookTimeline';

// Thèmes disponibles
export const bookThemes: Record<string, BookTheme> = {
  emotions: {
    id: 'emotions',
    label: 'Émotions',
    emoji: '❤️',
    description: 'Comprendre et gérer ses émotions',
    pedagogicalGoals: ['Intelligence émotionnelle', 'Empathie', 'Gestion des sentiments'],
    ageRange: '3-7 ans',
  },
  family: {
    id: 'family',
    label: 'Famille',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Explorer les liens familiaux',
    pedagogicalGoals: ['Liens affectifs', 'Rôles familiaux', 'Respect mutuel'],
    ageRange: '3-8 ans',
  },
  nature: {
    id: 'nature',
    label: 'Nature',
    emoji: '🌳',
    description: 'Découvrir la nature et l\'environnement',
    pedagogicalGoals: ['Écologie', 'Biodiversité', 'Respect de la nature'],
    ageRange: '4-8 ans',
  },
  courage: {
    id: 'courage',
    label: 'Courage',
    emoji: '🦁',
    description: 'Développer confiance et courage',
    pedagogicalGoals: ['Confiance en soi', 'Dépassement de soi', 'Résilience'],
    ageRange: '4-9 ans',
  },
  friendship: {
    id: 'friendship',
    label: 'Amitié',
    emoji: '🤝',
    description: 'Cultiver l\'amitié et la bienveillance',
    pedagogicalGoals: ['Relations sociales', 'Partage', 'Entraide'],
    ageRange: '3-8 ans',
  },
  creativity: {
    id: 'creativity',
    label: 'Créativité',
    emoji: '🎨',
    description: 'Stimuler l\'imagination et la créativité',
    pedagogicalGoals: ['Expression artistique', 'Imagination', 'Innovation'],
    ageRange: '3-10 ans',
  },
  science: {
    id: 'science',
    label: 'Sciences',
    emoji: '🔬',
    description: 'Découvrir les sciences de manière ludique',
    pedagogicalGoals: ['Curiosité scientifique', 'Expérimentation', 'Raisonnement'],
    ageRange: '5-10 ans',
  },
  adventure: {
    id: 'adventure',
    label: 'Aventure',
    emoji: '🗺️',
    description: 'Vivre des aventures passionnantes',
    pedagogicalGoals: ['Exploration', 'Curiosité', 'Débrouillardise'],
    ageRange: '4-10 ans',
  },
};

// Générer les données de mock pour un enfant
export const generateMockBookTimeline = (
  childId: string,
  childName: string,
  childAge: string,
  childAvatar?: string,
  childEmoji: string = '😊'
): ChildBookTimeline => {
  const now = new Date();
  const monthlySlots: MonthBookSlot[] = [];
  
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  // Livres principaux pour chaque mois
  const mainBooks: MainBook[] = [
    {
      id: 'main-1',
      title: `${childName} et le Jardin des Émotions`,
      subtitle: 'Une aventure au cœur des sentiments',
      theme: bookThemes.emotions,
      description: `${childName} découvre un jardin magique où chaque fleur représente une émotion différente. Une histoire pour apprendre à reconnaître et exprimer ses sentiments.`,
      pedagogicalSummary: 'Aide l\'enfant à identifier, nommer et comprendre ses émotions à travers une métaphore poétique.',
      estimatedPages: 32,
      canCustomize: true,
      suggestedCharacters: ['Maman', 'Papa', 'Grand-mère'],
      suggestedQuestions: [
        'Quelle émotion ressens-tu le plus souvent ?',
        'Comment te sens-tu quand tu es content/triste ?'
      ],
    },
    {
      id: 'main-2',
      title: `La Grande Aventure Familiale de ${childName}`,
      theme: bookThemes.family,
      description: `Une journée extraordinaire où ${childName} et sa famille vivent des moments magiques ensemble.`,
      pedagogicalSummary: 'Renforce les liens familiaux et valorise les moments partagés.',
      estimatedPages: 28,
      canCustomize: true,
      suggestedCharacters: ['Toute la famille'],
      suggestedQuestions: [
        'Quel est ton moment préféré en famille ?',
        'Qui fait le meilleur câlin dans ta famille ?'
      ],
    },
    {
      id: 'main-3',
      title: `${childName} Protège la Forêt Enchantée`,
      theme: bookThemes.nature,
      description: `${childName} part en mission pour sauver une forêt magique et ses habitants.`,
      pedagogicalSummary: 'Sensibilise à la protection de l\'environnement et à l\'importance de la nature.',
      estimatedPages: 36,
      canCustomize: true,
      suggestedCharacters: ['Ami(e)', 'Animal de compagnie'],
      suggestedQuestions: [
        'Comment peut-on protéger la nature ?',
        'Quel est ton animal préféré ?'
      ],
    },
    // ... répéter pour les 12 mois
  ];
  
  // Livres alternatifs
  const alternativeBooks: AlternativeBook[] = [
    {
      id: 'alt-1-1',
      title: `${childName} le Courageux`,
      theme: bookThemes.courage,
      description: 'Une histoire pour apprendre à surmonter ses peurs.',
      estimatedPages: 28,
    },
    {
      id: 'alt-1-2',
      title: `${childName} et ses Nouveaux Amis`,
      theme: bookThemes.friendship,
      description: 'Découvrir la valeur de l\'amitié et du partage.',
      estimatedPages: 30,
    },
    {
      id: 'alt-2-1',
      title: `${childName} l\'Artiste`,
      theme: bookThemes.creativity,
      description: 'Une aventure créative pleine de couleurs.',
      estimatedPages: 32,
    },
    {
      id: 'alt-2-2',
      title: `${childName} Petit Scientifique`,
      theme: bookThemes.science,
      description: 'Des découvertes scientifiques fascinantes.',
      estimatedPages: 34,
    },
  ];
  
  // Générer les 12 slots mensuels
  for (let i = 0; i < 12; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 15);
    const monthName = months[targetDate.getMonth()];
    const year = targetDate.getFullYear();
    
    // Définir le statut selon le mois
    let status: MonthBookSlot['status'];
    if (i === 0) status = 'pending_details';
    else if (i === 1) status = 'pending_choice';
    else if (i === 2) status = 'in_production';
    else if (i === 3) status = 'printing';
    else status = 'upcoming';
    
    // Sélectionner des alternatives aléatoires
    const selectedAlternatives = i % 2 === 0 
      ? [alternativeBooks[0], alternativeBooks[1]]
      : [alternativeBooks[2], alternativeBooks[3]];
    
    monthlySlots.push({
      monthIndex: i,
      monthLabel: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
      deliveryDate: `15 ${monthName} ${year}`,
      status,
      mainBook: mainBooks[i % mainBooks.length],
      alternativeBooks: selectedAlternatives,
    });
  }
  
  return {
    childId,
    childName,
    childAge,
    childAvatar,
    childEmoji,
    monthlySlots,
    totalBooksPlanned: 12,
    booksCustomized: 0,
    booksDelivered: 0,
  };
};
