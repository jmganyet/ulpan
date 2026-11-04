import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/preact'
import { TargetaParaula } from './TargetaParaula'
import { desaPreferencies } from '../preferencies'
import type { Paraula } from '../contingut/tipus'

const p: Paraula = {
  id: 'u01-0', hebreu: 'שָׁלוֹם', translit: 'shalom', ca: 'hola, adéu', pagina: 'pag-02',
  icona: 'hand-waving', funcio: false, extra: false, perComprovar: false, audio: { normal: 'a.m4a', lent: 'b.m4a' },
}
beforeEach(() => desaPreferencies({ vocals: false, lletra: 'quadrada', sons: true, translit: true, dialegLent: false, traduccio: false, repetir: false }))
afterEach(cleanup)

describe('TargetaParaula', () => {
  it('segueix la lletra del full d\'opcions: quadrada, cursiva o totes dues', () => {
    const { container, rerender } = render(<TargetaParaula paraula={p} color="#E35D8F" />)
    expect(screen.getByText('שָׁלוֹם').className).toContain('quadrada')
    expect(container.querySelector('.cursiva')).toBeNull()
    expect(screen.getByText('shalom')).toBeTruthy()
    expect(screen.getByText('hola, adéu')).toBeTruthy()
    expect(container.querySelector('.plafo i.ph-duotone')).toBeTruthy()
    desaPreferencies({ vocals: false, lletra: 'cursiva', sons: true, translit: false, dialegLent: false, traduccio: false, repetir: false })
    rerender(<TargetaParaula paraula={p} color="#E35D8F" />)
    expect(container.querySelector('.quadrada')).toBeNull()
    expect(container.querySelector('.cursiva')!.getAttribute('lang')).toBe('he')
    expect(screen.queryByText('shalom')).toBeNull()
    desaPreferencies({ vocals: false, lletra: 'dues', sons: true, translit: true, dialegLent: false, traduccio: false, repetir: false })
    rerender(<TargetaParaula paraula={p} color="#E35D8F" />)
    expect(container.querySelectorAll('.quadrada, .cursiva').length).toBe(2)
    expect(screen.getByText('shalom')).toBeTruthy()
  })
  it('sense icona mostra el plafó sense imatge', () => {
    const { container } = render(<TargetaParaula paraula={{ ...p, icona: undefined }} color="#E35D8F" />)
    const plafo = container.querySelector('.plafo') as HTMLElement
    expect(plafo).toBeTruthy()
    expect(plafo.querySelector('i, img')).toBeNull()
  })
  it('amb funcio no mostra cap plafó', () => {
    const { container } = render(<TargetaParaula paraula={{ ...p, icona: undefined, funcio: true }} color="#E35D8F" />)
    expect(container.querySelector('.plafo')).toBeNull()
  })
  it('perComprovar mostra la marca i no té botó de so', () => {
    render(<TargetaParaula paraula={{ ...p, perComprovar: true, audio: undefined }} color="#E35D8F" />)
    expect(screen.getByText('⁇ per comprovar')).toBeTruthy()
    expect(screen.queryByLabelText(/^Escolta/)).toBeNull()
  })
})

describe('TargetaParaula i la transcripció', () => {
  it('amb la transcripció amagada (preferència de tota l’app) no la mostra', () => {
    desaPreferencies({ vocals: false, lletra: 'quadrada', sons: true, translit: false, dialegLent: false, traduccio: false, repetir: false })
    const { container } = render(<TargetaParaula paraula={p} color="#E35D8F" />)
    expect(container.querySelector('.translit')).toBeNull()
  })
})
