import { Fragment } from 'preact'
import type { Hebreu as HebreuT } from '../contingut/tipus'
import { treuVocals } from '../hebreu'
import { usePreferencies } from '../preferencies'
import { Marques } from './Marques'

type Props = {
  valor: HebreuT; /** Força les vocals (vocabulari) sense mirar la preferència. */ sempreVocals?: boolean; classe?: string
  /** Mots que s'han de subratllar (es comparen sense vocals, i per tant valen amb vocals o sense). */
  subratllat?: string[]
}

const lletres = (s: string) => treuVocals(s).replace(/[^א-ת]/g, '')

/** Parteix el text en mots i subratlla els que hi ha a `clau` (la puntuació del voltant, no). */
function ambSubratllat(text: string, clau: Set<string>) {
  return text.split(/(\s+)/).map((tros, i) => {
    if (!clau.has(lletres(tros))) return tros
    const m = /^([^א-ת]*)(.*?)([^א-ת֑-ׇ]*)$/.exec(tros)!
    return <Fragment key={i}>{m[1]}<u>{m[2]}</u>{m[3]}</Fragment>
  })
}

export function Hebreu({ valor, sempreVocals, classe, subratllat }: Props) {
  const { vocals, lletra } = usePreferencies()
  const ambVocals = sempreVocals || vocals
  const text = ambVocals ? (valor.n ?? valor.u) : valor.u
  const clau = new Set((subratllat ?? []).flatMap((s) => s.split(/\s+/)).map(lletres).filter(Boolean))
  return (
    <>
      <span dir="rtl" lang="he" class={`${lletra} ${classe ?? ''}`.trim()}>{clau.size ? ambSubratllat(text, clau) : text}</span>
      {ambVocals && valor.n !== undefined && <Marques extra={valor.extraVocals} />}
    </>
  )
}
