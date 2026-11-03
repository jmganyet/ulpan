let actual: HTMLAudioElement | null = null

/** Reprodueix un fitxer; atura el que sonava abans (un sol so alhora a tota l'app). */
export function reprodueix(el: HTMLAudioElement, url: string): Promise<void> | undefined {
  if (actual && actual !== el) {
    try { actual.pause() } catch { /* res a aturar */ }
  }
  actual = el
  el.src = url
  return el.play() as Promise<void> | undefined
}
