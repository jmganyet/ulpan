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

/** R25: nota del transcriptor en català, no text hebreu: la primera lletra (hebrea o llatina) és llatina.
 * Cobreix les línies sense cap lletra hebrea i les notes que citen hebreu («Esquema…: של מי ←…»).
 * Un buit sol («____») no és nota. */
export function esNota(s: string): boolean {
  const m = s.match(/[\u05D0-\u05EAA-Za-zÀ-ÿ]/)
  return !!m && !/[\u05D0-\u05EA]/.test(m[0])
}

/** «מאוד» pot anar darrere o davant de l'adjectiu (טובה מאוד / מאוד טובה): les dues ordenacions valen (2026-11-04). */
export function frasesAcceptades(frase: string): string[] {
  const mots = frase.trim().split(/\s+/)
  const out = new Set([mots.join(' ')])
  mots.forEach((m, i) => {
    const net = (s: string) => normalitza(s).replace(/[.,?!]/g, '')
    if (i > 0 && net(m) === 'מאוד' && net(mots[i - 1]) !== 'מאוד') {
      // Es mou la puntuació final perquè quedi al final de la frase
      const punt = /[.,?!]+$/.exec(m)?.[0] ?? ''
      const v = [...mots]
      v[i - 1] = m.replace(/[.,?!]+$/, '')
      v[i] = mots[i - 1] + punt
      out.add(v.join(' '))
    }
  })
  return [...out]
}
