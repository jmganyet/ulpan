export type Fitxa = { caixa: number; venc: number; encerts: number; errors: number }
export type Progres = {
  versio: 1
  fitxes: Record<string, Fitxa>
  vist: Record<string, number>
  darrera?: { unitat: string; pas: string }
}

const DIA = 86_400_000
/** Dies fins al proper repàs, indexats per caixa (0 = mai contestada). */
export const INTERVALS = [0, 1, 2, 4, 8, 16, 32]
const CAIXA_MAX = INTERVALS.length - 1

export const progresBuit = (): Progres => ({ versio: 1, fitxes: {}, vist: {} })

export function respon(p: Progres, id: string, encert: boolean, ara: number): Progres {
  const f = p.fitxes[id] ?? { caixa: 0, venc: ara, encerts: 0, errors: 0 }
  const caixa = encert ? Math.min(f.caixa + 1, CAIXA_MAX) : 1
  const nova: Fitxa = {
    caixa,
    venc: ara + INTERVALS[caixa] * DIA,
    encerts: f.encerts + (encert ? 1 : 0),
    errors: f.errors + (encert ? 0 : 1),
  }
  return { ...p, fitxes: { ...p.fitxes, [id]: nova } }
}

export function pendents(p: Progres, ara: number): string[] {
  return Object.entries(p.fitxes)
    .filter(([, f]) => f.venc <= ara)
    .sort((a, b) => a[1].venc - b[1].venc || a[0].localeCompare(b[0]))
    .map(([id]) => id)
}
