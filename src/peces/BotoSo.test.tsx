import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/preact'
import { BotoSo } from './BotoSo'

const audio = { normal: 'a.m4a', lent: 'b.m4a' }
let play: ReturnType<typeof vi.fn>
beforeEach(() => {
  play = vi.fn().mockResolvedValue(undefined)
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(play as never)
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('BotoSo', () => {
  it('sense audio queda desactivat', () => {
    render(<BotoSo audio={undefined} />)
    for (const b of screen.getAllByRole('button')) expect((b as HTMLButtonElement).disabled).toBe(true)
  })
  it('el toc reprodueix la velocitat normal i el botó lent la lenta', () => {
    const { container } = render(<BotoSo audio={audio} />)
    fireEvent.click(screen.getByLabelText('Escolta'))
    expect(container.querySelector('audio')!.getAttribute('src')).toContain('audio/a.m4a')
    fireEvent.click(screen.getByLabelText('Escolta lent'))
    expect(container.querySelector('audio')!.getAttribute('src')).toContain('audio/b.m4a')
    expect(play).toHaveBeenCalledTimes(2)
  })
  it('un error de l\'element audio desactiva els botons, sense llançar', () => {
    const { container } = render(<BotoSo audio={audio} />)
    fireEvent.click(screen.getByLabelText('Escolta'))
    expect(() => fireEvent.error(container.querySelector('audio')!)).not.toThrow()
    for (const b of screen.getAllByRole('button')) expect((b as HTMLButtonElement).disabled).toBe(true)
  })
  it('un play rebutjat amb NotSupportedError no llança i desactiva', async () => {
    play.mockRejectedValue(new DOMException('no', 'NotSupportedError'))
    render(<BotoSo audio={audio} />)
    fireEvent.click(screen.getByLabelText('Escolta'))
    await new Promise((r) => setTimeout(r, 0))
    expect((screen.getByLabelText('Escolta') as HTMLButtonElement).disabled).toBe(true)
  })
  it('AbortError (toc ràpid) i NotAllowedError no desactiven', async () => {
    render(<BotoSo audio={audio} />)
    for (const nom of ['AbortError', 'NotAllowedError']) {
      play.mockRejectedValue(new DOMException('x', nom))
      fireEvent.click(screen.getByLabelText('Escolta'))
      await new Promise((r) => setTimeout(r, 0))
      expect((screen.getByLabelText('Escolta') as HTMLButtonElement).disabled).toBe(false)
    }
  })
  it('un so nou atura l\'anterior', () => {
    const pause = vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    render(<><BotoSo audio={audio} etiqueta="A" /><BotoSo audio={audio} etiqueta="B" /></>)
    fireEvent.click(screen.getByLabelText('Escolta A'))
    pause.mockClear()
    fireEvent.click(screen.getByLabelText('Escolta B'))
    expect(pause).toHaveBeenCalledTimes(1)
  })
  it('l\'etiqueta inclou la paraula', () => {
    render(<BotoSo audio={audio} etiqueta="שָׁלוֹם" />)
    expect(screen.getByLabelText('Escolta שָׁלוֹם')).toBeTruthy()
    expect(screen.getByLabelText('Escolta lent שָׁלוֹם')).toBeTruthy()
  })
})
