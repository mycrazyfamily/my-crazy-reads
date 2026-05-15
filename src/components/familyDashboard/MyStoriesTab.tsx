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
import { Sparkles, ArrowLeft, Calendar, ChevronRight } from 'lucide-react';
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
  substituteThemeId?: string | null;
  substituteThemeTitre?: string | null;
  substitutePersonName?: string | null;
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
    substituteThemeId: 'sub-1',
    substituteThemeTitre: "L'anniversaire de Jules",
    substitutePersonName: 'Jules',
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
    label: 'À personnaliser',
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
    label: 'À planifier',
    badgeClass: 'bg-gray-100 text-gray-600 border-gray-200',
    borderClass: 'border-l-[3px] border-l-transparent',
    secondaryClass: 'text-muted-foreground',
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
const formatSummary = (text: string | null, firstName: string) =>
  text?.replace(/\[Prénom\]/g, firstName) ?? '';

// ---------- Supabase row → MockMonth shape ----------

const PLACEHOLDER_TITLE = 'Thème à venir';

function mapTimelineRow(row: BookTimelineRow, idx: number, childName: string): MockMonth {
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
    bookTitle: (() => {
      if (row.selected_theme_titre)
        return formatTitle(row.selected_theme_titre, childName);
      if (row.theme_titre)
        return formatTitle(row.theme_titre, childName);
      return PLACEHOLDER_TITLE;
    })(),
    bookSummary: (() => {
      if (row.selected_theme_resume)
        return formatSummary(row.selected_theme_resume, childName);
      if (row.theme_resume)
        return formatSummary(row.theme_resume, childName);
      return '';
    })(),
    bookTags: [],
    deadline: deadlineShort,
    daysLeft: daysLeft !== undefined && daysLeft >= 0 ? daysLeft : undefined,
    bookRequestId: row.book_request_id,
    themeId: row.theme_id ?? null,
    savedNote: row.saved_note || '',
    substituteThemeId: row.substitute_theme_id ?? null,
    substituteThemeTitre: row.substitute_theme_titre ?? null,
    substitutePersonName: row.substitute_person_name ?? null,
    configuredCharacters: (() => {
      if (!row.selected_characters || !Array.isArray(row.selected_characters)) return [];
      return (row.selected_characters as any[])
        .filter((c: any) => c.type !== 'child')
        .map((c: any) => c.name);
    })(),
    configuredSummary: (() => {
      const parts: string[] = [];
      if (row.selected_characters && Array.isArray(row.selected_characters)) {
        const names = (row.selected_characters as any[])
          .filter((c: any) => c.type !== 'child')
          .map((c: any) => c.name);
        if (names.length > 0) parts.push(`Avec ${names.join(', ')}`);
      }
      if (row.saved_note && row.saved_note.trim()) {
        parts.push(`"${row.saved_note.slice(0, 40)}${row.saved_note.length > 40 ? '…' : ''}"`);
      }
      return parts.join(' · ') || undefined;
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
  flow: FlowType;
  bookTitle: string;
  characters: WizardCharacter[];
  isSaving: boolean;
  savedCharacters?: CharacterChoice[];
  savedNote?: string;
  onSubmit: (payload: { selectedCharacters: CharacterChoice[]; storyIdea?: string; note?: string }) => void;
  onBackToThemeSheet?: () => void;
}

const Wizard: React.FC<WizardProps> = ({ open, onOpenChange, childName, flow, bookTitle, characters, isSaving, savedCharacters, savedNote, onSubmit, onBackToThemeSheet }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [customStory, setCustomStory] = useState('');
  const isSubmittingRef = useRef<boolean>(false);

  // When the wizard opens, initialize all values; on close, leave state as-is to avoid flash
  React.useEffect(() => {
    if (open) {
      const lockedIds = characters.filter((c) => c.locked).map((c) => c.id);
      const savedIds = (savedCharacters || []).map((c: any) => c.id);
      setSelected([...new Set([...lockedIds, ...savedIds])]);
      setNote(savedNote || '');
      setCustomStory('');
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
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
              {customStory.length} / 30
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

          <div className="grid grid-cols-3 gap-3 mb-8">
            {characters.filter((c) => !c.locked).map((c) => {
              const isSel = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  disabled={c.locked}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                    cursor: c.locked ? 'not-allowed' : 'pointer',
                    opacity: 1,
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

          <Button
            onClick={() => setStep(2)}
            className="w-full text-white hover:opacity-90"
            style={{ backgroundColor: PRIMARY_VIOLET }}
          >
            Suivant →
          </Button>
        </>
      )}

      {/* Step 2 — custom: characters; standard: note */}
      {isCustom && step === 2 && (
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
            {charactersStepTitle}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sélectionne les personnages qui apparaîtront dans le livre
          </p>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted mb-4 text-sm text-muted-foreground">
            <span>🧒</span>
            <span><strong>{childName}</strong> est toujours dans l'histoire</span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {characters.filter((c) => !c.locked).map((c) => {
              const isSel = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  disabled={c.locked}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                    cursor: c.locked ? 'not-allowed' : 'pointer',
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

      {!isCustom && step === 2 && (
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
            Une note pour nous ?
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Un détail qui rendrait ce livre encore plus magique <span className="text-muted-foreground">(optionnel)</span>
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
                  <span>Deadline de personnalisation : {month.deadline}</span>
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

              {isConfigured && (
                <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Votre configuration
                  </p>
                  {month.configuredCharacters && month.configuredCharacters.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Personnages</p>
                      <p className="text-sm font-medium text-foreground">
                        {month.configuredCharacters.join(', ')}
                      </p>
                    </div>
                  )}
                  {month.savedNote && month.savedNote.trim() && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Votre note</p>
                      <p className="text-sm text-foreground italic">
                        "{noteExpanded || month.savedNote.length <= 80
                          ? month.savedNote
                          : month.savedNote.slice(0, 80) + '…'}"
                      </p>
                      {month.savedNote.length > 80 && (
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
                  {(!month.configuredCharacters?.length && !month.savedNote) && (
                    <p className="text-sm text-muted-foreground">
                      Aucun détail ajouté
                    </p>
                  )}
                </div>
              )}

              {!isLocked && (
                <>
                  <Button
                    onClick={onConfigure}
                    className="w-full text-white hover:opacity-90 h-11 text-sm font-semibold"
                    style={{ backgroundColor: PRIMARY_VIOLET }}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isConfigured ? 'Modifier la configuration' : 'Configurer cette aventure'}
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
}

const MonthRow: React.FC<MonthRowProps> = ({ month, onClick, onConfigure }) => {
  const cfg = STATUS_CONFIG[month.status];
  const showConfigureButton = month.status === 'to_personalize' || month.status === 'to_plan';
  const isPrimaryCta = month.status === 'to_personalize';

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
                variant={isPrimaryCta ? 'default' : 'outline'}
                className={isPrimaryCta ? 'text-white hover:opacity-90' : ''}
                style={isPrimaryCta ? { backgroundColor: PRIMARY_VIOLET } : undefined}
              >
                Configurer
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
              <span>Deadline : {month.deadline} — dans {month.daysLeft} jours</span>
            </>
          )}
          {month.status === 'configured' && (
            <div className="flex flex-col gap-0.5">
              <span>Livre configuré · Livraison prévue le {month.deliveryShort}</span>
              {month.configuredSummary && (
                <span className="text-xs text-muted-foreground/70 truncate">
                  {month.configuredSummary}
                </span>
              )}
            </div>
          )}
          {month.status === 'in_creation' && <span>Livre en cours de génération</span>}
          {month.status === 'in_printing' && <span>Livraison prévue le {month.deliveryShort}</span>}
          {month.status === 'shipped' && <span>Votre livre est en route</span>}
          {month.status === 'delivered' && <span>Votre livre est arrivé</span>}
          {month.status === 'to_plan' && (
            <>
              <Calendar className="h-3.5 w-3.5" />
              <span>{month.deadline ? `Deadline : ${month.deadline} — Livraison ${month.deliveryShort}` : `Livraison prévue le ${month.deliveryShort}`}</span>
            </>
          )}
        </div>
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
  onChoose: (flow: FlowType) => void;
}

const ThemeSelectionSheet: React.FC<ThemeSelectionSheetProps> = ({ open, onOpenChange, month, childName, onChoose }) => {
  const isMobile = useIsMobile();
  const [selected, setSelected] = useState<FlowType>('monthly');

  React.useEffect(() => {
    if (open) setSelected('monthly');
  }, [open]);

  if (!month) return null;

  const handleClose = (o: boolean) => onOpenChange(o);

  const handleContinue = () => {
    onChoose(selected);
  };

  const OptionCard: React.FC<{
    value: FlowType;
    icon: string;
    label: string;
    badge?: string;
    title?: string;
    description: string;
  }> = ({ value, icon, label, badge, title, description }) => {
    const isSel = selected === value;
    return (
      <button
        type="button"
        onClick={() => setSelected(value)}
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

  const Content = (
    <div className="px-5 pb-6 pt-2 sm:px-8 sm:pt-6 relative">
      <h3 className="text-xl font-bold text-foreground text-center mb-1 mt-2">
        Choisir le thème de ce livre
      </h3>
      <p className="text-sm text-muted-foreground text-center mb-6">
        Ce choix remplacera le livre prévu pour ce mois
      </p>

      <div className="space-y-3 mb-6">
        <OptionCard
          value="monthly"
          icon="📖"
          label="Livre du mois"
          badge="Recommandé par MCF"
          title={month.bookTitle}
          description={month.bookSummary}
        />

        {month.substituteThemeId && (
          <OptionCard
            value="special"
            icon="🎉"
            label="Option spéciale MCF"
            title={month.substituteThemeTitre?.replace('[Prénom]', childName) ?? ''}
            description={`Ce mois-ci, ${month.substitutePersonName} fête son anniversaire, on lui dédie ce livre !`}
          />
        )}

        <OptionCard
          value="custom"
          icon="✨"
          label="Histoire inédite"
          description={`Vous imaginez, nous créons. Décrivez l'histoire de vos rêves pour ${childName}.`}
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
        <DrawerContent className="bg-white">{Content}</DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-md p-0">{Content}</DialogContent>
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
        return (data ?? []) as BookTimelineRow[];
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

  const months: MockMonth[] = useMemo(
    () => (timelineRows ?? []).map((r, i) => mapTimelineRow(r, i, activeChild?.firstName ?? '')),
    [timelineRows, activeChild?.firstName]
  );

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

  const focusedMonth =
    focusedMonthIndex !== null
      ? months.find((m) => m.monthIndex === focusedMonthIndex) ?? null
      : null;

  // 3. Save mutation
  const { mutate: saveChoice, isPending: isSaving } = useSaveBookChoice(activeChildId);

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
    return [child, ...members, ...pets];
  }, [activeChild]);

  const handleWizardSubmit = (payload: { selectedCharacters: CharacterChoice[]; storyIdea?: string; note?: string }) => {
    if (!focusedMonth?.bookRequestId) {
      toast.error('Livre introuvable, réessaie.');
      return;
    }
    const themeType: 'standard' | 'substitute' | 'original' =
      activeFlow === 'custom' ? 'original' : activeFlow === 'special' ? 'substitute' : 'standard';

    saveChoice(
      {
        bookRequestId: focusedMonth.bookRequestId,
        selectedThemeType: themeType,
        selectedCharacters: payload.selectedCharacters,
        originalThemeInstructions: themeType === 'original' ? payload.storyIdea : undefined,
        selectedThemeId: activeFlow === 'special'
          ? (focusedMonth?.substituteThemeId ?? undefined)
          : activeFlow === 'monthly'
          ? (focusedMonth?.themeId ?? undefined)
          : undefined,
        note: payload.note,
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
    if (activeFlow === 'special' && focusedMonth.substituteThemeTitre) {
      return focusedMonth.substituteThemeTitre.replace('[Prénom]', activeChild?.firstName ?? '');
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
                <span className="text-muted-foreground ml-1">livres prévus</span>
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
              <span className="text-muted-foreground ml-1">livres prévus</span>
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
            setActiveFlow('monthly');
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
            />
          ))}
        </div>
      )}

      {/* Wizard */}
      <Wizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        childName={activeChild?.firstName ?? ''}
        flow={activeFlow}
        bookTitle={wizardBookTitle}
        characters={wizardCharacters}
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
        onSubmit={handleWizardSubmit}
      />

      {/* Theme selection sheet */}
      <ThemeSelectionSheet
        open={themeSheetOpen}
        onOpenChange={setThemeSheetOpen}
        month={focusedMonth}
        childName={activeChild?.firstName ?? ''}
        onChoose={(flow) => {
          setActiveFlow(flow);
          setThemeSheetOpen(false);
          setWizardOpen(true);
        }}
      />
    </div>
  );
};

export default MyStoriesTab;
