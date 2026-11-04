import type { ComponentChildren } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { usePreferencies, type Lletra } from '../preferencies'

// Un sol botó «Aa» obre un full amb totes les opcions de lectura (triat a referencia/dialeg.html el 2026-11-04:
// `controls=full; nom=niqqud`). Les opcions valen per a tota l'app i es mantenen entre sessions.

type Props = {
  /** Mostra l'interruptor de transcripció (on n'hi ha: vocabulari i exercicis). */ ambTranslit?: boolean
  /** Mostra l'interruptor de traducció (diàlegs i textos). */ ambTraduccio?: boolean
  /** Opcions pròpies de la pantalla (p. ex. la pausa per repetir dels diàlegs). */ children?: ComponentChildren
}

export function Interruptor({ actiu, alCanviar, nom, explicacio }: { actiu: boolean; alCanviar: (v: boolean) => void; nom: string; explicacio?: string }) {
  return (
    <div class="opcio-full">
      <span><span class="opcio-nom">{nom}</span>{explicacio && <small>{explicacio}</small>}</span>
      <button type="button" class="commutador" role="switch" aria-checked={actiu} aria-label={nom} onClick={() => alCanviar(!actiu)} />
    </div>
  )
}

const LLETRES: [Lletra, string][] = [['quadrada', 'Quadrada'], ['cursiva', 'Cursiva'], ['dues', 'Totes dues']]

export function OpcionsLectura({ ambTranslit = false, ambTraduccio = false, children }: Props) {
  const pref = usePreferencies()
  const [obert, setObert] = useState(false)
  const boto = useRef<HTMLButtonElement>(null)
  const full = useRef<HTMLDivElement>(null)

  const tanca = () => { setObert(false); boto.current?.focus() }
  useEffect(() => {
    if (!obert) return
    full.current?.querySelector<HTMLElement>('button')?.focus()
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') tanca() }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [obert])

  // El punt diu que hi ha alguna ajuda encesa (o una lletra que no és la quadrada).
  const ajuda = pref.vocals || pref.lletra !== 'quadrada' || (ambTranslit && pref.translit) || (ambTraduccio && pref.traduccio)

  return (
    <>
      <button ref={boto} type="button" class="boto-aa" aria-label="Opcions de lectura" aria-haspopup="dialog" aria-expanded={obert}
        onClick={() => setObert(true)}>
        <i class="ph-duotone ph-text-aa" aria-hidden="true" />
        {ajuda && <span class="punt" aria-hidden="true" />}
      </button>
      {obert && (
        <>
          <div class="vel-full" onClick={tanca} />
          <div ref={full} class="full-opcions" role="dialog" aria-modal="true" aria-label="Opcions de lectura">
            <div class="ansa" aria-hidden="true" />
            <div class="full-cap">
              <h2>Lectura</h2>
              <button type="button" class="tanca-full" onClick={tanca}>Fet</button>
            </div>
            <Interruptor actiu={pref.vocals} alCanviar={pref.setVocals} nom="Niqqud" explicacio="Els punts de les vocals" />
            <div class="opcio-full">
              <span class="opcio-nom">Lletra</span>
              <span class="segments" role="group" aria-label="Lletra">
                {LLETRES.map(([v, nom]) => (
                  <button type="button" key={v} aria-pressed={pref.lletra === v} onClick={() => pref.setLletra(v)}>
                    {v !== 'dues' && <span class={v} aria-hidden="true">א </span>}{nom}
                  </button>
                ))}
              </span>
            </div>
            {ambTranslit && <Interruptor actiu={pref.translit} alCanviar={pref.setTranslit} nom="Transcripció" explicacio="En lletres llatines" />}
            {ambTraduccio && <Interruptor actiu={pref.traduccio} alCanviar={pref.setTraduccio} nom="Traducció" explicacio="En català, sota cada línia" />}
            {children}
            <p class="petit">Es manté a tota l'app fins que ho tornis a canviar.</p>
          </div>
        </>
      )}
    </>
  )
}
