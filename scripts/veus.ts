// Veus dels diàlegs. Al Mac només hi ha una veu hebrea (Carmit): les altres en surten transformant-la amb ffmpeg.
// Un factor < 1 baixa el to i el timbre (veu d'home), > 1 l'apuja (nen); «cor» barreja dues veus (un grup que parla).
import type { Text } from '../src/contingut/tipus'

/** Id de veu: `carmit` (sense transformar), `f<factor>` (to i timbre per factor) o `cor`. */
export type Veu = string
export const CARMIT: Veu = 'carmit'

type Classe = 'dona' | 'home' | 'nen' | 'cor'

/** Variants per classe: si dos personatges del mateix diàleg són de la mateixa classe, cadascun té la seva. */
const VARIANTS: Record<Classe, Veu[]> = {
  dona: [CARMIT, 'f1.08', 'f0.94'],
  home: ['f0.80', 'f0.87', 'f0.74'],
  nen: ['f1.16', 'f1.24'],
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

const SR = 22050 // la freqüència de sortida de `say`
const transposa = (f: string) => `asetrate=${Math.round(SR * Number(f))},aresample=${SR},atempo=${(1 / Number(f)).toFixed(4)}`

/** Filtre d'ffmpeg (-filter_complex) per a una veu; `null` si no cal transformar-la. */
export function filtreVeu(veu: Veu): string | null {
  if (veu === CARMIT) return null
  if (veu === 'cor') return `[0:a]asplit=3[a][b][c];[b]${transposa('0.80')},adelay=35[b2];[c]${transposa('1.08')},adelay=20[c2];[a][b2][c2]amix=inputs=3:normalize=0,volume=0.6`
  if (/^f\d\.\d+$/.test(veu)) return `[0:a]${transposa(veu.slice(1))}`
  throw new Error(`Veu desconeguda: ${veu}`)
}
