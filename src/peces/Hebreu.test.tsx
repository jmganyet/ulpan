import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/preact'
import { Hebreu } from './Hebreu'
import { desaPreferencies } from '../preferencies'

beforeEach(() => {
  cleanup()
  desaPreferencies({ vocals: false, lletra: 'quadrada' })
})

describe('Hebreu', () => {
  it('sense vocals mostra u, amb dir=rtl i lang=he', () => {
    render(<Hebreu valor={{ u: 'שלום', n: 'שָׁלוֹם' }} />)
    const e = screen.getByText('שלום')
    expect(e.getAttribute('dir')).toBe('rtl')
    expect(e.getAttribute('lang')).toBe('he')
  })
  it('amb vocals mostra n, o u si no n\'hi ha', () => {
    desaPreferencies({ vocals: true, lletra: 'quadrada' })
    const { unmount } = render(<Hebreu valor={{ u: 'שלום', n: 'שָׁלוֹם' }} />)
    expect(screen.getByText('שָׁלוֹם')).toBeTruthy()
    unmount()
    render(<Hebreu valor={{ u: 'אני' }} />)
    expect(screen.getByText('אני')).toBeTruthy()
  })
  it('amb extraVocals i vocals visibles porta la marca extra', () => {
    desaPreferencies({ vocals: true, lletra: 'quadrada' })
    render(<Hebreu valor={{ u: 'שלום', n: 'שָׁלוֹם', extraVocals: true }} />)
    expect(screen.getByText('extra')).toBeTruthy()
  })
  it('sense vocals visibles no hi ha marca extra', () => {
    render(<Hebreu valor={{ u: 'שלום', n: 'שָׁלוֹם', extraVocals: true }} />)
    expect(screen.queryByText('extra')).toBeNull()
  })
  it('la preferència de lletra tria la classe', () => {
    desaPreferencies({ vocals: false, lletra: 'cursiva' })
    render(<Hebreu valor={{ u: 'שלום' }} />)
    expect(screen.getByText('שלום').className).toContain('cursiva')
  })
})
