import { useEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks'
import type { Text } from '../contingut/tipus'
import { EnLletra, Hebreu } from '../peces/Hebreu'
import { Marques } from '../peces/Marques'
import { Interruptor, OpcionsLectura } from '../peces/OpcionsLectura'
import { usePreferencies } from '../preferencies'
import { noms, quiDe, Reproductor, type Deps, type Mode } from './reproductor'

// Triat a referencia/dialeg.html el 2026-11-04: `play=barra; info=qui; velocitat=so; controls=full; nom=niqqud;
// traduccio=global; revela=so; estil=xat; colors=cadascun; midaHeb=28; fas=tots`, amb els noms de tots els
// personatges a la vista en una sola línia (sense desplegable).

const esHebreu = (s: string) => /[֐-׿]/.test(s)
/** Colors dels personatges (fons de la bombolla i tinta del nom), en ordre d'aparició. */
const COLORS = 5

export function BlocText({ text, deps }: { text: Text; deps: Deps }) {
  const pref = usePreferencies()
  const [jo, setJo] = useState(-1) // −1: escoltar; si no, el personatge que fas tu
  const [tornVisible, setTornVisible] = useState(false)
  const [, repinta] = useReducer((n: number, _x: number) => n + 1, 0)
  const dialeg = text.tipus === 'dialeg'
  const mode: Mode = jo >= 0 ? { tipus: 'personatge', jo } : { tipus: pref.repetir ? 'repetir' : 'escoltar' }
  const r = useMemo(() => new Reproductor(text, mode, deps, () => repinta(0)), [text, deps, jo, pref.repetir])
  useEffect(() => () => r.stop(), [r])
  const xat = useRef<HTMLDivElement>(null)

  // Mentre sona, la línia que es diu no surt mai de la pantalla.
  useEffect(() => {
    if (!r.sonant || r.linia < 0) return
    const el = xat.current?.querySelector<HTMLElement>(`[data-linia="${r.linia}"]`)
    const suau = typeof matchMedia === 'function' && !matchMedia('(prefers-reduced-motion: reduce)').matches
    el?.scrollIntoView?.({ block: 'nearest', behavior: suau ? 'smooth' : 'auto' })
  }, [r.linia, r.sonant])

  const persones = noms(text)
  const fesDe = (i: number) => { setJo(i); setTornVisible(false) }
  const amagada = (i: number) => jo >= 0 && quiDe(text, i) === jo && !tornVisible
  const titolHebreu = esHebreu(text.titol.u)
  const teCa = text.linies.some((l) => l.ca)
  // Línies que sonen (en mode repetir, cada línia té dos passos: compta un cop)
  const unica = [...new Set(r.passos.map((p) => p.linia))]
  const posicio = Math.max(0, unica.indexOf(r.linia))
  const quiAra = dialeg && unica.length ? (text.linies[unica[posicio]]?.qui ?? persones[quiDe(text, unica[posicio])]) : ''

  return (
    <section class="bloc-conversa">
      <h2 class="titol-bloc">
        {titolHebreu ? <EnLletra lletra={pref.lletra === 'dues' ? 'quadrada' : pref.lletra}>{text.titol.u}</EnLletra> : <span>{text.titol.u}</span>}
        <Marques perComprovar={text.titol.perComprovar} />
        <span class="petit">{text.titol.ca}</span>
      </h2>
      {dialeg && (
        <>
        <p class="petit fas-de" id={`fas-${text.id}`}>Escolta, o fes d'un personatge:</p>
        <div class="personatges" role="group" aria-labelledby={`fas-${text.id}`}>
          <button type="button" class="xip" aria-pressed={jo < 0} onClick={() => fesDe(-1)}>Escolta</button>
          {persones.map((n, i) => (
            <button type="button" key={n} class={`xip pc${i % COLORS}`} aria-pressed={jo === i} aria-label={`Fas de ${n}`} onClick={() => fesDe(i)}>
              <span dir="rtl" lang={esHebreu(n) ? 'he' : undefined}>{n}</span>
            </button>
          ))}
        </div>
        </>
      )}
      <div class="xat" ref={xat}>
        {text.linies.map((l, i) => {
          const p = quiDe(text, i)
          const sona = r.sonant && r.linia === i
          if (l.nota) return <p class="nota-linia petit" dir="ltr" key={l.id}>{l.text.u}</p>
          const costat = dialeg && p % 2 ? 'esq' : 'dreta'
          const classe = `bomb ${costat}${dialeg ? ` pc${p % COLORS}` : ''}${amagada(i) ? ' amagat' : ''}${sona ? ' actual' : ''}`
          return (
            <div class={classe} key={l.id} data-linia={i}>
              {dialeg && <span class="qui" dir="rtl">{persones[p] ?? `Persona ${'AB'[p % 2]}`}</span>}
              {amagada(i) ? (
                <button type="button" class="torn" onClick={() => setTornVisible(true)}>
                  El teu torn: digues-ho en veu alta <span class="petit">· toca per veure-ho</span>
                </button>
              ) : (
                <>
                  <button type="button" class="bomb-text" disabled={!l.audio || l.perComprovar}
                    aria-label={`Escolta la línia ${i + 1}`} onClick={() => void r.playLinia(i)}>
                    <Hebreu valor={l.text} subratllat={l.subratllat} />
                  </button>
                  <Marques extra={l.extra} perComprovar={l.perComprovar} />
                  {l.ca && pref.traduccio && <span class="ca-linia">{l.ca}</span>}
                </>
              )}
            </div>
          )
        })}
      </div>
      <div class="barra-so">
        <button type="button" class="rodo" aria-label="Línia anterior" onClick={() => r.prev()}><i class="ph-duotone ph-skip-back" aria-hidden="true" /></button>
        <button type="button" class="rodo gran-play" aria-label={r.sonant ? 'Pausa' : 'Reprodueix'}
          disabled={r.passos.length === 0} onClick={() => (r.sonant ? r.pause() : void r.play())}>
          <i class={`ph-duotone ${r.sonant ? 'ph-pause' : 'ph-play'}`} aria-hidden="true" />
        </button>
        <button type="button" class="rodo" aria-label="Línia següent" onClick={() => r.next()}><i class="ph-duotone ph-skip-forward" aria-hidden="true" /></button>
        <span class="info-so">
          {unica.length > 0 && <b aria-label={`Línia ${posicio + 1} de ${unica.length}`}>{posicio + 1} de {unica.length}</b>}
          {quiAra && <span dir="rtl" class="qui-ara">{quiAra}</span>}
          {unica.length > 0 && <span class="progres-so" aria-hidden="true"><i style={{ width: `${Math.round(((posicio + 1) / unica.length) * 100)}%` }} /></span>}
        </span>
        <button type="button" class="velocitat" aria-pressed={pref.dialegLent} aria-label="A poc a poc"
          onClick={() => pref.setDialegLent(!pref.dialegLent)}>0,7×</button>
        <OpcionsLectura ambTraduccio={teCa}>
          {jo < 0 && <Interruptor actiu={pref.repetir} alCanviar={pref.setRepetir} nom="Pausa per repetir" explicacio="Després de cada línia, temps per dir-la tu" />}
        </OpcionsLectura>
      </div>
    </section>
  )
}
