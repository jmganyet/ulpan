import type { Unitat } from './tipus'

export type EntradaIndex = {
  id: string; num: number; titol: string; color: string; pagines: string[]
  textos: number; paraules: number; exercicis: number
}

export const BASE: string = import.meta.env.BASE_URL

export class ErrorCarrega extends Error {
  constructor(public recurs: string) {
    super(`No s'ha pogut carregar ${recurs}. Comprova la connexió i torna-ho a provar.`)
    this.name = 'ErrorCarrega'
  }
}

async function json<T>(camí: string): Promise<T> {
  try {
    const r = await fetch(`${BASE}contingut/${camí}`)
    if (!r.ok) throw new Error(String(r.status))
    return (await r.json()) as T
  } catch {
    throw new ErrorCarrega(camí)
  }
}

export const carregaIndex = () => json<EntradaIndex[]>('index.json')
export const carregaUnitat = (id: string) => json<Unitat>(`${id}.json`)

/** Un id de progrés és conegut si és d'una paraula (uNN-…) o d'una pàgina (pag-NN-…) d'una unitat de l'índex. */
export function idConegut(id: string, index: EntradaIndex[]): boolean {
  return index.some(
    (u) => id.startsWith(`${u.id}-`) || u.pagines.some((p) => id === p || id.startsWith(`${p}-`)),
  )
}
