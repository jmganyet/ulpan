import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/preact'
import { Inici } from './Inici'
import { progresBuit } from '../progres/srs'
import type { EntradaIndex } from '../contingut/index'

const index: EntradaIndex[] = Array.from({ length: 10 }, (_, i) => ({
  id: `u${String(i + 1).padStart(2, '0')}`, num: i + 1, titol: `Unitat ${i + 1}`, color: `#00000${i % 10}`,
  pagines: [`pag-${String(i + 2).padStart(2, '0')}`], textos: 1, paraules: 4, exercicis: 0,
}))
afterEach(cleanup)

describe('Inici', () => {
  it('mostra «3 per repassar» i les deu unitats amb el seu color', () => {
    const p = progresBuit()
    for (const id of ['u01-0', 'u01-1', 'u02-0']) p.fitxes[id] = { caixa: 1, venc: 0, encerts: 0, errors: 0 }
    p.fitxes['u99-0'] = { caixa: 1, venc: 0, encerts: 0, errors: 0 } // desconeguda: s'ignora
    const { container } = render(<Inici index={index} progres={p} ara={1000} />)
    expect(screen.getByText(/3 per repassar/)).toBeTruthy()
    const links = container.querySelectorAll('a.unitat')
    expect(links.length).toBe(10)
    expect(links[0].getAttribute('href')).toBe('#/u/u01')
    expect((links[3].querySelector('.pt') as HTMLElement).style.background).not.toBe('')
  })
  it('sense fitxes vençudes ho diu', () => {
    render(<Inici index={index} progres={progresBuit()} ara={1000} />)
    expect(screen.getByText(/Res per repassar/)).toBeTruthy()
  })
})
