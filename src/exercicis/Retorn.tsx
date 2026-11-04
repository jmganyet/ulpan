import type { ComponentChildren } from 'preact'

/** Retorn d'un exercici: verd i «Correcte», o vermell i «Incorrecte» amb la resposta bona. */
export function Retorn({ encert, sub, children }: { encert: boolean; sub?: string; children?: ComponentChildren }) {
  return (
    <div class={`retro ${encert ? 'bona' : 'dolenta'}`} role="status">
      <span class="retro-cap">
        <i class={`ph-duotone ${encert ? 'ph-check-circle' : 'ph-x-circle'}`} aria-hidden="true" />
        {encert ? 'Correcte' : 'Incorrecte'}
        {!encert && sub && <span class="retro-sub"> · {sub}</span>}
      </span>
      {children}
    </div>
  )
}

const HEBREU = /([֐-׿][֐-׿\s'"״׳־-]*[֐-׿]|[֐-׿])/

/** Text català amb mots hebreus: cada tros hebreu, en quadrada i a la mida d'hebreu dins del text. */
export function AmbHebreu({ s }: { s: string }) {
  return <>{s.split(HEBREU).map((t, i) => (HEBREU.test(t) ? <span key={i} dir="rtl" lang="he" class="quadrada">{t}</span> : t))}</>
}
