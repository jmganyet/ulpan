import { describe, it, expect } from 'vitest'
import { ambIconaDistinta, opcionsDistractores, sessioRepas, sessioUnitat } from './sessio'
import type { Paraula } from '../contingut/tipus'
import { dues, llavor, par, forat } from './fixtures'
import { progresBuit, respon } from '../progres/srs'

const ara = 1_000_000_000_000
const DIA = 86_400_000

describe('opcionsDistractores', () => {
  const totes = dues().flatMap((u) => u.vocabulari)
  it('no repeteix la correcta ni retorna perComprovar ni de funció', () => {
    const correcta = totes[0]
    for (let s = 1; s < 30; s++) {
      const o = opcionsDistractores(correcta, totes, 3, llavor(s), (p) => !!p.icona)
      expect(o.length).toBe(3)
      expect(o.some((p) => p.id === correcta.id)).toBe(false)
      expect(o.some((p) => p.funcio || p.perComprovar || !p.icona)).toBe(false)
      expect(new Set(o.map((p) => p.id)).size).toBe(3)
    }
  })
  it('prefereix la mateixa unitat si n\'hi ha prou', () => {
    const o = opcionsDistractores(totes[0], totes, 3, llavor(3), (p) => !!p.icona)
    expect(o.every((p) => p.id.startsWith('u01-'))).toBe(true)
  })
  it('completa amb altres unitats si la pròpia no en té prou', () => {
    const o = opcionsDistractores(totes.find((p) => p.id === 'u02-0')!, totes, 3, llavor(2), (p) => !!p.icona)
    expect(o.length).toBe(3)
    expect(o.some((p) => p.id.startsWith('u02-'))).toBe(true)
  })
  it('mai una forma que sense vocals s\'escriu igual, ni la mateixa icona a les preguntes d\'imatge', () => {
    const w = (id: string, hebreu: string, ca: string, icona?: string): Paraula =>
      ({ id, hebreu, translit: '', ca, pagina: 'pag-18', funcio: false, extra: false, perComprovar: false, ...(icona ? { icona } : {}) })
    const ose = w('u03-19', 'עוֹשֶׂה', 'fer, m.', 'hand')
    const llista = [ose, w('u03-x0', 'עוֹשָׂה', 'fer, f.', 'hand'), w('u03-x1', 'עוֹשִׂים', 'fer, m. pl.', 'hand'),
      w('u03-1', 'סֵפֶר', 'llibre', 'book'), w('u03-2', 'יֶלֶד', 'nen', 'kid'), w('u03-3', 'בַּיִת', 'casa', 'home')]
    for (let s = 1; s < 20; s++) {
      const o = opcionsDistractores(ose, llista, 3, llavor(s))
      expect(o.some((p) => p.id === 'u03-x0')).toBe(false)
      const im = opcionsDistractores(ose, llista, 3, llavor(s), ambIconaDistinta(ose))
      expect(im.some((p) => p.icona === 'hand')).toBe(false)
    }
  })
})

describe('sessioUnitat', () => {
  it('paraules no vistes en tandes de 5 i després els exercicis', () => {
    const u = dues()[0]
    const s = sessioUnitat(u, progresBuit(), llavor())
    const noves = s.filter((p) => p.tipus === 'paraula-nova')
    expect(noves.length).toBe(7) // sense la perComprovar
    expect(noves.some((p) => p.ref === 'u01-6')).toBe(false)
    expect(s.slice(0, 5).every((p) => p.tipus === 'paraula-nova')).toBe(true)
    const iEx = s.findIndex((p) => p.tipus === 'forat')
    expect(s.slice(iEx).map((p) => p.ref).sort()).toEqual(['ex-1', 'ex-2'])
    expect(s.some((p) => p.ref === 'u01-6')).toBe(false)
  })
  it('no repeteix paraules ja vistes', () => {
    const u = dues()[0]
    const p = { ...progresBuit(), vist: { 'u01-0': 1, 'u01-1': 1 } }
    const s = sessioUnitat(u, p, llavor())
    expect(s.filter((x) => x.tipus === 'paraula-nova').map((x) => x.ref)).not.toContain('u01-0')
  })
  it('regla R14: sense icona no hi ha passos d\'imatge; funció mai d\'imatge', () => {
    const u = dues()[0]
    for (let k = 1; k < 20; k++) {
      const s = sessioUnitat(u, progresBuit(), llavor(k))
      for (const p of s.filter((x) => x.tipus === 'tria-imatge' || x.tipus === 'imatge-paraula')) {
        const w = u.vocabulari.find((v) => v.id === p.ref)!
        expect(w.icona && !w.funcio).toBeTruthy()
      }
      const sense = s.filter((x) => x.ref === 'u01-7' && x.tipus !== 'paraula-nova')
      expect(sense.every((x) => x.tipus === 'traduccio')).toBe(true) // sense àudio ni icona
    }
  })
})

