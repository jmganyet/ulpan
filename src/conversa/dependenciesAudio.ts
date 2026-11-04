import type { Linia } from '../contingut/tipus'
import { BASE } from '../contingut/index'
import { reprodueix, aturaSo, VELOCITAT_LENTA } from '../peces/so'
import { preferenciesActuals } from '../preferencies'
import { urlAudio } from '../peces/audioBlob'
import type { Deps } from './reproductor'

const DURADA_PER_DEFECTE = 2

/** Dependències reals: un element d'àudio compartit amb la resta de l'app (peces/so). */
export const TEMPS_MAXIM_METADADES = 3000

export function dependenciesAudio(tempsMaxim = TEMPS_MAXIM_METADADES): Deps {
  const el = new Audio()
  const durades = new Map<string, number>()
  const url = (l: Linia) => `${BASE}audio/${l.audio!.normal}`
  // El botó «Lent» dels diàlegs alenteix la reproducció (i, per tant, els silencis per repetir).
  const velocitat = () => (preferenciesActuals().dialegLent ? VELOCITAT_LENTA : 1)
  return {
    toca: (l) => new Promise<void>((resolt) => {
      const fi = () => {
        for (const e of ['ended', 'pause', 'error']) el.removeEventListener(e, fi)
        if (Number.isFinite(el.duration)) durades.set(l.id, el.duration)
        resolt()
      }
      for (const e of ['ended', 'pause', 'error']) el.addEventListener(e, fi)
      try {
        reprodueix(el, url(l), velocitat()).catch(fi)
      } catch { fi() }
    }),
    durada: (l) => {
      const coneguda = durades.get(l.id)
      if (coneguda !== undefined) return Promise.resolve(coneguda / velocitat())
      return new Promise<number>((resolt) => {
        const a = new Audio()
        const fi = () => { clearTimeout(t); const d = Number.isFinite(a.duration) ? a.duration : DURADA_PER_DEFECTE; durades.set(l.id, d); resolt(d / velocitat()) }
        // Un fitxer encallat (sense xarxa) no ha de penjar el bucle: durada per defecte, sense desar-la.
        const t = setTimeout(() => resolt(DURADA_PER_DEFECTE / velocitat()), tempsMaxim)
        a.addEventListener('loadedmetadata', fi)
        a.addEventListener('error', fi)
        a.preload = 'metadata'
        urlAudio(url(l)).then((b) => { a.src = b }, fi)
      })
    },
    espera: (ms) => new Promise((r) => setTimeout(r, ms)),
    atura: aturaSo,
  }
}
