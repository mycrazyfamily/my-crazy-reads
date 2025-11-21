import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Package, 
  Truck,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { MonthBookSlot, BookStatus } from '@/types/bookTimeline';
import MainBookOption from './MainBookOption';
import AlternativeBooksList from './AlternativeBooksList';
import CustomBookCreator from './CustomBookCreator';

interface MonthBookCardProps {
  slot: MonthBookSlot;
  childId: string;
  childName: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onSelectBook?: (bookId: string, isCustom: boolean) => void;
  onSaveCustomBook?: (data: any) => void;
  onSaveDetails?: (details: any) => void;
}

const statusConfig: Record<BookStatus, { label: string; icon: any; color: string; iconColor: string }> = {
  upcoming: {
    label: 'À planifier',
    icon: Calendar,
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    iconColor: 'text-gray-600',
  },
  pending_choice: {
    label: 'Choix en attente',
    icon: Sparkles,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    iconColor: 'text-yellow-600',
  },
  pending_details: {
    label: 'À personnaliser',
    icon: Clock,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    iconColor: 'text-orange-600',
  },
  details_complete: {
    label: 'Personnalisé',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
    iconColor: 'text-green-600',
  },
  in_production: {
    label: 'En création',
    icon: Sparkles,
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    iconColor: 'text-purple-600',
  },
  printing: {
    label: 'En impression',
    icon: Package,
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    iconColor: 'text-blue-600',
  },
  shipped: {
    label: 'Expédié',
    icon: Truck,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    iconColor: 'text-indigo-600',
  },
  delivered: {
    label: 'Livré',
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-300',
    iconColor: 'text-green-600',
  },
};

const MonthBookCard: React.FC<MonthBookCardProps> = ({
  slot,
  childId,
  childName,
  isExpanded = false,
  onToggleExpand,
  onSelectBook,
  onSaveCustomBook,
  onSaveDetails,
}) => {
  const config = statusConfig[slot.status];
  const StatusIcon = config.icon;
  
  const canInteract = ['upcoming', 'pending_choice', 'pending_details'].includes(slot.status);
  
  return (
    <Card className={`
      border-2 transition-all duration-300
      ${isExpanded 
        ? 'border-primary shadow-lg' 
        : 'border-border hover:border-primary/50 hover:shadow-md'
      }
    `}>
      <CardContent className="p-6">
        {/* En-tête du mois */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-foreground">
                {slot.monthLabel}
              </h3>
              <Badge className={`${config.color} border px-3 py-1`}>
                <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                {config.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Livraison prévue : {slot.deliveryDate}</span>
            </div>
          </div>
          
          {canInteract && onToggleExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpand}
              className="ml-4"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Réduire
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Voir les options
                </>
              )}
            </Button>
          )}
        </div>
        
        {/* Contenu condensé quand pas étendu */}
        {!isExpanded && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Livre prévu : <span className="font-semibold text-foreground">{slot.mainBook.title}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {slot.alternativeBooks.length} alternative{slot.alternativeBooks.length > 1 ? 's' : ''} disponible{slot.alternativeBooks.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
        
        {/* Contenu étendu avec options côte à côte */}
        {isExpanded && canInteract && (
          <div className="mt-6">
            {/* Grille avec les trois options et séparateurs OU */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 items-start">
              {/* Livre suggéré */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary text-center uppercase tracking-wide">
                  Livre suggéré
                </h4>
                <MainBookOption
                  book={slot.mainBook}
                  childName={childName}
                  isSelected={slot.selectedBookId === slot.mainBook.id && !slot.isCustomBook}
                  onSelect={() => onSelectBook?.(slot.mainBook.id, false)}
                  onSaveDetails={onSaveDetails}
                  existingDetails={slot.userDetails}
                />
              </div>
              
              {/* Séparateur OU */}
              <div className="hidden lg:flex flex-col items-center justify-center py-8">
                <div className="h-full w-px bg-border" />
                <div className="px-3 py-2 bg-background text-sm font-bold text-muted-foreground rounded-full border-2 border-border my-4">
                  OU
                </div>
                <div className="h-full w-px bg-border" />
              </div>
              
              {/* Mobile: Séparateur OU horizontal */}
              <div className="lg:hidden flex items-center justify-center gap-3 py-4">
                <div className="flex-1 h-px bg-border" />
                <div className="px-4 py-2 bg-background text-sm font-bold text-muted-foreground rounded-full border-2 border-border">
                  OU
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              
              {/* Livres alternatifs */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary text-center uppercase tracking-wide">
                  Alternatives ({slot.alternativeBooks.length})
                </h4>
                <AlternativeBooksList
                  books={slot.alternativeBooks}
                  selectedBookId={slot.selectedBookId}
                  onSelectBook={(bookId) => onSelectBook?.(bookId, false)}
                />
              </div>
              
              {/* Séparateur OU */}
              <div className="hidden lg:flex flex-col items-center justify-center py-8">
                <div className="h-full w-px bg-border" />
                <div className="px-3 py-2 bg-background text-sm font-bold text-muted-foreground rounded-full border-2 border-border my-4">
                  OU
                </div>
                <div className="h-full w-px bg-border" />
              </div>
              
              {/* Mobile: Séparateur OU horizontal */}
              <div className="lg:hidden flex items-center justify-center gap-3 py-4">
                <div className="flex-1 h-px bg-border" />
                <div className="px-4 py-2 bg-background text-sm font-bold text-muted-foreground rounded-full border-2 border-border">
                  OU
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              
              {/* Livre 100% inédit */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-primary text-center uppercase tracking-wide flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  100% inédit
                </h4>
                <CustomBookCreator
                  childId={childId}
                  childName={childName}
                  monthIndex={slot.monthIndex}
                  isSelected={slot.isCustomBook || false}
                  onSaveCustomBook={onSaveCustomBook}
                  existingData={slot.customBookData}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* État non-interactif (en production, expédié, livré) */}
        {!canInteract && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-center py-6 text-center">
              <div className="space-y-2">
                <StatusIcon className={`h-12 w-12 mx-auto ${config.iconColor}`} />
                <p className="font-medium text-foreground">
                  {slot.status === 'delivered' ? 'Livre déjà reçu !' : 'Livre en cours de création'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {slot.selectedBookId ? (
                    slot.isCustomBook ? 
                      "Votre histoire personnalisée" : 
                      slot.mainBook.title
                  ) : slot.mainBook.title}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthBookCard;
