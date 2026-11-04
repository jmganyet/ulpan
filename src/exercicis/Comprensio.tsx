import { useState } from 'preact/hooks'
import type { Exercici } from '../contingut/tipus'
import { Retorn } from './Retorn'
import { Opcions, TextMixt } from './Opcions'
import { BotoSo } from '../peces/BotoSo'

type Props = { ex: Extract<Exercici, { tipus: 'comprensio' }>; onRespon: (encert: boolean) => void }

export function Comprensio({ ex, onRespon }: Props) {
  const [encert, setEncert] = useState<boolean | null>(null)
  return (
    <div class="exercici">
      {/* Una rèplica per fila: el text es parteix pels guions de diàleg (—). */}
      <blockquote class="text-comprensio">
        {ex.text.split(/\s*—\s*/).filter(Boolean).map((r, i) => <p key={i} class="replica">{i > 0 || ex.text.trim().startsWith('—') ? '— ' : ''}<TextMixt s={r} /></p>)}
        <p class="so-comprensio"><BotoSo audio={ex.audio} etiqueta={ex.text} lent /></p>
      </blockquote>
      <p class="enunciat"><TextMixt s={ex.pregunta} /></p>
      <Opcions opcions={ex.opcions} correcta={ex.correcta} onRespon={(e) => { setEncert(e); onRespon(e) }} />
      {encert !== null && <Retorn encert={encert} sub="la correcta és la verda" />}
    </div>
  )
}
