import { describe, it, expect } from 'vitest'
import { veusDialeg, filtreVeu, CARMIT } from './veus'
import { clauAudio } from './audio-clau'
import type { Text } from '../src/contingut/tipus'

const dialeg = (personatges: string[]): Text => ({
  id: 't', pagina: '1', titol: { u: '', ca: '', perComprovar: false }, tipus: 'dialeg', personatges,
  linies: personatges.map((qui, i) => ({ id: `l${i}`, qui, text: { u: 'שלום' }, perComprovar: false })),
} as Text)

describe('veusDialeg', () => {
  it('dona i home tenen veus diferents', () => {
    const v = veusDialeg(dialeg(['דוריס', 'רוברטו']))
    expect(v.get('דוריס')).toBe(CARMIT)
    expect(v.get('רוברטו')).not.toBe(CARMIT)
  })
  it('tres homes al mateix diàleg: tres veus diferents', () => {
    const v = veusDialeg(dialeg(['יוסף', 'מורה', 'סטיב', 'עמנואל', 'תלמידים']))
    expect(new Set([v.get('יוסף'), v.get('סטיב'), v.get('עמנואל')]).size).toBe(3)
    expect(v.get('תלמידים')).toBe('cor')
  })
  it('personatges desconeguts alternen', () => {
    const v = veusDialeg(dialeg(['X', 'Y']))
    expect(v.get('X')).not.toBe(v.get('Y'))
  })
  it('un text que no és diàleg no té veus', () => {
    expect(veusDialeg({ ...dialeg(['X']), tipus: 'text' }).size).toBe(0)
  })
})

describe('filtreVeu i clau', () => {
  it('la Carmit no es transforma i conserva la clau d\'abans', () => {
    expect(filtreVeu(CARMIT)).toBeNull()
    expect(clauAudio('שלום', 'normal', CARMIT)).toBe(clauAudio('שלום', 'normal'))
  })
  it('una altra veu dona un altre fitxer', () => {
    expect(clauAudio('שלום', 'normal', 'f0.80')).not.toBe(clauAudio('שלום', 'normal'))
    expect(filtreVeu('f0.80')).toContain('asetrate')
  })
})
