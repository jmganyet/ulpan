import { progresBuit, type Fitxa, type Progres } from './srs'

export interface Magatzem {
  llegeix(): Progres
  desa(p: Progres): void
  disponible: boolean
}

export class ErrorImportacio extends Error {
  constructor(missatge: string) {
    super(missatge)
    this.name = 'ErrorImportacio'
  }
}

const esObjecte = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== null && !Array.isArray(x)
const esNombre = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)

function esFitxa(x: unknown): x is Fitxa {
  return esObjecte(x) && esNombre(x.caixa) && esNombre(x.venc) && esNombre(x.encerts) && esNombre(x.errors)
}

/** Valida la forma d'un valor ja parsejat; retorna el progrés o null. */
function valida(x: unknown): Progres | null {
  if (!esObjecte(x) || x.versio !== 1) return null
  if (!esObjecte(x.fitxes) || !Object.values(x.fitxes).every(esFitxa)) return null
  if (!esObjecte(x.vist) || !Object.values(x.vist).every(esNombre)) return null
  const p: Progres = { versio: 1, fitxes: x.fitxes as Record<string, Fitxa>, vist: x.vist as Record<string, number> }
  const d = x.darrera
  if (d !== undefined) {
    if (!esObjecte(d) || typeof d.unitat !== 'string' || typeof d.pas !== 'string') return null
    p.darrera = { unitat: d.unitat, pas: d.pas }
  }
  return p
}

export function exporta(p: Progres): string {
  return JSON.stringify(p, null, 2)
}

export function importa(json: string): Progres {
  let valor: unknown
  try {
    valor = JSON.parse(json)
  } catch {
    throw new ErrorImportacio('El fitxer no és un JSON vàlid.')
  }
  if (esObjecte(valor) && valor.versio !== 1) {
    throw new ErrorImportacio('El fitxer és d\'una altra versió i no es pot importar.')
  }
  const p = valida(valor)
  if (!p) throw new ErrorImportacio('El fitxer no té el format de progrés esperat.')
  return p
}

/** Registra el primer cop que s'ha vist un element (pur; no sobreescriu). */
export function marcaVist(p: Progres, id: string, ara: number): Progres {
  if (id in p.vist) return p
  return { ...p, vist: { ...p.vist, [id]: ara } }
}

export function magatzemLocal(clau = 'ulpan:progres'): Magatzem {
  let disponible = false
  try {
    const sonda = `${clau}:sonda`
    localStorage.setItem(sonda, '1')
    disponible = localStorage.getItem(sonda) === '1'
    localStorage.removeItem(sonda)
  } catch {
    disponible = false
  }
  return {
    disponible,
    llegeix() {
      if (!disponible) return progresBuit()
      let brut: string | null = null
      try {
        brut = localStorage.getItem(clau)
        if (brut === null) return progresBuit()
        const p = valida(JSON.parse(brut))
        if (p) return p
      } catch {
        // cau a la còpia de seguretat
      }
      try {
        if (brut !== null) localStorage.setItem(`${clau}:corrupte`, brut)
      } catch {
        // sense espai: no es pot copiar
      }
      return progresBuit()
    },
    desa(p) {
      if (!disponible) return
      try {
        localStorage.setItem(clau, JSON.stringify(p))
      } catch {
        // quota o bloqueig: no es desa, però no es trenca l'app
      }
    },
  }
}