describe('sessioRepas', () => {
  const unitats = dues()
  const resp = (p: ReturnType<typeof progresBuit>, id: string, venc: number) => {
    const q = respon(p, id, true, venc - DIA) // caixa 1 -> venc = venc
    return q
  }
  it('no inclou mai perComprovar, ni com a resposta ni com a distractor', () => {
    let p = progresBuit()
    p = respon(p, 'u01-6', false, ara - 5 * DIA)
    p = respon(p, 'u01-0', false, ara - 5 * DIA)
    for (let k = 1; k < 20; k++) {
      const s = sessioRepas(unitats, p, ara, 5, llavor(k))
      expect(s.some((x) => x.ref === 'u01-6')).toBe(false)
      expect(s.some((x) => x.ref === 'u01-0')).toBe(true)
    }
  })
  it('5 minuts són com a màxim 20 passos, primer els vençuts (el més antic primer)', () => {
    let p = progresBuit()
    const ids = unitats.flatMap((u) => u.vocabulari).filter((w) => !w.perComprovar).map((w) => w.id)
    ids.forEach((id, i) => { p = resp(p, id, ara - (100 - i) * 1000) })
    p = resp(p, 'u01-0', ara + 10 * DIA) // no vençut
    const s = sessioRepas(unitats, p, ara, 5, llavor())
    expect(s.length).toBeLessThanOrEqual(20)
    expect(s.map((x) => x.ref).slice(0, 3)).toEqual(ids.filter((i) => i !== 'u01-0').slice(0, 3))
    expect(s.some((x) => x.ref === 'u01-0')).toBe(false)
    expect(sessioRepas(unitats, p, ara, 1, llavor()).length).toBeLessThanOrEqual(4)
  })
  it('afegeix paraules no vistes de la unitat tocada, màxim 5, i cap d\'una unitat no tocada', () => {
    let p = respon(progresBuit(), 'u01-0', true, ara) // unitat 1 tocada, no vençut
    const s = sessioRepas(unitats, p, ara, 5, llavor())
    const noves = s.filter((x) => x.tipus === 'paraula-nova')
    expect(noves.length).toBe(5)
    expect(noves.every((x) => x.ref.startsWith('u01-') && x.ref !== 'u01-0' && x.ref !== 'u01-6')).toBe(true)
  })
  it('exercicis vençuts entren amb el seu tipus', () => {
    const u = dues()
    const p = respon(progresBuit(), 'ex-1', false, ara - 3 * DIA)
    const s = sessioRepas(u, p, ara, 5, llavor())
    expect(s[0]).toEqual({ tipus: 'forat', ref: 'ex-1' })
  })
  it('un exercici que referencia una paraula per comprovar no hi surt', () => {
    const u = dues()
    u[0].exercicis.push(forat('ex-3', { linies: ['u01-6'] }))
    const p = respon(progresBuit(), 'ex-3', false, ara - 3 * DIA)
    expect(sessioRepas(u, p, ara, 5, llavor()).some((x) => x.ref === 'ex-3')).toBe(false)
    expect(par('x', 'y').id).toBe('x')
  })
})

describe('paraules vistes però no contestades (R16)', () => {
  it('sessioUnitat les pregunta (sense paraula-nova) després de les noves', () => {
    const u = dues()[0]
    const p = { ...progresBuit(), vist: { 'u01-0': 1, 'u01-6': 1 } }
    const s = sessioUnitat(u, p, llavor())
    const i = s.findIndex((x) => x.ref === 'u01-0')
    expect(s[i].tipus).not.toBe('paraula-nova')
    expect(s.some((x) => x.ref === 'u01-0' && x.tipus === 'paraula-nova')).toBe(false)
    expect(s.some((x) => x.ref === 'u01-6')).toBe(false)
    expect(i).toBeGreaterThan(s.findIndex((x) => x.tipus === 'paraula-nova'))
    expect(i).toBeLessThan(s.findIndex((x) => x.tipus === 'forat'))
  })
  it('sessioRepas les inclou just després dels vençuts', () => {
    const u = dues()
    let p = respon(progresBuit(), 'u02-0', false, ara - 3 * DIA)
    p = { ...p, vist: { 'u01-1': 1, 'u01-2': 1 } }
    const s = sessioRepas(u, p, ara, 5, llavor())
    expect(s[0].ref).toBe('u02-0')
    expect(s.slice(1, 3).map((x) => x.ref).sort()).toEqual(['u01-1', 'u01-2'])
    expect(s.slice(1, 3).every((x) => x.tipus !== 'paraula-nova')).toBe(true)
  })
  it('instal·lació nova: 5 paraules noves de la u01; amb darrera, d\'aquella unitat', () => {
    const u = dues()
    const s = sessioRepas(u, progresBuit(), ara, 5, llavor())
    const noves = s.filter((x) => x.tipus === 'paraula-nova').map((x) => x.ref)
    expect(noves).toEqual(['u01-0', 'u01-1', 'u01-2', 'u01-3', 'u01-4'])
    const d = sessioRepas(u, { ...progresBuit(), darrera: { unitat: 'u02', pas: 'vocabulari' } }, ara, 5, llavor())
    expect(d.filter((x) => x.tipus === 'paraula-nova').map((x) => x.ref)).toEqual(['u02-0', 'u02-1', 'u02-2', 'u02-3'])
  })
})
