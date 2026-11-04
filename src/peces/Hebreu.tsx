import { Fragment, type ComponentChildren } from 'preact'
import type { Hebreu as HebreuT } from '../contingut/tipus'
import { treuVocals } from '../hebreu'
import { usePreferencies, type Lletra } from '../preferencies'
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

/** Text hebreu en la lletra triada; amb «totes dues», la quadrada i, a sota, la cursiva. */
export function EnLletra({ lletra, classe, children }: { lletra: Lletra; classe?: string; children: ComponentChildren }) {
  if (lletra === 'dues') {
    return (
      <span dir="rtl" lang="he" class={`dues ${classe ?? ''}`.trim()}>
        <span class="quadrada">{children}</span>
        <span class="cursiva" aria-hidden="true">{children}</span>
      </span>
    )
  }
  return <span dir="rtl" lang="he" class={`${lletra} ${classe ?? ''}`.trim()}>{children}</span>
}

export function Hebreu({ valor, sempreVocals, classe, subratllat }: Props) {
  const { vocals, lletra } = usePreferencies()
  const ambVocals = sempreVocals || vocals
  const text = ambVocals ? (valor.n ?? valor.u) : valor.u
  const clau = new Set((subratllat ?? []).flatMap((s) => s.split(/\s+/)).map(lletres).filter(Boolean))
  return (
    <>
      <EnLletra lletra={lletra} classe={classe}>{clau.size ? ambSubratllat(text, clau) : text}</EnLletra>
      {ambVocals && valor.n !== undefined && <Marques extra={valor.extraVocals} />}
    </>
  )
}
