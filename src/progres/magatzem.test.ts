import { afterEach, describe, expect, it, vi } from 'vitest'
import { ErrorImportacio, exporta, importa, magatzemLocal, marcaVist } from './magatzem'
import type { Progres } from './srs'

const exemple: Progres = {
  versio: 1,
  fitxes: { a: { caixa: 2, venc: 5, encerts: 3, errors: 1 } },
  vist: { a: 7 },
  darrera: { unitat: 'u1', pas: 'p2' },
}

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('magatzemLocal', () => {
  it('desa i llegeix', () => {
    const m = magatzemLocal()
    expect(m.disponible).toBe(true)
    m.desa(exemple)
    expect(magatzemLocal().llegeix()).toEqual(exemple)
  })
  it('amb localStorage que llança: no disponible, buit, desa no llança', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('x') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('x') })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('x') })
    const m = magatzemLocal()
    expect(m.disponible).toBe(false)
    expect(m.llegeix()).toEqual({ versio: 1, fitxes: {}, vist: {} })
    expect(() => m.desa(exemple)).not.toThrow()
  })
  it('JSON corrupte: buit i còpia a :corrupte', () => {
    localStorage.setItem('ulpan:progres', '{no json')
    const m = magatzemLocal()
    expect(m.llegeix()).toEqual({ versio: 1, fitxes: {}, vist: {} })
    expect(localStorage.getItem('ulpan:progres:corrupte')).toBe('{no json')
  })
})

describe('importa / exporta', () => {
  it('ronda completa', () => {
    expect(importa(exporta(exemple))).toEqual(exemple)
  })
  it('rebutja versió o text invàlids', () => {
    expect(() => importa('{"versio":2}')).toThrow(ErrorImportacio)
    expect(() => importa('no és json')).toThrow(ErrorImportacio)
    expect(() => importa('{"versio":1,"fitxes":{"a":{"caixa":"x"}},"vist":{}}')).toThrow(ErrorImportacio)
    expect(() => importa('{"versio":1,"fitxes":{},"vist":{"a":"x"}}')).toThrow(ErrorImportacio)
  })
})

describe('marcaVist', () => {
  it('registra el primer cop i no el sobreescriu', () => {
    const p = marcaVist({ versio: 1, fitxes: {}, vist: {} }, 'a', 10)
    expect(p.vist.a).toBe(10)
    expect(marcaVist(p, 'a', 99).vist.a).toBe(10)
  })
})
