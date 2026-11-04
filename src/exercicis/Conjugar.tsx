import { useState } from 'preact/hooks'
import type { Exercici } from '../contingut/tipus'
import { AmbHebreu, Retorn } from './Retorn'
import { Hebreu } from '../peces/Hebreu'
import { Opcions } from './Opcions'
import { BotoSo } from '../peces/BotoSo'

type Props = { ex: Extract<Exercici, { tipus: 'conjugar' }>; onRespon: (encert: boolean) => void }

export function Conjugar({ ex, onRespon }: Props) {
  const [encert, setEncert] = useState<boolean | null>(null)
  return (
    <div class="exercici">
      <p class="enunciat"><Hebreu valor={ex.base} classe="gran" /> <BotoSo audio={ex.audio} etiqueta={ex.base.u} /></p>
      <p class="petit">Tria la forma: <AmbHebreu s={ex.demana} /></p>
      <Opcions opcions={ex.opcions} correcta={ex.correcta} onRespon={(e) => { setEncert(e); onRespon(e) }} />
      {encert !== null && <Retorn encert={encert} sub="la correcta és la verda" />}
    </div>
  )
}
