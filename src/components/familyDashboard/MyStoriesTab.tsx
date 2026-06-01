import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowLeft, Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFamilyData, type FamilyChild } from '@/hooks/useFamilyData';
import { useBookTimeline, type BookTimelineRow } from '@/hooks/useBookTimeline';
import { useSaveBookChoice, type CharacterChoice } from '@/hooks/useSaveBookChoice';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Child {
  id: string;
  firstName: string;
  age: string;
  avatar: string | null;
  personalityEmoji: string;
}

interface MyStoriesTabProps {
  children?: Child[];
}

// ---------- Mock data ----------

type MonthStatus =
  | 'to_personalize'
  | 'configured'
  | 'in_creation'
  | 'in_printing'
  | 'shipped'
  | 'delivered'
  | 'to_plan';

interface MockMonth {
  monthIndex: number;
  monthLabel: string;
  deliveryDate: string;
  deliveryShort: string;
  status: MonthStatus;
  bookTitle: string;
  bookSummary: string;
  bookTags: string[];
  // contextual
  deadline?: string;
  daysLeft?: number;
  configuredOn?: string;
  configuredCharacters?: string[];
  bookRequestId?: string;
  themeId?: string | null;
  configuredSummary?: string;
  savedNote?: string;
  savedLocationId?: string | null;
  savedLocationLabel?: string | null;
  substituteOptions?: Array<{
    substituteThemeId: string;
    substituteThemeTitre: string;
    substituteCondition: string;
    substitutePersonName: string;
  }>;
  selectedThemeType?: string | null;
  selectedThemeId?: string | null;
  originalThemeInstructions?: string | null;
  dedicatedPersonName?: string | null;
  isPreparing?: boolean;
  alternatives?: Array<
    | { type: 'birthday'; label: string; substituteIndex: number; substituteThemeId: string }
    | { type: 'milestone'; label: string; substituteIndex: number; substituteThemeId: string }
    | { type: 'custom'; label: string }
  >;
}

const MOCK_MONTHS: MockMonth[] = [
  {
    monthIndex: 0,
    monthLabel: 'Juin 2026',
    deliveryDate: '15 juin 2026',
    deliveryShort: '15 juin',
    status: 'to_personalize',
    bookTitle: "L'île du temps",
    bookSummary: "Manon découvre une île mystérieuse où chaque grain de sable raconte une histoire. Un voyage poétique pour comprendre le temps qui passe.",
    bookTags: ['32 pages', '6–7 ans', 'Résolution de problème'],
    deadline: '20 mai',
    daysLeft: 14,
    substituteOptions: [
      {
        substituteThemeId: 'sub-1',
        substituteThemeTitre: "L'anniversaire de Jules",
        substituteCondition: 'birthday',
        substitutePersonName: 'Jules',
      },
    ],
  },
  {
    monthIndex: 1,
    monthLabel: 'Juillet 2026',
    deliveryDate: '15 juillet 2026',
    deliveryShort: '15 juillet',
    status: 'configured',
    bookTitle: 'Les vacances au bout du monde',
    bookSummary: "Une grande aventure familiale où Manon explore des paysages extraordinaires.",
    bookTags: ['28 pages', '6–7 ans', 'Découverte'],
    configuredOn: '3 mai',
    configuredCharacters: ['Jules', 'Papa'],
  },
  {
    monthIndex: 2,
    monthLabel: 'Août 2026',
    deliveryDate: '15 août 2026',
    deliveryShort: '15 août',
    status: 'in_creation',
    bookTitle: 'La porte des grands',
    bookSummary: "Manon franchit une porte magique vers le monde des grands.",
    bookTags: ['32 pages', '6–7 ans', 'Confiance en soi'],
  },
  {
    monthIndex: 3,
    monthLabel: 'Septembre 2026',
    deliveryDate: '1er septembre 2026',
    deliveryShort: '1er septembre',
    status: 'in_printing',
    bookTitle: 'La classe des explorateurs du savoir',
    bookSummary: "Manon entre dans une école pas comme les autres.",
    bookTags: ['36 pages', '6–7 ans', 'Curiosité'],
  },
  ...[
    ['Octobre 2026', '15 octobre 2026', '15 octobre', "Le carnaval des étoiles"],
    ['Novembre 2026', '15 novembre 2026', '15 novembre', "Le secret de la rivière"],
    ['Décembre 2026', '15 décembre 2026', '15 décembre', "Un Noël hors du temps"],
    ['Janvier 2027', '15 janvier 2027', '15 janvier', "La forêt des murmures"],
    ['Février 2027', '15 février 2027', '15 février', "Le grand défi du courage"],
    ['Mars 2027', '15 mars 2027', '15 mars', "Le printemps des inventeurs"],
    ['Avril 2027', '15 avril 2027', '15 avril', "Le carnet des mille rêves"],
    ['Mai 2027', '15 mai 2027', '15 mai', "Le voyage du dernier dragon"],
  ].map(([label, date, short, title], i): MockMonth => ({
    monthIndex: 4 + i,
    monthLabel: label,
    deliveryDate: date,
    deliveryShort: short,
    status: 'to_plan',
    bookTitle: title,
    bookSummary: `Une nouvelle aventure attend Manon dans ${title.toLowerCase()}.`,
    bookTags: ['32 pages', '6–7 ans', 'Imagination'],
    deadline: '—',
  })),
];

const MOCK_CHARACTERS = [
  { id: 'maman', label: 'Maman', emoji: '👩' },
  { id: 'papa', label: 'Papa', emoji: '👨' },
  { id: 'jules', label: 'Jules', emoji: '🧒' },
  { id: 'valentine', label: 'Valentine', emoji: '👧' },
  { id: 'broski', label: 'Broski', emoji: '🐶' },
  { id: 'mamie', label: 'Grand-mère', emoji: '👵' },
];

// ---------- Status badge config ----------

