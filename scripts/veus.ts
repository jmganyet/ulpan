// Veus dels diàlegs: les neuronals hebrees de Microsoft (Avri, home; Hila, dona) via `edge-tts`.
// Si dos personatges del mateix diàleg tenen la mateixa veu, el segon la té amb un altre to; «cor» en barreja tres.
// Les paraules, la gramàtica i els textos sense personatges, amb la Hila (VEU_BASE).
import type { Text } from '../src/contingut/tipus'

/** Id de veu: `carmit`, `ms:<Avri|Hila>:<to>` (to en Hz, p. ex. `+0Hz`) o `cor`. */
export type Veu = string
export const CARMIT: Veu = 'carmit'
/** Veu de les paraules, la gramàtica i els textos que no són diàlegs. */
export const VEU_BASE: Veu = 'ms:Hila:+0Hz'

type Classe = 'dona' | 'home' | 'nen' | 'cor'

/** Variants per classe: cada personatge d'un diàleg en té una de diferent dins la seva classe. */
const VARIANTS: Record<Classe, Veu[]> = {
  dona: ['ms:Hila:+0Hz', 'ms:Hila:-12Hz', 'ms:Hila:+12Hz'],
  home: ['ms:Avri:+0Hz', 'ms:Avri:-12Hz', 'ms:Avri:+12Hz'],
  nen: ['ms:Hila:+40Hz', 'ms:Hila:+55Hz'],
  cor: ['cor'],
}

/** Classe de veu de cada personatge del dossier (el gènere el diuen les formes verbals del text). */
const PERSONATGES: Record<string, Classe> = {
  'דוריס': 'dona', 'שרה': 'dona', 'אסתר': 'dona', 'תמר': 'dona', 'רחל': 'dona', 'מורה': 'dona', 'Persona A': 'dona',
  'רוברטו': 'home', 'יוסף': 'home', 'יוסי': 'home', 'איש': 'home', 'בוריס': 'home', 'סטיב': 'home',
  'עמנואל': 'home', 'יצחק': 'home', 'Persona B': 'home',
  'ילד': 'nen',
  'תלמידים': 'cor',
}

/** Veu de cada personatge d'un diàleg; els que no són a la taula alternen dona/home per ordre d'aparició. */
export function veusDialeg(t: Text): Map<string, Veu> {
  const veus = new Map<string, Veu>()
  if (t.tipus !== 'dialeg') return veus
  const noms = t.personatges?.length ? t.personatges : [...new Set(t.linies.map((l) => l.qui).filter(Boolean) as string[])]
  const usades: Record<Classe, number> = { dona: 0, home: 0, nen: 0, cor: 0 }
  noms.forEach((nom, i) => {
    const classe = PERSONATGES[nom] ?? (i % 2 ? 'home' : 'dona')
    const v = VARIANTS[classe]
    veus.set(nom, v[usades[classe]++ % v.length])
  })
  return veus
}

export type VeuMs = { nom: string; to: string; retard: number }

/** Les veus de Microsoft que componen una veu (una sola, o tres per al cor); `null` per a la Carmit. */
export function componentsVeu(veu: Veu): VeuMs[] | null {
  if (veu === CARMIT) return null
  if (veu === 'cor') return [
    { nom: 'he-IL-AvriNeural', to: '+0Hz', retard: 0 },
    { nom: 'he-IL-HilaNeural', to: '+0Hz', retard: 30 },
    { nom: 'he-IL-AvriNeural', to: '+15Hz', retard: 55 },
  ]
  const m = /^ms:(Avri|Hila):([+-]\d+Hz)$/.exec(veu)
  if (m) return [{ nom: `he-IL-${m[1]}Neural`, to: m[2], retard: 0 }]
  throw new Error(`Veu desconeguda: ${veu}`)
}
