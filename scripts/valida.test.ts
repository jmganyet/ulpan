import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { combina, type UnitatBase, type Curat } from './genera-contingut'
import { valida } from './valida'
import { llegeixPagina } from './dossier/pagina'
import { llegeixVocabulari } from './dossier/vocabulari'

const f = (n: string) => readFileSync(`${process.cwd()}/scripts/dossier/fixtures/${n}`, 'utf8')
const base: UnitatBase = { id: 'u05', num: 5, titol: 'Anar i venir', color: '#3DB8A5', pagines: ['pag-28', 'pag-08'], vocabulari: 'u05' }
const pagines = [llegeixPagina(f('pag-28.md'), 'pag-28'), llegeixPagina(f('pag-08.md'), 'pag-08')]
const vocab = llegeixVocabulari(f('u05-vocabulari.tsv'), 'u05')
const errors = (c: Curat) => valida(combina(base, pagines, vocab, c), c).map((e) => e.message)

describe('valida', () => {
  it('curat buit és vàlid', () => expect(errors({})).toEqual([]))
  it('vocals correctes: cap error', () => {
    expect(errors({ textos: { 'pag-28': { vocals: { 0: 'אֵיפֹה אַתָּה גָּר, רוֹבֶּרְטוֹ?' } } } })).toEqual([])
  })
  it('vocals que no coincideixen: pàgina i línia', () => {
    const e = errors({ textos: { 'pag-28': { vocals: { 0: 'אֵיפֹה אַתָּה גָּרָה' } } } })
    expect(e).toHaveLength(1)
    expect(e[0]).toContain('pag-28')
    expect(e[0]).toContain('línia 1')
  })
  it('exercici que cita una línia per comprovar', () => {
    const e = errors({ exercicis: [{ tipus: 'autocorreccio', origen: 'pag-08 ex. 1.8', extra: false, linies: ['pag-08-b1-l7'], enunciat: { u: 'x' }, model: { u: 'y' } }] })
    expect(e.some((m) => m.includes('per comprovar'))).toBe(true)
  })
  it('exercici que cita una paraula per comprovar o inexistent', () => {
    const pc = vocab.find((p) => p.perComprovar)
    const c: Curat = { exercicis: [{ tipus: 'autocorreccio', origen: 'extra', extra: true, linies: [pc?.id ?? 'u05-0', 'u05-999'], enunciat: { u: 'x' }, model: { u: 'y' } }] }
    const e = errors(c)
    if (pc) expect(e.some((m) => m.includes('per comprovar'))).toBe(true)
    expect(e.some((m) => m.includes('u05-999'))).toBe(true)
  })
  it('línia sense ⁇ citada: sense error', () => {
    expect(errors({ exercicis: [{ tipus: 'autocorreccio', origen: 'extra', extra: true, linies: ['pag-28-b0-l1'], enunciat: { u: 'x' }, model: { u: 'y' } }] })).toEqual([])
  })
  it('icona inexistent', () => {
    const e = errors({ icones: { 'u05-3': 'no-existeix' } })
    expect(e.some((m) => m.includes('no-existeix'))).toBe(true)
  })
  it('icona Phosphor vàlida, i propia que no hi és', () => {
    expect(errors({ icones: { 'u05-3': 'house' } })).toEqual([])
    expect(errors({ icones: { 'u05-3': 'propia:cap.svg' } }).length).toBe(1)
  })
  it('correcta fora de rang', () => {
    const e = errors({ exercicis: [{ tipus: 'forat', origen: 'extra', extra: true, frase: { u: 'x' }, opcions: ['a', 'b'], correcta: 2, retro: '' }] })
    expect(e.some((m) => m.includes('correcta'))).toBe(true)
  })
  it('extres sense extra: true', () => {
    const e = errors({ extres: { vocabulari: [{ id: 'u05-x0', hebreu: 'א', translit: 'a', ca: 'a', pagina: 'extra', funcio: false, extra: false, perComprovar: false }] } })
    expect(e.some((m) => m.includes('extra'))).toBe(true)
  })
})
