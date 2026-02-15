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
      message: `Le temps passe ! Actualise le portrait de ${firstName}.`,
    };
  }
  return { hasAlert: false, message: '' };
}
