import { useState } from 'preact/hooks'
import type { Unitat } from '../contingut/tipus'
import type { Progres } from '../progres/srs'
import { SessioPantalla } from '../exercicis/SessioPantalla'
import { sessioUnitat } from '../exercicis/sessio'

type Props = { unitat: Unitat; progres: Progres; canvia: (p: Progres) => void }

export function Exercicis({ unitat: u, progres, canvia }: Props) {
  const [passos] = useState(() => sessioUnitat(u, progres))
  if (passos.length === 0) {
    return (
      <div class="sessio">
        <a class="enrere" href={`#/u/${u.id}`}>‹ {u.titol}</a>
        <h1>Exercicis</h1>
        <p class="avis">No hi ha res per practicar en aquesta unitat ara mateix.</p>
      </div>
    )
  }
  return <SessioPantalla titol={`Exercicis · ${u.titol}`} color={u.color} enrere={`#/u/${u.id}`} passos={passos}
    unitats={[u]} progres={progres} canvia={canvia} />
}
