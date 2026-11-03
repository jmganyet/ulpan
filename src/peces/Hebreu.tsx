import type { Hebreu as HebreuT } from '../contingut/tipus'
import { usePreferencies } from '../preferencies'
import { Marques } from './Marques'

type Props = { valor: HebreuT; /** Força les vocals (vocabulari) sense mirar la preferència. */ sempreVocals?: boolean; classe?: string }

export function Hebreu({ valor, sempreVocals, classe }: Props) {
  const { vocals, lletra } = usePreferencies()
  const ambVocals = sempreVocals || vocals
  const text = ambVocals ? (valor.n ?? valor.u) : valor.u
  return (
    <>
      <span dir="rtl" lang="he" class={`${lletra} ${classe ?? ''}`.trim()}>{text}</span>
      {ambVocals && valor.n !== undefined && <Marques extra={valor.extraVocals} />}
    </>
  )
}
