import { senseComprovar, teComprovar } from '../../src/hebreu'

export type Item = { text: string; perComprovar: boolean; qui?: string; subratllat?: string[] }
export type Bloc = { titol?: Item; linies: Item[] }
export type Pagina = {
  nom: string; paginaOriginal: number; titol: { he: string; ca: string }
  blocs: Bloc[]; vocabulariMarge: Item[]; notes: Item[]
}

const item = (s: string): Item => ({ text: senseComprovar(s), perComprovar: teComprovar(s) })

/** Treu del text d'una cel·la el parlant inicial («**X:**»), les anotacions «*(…)*» i el marcatge;
 *  els mots dins de `<u>…</u>` (el mot que s'ha de substituir, pag-09) queden a `subratllat`. */
export function netejaCella(s: string): { text: string; qui?: string; subratllat?: string[] } {
  let t = s
  let qui: string | undefined
  const m = /^\s*\*\*([^*]+?):\*\*\s*/.exec(t)
  if (m) { qui = m[1].trim(); t = t.slice(m[0].length) }
  const subratllat: string[] = []
  t = t.replace(/<u>(.*?)<\/u>/g, (_, w: string) => { subratllat.push(w.trim()); return w })
  t = t.replace(/\*\([^)]*\)\*/g, '').replace(/\*+/g, '').replace(/\s{2,}/g, ' ').trim()
  return { text: t, ...(qui ? { qui } : {}), ...(subratllat.length ? { subratllat } : {}) }
}

function frontmatter(md: string): { fm: Record<string, string>; cos: string[] } {
  const l = md.split(/\r?\n/)
  const fm: Record<string, string> = {}
  let i = 0
  if (l[0] === '---') {
    for (i = 1; i < l.length && l[i] !== '---'; i++) {
      const m = /^([\w-]+):\s*(.*)$/.exec(l[i])
      if (m) fm[m[1]] = m[2].trim().replace(/^"(.*)"$/, '$1')
    }
    i++
  }
  return { fm, cos: l.slice(i) }
}

export function llegeixPagina(md: string, nom: string): Pagina {
  const { fm, cos } = frontmatter(md)
  const [he, ...resta] = (fm['titol'] ?? '').split(' — ')
  const blocs: Bloc[] = []
  const vocabulariMarge: Item[] = []
  const notes: Item[] = []
  let titolActual: string | undefined
  for (let i = 0; i < cos.length; i++) {
    const l = cos[i]
    const h = /^(#{2,3}) (.*)$/.exec(l)
    if (h) { titolActual = h[2].trim(); if (h[1] === '###' && !/^Vocabulari \(marge\)/.test(titolActual)) titolActual = undefined; continue }
    if (!/^> \[!hebreu\]/.test(l)) continue
    const linies: Item[] = []
    for (i++; i < cos.length && cos[i].startsWith('>'); i++) {
      const f = cos[i].replace(/^>\s?/, '')
      if (!f.startsWith('|') || /^\|[\s|]*$/.test(f) || /^\|[\s:|-]*$/.test(f)) continue
      const cel = f.replace(/^\|\s?/, '').replace(/\s?\|\s*$/, '').split(' | ')
      const perComprovar = cel.some(teComprovar)
      const n = netejaCella(senseComprovar(cel[0]))
      linies.push({ text: n.text, perComprovar, ...(n.qui ? { qui: n.qui } : {}), ...(n.subratllat ? { subratllat: n.subratllat } : {}) })
    }
    i--
    if (titolActual !== undefined && /^Vocabulari \(marge\)/.test(titolActual)) {
      vocabulariMarge.push(...linies)
    } else if (titolActual !== undefined && /^Nota al peu/.test(titolActual)) {
      notes.push(...linies)
    } else {
      blocs.push({ ...(titolActual !== undefined ? { titol: item(titolActual) } : {}), linies })
    }
  }
  return {
    nom, paginaOriginal: Number(fm['pagina-original']),
    titol: { he: he ?? '', ca: resta.join(' — ') }, blocs, vocabulariMarge, notes,
  }
}
