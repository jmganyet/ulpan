const LLETRES: [string, string][] = [
  ['א', 'alef'], ['ב', 'bet'], ['ג', 'guímel'], ['ד', 'dàlet'], ['ה', 'he'], ['ו', 'vav'], ['ז', 'zain'],
  ['ח', 'het'], ['ט', 'tet'], ['י', 'iod'], ['כ', 'kaf'], ['ל', 'làmed'], ['מ', 'mem'], ['נ', 'nun'],
  ['ס', 'sàmec'], ['ע', 'ain'], ['פ', 'pe'], ['צ', 'tsade'], ['ק', 'qof'], ['ר', 'resh'], ['ש', 'xin'], ['ת', 'tav'],
]
const FINALS: [string, string][] = [
  ['ך', 'kaf final'], ['ם', 'mem final'], ['ן', 'nun final'], ['ף', 'pe final'], ['ץ', 'tsade final'],
]

export function Alefat() {
  const fila = ([g, nom]: [string, string]) => (
    <tr key={nom}>
      <td><span dir="rtl" lang="he" class="quadrada gran">{g}</span></td>
      <td><span dir="rtl" lang="he" class="cursiva gran">{g}</span></td>
      <td>{nom}</td>
    </tr>
  )
  return (
    <div class="alefat">
      <a class="enrere" href="#/">‹ Inici</a>
      <h1>Alefat</h1>
      <p class="petit">Pàgina de consulta.</p>
      <table>
        <thead><tr><th>Quadrada</th><th>Cursiva</th><th>Nom</th></tr></thead>
        <tbody>
          {LLETRES.map(fila)}
          <tr><th colSpan={3} class="petit">Formes finals</th></tr>
          {FINALS.map(fila)}
        </tbody>
      </table>
    </div>
  )
}
