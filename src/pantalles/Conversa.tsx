import { useMemo } from 'preact/hooks'
import type { Unitat } from '../contingut/tipus'
import { BlocText } from '../conversa/BlocText'
import { dependenciesAudio } from '../conversa/dependenciesAudio'
import type { Deps } from '../conversa/reproductor'

type Props = { unitat: Unitat; pag: string; /** Injectable als tests. */ deps?: Deps }

/** Tots els textos (blocs) d'una pàgina, cadascun amb el seu reproductor. */
export function Conversa({ unitat, pag, deps }: Props) {
  const reals = useMemo(() => deps ?? dependenciesAudio(), [deps])
  const blocs = unitat.textos.filter((t) => t.pagina === pag)
  return (
    <div class="conversa-pantalla" style={{ '--color-unitat': unitat.color } as never}>
      <header class="capcalera-unitat" style={{ background: unitat.color }}>
        <a class="enrere" href={`#/u/${unitat.id}`}>‹ {unitat.titol}</a>
        <h1>Pàg. {Number(pag.replace(/\D/g, ''))}</h1>
      </header>
      {blocs.length === 0 && <p class="petit">No hi ha cap text en aquesta pàgina.</p>}
      {blocs.map((t) => <BlocText key={t.id} text={t} deps={reals} />)}
    </div>
  )
}
