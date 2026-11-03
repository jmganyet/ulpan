import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/preact'
import { Exercicis } from './Exercicis'
import { Repas } from './Repas'
import { Gramatica } from './Gramatica'
import { Unitat } from './Unitat'
import { dues, forat, unitat, par } from '../exercicis/fixtures'
import { progresBuit, respon, type Progres } from '../progres/srs'
import type { EntradaIndex } from '../contingut/index'

afterEach(cleanup)
const ara = 1_000_000_000_000
const DIA = 86_400_000
const entrada = (u: { id: string; num: number; titol: string; color: string }): EntradaIndex =>
  ({ ...u, pagines: ['pag-01'], textos: 0, paraules: 0, exercicis: 0 })

describe('Exercicis', () => {
  it('sense contingut, avisa en català', () => {
    render(<Exercicis unitat={unitat('u01', 1, [])} progres={progresBuit()} canvia={() => {}} />)
    expect(screen.getByText('No hi ha res per practicar en aquesta unitat ara mateix.')).toBeTruthy()
  })
  it('un forat: respon via canvia, mostra «Continua» i el resum final', () => {
    const canvia = vi.fn()
    const u = unitat('u01', 1, [], [forat('ex-1')])
    render(<Exercicis unitat={u} progres={progresBuit()} canvia={canvia} />)
    expect(screen.queryByText('Continua')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'גרה' }))
    const p = canvia.mock.calls[0][0] as Progres
    expect(p.fitxes['ex-1'].errors).toBe(1)
    fireEvent.click(screen.getByText('Continua'))
    // l'error torna una vegada al final
    expect(screen.getByRole('progressbar')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'גר' }))
    fireEvent.click(screen.getByText('Continua'))
    expect(screen.getByText('Sessió acabada')).toBeTruthy()
    expect(screen.getByText('0 / 1')).toBeTruthy()
  })
  it('amb exercicis buits però paraules, fa la sessió de paraules', () => {
    render(<Exercicis unitat={unitat('u01', 1, [par('u01-0', 'casa')])} progres={progresBuit()} canvia={() => {}} />)
    expect(screen.queryByText(/res per practicar/)).toBeNull()
  })
  it('paraula nova: marca vista, no compta com a resposta', () => {
    const canvia = vi.fn()
    render(<Exercicis unitat={unitat('u01', 1, [par('u01-0', 'casa')])} progres={progresBuit()} canvia={canvia} />)
    fireEvent.click(screen.getByText('Continua'))
    const p = canvia.mock.calls[0][0] as Progres
    expect(Object.keys(p.vist)).toEqual(['u01-0'])
    expect(Object.keys(p.fitxes)).toEqual([])
  })
})

describe('Repas', () => {
  const unitats = dues()
  const index = unitats.map(entrada)
  const carrega = async (id: string) => unitats.find((u) => u.id === id)!
  it('amb res vençut i res tocat, comença per les primeres paraules de la u01', async () => {
    render(<Repas index={index} progres={progresBuit()} canvia={() => {}} carrega={carrega} ara={ara} />)
    await waitFor(() => expect(document.querySelector('.targeta')).toBeTruthy())
  })
  it('sense paraules per fer, ho diu', async () => {
    const buides = [unitat('u01', 1, [])]
    render(<Repas index={buides.map(entrada)} progres={progresBuit()} canvia={() => {}} carrega={async () => buides[0]} ara={ara} />)
    await waitFor(() => expect(screen.getByText(/Res per repassar/)).toBeTruthy())
  })
  it('una sessió amb un vençut: pregunta, retro, continua i resum', async () => {
    const p = respon(progresBuit(), 'u01-0', false, ara - 3 * DIA)
    const canvia = vi.fn()
    const { container } = render(<Repas index={index} progres={p} canvia={canvia} carrega={carrega} ara={ara} />)
    await waitFor(() => expect(container.querySelector('.opcions')).toBeTruthy())
    const bons = [...container.querySelectorAll<HTMLButtonElement>('.opcio')]
    fireEvent.click(bons[0])
    expect(canvia).toHaveBeenCalled()
    expect(screen.getByText('Continua')).toBeTruthy()
  })
})

describe('Gramàtica', () => {
  const u = unitat('u02', 2, [])
  u.gramatica = [
    { id: 'g1', titol: 'El present', explicacio: 'Es conjuga així.', extra: false, exemples: [
      { id: 'l1', text: { u: 'אני גר' }, ca: 'Visc', perComprovar: false, extra: true },
    ] },
    { id: 'g2', titol: 'El plural', explicacio: 'Plural.', extra: false, exemples: [] },
  ]
  it('títol, explicació, exemple amb «extra», practica i següent', () => {
    const { container } = render(<Gramatica unitat={u} n="1" />)
    expect(screen.getByText('El present')).toBeTruthy()
    expect(screen.getByText('Es conjuga així.')).toBeTruthy()
    expect(container.querySelector('li [lang="he"]')?.textContent).toBe('אני גר')
    expect(container.querySelector('li .marca.extra')).toBeTruthy()
    expect(screen.getByText('Practica-ho').getAttribute('href')).toBe('#/u/u02/exercicis')
    expect(screen.getByText('Següent ›').getAttribute('href')).toBe('#/u/u02/gramatica/2')
    expect(screen.queryByText('‹ Anterior')).toBeNull()
  })
  it('un punt inexistent no peta', () => {
    render(<Gramatica unitat={u} n="9" />)
    expect(screen.getByText(/no existeix/)).toBeTruthy()
  })
  it('la unitat llista els punts només si n\'hi ha', () => {
    const { container, rerender } = render(<Unitat unitat={u} />)
    expect(container.querySelector('a[href="#/u/u02/gramatica/2"]')).toBeTruthy()
    rerender(<Unitat unitat={unitat('u03', 3, [])} />)
    expect(screen.queryByText('Gramàtica')).toBeNull()
  })
})
