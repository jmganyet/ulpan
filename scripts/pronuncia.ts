// Què s'envia a la veu (edge-tts), que no sempre és el que es mostra a l'app.
// Triat d'orella a referencia/pronuncia/ el 2026-11-04:
// - Dins de les frases, la veu llegeix millor l'hebreu sense niqqud (amb niqqud deia «et» per at i errava hi).
// - Les paraules soles del vocabulari mantenen el niqqud, menys els pronoms que la veu llegia malament.
import { treuVocals } from '../src/hebreu'

/** Paraula sola amb niqqud → com l'ha d'escriure la veu perquè soni bé. */
export const PRONOMS: Record<string, string> = {
  'אַתְּ': 'אַת', // at: amb la shevà final deia «et»
  'אַתָּה': 'אתה', // ata
  'אַתֶּם': 'אתם', // atem
  'אַתֶּן': 'אתן', // aten
  'הִיא': 'הִיא', // hi: amb niqqud, totes dues veus; sense, l'Avri deia «ti»
}

/** Text que diu la veu per a una paraula (o diverses formes separades per comes) del vocabulari. */
export function pronunciaParaula(text: string): string {
  return text.split(/(,\s*)/).map((tros) => PRONOMS[tros.trim()] ?? tros).join('')
}

/** Text que diu la veu per a una línia de diàleg, text o exemple: sense niqqud. */
export function pronunciaFrase(text: string): string {
  return treuVocals(text)
}
