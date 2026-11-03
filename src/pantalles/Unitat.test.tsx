import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/preact'
import { Unitat } from './Unitat'
import type { Unitat as U, Text } from '../contingut/tipus'

const t = (id: string, pagina: string, u: string, ca: string, perComprovar = false): Text => ({
  id, pagina, titol: { u, ca, perComprovar }, tipus: 'dialeg', linies: [],
})
const unitat: U = {
  id: 'u05', num: 5, titol: 'Anar i venir', color: '#3DB8A5', pagines: ['pag-28', 'pag-29'],
  vocabulari: [], gramatica: [], exercicis: [],
  textos: [t('pag-28-b0', 'pag-28', 'באולפן', "A l'ulpan", true), t('pag-29-b0', 'pag-29', 'Continuació', 'Els verbs'), t('pag-29-b1', 'pag-29', 'altre', 'altre')],
}
afterEach(cleanup)

describe('Unitat', () => {
  it('llista un text per pàgina amb el títol, no «Pàgina N»', () => {
    const { container } = render(<Unitat unitat={unitat} />)
    const e = container.querySelectorAll('a.text-enllac')
    expect(e.length).toBe(2)
    expect(e[0].getAttribute('href')).toBe('#/u/u05/text/pag-28')
    expect(screen.getByText('באולפן').getAttribute('dir')).toBe('rtl')
    expect(screen.getByText('⁇ per comprovar')).toBeTruthy()
    expect(screen.getByText("A l'ulpan")).toBeTruthy()
    expect(screen.getByText('pàg. 29')).toBeTruthy()
    expect(screen.queryByText(/Pàgina 28/)).toBeNull()
  })
})
