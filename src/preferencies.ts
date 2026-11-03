import { useEffect, useState } from 'preact/hooks'

export type Lletra = 'quadrada' | 'cursiva'
export type Preferencies = { vocals: boolean; lletra: Lletra }

const CLAU = 'ulpan:preferencies'
const PER_DEFECTE: Preferencies = { vocals: false, lletra: 'quadrada' }

function llegeix(): Preferencies {
  try {
    const x = JSON.parse(localStorage.getItem(CLAU) ?? 'null')
    if (x && typeof x === 'object') {
      return {
        vocals: typeof x.vocals === 'boolean' ? x.vocals : PER_DEFECTE.vocals,
        lletra: x.lletra === 'cursiva' ? 'cursiva' : 'quadrada',
      }
    }
  } catch {
    // sense preferències desades
  }
  return { ...PER_DEFECTE }
}

let actual = llegeix()
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
  }
}
