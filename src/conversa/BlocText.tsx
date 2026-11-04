import { useEffect, useMemo, useReducer, useState } from 'preact/hooks'
import type { Text } from '../contingut/tipus'
import { Hebreu } from '../peces/Hebreu'
import { Marques } from '../peces/Marques'
import { usePreferencies } from '../preferencies'
import { noms, quiDe, Reproductor, type Deps, type Mode } from './reproductor'

const esHebreu = (s: string) => /[֐-׿]/.test(s)
type Clau = 'escoltar' | 'repetir' | number

export function BlocText({ text, deps }: { text: Text; deps: Deps }) {
  const { vocals, lletra, setVocals, setLletra, dialegLent, setDialegLent } = usePreferencies()
  const [clau, setClau] = useState<Clau>('escoltar')
  const [tornVisible, setTornVisible] = useState(false)
  const [ca, setCa] = useState<Set<number>>(new Set())
  const [, repinta] = useReducer((n: number, _x: number) => n + 1, 0)
  const dialeg = text.tipus === 'dialeg'
  const mode: Mode = typeof clau === 'number' ? { tipus: 'personatge', jo: clau } : { tipus: clau }
  const r = useMemo(() => new Reproductor(text, mode, deps, () => repinta(0)), [text, deps, clau])
  useEffect(() => () => r.stop(), [r])

  const canvia = (c: Clau) => { setClau(c); setTornVisible(false) }
  const meva = (i: number) => typeof clau === 'number' && quiDe(text, i) === clau
  const amagada = (i: number) => meva(i) && !tornVisible
  const titolHebreu = esHebreu(text.titol.u)

  return (
    <section class="bloc-conversa">
      <h2 class="titol-bloc">
        <span dir={titolHebreu ? 'rtl' : undefined} lang={titolHebreu ? 'he' : undefined} class={titolHebreu ? lletra : undefined}>{text.titol.u}</span>
        <Marques perComprovar={text.titol.perComprovar} />
        <span class="petit">{text.titol.ca}</span>
      </h2>
      <div class="eines" role="group" aria-label="Mode">
        <button type="button" aria-pressed={clau === 'escoltar'} class={clau === 'escoltar' ? 'on' : ''} onClick={() => canvia('escoltar')}>Escoltar</button>
        <button type="button" aria-pressed={clau === 'repetir'} class={clau === 'repetir' ? 'on' : ''} onClick={() => canvia('repetir')}>Repeteix</button>
        {dialeg && noms(text).slice(0, 2).map((n, i) => (
          <button type="button" key={n} aria-pressed={clau === i} class={clau === i ? 'on' : ''} onClick={() => canvia(i)}>Fas de {n}</button>
        ))}
      </div>
      <div class="eines" role="group" aria-label="Aspecte">
        <button type="button" aria-pressed={vocals} class={vocals ? 'on' : ''} onClick={() => setVocals(!vocals)}>Vocals</button>
        <button type="button" aria-pressed={lletra === 'cursiva'} class={lletra === 'cursiva' ? 'on' : ''} onClick={() => setLletra(lletra === 'cursiva' ? 'quadrada' : 'cursiva')}>Cursiva</button>
        <button type="button" aria-pressed={dialegLent} class={dialegLent ? 'on' : ''} onClick={() => setDialegLent(!dialegLent)}>Lent</button>
        {typeof clau === 'number' && !tornVisible && <button type="button" onClick={() => setTornVisible(true)}>Mostra el meu torn</button>}
      </div>
      <div class="xat">
        {text.linies.map((l, i) => {
          const p = quiDe(text, i)
          const jo = meva(i)
          const sona = r.sonant && r.linia === i
          if (l.nota) return <p class="nota-linia petit" dir="ltr" key={l.id}>{l.text.u}</p>
          const classe = `bomb p${p}${jo ? ' jo' : ''}${amagada(i) ? ' amagat' : ''}${sona ? ' actual' : ''}`
          return (
            <div class={classe} key={l.id}>
              {dialeg && <span class="qui">{noms(text)[p] ?? `Persona ${'AB'[p]}`}</span>}
              {amagada(i) ? (
                <span class="torn">El teu torn: digues-ho en veu alta</span>
              ) : (
                <>
                  <button type="button" class="bomb-text" disabled={!l.audio || l.perComprovar}
                    aria-label={`Escolta la línia ${i + 1}`} onClick={() => void r.playLinia(i)}>
                    <Hebreu valor={l.text} subratllat={l.subratllat} />
                  </button>
                  <Marques extra={l.extra} perComprovar={l.perComprovar} />
                  {l.ca && (
                    <button type="button" class="tradueix" aria-expanded={ca.has(i)} aria-label={`Traducció de la línia ${i + 1}`}
                      onClick={() => setCa((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })}>ca</button>
                  )}
                  {l.ca && ca.has(i) && <span class="petit ca-linia">{l.ca}</span>}
                </>
              )}
            </div>
          )
        })}
      </div>
      <div class="controls-conversa">
        <button type="button" aria-label="Línia anterior" onClick={() => r.prev()}><i class="ph-duotone ph-skip-back" aria-hidden="true" /></button>
        <button type="button" class="gran-play" aria-label={r.sonant ? 'Pausa' : 'Reprodueix'}
          disabled={r.passos.length === 0} onClick={() => (r.sonant ? r.pause() : void r.play())}>
          <i class={`ph-duotone ${r.sonant ? 'ph-pause' : 'ph-play'}`} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Línia següent" onClick={() => r.next()}><i class="ph-duotone ph-skip-forward" aria-hidden="true" /></button>
      </div>
    </section>
  )
}
