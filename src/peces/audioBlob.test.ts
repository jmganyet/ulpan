import { afterEach, beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
  URL.createObjectURL = vi.fn(() => 'blob:x')
})
afterEach(() => vi.unstubAllGlobals())

it('un sol fetch per fitxer i sessió, i dona la URL de blob', async () => {
  const f = vi.fn(async () => new Response(new Blob(['a']), { status: 200 }))
  vi.stubGlobal('fetch', f)
  const { urlAudio } = await import('./audioBlob')
  expect(await urlAudio('/audio/a.m4a')).toBe('blob:x')
  expect(await urlAudio('/audio/a.m4a')).toBe('blob:x')
  expect(f).toHaveBeenCalledTimes(1)
  expect(f).toHaveBeenCalledWith('/audio/a.m4a')
})

it('si el fetch falla, es rebutja', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
  const { urlAudio } = await import('./audioBlob')
  await expect(urlAudio('/audio/b.m4a')).rejects.toThrow()
})

it('reprodueix posa el blob a src; si falla, rebutja', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(new Blob(['a']), { status: 200 })))
  const { reprodueix } = await import('./so')
  const el = document.createElement('audio')
  el.play = vi.fn(async () => {})
  await reprodueix(el, '/audio/c.m4a')
  expect(el.getAttribute('src')).toBe('blob:x')
  vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404 })))
  await expect(reprodueix(el, '/audio/d.m4a')).rejects.toThrow()
})
