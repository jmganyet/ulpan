import { useState } from 'preact/hooks'
import type { Exercici } from '../contingut/tipus'
import { iguals } from '../hebreu'
import { TextMixt } from './Opcions'

type Props = { ex: Extract<Exercici, { tipus: 'construir' }>; onRespon: (encert: boolean) => void }

/** Construir frases: fitxes de dreta a esquerra; una sobra. */
export function Construir({ ex, onRespon }: Props) {
  const [col, setCol] = useState<number[]>([])
  const [resultat, setResultat] = useState<boolean | null>(null)
  const frase = (idx: number[]) => idx.map((i) => ex.fitxes[i]).join(' ')
  const bloquejat = resultat !== null
  const posa = (i: number) => { if (!bloquejat) setCol([...col, i]) }
  const treu = (i: number) => { if (!bloquejat) setCol(col.filter((x) => x !== i)) }
  const comprova = () => {
    const ok = iguals(frase(col), frase(ex.ordre))
    setResultat(ok)
    onRespon(ok)
  }
  return (
    <div class="exercici">
      <p class="enunciat">{ex.ca}</p>
      <div class="linia-construir" data-testid="linia" dir="rtl">
        {col.map((i) => (
          <button type="button" key={i} class="fitxa col" onClick={() => treu(i)}><TextMixt s={ex.fitxes[i]} /></button>
        ))}
      </div>
      <div class="fitxes" dir="rtl">
        {ex.fitxes.map((f, i) => !col.includes(i) && (
          <button type="button" key={i} class="fitxa" onClick={() => posa(i)}><TextMixt s={f} /></button>
        ))}
      </div>
      {!bloquejat && <button type="button" class="btn" disabled={col.length === 0} onClick={comprova}>Comprova</button>}
      {resultat === false && <p class="retro">La frase correcta: <span class="model"><TextMixt s={frase(ex.ordre)} /></span></p>}
    </div>
  )
}
