import type { Paraula } from '../../src/contingut/tipus'

// Una part del català que només és una etiqueta gramatical («fem.», «masc.») no té significat propi:
// es completa amb el mot de la primera part (vosaltres masc. / fem. → vosaltres (masc.) · vosaltres (fem.)).
const ETIQUETA = /^(masc|fem|m|f|sing|pl)\.?$/i
const ETIQUETA_FINAL = /[,\s]+(masc|fem|m|f|sing|pl)\.?$/i

/**
 * Separa una entrada del dossier amb diverses formes (הוּא / הִיא — hu / hi — ell / ella) en una paraula per
 * forma, quan la transliteració i el català tenen tantes parts com formes. Si no (שׁוּלְחָן / שׁוּלְחָנוֹת — taula),
 * l'entrada queda sencera: és un lema amb el plural o la concordança, amb un sol significat.
 * La primera forma conserva l'id (icones, exercicis i progrés hi apunten); les altres en prenen un de derivat.
 */
export function separaFormes(p: Paraula): Paraula[] {
  const formes = [p.hebreu, ...(p.formes ?? [])]
  if (formes.length < 2) return [p]
  const translit = p.translit.split(' / ')
  const ca = p.ca.split(' / ')
  if (translit.length !== formes.length || ca.length !== formes.length) return [p]

  const parts = ca.map((c) => c.trim())
  const n = parts.length
  // «amic / amiga; company», «dona / dones; esposa»: el que va darrere el «;» de la darrera part és del lema.
  const pc = parts[n - 1].indexOf(';')
  if (pc > 0) {
    parts[0] = `${parts[0]}${parts[n - 1].slice(pc)}`
    parts[n - 1] = parts[n - 1].slice(0, pc).trim()
  }
  // «nom / noms, masc.»: una etiqueta només a la darrera part és el gènere del lema.
  const etiquetaDe = (s: string) => s.match(ETIQUETA)?.[1] ?? s.match(ETIQUETA_FINAL)?.[1]
  if (!etiquetaDe(parts[0]) && n === 2 && ETIQUETA_FINAL.test(parts[1])) {
    const e = etiquetaDe(parts[1])!
    parts[1] = parts[1].replace(ETIQUETA_FINAL, '').trim()
    parts[0] = `${parts[0]} (${e.toLowerCase()}.)`
  }
  // «el seu nom, d'ell / d'ella»: la segona part només duu el complement.
  const cap = parts[0].replace(ETIQUETA_FINAL, '').trim()
  const capDe = cap.includes(", d'") ? cap.slice(0, cap.indexOf(", d'")) : null
  const significat = parts.map((c, i) => {
    if (i > 0 && capDe && c.startsWith("d'")) return `${capDe}, ${c}`
    const e = etiquetaDe(c)
    if (!e || c.endsWith(`(${e.toLowerCase()}.)`)) return c
    const resta = c.replace(ETIQUETA, '').replace(ETIQUETA_FINAL, '').trim()
    return `${resta || cap} (${e.toLowerCase()}.)`
  })

  return formes.map((h, i) => {
    const { formes: _f, ...sense } = p
    return { ...sense, id: i === 0 ? p.id : `${p.id}-${i + 1}`, hebreu: h, translit: translit[i].trim(), ca: significat[i] }
  })
}
