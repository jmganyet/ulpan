import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { combina, type UnitatBase } from './genera-contingut'
import { llegeixPagina } from './dossier/pagina'
import { llegeixVocabulari } from './dossier/vocabulari'

const f = (n: string) => readFileSync(`${process.cwd()}/scripts/dossier/fixtures/${n}`, 'utf8')
const base: UnitatBase = { id: 'u05', num: 5, titol: 'Anar i venir', color: '#3DB8A5', pagines: ['pag-28'], vocabulari: 'u05' }
const p28 = llegeixPagina(f('pag-28.md'), 'pag-28')
const p8 = llegeixPagina(f('pag-08.md'), 'pag-08')
const vocab = llegeixVocabulari(f('u05-vocabulari.tsv'), 'u05')

describe('combina', () => {
  it('afegeix vocals extra a una línia', () => {
    const u = combina(base, [p28], vocab, { textos: { 'pag-28': { vocals: { 0: 'אֵיפֹה אַתָּה גָּר, רוֹבֶּרְטוֹ?' } } } })
    expect(u.textos[0].linies[0].text).toEqual({ u: 'איפה אתה גר, רוברטו?', n: 'אֵיפֹה אַתָּה גָּר, רוֹבֶּרְטוֹ?', extraVocals: true })
    expect(u.textos[0].linies[1].text).toEqual({ u: 'אני גר בקיבוץ דן בגליל.' })
  })
  it('ids, títol, tipus i personatges', () => {
    const u = combina(base, [p28], vocab, { textos: { 'pag-28-b0': { tipus: 'dialeg', personatges: ['A', 'B'], ca: { 1: 'Visc al quibuts Dan' } } } })
    const t = u.textos[0]
    expect(t.id).toBe('pag-28-b0')
    expect(t.pagina).toBe('pag-28')
    expect(t.tipus).toBe('dialeg')
    expect(t.titol).toMatchObject({ u: 'בָּאוּלְפָּן בְּקִיבּוּץ דָּן', ca: "A l'ulpan del quibuts Dan", perComprovar: true })
    expect(t.linies[3].id).toBe('pag-28-b0-l3')
    expect(t.linies.map((l) => l.qui).slice(0, 3)).toEqual(['A', 'B', 'A'])
    expect(t.linies[1].ca).toBe('Visc al quibuts Dan')
  })
  it('sense curat: tipus text, un Text per bloc, perComprovar propagat', () => {
    const u = combina({ ...base, pagines: ['pag-08'] }, [p8], [], {})
    expect(u.textos.map((t) => t.id)).toEqual(p8.blocs.map((_, k) => `pag-08-b${k}`))
    expect(u.textos[0].tipus).toBe('text')
    expect(u.textos[1].linies[7].perComprovar).toBe(true)
    expect(u.textos[1].linies[7].audio).toBeUndefined()
  })
  it('icones, extres i exercicis amb id', () => {
    const u = combina(base, [], vocab, {
      icones: { 'u05-0': 'house' },
      extres: { vocabulari: [{ id: 'u05-x0', hebreu: 'בַּיִת', translit: 'bayit', ca: 'casa', pagina: 'extra', funcio: false, extra: true, perComprovar: false }] },
      exercicis: [{ tipus: 'autocorreccio', origen: 'extra', extra: true, enunciat: { u: 'x' }, model: { u: 'y' } }],
    })
    expect(u.vocabulari[0].icona).toBe('house')
    expect(u.vocabulari.at(-1)?.extra).toBe(true)
    expect(u.exercicis[0].id).toBe('u05-ex-0')
  })
})
