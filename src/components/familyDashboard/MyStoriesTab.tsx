import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Sparkles } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MonthBookCard from './stories/MonthBookCard';
import { generateMockBookTimeline } from './stories/utils/mockData';
import { ChildBookTimeline } from '@/types/bookTimeline';
import { toast } from 'sonner';

interface Child {
  id: string;
  firstName: string;
  age: string;
  avatar: string | null;
  personalityEmoji: string;
}

interface MyStoriesTabProps {
  children: Child[];
}

const MyStoriesTab: React.FC<MyStoriesTabProps> = ({ children }) => {
  const [childrenTimelines, setChildrenTimelines] = useState<ChildBookTimeline[]>([]);
  const [expandedMonths, setExpandedMonths] = useState<Record<string, number>>({});
  
  // Générer les timelines pour chaque enfant
  useEffect(() => {
    const timelines = children.map(child => 
      generateMockBookTimeline(
        child.id,
        child.firstName,
        child.age,
        child.avatar || undefined,
        child.personalityEmoji
      )
    );
    setChildrenTimelines(timelines);
  }, [children]);
  
  // Gérer l'expansion des cartes de mois
  const toggleMonthExpansion = (childId: string, monthIndex: number) => {
    const key = `${childId}-${monthIndex}`;
    setExpandedMonths(prev => ({
      ...prev,
      [key]: prev[key] === monthIndex ? -1 : monthIndex,
    }));
  };
  
  // Gérer la sélection d'un livre
  const handleSelectBook = (childId: string, monthIndex: number, bookId: string, isCustom: boolean) => {
    setChildrenTimelines(prev => prev.map(timeline => {
      if (timeline.childId !== childId) return timeline;
      
      return {
        ...timeline,
        monthlySlots: timeline.monthlySlots.map(slot => {
          if (slot.monthIndex !== monthIndex) return slot;
          
          return {
            ...slot,
            selectedBookId: isCustom ? undefined : bookId,
            isCustomBook: isCustom,
            status: 'pending_details',
          };
        }),
      };
    }));
    
    toast.success(
      isCustom 
        ? '✨ Livre personnalisé sélectionné' 
        : '📚 Livre sélectionné avec succès'
    );
  };
  
  // Gérer la sauvegarde de détails
  const handleSaveDetails = (childId: string, monthIndex: number, details: any) => {
    setChildrenTimelines(prev => prev.map(timeline => {
      if (timeline.childId !== childId) return timeline;
      
      return {
        ...timeline,
        monthlySlots: timeline.monthlySlots.map(slot => {
          if (slot.monthIndex !== monthIndex) return slot;
          
          return {
            ...slot,
            userDetails: details,
            status: 'details_complete',
          };
        }),
      };
    }));
    
    toast.success('✅ Personnalisation enregistrée');
  };
  
  // Gérer la création d'un livre personnalisé
  const handleSaveCustomBook = (childId: string, monthIndex: number, data: any) => {
    setChildrenTimelines(prev => prev.map(timeline => {
      if (timeline.childId !== childId) return timeline;
      
      return {
        ...timeline,
        monthlySlots: timeline.monthlySlots.map(slot => {
          if (slot.monthIndex !== monthIndex) return slot;
          
          return {
            ...slot,
            customBookData: data,
            isCustomBook: true,
            selectedBookId: undefined,
            status: 'details_complete',
          };
        }),
      };
    }));
    
    toast.success('🎉 Livre 100% personnalisé créé !');
  };

  if (children.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed bg-muted/30">
        <div className="flex flex-col items-center gap-6">
          <div className="p-6 rounded-full bg-primary/10">
            <Book className="h-16 w-16 text-primary" strokeWidth={1.5} />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold text-foreground">
              Commencez votre aventure
            </h3>
            <p className="text-muted-foreground">
              Ajoutez le profil de votre enfant pour créer ses premières histoires personnalisées
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Tabs defaultValue={children[0]?.id} className="w-full">
      <TabsList className="w-full justify-start mb-8 bg-muted/50 p-1">
        {children.map((child) => (
          <TabsTrigger
            key={child.id}
            value={child.id}
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-primary"
          >
            <Avatar className="h-6 w-6 border border-border">
              {child.avatar ? (
                <AvatarImage src={child.avatar} alt={child.firstName} />
              ) : (
                <AvatarFallback className="text-xs bg-primary/10">
                  {child.personalityEmoji}
                </AvatarFallback>
              )}
            </Avatar>
            <span className="font-medium">{child.firstName}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {childrenTimelines.map((timeline) => (
        <TabsContent key={timeline.childId} value={timeline.childId} className="space-y-6">
          {/* En-tête enfant avec avatar et statistiques */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  {timeline.childAvatar ? (
                    <AvatarImage src={timeline.childAvatar} alt={timeline.childName} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-4xl">
                      {timeline.childEmoji}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-foreground mb-1">
                    Les histoires de {timeline.childName}
                  </h2>
                  <p className="text-muted-foreground mb-3">
                    {timeline.childAge} • Timeline sur 12 mois
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Book className="h-4 w-4 text-primary" />
                      <span className="font-medium">{timeline.totalBooksPlanned}</span>
                      <span className="text-muted-foreground">livres prévus</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium">{timeline.booksCustomized}</span>
                      <span className="text-muted-foreground">personnalisés</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Frise chronologique des 12 mois */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-sm font-medium text-muted-foreground px-3">
                Prochains 12 mois
              </span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>
            
            {timeline.monthlySlots.map((slot) => {
              const key = `${timeline.childId}-${slot.monthIndex}`;
              const isExpanded = expandedMonths[key] === slot.monthIndex;
              
              return (
                <MonthBookCard
                  key={key}
                  slot={slot}
                  childId={timeline.childId}
                  childName={timeline.childName}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleMonthExpansion(timeline.childId, slot.monthIndex)}
                  onSelectBook={(bookId, isCustom) => 
                    handleSelectBook(timeline.childId, slot.monthIndex, bookId, isCustom)
                  }
                  onSaveCustomBook={(data) => 
                    handleSaveCustomBook(timeline.childId, slot.monthIndex, data)
                  }
                  onSaveDetails={(details) => 
                    handleSaveDetails(timeline.childId, slot.monthIndex, details)
                  }
                />
              );
            })}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default MyStoriesTab;
