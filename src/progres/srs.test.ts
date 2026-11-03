import { describe, expect, it } from 'vitest'
import { pendents, respon, type Progres } from './srs'

const DIA = 86_400_000
const T = 1_000_000_000_000
const buit = (): Progres => ({ versio: 1, fitxes: {}, vist: {} })

describe('respon', () => {
  it('un encert des de buit: caixa 1, venc T + 1 dia', () => {
    const p = respon(buit(), 'a', true, T)
    expect(p.fitxes.a).toMatchObject({ caixa: 1, venc: T + DIA, encerts: 1, errors: 0 })
  })
  it('dos encerts més: caixa 3, venc + 4 dies; un error torna a caixa 1', () => {
    let p = respon(buit(), 'a', true, T)
    p = respon(p, 'a', true, T)
    p = respon(p, 'a', true, T)
    expect(p.fitxes.a).toMatchObject({ caixa: 3, venc: T + 4 * DIA, encerts: 3 })
    p = respon(p, 'a', false, T)
    expect(p.fitxes.a).toMatchObject({ caixa: 1, venc: T + DIA, errors: 1 })
  })
  it('la caixa màxima és 6', () => {
    let p = buit()
    for (let i = 0; i < 10; i++) p = respon(p, 'a', true, T)
    expect(p.fitxes.a).toMatchObject({ caixa: 6, venc: T + 32 * DIA })
  })
  it('no muta l\'entrada', () => {
    const p = buit()
    respon(p, 'a', true, T)
    expect(p).toEqual(buit())
  })
})

describe('respon amb id «constructor»', () => {
  it('el tracta com una fitxa nova', () => {
    const p = respon(buit(), 'constructor', true, T)
    expect(Object.hasOwn(p.fitxes, 'constructor')).toBe(true)
    expect(p.fitxes.constructor).toMatchObject({ caixa: 1, encerts: 1 })
  })
})

describe('pendents', () => {
  it('només les vençudes, primer les més antigues', () => {
    const p: Progres = {
      versio: 1,
      vist: {},
      fitxes: {
        b: { caixa: 1, venc: 50, encerts: 0, errors: 0 },
        a: { caixa: 1, venc: 10, encerts: 0, errors: 0 },
        c: { caixa: 1, venc: 200, encerts: 0, errors: 0 },
        d: { caixa: 1, venc: 100, encerts: 0, errors: 0 },
      },
    }
    expect(pendents(p, 100)).toEqual(['a', 'b', 'd'])
  })
})
