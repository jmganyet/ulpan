import { createHash } from 'node:crypto'

export type Velocitat = 'normal' | 'lent'

/** Nom de fitxer d'àudio: sha1 de `Carmit|<velocitat>|<text>`, 12 hex + `.m4a`. Només per a scripts (node). */
export function clauAudio(text: string, velocitat: Velocitat): string {
  return createHash('sha1').update(`Carmit|${velocitat}|${text}`).digest('hex').slice(0, 12) + '.m4a'
}
