import { useState } from 'preact/hooks'
import { treuVocals } from '../hebreu'
import { usePreferencies } from '../preferencies'
import { EnLletra } from '../peces/Hebreu'

const esHebreu = (s: string) => /[֐-׿]/.test(s)

/** Text d'una opció o enunciat: hebreu a la dreta, amb vocals només si es demanen; si no, català. */
export function TextMixt({ s }: { s: string }) {
  const { vocals, lletra } = usePreferencies()
  if (!esHebreu(s)) return <span>{s}</span>
  return <EnLletra lletra={lletra}>{vocals ? s : treuVocals(s)}</EnLletra>
}

type Props = {
  opcions: string[]; correcta: number; onRespon: (encert: boolean) => void
  /** Si no hi ha opció triada, res; si n'hi ha, quin és l'índex (per al component pare). */
  alTriar?: (i: number) => void
}

/** Llista d'opcions que respon una sola vegada i en marca la bona i la dolenta. */
export function Opcions({ opcions, correcta, onRespon, alTriar }: Props) {
  const [triada, setTriada] = useState<number | null>(null)
  const tria = (i: number) => {
    if (triada !== null) return
    setTriada(i)
    alTriar?.(i)
    onRespon(i === correcta)
  }
  return (
    <div class="opcions">
      {opcions.map((o, i) => {
        const estat = triada === null ? '' : i === correcta ? 'bona' : i === triada ? 'dolenta' : ''
        return (
          <button type="button" key={i} class={`opcio ${estat}`.trim()} disabled={triada !== null && estat === ''}
            aria-pressed={triada === i} onClick={() => tria(i)}>
            <TextMixt s={o} />
          </button>
        )
      })}
    </div>
  )
}
