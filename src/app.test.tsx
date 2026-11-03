import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, cleanup } from '@testing-library/preact'
import { App } from './app'
import { progresBuit } from './progres/srs'
import type { Magatzem } from './progres/magatzem'

const index = [{ id: 'u01', num: 1, titol: 'Presentacions', color: '#E35D8F', pagines: ['pag-02'], textos: 1, paraules: 1, exercicis: 0 }]
const unitat = { ...index[0], vocabulari: [], gramatica: [], textos: [], exercicis: [] }

function magatzem(extra: Partial<Magatzem> = {}): Magatzem & { llegeix: ReturnType<typeof vi.fn>; desa: ReturnType<typeof vi.fn> } {
  return { llegeix: vi.fn(() => progresBuit()), desa: vi.fn(), disponible: true, recuperat: false, ...extra } as never
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async (u: string) => {
    if (u.endsWith('index.json')) return { ok: true, json: async () => index }
    if (u.endsWith('u01.json')) return { ok: true, json: async () => unitat }
    return { ok: false, status: 404 }
  }))
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); window.location.hash = '' })

describe('App', () => {
  it('l\'inici carrega l\'índex i llegeix el progrés un sol cop', async () => {
    const m = magatzem()
    render(<App magatzem={m} />)
    await waitFor(() => expect(screen.getByText(/1 · Presentacions/)).toBeTruthy())
    expect(m.llegeix).toHaveBeenCalledTimes(1)
  })
  it('mostra els avisos de magatzem no disponible i de dades recuperades', async () => {
    render(<App magatzem={magatzem({ disponible: false, recuperat: true })} />)
    expect(screen.getByText('El progrés no es pot desar en aquest navegador')).toBeTruthy()
    expect(screen.getByText(/S'han trobat dades de progrés malmeses/)).toBeTruthy()
  })
  it('en entrar a una subpantalla desa «darrera» i sap el camí', async () => {
    window.location.hash = '#/u/u01/vocabulari'
    const m = magatzem()
    render(<App magatzem={m} />)
    await waitFor(() => expect(m.desa).toHaveBeenCalled())
    const desat = m.desa.mock.calls.at(-1)![0]
    expect(desat.darrera).toEqual({ unitat: 'u01', pas: 'vocabulari' })
  })
  it('#/u/<id>/text/<pag> mostra la pantalla de conversa', async () => {
    window.location.hash = '#/u/u01/text/pag-08'
    render(<App magatzem={magatzem()} />)
    await waitFor(() => expect(screen.getByText(/No hi ha cap text/)).toBeTruthy())
  })
  it('#/u/<id>/exercicis mostra la pantalla d\'exercicis', async () => {
    window.location.hash = '#/u/u01/exercicis'
    render(<App magatzem={magatzem()} />)
    await waitFor(() => expect(document.querySelector('.sessio')).toBeTruthy())
  })
  it('canviar de punt de gramàtica torna a pintar la pantalla', async () => {
    const ex = (id: string) => ({ id, text: { u: 'שלום' }, perComprovar: false })
    const amb = { ...unitat, gramatica: [
      { id: 'a', titol: 'Primer punt', explicacio: 'u', extra: false, exemples: [ex('g0')] },
      { id: 'b', titol: 'Segon punt', explicacio: 'd', extra: false, exemples: [ex('g1')] },
    ] }
    vi.stubGlobal('fetch', vi.fn(async (u: string) =>
      u.endsWith('u01.json') ? { ok: true, json: async () => amb } : { ok: true, json: async () => index }))
    window.location.hash = '#/u/u01/gramatica/1'
    render(<App magatzem={magatzem()} />)
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Primer punt' })).toBeTruthy())
    window.location.hash = '#/u/u01/gramatica/2'
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Segon punt' })).toBeTruthy())
  })
  it('un error de càrrega mostra un missatge en català', async () => {
    window.location.hash = '#/u/u99'
    render(<App magatzem={magatzem()} />)
    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('No s\'ha pogut carregar'))
  })
})
