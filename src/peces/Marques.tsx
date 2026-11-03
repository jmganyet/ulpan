export function Marques({ extra, perComprovar }: { extra?: boolean; perComprovar?: boolean }) {
  if (!extra && !perComprovar) return null
  return (
    <>
      {extra && <span class="marca extra">extra</span>}
      {perComprovar && <span class="marca comprova">⁇ per comprovar</span>}
    </>
  )
}
