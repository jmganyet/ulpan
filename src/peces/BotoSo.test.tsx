import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/preact'
import { BotoSo } from './BotoSo'
import { VELOCITAT_LENTA } from './so'

const audio = { normal: 'a.m4a', lent: 'b.m4a' }
let play: ReturnType<typeof vi.fn>
beforeEach(() => {
  play = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('fetch', vi.fn(async (u: string) => new Response(new Blob([u]), { status: 200 })))
  let n = 0
  URL.createObjectURL = vi.fn(() => `blob:t${n++}`)
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(play as never)
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('BotoSo', () => {
  it('sense audio queda desactivat', () => {
    render(<BotoSo audio={undefined} />)
    for (const b of screen.getAllByRole('button')) expect((b as HTMLButtonElement).disabled).toBe(true)
  })
  it('el toc reprodueix a velocitat normal i el botó lent el mateix fitxer més a poc a poc, via blob', async () => {
    const { container } = render(<BotoSo audio={audio} />)
    const el = () => container.querySelector('audio')!
    fireEvent.click(screen.getByLabelText('Escolta'))
    await new Promise((r) => setTimeout(r, 0))
    expect(el().getAttribute('src')).toMatch(/^blob:/)
    expect(el().playbackRate).toBe(1)
    fireEvent.click(screen.getByLabelText('Escolta lent'))
    await new Promise((r) => setTimeout(r, 0))
    expect(el().getAttribute('src')).toMatch(/^blob:/)
    expect(el().playbackRate).toBe(VELOCITAT_LENTA)
    expect(el().preservesPitch).toBe(true)
    const urls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => String(c[0]))
    expect(urls.every((u) => u.endsWith('audio/a.m4a'))).toBe(true)
    expect(play).toHaveBeenCalledTimes(2)
  })
  it('si el fitxer no es pot baixar, desactiva els botons, sense llançar', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
    render(<BotoSo audio={{ normal: 'z.m4a', lent: 'zl.m4a' }} />)
    fireEvent.click(screen.getByLabelText('Escolta'))
    await new Promise((r) => setTimeout(r, 0))
    expect((screen.getByLabelText('Escolta') as HTMLButtonElement).disabled).toBe(true)
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
  it('un so nou atura l\'anterior', async () => {
    const pause = vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    render(<><BotoSo audio={audio} etiqueta="A" /><BotoSo audio={audio} etiqueta="B" /></>)
    fireEvent.click(screen.getByLabelText('Escolta A'))
    await new Promise((r) => setTimeout(r, 0))
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

describe('BotoSo autoplay', () => {
  it('amb autoplay sona tot sol en aparèixer', async () => {
    render(<BotoSo audio={audio} autoplay />)
    await new Promise((r) => setTimeout(r, 0))
    expect(play).toHaveBeenCalledTimes(1)
  })
  it('sense autoplay no sona fins que es toca', async () => {
    render(<BotoSo audio={audio} />)
    await new Promise((r) => setTimeout(r, 0))
    expect(play).not.toHaveBeenCalled()
  })
})
