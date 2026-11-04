import type { Paraula } from './tipus'

/** Totes les formes d'una entrada de vocabulari, en l'ordre del dossier (p. ex. הוּא / הִיא, תַּלְמִיד / תַּלְמִידָה). */
export function formesDe(p: Paraula): string[] {
  return [p.hebreu, ...(p.formes ?? [])]
}

/** L'entrada sencera tal com es mostra: les formes separades per « / », com la transliteració i el català. */
export function textParaula(p: Paraula): string {
  return formesDe(p).join(' / ')
}

/** El text que diu la veu: les formes separades per una coma, perquè faci una pausa entre l'una i l'altra. */
export function textAudioParaula(p: Paraula): string {
  return formesDe(p).join(', ')
}
