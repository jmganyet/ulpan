const MARCA = '⁇' // ⁇

/** Treu punts i accents (U+0591–U+05C7), excepte el maqaf (U+05BE). */
export function treuVocals(s: string): string {
  return s.replace(/[֑-ֽֿ-ׇ]/g, '')
}

/** Forma comparable: sense vocals, maqaf i guionet com a espai, espais col·lapsats. */
export function normalitza(s: string): string {
  return treuVocals(s).replace(/[־-]/g, ' ').replace(/\s+/g, ' ').trim()
}

export function iguals(a: string, b: string): boolean {
  return normalitza(a) === normalitza(b)
}

export function teComprovar(s: string): boolean {
  return s.includes(MARCA)
}

/** Treu la marca ⁇ i l'espai que la precedeix. */
export function senseComprovar(s: string): string {
  return s.replace(new RegExp(`\\s*${MARCA}`, 'g'), '').replace(/ {2,}/g, ' ').trim()
}
