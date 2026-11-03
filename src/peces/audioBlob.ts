const blobs = new Map<string, string>()
const pendents = new Map<string, Promise<string>>()

/**
 * Baixa el fitxer sencer (sense Range, perquè el service worker el pugui desar a la memòria cau)
 * i en dona una URL de blob. Un sol fetch per fitxer i sessió; si falla, es rebutja i es pot tornar a provar.
 */
export function urlAudio(url: string): Promise<string> {
  const feta = blobs.get(url)
  if (feta) return Promise.resolve(feta)
  const p = pendents.get(url)
  if (p) return p
  const nou = (async () => {
    const r = await fetch(url)
    if (!r.ok) throw new Error(`àudio ${r.status}`)
    const b = URL.createObjectURL(await r.blob())
    blobs.set(url, b)
    return b
  })().finally(() => pendents.delete(url))
  pendents.set(url, nou)
  return nou
}
