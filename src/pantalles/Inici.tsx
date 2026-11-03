import type { EntradaIndex } from '../contingut/index'
import { idConegut } from '../contingut/index'
import { pendents, type Progres } from '../progres/srs'

type Props = { index: EntradaIndex[]; progres: Progres; ara?: number }

export function percentVist(u: EntradaIndex, p: Progres): number {
  if (u.paraules === 0) return 0
  const vistes = Object.keys(p.vist).filter((k) => k.startsWith(`${u.id}-`)).length
  return Math.min(100, Math.round((vistes / u.paraules) * 100))
}

export function Inici({ index, progres, ara = Date.now() }: Props) {
  const venc = pendents(progres, ara).filter((id) => idConegut(id, index))
  const darrera = progres.darrera && index.find((u) => u.id === progres.darrera!.unitat)
  return (
    <div class="inici">
      <section class="gran-bloc">
        <div class="petit">Repàs ràpid</div>
        <div class="x">5 minuts</div>
        <div class="petit">{venc.length === 0 ? 'Res per repassar ara mateix' : `${venc.length} per repassar`}</div>
        <a class="btn clar" href="#/repas">Comença</a>
      </section>
      {darrera && (
        <a class="continua" href={`#/u/${darrera.id}/${progres.darrera!.pas}`}>
          <span class="pastilla" style={{ background: darrera.color }} />
          <span class="continua-text">
            <span class="petit">On ho vas deixar</span>
            <strong>{darrera.num} · {darrera.titol}</strong>
          </span>
        </a>
      )}
      <section class="temari">
        <h2 class="petit">Temari</h2>
        {index.map((u) => (
          <a class="unitat" href={`#/u/${u.id}`} key={u.id}>
            <span class="pt" style={{ background: u.color }} />
            <span class="nom">{u.num} · {u.titol}</span>
            <span class="barra"><b style={{ width: `${percentVist(u, progres)}%`, background: u.color }} /></span>
          </a>
        ))}
      </section>
      <p class="petit"><a href="#/alefat">Alefat</a></p>
    </div>
  )
}
