import { useState } from 'preact/hooks'
import type { Exercici } from '../contingut/tipus'
import { Hebreu } from '../peces/Hebreu'
import { BotoSo } from '../peces/BotoSo'

type Props = { ex: Extract<Exercici, { tipus: 'autocorreccio' }>; onRespon: (encert: boolean) => void }

/** Fas l'exercici pel teu compte, veus el model i et puntues tu. */
export function Autocorreccio({ ex, onRespon }: Props) {
  const [model, setModel] = useState(false)
  const [fet, setFet] = useState(false)
  const puntua = (e: boolean) => { if (!fet) { setFet(true); onRespon(e) } }
  return (
    <div class="exercici">
      <p class="enunciat"><Hebreu valor={ex.enunciat} classe="gran" /></p>
      {!model && <button type="button" class="btn clar" onClick={() => setModel(true)}>Mostra el model</button>}
      {model && (
        <>
          <p class="model"><span class="petit">Model</span><br /><Hebreu valor={ex.model} classe="gran" /> <BotoSo audio={ex.audio} etiqueta={ex.model.u} autoplay lent /></p>
          <div class="duo">
            <button type="button" class="btn clar" disabled={fet} onClick={() => puntua(true)}>L'he encertat</button>
            <button type="button" class="btn clar" disabled={fet} onClick={() => puntua(false)}>M'he equivocat</button>
          </div>
        </>
      )}
    </div>
  )
}
