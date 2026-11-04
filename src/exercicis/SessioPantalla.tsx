import { useMemo, useState } from 'preact/hooks'
import type { Exercici, Paraula, Unitat } from '../contingut/tipus'
import { marcaVist } from '../progres/magatzem'
import { respon, type Progres } from '../progres/srs'
import { TargetaParaula } from '../peces/TargetaParaula'
import { sonaResposta } from '../peces/sonsResposta'
import { OpcionsLectura } from '../peces/OpcionsLectura'
import { usePreferencies } from '../preferencies'
import { Autocorreccio } from './Autocorreccio'
import { Comprensio } from './Comprensio'
import { Conjugar } from './Conjugar'
import { Construir } from './Construir'
import { Forat } from './Forat'
import { TriaImatge } from './TriaImatge'
import { esPregunta, type Pas } from './sessio'

type Props = {
  titol: string; color: string; enrere: string; passos: Pas[]; unitats: Unitat[]
  progres: Progres; canvia: (p: Progres) => void; ara?: () => number
}

type Estat = { cua: Pas[]; i: number; respost: boolean; encerts: number; total: number; reintents: Pas[]; enReintents: boolean }

/** Pantalla de sessió (exercicis d'una unitat i repàs): un pas cada cop, retro, «Continua» i resum final. */
export function SessioPantalla({ titol, color, enrere, passos, unitats, progres, canvia, ara = Date.now }: Props) {
  const [e, setE] = useState<Estat>({ cua: passos, i: 0, respost: false, encerts: 0, total: 0, reintents: [], enReintents: false })
  const pref = usePreferencies()
  const paraules = useMemo(() => unitats.flatMap((u) => u.vocabulari), [unitats])
  const colorDe = (id: string) => unitats.find((u) => id.startsWith(`${u.id}-`))?.color ?? color
  const exercicis = useMemo(() => new Map<string, Exercici>(unitats.flatMap((u) => u.exercicis).map((x) => [x.id, x])), [unitats])
  const mapaParaules = useMemo(() => new Map<string, Paraula>(paraules.map((p) => [p.id, p])), [paraules])

  const pas = e.cua[e.i] as Pas | undefined
  const final = !pas
  // Els errors que tornen al final són una fase a part: la barra no recula mai.
  const nPrincipal = passos.length
  const pct = e.enReintents
    ? Math.round(((e.i - nPrincipal) / Math.max(1, e.cua.length - nPrincipal)) * 100)
    : e.cua.length === 0 ? 100 : Math.round((e.i / e.cua.length) * 100)

  const onRespon = (encert: boolean) => {
    if (!pas) return
    if (pref.sons) sonaResposta(encert)
    canvia(respon(progres, pas.ref, encert, ara()))
    setE((s) => ({
      ...s, respost: true,
      encerts: s.encerts + (!s.enReintents && encert ? 1 : 0),
      total: s.total + (s.enReintents ? 0 : 1),
      reintents: !encert && !s.enReintents ? [...s.reintents, pas] : s.reintents,
    }))
  }
  const continua = () => {
    if (pas?.tipus === 'paraula-nova') canvia(marcaVist(progres, pas.ref, ara()))
    setE((s) => {
      const i = s.i + 1
      if (i >= s.cua.length && !s.enReintents && s.reintents.length > 0) {
        return { ...s, cua: [...s.cua, ...s.reintents], i, respost: false, enReintents: true }
      }
      return { ...s, i, respost: false }
    })
  }

  const cos = () => {
    if (!pas) return null
    const par = mapaParaules.get(pas.ref)
    if (pas.tipus === 'paraula-nova') return par && <TargetaParaula paraula={par} color={colorDe(par.id)} vocals={pref.vocals} />
    if (par && esPregunta(pas.tipus)) return <TriaImatge key={e.i} paraula={par} totes={paraules} color={colorDe(par.id)} tipus={pas.tipus} onRespon={onRespon} />
    const ex = exercicis.get(pas.ref)
    if (!ex) return <p class="avis">Aquest exercici ja no existeix.</p>
    switch (ex.tipus) {
      case 'forat': return <Forat key={e.i} ex={ex} onRespon={onRespon} />
      case 'construir': return <Construir key={e.i} ex={ex} onRespon={onRespon} />
      case 'conjugar': return <Conjugar key={e.i} ex={ex} onRespon={onRespon} />
      case 'comprensio': return <Comprensio key={e.i} ex={ex} onRespon={onRespon} />
      case 'autocorreccio': return <Autocorreccio key={e.i} ex={ex} onRespon={onRespon} />
    }
  }

  return (
    <div class="sessio">
      <header class="capcalera-unitat" style={{ background: color }}>
        <a class="enrere" href={enrere}>‹ Surt</a>
        <h1>{titol}</h1>
      </header>
      {final ? (
        <section class="resum">
          <h2>Sessió acabada</h2>
          <p class="resum-x">{e.encerts} / {e.total}</p>
          <p class="petit">{e.total === 0 ? 'Res per fer ara mateix.' : 'encerts a la primera'}</p>
          <a class="btn" href={enrere}>Torna</a>
        </section>
      ) : (
        <>
          {/* Progrés i opcions de lectura en una sola fila, per deixar lloc a l'exercici */}
          <div class="fila-sessio">
            <div class="barra-sessio" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><b style={{ width: `${pct}%`, background: color }} /></div>
            <OpcionsLectura ambTranslit />
          </div>
          {e.enReintents && <p class="petit">Repàs dels errors</p>}
          {cos()}
          {(e.respost || pas.tipus === 'paraula-nova') && (
            <button type="button" class="btn continua-btn" onClick={continua}>Continua</button>
          )}
        </>
      )}
    </div>
  )
}
