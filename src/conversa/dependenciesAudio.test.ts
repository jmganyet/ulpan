import { describe, expect, it } from 'vitest'
import { dependenciesAudio } from './dependenciesAudio'

it('durada: si les metadades no arriben, torna 2 s després del temps màxim', async () => {
  const d = dependenciesAudio(10)
  const t = await d.durada({ id: 'x', text: { u: 'x' }, perComprovar: false, audio: { normal: 'x.m4a', lent: 'y.m4a' } })
  expect(t).toBe(2)
})

describe('velocitat dels diàlegs', () => {
  it('amb «Lent» la durada (i el silenci) s’allarga en proporció', async () => {
    const { desaPreferencies, preferenciesActuals } = await import('../preferencies')
    const { VELOCITAT_LENTA } = await import('../peces/so')
    const { dependenciesAudio } = await import('./dependenciesAudio')
    const prev = preferenciesActuals()
    desaPreferencies({ ...prev, dialegLent: true })
    const d = dependenciesAudio(10)
    const s = await d.durada({ id: 'x', text: { u: 'א' }, perComprovar: false, audio: { normal: 'n.m4a', lent: 'l.m4a' } })
    expect(s).toBeCloseTo(2 / VELOCITAT_LENTA)
    desaPreferencies(prev)
  })
})
