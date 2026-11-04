import { describe, it, expect } from 'vitest'
import { veusDialeg, componentsVeu, CARMIT } from './veus'
import { clauAudio } from './audio-clau'
import type { Text } from '../src/contingut/tipus'

const dialeg = (personatges: string[]): Text => ({
  id: 't', pagina: '1', titol: { u: '', ca: '', perComprovar: false }, tipus: 'dialeg', personatges,
  linies: personatges.map((qui, i) => ({ id: `l${i}`, qui, text: { u: 'שלום' }, perComprovar: false })),
} as Text)

describe('veusDialeg', () => {
  it('dona i home tenen veus diferents', () => {
    const v = veusDialeg(dialeg(['דוריס', 'רוברטו']))
    expect(v.get('דוריס')).toMatch(/Hila/)
    expect(v.get('רוברטו')).toMatch(/Avri/)
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

describe('componentsVeu i clau', () => {
  it('la Carmit no es transforma i conserva la clau d\'abans', () => {
    expect(componentsVeu(CARMIT)).toBeNull()
    expect(clauAudio('שלום', 'normal', CARMIT)).toBe(clauAudio('שלום', 'normal'))
  })
  it('una altra veu dona un altre fitxer', () => {
    expect(clauAudio('שלום', 'normal', 'ms:Avri:+0Hz')).not.toBe(clauAudio('שלום', 'normal'))
    expect(componentsVeu('ms:Avri:-12Hz')).toEqual([{ nom: 'he-IL-AvriNeural', to: '-12Hz', retard: 0 }])
    expect(componentsVeu('cor')).toHaveLength(3)
  })
})

import { pronunciaFrase, pronunciaParaula } from './pronuncia'
describe('pronúncia (què s\'envia a la veu)', () => {
  it('els pronoms del vocabulari es diuen amb la grafia triada; la resta, amb niqqud', () => {
    expect(pronunciaParaula('אַתְּ')).toBe('אַת')
    expect(pronunciaParaula('אַתָּה')).toBe('אתה')
    expect(pronunciaParaula('הוּא, הִיא')).toBe('הוּא, הִיא')
    expect(pronunciaParaula('שָׁלוֹם')).toBe('שָׁלוֹם')
  })
  it('les frases van sense niqqud', () => {
    expect(pronunciaFrase('שָׂרָה, אַתְּ תַּלְמִידָה?')).toBe('שרה, את תלמידה?')
  })
})
