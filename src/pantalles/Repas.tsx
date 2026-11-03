import { useEffect, useState } from 'preact/hooks'
import { carregaUnitat, type EntradaIndex } from '../contingut/index'
import type { Unitat } from '../contingut/tipus'
import type { Progres } from '../progres/srs'
import { SessioPantalla } from '../exercicis/SessioPantalla'
import { sessioRepas, type Pas } from '../exercicis/sessio'

type Props = {
  index: EntradaIndex[]; progres: Progres; canvia: (p: Progres) => void
  minuts?: number; ara?: number; carrega?: (id: string) => Promise<Unitat>
}

type Estat = { unitats: Unitat[]; passos: Pas[] } | { error: string } | null

export function Repas({ index, progres, canvia, minuts = 5, ara = Date.now(), carrega = carregaUnitat }: Props) {
  const [estat, setEstat] = useState<Estat>(null)
  useEffect(() => {
    let viu = true
    Promise.all(index.map((u) => carrega(u.id))).then(
      (unitats) => viu && setEstat({ unitats, passos: sessioRepas(unitats, progres, ara, minuts) }),
      (e: Error) => viu && setEstat({ error: e.message }),
    )
    return () => { viu = false }
  }, [])
  if (!estat) return <p class="petit">Carregant…</p>
  if ('error' in estat) return <p class="avis error" role="alert">{estat.error}</p>
  if (estat.passos.length === 0) {
    return (
      <div class="sessio">
        <a class="enrere" href="#/">‹ Inici</a>
        <h1>Repàs ràpid</h1>
        <p class="avis">Res per repassar ara mateix. Mira el vocabulari d'alguna unitat per començar.</p>
      </div>
    )
  }
  return <SessioPantalla titol="Repàs ràpid" color="#1f2430" enrere="#/" passos={estat.passos} unitats={estat.unitats}
    progres={progres} canvia={canvia} />
}
