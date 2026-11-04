import { mkdtempSync, existsSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { clauAudio } from './audio-clau'
import { VEU_BASE } from './veus'
import { itemsAudibles, textAudible, generaAudio, afegeixAudio } from './genera-audio'
import type { Unitat } from '../src/contingut/tipus'

const lin = (id: string, u: string, extra: object = {}) => ({ id, text: { u }, perComprovar: false, ...extra })
const u: Unitat = {
  id: 'u01', num: 1, titol: 't', color: '#000', pagines: [],
  vocabulari: [
    { id: 'u01-0', hebreu: 'שָׁלוֹם', translit: '', ca: '', pagina: 'p', funcio: false, extra: false, perComprovar: false },
    { id: 'u01-1', hebreu: 'מה', translit: '', ca: '', pagina: 'p', funcio: false, extra: false, perComprovar: true },
  ],
  gramatica: [{ id: 'g', titol: '', explicacio: '', extra: false, exemples: [lin('g0', 'אני', { text: { u: 'אני', n: 'אֲנִי' } })] }],
  textos: [{
    id: 't', pagina: 'p', titol: { u: 'כותרת', ca: '', perComprovar: false }, tipus: 'text',
    linies: [lin('l0', 'שלום'), lin('l1', 'מה', { perComprovar: true }), lin('l2', 'שלום ____ טוב'), lin('l3', 'x', { text: { u: 'x', n: 'אֶקְס' } }), lin('l4', 'Esquema: של מי', { nota: true })],
  }],
  exercicis: [],
}

describe('clauAudio', () => {
  it('és determinista, 12 hex + .m4a, i diferent per velocitat', () => {
    expect(clauAudio('שלום', 'normal')).toBe(clauAudio('שלום', 'normal'))
    expect(clauAudio('שלום', 'normal')).toMatch(/^[0-9a-f]{12}\.m4a$/)
    expect(clauAudio('שלום', 'normal')).not.toBe(clauAudio('שלום', 'lent'))
  })
})

describe('itemsAudibles', () => {
  const textos = itemsAudibles(u).map((i) => i.text)
  it('exclou perComprovar, notes del transcriptor (R25), buits ____ i títols', () => {
    expect(textos).toEqual(['שָׁלוֹם', 'שלום', 'אֶקְס', 'אֲנִי'])
  })
  it('fa servir n si n\'hi ha', () => {
    expect(textAudible({ u: 'x', n: 'אֶקְס' })).toBe('אֶקְס')
    expect(textAudible({ u: 'x' })).toBe('x')
  })
})

describe('generaAudio', () => {
  it('genera només la velocitat normal, salta els existents i usa el runner', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'aud-'))
    const trucades: string[] = []
    const runner = async (text: string, vel: 'normal' | 'lent', dest: string) => { trucades.push(`${vel}:${text}`); writeFileSync(dest, 'x') }
    writeFileSync(join(dir, clauAudio('שלום', 'normal')), 'x')
    const r = await generaAudio([{ text: 'שלום' }, { text: 'שלום' }, { text: 'אני' }], dir, runner, 2)
    expect(trucades.sort()).toEqual(['normal:אני'])
    expect(r).toEqual({ generats: 1, existents: 1 })
    expect(existsSync(join(dir, clauAudio('אני', 'normal')))).toBe(true)
  })
})

describe('generaAudio errors', () => {
  it('si el runner falla, propaga l\'error i no deixa cap fitxer (ni .part)', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'aud-'))
    const runner = async (_t: string, _v: 'normal' | 'lent', dest: string) => { writeFileSync(dest, 'a mitges'); throw new Error('afconvert ha fallat') }
    await expect(generaAudio([{ text: 'שלום' }, { text: 'אני' }], dir, runner, 1)).rejects.toThrow('afconvert ha fallat')
    expect(readdirSync(dir)).toEqual([])
  })
})

describe('afegeixAudio', () => {
  it('només si el fitxer existeix, amb la veu de base (el lent és el mateix fitxer)', () => {
    const ok = clauAudio('שָׁלוֹם', 'normal', VEU_BASE)
    const r = afegeixAudio(u, (f) => f === ok)
    expect(r.vocabulari[0].audio).toEqual({ normal: ok, lent: ok })
    expect(r.textos[0].linies[0].audio).toBeUndefined()
    expect(r.vocabulari[1].audio).toBeUndefined()
  })
})
