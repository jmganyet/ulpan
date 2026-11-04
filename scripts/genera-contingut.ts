import type { Exercici, Hebreu, Linia, Paraula, PuntGramatica, Text, Unitat } from '../src/contingut/tipus'
import { esNota, treuVocals } from '../src/hebreu'
import type { Pagina } from './dossier/pagina'
import { separaFormes } from './dossier/separa'

export type UnitatBase = { id: string; num: number; titol: string; color: string; pagines: string[]; vocabulari: string }

type SenseId<T> = T extends unknown ? Omit<T, 'id'> : never

export type CuratText = {
  tipus?: 'dialeg' | 'text'; personatges?: string[]; qui?: number[]
  vocals?: Record<string, string>; ca?: Record<string, string>
}
export type CuratExemple = { u?: string; n?: string; ca?: string; extra?: boolean }
export type CuratGramatica = { id: string; titol: string; explicacio: string; exemples: CuratExemple[]; extra?: boolean }
export type Curat = {
  icones?: Record<string, string>
  textos?: Record<string, CuratText>
  gramatica?: CuratGramatica[]
  exercicis?: SenseId<Exercici>[]
  extres?: { vocabulari?: (Partial<Paraula> & { hebreu: string })[] }
  /** Separació explícita d'una entrada del dossier en una paraula per forma (id de l'entrada → formes, en ordre).
   *  Mana sobre la separació automàtica; les lletres de cada forma han de ser les del dossier. */
  formes?: Record<string, CuratForma[]>
}
export type CuratForma = { hebreu: string; translit: string; ca: string }

const hebreu = (u: string, n: string | undefined): Hebreu =>
  n === undefined ? { u } : { u, n, extraVocals: true }

/** Combina el dossier (pàgines, vocabulari) amb la capa curada. Pura: sense IO. */
export function combina(base: UnitatBase, pagines: Pagina[], vocab: Paraula[], curat: Curat): Unitat {
  const icones = curat.icones ?? {}
  // Cada forma amb significat propi és una paraula a part (הוּא «ell», הִיא «ella»); la icona val per a totes.
  const separa = (p: Paraula): Paraula[] => {
    const f = curat.formes?.[p.id]
    if (!f) return separaFormes(p)
    // Cap forma inventada: les lletres de cada una han de ser les d'alguna forma del dossier.
    // (també els trossos d'una entrada de verb: «הוֹלֵךְ – לָלֶכֶת (הָלַךְ)» → הולך, ללכת, הלך)
    const deDossier = new Set([p.hebreu, ...(p.formes ?? [])]
      .flatMap((h) => [h, ...h.split(/\s*[–()]\s*/)])
      .map((h) => treuVocals(h).trim()).filter(Boolean))
    for (const x of f) {
      if (!deDossier.has(treuVocals(x.hebreu))) throw new Error(`formes.${p.id}: «${x.hebreu}» no és cap forma de l'entrada del dossier`)
    }
    return f.map((x, i) => {
      const { formes: _f, ...sense } = p
      return { ...sense, id: i === 0 ? p.id : `${p.id}-${i + 1}`, hebreu: x.hebreu, translit: x.translit, ca: x.ca }
    })
  }
  const vocabulari: Paraula[] = vocab.flatMap(separa).map((p) => {
    const icona = icones[p.id] ?? icones[p.id.replace(/-\d+$/, '')]
    return icona ? { ...p, icona } : { ...p }
  })
  ;(curat.extres?.vocabulari ?? []).forEach((e, i) => {
    vocabulari.push({
      id: `${base.id}-x${i}`, translit: '', ca: '', pagina: 'extra', funcio: false, perComprovar: false,
      ...e, extra: e.extra ?? false,
    } as Paraula)
  })

  const textos: Text[] = []
  for (const pag of pagines) {
    pag.blocs.forEach((bloc, k) => {
      const id = `${pag.nom}-b${k}`
      const c: CuratText = curat.textos?.[id] ?? (k === 0 ? curat.textos?.[pag.nom] : undefined) ?? {}
      const titol = bloc.titol && /[א-ת]/.test(bloc.titol.text)
        ? { u: bloc.titol.text, perComprovar: bloc.titol.perComprovar }
        : { u: pag.titol.he, perComprovar: false }
      const parlants = [...new Set(bloc.linies.map((l) => l.qui).filter((q): q is string => !!q))]
      const pers = c.personatges ?? (parlants.length ? parlants : undefined)
      const linies: Linia[] = bloc.linies.map((l, j) => {
        const linia: Linia = { id: `${id}-l${j}`, text: hebreu(l.text, c.vocals?.[j]), perComprovar: l.perComprovar }
        if (c.personatges?.length) linia.qui = pers![(c.qui ? c.qui[j] : undefined) ?? j % pers!.length]
        else if (pers?.length && l.qui) linia.qui = l.qui
        if (l.subratllat?.length) linia.subratllat = l.subratllat
        if (esNota(l.text)) linia.nota = true
        const ca = c.ca?.[j]
        if (ca !== undefined) linia.ca = ca
        return linia
      })
      textos.push({
        id, pagina: pag.nom, titol: { ...titol, ca: pag.titol.ca },
        tipus: c.tipus ?? (!c.personatges && parlants.length >= 2 ? 'dialeg' : 'text'), ...(pers ? { personatges: pers } : {}), linies,
      })
    })
  }

  const gramatica: PuntGramatica[] = (curat.gramatica ?? []).map((g) => ({
    id: g.id, titol: g.titol, explicacio: g.explicacio, extra: g.extra ?? false,
    exemples: g.exemples.map((e, i): Linia => ({
      id: `${base.id}-g-${g.id}-${i}`,
      text: hebreu(e.u ?? treuVocals(e.n ?? ''), e.n),
      ...(e.ca !== undefined ? { ca: e.ca } : {}), perComprovar: false,
      ...(e.extra ? { extra: true } : {}),
    })),
  }))

  const exercicis = (curat.exercicis ?? []).map((e, i) => ({ ...e, id: `${base.id}-ex-${i}` })) as Exercici[]

  return {
    id: base.id, num: base.num, titol: base.titol, color: base.color, pagines: base.pagines,
    vocabulari, gramatica, textos, exercicis,
  }
}