const STATUS_CONFIG: Record<MonthStatus, { label: string; badgeClass: string; borderClass: string; secondaryClass: string }> = {
  to_personalize: {
    label: 'Votre livre est prêt ✨',
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    borderClass: 'border-l-[3px] border-l-orange-400',
    secondaryClass: 'text-orange-600',
  },
  configured: {
    label: 'Configuré',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  in_creation: {
    label: 'En création',
    badgeClass: 'bg-violet-100 text-violet-700 border-violet-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  in_printing: {
    label: 'En impression',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  to_plan: {
    label: 'Bientôt disponible',
    badgeClass: 'bg-gray-50 text-gray-400 border-gray-100',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground/60',
  },
  shipped: {
    label: '🚚 Expédié',
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
  delivered: {
    label: '✓ Livré',
    badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
  },
};

const PRIMARY_VIOLET = '#534AB7';

// Avatar with shimmer skeleton until image loads
const WizardAvatar: React.FC<{ avatarUrl?: string; emoji: string; name: string }> = ({ avatarUrl, emoji, name }) => {
  const [loaded, setLoaded] = useState(false);
  if (!avatarUrl) {
    return <span className="text-3xl">{emoji}</span>;
  }
  return (
    <div className={`w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 ${loaded ? '' : 'animate-pulse'}`}>
      <img
        src={avatarUrl}
        alt={name}
        className="w-full h-full object-cover"
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; setLoaded(true); }}
      />
    </div>
  );
};

// Helper: replace [Prénom] placeholder with real child name
const formatTitle = (text: string | null, firstName: string) =>
  text?.replace(/\[Prénom\]/g, firstName) ?? '';
const formatSummary = (text: string | null, firstName: string, gender?: string) => {
  if (!text) return '';
  const isFemale = gender === 'girl' || gender === 'female';
  return text
    .replace(/\[Prénom\]/g, firstName)
    .replace(/\[le\/la\]/g, isFemale ? 'la' : 'le')
    .replace(/\[lui\/elle\]/g, isFemale ? 'elle' : 'lui')
    .replace(/\[il\/elle\]/g, isFemale ? 'elle' : 'il')
    .replace(/\[son\/sa\] \[ami\/amie\]/g, isFemale ? 'son amie' : 'son ami')
    .replace(/\[son\/sa\]/g, isFemale ? 'sa' : 'son')
    .replace(/\[ami\/amie\]/g, isFemale ? 'amie' : 'ami')
    .replace(/\[cousin\/cousine\]/g, isFemale ? 'cousine' : 'cousin')
    .replace(/\[cousine\/cousin\]/g, isFemale ? 'cousine' : 'cousin')
    .replace(/\[Curieux\/Curieuse\]/g, isFemale ? 'Curieuse' : 'Curieux')
    .replace(/cousin\(e\)/g, isFemale ? 'cousine' : 'cousin')
    .replace(/Curieux\/se/g, isFemale ? 'Curieuse' : 'Curieux');
};

// ---------- Supabase row → MockMonth shape ----------

const PLACEHOLDER_TITLE = 'Thème à venir';

function mapTimelineRow(row: BookTimelineRow, idx: number, childName: string, childId: string, gender?: string): MockMonth {
  console.log('DEBUG dedicated:', {
    selected_theme_id: row.selected_theme_id,
    selected_theme_type: row.selected_theme_type,
    substitute_options: row.substitute_options,
    is_array: Array.isArray(row.substitute_options)
  });
  const delivery = parseISO(row.delivery_month);
  const deadline = row.personalization_deadline ? parseISO(row.personalization_deadline) : null;
  const daysLeft = deadline ? differenceInCalendarDays(deadline, new Date()) : undefined;

  let status: MonthStatus = 'to_plan';
  if (row.status === 'pending_choice') {
    status = daysLeft !== undefined && daysLeft <= 14 ? 'to_personalize' : 'to_plan';
  } else if (row.status === 'configured' || row.status === 'locked') {
    status = row.production_status === 'printing' ? 'in_printing' : 'configured';
  } else if (row.status === 'generating' || row.production_status === 'generating') {
    status = 'in_creation';
  } else if (row.status === 'printing' || row.production_status === 'printing') {
    status = 'in_printing';
  } else if (row.status === 'shipped') {
    status = 'shipped';
  } else if (row.status === 'delivered') {
    status = 'delivered';
  }

  const monthLabel = format(delivery, 'LLLL yyyy', { locale: fr }).replace(/^./, (c) => c.toUpperCase());
  const deliveryDate = format(delivery, "d MMMM yyyy", { locale: fr });
  const deliveryShort = format(delivery, "d MMMM", { locale: fr });
  const deadlineShort = deadline ? format(deadline, 'd MMMM', { locale: fr }) : '';

  return {
    monthIndex: idx,
    monthLabel,
    deliveryDate,
    deliveryShort,
    status,
    isPreparing: ['locked', 'generating', 'printing', 'shipped', 'delivered'].includes(row.status),
    bookTitle: (() => {
      if (row.selected_theme_type === 'original')
        return '✨ Histoire inédite';
      if (row.selected_theme_titre)
        return formatTitle(row.selected_theme_titre, childName);
      if (row.titre)
        return formatTitle(row.titre, childName);
      return PLACEHOLDER_TITLE;
    })(),
    bookSummary: (() => {
      if (row.selected_theme_type === 'original') {
        if (row.original_theme_instructions)
          return row.original_theme_instructions;
        return 'Votre histoire est en cours de préparation…';
      }
      if (row.selected_theme_resume)
        return formatSummary(row.selected_theme_resume, childName, gender);
      if (row.resume_narratif)
        return formatSummary(row.resume_narratif, childName, gender);
      return '';
    })(),
    bookTags: [],
    deadline: deadlineShort,
    daysLeft: daysLeft !== undefined && daysLeft >= 0 ? daysLeft : undefined,
    bookRequestId: row.book_request_id,
    themeId: row.theme_id ?? null,
    savedNote: row.saved_note || '',
    savedLocationId: row.selected_location_id ?? null,
    savedLocationLabel: row.selected_location_label ?? null,
    substituteOptions: (row.substitute_options || []).map((s: any) => ({
      substituteThemeId: s.substitute_theme_id,
      substituteThemeTitre: s.substitute_theme_titre,
      substituteCondition: s.substitute_condition,
      substitutePersonName: s.substitute_person_name,
    })),
    selectedThemeType: row.selected_theme_type ?? null,
    selectedThemeId: row.selected_theme_id ?? null,
    originalThemeInstructions: row.original_theme_instructions ?? null,
    dedicatedPersonName: (() => {
      if (!row.selected_characters || !Array.isArray(row.selected_characters)) return null;
      const found = (row.selected_characters as any[]).find((c: any) => c?.dedicated === true);
      return found?.name ?? null;
    })(),
    configuredCharacters: (() => {
      if (!row.selected_characters || !Array.isArray(row.selected_characters)) return [];
      return (row.selected_characters as any[])
        .filter((c: any) => c.id !== childId)
        .map((c: any) => c.name);
    })(),
    configuredSummary: (() => {
      const parts: string[] = [];
      if (row.selected_characters && Array.isArray(row.selected_characters)) {
        const names = (row.selected_characters as any[])
          .filter((c: any) => c.id !== childId)
          .map((c: any) => c.name);
        if (names.length > 0) parts.push(`Avec ${names.join(', ')}`);
      }
      if (row.saved_note && row.saved_note.trim()) {
        parts.push(`"${row.saved_note.slice(0, 40)}${row.saved_note.length > 40 ? '…' : ''}"`);
      }
      return parts.join(' · ') || undefined;
    })(),
    alternatives: (() => {
      const alts: NonNullable<MockMonth['alternatives']> = [];
      (row.substitute_options || []).forEach((o: any, idx: number) => {
        const cond = typeof o?.substitute_condition === 'string' ? o.substitute_condition : '';
        if (cond.startsWith('birthday_')) {
          alts.push({
            type: 'birthday',
            label: `🎉 Anniversaire ${o.substitute_person_name}`,
            substituteIndex: idx,
            substituteThemeId: o.substitute_theme_id,
          });
        } else if (cond.startsWith('milestone_')) {
          alts.push({
            type: 'milestone',
            label: `✨ ${(o.substitute_theme_titre || '').replace(/\[Prénom\]/g, childName)}`,
            substituteIndex: idx,
            substituteThemeId: o.substitute_theme_id,
          });
        }
      });
      if (row.show_custom_story) {
        alts.push({ type: 'custom', label: '📖 Histoire inédite' });
      }
      return alts;
    })(),
  };
}

// ---------- Wizard ----------

type FlowType = 'monthly' | 'special' | 'custom';

interface WizardCharacter {
  type: 'child' | 'family_member' | 'pet';
  id: string;
  name: string;
  emoji: string;
  avatarUrl?: string;
  locked?: boolean; // locked = always selected, cannot be unchecked
}

interface WizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childName: string;
  childAge?: number | null;
  flow: FlowType;
  bookTitle: string;
  characters: WizardCharacter[];
  isSaving: boolean;
  savedCharacters?: CharacterChoice[];
  savedNote?: string;
  savedLocationId?: string | null;
  savedLocationLabel?: string | null;
  onSubmit: (payload: { selectedCharacters: CharacterChoice[]; storyIdea?: string; note?: string; locationId?: string | null; locationLabel?: string | null }) => void;
  onBackToThemeSheet?: () => void;
  autoSelectedIds?: string[];
  dedicatedName?: string | null;
  initialCustomStory?: string;
  familyPlaces?: Array<{ id: string; label: string; type: string; city?: string }>;
  onLocationSelect?: (locationId: string | null, locationLabel: string | null) => void;
}

