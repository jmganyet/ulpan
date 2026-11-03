import { urlAudio } from './audioBlob'

let actual: HTMLAudioElement | null = null

/** Reprodueix un fitxer; atura el que sonava abans (un sol so alhora a tota l'app). */
export async function reprodueix(el: HTMLAudioElement, url: string): Promise<void> {
  if (actual && actual !== el) {
    try { actual.pause() } catch { /* res a aturar */ }
  }
  actual = el
  const blob = await urlAudio(url)
  if (actual !== el) return // un altre so ha pres el torn mentre es baixava
  el.src = blob
  await el.play()
}

/** Atura el so que soni (si n'hi ha). */
export function aturaSo(): void {
  try { actual?.pause() } catch { /* res a aturar */ }
}
