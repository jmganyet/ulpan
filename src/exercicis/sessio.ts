import { teClau } from '../teClau'
import type { Exercici, Paraula, Unitat } from '../contingut/tipus'
import { pendents, type Progres } from '../progres/srs'
import { textParaula } from '../contingut/formes'
import { treuVocals } from '../hebreu'

export type TipusParaula = 'paraula-nova' | 'tria-imatge' | 'imatge-paraula' | 'so-paraula' | 'traduccio'
export type TipusPregunta = Exclude<TipusParaula, 'paraula-nova'>
const PREGUNTES: string[] = ['tria-imatge', 'imatge-paraula', 'so-paraula', 'traduccio']
export const esPregunta = (t: string): t is TipusPregunta => PREGUNTES.includes(t)
export type Pas = { tipus: TipusParaula | Exercici['tipus']; ref: string }
export type Rng = () => number

const TANDA = 5
const PASSOS_PER_MINUT = 4
const MAX_NOVES_REPAS = 5

export function barreja<T>(xs: T[], rng: Rng = Math.random): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const unitatDe = (id: string) => id.split('-')[0]

export const teIcona = (p: Paraula) => !!p.icona && !p.funcio

const lletres = (p: Paraula) => treuVocals(textParaula(p))

/** Filtre de distractors per a les preguntes d'imatge: amb icona i no la mateixa que la correcta
 *  (les formes d'una entrada, תַּיָּר i תַּיֶּרֶת, comparteixen icona). */
export const ambIconaDistinta = (c: Paraula) => (p: Paraula) => teIcona(p) && p.icona !== c.icona

/**
 * Distractors per a una paraula: mai la correcta, mai una paraula per comprovar;
 * de la mateixa unitat si n'hi ha prou i, si no, completats amb les d'altres unitats.
 * Una paraula de funció només en té d'altres de funció; `cal` filtra més (p. ex. que tinguin icona).
 * Mai una paraula que sense vocals s'escrigui igual (עוֹשֶׂה / עוֹשָׂה, בְּ־ / בַּ־): no es podrien distingir.
 */
export function opcionsDistractores(
  correcta: Paraula, totes: Paraula[], n = 3, rng: Rng = Math.random, cal: (p: Paraula) => boolean = () => true,
): Paraula[] {
  const valides = totes.filter((p) =>
    p.id !== correcta.id && !p.perComprovar && p.funcio === correcta.funcio && p.ca !== correcta.ca &&
    lletres(p) !== lletres(correcta) && cal(p))
  const mateixa = barreja(valides.filter((p) => unitatDe(p.id) === unitatDe(correcta.id)), rng)
  const altres = barreja(valides.filter((p) => unitatDe(p.id) !== unitatDe(correcta.id)), rng)
  return [...mateixa, ...altres].slice(0, n)
}

/** Tipus de pregunta possibles per a una paraula (R14: sense icona, mai d'imatge). */
export function tipusPossibles(p: Paraula, totes: Paraula[]): TipusParaula[] {
  const t: TipusParaula[] = []
  const prou = (cal: (x: Paraula) => boolean) => opcionsDistractores(p, totes, 3, () => 0, cal).length === 3
  if (teIcona(p) && prou(ambIconaDistinta(p))) t.push('tria-imatge', 'imatge-paraula')
  if (p.audio && prou((x) => !!x.audio)) t.push('so-paraula')
  if (prou(() => true)) t.push('traduccio')
  return t
}

function pasParaula(p: Paraula, totes: Paraula[], rng: Rng): Pas {
  const t = tipusPossibles(p, totes)
  const tipus = t.length ? t[Math.floor(rng() * t.length)] : 'traduccio'
  return { tipus, ref: p.id }
}

const paraulesDe = (unitats: Unitat[]) => unitats.flatMap((u) => u.vocabulari)

export function exerciciValid(e: Exercici, comprovar: Set<string>): boolean {
  return !(e.linies ?? []).some((id) => comprovar.has(id))
}

