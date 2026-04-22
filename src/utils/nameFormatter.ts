/**
 * Splits camelCase / PascalCase glued words by inserting a space
 * before each uppercase letter that follows a lowercase letter or digit.
 *
 * Examples:
 *  - "petitChou"     -> "petit Chou"
 *  - "monChienAdoré" -> "mon Chien Adoré"
 *  - "Jean-Marc"     -> "Jean-Marc" (untouched)
 *  - "MARIE"         -> "MARIE"     (untouched, no lowercase neighbour)
 *  - "  bob  "       -> "bob"       (trimmed + collapsed spaces)
 */
export function splitCamelCase(value: string | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return String(value);

  // Insert a space between [lowercase|digit] and [uppercase]
  // and between consecutive uppercase letters followed by lowercase (e.g. "ABCdef" -> "AB Cdef")
  const spaced = value
    .replace(/([a-zà-ÿ0-9])([A-ZÀ-Ý])/g, '$1 $2')
    .replace(/([A-ZÀ-Ý]+)([A-ZÀ-Ý][a-zà-ÿ])/g, '$1 $2');

  // Collapse multiple whitespace and trim
  return spaced.replace(/\s+/g, ' ').trim();
}

/**
 * Safe variant that returns null when input is empty/whitespace.
 * Useful for nullable DB columns.
 */
export function splitCamelCaseOrNull(value: string | null | undefined): string | null {
  const formatted = splitCamelCase(value);
  return formatted.length > 0 ? formatted : null;
}
