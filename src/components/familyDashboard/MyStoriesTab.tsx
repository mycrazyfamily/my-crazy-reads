import React, { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Book, Sparkles, ArrowLeft, Calendar, ChevronRight, X } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFamilyData, type FamilyChild } from '@/hooks/useFamilyData';
import { useBookTimeline, type BookTimelineRow } from '@/hooks/useBookTimeline';
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
  hasSpecialOption?: boolean;
  specialOptionTitle?: string;
  specialOptionSubtitle?: string;
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
    hasSpecialOption: true,
    specialOptionTitle: "L'anniversaire de Jules",
    specialOptionSubtitle: "Jules fête ses 8 ans en juin — on lui dédie ce livre !",
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

// ---------- Wizard ----------

type FlowType = 'monthly' | 'special' | 'custom';

interface WizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  childName: string;
  onComplete: () => void;
  flow: FlowType;
  bookTitle: string;
}

const Wizard: React.FC<WizardProps> = ({ open, onOpenChange, childName, onComplete, flow, bookTitle }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<1 | 2>(1);
  const [selected, setSelected] = useState<string[]>(['maman', 'papa']);
  const [note, setNote] = useState('');
  const [customStory, setCustomStory] = useState('');

  const reset = () => {
    setStep(1);
    setSelected(['maman', 'papa']);
    setNote('');
    setCustomStory('');
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const toggle = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleValidate = () => {
    onComplete();
    handleClose(false);
  };

  const isCustom = flow === 'custom';
  const charactersStepTitle = isCustom
    ? `Qui est dans cette histoire ?`
    : `Qui accompagne ${childName} dans ${bookTitle} ?`;
  const validateLabel = isCustom ? '✨ Valider mon histoire inédite' : '✨ Valider mon livre';

  const Content = (
    <div className="px-5 pb-6 pt-2 sm:px-8 sm:pt-6 relative">
      <button
        type="button"
        onClick={() => handleClose(false)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

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
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            {charactersStepTitle}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sélectionne les personnages qui apparaîtront dans le livre
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {MOCK_CHARACTERS.map((c) => {
              const isSel = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                  }}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                  >
                    {c.label}
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
          <h3 className="text-xl font-bold text-foreground text-center mb-1">
            {charactersStepTitle}
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Sélectionne les personnages qui apparaîtront dans le livre
          </p>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {MOCK_CHARACTERS.map((c) => {
              const isSel = selected.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                  style={{
                    borderColor: isSel ? PRIMARY_VIOLET : '#E5E7EB',
                    backgroundColor: isSel ? `${PRIMARY_VIOLET}10` : 'white',
                  }}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: isSel ? PRIMARY_VIOLET : '#374151' }}
                  >
                    {c.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleValidate} className="flex-1">
              Passer
            </Button>
            <Button
              onClick={handleValidate}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              {validateLabel}
            </Button>
          </div>
        </>
      )}

      {!isCustom && step === 2 && (
        <>
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
              className="flex-1"
            >
              Passer
            </Button>
            <Button
              onClick={handleValidate}
              className="flex-1 text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_VIOLET }}
            >
              {validateLabel}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleClose}>
        <DrawerContent className="bg-white">
          {Content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-white max-w-md p-0">
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
  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      <Card className="border-2 border-border overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Cover */}
            <div
              className="flex-shrink-0 mx-auto md:mx-0 w-40 h-56 sm:w-48 sm:h-64 rounded-lg flex items-center justify-center shadow-md"
              style={{ backgroundColor: `${PRIMARY_VIOLET}15` }}
            >
              <Book className="h-16 w-16" style={{ color: PRIMARY_VIOLET }} strokeWidth={1.5} />
            </div>

            {/* Info */}
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

              <div className="flex flex-wrap gap-2 mb-6">
                {month.bookTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button
                onClick={onConfigure}
                className="w-full text-white hover:opacity-90 h-12 text-base font-semibold"
                style={{ backgroundColor: PRIMARY_VIOLET }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Configurer cette aventure
              </Button>

              <button
                type="button"
                onClick={onChooseTheme}
                className="block mx-auto mt-4 text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
              >
                Choisir un autre thème pour ce mois
              </button>
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
            <span className="hidden sm:block text-sm text-muted-foreground truncate max-w-[180px] md:max-w-[260px]">
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
        <p className="sm:hidden text-sm text-muted-foreground truncate mb-1">
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
            <span>Personnalisé le {month.configuredOn} · {month.configuredCharacters?.join(', ')}</span>
          )}
          {month.status === 'in_creation' && <span>Livre en cours de génération</span>}
          {month.status === 'in_printing' && <span>Livraison prévue le {month.deliveryShort}</span>}
          {month.status === 'to_plan' && (
            <>
              <Calendar className="h-3.5 w-3.5" />
              <span>Livraison prévue le {month.deliveryShort}</span>
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
      <button
        type="button"
        onClick={() => handleClose(false)}
        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
        aria-label="Fermer"
      >
        <X className="h-4 w-4" />
      </button>

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

        {month.hasSpecialOption && (
          <OptionCard
            value="special"
            icon="🎉"
            label="Option spéciale MCF"
            title={month.specialOptionTitle}
            description={month.specialOptionSubtitle ?? ''}
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

const MyStoriesTab: React.FC<MyStoriesTabProps> = ({ children }) => {
  // Fallback children for mock if none provided
  const fallbackChildren: Child[] = [
    { id: 'manon', firstName: 'Manon', age: '6 ans et 8 mois', avatar: null, personalityEmoji: '👧' },
    { id: 'beline', firstName: 'Béline', age: '4 ans', avatar: null, personalityEmoji: '🧒' },
    { id: 'valentine', firstName: 'Valentine', age: '8 ans', avatar: null, personalityEmoji: '👧' },
    { id: 'jules', firstName: 'Jules', age: '5 ans', avatar: null, personalityEmoji: '👦' },
    { id: 'robin', firstName: 'Robin', age: '3 ans', avatar: null, personalityEmoji: '🧒' },
  ];
  const list = children.length > 0 ? children : fallbackChildren;

  const [activeChildId, setActiveChildId] = useState<string>(list[0]?.id);
  const activeChild = useMemo(() => list.find(c => c.id === activeChildId) ?? list[0], [list, activeChildId]);

  const [months, setMonths] = useState<MockMonth[]>(MOCK_MONTHS);
  const [focusedMonthIndex, setFocusedMonthIndex] = useState<number | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [themeSheetOpen, setThemeSheetOpen] = useState(false);
  const [activeFlow, setActiveFlow] = useState<FlowType>('monthly');

  const focusedMonth = focusedMonthIndex !== null
    ? months.find(m => m.monthIndex === focusedMonthIndex) ?? null
    : null;

  const configuredCount = months.filter(m => m.status === 'configured').length;

  const handleWizardComplete = () => {
    if (focusedMonthIndex === null) return;
    if (activeFlow === 'custom') {
      toast.success('Votre idée a bien été enregistrée ! 🎉');
      setFocusedMonthIndex(null);
      return;
    }
    setMonths(prev => prev.map(m => m.monthIndex === focusedMonthIndex ? {
      ...m,
      status: 'configured',
      configuredOn: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
      configuredCharacters: ['Maman', 'Papa'],
      ...(activeFlow === 'special' && m.specialOptionTitle ? { bookTitle: m.specialOptionTitle } : {}),
    } : m));
    toast.success('Livre configuré ! 🎉');
    setFocusedMonthIndex(null);
  };

  const wizardBookTitle = (() => {
    if (!focusedMonth) return '';
    if (activeFlow === 'special' && focusedMonth.specialOptionTitle) return focusedMonth.specialOptionTitle;
    return focusedMonth.bookTitle;
  })();

  return (
    <div className="space-y-6">
      {/* 1. Children chips */}
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

      {/* 2. Child header */}
      <Card className="border-2 border-border bg-gradient-to-br from-white to-muted/30">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-white shadow-md flex-shrink-0">
              {activeChild?.avatar ? (
                <AvatarImage src={activeChild.avatar} alt={activeChild.firstName} />
              ) : (
                <AvatarFallback className="bg-muted text-3xl">
                  {activeChild?.personalityEmoji}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 truncate">
                {activeChild?.firstName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {activeChild?.age} · Timeline sur 12 mois
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-end gap-1 flex-shrink-0">
              <div className="text-sm">
                <span className="font-bold text-foreground">12</span>
                <span className="text-muted-foreground ml-1">livres prévus</span>
              </div>
              <div className="text-sm">
                <span className="font-bold" style={{ color: PRIMARY_VIOLET }}>{configuredCount}</span>
                <span className="text-muted-foreground ml-1">configuré{configuredCount > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Mobile counters */}
          <div className="sm:hidden flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm">
            <div>
              <span className="font-bold text-foreground">12</span>
              <span className="text-muted-foreground ml-1">livres prévus</span>
            </div>
            <div>
              <span className="font-bold" style={{ color: PRIMARY_VIOLET }}>{configuredCount}</span>
              <span className="text-muted-foreground ml-1">configuré{configuredCount > 1 ? 's' : ''}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. List view OR Focus view */}
      {focusedMonth ? (
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
        onComplete={handleWizardComplete}
        flow={activeFlow}
        bookTitle={wizardBookTitle}
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
