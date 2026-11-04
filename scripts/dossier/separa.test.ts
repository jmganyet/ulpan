import { describe, expect, it } from 'vitest'
import type { Paraula } from '../../src/contingut/tipus'
import { separaFormes } from './separa'

const p = (o: Partial<Paraula>): Paraula => ({
  id: 'u01-11', hebreu: 'הוּא', formes: ['הִיא'], translit: 'hu / hi', ca: 'ell / ella', pagina: 'pag-04',
  funcio: true, extra: false, perComprovar: false, ...o,
})

describe('separaFormes', () => {
  it('una paraula per forma, amb la seva transliteració i el seu significat', () => {
    const [a, b] = separaFormes(p({}))
    expect(a).toMatchObject({ id: 'u01-11', hebreu: 'הוּא', translit: 'hu', ca: 'ell' })
    expect(b).toMatchObject({ id: 'u01-11-2', hebreu: 'הִיא', translit: 'hi', ca: 'ella' })
    expect(a.formes).toBeUndefined()
  })
  it('completa les etiquetes soles amb el mot de la primera part', () => {
    const r = separaFormes(p({ hebreu: 'אַתֶּם', formes: ['אַתֶּן'], translit: 'atem / aten', ca: 'vosaltres masc. / fem.' }))
    expect(r.map((x) => x.ca)).toEqual(['vosaltres (masc.)', 'vosaltres (fem.)'])
    const g = separaFormes(p({ hebreu: 'גָּדוֹל', formes: ['גְּדוֹלָה'], translit: 'gadol / gdola', ca: 'gran, masc. / fem.' }))
    expect(g.map((x) => x.ca)).toEqual(['gran (masc.)', 'gran (fem.)'])
  })
  it('el que va darrere el «;» és del lema; una etiqueta només al final és el gènere del lema', () => {
    const a = separaFormes(p({ hebreu: 'חָבֵר', formes: ['חֲבֵרָה'], translit: 'ḥaver / ḥavera', ca: 'amic / amiga; company' }))
    expect(a.map((x) => x.ca)).toEqual(['amic; company', 'amiga'])
    const s = separaFormes(p({ hebreu: 'שֵׁם', formes: ['שֵׁמוֹת'], translit: 'shem / shemot', ca: 'nom / noms, masc.' }))
    expect(s.map((x) => x.ca)).toEqual(['nom (masc.)', 'noms'])
    const d = separaFormes(p({ hebreu: 'שְׁמוֹ', formes: ['שְׁמָהּ'], translit: 'shmo / shma', ca: "el seu nom, d'ell / d'ella" }))
    expect(d.map((x) => x.ca)).toEqual(["el seu nom, d'ell", "el seu nom, d'ella"])
  })
  it('un lema amb el plural i un sol significat queda sencer', () => {
    const q = p({ hebreu: 'שׁוּלְחָן', formes: ['שׁוּלְחָנוֹת'], translit: 'shulḥan / shulḥanot', ca: 'taula' })
    expect(separaFormes(q)).toEqual([q])
  })
  it('tres formes', () => {
    const r = separaFormes(p({ hebreu: 'שְׁלוֹמִי', formes: ['שְׁלוֹמוֹ', 'שְׁלוֹמָהּ'], translit: 'shlomi / shlomo / shloma', ca: 'estic / està ell / està ella' }))
    expect(r.map((x) => [x.id, x.ca])).toEqual([['u01-11', 'estic'], ['u01-11-2', 'està ell'], ['u01-11-3', 'està ella']])
  })
})
