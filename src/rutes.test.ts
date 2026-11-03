import { describe, it, expect } from 'vitest'
import { parseRuta } from './rutes'

describe('parseRuta', () => {
  it('reconeix totes les rutes', () => {
    expect(parseRuta('')).toEqual({ pantalla: 'inici' })
    expect(parseRuta('#/u/u01')).toEqual({ pantalla: 'unitat', id: 'u01' })
    expect(parseRuta('#/u/u01/vocabulari')).toEqual({ pantalla: 'vocabulari', id: 'u01' })
    expect(parseRuta('#/u/u01/gramatica/2')).toEqual({ pantalla: 'gramatica', id: 'u01', n: '2' })
    expect(parseRuta('#/u/u01/text/pag-02')).toEqual({ pantalla: 'text', id: 'u01', pag: 'pag-02' })
    expect(parseRuta('#/u/u01/exercicis')).toEqual({ pantalla: 'exercicis', id: 'u01' })
    expect(parseRuta('#/repas').pantalla).toBe('repas')
    expect(parseRuta('#/alefat').pantalla).toBe('alefat')
    expect(parseRuta('#/ajustos').pantalla).toBe('ajustos')
    expect(parseRuta('#/xx').pantalla).toBe('desconeguda')
  })
})
