// Àudio amb la veu Carmit (macOS `say`) → public/audio/<clau>.m4a
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { Hebreu, Linia, Paraula, Unitat } from '../src/contingut/tipus'
import { clauAudio, type Velocitat } from './audio-clau'

const exec = promisify(execFile)
const TAXA: Record<Velocitat, string> = { normal: '170', lent: '110' }
export const VELOCITATS: Velocitat[] = ['normal', 'lent']

export type Runner = (text: string, velocitat: Velocitat, desti: string) => Promise<void>

/** El text que es diu: `n` si n'hi ha, si no `u`. */
export const textAudible = (h: Hebreu): string => h.n ?? h.u

/** Paraules (hebreu amb vocals), línies i exemples de gramàtica; sense perComprovar, notes (R25) ni buits `____`. */
export function itemsAudibles(u: Unitat): { text: string; desti: Paraula | Linia }[] {
  const out: { text: string; desti: Paraula | Linia }[] = []
  for (const p of u.vocabulari) if (!p.perComprovar && p.hebreu) out.push({ text: p.hebreu, desti: p })
  const linies = [...u.textos.flatMap((t) => t.linies), ...u.gramatica.flatMap((g) => g.exemples)]
  for (const l of linies) {
    const text = textAudible(l.text)
    if (!l.perComprovar && !l.nota && text && !text.includes('____')) out.push({ text, desti: l })
  }
  return out
}

/** Runner real: `say -f` (text via fitxer, sense shell) a .aiff temporal i `afconvert` a AAC. */
export const runnerMac: Runner = async (text, velocitat, desti) => {
  const tmp = mkdtempSync(join(tmpdir(), 'ulpan-say-'))
  try {
    const txt = join(tmp, 't.txt'), aiff = join(tmp, 't.aiff')
    writeFileSync(txt, text, 'utf8')
    await exec('say', ['-v', 'Carmit', '-r', TAXA[velocitat], '-f', txt, '-o', aiff])
    await exec('afconvert', ['-f', 'm4af', '-d', 'aac', aiff, desti])
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/** El runner escriu a `<fitxer>.part`; només es reanomena al nom final si acaba bé.
 * Genera els fitxers que falten (concurrència limitada). Textos repetits es generen un sol cop. */
export async function generaAudio(
  items: { text: string }[], dir: string, runner: Runner = runnerMac, concurrencia = 4,
): Promise<{ generats: number; existents: number }> {
  mkdirSync(dir, { recursive: true })
  const feines = new Map<string, { text: string; vel: Velocitat }>()
  for (const { text } of items) for (const vel of VELOCITATS) feines.set(clauAudio(text, vel), { text, vel })
  const pendents: [string, { text: string; vel: Velocitat }][] = []
  let existents = 0
  for (const e of feines) (existsSync(join(dir, e[0])) ? existents++ : pendents.push(e))
  let i = 0
  let fallat = false
  const obrer = async () => {
    while (!fallat && i < pendents.length) {
      const [nom, { text, vel }] = pendents[i++]
      const final = join(dir, nom), part = final + '.part'
      try {
        await runner(text, vel, part)
        renameSync(part, final) // atòmic: mai un .m4a a mitges
      } catch (e) {
        fallat = true
        rmSync(part, { force: true })
        throw e
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrencia, pendents.length) }, obrer))
  return { generats: pendents.length, existents }
}

/** Còpia de la unitat amb `audio` als elements audibles que tenen tots dos fitxers. */
export function afegeixAudio(u: Unitat, existeix: (fitxer: string) => boolean): Unitat {
  const c: Unitat = structuredClone(u)
  for (const { text, desti } of itemsAudibles(c)) {
    const normal = clauAudio(text, 'normal'), lent = clauAudio(text, 'lent')
    if (existeix(normal) && existeix(lent)) desti.audio = { normal, lent }
  }
  return c
}
