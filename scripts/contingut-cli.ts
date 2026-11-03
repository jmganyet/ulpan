// Genera public/contingut/*.json a partir del dossier i de contingut/*.yaml.
// Ús: npm run contingut  (DOSSIER = ruta del dossier; per defecte, la del vault)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { combina, type Curat, type UnitatBase } from './genera-contingut'
import { valida } from './valida'
import { llegeixPagina } from './dossier/pagina'
import { llegeixVocabulari } from './dossier/vocabulari'
import { DOSSIER } from './dossier/ruta'
import { afegeixAudio } from './genera-audio'

type Entrada = { num: number; titol: string; color: string; pagines: string; vocabulari: string }

/** «pag-02..pag-09» → ['pag-02', …, 'pag-09']; també accepta una llista. */
export function expandeix(p: string | string[]): string[] {
  if (Array.isArray(p)) return p
  const m = /^pag-(\d+)\.\.pag-(\d+)$/.exec(p)
  if (!m) return [p]
  const a = Number(m[1]), b = Number(m[2])
  return Array.from({ length: b - a + 1 }, (_, i) => `pag-${String(a + i).padStart(2, '0')}`)
}

const arrel = process.cwd()
const sortida = join(arrel, 'public/contingut')
const entrades = parse(readFileSync(join(arrel, 'contingut/unitats.yaml'), 'utf8')) as Entrada[]
const errors: Error[] = []
const resultats: { nom: string; json: string }[] = []
const index: unknown[] = []
const comptes = { unitats: 0, textos: 0, linies: 0, paraules: 0, liniesPerComprovar: 0, paraulesPerComprovar: 0 }

for (const e of entrades) {
  const id = `u${String(e.num).padStart(2, '0')}`
  const base: UnitatBase = { id, num: e.num, titol: e.titol, color: e.color, pagines: expandeix(e.pagines), vocabulari: e.vocabulari }
  const pagines = base.pagines.map((nom) => llegeixPagina(readFileSync(join(DOSSIER, `${nom}.md`), 'utf8'), nom))
  const vocab = llegeixVocabulari(readFileSync(join(DOSSIER, 'unitats', `${e.vocabulari}-vocabulari.tsv`), 'utf8'), e.vocabulari)
  const fitxer = join(arrel, 'contingut', `${id}.yaml`)
  const curat = ((existsSync(fitxer) ? parse(readFileSync(fitxer, 'utf8')) : null) ?? {}) as Curat
  const u = afegeixAudio(combina(base, pagines, vocab, curat), (f) => existsSync(join(arrel, 'public/audio', f)))
  errors.push(...valida(u, curat))
  resultats.push({ nom: `${id}.json`, json: JSON.stringify(u, null, 2) + '\n' })
  const linies = u.textos.flatMap((t) => t.linies)
  comptes.unitats++; comptes.textos += u.textos.length; comptes.linies += linies.length
  comptes.paraules += u.vocabulari.length
  comptes.liniesPerComprovar += linies.filter((l) => l.perComprovar).length
  comptes.paraulesPerComprovar += u.vocabulari.filter((p) => p.perComprovar).length
  index.push({ id, num: u.num, titol: u.titol, color: u.color, pagines: u.pagines,
    textos: u.textos.length, paraules: u.vocabulari.length, exercicis: u.exercicis.length })
}

if (errors.length) {
  console.error(`${errors.length} error(s) de validació:`)
  for (const err of errors) console.error(' - ' + err.message)
  process.exit(1)
}
mkdirSync(sortida, { recursive: true })
for (const r of resultats) writeFileSync(join(sortida, r.nom), r.json)
writeFileSync(join(sortida, 'index.json'), JSON.stringify(index, null, 2) + '\n')
console.log(`Contingut generat a public/contingut/: ${JSON.stringify(comptes)}`)
