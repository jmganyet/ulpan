import { useState } from 'preact/hooks'
import { exporta, importa, ErrorImportacio } from '../progres/magatzem'
import type { Progres } from '../progres/srs'
import { usePreferencies } from '../preferencies'

type Props = { progres: Progres; alImportar: (p: Progres) => void }

export function Ajustos({ progres, alImportar }: Props) {
  const pref = usePreferencies()
  const [missatge, setMissatge] = useState('')

  const baixa = () => {
    const url = URL.createObjectURL(new Blob([exporta(progres)], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'ulpan-progres.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const carrega = async (e: Event) => {
    const fitxer = (e.currentTarget as HTMLInputElement).files?.[0]
    if (!fitxer) return
    try {
      alImportar(importa(await fitxer.text()))
      setMissatge('Progrés importat.')
    } catch (err) {
      setMissatge(err instanceof ErrorImportacio ? err.message : 'No s\'ha pogut llegir el fitxer.')
    }
  }

  return (
    <div class="ajustos">
      <a class="enrere" href="#/">‹ Inici</a>
      <h1>Ajustos</h1>
      <label class="fila"><input type="checkbox" checked={pref.vocals} onChange={(e) => pref.setVocals((e.currentTarget as HTMLInputElement).checked)} /> Mostra les vocals als diàlegs i exercicis</label>
      <label class="fila"><input type="checkbox" checked={pref.lletra === 'cursiva'} onChange={(e) => pref.setLletra((e.currentTarget as HTMLInputElement).checked ? 'cursiva' : 'quadrada')} /> Lletra cursiva en lloc de quadrada</label>
      <h2>Progrés</h2>
      <button type="button" class="btn" onClick={baixa}>Exporta el progrés</button>
      <label class="btn fitxer">Importa el progrés<input type="file" accept="application/json,.json" onChange={carrega} hidden /></label>
      {missatge && <p role="status" class="missatge">{missatge}</p>}
    </div>
  )
}
