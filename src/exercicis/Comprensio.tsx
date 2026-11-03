import type { Exercici } from '../contingut/tipus'
import { Opcions, TextMixt } from './Opcions'

type Props = { ex: Extract<Exercici, { tipus: 'comprensio' }>; onRespon: (encert: boolean) => void }

export function Comprensio({ ex, onRespon }: Props) {
  return (
    <div class="exercici">
      <blockquote class="text-comprensio"><TextMixt s={ex.text} /></blockquote>
      <p class="enunciat"><TextMixt s={ex.pregunta} /></p>
      <Opcions opcions={ex.opcions} correcta={ex.correcta} onRespon={onRespon} />
    </div>
  )
}
