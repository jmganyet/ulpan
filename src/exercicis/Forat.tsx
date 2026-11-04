import { useState } from 'preact/hooks'
import type { Exercici } from '../contingut/tipus'
import { Hebreu } from '../peces/Hebreu'
import { Opcions } from './Opcions'
import { BotoSo } from '../peces/BotoSo'
import { RETARD_ENCERT } from '../peces/sonsResposta'

type Props = { ex: Extract<Exercici, { tipus: 'forat' }>; onRespon: (encert: boolean) => void }

const FORAT = /_{3,}/

/** Triar la forma: frase amb un forat i opcions. */
export function Forat({ ex, onRespon }: Props) {
  const [respost, setRespost] = useState(false)
  const [encert, setEncert] = useState(false)
  const omple = (s: string | undefined) =>
    s === undefined ? undefined : s.replace(FORAT, respost ? ex.opcions[ex.correcta] : '＿＿＿')
  const frase = { ...ex.frase, u: omple(ex.frase.u)!, n: omple(ex.frase.n) }
  return (
    <div class="exercici">
      <p class="enunciat"><Hebreu valor={frase} classe="gran" /></p>
      <Opcions opcions={ex.opcions} correcta={ex.correcta} onRespon={(e) => { setRespost(true); setEncert(e); onRespon(e) }} />
      {/* La frase sencera, quan ja s'ha respost (abans regalaria la resposta); si l'encertes, sona sola. */}
      {respost && (
        <div class={`retro ${encert ? 'bona' : 'dolenta'}`} role="status">
          <span class="retro-cap">{encert ? <><i class="ph-duotone ph-check-circle" aria-hidden="true" /> Correcte</> : <><i class="ph-duotone ph-x-circle" aria-hidden="true" /> Incorrecte<span class="retro-sub"> · la resposta correcta és:</span></>}</span>
          <span class="model"><Hebreu valor={frase} /> <BotoSo audio={ex.audio} etiqueta={ex.frase.u} autoplay={encert} retard={RETARD_ENCERT} lent /></span>
          {ex.retro && <span class="retro-nota">{ex.retro}</span>}
        </div>
      )}
    </div>
  )
}
