import { urlAudio } from './audioBlob'

let actual: HTMLAudioElement | null = null
let torn = 0 // cada crida i cada aturada en treuen un de nou; una baixada antiga no pot sonar

/** Velocitat del botó «lent». La veu Carmit gairebé no s'alenteix en generar l'àudio, i per això
 *  s'alenteix en reproduir-lo, sense canviar el to. */
export const VELOCITAT_LENTA = 0.7

/** Reprodueix un fitxer a la velocitat donada; atura el que sonava abans (un sol so alhora a tota l'app). */
export async function reprodueix(el: HTMLAudioElement, url: string, velocitat = 1): Promise<void> {
  const meu = ++torn
  if (actual && actual !== el) {
    try { actual.pause() } catch { /* res a aturar */ }
  }
  actual = el
  const blob = await urlAudio(url)
  if (meu !== torn) return // una crida més nova o aturaSo() ha pres el torn mentre es baixava
  el.src = blob
  // Carregar una font nova torna la velocitat a defaultPlaybackRate: es fixen totes dues.
  el.defaultPlaybackRate = velocitat
  el.playbackRate = velocitat
  el.preservesPitch = true
  await el.play()
}

/** Atura el so que soni (si n'hi ha) i anul·la les reproduccions pendents. */
export function aturaSo(): void {
  torn++
  try { actual?.pause() } catch { /* res a aturar */ }
}
