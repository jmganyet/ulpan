import { usePreferencies } from '../preferencies'

/** «Mostra / Amaga la transcripció»: un sol interruptor per a tota l'app (per defecte, amagada). */
export function BotoTranslit() {
  const { translit, setTranslit } = usePreferencies()
  return (
    <button type="button" class="btn clar vocals" aria-pressed={translit} onClick={() => setTranslit(!translit)}>
      {translit ? 'Amaga la transcripció' : 'Mostra la transcripció'}
    </button>
  )
}
