import type { Paraula } from '../contingut/tipus'
import { textParaula } from '../contingut/formes'
import { treuVocals } from '../hebreu'
import { BotoSo } from './BotoSo'
import { Icona } from './Icona'
import { Marques } from './Marques'

/** `vocals` i `translit` (per defecte, sí): a les sessions segueixen els botons «Mostra les vocals» i «Mostra la transcripció». */
export function TargetaParaula({ paraula: p, color, vocals = true, translit = true }: { paraula: Paraula; color: string; vocals?: boolean; translit?: boolean }) {
  return (
    <article class="targeta" style={{ '--color': color } as never}>
      {!p.funcio && (
        <div class="plafo" style={{ background: color }}>
          {p.icona && <Icona nom={p.icona} />}
        </div>
      )}
      <div class="targeta-cos">
        <div class="hebreu-vocals">
          <span dir="rtl" lang="he" class="quadrada gran">{vocals ? textParaula(p) : treuVocals(textParaula(p))}</span>
        </div>
        <div><span dir="rtl" lang="he" class="cursiva">{treuVocals(textParaula(p))}</span></div>
        {translit && <div class="translit">{p.translit}</div>}
        <div class="ca">{p.ca}</div>
        <div class="targeta-peu">
          <Marques extra={p.extra} perComprovar={p.perComprovar} />
          {!p.perComprovar && <BotoSo audio={p.audio} etiqueta={p.hebreu} />}
        </div>
      </div>
    </article>
  )
}
