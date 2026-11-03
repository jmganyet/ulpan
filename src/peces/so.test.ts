import { describe, expect, it, vi, beforeEach } from 'vitest'

const pendents = new Map<string, (b: string) => void>()
vi.mock('./audioBlob', () => ({
  urlAudio: (url: string) => new Promise<string>((res) => pendents.set(url, res)),
}))

function audio() {
  return { src: '', play: vi.fn(() => Promise.resolve()), pause: vi.fn() } as unknown as HTMLAudioElement & {
    play: ReturnType<typeof vi.fn>; pause: ReturnType<typeof vi.fn>
  }
}

describe('so', () => {
  beforeEach(() => pendents.clear())

  it('la crida més nova guanya encara que la baixada antiga acabi després', async () => {
    const { reprodueix } = await import('./so')
    const el = audio()
    const p1 = reprodueix(el, 'a.m4a')
    const p2 = reprodueix(el, 'b.m4a')
    pendents.get('b.m4a')!('blob:b')
    await p2
    pendents.get('a.m4a')!('blob:a')
    await p1
    expect(el.src).toBe('blob:b')
    expect(el.play).toHaveBeenCalledTimes(1)
  })

  it('aturaSo durant una baixada pendent: no sona', async () => {
    const { reprodueix, aturaSo } = await import('./so')
    const el = audio()
    const p = reprodueix(el, 'c.m4a')
    aturaSo()
    pendents.get('c.m4a')!('blob:c')
    await p
    expect(el.play).not.toHaveBeenCalled()
    expect(el.src).toBe('')
  })
})
