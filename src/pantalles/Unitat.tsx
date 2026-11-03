import { Marques } from '../peces/Marques'
import type { Unitat as UnitatT } from '../contingut/tipus'

const esHebreu = (s: string) => /[֐-׿]/.test(s)

/** Un text per pàgina: el primer de cada pàgina (els enllaços van a la pàgina). */
export function textosPerPagina(u: UnitatT): UnitatT['textos'] {
  const vistes = new Set<string>()
  return u.textos.filter((t) => (vistes.has(t.pagina) ? false : (vistes.add(t.pagina), true)))
}

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
        {u.gramatica.length > 0 && (
          <>
            <h2 class="petit">Gramàtica</h2>
            {u.gramatica.map((g, i) => (
              <a href={`${base}/gramatica/${i + 1}`} key={g.id}>{g.titol} <span class="petit">{i + 1}/{u.gramatica.length}</span></a>
            ))}
          </>
        )}
        {u.textos.length > 0 && (
          <>
            <h2 class="petit">Diàlegs i textos</h2>
            {textosPerPagina(u).map((t) => (
              <a href={`${base}/text/${t.pagina}`} key={t.pagina} class="text-enllac">
                <span class="titol-text">
                  <span dir={esHebreu(t.titol.u) ? 'rtl' : undefined} lang={esHebreu(t.titol.u) ? 'he' : undefined}>{t.titol.u}</span>
                  <Marques perComprovar={t.titol.perComprovar} />
                  <span class="petit">{t.titol.ca}</span>
                </span>
                <span class="petit">pàg. {Number(t.pagina.replace(/\D/g, ''))}</span>
              </a>
            ))}
          </>
        )}
        <a href={`${base}/exercicis`}>Exercicis</a>
      </nav>
    </div>
  )
}
