import { useRef, useState } from 'preact/hooks'
import { exporta, importa, ErrorImportacio } from '../progres/magatzem'
import type { Progres } from '../progres/srs'
import { usePreferencies } from '../preferencies'

type Props = { progres: Progres; alImportar: (p: Progres) => void }

export function Ajustos({ progres, alImportar }: Props) {
  const pref = usePreferencies()
  const entrada = useRef<HTMLInputElement>(null)
  const [missatge, setMissatge] = useState('')

  const baixa = () => {
    const url = URL.createObjectURL(new Blob([exporta(progres)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'ulpan-progres.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const carrega = async (e: Event) => {
    const camp = e.currentTarget as HTMLInputElement
    const fitxer = camp.files?.[0]
    if (!fitxer) return
    try {
      alImportar(importa(await fitxer.text()))
      setMissatge('Progrés importat.')
    } catch (err) {
      setMissatge(err instanceof ErrorImportacio ? err.message : 'No s\'ha pogut llegir el fitxer.')
    }
    camp.value = ''
  }

  return (
    <div class="ajustos">
      <a class="enrere" href="#/">‹ Inici</a>
      <h1>Ajustos</h1>
      <h2>Lectura</h2>
      <label class="fila"><input type="checkbox" checked={pref.vocals} onChange={(e) => pref.setVocals((e.currentTarget as HTMLInputElement).checked)} /> Niqqud (els punts de les vocals) fora del vocabulari</label>
      <fieldset class="fila grup-lletra">
        <legend>Lletra</legend>
        {([['quadrada', 'Quadrada'], ['cursiva', 'Cursiva'], ['dues', 'Totes dues']] as const).map(([v, nom]) => (
          <label key={v}><input type="radio" name="lletra" checked={pref.lletra === v} onChange={() => pref.setLletra(v)} /> {nom}</label>
        ))}
      </fieldset>
      <label class="fila"><input type="checkbox" checked={pref.translit} onChange={(e) => pref.setTranslit((e.currentTarget as HTMLInputElement).checked)} /> Transcripció</label>
      <label class="fila"><input type="checkbox" checked={pref.traduccio} onChange={(e) => pref.setTraduccio((e.currentTarget as HTMLInputElement).checked)} /> Traducció sota les línies dels diàlegs</label>
      <label class="fila"><input type="checkbox" checked={pref.sons} onChange={(e) => pref.setSons((e.currentTarget as HTMLInputElement).checked)} /> Sons d'encert i d'error</label>
      <h2>Progrés</h2>
      <button type="button" class="btn" onClick={baixa}>Exporta el progrés</button>
      <button type="button" class="btn" onClick={() => entrada.current?.click()}>Importa el progrés</button>
      <input ref={entrada} type="file" accept="application/json,.json" aria-label="Fitxer de progrés" onChange={carrega} hidden />
      {missatge && <p role="status" class="missatge">{missatge}</p>}
    </div>
  )
}
