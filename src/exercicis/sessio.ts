import type { Exercici, Paraula, Unitat } from '../contingut/tipus'
import { pendents, type Progres } from '../progres/srs'

export type TipusParaula = 'paraula-nova' | 'tria-imatge' | 'imatge-paraula' | 'so-paraula' | 'traduccio'
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

/**
 * Distractors per a una paraula: mai la correcta, mai una paraula per comprovar;
 * de la mateixa unitat si n'hi ha prou i, si no, completats amb les d'altres unitats.
 * Una paraula de funció només en té d'altres de funció; `cal` filtra més (p. ex. que tinguin icona).
 */
export function opcionsDistractores(
  correcta: Paraula, totes: Paraula[], n = 3, rng: Rng = Math.random, cal: (p: Paraula) => boolean = () => true,
): Paraula[] {
  const valides = totes.filter((p) =>
    p.id !== correcta.id && !p.perComprovar && p.funcio === correcta.funcio && p.ca !== correcta.ca && cal(p))
  const mateixa = barreja(valides.filter((p) => unitatDe(p.id) === unitatDe(correcta.id)), rng)
  const altres = barreja(valides.filter((p) => unitatDe(p.id) !== unitatDe(correcta.id)), rng)
  return [...mateixa, ...altres].slice(0, n)
}

/** Tipus de pregunta possibles per a una paraula (R14: sense icona, mai d'imatge). */
export function tipusPossibles(p: Paraula, totes: Paraula[]): TipusParaula[] {
  const t: TipusParaula[] = []
  const prou = (cal: (x: Paraula) => boolean) => opcionsDistractores(p, totes, 3, () => 0, cal).length === 3
  if (teIcona(p) && prou(teIcona)) t.push('tria-imatge', 'imatge-paraula')
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
  const noves = u.vocabulari.filter((w) => !w.perComprovar && !Object.hasOwn(p.vist, w.id))
  const passos: Pas[] = []
  for (let i = 0; i < noves.length; i += TANDA) {
    const tanda = noves.slice(i, i + TANDA)
    passos.push(...tanda.map((w): Pas => ({ tipus: 'paraula-nova', ref: w.id })))
    passos.push(...barreja(tanda, rng).map((w) => pasParaula(w, totes, rng)))
  }
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

  const tocada = (u: Unitat) =>
    u.vocabulari.some((w) => Object.hasOwn(p.fitxes, w.id) || Object.hasOwn(p.vist, w.id))
  const noves = unitats.filter(tocada).flatMap((u) => u.vocabulari)
    .filter((w) => !w.perComprovar && !Object.hasOwn(p.vist, w.id) && !Object.hasOwn(p.fitxes, w.id))
    .slice(0, MAX_NOVES_REPAS)
  for (const w of noves) {
    if (passos.length + 2 > max) break
    passos.push({ tipus: 'paraula-nova', ref: w.id }, pasParaula(w, totes, rng))
  }
  return passos
}
