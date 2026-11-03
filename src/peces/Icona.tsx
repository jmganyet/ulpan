import { BASE } from '../contingut/index'

/** Icona de Phosphor (duotone) o dibuix propi (`propia:<fitxer>.svg`). */
export function Icona({ nom }: { nom: string }) {
  if (nom.startsWith('propia:')) {
    return <img src={`${BASE}imatges/${nom.slice('propia:'.length)}`} alt="" />
  }
  return <i class={`ph-duotone ph-${nom}`} aria-hidden="true" />
}
