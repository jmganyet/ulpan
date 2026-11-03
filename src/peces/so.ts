import { urlAudio } from './audioBlob'

let actual: HTMLAudioElement | null = null
let torn = 0 // cada crida i cada aturada en treuen un de nou; una baixada antiga no pot sonar

/** Reprodueix un fitxer; atura el que sonava abans (un sol so alhora a tota l'app). */
export async function reprodueix(el: HTMLAudioElement, url: string): Promise<void> {
  const meu = ++torn
  if (actual && actual !== el) {
    try { actual.pause() } catch { /* res a aturar */ }
  }
  actual = el
  const blob = await urlAudio(url)
  if (meu !== torn) return // una crida més nova o aturaSo() ha pres el torn mentre es baixava
  el.src = blob
  await el.play()
}

/** Atura el so que soni (si n'hi ha) i anul·la les reproduccions pendents. */
export function aturaSo(): void {
  torn++
  try { actual?.pause() } catch { /* res a aturar */ }
}
