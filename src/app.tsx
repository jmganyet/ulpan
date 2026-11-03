import { useEffect, useState } from 'preact/hooks'
import { carregaIndex, carregaUnitat, type EntradaIndex } from './contingut/index'
import type { Unitat as UnitatT } from './contingut/tipus'
import { magatzemLocal, marcaVist, type Magatzem } from './progres/magatzem'
import type { Progres } from './progres/srs'
import { useRuta, type Ruta } from './rutes'
import { Inici } from './pantalles/Inici'
import { Unitat } from './pantalles/Unitat'
import { Vocabulari } from './pantalles/Vocabulari'
import { Exercicis } from './pantalles/Exercicis'
import { Gramatica } from './pantalles/Gramatica'
import { Repas } from './pantalles/Repas'
import { Conversa } from './pantalles/Conversa'
import { Aviat } from './pantalles/Aviat'
import { Alefat } from './pantalles/Alefat'
import { Ajustos } from './pantalles/Ajustos'

/** Camí d'una subpantalla d'unitat (p. ex. «text/pag-28»), o null si no n'és cap. */
export function pasDe(r: Ruta): string | null {
  switch (r.pantalla) {
    case 'vocabulari': case 'exercicis': return r.pantalla
    case 'gramatica': return `gramatica/${r.n}`
    case 'text': return `text/${r.pag}`
    default: return null
  }
}

const MAGATZEM_PER_DEFECTE = magatzemLocal()

function useCarrega<T>(clau: string | null, carrega: () => Promise<T>) {
  const [estat, setEstat] = useState<{ clau: string; valor?: T; error?: string } | null>(null)
  useEffect(() => {
    if (clau === null) return
    let viu = true
    carrega().then(
      (valor) => viu && setEstat({ clau, valor }),
      (e: Error) => viu && setEstat({ clau, error: e.message }),
    )
    return () => { viu = false }
  }, [clau])
  return estat && estat.clau === clau ? estat : null
}

export function App({ magatzem = MAGATZEM_PER_DEFECTE }: { magatzem?: Magatzem }) {
  const [progres, setProgres] = useState<Progres>(() => magatzem.llegeix())
  const [recuperat, setRecuperat] = useState(() => magatzem.recuperat)
  const ruta = useRuta()
  const index = useCarrega('index', carregaIndex)
  const idUnitat = 'id' in ruta ? ruta.id : null
  const unitat = useCarrega(idUnitat, () => carregaUnitat(idUnitat!))

  const canvia = (p: Progres) => { setProgres(p); magatzem.desa(p) }
  const pas = pasDe(ruta)
  useEffect(() => {
    if (!idUnitat || pas === null || (progres.darrera?.unitat === idUnitat && progres.darrera.pas === pas)) return
    canvia({ ...progres, darrera: { unitat: idUnitat, pas } })
  }, [idUnitat, pas])
  const veure = (ids: string[]) => {
    const ara = Date.now()
    const p = ids.reduce((acc, id) => marcaVist(acc, id, ara), progres)
    if (p !== progres) canvia(p)
  }

  const avisos = (
    <>
      {!magatzem.disponible && <p class="avis" role="status">El progrés no es pot desar en aquest navegador</p>}
      {recuperat && <p class="avis" role="status">S'han trobat dades de progrés malmeses; se n'ha desat una còpia i es comença de nou</p>}
    </>
  )

  const espera = <p class="petit">Carregant…</p>
  const error = (m: string) => <p class="avis error" role="alert">{m}</p>

  const pantalla = () => {
    if (ruta.pantalla === 'ajustos') return <Ajustos progres={progres} alImportar={(p) => { canvia(p); setRecuperat(false) }} />
    if (ruta.pantalla === 'alefat') return <Alefat />
    if (ruta.pantalla === 'desconeguda') return <Aviat />
    if (ruta.pantalla === 'repas') {
      if (!index) return espera
      return index.error ? error(index.error) : <Repas index={index.valor as EntradaIndex[]} progres={progres} canvia={canvia} />
    }
    if (ruta.pantalla === 'inici') {
      if (!index) return espera
      return index.error ? error(index.error) : <Inici index={index.valor as EntradaIndex[]} progres={progres} />
    }
    if (!unitat) return espera
    if (unitat.error) return error(unitat.error)
    const u = unitat.valor as UnitatT
    if (ruta.pantalla === 'unitat') return <Unitat unitat={u} />
    if (ruta.pantalla === 'vocabulari') return <Vocabulari unitat={u} alVeure={veure} />
    if (ruta.pantalla === 'gramatica') return <Gramatica unitat={u} n={ruta.n} />
    if (ruta.pantalla === 'exercicis') return <Exercicis unitat={u} progres={progres} canvia={canvia} />
    return <Conversa unitat={u} pag={ruta.pag} />
  }

  return (
    <main class="app">
      {ruta.pantalla === 'inici' && <a class="engranatge" href="#/ajustos" aria-label="Ajustos"><i class="ph-duotone ph-gear-six" aria-hidden="true" /></a>}
      {avisos}
      {pantalla()}
    </main>
  )
}
