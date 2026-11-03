// Prova de cordura: llegeix el dossier real. Ús: npx tsx scripts/dossier/prova.ts
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { llegeixPagina } from './pagina'
import { llegeixVocabulari } from './vocabulari'

const DOSSIER = process.env.DOSSIER ??
  '/Users/josepm/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mouseion/Studia/grammateion/hebreu/curs-master/dossier'

// Les línies [il·lustració] amb ⁇ (pag-15) s'exclouen del recompte font.
// ⁇ fora de l'abast de les regles (fitxer -> nombre esperat de línies)
const FORA_D_ABAST: Record<string, number> = {
  'pag-01.md': 2, // taula de l'alfabet (7 columnes) + nota en prosa
  'pag-40.md': 1, // encapçalament sense callout al darrere
  'pag-28.md': 1, // encapçalament sense callout al darrere
  'pag-46.md': 1, // prosa
  'pag-52.md': 1, // prosa
}

let paraules = 0, perComprovarVocab = 0, liniesFont = 0, items = 0
const diferents: string[] = []

for (const f of readdirSync(join(DOSSIER, 'unitats')).filter((x) => /^u\d+-vocabulari\.tsv$/.test(x)).sort()) {
  const tsv = readFileSync(join(DOSSIER, 'unitats', f), 'utf8')
  const v = llegeixVocabulari(tsv, f.slice(0, 3))
  paraules += v.length
  const n = v.filter((p) => p.perComprovar).length
  perComprovarVocab += n
  const fonts = tsv.split('\n').filter((l) => !l.startsWith('#') && l.includes('⁇')).length
  liniesFont += fonts; items += n
  if (fonts !== n) diferents.push(`${f}: font ${fonts} / items ${n}`)
}

for (const f of readdirSync(DOSSIER).filter((x) => /^pag-\d+\.md$/.test(x)).sort()) {
  const md = readFileSync(join(DOSSIER, f), 'utf8')
  const p = llegeixPagina(md, f.replace('.md', ''))
  const llista = [...p.blocs.flatMap((b) => [...(b.titol ? [b.titol] : []), ...b.linies]), ...p.vocabulariMarge, ...p.notes]
  const n = llista.filter((i) => i.perComprovar).length
  // font: sense frontmatter ni blockquote de la nota de transcripció
  const l = md.split('\n')
  const fi = l[0] === '---' ? l.indexOf('---', 1) + 1 : 0
  const fonts = l.slice(fi).filter((x) => !x.startsWith('> Transcripció') && x.includes('⁇') && !x.startsWith('[il·lustració')).length
  liniesFont += fonts; items += n
  const fora = FORA_D_ABAST[f] ?? 0
  const foraSense = fora
  if (fonts - foraSense !== n) diferents.push(`${f}: font ${fonts} - fora ${foraSense} != items ${n}`)
}

console.log(`paraules: ${paraules}`)
console.log(`línies font amb ⁇: ${liniesFont}`)
console.log(`items per comprovar: ${items}`)
if (paraules !== 295) diferents.push(`paraules ${paraules} != 295`)
if (diferents.length) { console.log('DIFERENCIES:\n' + diferents.join('\n')); process.exit(1) }
console.log('OK: reconciliat')
