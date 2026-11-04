import { useMemo, useState } from 'preact/hooks'
import type { Paraula } from '../contingut/tipus'
import { textParaula } from '../contingut/formes'
import { treuVocals } from '../hebreu'
import { BotoSo } from '../peces/BotoSo'
import { usePreferencies } from '../preferencies'
import { Icona } from '../peces/Icona'
import { barreja, opcionsDistractores, teIcona, type Rng, type TipusParaula } from './sessio'

type Props = {
  paraula: Paraula; totes: Paraula[]; color: string
  tipus: Exclude<TipusParaula, 'paraula-nova'>; onRespon: (encert: boolean) => void; rng?: Rng
}

const filtre = (tipus: Props['tipus']) =>
  tipus === 'so-paraula' ? (p: Paraula) => !!p.audio
  : tipus === 'traduccio' ? () => true
  : teIcona

// La paraula en quadrada (amb vocals si el botó «Mostra les vocals» és actiu) i, a sota, en cursiva sense vocals.
const Hebr = ({ p }: { p: Paraula }) => {
  const { vocals } = usePreferencies()
  return (
    <span class="dues-lletres">
      <span dir="rtl" lang="he" class="quadrada gran">{vocals ? textParaula(p) : treuVocals(textParaula(p))}</span>
      <span dir="rtl" lang="he" class="cursiva">{treuVocals(textParaula(p))}</span>
    </span>
  )
}

/** Pregunta sobre una paraula: tria la imatge, tria la paraula (per imatge o per so) o tria la traducció. */
export function TriaImatge({ paraula: p, totes, color, tipus, onRespon, rng }: Props) {
  const { translit } = usePreferencies()
  const opcions = useMemo(
    () => barreja([p, ...opcionsDistractores(p, totes, 3, rng, filtre(tipus))], rng),
    [p.id, tipus],
  )
  const [triada, setTriada] = useState<string | null>(null)
  const tria = (id: string) => {
    if (triada !== null) return
    setTriada(id)
    onRespon(id === p.id)
  }
  const estat = (id: string) => (triada === null ? '' : id === p.id ? 'bona' : id === triada ? 'dolenta' : '')
  const enunciat =
    tipus === 'tria-imatge' ? <><p class="petit">Quina imatge és?</p><p class="enunciat"><Hebr p={p} /></p></>
    : tipus === 'imatge-paraula' ? <><p class="petit">Quina paraula és?</p><div class="plafo gran-plafo" style={{ background: color }}><Icona nom={p.icona!} /></div></>
    : tipus === 'so-paraula' ? <><p class="petit">Escolta i tria la paraula</p><p class="enunciat"><BotoSo audio={p.audio} etiqueta={p.ca} autoplay /></p></>
    : <><p class="petit">Què vol dir?</p><p class="enunciat"><Hebr p={p} /></p></>
  return (
    <div class="exercici">
      {enunciat}
      <div class={`opcions ${tipus === 'tria-imatge' ? 'imatges' : ''}`.trim()}>
        {opcions.map((o) => (
          <button type="button" key={o.id} class={`opcio ${estat(o.id)}`.trim()} aria-label={tipus === 'tria-imatge' ? o.ca : undefined}
            disabled={triada !== null && estat(o.id) === ''} onClick={() => tria(o.id)}>
            {tipus === 'tria-imatge' ? <span class="plafo" style={{ background: color }}><Icona nom={o.icona!} /></span>
              : tipus === 'traduccio' ? o.ca : <Hebr p={o} />}
          </button>
        ))}
      </div>
      {triada !== null && <p class="retro"><Hebr p={p} />{translit && <> · {p.translit}</>} · {p.ca}</p>}
    </div>
  )
}
