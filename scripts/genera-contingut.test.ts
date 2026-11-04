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
  it('formes: la separació explícita mana i no deixa inventar formes', () => {
    const u = combina(base, [p28], vocab, { formes: { 'u05-3': [
      { hebreu: 'כִּיתָּה', translit: 'kita', ca: 'classe' }, { hebreu: 'כִּיתּוֹת', translit: 'kitot', ca: 'classes' }] } })
    expect(u.vocabulari.filter((p) => p.id.startsWith('u05-3')).map((p) => [p.id, p.ca])).toEqual([['u05-3', 'classe'], ['u05-3-2', 'classes']])
    expect(() => combina(base, [p28], vocab, { formes: { 'u05-3': [{ hebreu: 'סֵפֶר', translit: 'sefer', ca: 'llibre' }] } })).toThrow(/u05-3/)
  })
  it('un encapçalament de bloc sense hebreu no és títol: es fa servir el de la pàgina', () => {
    const pag = { ...p28, blocs: [{ titol: { text: 'Continuació del diàleg', perComprovar: false }, linies: p28.blocs[0].linies }] }
    const u = combina(base, [pag], vocab, {})
    expect(u.textos[0].titol).toMatchObject({ u: p28.titol.he, perComprovar: false })
  })
  it('un encapçalament de bloc amb hebreu es manté', () => {
    const pag = { ...p28, blocs: [{ titol: { text: 'תרגיל 16', perComprovar: false }, linies: p28.blocs[0].linies }] }
    expect(combina(base, [pag], vocab, {}).textos[0].titol.u).toBe('תרגיל 16')
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

describe('combina: gramàtica', () => {
  it('porta extra de l\'exemple a la Linia', () => {
    const u = combina(base, [], [], { gramatica: [{ id: 'g1', titol: 't', explicacio: 'e', exemples: [{ n: 'אֲנִי', ca: 'jo', extra: true }, { n: 'אַתָּה' }] }] })
    const [a, b] = u.gramatica[0].exemples
    expect(a.extra).toBe(true)
    expect(b.extra).toBeUndefined()
  })
})

describe('combina: parlants del dossier', () => {
  const p2 = llegeixPagina(f('pag-02.md'), 'pag-02')
  const b2: UnitatBase = { ...base, id: 'u01', pagines: ['pag-02'] }
  it('deriva personatges, qui i tipus diàleg', () => {
    const t = combina(b2, [p2], [], {}).textos[0]
    expect(t.tipus).toBe('dialeg')
    expect(t.personatges).toEqual(['רוברטו', 'דוריס'])
    expect(t.linies[0]).toMatchObject({ qui: 'רוברטו' })
    expect(t.linies[0].text.u).toBe('שלום, אני רוברטו.')
  })
  it('el YAML mana sobre els parlants del dossier', () => {
    const t = combina(b2, [p2], [], { textos: { 'pag-02': { tipus: 'text' } } } as never).textos[0]
    expect(t.tipus).toBe('text')
    const u = combina(b2, [p2], [], { textos: { 'pag-02': { personatges: ['A', 'B'] } } } as never).textos[0]
    expect(u.personatges).toEqual(['A', 'B'])
    expect(u.linies[0].qui).toBe('A')
  })
})

describe('combina: subratllat', () => {
  it('passa els mots subratllats a la Linia i les vocals es comparen sense etiquetes', () => {
    const md = '---\ntitol: "תרגיל 2 — Exercici"\n---\n> [!hebreu]\n> | | |\n> |---|---|\n> | 4. <u>אתה</u> לא תייר. | 4. <u>אתה</u> לא תייר. |\n'
    const p9 = llegeixPagina(md, 'pag-09')
    const u = combina({ ...base, id: 'u01', pagines: ['pag-09'] }, [p9], [], { textos: { 'pag-09': { vocals: { 0: '4. אַתָּה לֹא תַּייָּר.' } } } })
    const l = u.textos[0].linies[0]
    expect(l.subratllat).toEqual(['אתה'])
    expect(l.text).toEqual({ u: '4. אתה לא תייר.', n: '4. אַתָּה לֹא תַּייָּר.', extraVocals: true })
    expect(u.textos[0].linies.every((x) => !x.text.u.includes('<'))).toBe(true)
  })
})

describe('combina: notes del transcriptor (R25)', () => {
  it('marca nota les línies que comencen en català, encara que citin hebreu', () => {
    const md = '---\ntitol: "שֶׁל מִי — De qui"\n---\n> [!hebreu]\n> | | |\n> |---|---|\n> | Esquema: של מי ← הַ ← [nom] | Esquema: של מי ← הַ ← [nom] |\n> | של מי הכסף? | של מי הכסף? |\n'
    const p20 = llegeixPagina(md, 'pag-20')
    const [nota, linia] = combina({ ...base, id: 'u04', pagines: ['pag-20'] }, [p20], [], {}).textos[0].linies
    expect(nota.nota).toBe(true)
    expect(linia.nota).toBeUndefined()
  })
})
