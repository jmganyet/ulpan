import type { Exercici } from '../contingut/tipus'
import { Hebreu } from '../peces/Hebreu'
import { Opcions } from './Opcions'

type Props = { ex: Extract<Exercici, { tipus: 'conjugar' }>; onRespon: (encert: boolean) => void }

export function Conjugar({ ex, onRespon }: Props) {
  return (
    <div class="exercici">
      <p class="enunciat"><Hebreu valor={ex.base} classe="gran" /></p>
      <p class="petit">Tria la forma: {ex.demana}</p>
      <Opcions opcions={ex.opcions} correcta={ex.correcta} onRespon={onRespon} />
    </div>
  )
}
