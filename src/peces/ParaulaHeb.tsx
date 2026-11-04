import type { Paraula } from '../contingut/tipus'
import { textParaula } from '../contingut/formes'
import { treuVocals } from '../hebreu'
import { usePreferencies } from '../preferencies'

type Props = {
  paraula: Paraula
  /** Força el niqqud (vocabulari) o el treu; si no es diu, segueix la preferència. */ vocals?: boolean
  /** Mostra la transcripció si la preferència és activa (no a les opcions d'un exercici, que la regalarien). */ ambTranslit?: boolean
}

/** Una paraula en la lletra triada al full d'opcions (quadrada, cursiva o totes dues) i, si cal, amb la transcripció. */
export function ParaulaHeb({ paraula: p, vocals, ambTranslit = true }: Props) {
  const pref = usePreferencies()
  const niqqud = vocals ?? pref.vocals
  const text = niqqud ? textParaula(p) : treuVocals(textParaula(p))
  return (
    <span class="paraula-heb">
      {pref.lletra !== 'cursiva' && <span dir="rtl" lang="he" class="quadrada gran">{text}</span>}
      {pref.lletra !== 'quadrada' && <span dir="rtl" lang="he" class={`cursiva${pref.lletra === 'cursiva' ? ' gran' : ''}`}>{text}</span>}
      {ambTranslit && pref.translit && <span class="translit">{p.translit}</span>}
    </span>
  )
}
