import { usePreferencies } from '../preferencies'

type PropsInterruptor = { actiu: boolean; alCanviar: () => void; etiqueta: string; que: string }

/** Interruptor compacte amb icona d'ull: obert si es veu, ratllat si està amagat. */
function Interruptor({ actiu, alCanviar, etiqueta, que }: PropsInterruptor) {
  return (
    <button type="button" class={`interruptor${actiu ? ' on' : ''}`} aria-pressed={actiu}
      title={`${actiu ? 'Amaga' : 'Mostra'} ${que}`} onClick={alCanviar}>
      <i class={`ph-duotone ${actiu ? 'ph-eye' : 'ph-eye-slash'}`} aria-hidden="true" />
      {etiqueta}
    </button>
  )
}

/** Vocals: un sol interruptor per a tota l'app (per defecte, amagades). */
export function BotoVocals() {
  const { vocals, setVocals } = usePreferencies()
  return <Interruptor actiu={vocals} alCanviar={() => setVocals(!vocals)} etiqueta="Vocals" que="les vocals" />
}

/** Transcripció: un sol interruptor per a tota l'app (per defecte, amagada). */
export function BotoTranslit() {
  const { translit, setTranslit } = usePreferencies()
  return <Interruptor actiu={translit} alCanviar={() => setTranslit(!translit)} etiqueta="Transcripció" que="la transcripció" />
}
