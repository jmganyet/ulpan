import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/preact'
import { Conversa } from './Conversa'
import type { Deps } from '../conversa/reproductor'
import type { Unitat, Linia, Text } from '../contingut/tipus'

const au = { normal: 'a.m4a', lent: 'b.m4a' }
const l = (i: number, u: string, extra: Partial<Linia> = {}): Linia => ({ id: `pag-28-b0-l${i}`, text: { u }, perComprovar: false, audio: au, ...extra })
const dialeg: Text = {
  id: 'pag-28-b0', pagina: 'pag-28', titol: { u: 'באולפן', ca: "A l'ulpan", perComprovar: true }, tipus: 'dialeg',
  personatges: ['Roberto', 'Dana'],
  linies: [l(0, 'שלום', { qui: 'Dana', ca: 'Hola' }), l(1, 'מה שלומך', { qui: 'Roberto' }), l(2, 'עדיין', { qui: 'Dana', perComprovar: true })],
}
const narracio: Text = { id: 'pag-28-b1', pagina: 'pag-28', titol: { u: 'Lectura', ca: 'Lectura', perComprovar: false }, tipus: 'text', linies: [l(0, 'טקסט')] }
const unitat: Unitat = { id: 'u05', num: 5, titol: 'Anar', color: '#3DB8A5', pagines: ['pag-28'], vocabulari: [], gramatica: [], exercicis: [], textos: [dialeg, narracio] }

const fals = () => {
  const reg: string[] = []
  const deps: Deps = {
    toca: async (x) => { reg.push(x.id) }, durada: async () => 1, espera: async () => {}, atura: vi.fn(),
  }
  return { reg, deps }
}
afterEach(cleanup)

describe('Conversa', () => {
  it('mostra tots els blocs de la pàgina; el mode personatge només als diàlegs', () => {
    render(<Conversa unitat={unitat} pag="pag-28" deps={fals().deps} />)
    expect(document.querySelectorAll('section.bloc-conversa').length).toBe(2)
    expect(screen.getAllByText('Escoltar').length).toBe(2)
    expect(screen.getAllByText(/^Fas de /).length).toBe(2)
  })
  it('en mode personatge les meves línies s\'amaguen fins que es toca «Mostra el meu torn»', () => {
    render(<Conversa unitat={unitat} pag="pag-28" deps={fals().deps} />)
    expect(screen.getByText('מה שלומך')).toBeTruthy()
    fireEvent.click(screen.getByText('Fas de Roberto'))
    expect(screen.queryByText('מה שלומך')).toBeNull()
    expect(screen.getByText('El teu torn: digues-ho en veu alta')).toBeTruthy()
    fireEvent.click(screen.getByText('Mostra el meu torn'))
    expect(screen.getByText('מה שלומך')).toBeTruthy()
  })
  it('la línia per comprovar porta la marca i no es pot tocar', () => {
    render(<Conversa unitat={unitat} pag="pag-28" deps={fals().deps} />)
    expect(screen.getAllByText('⁇ per comprovar').length).toBe(2)
    expect((screen.getByLabelText('Escolta la línia 3') as HTMLButtonElement).disabled).toBe(true)
  })
  it('tocar una línia la fa sonar sola', async () => {
    const { reg, deps } = fals()
    render(<Conversa unitat={unitat} pag="pag-28" deps={deps} />)
    fireEvent.click(screen.getAllByLabelText('Escolta la línia 2')[0])
    await waitFor(() => expect(reg).toEqual(['pag-28-b0-l1']))
  })
  it('la traducció es mostra a demanda', () => {
    render(<Conversa unitat={unitat} pag="pag-28" deps={fals().deps} />)
    expect(screen.queryByText('Hola')).toBeNull()
    fireEvent.click(screen.getByLabelText('Traducció de la línia 1'))
    expect(screen.getByText('Hola')).toBeTruthy()
  })
  it('play recorre les línies reproduïbles; marxar de la pantalla atura', async () => {
    const { reg, deps } = fals()
    const { unmount } = render(<Conversa unitat={unitat} pag="pag-28" deps={deps} />)
    fireEvent.click(screen.getAllByLabelText('Reprodueix')[0])
    await waitFor(() => expect(reg).toEqual(['pag-28-b0-l0', 'pag-28-b0-l1']))
    unmount()
    await waitFor(() => expect(deps.atura).toHaveBeenCalled())
    expect(deps.atura).toHaveBeenCalled()
  })
  it('una pàgina sense textos ho diu', () => {
    render(<Conversa unitat={unitat} pag="pag-99" deps={fals().deps} />)
    expect(screen.getByText(/No hi ha cap text/)).toBeTruthy()
  })
})
