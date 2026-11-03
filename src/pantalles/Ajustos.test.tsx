import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/preact'
import { Ajustos } from './Ajustos'
import { progresBuit, respon } from '../progres/srs'
import { exporta } from '../progres/magatzem'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

function fitxer(text: string) {
  return new File([text], 'p.json', { type: 'application/json' })
}

describe('Ajustos', () => {
  it('exporta crea un Blob amb el progrés i baixa un .json', () => {
    vi.useFakeTimers()
    const crea = vi.fn(() => 'blob:x')
    Object.assign(URL, { createObjectURL: crea, revokeObjectURL: vi.fn() })
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<Ajustos progres={progresBuit()} alImportar={() => {}} />)
    fireEvent.click(screen.getByText('Exporta el progrés'))
    expect(crea).toHaveBeenCalledTimes(1)
    expect((crea.mock.calls[0] as unknown as [Blob])[0]).toBeInstanceOf(Blob)
    expect(clic).toHaveBeenCalled()
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(1000)
    expect(URL.revokeObjectURL).toHaveBeenCalled()
    vi.useRealTimers()
  })
  it('un fitxer vàlid substitueix el progrés', async () => {
    const alImportar = vi.fn()
    render(<Ajustos progres={progresBuit()} alImportar={alImportar} />)
    const p = respon(progresBuit(), 'u01-0', true, 5)
    fireEvent.change(screen.getByLabelText('Fitxer de progrés'), { target: { files: [fitxer(exporta(p))] } })
    await waitFor(() => expect(alImportar).toHaveBeenCalledWith(p))
    expect(screen.getByText('Progrés importat.')).toBeTruthy()
  })
  it('un fitxer invàlid mostra el missatge i no canvia el progrés', async () => {
    const alImportar = vi.fn()
    render(<Ajustos progres={progresBuit()} alImportar={alImportar} />)
    fireEvent.change(screen.getByLabelText('Fitxer de progrés'), { target: { files: [fitxer('no json')] } })
    await waitFor(() => expect(screen.getByText('El fitxer no és un JSON vàlid.')).toBeTruthy())
    expect(alImportar).not.toHaveBeenCalled()
  })
})
