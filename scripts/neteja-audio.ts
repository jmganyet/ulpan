// Esborra de public/audio els fitxers que cap JSON de contingut no referencia. Ús: tsx scripts/neteja-audio.ts
import { readdirSync, readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'

/** Fitxers d'àudio que no són a `referenciats`. Pura. */
export const sobrants = (fitxers: string[], referenciats: Set<string>): string[] =>
  fitxers.filter((f) => f.endsWith('.m4a') && !referenciats.has(f))

/** Tots els noms de fitxer d'àudio citats en un JSON (camps `normal` i `lent`). */
export function referencies(json: string): string[] {
  return [...json.matchAll(/"(?:normal|lent)":\s*"([^"]+\.m4a)"/g)].map((m) => m[1])
}

if (process.argv[1]?.endsWith('neteja-audio.ts')) {
  const dirC = join(process.cwd(), 'public/contingut')
  const dirA = join(process.cwd(), 'public/audio')
  const refs = new Set(readdirSync(dirC).filter((f) => f.endsWith('.json')).flatMap((f) => referencies(readFileSync(join(dirC, f), 'utf8'))))
  const tots = readdirSync(dirA)
  const fora = sobrants(tots, refs)
  fora.forEach((f) => unlinkSync(join(dirA, f)))
  console.log(`Àudio: ${tots.length} fitxers, ${fora.length} esborrats, ${tots.length - fora.length} queden`)
}
