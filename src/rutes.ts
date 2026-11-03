import { useEffect, useState } from 'preact/hooks'

export type Ruta =
  | { pantalla: 'inici' }
  | { pantalla: 'unitat'; id: string }
  | { pantalla: 'vocabulari'; id: string }
  | { pantalla: 'gramatica'; id: string; n: string }
  | { pantalla: 'exercicis'; id: string }
  | { pantalla: 'text'; id: string; pag: string }
  | { pantalla: 'repas' }
  | { pantalla: 'alefat' }
  | { pantalla: 'ajustos' }
  | { pantalla: 'desconeguda' }

export function parseRuta(hash: string): Ruta {
  const t = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (t.length === 0) return { pantalla: 'inici' }
  if (t[0] === 'repas' && t.length === 1) return { pantalla: 'repas' }
  if (t[0] === 'alefat' && t.length === 1) return { pantalla: 'alefat' }
  if (t[0] === 'ajustos' && t.length === 1) return { pantalla: 'ajustos' }
  if (t[0] === 'u' && t[1]) {
    const id = t[1]
    if (t.length === 2) return { pantalla: 'unitat', id }
    if (t[2] === 'vocabulari' && t.length === 3) return { pantalla: 'vocabulari', id }
    if (t[2] === 'exercicis' && t.length === 3) return { pantalla: 'exercicis', id }
    if (t[2] === 'gramatica' && t[3] && t.length === 4) return { pantalla: 'gramatica', id, n: t[3] }
    if (t[2] === 'text' && t[3] && t.length === 4) return { pantalla: 'text', id, pag: t[3] }
  }
  return { pantalla: 'desconeguda' }
}

export function useRuta(): Ruta {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const al = () => { setHash(window.location.hash) }
    window.addEventListener('hashchange', al)
    return () => window.removeEventListener('hashchange', al)
  }, [])
  return parseRuta(hash)
}
