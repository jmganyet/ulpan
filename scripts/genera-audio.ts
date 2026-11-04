// Àudio amb les veus hebrees de Microsoft (edge-tts; la Carmit de macOS queda de reserva) → public/audio/<clau>.m4a
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import type { Hebreu, Linia, Paraula, Unitat } from '../src/contingut/tipus'
import { textAudioParaula } from '../src/contingut/formes'
import { clauAudio, type Velocitat } from './audio-clau'
import { CARMIT, VEU_BASE, componentsVeu, veusDialeg, type Veu } from './veus'

const exec = promisify(execFile)
const TAXA: Record<Velocitat, string> = { normal: '170', lent: '110' }
// Només la velocitat normal: el «lent» el fa l'app en reproduir-lo (playbackRate), sense fitxer propi.
export const VELOCITATS: Velocitat[] = ['normal']

export type Runner = (text: string, velocitat: Velocitat, desti: string, veu?: Veu) => Promise<void>

/** El text que es diu: `n` si n'hi ha, si no `u`. */
export const textAudible = (h: Hebreu): string => h.n ?? h.u

export type ItemAudible = { text: string; veu?: Veu; desti: Paraula | Linia }

/** Paraules (hebreu amb vocals), línies i exemples de gramàtica; sense perComprovar, notes (R25) ni buits `____`.
 * Als diàlegs, cada personatge parla amb la seva veu. */
export function itemsAudibles(u: Unitat): ItemAudible[] {
  const out: ItemAudible[] = []
  // Una entrada amb diverses formes (הוּא / הִיא) les diu totes, com la targeta les mostra.
  for (const p of u.vocabulari) if (!p.perComprovar && p.hebreu) out.push({ text: textAudioParaula(p), veu: VEU_BASE, desti: p })
  const linies: { l: Linia; veu: Veu }[] = [
    ...u.textos.flatMap((t) => {
      const veus = veusDialeg(t)
      return t.linies.map((l) => ({ l, veu: (l.qui && veus.get(l.qui)) || VEU_BASE }))
    }),
    ...u.gramatica.flatMap((g) => g.exemples.map((l) => ({ l, veu: VEU_BASE }))),
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
    const txt = join(tmp, 't.txt'), aiff = join(tmp, 't.aiff')
    writeFileSync(txt, text, 'utf8')
    const ms = componentsVeu(veu)
    if (!ms) {
      await exec('say', ['-v', 'Carmit', '-r', TAXA[velocitat], '-f', txt, '-o', aiff])
    } else {
      // Veus de Microsoft (edge-tts): una per personatge, o tres barrejades per al cor (vegeu veus.ts).
      const mp3s: string[] = []
      for (const [k, v] of ms.entries()) {
        const mp3 = join(tmp, `v${k}.mp3`)
        await ambReintents(() => exec('edge-tts', ['--voice', v.nom, `--pitch=${v.to}`, `--rate=${TAXA_MS[velocitat]}`, '-f', txt, '--write-media', mp3]))
        mp3s.push(mp3)
      }
      const filtre = ms.length === 1 ? 'anull'
        : ms.map((v, k) => `[${k}:a]adelay=${v.retard}[a${k}]`).join(';') + ';' + ms.map((_, k) => `[a${k}]`).join('') + `amix=inputs=${ms.length}:normalize=0,volume=0.55`
      await exec('ffmpeg', ['-v', 'error', '-y', ...mp3s.flatMap((m) => ['-i', m]), '-filter_complex', filtre, '-ac', '1', aiff])
    }
    await exec('afconvert', ['-f', 'm4af', '-d', 'aac', aiff, desti])
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

const TAXA_MS: Record<Velocitat, string> = { normal: '+0%', lent: '-35%' }

/** El servei en línia de vegades falla d'un en un: es torna a provar abans de donar-ho per perdut. */
async function ambReintents<T>(f: () => Promise<T>, vegades = 4): Promise<T> {
  for (let i = 1; ; i++) {
    try { return await f() } catch (e) {
      if (i >= vegades) throw e
      await new Promise((r) => setTimeout(r, 1500 * i))
    }
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
    const normal = clauAudio(text, 'normal', veu)
    if (existeix(normal)) desti.audio = { normal, lent: normal }
  }
  return c
}
