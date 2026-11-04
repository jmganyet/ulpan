import type { Paraula } from '../contingut/tipus'
import { BotoSo } from './BotoSo'
import { Icona } from './Icona'
import { Marques } from './Marques'
import { ParaulaHeb } from './ParaulaHeb'

/** `vocals` (per defecte, sí): a les sessions segueix el niqqud del full d'opcions. Lletra i transcripció, sempre les del full. */
export function TargetaParaula({ paraula: p, color, vocals = true }: { paraula: Paraula; color: string; vocals?: boolean }) {
  return (
    <article class="targeta" style={{ '--color': color } as never}>
      {!p.funcio && (
        <div class="plafo" style={{ background: color }}>
          {p.icona && <Icona nom={p.icona} />}
        </div>
      )}
      <div class="targeta-cos">
        <ParaulaHeb paraula={p} vocals={vocals} />
        <div class="ca">{p.ca}</div>
        <div class="targeta-peu">
          <Marques extra={p.extra} perComprovar={p.perComprovar} />
          {!p.perComprovar && <BotoSo audio={p.audio} etiqueta={p.hebreu} />}
        </div>
      </div>
    </article>
  )
}
