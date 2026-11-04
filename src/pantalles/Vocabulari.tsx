import { useEffect } from 'preact/hooks'
import type { Unitat } from '../contingut/tipus'
import { TargetaParaula } from '../peces/TargetaParaula'
import { OpcionsLectura } from '../peces/OpcionsLectura'

type Props = { unitat: Unitat; alVeure?: (ids: string[]) => void }

export function Vocabulari({ unitat: u, alVeure }: Props) {
  useEffect(() => {
    alVeure?.(u.vocabulari.filter((p) => !p.perComprovar).map((p) => p.id))
  }, [u.id])
  return (
    <div>
      <header class="capcalera-unitat" style={{ background: u.color }}>
        <a class="enrere" href={`#/u/${u.id}`}>‹ {u.titol}</a>
        <h1>Vocabulari</h1>
      </header>
      <div class="eines-lectura"><OpcionsLectura ambTranslit /></div>
      <div class="targetes">
        {u.vocabulari.map((p) => <TargetaParaula key={p.id} paraula={p} color={u.color} />)}
      </div>
    </div>
  )
}
