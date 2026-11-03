import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Unitat } from '../src/contingut/tipus'
import { iguals } from '../src/hebreu'
import type { Curat } from './genera-contingut'

export type ContextValida = { icones: Set<string>; imatges: Set<string> }

/** Noms d'icona de Phosphor (duotone) llegits del paquet instal·lat. */
export function iconesPhosphor(): Set<string> {
  const css = readFileSync(join(process.cwd(), 'node_modules/@phosphor-icons/web/src/duotone/style.css'), 'utf8')
  return new Set([...css.matchAll(/\.ph-duotone\.ph-([a-z0-9-]+):before/g)].map((m) => m[1]))
}

export function imatgesPropies(): Set<string> {
  const d = join(process.cwd(), 'public/imatges')
  return new Set(existsSync(d) ? readdirSync(d) : [])
}

let ctxDefecte: ContextValida | undefined
const ctx = (): ContextValida => (ctxDefecte ??= { icones: iconesPhosphor(), imatges: imatgesPropies() })

export function valida(u: Unitat, curat: Curat, context: ContextValida = ctx()): Error[] {
  const err: string[] = []

  // Vocals: han de coincidir amb el text del dossier.
  for (const t of u.textos) {
    const nLinies = t.linies.length
    for (const [j, l] of t.linies.entries()) {
      if (l.text.n !== undefined && !iguals(l.text.n, l.text.u))
        err.push(`${t.pagina}, línia ${j + 1}: les vocals no coincideixen amb el dossier («${l.text.n}» / «${l.text.u}»)`)
    }
    const c = curat.textos?.[t.id] ?? (t.id.endsWith('-b0') ? curat.textos?.[t.pagina] : undefined)
    for (const camp of ['vocals', 'ca'] as const)
      for (const j of Object.keys(c?.[camp] ?? {}))
        if (!(Number(j) >= 0 && Number(j) < nLinies)) err.push(`${t.pagina}, línia ${Number(j) + 1}: ${camp} apunta a una línia que no existeix`)
  }
  for (const g of u.gramatica)
    for (const [i, e] of g.exemples.entries())
      if (e.text.n !== undefined && !iguals(e.text.n, e.text.u))
        err.push(`gramàtica ${g.id}, exemple ${i + 1}: les vocals no coincideixen`)

  // Exercicis: només material comprovat i existent.
  const material = new Map<string, boolean>() // id → perComprovar
  for (const t of u.textos) for (const l of t.linies) material.set(l.id, l.perComprovar)
  for (const g of u.gramatica) for (const e of g.exemples) material.set(e.id, e.perComprovar)
  for (const p of u.vocabulari) material.set(p.id, p.perComprovar)
  for (const e of u.exercicis) {
    for (const id of e.linies ?? []) {
      if (!material.has(id)) err.push(`exercici ${e.id}: cita «${id}», que no existeix`)
      else if (material.get(id)) err.push(`exercici ${e.id}: cita «${id}», que és per comprovar`)
    }
    if (e.tipus === 'forat' || e.tipus === 'conjugar' || e.tipus === 'comprensio') {
      if (!Number.isInteger(e.correcta) || e.correcta < 0 || e.correcta >= e.opcions.length)
        err.push(`exercici ${e.id}: correcta (${e.correcta}) fora de rang (${e.opcions.length} opcions)`)
    }
    if (e.tipus === 'construir' && e.ordre.some((i) => !Number.isInteger(i) || i < 0 || i >= e.fitxes.length))
      err.push(`exercici ${e.id}: ordre fora de rang`)
  }

  // Icones.
  const ids = new Set(u.vocabulari.map((p) => p.id))
  for (const [id, nom] of Object.entries(curat.icones ?? {})) {
    if (!ids.has(id)) err.push(`icona de «${id}»: la paraula no existeix`)
    if (nom.startsWith('propia:')) {
      if (!context.imatges.has(nom.slice(7))) err.push(`icona «${nom}» (${id}): no hi ha el fitxer a public/imatges/`)
    } else if (!context.icones.has(nom)) err.push(`icona «${nom}» (${id}): no és una icona de Phosphor`)
  }

  // Extres.
  for (const [i, p] of (curat.extres?.vocabulari ?? []).entries())
    if (p.extra !== true) err.push(`extres.vocabulari[${i}] («${p.hebreu}»): falta extra: true`)

  return err.map((m) => new Error(`${u.id}: ${m}`))
}
