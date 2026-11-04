import { useEffect, useRef, useState } from 'preact/hooks'
import type { Audio } from '../contingut/tipus'
import { BASE } from '../contingut/index'
import { reprodueix, VELOCITAT_LENTA } from './so'

type Props = {
  audio: Audio | undefined; /** Paraula o frase, per a l'etiqueta accessible. */ etiqueta?: string
  /** Sona tot sol en aparèixer (p. ex. a «Escolta i tria la paraula»). */ autoplay?: boolean
  /** Botó «lent» al costat: només per a frases llargues (les paraules no en porten). */ lent?: boolean
  /** Ms d'espera abans de l'autoplay (perquè no trepitgi el so d'encert). */ retard?: number
}

export function BotoSo({ audio, etiqueta, autoplay = false, lent = false, retard = 0 }: Props) {
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

  // Sona en aparèixer; si el navegador no ho deixa (NotAllowedError), el botó continua disponible.
  useEffect(() => {
    if (!autoplay || !audio) return
    if (!retard) { toca(audio.normal); return }
    const t = setTimeout(() => toca(audio.normal), retard)
    return () => clearTimeout(t)
  }, [autoplay, audio?.normal])

  return (
    <span class="so-grup">
      <audio ref={el} preload="none" onError={() => setFallat(true)} />
      <button type="button" class="so" aria-label={`Escolta${nom}`} disabled={inactiu}
        onClick={() => audio && toca(audio.normal)}>
        <i class="ph-duotone ph-speaker-high" aria-hidden="true" />
      </button>
      {lent && (
        <button type="button" class="so lent" aria-label={`Escolta lent${nom}`} disabled={inactiu}
          onClick={() => audio && toca(audio.normal, VELOCITAT_LENTA)}>
          lent
        </button>
      )}
    </span>
  )
}
