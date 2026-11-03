import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { llegeixPagina } from './pagina'
import { llegeixVocabulari } from './vocabulari'

const f = (n: string) => readFileSync(`${process.cwd()}/scripts/dossier/fixtures/${n}`, 'utf8')

describe('llegeixVocabulari', () => {
  const v = llegeixVocabulari(f('u05-vocabulari.tsv'), 'u05')
  it('primera entrada', () => {
    expect(v[0]).toMatchObject({ id: 'u05-0', hebreu: 'יֵשׁ', translit: 'yesh', ca: 'hi ha', pagina: 'pag-28', perComprovar: false, extra: false, funcio: false })
  })
  it('formes amb " / "', () => {
    const [p] = llegeixVocabulari('תַּלְמִיד / תַּלְמִידָה\talumne / alumna (talmid / talmida)\tpag-02\thebreu u01 nom', 'u01')
    expect(p).toMatchObject({ hebreu: 'תַּלְמִיד', formes: ['תַּלְמִידָה'], translit: 'talmid / talmida' })
  })
  it('funcio per etiqueta, translit amb ; i parèntesis imbricats, ⁇', () => {
    const t = 'אֲנִי\tjo (ani)\tp\thebreu pronom\nx\tmolt; així (a; b)\tp\tnom\nי\tanar (h (halakh))\tp\tverb\nz ⁇\tq (z)\tp\tnom'
    const r = llegeixVocabulari(t, 'u01')
    expect(r[0].funcio).toBe(true)
    expect(r[1]).toMatchObject({ ca: 'molt; així', translit: 'a' })
    expect(r[2].translit).toBe('h (halakh)')
    expect(r[3]).toMatchObject({ hebreu: 'z', perComprovar: true })
  })
})

describe('llegeixPagina', () => {
  const p8 = llegeixPagina(f('pag-08.md'), 'pag-08')
  const p28 = llegeixPagina(f('pag-28.md'), 'pag-28')
  it('capçalera', () => {
    expect(p8.paginaOriginal).toBe(16)
    expect(p28.titol).toEqual({ he: 'בָּאוּלְפָּן בְּקִיבּוּץ דָּן', ca: "A l'ulpan del quibuts Dan" })
  })
  it('⁇ només a la segona columna', () => {
    expect(p8.blocs[1].linies[7].perComprovar).toBe(true)
    expect(p8.blocs[1].linies[7].text).not.toContain('⁇')
    expect(p8.blocs[1].linies[0].perComprovar).toBe(false)
  })
  it('diàleg pag-28', () => {
    const b = p28.blocs[0]
    expect(b.titol?.perComprovar).toBe(true)
    expect(b.titol?.text).toBe('בָּאוּלְפָּן בְּקִיבּוּץ דָּן')
    expect(b.linies).toHaveLength(20)
    expect(b.linies[0].text).toBe('איפה אתה גר, רוברטו?')
    expect(b.linies[19].text).toBe('ככה-ככה.')
  })
  it('marge a part', () => {
    expect(p8.blocs).toHaveLength(2)
    expect(p8.vocabulariMarge[1].perComprovar).toBe(true)
  })
  it('pag-40: marge ### i nota al peu fora dels blocs', () => {
    const p = llegeixPagina(f('pag-40.md'), 'pag-40')
    expect(p.vocabulariMarge.length).toBeGreaterThan(2)
    expect(p.notes).toHaveLength(1)
    expect(p.notes[0].perComprovar).toBe(true)
    const tots = p.blocs.flatMap((b) => b.linies.map((l) => l.text))
    for (const m of [...p.vocabulariMarge, ...p.notes]) expect(tots).not.toContain(m.text)
    expect(p.blocs.map((b) => b.titol?.text)).not.toContain('Vocabulari (marge)')
  })
  it('fila d\'una columna, CRLF i [!hebreu]-', () => {
    const md = '---\r\ntitol: "א — b"\r\npagina-original: 3\r\n---\r\n## T\r\n\r\n> [!hebreu]-\r\n> | | |\r\n> |---|---|\r\n> | שלום |\r\n> | a | b ⁇ |\r\n'
    const p = llegeixPagina(md, 'x')
    expect(p.blocs[0].linies).toEqual([{ text: 'שלום', perComprovar: false }, { text: 'a', perComprovar: true }])
    expect(p.paginaOriginal).toBe(3)
  })
})
