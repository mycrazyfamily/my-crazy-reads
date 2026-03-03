/**
 * Detects whether a character's avatar needs regeneration
 * based on age threshold crossings since the avatar was generated.
 */

/** Extract the generation timestamp (ms) from an avatar URL like ..._{timestamp}.png */
export function extractGenerationTimestamp(avatarUrl: string | null | undefined): number | null {
  if (!avatarUrl) return null;
  const match = avatarUrl.match(/_(\d{13,})\.png$/);
  return match ? parseInt(match[1], 10) : null;
}

/** Calculate age in years at a given date, from a birth date */
function ageInYearsAt(birthDate: Date, atDate: Date): number {
  let years = atDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = atDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && atDate.getDate() < birthDate.getDate())) {
    years--;
  }
  return Math.max(0, years);
}

/** Child thresholds: only 4 (toddler → child) */
const CHILD_THRESHOLDS = [4];

/** Relative thresholds */
const RELATIVE_THRESHOLDS = [4, 13, 20, 30, 56, 66, 76];

function hasCrossedThreshold(ageAtGen: number, currentAge: number, thresholds: number[]): boolean {
  return thresholds.some(t => ageAtGen < t && currentAge >= t);
}

export type AvatarAgeAlert = {
  hasAlert: boolean;
  message: string;
};

/**
 * Check if a child's avatar needs updating due to age threshold crossing.
 * @param birthDateStr - ISO date string of birth
 * @param avatarUrl - full avatar URL containing generation timestamp
 */
export function getChildAvatarAlert(
  firstName: string,
  birthDateStr: string | null | undefined,
  avatarUrl: string | null | undefined
): AvatarAgeAlert {
  if (!birthDateStr || !avatarUrl) return { hasAlert: false, message: '' };

  const genTs = extractGenerationTimestamp(avatarUrl);
  if (!genTs) return { hasAlert: false, message: '' };

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return { hasAlert: false, message: '' };

  const ageAtGen = ageInYearsAt(birthDate, new Date(genTs));
  const currentAge = ageInYearsAt(birthDate, new Date());

  if (hasCrossedThreshold(ageAtGen, currentAge, CHILD_THRESHOLDS)) {
    return {
      hasAlert: true,
      message: `${firstName} a grandi ! Actualise son portrait.`,
    };
  }
  return { hasAlert: false, message: '' };
}

/**
 * Check if a relative's avatar needs updating due to age threshold crossing.
 * @param birthDateStr - ISO date string or similar
 * @param avatarUrl - full avatar URL containing generation timestamp
 */
export function getRelativeAvatarAlert(
  firstName: string,
  birthDateStr: string | null | undefined,
  avatarUrl: string | null | undefined
): AvatarAgeAlert {
  if (!birthDateStr || !avatarUrl) return { hasAlert: false, message: '' };

  const genTs = extractGenerationTimestamp(avatarUrl);
  if (!genTs) return { hasAlert: false, message: '' };

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return { hasAlert: false, message: '' };

  const ageAtGen = ageInYearsAt(birthDate, new Date(genTs));
  const currentAge = ageInYearsAt(birthDate, new Date());

  if (hasCrossedThreshold(ageAtGen, currentAge, RELATIVE_THRESHOLDS)) {
    return {
      hasAlert: true,
      message: `⏳ Le temps passe ! Actualise l'avatar de ${firstName}. Clique sur Modifier puis enregistre pour régénérer son avatar.`,
    };
  }
  return { hasAlert: false, message: '' };
}

const PET_ADULT_THRESHOLD_MONTHS: Record<string, number> = {
  "chat": 12, "chaton": 12, "cat": 12,
  "chien": 12, "dog": 12,
  "hamster": 4,
  "cochon d'inde": 6, "cobaye": 6,
  "lapin": 6, "lapine": 6,
  "gerbille": 4, "gerbil": 4,
  "rat": 4, "souris": 3,
  "chinchilla": 12, "écureuil": 12,
  "perroquet": 24, "ara": 24, "cacatoès": 24,
  "perruche": 12, "canari": 12,
  "cockatiel": 12, "calopsitte": 12,
  "tortue": 36,
  "gecko": 12, "lézard": 12,
  "serpent": 24, "couleuvre": 24,
  "iguane": 18, "caméléon": 12,
  "dragon barbu": 12, "agame barbu": 12,
  "poisson rouge": 12, "goldfish": 12,
  "betta": 6, "combattant": 6,
  "guppy": 4, "poisson": 12,
  "hérisson": 6, "furet": 6,
  "mini cochon": 18, "cochon nain": 18,
};

const DEFAULT_PET_THRESHOLD_MONTHS = 12;

function getPetAdultThresholdMonths(type: string): number {
  const key = (type || '').toLowerCase().trim();
  return PET_ADULT_THRESHOLD_MONTHS[key] ?? DEFAULT_PET_THRESHOLD_MONTHS;
}

function ageInMonthsAt(birthDate: Date, atDate: Date): number {
  const months = (atDate.getFullYear() - birthDate.getFullYear()) * 12
    + (atDate.getMonth() - birthDate.getMonth());
  return Math.max(0, months);
}

export function getPetAvatarAlert(
  name: string,
  petType: string | null | undefined,
  birthDateStr: string | null | undefined,
  avatarUrl: string | null | undefined
): AvatarAgeAlert {
  if (!birthDateStr || !avatarUrl || !petType) return { hasAlert: false, message: '' };
  const genTs = extractGenerationTimestamp(avatarUrl);
  if (!genTs) return { hasAlert: false, message: '' };
  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return { hasAlert: false, message: '' };
  const threshold = getPetAdultThresholdMonths(petType);
  const monthsAtGen = ageInMonthsAt(birthDate, new Date(genTs));
  const monthsNow = ageInMonthsAt(birthDate, new Date());
  if (monthsAtGen < threshold && monthsNow >= threshold) {
    return {
      hasAlert: true,
      message: `⏳ ${name} a grandi ! Actualise son portrait. Clique sur Modifier puis enregistre pour régénérer son avatar.`,
    };
  }
  return { hasAlert: false, message: '' };
}
