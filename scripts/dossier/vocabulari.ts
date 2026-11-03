import type { Paraula } from '../../src/contingut/tipus'
import { senseComprovar, teComprovar } from '../../src/hebreu'

/** Etiquetes del TSV que marquen una paraula de funció (sense imatge). */
export const ETIQUETES_FUNCIO = [
  'pronom', 'particula', 'preposicio', 'interrogatiu', 'conjuncio',
  'pregunta', // «לְאָן?» (u05): paraula interrogativa etiquetada així
]

/** Separa «significat (translit)»: la transliteració és l'últim parèntesi (parèntesis imbricats inclosos). */
function separaTranslit(camp: string): { ca: string; translit: string } {
  const s = camp.trim()
  if (!s.endsWith(')')) return { ca: s, translit: '' }
  let fons = 0
  for (let i = s.length - 1; i >= 0; i--) {
    if (s[i] === ')') fons++
    else if (s[i] === '(') {
      fons--
      if (fons === 0) {
        const dins = s.slice(i + 1, -1)
        return { ca: s.slice(0, i).trim(), translit: dins.split(';')[0].trim() }
      }
    }
  }
  return { ca: s, translit: '' }
}

export function llegeixVocabulari(tsv: string, unitat: string): Paraula[] {
  const res: Paraula[] = []
  for (const linia of tsv.split(/\r?\n/)) {
    if (!linia.trim() || linia.startsWith('#')) continue
    const c = linia.split('\t')
    const perComprovar = teComprovar(linia)
    const [h, ...formes] = senseComprovar(c[0] ?? '').split(/ \/ |, /).map((x) => x.trim())
    const { ca, translit } = separaTranslit(senseComprovar(c[1] ?? ''))
    const etiquetes = (c[3] ?? '').split(/\s+/)
    const p: Paraula = {
      id: `${unitat}-${res.length}`, hebreu: h, translit, ca,
      pagina: (c[2] ?? '').trim(),
      funcio: etiquetes.some((e) => ETIQUETES_FUNCIO.includes(e)),
      extra: false, perComprovar,
    }
    if (formes.length) p.formes = formes
    res.push(p)
  }
  return res
}
