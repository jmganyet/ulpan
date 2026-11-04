import { useEffect, useState } from 'preact/hooks'

/** Lletra de l'hebreu: quadrada, cursiva o totes dues (la quadrada i, a sota, la cursiva). */
export type Lletra = 'quadrada' | 'cursiva' | 'dues'
export type Preferencies = {
  vocals: boolean; lletra: Lletra; sons: boolean; translit: boolean; dialegLent: boolean
  /** Traducció catalana sota cada línia dels diàlegs i textos. */ traduccio: boolean
  /** Als diàlegs, una pausa després de cada línia per repetir-la. */ repetir: boolean
}

const CLAU = 'ulpan:preferencies'
// Niqqud visible d'entrada (triat a referencia/dialeg.html el 2026-11-04: `niqqud=si`).
const PER_DEFECTE: Preferencies = { vocals: true, lletra: 'quadrada', sons: true, translit: false, dialegLent: false, traduccio: false, repetir: false }
const LLETRES: Lletra[] = ['quadrada', 'cursiva', 'dues']

function llegeix(): Preferencies {
  try {
    const x = JSON.parse(localStorage.getItem(CLAU) ?? 'null')
    if (x && typeof x === 'object') {
      return {
        vocals: typeof x.vocals === 'boolean' ? x.vocals : PER_DEFECTE.vocals,
        lletra: LLETRES.includes(x.lletra) ? x.lletra : PER_DEFECTE.lletra,
        sons: typeof x.sons === 'boolean' ? x.sons : PER_DEFECTE.sons,
        translit: typeof x.translit === 'boolean' ? x.translit : PER_DEFECTE.translit,
        dialegLent: typeof x.dialegLent === 'boolean' ? x.dialegLent : PER_DEFECTE.dialegLent,
        traduccio: typeof x.traduccio === 'boolean' ? x.traduccio : PER_DEFECTE.traduccio,
        repetir: typeof x.repetir === 'boolean' ? x.repetir : PER_DEFECTE.repetir,
      }
    }
  } catch {
    // sense preferències desades
  }
  return { ...PER_DEFECTE }
}

let actual = llegeix()

/** Les preferències d'ara, fora d'un component (p. ex. el reproductor dels diàlegs). */
export const preferenciesActuals = (): Preferencies => actual
const oients = new Set<() => void>()

/** Fixa les preferències (i les desa, si es pot). */
export function desaPreferencies(p: Preferencies): void {
  actual = p
  try {
    localStorage.setItem(CLAU, JSON.stringify(p))
  } catch {
    // no es poden desar: només valen en aquesta sessió
  }
  oients.forEach((f) => f())
}

export function usePreferencies() {
  const [p, setP] = useState(actual)
  useEffect(() => {
    const f = () => setP(actual)
    oients.add(f)
    f()
    return () => { oients.delete(f) }
  }, [])
  return {
    ...p,
    setVocals: (vocals: boolean) => desaPreferencies({ ...actual, vocals }),
    setLletra: (lletra: Lletra) => desaPreferencies({ ...actual, lletra }),
    setSons: (sons: boolean) => desaPreferencies({ ...actual, sons }),
    setTranslit: (translit: boolean) => desaPreferencies({ ...actual, translit }),
    setDialegLent: (dialegLent: boolean) => desaPreferencies({ ...actual, dialegLent }),
    setTraduccio: (traduccio: boolean) => desaPreferencies({ ...actual, traduccio }),
    setRepetir: (repetir: boolean) => desaPreferencies({ ...actual, repetir }),
  }
}
