import type { Unitat as UnitatT } from '../contingut/tipus'

export function Unitat({ unitat: u }: { unitat: UnitatT }) {
  const base = `#/u/${u.id}`
  return (
    <div class="unitat-pantalla">
      <header class="capcalera-unitat" style={{ background: u.color }}>
        <a class="enrere" href="#/">‹ Inici</a>
        <h1>{u.num} · {u.titol}</h1>
      </header>
      <nav class="llista-enllacos" style={{ '--color': u.color } as never}>
        <a href={`${base}/vocabulari`}>Vocabulari <span class="petit">{u.vocabulari.length} paraules</span></a>
        {u.gramatica.map((g, i) => (
          <a href={`${base}/gramatica/${i + 1}`} key={g.id}>{g.titol} <span class="petit">Gramàtica {i + 1}/{u.gramatica.length}</span></a>
        ))}
        {u.textos.length > 0 && (
          <>
            <h2 class="petit">Diàlegs i textos</h2>
            {u.pagines.map((pag) => (
              <a href={`${base}/text/${pag}`} key={pag}>Pàgina {Number(pag.replace(/\D/g, ''))}</a>
            ))}
          </>
        )}
        <a href={`${base}/exercicis`}>Exercicis</a>
      </nav>
    </div>
  )
}
