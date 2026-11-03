import { expect, it } from 'vitest'
import { dependenciesAudio } from './dependenciesAudio'

it('durada: si les metadades no arriben, torna 2 s després del temps màxim', async () => {
  const d = dependenciesAudio(10)
  const t = await d.durada({ id: 'x', text: { u: 'x' }, perComprovar: false, audio: { normal: 'x.m4a', lent: 'y.m4a' } })
  expect(t).toBe(2)
})
