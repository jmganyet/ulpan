import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { Unitat } from '../src/contingut/tipus'
import { iguals, normalitza } from '../src/hebreu'
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

  // Claus de curat.textos: han de ser un id de Text o l'àlies «pag-NN» del bloc 0.
  const idsText = new Set(u.textos.map((t) => t.id))
  const alies = new Set(u.textos.filter((t) => t.id.endsWith('-b0')).map((t) => t.pagina))
  for (const clau of Object.keys(curat.textos ?? {})) {
    if (!idsText.has(clau) && !alies.has(clau)) err.push(`textos: la clau «${clau}» no correspon a cap text`)
    if (alies.has(clau) && idsText.has(`${clau}-b0`) && curat.textos?.[`${clau}-b0`])
      err.push(`textos: «${clau}» i «${clau}-b0» són el mateix text`)
  }

  const index = (j: string, n: number) => /^\d+$/.test(j) && Number(j) < n

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
        if (!index(j, nLinies)) err.push(`${t.pagina}, ${camp}: la clau «${j}» no és una línia vàlida (0-${nLinies - 1})`)
    if (c?.qui) {
      const np = c.personatges?.length ?? 0
      if (!np) err.push(`${t.id}: qui sense personatges`)
      if (c.qui.length !== nLinies) err.push(`${t.id}: qui té ${c.qui.length} entrades i el text ${nLinies} línies`)
      for (const [j, q] of c.qui.entries())
        if (!Number.isInteger(q) || q < 0 || q >= np) err.push(`${t.pagina}, línia ${j + 1}: qui (${q}) fora dels personatges`)
    }
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
      // R23: sense vocals (com es veuen per defecte) les opcions han de ser distintes.
      const vistes = new Map<string, string>()
      for (const o of e.opcions) {
        const k = normalitza(o)
        const abans = vistes.get(k)
        if (abans !== undefined) err.push(`exercici ${e.id}: les opcions «${abans}» i «${o}» són iguals sense vocals`)
        else vistes.set(k, o)
      }
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
