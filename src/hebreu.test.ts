import { describe, it, expect } from 'vitest'
import { treuVocals, normalitza, iguals, teComprovar, senseComprovar } from './hebreu'

describe('hebreu', () => {
  it('treuVocals', () => {
    expect(treuVocals('כִּיתָּה')).toBe('כיתה')
    expect(treuVocals('בִּדְרוֹם־אֲמֶרִיקָה')).toBe('בדרום־אמריקה')
    expect(treuVocals('')).toBe('')
  })
  it('iguals', () => {
    expect(iguals('בַּבַּיִת', 'בבית')).toBe(true)
    expect(iguals('דרום-אמריקה', 'דְּרוֹם־אֲמֶרִיקָה')).toBe(true)
    expect(iguals(' אני  גר ', 'אני גר')).toBe(true)
    expect(iguals('בבית', 'לבית')).toBe(false)
    expect(iguals('', '  ')).toBe(true)
  })
  it('normalitza', () => {
    expect(normalitza('דרום-אמריקה')).toBe('דרום אמריקה')
  })
  it('per comprovar', () => {
    expect(teComprovar('מִבְּרָזִיל ⁇?')).toBe(true)
    expect(teComprovar('מברזיל')).toBe(false)
    expect(senseComprovar('מִבְּרָזִיל ⁇?')).toBe('מִבְּרָזִיל?')
    expect(senseComprovar('אני ⁇ גר')).toBe('אני גר')
    expect(senseComprovar('')).toBe('')
  })
})
