import { useRef, useState } from 'preact/hooks'
import type { Audio } from '../contingut/tipus'
import { BASE } from '../contingut/index'
import { reprodueix, VELOCITAT_LENTA } from './so'

type Props = { audio: Audio | undefined; /** Paraula o frase, per a l'etiqueta accessible. */ etiqueta?: string }

export function BotoSo({ audio, etiqueta }: Props) {
  const el = useRef<HTMLAudioElement>(null)
  const [fallat, setFallat] = useState(false)
  const inactiu = !audio || fallat
  const nom = etiqueta ? ` ${etiqueta}` : ''

  const toca = (fitxer: string, velocitat = 1) => {
    const a = el.current
    if (!a) return
    try {
      const r = reprodueix(a, `${BASE}audio/${fitxer}`, velocitat)
      r?.catch?.((e: unknown) => {
        // Un toc ràpid (AbortError) o l'autoplay bloquejat (NotAllowedError) no vol dir que el fitxer falli.
        const n = (e as { name?: string })?.name
        if (n === 'AbortError' || n === 'NotAllowedError') return
        setFallat(true)
      })
    } catch {
      setFallat(true)
    }
  }

  return (
    <span class="so-grup">
      <audio ref={el} preload="none" onError={() => setFallat(true)} />
      <button type="button" class="so" aria-label={`Escolta${nom}`} disabled={inactiu}
        onClick={() => audio && toca(audio.normal)}>
        <i class="ph-duotone ph-speaker-high" aria-hidden="true" />
      </button>
      <button type="button" class="so lent" aria-label={`Escolta lent${nom}`} disabled={inactiu}
        onClick={() => audio && toca(audio.normal, VELOCITAT_LENTA)}>
        lent
      </button>
    </span>
  )
}
