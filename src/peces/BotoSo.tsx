import { useRef, useState } from 'preact/hooks'
import type { Audio } from '../contingut/tipus'
import { BASE } from '../contingut/index'

export function BotoSo({ audio }: { audio: Audio | undefined }) {
  const el = useRef<HTMLAudioElement>(null)
  const [fallat, setFallat] = useState(false)
  const inactiu = !audio || fallat

  const toca = (fitxer: string) => {
    const a = el.current
    if (!a) return
    try {
      a.src = `${BASE}audio/${fitxer}`
      const r = a.play() as Promise<void> | undefined
      r?.catch?.(() => setFallat(true))
    } catch {
      setFallat(true)
    }
  }

  return (
    <span class="so-grup">
      <audio ref={el} preload="none" onError={() => setFallat(true)} />
      <button type="button" class="so" aria-label="Escolta" disabled={inactiu}
        onClick={() => audio && toca(audio.normal)}>
        <i class="ph-duotone ph-speaker-high" aria-hidden="true" />
      </button>
      <button type="button" class="so lent" aria-label="Escolta lent" disabled={inactiu}
        onClick={() => audio && toca(audio.lent)}>
        lent
      </button>
    </span>
  )
}