const Wizard: React.FC<WizardProps> = ({ open, onOpenChange, childName, childAge, flow, bookTitle, characters, isSaving, savedCharacters, savedNote, savedLocationId, savedLocationLabel, onSubmit, onBackToThemeSheet, autoSelectedIds, dedicatedName, initialCustomStory, familyPlaces }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [customStory, setCustomStory] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [selectedLocationLabel, setSelectedLocationLabel] = useState<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);

  // Selection caps based on child's age
  const MAX_TOTAL = (typeof childAge === 'number' && childAge < 4) ? 5 : 6;
  const MAX_PETS = 2;
  const selectedPetsCount = characters.filter((c) => c.type === 'pet' && selected.includes(c.id)).length;
  const totalCapReached = selected.length >= MAX_TOTAL;
  const petsCapReached = selectedPetsCount >= MAX_PETS;

  // When the wizard opens, initialize all values; on close, leave state as-is to avoid flash
  React.useEffect(() => {
    if (open) {
      const lockedIds = characters.filter((c) => c.locked).map((c) => c.id);
      const isSpecial = typeof flow === 'string' && flow.startsWith('special');
      const savedIds = (savedCharacters || [])
        .filter((c: any) => {
          if (!isSpecial) return true;
          if (c?.dedicated && c?.name !== dedicatedName) return false;
          return true;
        })
        .map((c: any) => c.id);
      const autoIds = autoSelectedIds || [];
      setSelected([...new Set([...lockedIds, ...savedIds, ...autoIds])]);
      setNote(savedNote || '');
      setCustomStory(initialCustomStory || '');
      setSelectedLocationId(savedLocationId ?? null);
      setSelectedLocationLabel(savedLocationLabel ?? null);
      setStep(1);
    }
  }, [open]);

  const handleClose = (o: boolean) => {
    if (!o && isSaving) return;
    isSubmittingRef.current = false;
    onOpenChange(o);
  };

  const toggle = (id: string) => {
    const target = characters.find((c) => c.id === id);
    if (target?.locked) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_TOTAL) return prev;
      if (target?.type === 'pet' && selectedPetsCount >= MAX_PETS) return prev;
      return [...prev, id];
    });
  };

  const handleValidate = () => {
    isSubmittingRef.current = true;
    const selectedChars: CharacterChoice[] = characters
      .filter((c) => selected.includes(c.id))
      .map((c) => ({ type: c.type, id: c.id, name: c.name }));
    onSubmit({
      selectedCharacters: selectedChars,
      storyIdea: isCustom ? customStory.trim() : undefined,
      note: !isCustom ? note.trim() || undefined : undefined,
      locationId: selectedLocationId,
      locationLabel: selectedLocationLabel,
    });
  };

  const isCustom = flow === 'custom';
  const charactersStepTitle = isCustom
    ? `Qui est dans cette histoire ?`
    : `Qui accompagne ${childName} dans ${bookTitle} ?`;
  const validateLabel = isCustom ? '✨ Valider mon histoire inédite' : '✨ Valider mon livre';

  const Content = (
    <div className="px-5 pb-6 pt-2 sm:px-8 sm:pt-6 relative">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: step === 1 ? 28 : 8,
            backgroundColor: step === 1 ? PRIMARY_VIOLET : '#E5E7EB',
          }}
        />
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: step === 2 ? 28 : 8,
            backgroundColor: step === 2 ? PRIMARY_VIOLET : '#E5E7EB',
          }}
        />
        <div
          className="h-2 rounded-full transition-all"
          style={{
            width: step === 3 ? 28 : 8,
            backgroundColor: step === 3 ? PRIMARY_VIOLET : '#E5E7EB',
          }}
        />
      </div>

      {/* Custom flow: step 1 = story idea */}
      {isCustom && step === 1 && (
        <>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            Quelle aventure imaginez-vous pour {childName} ?
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Décrivez librement — le lieu, les personnages, l'ambiance, un souvenir… On s'occupe du reste.
          </p>

          <div className="relative mb-6">
            <Textarea
              value={customStory}
              onChange={(e) => setCustomStory(e.target.value)}
              placeholder={`Ex : ${childName} part explorer une grotte sous-marine avec son grand-père, elle découvre un coffre rempli de photos de famille…`}
              className="min-h-40"
            />
            <div className="absolute bottom-2 right-3 text-xs text-muted-foreground">
              {customStory.length < 30
                ? `Encore ${30 - customStory.length} car. minimum`
                : `${customStory.length} caractères ✓`}
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            disabled={customStory.trim().length < 30}
            className="w-full text-white hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: PRIMARY_VIOLET }}
          >
            Suivant →
          </Button>
        </>
      )}

      {/* Standard flow: step 1 = characters */}
      {!isCustom && step === 1 && (
        <>
          {onBackToThemeSheet && flow !== 'monthly' && (
            <button
              type="button"
              onClick={onBackToThemeSheet}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Choisir un autre thème
            </button>
          )}
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            {charactersStepTitle}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sélectionne les personnages qui apparaîtront dans le livre
          </p>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
            <span>🧒</span>
            <span><strong>{childName}</strong> est toujours dans l'histoire</span>
          </div>

          {dedicatedName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
              <span>🎂</span>
              <span><strong>{dedicatedName}</strong> est la star de ce livre</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-8">
            {characters.filter((c) => !c.locked).map((c) => {
              const isSel = selected.includes(c.id);
              const disabledByCap = !isSel && (totalCapReached || (c.type === 'pet' && petsCapReached));
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !disabledByCap && toggle(c.id)}
                  disabled={c.locked || disabledByCap}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                    cursor: (c.locked || disabledByCap) ? 'not-allowed' : 'pointer',
                    opacity: disabledByCap ? 0.4 : 1,
                  }}
                >
                  <WizardAvatar avatarUrl={c.avatarUrl} emoji={c.emoji} name={c.name} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-center mb-4">
            <p className="text-sm font-medium text-foreground">
              {selected.length} / {MAX_TOTAL} personnages
            </p>
            {totalCapReached ? (
              <p className="text-xs text-muted-foreground mt-1">
                Nombre maximum de personnages et animaux atteint
              </p>
            ) : petsCapReached ? (
              <p className="text-xs text-muted-foreground mt-1">
                Nombre maximum d'animaux atteint
              </p>
            ) : null}
          </div>

          <Button
            onClick={() => setStep(2)}
            className="w-full text-white hover:opacity-90"
            style={{ backgroundColor: PRIMARY_VIOLET }}
          >
            Suivant →
          </Button>
        </>
      )}

      {/* Step 3 (custom) — characters */}
      {isCustom && step === 3 && (
        <>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            {charactersStepTitle}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sélectionne les personnages qui apparaîtront dans le livre
          </p>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
            <span>🧒</span>
            <span><strong>{childName}</strong> est toujours dans l'histoire</span>
          </div>

          {dedicatedName && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
              <span>🎂</span>
              <span><strong>{dedicatedName}</strong> est la star de ce livre</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-8">
            {characters.filter((c) => !c.locked).map((c) => {
              const isSel = selected.includes(c.id);
              const disabledByCap = !isSel && (totalCapReached || (c.type === 'pet' && petsCapReached));
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => !disabledByCap && toggle(c.id)}
                  disabled={c.locked || disabledByCap}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                    cursor: (c.locked || disabledByCap) ? 'not-allowed' : 'pointer',
                    opacity: disabledByCap ? 0.4 : 1,
                  }}
                >
                  <WizardAvatar avatarUrl={c.avatarUrl} emoji={c.emoji} name={c.name} />
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                  >
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-center mb-4">
            <p className="text-sm font-medium text-foreground">
              {selected.length} / {MAX_TOTAL} personnages
            </p>
            {totalCapReached ? (
              <p className="text-xs text-muted-foreground mt-1">
                Nombre maximum de personnages et animaux atteint
              </p>
            ) : petsCapReached ? (
              <p className="text-xs text-muted-foreground mt-1">
                Nombre maximum d'animaux atteint
              </p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleValidate} disabled={isSaving} className="flex-1">
              Passer
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isSaving}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              {isSaving ? 'Enregistrement…' : validateLabel}
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            Où se passe l'histoire ?
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Optionnel — par défaut l'histoire se déroule chez vous
          </p>

          {familyPlaces && familyPlaces.length > 0 && (
            <>
              <p className="text-sm font-semibold text-foreground mb-2">Vos lieux</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {familyPlaces.map((place) => {
                  const isSel = selectedLocationId === place.id;
                  return (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocationId(place.id);
                        setSelectedLocationLabel(place.label);
                      }}
                      className="flex flex-col items-start gap-1 p-3 rounded-xl border-2 transition-all text-left"
                      style={{
                        borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                        backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                      }}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                      >
                        {place.label}
                      </span>
                      {place.city && (
                        <span className="text-xs text-muted-foreground">{place.city}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <p className="text-sm font-semibold text-foreground mb-2">Ailleurs</p>
          <div className="grid grid-cols-4 gap-2 mb-8">
            {[
              { emoji: '🏔️', label: 'À la montagne' },
              { emoji: '🏖️', label: 'À la plage' },
              { emoji: '⛷️', label: 'Au ski' },
              { emoji: '🌲', label: 'En forêt' },
              { emoji: '🏜️', label: 'Dans le désert' },
              { emoji: '🚢', label: 'En bateau' },
              { emoji: '🏰', label: 'Dans un château' },
              { emoji: '🚀', label: 'Dans l\u2019espace' },
            ].map((opt) => {
              const isSel = selectedLocationId === null && selectedLocationLabel === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setSelectedLocationId(null);
                    setSelectedLocationLabel(opt.label);
                  }}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                  }}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span
                    className="text-[11px] font-medium text-center leading-tight"
                    style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedLocationId(null);
                setSelectedLocationLabel(null);
                setStep(3);
              }}
              className="flex-1"
            >
              Passer
            </Button>
            <Button
              onClick={() => setStep(3)}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              Suivant →
            </Button>
          </div>
        </>
      )}

      {!isCustom && step === 3 && (
        <>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Précédent</span>
          </button>
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            Votre touche secrète
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-2">
            Un détail qui rendra cette histoire unique pour {childName} <span className="text-muted-foreground">(optionnel)</span>
          </p>
          <p className="text-sm text-center italic text-muted-foreground mb-6">
            ✨ Pour le livre : « {bookTitle} »
          </p>

          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={`Ex : ${childName} adore les montres en ce moment…`}
            className="min-h-32 mb-6"
          />

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleValidate}
              disabled={isSaving}
              className="flex-1"
            >
              Passer
            </Button>
            <Button
              onClick={handleValidate}
              disabled={isSaving}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              {isSaving ? 'Enregistrement…' : validateLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="bg-white max-h-[90vh] overflow-y-auto">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-md p-0 max-h-[90vh] overflow-y-auto">
        {Content}
      </DialogContent>
    </Dialog>
  );
};

// ---------- Focus view ----------

interface FocusViewProps {
  month: MockMonth;
  childName: string;
  onBack: () => void;
  onConfigure: () => void;
  onChooseTheme: () => void;
}

const FocusView: React.FC<FocusViewProps> = ({ month, childName, onBack, onConfigure, onChooseTheme }) => {
  const [noteExpanded, setNoteExpanded] = useState(false);
  const isConfigured = month.status === 'configured' || month.status === 'in_creation'
    || month.status === 'in_printing' || month.status === 'shipped' || month.status === 'delivered';
  const isLocked = month.status === 'in_creation' || month.status === 'in_printing'
    || month.status === 'shipped' || month.status === 'delivered';
  const AUTO_MESSAGE = 'Livre généré automatiquement depuis le dashboard admin';
  const hasCharacters = !!(month.configuredCharacters && month.configuredCharacters.length > 0);
  const noteText = (month.savedNote ?? '').trim();
  const hasNote = noteText.length > 0 && noteText !== AUTO_MESSAGE;
  const locationLabel = (month.savedLocationLabel ?? '').trim();
  const hasLocation = locationLabel.length > 0 || !!month.savedLocationId;
  const showConfig = hasCharacters || hasNote || hasLocation;
  const isPreparing = !!month.isPreparing;

  return (
    <div className="space-y-4 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <Card className="border-2 border-border overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Colonne gauche — infos livre */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {month.monthLabel} · Livraison {month.deliveryShort}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                {month.bookTitle}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed mb-4">
                {month.bookSummary}
              </p>
              {month.deadline && !isConfigured && (
                <div className="flex items-center gap-2 text-sm text-orange-600 mt-2">
                  <span>⚠</span>
                  <span>Ajoutez votre touche avant le {month.deadline} (optionnel)</span>
                </div>
              )}
            </div>

            {/* Séparateur vertical desktop */}
            <div className="hidden lg:block w-px bg-border flex-shrink-0" />

            {/* Colonne droite — configuration */}
            <div className="lg:w-72 flex-shrink-0 space-y-4">
              <div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_CONFIG[month.status].badgeClass}`}>
                  {STATUS_CONFIG[month.status].label}
                </span>
              </div>
              {!isConfigured && !isLocked && (
              <p className="text-sm italic text-muted-foreground">
                  Votre histoire est déjà personnalisée, ce détail la rendra unique.
                </p>
              )}

              {isConfigured && showConfig && (
                <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Votre configuration
                  </p>
                  {month.dedicatedPersonName && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#F3F0FF'
                    }}>
                      <span style={{ fontSize: '20px' }}>🎂</span>
                      <div>
                        <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                          Livre dédié à
                        </p>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#534AB7', margin: 0 }}>
                          {month.dedicatedPersonName}
                        </p>
                      </div>
                    </div>
                  )}
                  {hasCharacters && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Personnages</p>
                      <p className="text-sm font-medium text-foreground">
                        {[...month.configuredCharacters!]
                          .sort((a, b) =>
                            a === month.dedicatedPersonName ? -1 :
                            b === month.dedicatedPersonName ? 1 : 0
                          )
                          .map((name) =>
                            name === month.dedicatedPersonName
                              ? `🎂 ${name}`
                              : name
                          )
                          .join(', ')}
                      </p>
                    </div>
                  )}
                  {hasNote && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Votre note</p>
                      <p className="text-sm text-foreground italic">
                        "{noteExpanded || noteText.length <= 80
                          ? noteText
                          : noteText.slice(0, 80) + '…'}"
                      </p>
                      {noteText.length > 80 && (
                        <button
                          type="button"
                          onClick={() => setNoteExpanded(!noteExpanded)}
                          className="text-xs mt-1 underline-offset-2 underline text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {noteExpanded ? 'Réduire' : 'Voir tout'}
                        </button>
                      )}
                    </div>
                  )}
                  {hasLocation && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Lieu</p>
                      <p className="text-sm text-foreground">
                        📍 {locationLabel || 'Lieu sélectionné'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isPreparing ? (
                <p className="text-sm text-muted-foreground italic">
                  Votre livre est cours de préparation
                </p>
              ) : !isLocked && (
                <>
                  <Button
                    onClick={onConfigure}
                    className="w-full text-white hover:opacity-90 h-11 text-sm font-semibold"
                    style={{ backgroundColor: PRIMARY_VIOLET }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isConfigured ? 'Ajuster votre touche' : 'Ajouter votre touche'}
                  </Button>
                  <button
                    type="button"
                    onClick={onChooseTheme}
                    className="block w-full text-center text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  >
                    Choisir un autre thème pour ce mois
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ---------- Month list row ----------

interface MonthRowProps {
  month: MockMonth;
  onClick: () => void;
  onConfigure: (e: React.MouseEvent) => void;
  alternatives?: NonNullable<MockMonth['alternatives']>;
  onAlternativeClick?: (
    bookRequestId: string,
    alternativeType: 'birthday' | 'milestone' | 'custom',
    substituteIndex?: number,
  ) => void;
}

const MonthRow: React.FC<MonthRowProps> = ({ month, onClick, onConfigure, alternatives, onAlternativeClick }) => {
  const cfg = STATUS_CONFIG[month.status];
  const showConfigureButton = month.status === 'to_personalize' || month.status === 'to_plan';
  const alts = alternatives ?? month.alternatives ?? [];
  const showAlternatives = alts.length > 0;

  return (
    <Card
      onClick={onClick}
      className={`${cfg.borderClass} cursor-pointer hover:shadow-md transition-all bg-white`}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Top row */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="font-bold text-foreground text-base sm:text-lg whitespace-nowrap">
              {month.monthLabel}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.badgeClass} whitespace-nowrap`}>
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`hidden sm:block text-sm truncate max-w-[180px] md:max-w-[260px] ${month.bookTitle === PLACEHOLDER_TITLE ? 'italic text-muted-foreground/70' : 'text-muted-foreground'}`}>
              {month.bookTitle}
            </span>
            {showConfigureButton ? (
              <Button
                size="sm"
                onClick={onConfigure}
                className="text-white hover:opacity-90"
                style={{ backgroundColor: PRIMARY_VIOLET }}
              >
                Ajouter votre touche
              </Button>
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Mobile-only book title line */}
        <p className={`sm:hidden text-sm truncate mb-1 ${month.bookTitle === PLACEHOLDER_TITLE ? 'italic text-muted-foreground/70' : 'text-muted-foreground'}`}>
          {month.bookTitle}
        </p>

        {/* Secondary info line */}
        <div className={`flex items-center gap-1.5 text-xs sm:text-sm ${cfg.secondaryClass}`}>
          {month.status === 'to_personalize' && (
            <>
              <span>⚠</span>
              <span>
                {month.daysLeft === 0
                  ? 'Dernière chance d\'ajouter votre touche !'
                  : month.daysLeft !== undefined
                    ? `Ajoutez votre touche avant le ${month.deadline} (optionnel) — encore ${month.daysLeft} jour${month.daysLeft > 1 ? 's' : ''} pour ajouter votre touche`
                    : `Ajoutez votre touche avant le ${month.deadline} (optionnel)`}
              </span>
            </>
          )}
          {month.status === 'configured' && (
            <span>Livre configuré · Livraison prévue le {month.deliveryShort}</span>
          )}
          {month.status === 'in_creation' && <span>Livre en cours de génération</span>}
          {month.status === 'in_printing' && <span>Livraison prévue le {month.deliveryShort}</span>}
          {month.status === 'shipped' && <span>Votre livre est en route</span>}
          {month.status === 'delivered' && <span>Votre livre est arrivé</span>}
          {month.status === 'to_plan' && (
            <>
              <Calendar className="h-3.5 w-3.5" />
              <span>{month.deadline ? `Ajoutez votre touche avant le ${month.deadline} (optionnel) — Livraison ${month.deliveryShort}` : `Livraison prévue le ${month.deliveryShort}`}</span>
            </>
          )}
        </div>

        {(() => {
          const isConfiguredOrLater = ['configured', 'in_creation', 'in_printing', 'shipped', 'delivered'].includes(month.status);
          const hasChars = !!(month.configuredCharacters && month.configuredCharacters.length > 0);
          const AUTO_MESSAGE = 'Livre généré automatiquement depuis le dashboard admin';
          const note = (month.savedNote ?? '').trim();
          const showNote = note.length > 0 && note !== AUTO_MESSAGE;
          const showLoc = !!month.savedLocationId || !!(month.savedLocationLabel ?? '').trim();
          if (!isConfiguredOrLater || (!hasChars && !showLoc && !showNote)) return null;
          return (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {hasChars && month.configuredCharacters!.map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-muted-foreground/20"
                >
                  {name}
                </span>
              ))}
              {showLoc && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-muted-foreground/20">
                  📍 {month.savedLocationLabel || 'Lieu'}
                </span>
              )}
              {showNote && (
                <span className="text-xs text-muted-foreground italic truncate max-w-full">
                  « {note} »
                </span>
              )}
            </div>
          );
        })()}

        {showAlternatives && (
          <div className="mt-3 flex flex-wrap gap-2">
            {alts.map((alt, i) => (
              <button
                key={`${alt.type}-${i}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!onAlternativeClick || !month.bookRequestId) return;
                  onAlternativeClick(
                    month.bookRequestId,
                    alt.type,
                    alt.type === 'custom' ? undefined : alt.substituteIndex,
                  );
                }}
                className="text-xs px-2.5 py-1 rounded-full border border-muted-foreground/30 bg-muted/40 hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
              >
                {alt.label}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ---------- Main component ----------

// ---------- Theme selection sheet ----------

interface ThemeSelectionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  month: MockMonth | null;
  childName: string;
  onChoose: (flow: FlowType, selectedThemeId?: string) => void;
  currentSelectedThemeId?: string;
  currentDedicatedName?: string;
}

const OptionCard: React.FC<{
  value: FlowType;
  icon: string;
  label: string;
  badge?: string;
  title?: string;
  description: string;
  selected: FlowType;
  onSelect: (value: FlowType) => void;
}> = ({ value, icon, label, badge, title, description, selected, onSelect }) => {
  const isSel = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className="w-full text-left p-4 rounded-xl border-2 transition-all"
      style={{
        borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
        backgroundColor: isSel ? `${PRIMARY_VIOLET}0D` : 'white',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-foreground">{label}</span>
            {badge && (
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${PRIMARY_VIOLET}1A`, color: PRIMARY_VIOLET }}
              >
                {badge}
              </span>
            )}
          </div>
          {title && <p className="text-sm font-bold text-foreground mb-0.5">{title}</p>}
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
};

// ---------- Archived books section ----------

interface ArchivedBook {
  id: string;
  delivery_month: string;
  title: string | null;
  selected_theme_type: string | null;
  selected_characters: any;
  message: string | null;
  original_theme_instructions: string | null;
}

const ArchivedBooksSection: React.FC<{ books: ArchivedBook[]; childFirstName: string }> = ({ books, childFirstName }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-8">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 border-border bg-white hover:bg-muted/30 transition-all"
      >
        <span className="font-semibold text-foreground">
          📚 Livres précédents ({books.length})
        </span>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="space-y-3 mt-3 animate-fade-in">
          {books.map((book) => {
            const deliveryDate = parseISO(book.delivery_month);
            const monthLabel = format(deliveryDate, 'LLLL yyyy', { locale: fr }).replace(/^./, (c) => c.toUpperCase());
            const otherNames: string[] = Array.isArray(book.selected_characters)
              ? (book.selected_characters as any[])
                  .map((c: any) => c?.name)
                  .filter((n: any) => typeof n === 'string' && n && n !== childFirstName)
              : [];
            let noteText: string | null = null;
            if (book.selected_theme_type === 'original' && book.original_theme_instructions) {
              const t = book.original_theme_instructions;
              noteText = `"${t.slice(0, 40)}${t.length > 40 ? '…' : ''}"`;
            } else if (book.message && book.message.trim()) {
              const t = book.message;
              noteText = `"${t.slice(0, 40)}${t.length > 40 ? '…' : ''}"`;
            }
            return (
              <Card key={book.id} className="border border-border bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{monthLabel}</span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 border-emerald-200">
                      ✓ Livré
                    </span>
                    {book.title && (
                      <span className="text-sm text-muted-foreground ml-auto truncate">
                        {book.title}
                      </span>
                    )}
                  </div>
                  {(otherNames.length > 0 || noteText) && (
                    <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-2">
                      {otherNames.length > 0 && <span>Avec {otherNames.join(', ')}</span>}
                      {otherNames.length > 0 && noteText && <span>·</span>}
                      {noteText && <span className="italic">{noteText}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ThemeSelectionSheet: React.FC<ThemeSelectionSheetProps> = ({ open, onOpenChange, month, childName, onChoose, currentSelectedThemeId, currentDedicatedName }) => {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<FlowType>('monthly');

  React.useEffect(() => {
    if (open && month) {
      // Pre-select special option if currently configured with a substitute theme
      if (month.status === 'configured' && currentSelectedThemeId) {
        const matchIdx = (month.substituteOptions || []).findIndex(
          (opt) => opt.substituteThemeId === currentSelectedThemeId
        );
        if (matchIdx >= 0) {
          setSelected(`special_${matchIdx}` as FlowType);
          return;
        }
      }
      setSelected('monthly');
    }
  }, [open, month, currentSelectedThemeId]);

  if (!month) return null;

  const handleClose = (o: boolean) => onOpenChange(o);

  const handleContinue = () => {
    let substituteThemeId: string | undefined;
    if (typeof selected === 'string' && selected.startsWith('special_')) {
      const idx = parseInt(selected.split('_')[1], 10);
      substituteThemeId = month?.substituteOptions?.[idx]?.substituteThemeId;
    }
    onChoose(selected, substituteThemeId);
  };


  const Content = (
    <div className="px-5 pb-6 pt-2 sm:px-8 sm:pt-6 relative">
      <h3 className="text-xl font-bold text-foreground text-center mb-1 mt-2">
        Choisir le thème de ce livre
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Ce choix remplacera le livre prévu pour ce mois
      </p>

      <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto">
        <OptionCard
          value="monthly"
          icon="📖"
          label="Livre du mois"
          badge="Recommandé par MCF"
          title={month.bookTitle}
          description={month.bookSummary}
          selected={selected}
          onSelect={setSelected}
        />

        {(month.substituteOptions || []).map((opt, idx) => {
          const isBirthday =
            typeof opt.substituteCondition === 'string' &&
            opt.substituteCondition.startsWith('birthday_');
          const title = isBirthday
            ? `Anniversaire de ${opt.substitutePersonName}`
            : (opt.substituteThemeTitre?.replace('[Prénom]', childName) ?? '');
          return (
            <OptionCard
              key={idx}
              value={`special_${idx}` as FlowType}
              icon="🎉"
              label="Option spéciale MCF"
              badge={currentDedicatedName && opt.substitutePersonName === currentDedicatedName ? 'Choix actuel' : undefined}
              title={title}
              description={`Ce mois-ci, ${opt.substitutePersonName} fête son anniversaire — on lui dédie ce livre !`}
              selected={selected}
              onSelect={setSelected}
            />
          );
        })}

        <OptionCard
          value="custom"
          icon="✨"
          label="Histoire inédite"
          description={`Vous imaginez, nous créons. Décrivez l'histoire de vos rêves pour ${childName}.`}
          selected={selected}
          onSelect={setSelected}
        />
      </div>

      <Button
        onClick={handleContinue}
        className="w-full text-white hover:opacity-90"
        style={{ backgroundColor: PRIMARY_VIOLET }}
      >
        Continuer avec ce choix →
      </Button>

      <button
        type="button"
        onClick={() => handleClose(false)}
        className="block mx-auto mt-3 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
      >
        Annuler
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="bg-white max-h-[90vh] overflow-y-auto">{Content}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-md p-0 max-h-[90vh] overflow-y-auto">{Content}</DialogContent>
    </Dialog>
  );
};

// ---------- Main component ----------

const MyStoriesTab: React.FC<MyStoriesTabProps> = () => {
  // 1. Real children from Supabase (via shared hook)
  const { data: familyChildren, isLoading: isLoadingChildren } = useFamilyData();
  const rawList: FamilyChild[] = familyChildren ?? [];
  const navigate = useNavigate();

  // Fetch timelines for all children in parallel to compute ordering
  const timelineQueries = useQueries({
    queries: rawList.map((c) => ({
      queryKey: ['book-timeline', c.id],
      queryFn: async () => {
        const { data, error } = await supabase.rpc('get_child_book_timeline', { p_child_id: c.id });
        if (error) throw error;
        return (data ?? []) as unknown as BookTimelineRow[];
      },
      staleTime: 1000 * 60 * 5,
    })),
  });

  const timelinesByChild = useMemo(() => {
    const map: Record<string, BookTimelineRow[]> = {};
    rawList.forEach((c, i) => {
      map[c.id] = (timelineQueries[i]?.data as BookTimelineRow[] | undefined) ?? [];
    });
    return map;
  }, [rawList, timelineQueries]);

  const list: FamilyChild[] = useMemo(() => {
    const sorted = [...rawList].sort((a, b) => {
      const tA = timelinesByChild[a.id] ?? [];
      const tB = timelinesByChild[b.id] ?? [];
      const hasActiveA = tA.length > 0;
      const hasActiveB = tB.length > 0;
      if (hasActiveA && !hasActiveB) return -1;
      if (!hasActiveA && hasActiveB) return 1;

      const now = new Date();
      const isUrgent = (rows: BookTimelineRow[]) =>
        rows.some((m) => {
          if (m.status !== 'pending_choice' || !m.personalization_deadline) return false;
          const days = differenceInCalendarDays(parseISO(m.personalization_deadline), now);
          return days <= 14;
        });
      const urgentA = isUrgent(tA);
      const urgentB = isUrgent(tB);
      if (urgentA && !urgentB) return -1;
      if (!urgentA && urgentB) return 1;

      // Younger first → most recent birth date first
      const dA = a.birthDate ? new Date(a.birthDate).getTime() : 0;
      const dB = b.birthDate ? new Date(b.birthDate).getTime() : 0;
      return dB - dA;
    });
    return sorted;
  }, [rawList, timelinesByChild]);

  const [activeChildId, setActiveChildId] = useState<string | null>(null);

  // Auto-select first child once loaded
  React.useEffect(() => {
    if (!activeChildId && list.length > 0) {
      setActiveChildId(list[0].id);
    }
  }, [list, activeChildId]);

  const activeChild = useMemo(
    () => list.find((c) => c.id === activeChildId) ?? list[0] ?? null,
    [list, activeChildId]
  );

  // 2. Real timeline from RPC
  const { data: timelineRows, isLoading: isLoadingTimeline, isError: isTimelineError } =
    useBookTimeline(activeChildId);

  // 2b. Archived books
  const { data: archivedBooks } = useQuery({
    queryKey: ['archived-books', activeChildId],
    queryFn: async () => {
      if (!activeChildId) return [] as ArchivedBook[];
      const { data, error } = await supabase
        .from('book_requests')
        .select('id, delivery_month, title, selected_theme_type, selected_characters, message, original_theme_instructions')
        .eq('child_id', activeChildId)
        .not('archived_at', 'is', null)
        .order('delivery_month', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ArchivedBook[];
    },
    enabled: !!activeChildId,
    staleTime: 1000 * 60 * 5,
  });

  const months: MockMonth[] = useMemo(
    () => (timelineRows ?? []).map((r, i) => mapTimelineRow(r, i, activeChild?.firstName ?? '', activeChild?.id ?? '', activeChild?.gender)),
    [timelineRows, activeChild?.firstName, activeChild?.gender]
  );

  // Proactive suggestions derived from timelineRows
  type Suggestion =
    | {
        type: 'birthday';
        personName: string;
        substituteThemeId: string;
        substituteThemeTitre: string;
        bookRequestId: string;
        substituteIndex: number;
      }
    | {
        type: 'milestone';
        substituteThemeId: string;
        substituteThemeTitre: string;
        bookRequestId: string;
        substituteIndex: number;
      }
    | { type: 'custom'; bookRequestId: string };

  const suggestions: Suggestion[] = useMemo(() => {
    const rows = timelineRows ?? [];
    const out: Suggestion[] = [];

    // Birthdays: only the closest upcoming month that has any birthday_ option
    for (const row of rows) {
      const opts = row.substitute_options || [];
      const birthdays = opts
        .map((o, idx) => ({ o, idx }))
        .filter(({ o }) => typeof o.substitute_condition === 'string' && o.substitute_condition.startsWith('birthday_'));
      if (birthdays.length > 0) {
        for (const { o, idx } of birthdays) {
          out.push({
            type: 'birthday',
            personName: o.substitute_person_name,
            substituteThemeId: o.substitute_theme_id,
            substituteThemeTitre: o.substitute_theme_titre,
            bookRequestId: row.book_request_id,
            substituteIndex: idx,
          });
        }
        break;
      }
    }

    // Milestones: across all rows
    for (const row of rows) {
      const opts = row.substitute_options || [];
      opts.forEach((o, idx) => {
        if (typeof o.substitute_condition === 'string' && o.substitute_condition.startsWith('milestone_')) {
          out.push({
            type: 'milestone',
            substituteThemeId: o.substitute_theme_id,
            substituteThemeTitre: o.substitute_theme_titre,
            bookRequestId: row.book_request_id,
            substituteIndex: idx,
          });
        }
      });
    }

    // Custom story: first row that allows it
    const customRow = rows.find((r) => r.show_custom_story === true);
    if (customRow) {
      out.push({ type: 'custom', bookRequestId: customRow.book_request_id });
    }

    return out;
  }, [timelineRows]);

  const monthIndexByBookRequestId = useMemo(() => {
    const map = new Map<string, number>();
    months.forEach((m) => {
      if (m.bookRequestId) map.set(m.bookRequestId, m.monthIndex);
    });
    return map;
  }, [months]);

  const alternativesByBookRequestId = useMemo(() => {
    const map = new Map<string, NonNullable<MockMonth['alternatives']>>();
    const childName = activeChild?.firstName ?? '';
    (timelineRows ?? []).forEach((row) => {
      const alts: NonNullable<MockMonth['alternatives']> = [];
      (row.substitute_options || []).forEach((o: any, idx: number) => {
        const cond = typeof o?.substitute_condition === 'string' ? o.substitute_condition : '';
        if (cond.startsWith('birthday_')) {
          alts.push({
            type: 'birthday',
            label: `🎉 Anniversaire ${o.substitute_person_name}`,
            substituteIndex: idx,
            substituteThemeId: o.substitute_theme_id,
          });
        } else if (cond.startsWith('milestone_')) {
          alts.push({
            type: 'milestone',
            label: `✨ ${(o.substitute_theme_titre || '').replace(/\[Prénom\]/g, childName)}`,
            substituteIndex: idx,
            substituteThemeId: o.substitute_theme_id,
          });
        }
      });
      if (row.show_custom_story) {
        alts.push({ type: 'custom', label: '📖 Histoire inédite' });
      }
      if (row.book_request_id) map.set(row.book_request_id, alts);
    });
    console.log('[MyStoriesTab] alternativesByBookRequestId', Array.from(map.entries()));
    return map;
  }, [timelineRows, activeChild?.firstName]);

  const handleSuggestionClick = (s: Suggestion) => {
    const monthIndex = monthIndexByBookRequestId.get(s.bookRequestId);
    if (monthIndex === undefined) return;
    setFocusedMonthIndex(monthIndex);
    if (s.type === 'custom') {
      setActiveFlow('custom');
      setActiveSubstituteThemeId(undefined);
      setWizardOpen(true);
    } else {
      setActiveFlow(`special_${s.substituteIndex}` as FlowType);
      setActiveSubstituteThemeId(s.substituteThemeId);
      setThemeSheetOpen(true);
    }
  };

  const handleAlternativeClick = (
    bookRequestId: string,
    alternativeType: 'birthday' | 'milestone' | 'custom',
    substituteIndex?: number,
  ) => {
    const monthIndex = monthIndexByBookRequestId.get(bookRequestId);
    if (monthIndex === undefined) return;
    setFocusedMonthIndex(monthIndex);
    if (alternativeType === 'custom') {
      setActiveFlow('custom');
      setActiveSubstituteThemeId(undefined);
      setWizardOpen(true);
      return;
    }
    if (substituteIndex === undefined) return;
    const target = months.find((m) => m.monthIndex === monthIndex);
    const opt = target?.substituteOptions?.[substituteIndex];
    setActiveFlow(`special_${substituteIndex}` as FlowType);
    setActiveSubstituteThemeId(opt?.substituteThemeId);
    setThemeSheetOpen(true);
  };

  const totalPlanned = months.length;
  const configuredCount = (timelineRows ?? []).filter(
    (r) => r.status === 'configured' || r.status === 'locked'
  ).length;

  const { data: activeSubscription } = useQuery({
    queryKey: ['subscription', activeChildId],
    queryFn: async () => {
      if (!activeChildId) return null;
      const { data } = await supabase
        .from('subscriptions')
        .select('cancel_at, end_date, status')
        .eq('child_id', activeChildId)
        .eq('is_active', true)
        .maybeSingle();
      return data;
    },
    enabled: !!activeChildId,
  });

  const [focusedMonthIndex, setFocusedMonthIndex] = useState<number | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<FlowType>('monthly');
  const [activeSubstituteThemeId, setActiveSubstituteThemeId] = useState<string | undefined>(undefined);
  const [autoSelectedMemberId, setAutoSelectedMemberId] = useState<string | undefined>(undefined);

  const focusedMonth =
    focusedMonthIndex !== null
      ? months.find((m) => m.monthIndex === focusedMonthIndex) ?? null
      : null;

  // 3. Save mutation
  const { mutate: saveChoice, isPending: isSaving } = useSaveBookChoice(activeChildId);

  // Family places for the wizard location step
  const { data: familyPlaces } = useQuery({
    queryKey: ['family-places', activeChild?.id],
    queryFn: async () => {
      if (!activeChild?.id) return [];
      const { data } = await supabase
        .from('child_places')
        .select('places(id, label, type, city)')
        .eq('child_id', activeChild.id);
      return (data ?? []).map((r: any) => r.places).filter(Boolean);
    },
    enabled: !!activeChild?.id,
  });

  // 4. Build characters list from real family data
  const wizardCharacters: WizardCharacter[] = useMemo(() => {
    if (!activeChild) return [];
    const child: WizardCharacter = {
      type: 'child',
      id: activeChild.id,
      name: activeChild.firstName,
      emoji: '🧒',
      locked: true,
    };
    const members: WizardCharacter[] = (activeChild.relatives ?? []).map((m: any) => {
      const role = (m.type ?? '').toLowerCase();
      const emoji =
        role.includes('maman') || role === 'mere' || role === 'mère'
          ? '👩'
          : role.includes('papa') || role === 'pere' || role === 'père'
          ? '👨'
          : role.includes('mamie') || role.includes('grand-mère') || role.includes('grand-mere')
          ? '👵'
          : role.includes('papi') || role.includes('grand-père') || role.includes('grand-pere')
          ? '👴'
          : role.includes('frère') || role.includes('frere')
          ? '👦'
          : role.includes('sœur') || role.includes('soeur')
          ? '👧'
          : '👤';
      return {
        type: 'family_member',
        id: m.id,
        name: m.firstName || 'Proche',
        emoji,
        avatarUrl: m.avatar_url || undefined,
      };
    });
    const pets: WizardCharacter[] = (activeChild.pets ?? []).map((p: any) => ({
      type: 'pet',
      id: p.id,
      name: p.name || 'Animal',
      emoji: p.emoji || '🐾',
      avatarUrl: p.avatar_url || undefined,
    }));
    const siblings: WizardCharacter[] = ((activeChild as any).siblings ?? []).map((s: any) => ({
      type: 'child' as const,
      id: s.id,
      name: s.firstName || 'Enfant',
      emoji: '🧒',
      avatarUrl: s.avatar_url || undefined,
      locked: false,
    }));
    return [child, ...siblings, ...members, ...pets];
  }, [activeChild]);

  const dedicatedName = (() => {
    if (!(typeof activeFlow === 'string' && activeFlow.startsWith('special_'))) return null;
    const idx = parseInt(activeFlow.split('_')[1]);
    return focusedMonth?.substituteOptions?.[idx]?.substitutePersonName ?? null;
  })();

  const wizardCharactersWithLock = wizardCharacters.map(c => ({
    ...c,
    locked: c.locked || (dedicatedName !== null && c.name === dedicatedName),
  }));

  const handleWizardSubmit = (payload: { selectedCharacters: CharacterChoice[]; storyIdea?: string; note?: string; locationId?: string | null; locationLabel?: string | null }) => {
    if (!focusedMonth?.bookRequestId) {
      toast.error('Livre introuvable, réessaie.');
      return;
    }
    const isSpecial = typeof activeFlow === 'string' && activeFlow.startsWith('special');
    const themeType: 'standard' | 'substitute' | 'original' =
      activeFlow === 'custom' ? 'original' : isSpecial ? 'substitute' : 'standard';

    const selectedCharacters =
      themeType === 'substitute' && dedicatedName
        ? payload.selectedCharacters.map((c) => {
            const { dedicated: _omit, ...rest } = c as any;
            return rest.name === dedicatedName ? { ...rest, dedicated: true } : rest;
          })
        : payload.selectedCharacters.map((c) => {
            const { dedicated: _omit, ...rest } = c as any;
            return rest;
          });

    saveChoice(
      {
        bookRequestId: focusedMonth.bookRequestId,
        selectedThemeType: themeType,
        selectedCharacters,
        originalThemeInstructions: themeType === 'original' ? payload.storyIdea : undefined,
        selectedThemeId: activeFlow === 'monthly'
          ? (focusedMonth?.themeId ?? undefined)
          : isSpecial
          ? activeSubstituteThemeId
          : undefined,
        note: payload.note,
        locationId: payload.locationId,
        locationLabel: payload.locationLabel,
      },
      {
        onSuccess: () => {
          setWizardOpen(false);
          setFocusedMonthIndex(null);
          if (themeType === 'original') {
            toast.success('Votre idée a bien été enregistrée ! 🎉');
          } else {
            toast.success('Livre configuré ! 🎉');
          }
        },
        onError: (err: any) => {
          const msg = (err?.message || '').toLowerCase();
          if (msg.includes('locked') || msg.includes('deadline')) {
            toast.error('La deadline est dépassée, ce livre ne peut plus être modifié.');
          } else {
            toast.error('Une erreur est survenue, réessaie.');
          }
        },
      }
    );
  };

  const wizardBookTitle = (() => {
    if (!focusedMonth) return '';
    if (typeof activeFlow === 'string' && activeFlow.startsWith('special')) {
      const opt = (focusedMonth.substituteOptions || []).find(
        (o) => o.substituteThemeId === activeSubstituteThemeId,
      );
      if (opt?.substituteThemeTitre) {
        return opt.substituteThemeTitre.replace('[Prénom]', activeChild?.firstName ?? '');
      }
    }
    return focusedMonth.bookTitle;
  })();

  return (
    <div className="space-y-6">
      {/* 1. Children chips */}
      {isLoadingChildren ? (
        <div className="flex items-center gap-2 sm:gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10 w-28 rounded-full" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun enfant n'a encore été ajouté à votre famille.</p>
      ) : (
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3 pb-1 min-w-max sm:min-w-0 sm:flex-wrap">
          {list.map((child) => {
            const isActive = child.id === activeChildId;
            return (
              <button
                key={child.id}
                onClick={() => {
                  setActiveChildId(child.id);
                  setFocusedMonthIndex(null);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all border-2"
                style={{
                  backgroundColor: isActive ? PRIMARY_VIOLET : 'white',
                  borderColor: isActive ? PRIMARY_VIOLET : '#E5E7EB',
                  color: isActive ? 'white' : '#374151',
                }}
              >
                <Avatar className="h-6 w-6 border border-white/30">
                  {child.avatar ? (
                    <AvatarImage src={child.avatar} alt={child.firstName} />
                  ) : (
                    <AvatarFallback className="text-xs bg-white/20">
                      {child.personalityEmoji}
                    </AvatarFallback>
                  )}
                </Avatar>
                {child.firstName}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* 2. Child header */}
      {activeChild && (
      <Card className="border-2 border-border bg-gradient-to-br from-white to-muted/30">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-md flex-shrink-0">
              {activeChild.avatar ? (
                <AvatarImage src={activeChild.avatar} alt={activeChild.firstName} />
              ) : (
                <AvatarFallback className="bg-muted text-3xl">
                  {activeChild.personalityEmoji}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 truncate">
                {activeChild.firstName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeChild.age} · Timeline sur 12 mois
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
              <div className="text-sm">
                <span className="font-bold text-foreground">{totalPlanned}</span>
                <span className="text-muted-foreground ml-1">prochains livres</span>
              </div>
              <div className="text-sm">
                <span className="font-bold" style={{ color: PRIMARY_VIOLET }}>{configuredCount}</span>
                <span className="text-muted-foreground ml-1">configuré{configuredCount > 1 ? 's' : ''}</span>
              </div>
              {activeSubscription?.cancel_at && totalPlanned <= 2 && (
                <p className="text-xs text-orange-500 mt-1 text-right">
                  Abonnement jusqu'au {format(parseISO(activeSubscription.cancel_at), 'd MMMM yyyy', { locale: fr })}
                </p>
              )}
            </div>
          </div>

          {/* Mobile counters */}
          <div className="sm:hidden flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm">
            <div>
              <span className="font-bold text-foreground">{totalPlanned}</span>
              <span className="text-muted-foreground ml-1">prochains livres</span>
            </div>
            <div>
              <span className="font-bold" style={{ color: PRIMARY_VIOLET }}>{configuredCount}</span>
              <span className="text-muted-foreground ml-1">configuré{configuredCount > 1 ? 's' : ''}</span>
            </div>
          </div>
          {activeSubscription?.cancel_at && totalPlanned <= 2 && (
            <p className="sm:hidden text-xs text-orange-500 mt-2">
              Abonnement jusqu'au {format(parseISO(activeSubscription.cancel_at), 'd MMMM yyyy', { locale: fr })}
            </p>
          )}
        </CardContent>
      </Card>
      )}

      {/* 3. List view OR Focus view */}
      {!activeChildId ? null : focusedMonth ? (
        <FocusView
          month={focusedMonth}
          childName={activeChild?.firstName ?? ''}
          onBack={() => setFocusedMonthIndex(null)}
          onConfigure={() => {
            if (focusedMonth.selectedThemeType === 'original') {
              setActiveFlow('custom');
              setActiveSubstituteThemeId(undefined);
            } else if (
              focusedMonth.selectedThemeType === 'substitute' &&
              focusedMonth.selectedThemeId
            ) {
              const dedicatedFromChars = focusedMonth.dedicatedPersonName;
              const opts = focusedMonth.substituteOptions || [];
              let idx = -1;
              if (dedicatedFromChars) {
                idx = opts.findIndex((opt) => opt.substitutePersonName === dedicatedFromChars);
              }
              if (idx < 0) {
                idx = opts.findIndex((opt) => opt.substituteThemeId === focusedMonth.selectedThemeId);
              }
              if (idx >= 0) {
                setActiveFlow(`special_${idx}` as FlowType);
                setActiveSubstituteThemeId(focusedMonth.selectedThemeId);
              } else {
                setActiveFlow('monthly');
                setActiveSubstituteThemeId(undefined);
              }
            } else {
              setActiveFlow('monthly');
              setActiveSubstituteThemeId(undefined);
            }
            setWizardOpen(true);
          }}
          onChooseTheme={() => setThemeSheetOpen(true)}
        />
      ) : isLoadingTimeline ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : isTimelineError ? (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Une erreur est survenue lors du chargement de la timeline.
          </CardContent>
        </Card>
      ) : months.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2.5rem 1.5rem',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: '0.75rem',
            background: 'hsl(var(--background))',
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <p style={{ fontWeight: 500, fontSize: 16, marginBottom: 8 }}>
            {activeChild?.firstName} n'a pas encore d'abonnement
          </p>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: 13, marginBottom: 20 }}>
            Abonne-toi pour découvrir les 12 livres personnalisés prévus pour {activeChild?.firstName}
          </p>
          <button
            onClick={() => navigate('/abonnement')}
            style={{
              background: '#534AB7',
              color: '#EEEDFE',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '10px 24px',
              fontSize: 14,
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Découvrir les abonnements →
          </button>
        </div>
      ) : (
        <div className="space-y-3 animate-fade-in">
          {months.map((m) => (
            <MonthRow
              key={m.monthIndex}
              month={m}
              onClick={() => setFocusedMonthIndex(m.monthIndex)}
              onConfigure={(e) => {
                e.stopPropagation();
                setFocusedMonthIndex(m.monthIndex);
              }}
              alternatives={m.bookRequestId ? alternativesByBookRequestId.get(m.bookRequestId) ?? [] : []}
              onAlternativeClick={handleAlternativeClick}
            />
          ))}
        </div>
      )}

      {/* Archived books accordion */}
      {archivedBooks && archivedBooks.length > 0 && (
        <ArchivedBooksSection books={archivedBooks} childFirstName={activeChild?.firstName ?? ''} />
      )}

      {/* Wizard */}
      <Wizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        childName={activeChild?.firstName ?? ''}
        flow={activeFlow}
        bookTitle={wizardBookTitle}
        characters={wizardCharactersWithLock}
        isSaving={isSaving}
        savedCharacters={
          focusedMonth?.bookRequestId
            ? ((timelineRows?.find((r) => r.book_request_id === focusedMonth.bookRequestId)?.selected_characters as CharacterChoice[]) ?? [])
            : []
        }
        savedNote={
          timelineRows?.find((r) => r.book_request_id === focusedMonth?.bookRequestId)
            ?.saved_note ?? ''
        }
        savedLocationId={
          timelineRows?.find((r) => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_location_id ?? null
        }
        savedLocationLabel={
          timelineRows?.find((r) => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_location_label ?? null
        }
        onSubmit={handleWizardSubmit}
        onBackToThemeSheet={() => {
          setWizardOpen(false);
          setThemeSheetOpen(true);
        }}
        autoSelectedIds={autoSelectedMemberId ? [autoSelectedMemberId] : []}
        dedicatedName={dedicatedName}
        initialCustomStory={
          focusedMonth?.selectedThemeType === 'original'
            ? (focusedMonth?.originalThemeInstructions ?? '')
            : ''
        }
        familyPlaces={familyPlaces ?? []}
      />

      {/* Theme selection sheet */}
      <ThemeSelectionSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        month={focusedMonth}
        childName={activeChild?.firstName ?? ''}
        currentSelectedThemeId={
          timelineRows?.find(r => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_theme_id ?? undefined
        }
        currentDedicatedName={
          (timelineRows?.find(r => r.book_request_id === focusedMonth?.bookRequestId)
            ?.selected_characters as any[] | undefined)
            ?.find((c: any) => c?.dedicated)?.name ?? undefined
        }
        onChoose={(flow, selectedThemeId) => {
          setActiveFlow(flow);
          setActiveSubstituteThemeId(selectedThemeId);
          if (flow.startsWith('special') && focusedMonth) {
            const idxStr = flow.split('_')[1];
            const idx = idxStr ? parseInt(idxStr, 10) : NaN;
            const opt = !isNaN(idx) ? (focusedMonth.substituteOptions || [])[idx] : undefined;
            const personName = opt?.substitutePersonName;
            const member = personName
              ? wizardCharacters.find(
                  (c) => c.name?.toLowerCase() === personName.toLowerCase(),
                )
              : undefined;
            setAutoSelectedMemberId(member?.id);
          } else {
            setAutoSelectedMemberId(undefined);
          }
          setThemeSheetOpen(false);
          setWizardOpen(true);
        }}
      />
    </div>
  );
};

export default MyStoriesTab;
