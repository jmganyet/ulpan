import { useState } from 'preact/hooks'
import type { Exercici } from '../contingut/tipus'
import { Hebreu } from '../peces/Hebreu'
import { Opcions } from './Opcions'

type Props = { ex: Extract<Exercici, { tipus: 'forat' }>; onRespon: (encert: boolean) => void }

const FORAT = /_{2,}/

/** Triar la forma: frase amb un forat i opcions. */
export function Forat({ ex, onRespon }: Props) {
  const [respost, setRespost] = useState(false)
  const omple = (s: string | undefined) =>
    s === undefined ? undefined : s.replace(FORAT, respost ? ex.opcions[ex.correcta] : '＿＿＿')
  const frase = { ...ex.frase, u: omple(ex.frase.u)!, n: omple(ex.frase.n) }
  return (
    <div class="exercici">
      <p class="enunciat"><Hebreu valor={frase} classe="gran" /></p>
      <Opcions opcions={ex.opcions} correcta={ex.correcta} onRespon={(e) => { setRespost(true); onRespon(e) }} />
      {respost && <p class="retro">{ex.retro}</p>}
    </div>
  )
}
