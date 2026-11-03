import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/preact'
import { Forat } from './Forat'
import { Construir } from './Construir'
import { Autocorreccio } from './Autocorreccio'
import { Comprensio } from './Comprensio'
import { Conjugar } from './Conjugar'
import type { Exercici } from '../contingut/tipus'

afterEach(cleanup)
type De<T extends Exercici['tipus']> = Extract<Exercici, { tipus: T }>
const base = { id: 'e', origen: 'extra', extra: false }

describe('Forat', () => {
  const ex: De<'forat'> = { ...base, tipus: 'forat', frase: { u: 'אני ___ בבית' }, opcions: ['גר', 'גרה', 'גרים'], correcta: 0, retro: 'Masculí singular.' }
  it('l\'opció correcta crida onRespon(true) i mostra la retro', () => {
    const f = vi.fn()
    render(<Forat ex={ex} onRespon={f} />)
    expect(screen.queryByText('Masculí singular.')).toBeNull()
    fireEvent.click(screen.getByText('גר'))
    expect(f).toHaveBeenCalledWith(true)
    expect(screen.getByText('Masculí singular.')).toBeTruthy()
  })
  it('una opció errònia crida onRespon(false) una sola vegada', () => {
    const f = vi.fn()
    render(<Forat ex={ex} onRespon={f} />)
    fireEvent.click(screen.getByText('גרה'))
    fireEvent.click(screen.getByText('גר'))
    expect(f).toHaveBeenCalledTimes(1)
    expect(f).toHaveBeenCalledWith(false)
  })
})

describe('Construir', () => {
  const ex: De<'construir'> = { ...base, tipus: 'construir', ca: 'Visc a Barcelona', fitxes: ['בברצלונה', 'גר', 'אני', 'גרה'], ordre: [2, 1, 0] }
  const toca = (t: string) => fireEvent.click(screen.getByRole('button', { name: t }))
  it('fitxes en l\'ordre bo i «Comprova» → true', () => {
    const f = vi.fn()
    render(<Construir ex={ex} onRespon={f} />)
    toca('אני'); toca('גר'); toca('בברצלונה')
    fireEvent.click(screen.getByText('Comprova'))
    expect(f).toHaveBeenCalledWith(true)
  })
  it('la fitxa que sobra a la línia → false', () => {
    const f = vi.fn()
    render(<Construir ex={ex} onRespon={f} />)
    toca('אני'); toca('גר'); toca('בברצלונה'); toca('גרה')
    fireEvent.click(screen.getByText('Comprova'))
    expect(f).toHaveBeenCalledWith(false)
  })
  it('tocar una fitxa col·locada la treu', () => {
    const f = vi.fn()
    render(<Construir ex={ex} onRespon={f} />)
    toca('אני')
    expect(screen.getByTestId('linia').textContent).toContain('אני')
    fireEvent.click(screen.getByTestId('linia').querySelector('button')!)
    expect(screen.getByTestId('linia').textContent).not.toContain('אני')
  })
})

describe('Autocorreccio', () => {
  it('«L\'he encertat» → true, «M\'he equivocat» → false, després de veure el model', () => {
    const ex: De<'autocorreccio'> = { ...base, tipus: 'autocorreccio', enunciat: { u: 'כתוב' }, model: { u: 'אני גר' } }
    const f = vi.fn()
    render(<Autocorreccio ex={ex} onRespon={f} />)
    expect(screen.queryByText("L'he encertat")).toBeNull()
    fireEvent.click(screen.getByText('Mostra el model'))
    fireEvent.click(screen.getByText("M'he equivocat"))
    expect(f).toHaveBeenCalledWith(false)
  })
})

describe('Comprensio i Conjugar', () => {
  it('Comprensio: opció correcta → true', () => {
    const f = vi.fn()
    render(<Comprensio ex={{ ...base, tipus: 'comprensio', text: 'Dani viu a Haifa.', pregunta: 'On viu?', opcions: ['Haifa', 'Eilat'], correcta: 0 }} onRespon={f} />)
    fireEvent.click(screen.getByText('Haifa'))
    expect(f).toHaveBeenCalledWith(true)
  })
  it('Conjugar: opció errònia → false', () => {
    const f = vi.fn()
    render(<Conjugar ex={{ ...base, tipus: 'conjugar', base: { u: 'גר' }, demana: 'femení', opcions: ['גר', 'גרה'], correcta: 1 }} onRespon={f} />)
    fireEvent.click(screen.getAllByRole('button')[0])
    expect(f).toHaveBeenCalledWith(false)
  })
})
