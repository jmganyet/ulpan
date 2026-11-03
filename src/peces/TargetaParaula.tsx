import type { Paraula } from '../contingut/tipus'
import { treuVocals } from '../hebreu'
import { BotoSo } from './BotoSo'
import { Icona } from './Icona'
import { Marques } from './Marques'

export function TargetaParaula({ paraula: p, color }: { paraula: Paraula; color: string }) {
  return (
    <article class="targeta" style={{ '--color': color } as never}>
      {!p.funcio && (
        <div class="plafo" style={{ background: color }}>
          {p.icona && <Icona nom={p.icona} />}
        </div>
      )}
      <div class="targeta-cos">
        <div class="hebreu-vocals">
          <span dir="rtl" lang="he" class="quadrada gran">{p.hebreu}</span>
        </div>
        <div><span dir="rtl" lang="he" class="cursiva">{treuVocals(p.hebreu)}</span></div>
        <div class="translit">{p.translit}</div>
        <div class="ca">{p.ca}</div>
        <div class="targeta-peu">
          <Marques extra={p.extra} perComprovar={p.perComprovar} />
          {!p.perComprovar && <BotoSo audio={p.audio} etiqueta={p.hebreu} />}
        </div>
      </div>
    </article>
  )
}
