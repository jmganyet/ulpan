import type { Linia, Text } from '../contingut/tipus'

export type Mode = { tipus: 'escoltar' } | { tipus: 'repetir' } | { tipus: 'personatge'; jo: number }
export type Pas = { linia: number; accio: 'sona' | 'silenci' }

/** Rètols dels dos personatges quan el text no en declara. */
export const PERSONATGES_PER_DEFECTE = ['Persona A', 'Persona B']

export const noms = (t: Text): string[] => (t.personatges?.length ? t.personatges : PERSONATGES_PER_DEFECTE)

/** Quin personatge (0 o 1, el primer és l'esquerra) diu la línia i; sense `qui`, s'alternen. */
export function quiDe(t: Text, i: number): number {
  const qui = t.linies[i]?.qui
  const pos = qui ? noms(t).indexOf(qui) : -1
  return pos >= 0 ? pos % 2 : i % 2
}

/** Una línia només és reproduïble si té àudio i no és «per comprovar». */
export const reproduible = (l: Linia): boolean => !!l.audio && !l.perComprovar

export function passos(t: Text, m: Mode): Pas[] {
  const r: Pas[] = []
  t.linies.forEach((l, linia) => {
    if (!reproduible(l)) return
    if (m.tipus === 'escoltar') r.push({ linia, accio: 'sona' })
    else if (m.tipus === 'repetir') r.push({ linia, accio: 'sona' }, { linia, accio: 'silenci' })
    else r.push({ linia, accio: quiDe(t, linia) === m.jo ? 'silenci' : 'sona' })
  })
  return r
}

/** Durada del silenci en ms, a partir de la durada de l'àudio en segons. */
export const silenci = (durada: number): number => (durada * 1.3 + 1) * 1000

export type Deps = {
  /** Reprodueix la línia i resol quan acaba (o s'atura). */
  toca: (l: Linia) => Promise<void>
  /** Durada de l'àudio de la línia, en segons. */
  durada: (l: Linia) => Promise<number>
  /** Espera ms (injectable perquè els tests no esperin de debò). */
  espera: (ms: number) => Promise<void>
  atura: () => void
}

let actiu: Reproductor | null = null

export class Reproductor {
  pos = 0
  sonant = false
  private fil = 0
  readonly passos: Pas[]

  constructor(readonly text: Text, mode: Mode, private deps: Deps, private alCanviar: () => void) {
    this.passos = passos(text, mode)
  }

  /** Línia en curs (−1 si no n'hi ha cap de reproduïble). */
  get linia(): number { return this.passos[this.pos]?.linia ?? -1 }

  async play(): Promise<void> {
    if (actiu && actiu !== this) actiu.stop()
    actiu = this
    const fil = ++this.fil
    this.sonant = true
    this.alCanviar()
    while (this.fil === fil && this.pos < this.passos.length) {
      const p = this.passos[this.pos]
      const l = this.text.linies[p.linia]
      try {
        if (p.accio === 'sona') await this.deps.toca(l)
        else await this.deps.espera(silenci(await this.deps.durada(l)))
      } catch { /* un fitxer que falla es salta */ }
      if (this.fil !== fil) return
      this.pos++
      this.alCanviar()
    }
    if (this.fil === fil) { this.sonant = false; this.pos = 0; this.alCanviar() }
  }

  pause(): void {
    this.fil++
    this.sonant = false
    this.deps.atura()
    this.alCanviar()
  }

  stop(): void { this.pause() }

  private salta(pos: number): void {
    const estava = this.sonant
    if (estava) this.pause()
    this.pos = pos
    this.alCanviar()
    if (estava) void this.play()
  }

  next(): void {
    const i = this.passos.findIndex((p) => p.linia > this.linia)
    if (i >= 0) this.salta(i)
  }

  prev(): void {
    const abans = this.passos.filter((p) => p.linia < this.linia).map((p) => p.linia)
    if (!abans.length) return this.salta(0)
    const l = Math.max(...abans)
    this.salta(this.passos.findIndex((p) => p.linia === l))
  }

  /** Toca una línia sola, sense continuar. */
  async playLinia(i: number): Promise<void> {
    const l = this.text.linies[i]
    if (!l || !reproduible(l)) return
    if (actiu && actiu !== this) actiu.stop()
    actiu = this
    this.pause()
    const pas = this.passos.findIndex((p) => p.linia === i)
    if (pas >= 0) this.pos = pas
    this.sonant = true
    this.alCanviar()
    const fil = ++this.fil
    try { await this.deps.toca(l) } catch { /* res */ }
    if (this.fil === fil) { this.sonant = false; this.alCanviar() }
  }
}
