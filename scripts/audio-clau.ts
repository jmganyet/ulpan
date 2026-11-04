import { createHash } from 'node:crypto'

export type Velocitat = 'normal' | 'lent'

/** Nom de fitxer d'àudio: sha1 de `Carmit|<velocitat>|<text>` (amb `|<veu>` si no és la Carmit tal qual),
 * 12 hex + `.m4a`. Només per a scripts (node). */
export function clauAudio(text: string, velocitat: Velocitat, veu = 'carmit'): string {
  const sufix = veu === 'carmit' ? '' : `|${veu}`
  return createHash('sha1').update(`Carmit|${velocitat}|${text}${sufix}`).digest('hex').slice(0, 12) + '.m4a'
}
