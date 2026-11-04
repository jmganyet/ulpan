import { useState } from 'preact/hooks'
import type { Exercici } from '../contingut/tipus'
import { frasesAcceptades, iguals } from '../hebreu'
import { TextMixt } from './Opcions'
import { BotoSo } from '../peces/BotoSo'
import { RETARD_ENCERT } from '../peces/sonsResposta'

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
    // Es compara l'ordre dels mots, no la puntuació (el punt va enganxat a una fitxa)
    const sensePunt = (t: string) => t.replace(/[.,?!]/g, '')
    const ok = frasesAcceptades(frase(ex.ordre)).some((f) => iguals(sensePunt(frase(col)), sensePunt(f)))
    setResultat(ok)
    onRespon(ok)
  }
  return (
    <div class="exercici">
      <p class="enunciat">{ex.ca}</p>
      <div class={`linia-construir${resultat === null ? '' : resultat ? ' bona' : ' dolenta'}`} data-testid="linia" dir="rtl">
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
      {resultat !== null && (
        <div class={`retro ${resultat ? 'bona' : 'dolenta'}`} role="status">
          <span class="retro-cap">{resultat ? <><i class="ph-duotone ph-check-circle" aria-hidden="true" /> Correcte</> : <><i class="ph-duotone ph-x-circle" aria-hidden="true" /> Incorrecte<span class="retro-sub"> · la frase correcta és:</span></>}</span>
          <span class="model"><TextMixt s={frase(ex.ordre)} /> <BotoSo audio={ex.audio} etiqueta={frase(ex.ordre)} autoplay={resultat} retard={RETARD_ENCERT} lent /></span>
        </div>
      )}
    </div>
  )
}
