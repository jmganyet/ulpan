import type { Unitat } from '../contingut/tipus'
import { Hebreu } from '../peces/Hebreu'
import { BotoSo } from '../peces/BotoSo'
import { Marques } from '../peces/Marques'

export function Gramatica({ unitat: u, n }: { unitat: Unitat; n: string }) {
  const k = Number(n)
  const punt = Number.isInteger(k) ? u.gramatica[k - 1] : undefined
  const base = `#/u/${u.id}`
  if (!punt) {
    return (
      <div class="aviat">
        <a class="enrere" href={base}>‹ {u.titol}</a>
        <p class="avis">Aquest punt de gramàtica no existeix.</p>
      </div>
    )
  }
  return (
    <div class="gramatica">
      <header class="capcalera-unitat" style={{ background: u.color }}>
        <a class="enrere" href={base}>‹ {u.titol}</a>
        <h1>{punt.titol}</h1>
        <span class="petit blanc">Gramàtica {k}/{u.gramatica.length}</span>
      </header>
      <p class="explicacio">{punt.explicacio}<Marques extra={punt.extra} /></p>
      <ul class="exemples">
        {punt.exemples.map((l) => (
          <li key={l.id}>
            <Hebreu valor={l.text} classe="gran" subratllat={l.subratllat} />
            <Marques extra={l.extra} perComprovar={l.perComprovar} />
            {l.ca && <span class="ca">{l.ca}</span>}
            {!l.perComprovar && <BotoSo audio={l.audio} etiqueta={l.text.u} />}
          </li>
        ))}
      </ul>
      <a class="btn" href={`${base}/exercicis`}>Practica-ho</a>
      <nav class="duo">
        {k > 1 ? <a class="btn clar" href={`${base}/gramatica/${k - 1}`}>‹ Anterior</a> : <span />}
        {k < u.gramatica.length ? <a class="btn clar" href={`${base}/gramatica/${k + 1}`}>Següent ›</a> : <span />}
      </nav>
    </div>
  )
}
