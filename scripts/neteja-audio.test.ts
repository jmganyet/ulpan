import { describe, expect, it } from 'vitest'
import { referencies, sobrants } from './neteja-audio'

describe('neteja-audio', () => {
  it('troba les referències i els sobrants', () => {
    const refs = new Set(referencies('{"audio":{"normal":"a.m4a","lent":"b.m4a"}}'))
    expect(refs).toEqual(new Set(['a.m4a', 'b.m4a']))
    expect(sobrants(['a.m4a', 'b.m4a', 'c.m4a', 'notes.txt'], refs)).toEqual(['c.m4a'])
  })
})