const idsPerComprovar = (unitats: Unitat[]) =>
  new Set(unitats.flatMap((u) => [
    ...u.vocabulari.filter((p) => p.perComprovar).map((p) => p.id),
    ...u.textos.flatMap((t) => t.linies.filter((l) => l.perComprovar).map((l) => l.id)),
  ]))

/** Paraules no vistes en tandes de 5 (cada tanda amb una pregunta per paraula), i després els exercicis barrejats. */
export function sessioUnitat(u: Unitat, p: Progres, rng: Rng = Math.random): Pas[] {
  const totes = paraulesDe([u])
  const noves = u.vocabulari.filter((w) => !w.perComprovar && !teClau(p.vist, w.id))
  const passos: Pas[] = []
  for (let i = 0; i < noves.length; i += TANDA) {
    const tanda = noves.slice(i, i + TANDA)
    passos.push(...tanda.map((w): Pas => ({ tipus: 'paraula-nova', ref: w.id })))
    passos.push(...barreja(tanda, rng).map((w) => pasParaula(w, totes, rng)))
  }
  const sensePregunta = u.vocabulari.filter((w) => !w.perComprovar && teClau(p.vist, w.id) && !teClau(p.fitxes, w.id))
  passos.push(...barreja(sensePregunta, rng).map((w) => pasParaula(w, totes, rng)))
  const comprovar = idsPerComprovar([u])
  const ex = u.exercicis.filter((e) => exerciciValid(e, comprovar))
  passos.push(...barreja(ex, rng).map((e): Pas => ({ tipus: e.tipus, ref: e.id })))
  return passos
}

/** Repàs: primer els vençuts (el més antic primer), després paraules no vistes d'unitats ja tocades. */
export function sessioRepas(unitats: Unitat[], p: Progres, ara: number, minuts: number, rng: Rng = Math.random): Pas[] {
  const max = Math.max(1, Math.round(minuts * PASSOS_PER_MINUT))
  const totes = paraulesDe(unitats)
  const comprovar = idsPerComprovar(unitats)
  const paraules = new Map(totes.filter((w) => !w.perComprovar).map((w) => [w.id, w]))
  const exercicis = new Map(unitats.flatMap((u) => u.exercicis).filter((e) => exerciciValid(e, comprovar)).map((e) => [e.id, e]))

  const passos: Pas[] = []
  for (const id of pendents(p, ara)) {
    if (passos.length >= max) break
    const w = paraules.get(id)
    const e = exercicis.get(id)
    if (w) passos.push(pasParaula(w, totes, rng))
    else if (e) passos.push({ tipus: e.tipus, ref: e.id })
  }

  // Vistes però mai contestades: entren a l'SRS amb una pregunta (sense «paraula nova»).
  for (const w of totes) {
    if (passos.length >= max) break
    if (!w.perComprovar && teClau(p.vist, w.id) && !teClau(p.fitxes, w.id)) passos.push(pasParaula(w, totes, rng))
  }

  const tocada = (u: Unitat) =>
    u.vocabulari.some((w) => teClau(p.fitxes, w.id) || teClau(p.vist, w.id))
  // Unitats d'on treure paraules noves: les tocades, la de «darrera» i, si no n'hi ha cap, la u01.
  const pool = unitats.filter(tocada)
  const afegeix = (u?: Unitat) => { if (u && !pool.includes(u)) pool.push(u) }
  afegeix(unitats.find((u) => u.id === p.darrera?.unitat))
  if (pool.length === 0) afegeix(unitats.find((u) => u.id === 'u01') ?? unitats[0])
  const noves = unitats.filter((u) => pool.includes(u)).flatMap((u) => u.vocabulari)
    .filter((w) => !w.perComprovar && !teClau(p.vist, w.id) && !teClau(p.fitxes, w.id))
    .slice(0, MAX_NOVES_REPAS)
  for (const w of noves) {
    if (passos.length + 2 > max) break
    passos.push({ tipus: 'paraula-nova', ref: w.id }, pasParaula(w, totes, rng))
  }
  return passos
}
