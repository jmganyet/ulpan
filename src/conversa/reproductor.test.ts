import { describe, it, expect } from 'vitest'
import { passos, quiDe, silenci, Reproductor, type Deps } from './reproductor'
import type { Linia, Text } from '../contingut/tipus'

const au = { normal: 'a.m4a', lent: 'b.m4a' }
const l = (i: number, extra: Partial<Linia> = {}): Linia => ({ id: `pag-28-b0-l${i}`, text: { u: 'x' }, perComprovar: false, audio: au, ...extra })
const text = (linies: Linia[], extra: Partial<Text> = {}): Text => ({
  id: 'pag-28-b0', pagina: 'pag-28', titol: { u: 't', ca: 't', perComprovar: false }, tipus: 'dialeg', linies, ...extra,
})

describe('passos', () => {
  const t = text([l(0), l(1), l(2), l(3)])
  it('escoltar: només sona', () => {
    expect(passos(t, { tipus: 'escoltar' })).toEqual([0, 1, 2, 3].map((linia) => ({ linia, accio: 'sona' })))
  })
  it('repetir: cada línia sona i després silenci', () => {
    expect(passos(text([l(0), l(1)]), { tipus: 'repetir' })).toEqual([
      { linia: 0, accio: 'sona' }, { linia: 0, accio: 'silenci' }, { linia: 1, accio: 'sona' }, { linia: 1, accio: 'silenci' },
    ])
  })
  it('personatge jo:1: sona l\'altre, les meves només silenci', () => {
    expect(passos(t, { tipus: 'personatge', jo: 1 })).toEqual([
      { linia: 0, accio: 'sona' }, { linia: 1, accio: 'silenci' }, { linia: 2, accio: 'sona' }, { linia: 3, accio: 'silenci' },
    ])
  })
  it('línies perComprovar o sense àudio no sonen ni tenen silenci', () => {
    const x = text([l(0, { perComprovar: true }), l(1, { audio: undefined }), l(2)])
    expect(passos(x, { tipus: 'repetir' })).toEqual([{ linia: 2, accio: 'sona' }, { linia: 2, accio: 'silenci' }])
    expect(passos(x, { tipus: 'personatge', jo: 0 })).toEqual([{ linia: 2, accio: 'silenci' }])
  })
})

describe('quiDe', () => {
  it('alterna Persona A/B sense personatges; usa qui si hi és', () => {
    const t = text([l(0), l(1), l(2)])
    expect([0, 1, 2].map((i) => quiDe(t, i))).toEqual([0, 1, 0])
    const u = text([l(0, { qui: 'Dana' }), l(1, { qui: 'Roberto' })], { personatges: ['Roberto', 'Dana'] })
    expect([quiDe(u, 0), quiDe(u, 1)]).toEqual([1, 0])
  })
})

it('silenci = durada × 1,3 + 1 s', () => { expect(silenci(2)).toBeCloseTo(3600) })

describe('Reproductor', () => {
  const crea = () => {
    const reg: string[] = []
    const deps: Deps = {
      toca: async (x) => { reg.push('toca ' + x.id) },
      durada: async () => 2,
      espera: async (ms) => { reg.push('espera ' + Math.round(ms)) },
      atura: () => { reg.push('atura') },
    }
    return { reg, deps }
  }
  it('recorre els passos i el silenci surt de la durada', async () => {
    const { reg, deps } = crea()
    const r = new Reproductor(text([l(0), l(1)]), { tipus: 'repetir' }, deps, () => {})
    await r.play()
    expect(reg).toEqual(['toca pag-28-b0-l0', 'espera 3600', 'toca pag-28-b0-l1', 'espera 3600'])
    expect(r.sonant).toBe(false)
  })
  it('next/prev canvien de línia; stop atura', async () => {
    const { reg, deps } = crea()
    const r = new Reproductor(text([l(0), l(1), l(2)]), { tipus: 'escoltar' }, deps, () => {})
    r.next(); expect(r.linia).toBe(1)
    r.next(); expect(r.linia).toBe(2)
    r.prev(); expect(r.linia).toBe(1)
    r.stop(); expect(reg).toContain('atura')
  })
})
