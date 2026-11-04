// Àudio amb la veu Carmit (macOS `say`) → public/audio/<clau>.m4a
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { Hebreu, Linia, Paraula, Unitat } from '../src/contingut/tipus'
import { textAudioParaula } from '../src/contingut/formes'
import { clauAudio, type Velocitat } from './audio-clau'
import { CARMIT, filtreVeu, veusDialeg, type Veu } from './veus'

const exec = promisify(execFile)
const TAXA: Record<Velocitat, string> = { normal: '170', lent: '110' }
export const VELOCITATS: Velocitat[] = ['normal', 'lent']

export type Runner = (text: string, velocitat: Velocitat, desti: string, veu?: Veu) => Promise<void>

/** El text que es diu: `n` si n'hi ha, si no `u`. */
export const textAudible = (h: Hebreu): string => h.n ?? h.u

export type ItemAudible = { text: string; veu?: Veu; desti: Paraula | Linia }

/** Paraules (hebreu amb vocals), línies i exemples de gramàtica; sense perComprovar, notes (R25) ni buits `____`.
 * Als diàlegs, cada personatge parla amb la seva veu. */
export function itemsAudibles(u: Unitat): ItemAudible[] {
  const out: ItemAudible[] = []
  // Una entrada amb diverses formes (הוּא / הִיא) les diu totes, com la targeta les mostra.
  for (const p of u.vocabulari) if (!p.perComprovar && p.hebreu) out.push({ text: textAudioParaula(p), desti: p })
  const linies: { l: Linia; veu: Veu }[] = [
    ...u.textos.flatMap((t) => {
      const veus = veusDialeg(t)
      return t.linies.map((l) => ({ l, veu: (l.qui && veus.get(l.qui)) || CARMIT }))
    }),
    ...u.gramatica.flatMap((g) => g.exemples.map((l) => ({ l, veu: CARMIT }))),
  ]
  for (const { l, veu } of linies) {
    const text = textAudible(l.text)
    if (!l.perComprovar && !l.nota && text && !text.includes('____')) out.push({ text, veu, desti: l })
  }
  return out
}

/** Runner real: `say -f` (text via fitxer, sense shell) a .aiff temporal i `afconvert` a AAC. */
export const runnerMac: Runner = async (text, velocitat, desti, veu = CARMIT) => {
  const tmp = mkdtempSync(join(tmpdir(), 'ulpan-say-'))
  try {
    const txt = join(tmp, 't.txt'), aiff = join(tmp, 't.aiff'), wav = join(tmp, 'v.wav')
    writeFileSync(txt, text, 'utf8')
    await exec('say', ['-v', 'Carmit', '-r', TAXA[velocitat], '-f', txt, '-o', aiff])
    // Les altres veus surten de la Carmit transformada amb ffmpeg (vegeu veus.ts).
    const filtre = filtreVeu(veu)
    if (filtre) await exec('ffmpeg', ['-v', 'error', '-y', '-i', aiff, '-filter_complex', filtre, '-ar', '22050', '-ac', '1', wav])
    await exec('afconvert', ['-f', 'm4af', '-d', 'aac', filtre ? wav : aiff, desti])
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

/** El runner escriu a `<fitxer>.part`; només es reanomena al nom final si acaba bé.
 * Genera els fitxers que falten (concurrència limitada). Textos repetits es generen un sol cop. */
export async function generaAudio(
  items: { text: string; veu?: Veu }[], dir: string, runner: Runner = runnerMac, concurrencia = 4,
): Promise<{ generats: number; existents: number }> {
  mkdirSync(dir, { recursive: true })
  type Feina = { text: string; vel: Velocitat; veu: Veu }
  const feines = new Map<string, Feina>()
  for (const { text, veu = CARMIT } of items) for (const vel of VELOCITATS) feines.set(clauAudio(text, vel, veu), { text, vel, veu })
  const pendents: [string, Feina][] = []
  let existents = 0
  for (const e of feines) (existsSync(join(dir, e[0])) ? existents++ : pendents.push(e))
  let i = 0
  let fallat = false
  const obrer = async () => {
    while (!fallat && i < pendents.length) {
      const [nom, { text, vel, veu }] = pendents[i++]
      const final = join(dir, nom), part = final + '.part'
      try {
        await runner(text, vel, part, veu)
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
  for (const { text, veu, desti } of itemsAudibles(c)) {
    const normal = clauAudio(text, 'normal', veu), lent = clauAudio(text, 'lent', veu)
    if (existeix(normal) && existeix(lent)) desti.audio = { normal, lent }
  }
  return c
}
