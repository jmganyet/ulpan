import { describe, it, expect } from 'vitest'
import { treuVocals, normalitza, iguals, teComprovar, senseComprovar, esNota } from './hebreu'

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
  it('esNota (R25): nota del transcriptor si la primera lletra és llatina', () => {
    expect(esNota('Esquema de la dreta (pregunta): של מי ← הַ ← [nom] ← ?')).toBe(true)
    expect(esNota('(nota sense hebreu)')).toBe(true)
    expect(esNota('שֶׁל מִי הַ...?')).toBe(false)
    expect(esNota('1. מאין המכונית? – ____אנגליה.')).toBe(false)
    expect(esNota('היום משה [requadre ratllat] בבית.')).toBe(false)
    expect(esNota('____')).toBe(false)
  })
})
