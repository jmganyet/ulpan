import type { Exercici, Paraula, Unitat } from '../contingut/tipus'

export const par = (id: string, ca: string, o: Partial<Paraula> = {}): Paraula => ({
  id, hebreu: `ה${id}`, translit: id, ca, pagina: 'pag-01', funcio: false, extra: false, perComprovar: false,
  icona: 'house', audio: { normal: `${id}.m4a`, lent: `${id}-l.m4a` }, ...o,
})

export const forat = (id: string, o: Partial<Exercici> = {}): Exercici => ({
  id, origen: 'pag-08 ex. 1.3', extra: false, tipus: 'forat', frase: { u: 'אני ___ בבית' },
  opcions: ['גר', 'גרה', 'גרים'], correcta: 0, retro: 'Masculí singular.', ...o,
} as Exercici)

export function unitat(id: string, n: number, paraules: Paraula[], exercicis: Exercici[] = []): Unitat {
  return { id, num: n, titol: `Unitat ${n}`, color: '#3DB8A5', pagines: ['pag-01'], vocabulari: paraules, gramatica: [], textos: [], exercicis }
}

/** Unitat 1 amb 8 paraules (2 de funció, 1 per comprovar, 1 sense icona/àudio) i unitat 2 amb 4. */
export function dues(): Unitat[] {
  const u1 = unitat('u01', 1, [
    par('u01-0', 'casa'), par('u01-1', 'llibre'), par('u01-2', 'aigua'), par('u01-3', 'pa'),
    par('u01-4', 'amb', { funcio: true, icona: undefined }), par('u01-5', 'de', { funcio: true, icona: undefined }),
    par('u01-6', 'dubtosa', { perComprovar: true }), par('u01-7', 'sense', { icona: undefined, audio: undefined }),
  ], [forat('ex-1'), forat('ex-2')])
  const u2 = unitat('u02', 2, [par('u02-0', 'gos'), par('u02-1', 'gat'), par('u02-2', 'peix'), par('u02-3', 'ocell')])
  return [u1, u2]
}

/** rng determinista (LCG). */
export function llavor(s = 1): () => number {
  let x = s
  return () => { x = (x * 1664525 + 1013904223) % 4294967296; return x / 4294967296 }
}
