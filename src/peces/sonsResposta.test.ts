import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})

function contextFals() {
  const oscil·ladors: { type: string; freq: number }[] = []
  const param = () => ({ setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() })
  class Fals {
    currentTime = 0
    state = 'running'
    destination = {}
    resume = vi.fn(() => Promise.resolve())
    createOscillator() {
      const o = { type: '', frequency: param(), connect: (g: unknown) => g, start: vi.fn(), stop: vi.fn() }
      const original = o.frequency.setValueAtTime
      o.frequency.setValueAtTime = vi.fn((f: number, t: number) => { oscil·ladors.push({ type: o.type, freq: f }); return original(f, t) })
      return o
    }
    createGain() {
      return { gain: param(), connect: (d: unknown) => d }
    }
  }
  return { Fals, oscil·ladors }
}

describe('sonaResposta', () => {
  it('encert: dues notes ascendents; error: una nota greu', async () => {
    const { Fals, oscil·ladors } = contextFals()
    vi.stubGlobal('AudioContext', Fals)
    const { sonaResposta } = await import('./sonsResposta')
    sonaResposta(true)
    expect(oscil·ladors.map((o) => o.freq)).toEqual([659.25, 880])
    oscil·ladors.length = 0
    sonaResposta(false)
    expect(oscil·ladors).toHaveLength(1)
    expect(oscil·ladors[0].freq).toBeLessThan(300)
  })

  it('sense Web Audio no llança', async () => {
    vi.stubGlobal('AudioContext', undefined)
    vi.stubGlobal('webkitAudioContext', undefined)
    const { sonaResposta } = await import('./sonsResposta')
    expect(() => sonaResposta(true)).not.toThrow()
  })

  it('si el context peta, no llança', async () => {
    vi.stubGlobal('AudioContext', class { constructor() { throw new Error('no') } })
    const { sonaResposta } = await import('./sonsResposta')
    expect(() => sonaResposta(false)).not.toThrow()
  })
})
