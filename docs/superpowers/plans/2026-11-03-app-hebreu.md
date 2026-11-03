---
tipus: nota
resum: "Pla de construcció de l'app d'hebreu del curs del màster (repositori ulpan): generador de contingut a partir del vault, àudio amb la veu Carmit, app web Preact amb repàs espaiat, exercicis i converses, publicació a GitHub Pages i empaquetat amb Tauri."
---
# App d'hebreu: pla de construcció

> **Per a agents:** sub-skill obligatòria: superpowers:subagent-driven-development (recomanada) o superpowers:executing-plans per executar el pla tasca per tasca. Els passos porten caselles (`- [ ]`) per seguir-ne l'estat.

**Objectiu:** una app per estudiar les deu unitats del dossier d'hebreu del màster (vocabulari, gramàtica, verbs, converses) amb repàs a l'estil Drops, que funcioni al Mac (Tauri) i al navegador (GitHub Pages).

**Arquitectura:** un script de Node llegeix el dossier del vault (font única del text del mètode) i una capa curada dins el repositori (gramàtica, exercicis, vocals afegides, icones, ampliacions), en valida la coherència i genera un JSON per unitat. Un segon script genera l'àudio amb la veu hebrea del Mac. L'app és un lloc estàtic (Vite + Preact) que llegeix aquests JSON, desa el progrés en local i funciona sense connexió.

**Tecnologia:** Node 24, TypeScript, Vite, Preact, Vitest + @testing-library/preact, `yaml`, `vite-plugin-pwa`, `@phosphor-icons/web` (duotone), Tauri 2, `say` + `afconvert` de macOS, GitHub Actions + Pages.

**Disseny:** [[app-disseny]] (`curs-master/app-disseny.md`) i maquetes `curs-master/app-maquetes.html`. L'executor llegeix els tres fitxers.

## Restriccions globals

- Repositori: `~/Projects/ulpan`, remot públic `jmganyet/ulpan`; el codi no viu a iCloud. (Nom triat pel constructor.)
- Dossier font: `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Mouseion/Studia/grammateion/hebreu/curs-master/dossier/`, llegit amb la variable `DOSSIER` (per defecte, aquesta ruta). L'app no escriu mai al vault.
- Els `⁇` no es resolen: els resol l'autor amb la professora. Tota línia o paraula amb `⁇` surt amb la marca «per comprovar», sense àudio i fora dels exercicis i del repàs.
- Vocabulari sempre amb vocals; diàlegs, textos i exercicis sense, amb un botó per mostrar-les. Les vocals afegides i tot material que no és al dossier porten la marca «extra».
- Tot el text de la interfície en català, sentence case. Hebreu en FrankRuehl CLM (quadrada) i Gveret Levin (cursiva), de `dossier/eines/fonts/`, copiades a `public/fonts/` amb les llicències.
- Imatges: Phosphor duotone en blanc sobre plafó de color sòlid; color per unitat (u1 `#E35D8F`, u2 `#4A90E2`, u3 `#F2A93B`, u4 `#7B6CF6`, u5 `#3DB8A5`, u6 `#FF7A59`, u7 `#8BC34A`, u8 `#C06BD6`, u9 `#26A6D1`, u10 `#E0794A`). Paraules de funció sense imatge.
- Àudio: veu `Carmit` (l'única hebrea instal·lada; comprovat el 2026-11-03), dues velocitats, fitxers `.m4a` generats per endavant. Sense síntesi de veu en temps real ni reconeixement de veu.
- Cap unitat bloquejada. Progrés local, amb exportació i importació en fitxer.
- Commits acabats amb `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Focus de la revisió

1. Línia amb `⁇` en una sola de les dues columnes de la transcripció (com a la pàg. 8): ha de quedar «per comprovar» igualment, i no pot sortir en cap exercici ni tenir àudio. Test a la tasca 3 i a la tasca 4.
2. Vocals afegides que no corresponen al text del dossier (una lletra canviada en picar-les): el generador ha de fallar amb el número de pàgina i de línia, no publicar-ho. Test a la tasca 4.
3. `localStorage` buit, bloquejat (navegació privada) o amb dades corruptes, o un fitxer d'importació d'una altra versió: l'app arrenca igualment, avisa i no esborra el progrés existent. Test a la tasca 6.
4. Fitxer d'àudio que no hi és (no generat o sense connexió en la primera càrrega): el botó de so es desactiva, sense error. Test a la tasca 7.
5. Respostes amb vocals o sense, amb maqaf (־) o guionet, o amb espais de més: compten com la mateixa resposta. Test a la tasca 2.

---

### Tasca 1: esquelet del repositori

**Fitxers:**
- Crear: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/app.tsx`, `.gitignore`, `README.md`
- Test: `src/app.test.tsx`

**Interfícies:**
- Produeix: `npm run dev`, `npm test`, `npm run build` (sortida a `dist/`); `vite.config.ts` amb `base: process.env.BASE ?? '/'`.

- [ ] **Pas 1:** `mkdir ~/Projects/ulpan && git init`; Vite amb plantilla `preact-ts`; afegir Vitest, jsdom i @testing-library/preact.
- [ ] **Pas 2: test que falla.** `app.test.tsx`: `render(<App />)` mostra el text «Hebreu del màster».
- [ ] **Pas 3:** `npm test` → FAIL.
- [ ] **Pas 4:** `App` retorna un `<h1>Hebreu del màster</h1>`.
- [ ] **Pas 5:** `npm test` → PASS; `npm run build` acaba sense errors.
- [ ] **Pas 6:** commit «chore: esquelet Vite + Preact + Vitest».

### Tasca 2: tipus del contingut i utilitats d'hebreu

**Fitxers:**
- Crear: `src/contingut/tipus.ts`, `src/hebreu.ts`
- Test: `src/hebreu.test.ts`

**Interfícies:**
- Produeix (`tipus.ts`):
  ```ts
  type Hebreu = { u: string; n?: string; extraVocals?: boolean } // u = com al dossier; n = amb vocals
  type Paraula = { id: string; hebreu: string; formes?: string[]; translit: string; ca: string; pagina: string; icona?: string; funcio: boolean; extra: boolean; perComprovar: boolean; audio?: Audio }
  type Linia = { id: string; qui?: string; text: Hebreu; ca?: string; perComprovar: boolean; audio?: Audio }
  type Text = { id: string; pagina: string; titol: Hebreu & { ca: string; perComprovar: boolean }; tipus: 'dialeg' | 'text'; personatges?: string[]; linies: Linia[] }
  type PuntGramatica = { id: string; titol: string; explicacio: string; exemples: Linia[]; extra: boolean }
  type Exercici =
    | { id: string; tipus: 'forat'; frase: Hebreu; opcions: string[]; correcta: number; retro: string; origen: string; extra: boolean }
    | { id: string; tipus: 'construir'; ca: string; fitxes: string[]; ordre: number[]; origen: string; extra: boolean }
    | { id: string; tipus: 'conjugar'; base: Hebreu; demana: string; opcions: string[]; correcta: number; origen: string; extra: boolean }
    | { id: string; tipus: 'comprensio'; text: string; pregunta: string; opcions: string[]; correcta: number; origen: string; extra: boolean }
    | { id: string; tipus: 'autocorreccio'; enunciat: Hebreu; model: Hebreu; origen: string; extra: boolean }
  type Audio = { normal: string; lent: string } // noms de fitxer dins public/audio/
  type Unitat = { id: string; num: number; titol: string; color: string; pagines: string[]; vocabulari: Paraula[]; gramatica: PuntGramatica[]; textos: Text[]; exercicis: Exercici[] }
  ```
  `origen` = `"pag-08 ex. 1.3"` per als del dossier o `"extra"`.
- Produeix (`hebreu.ts`): `treuVocals(s: string): string` (elimina U+0591–U+05C7 excepte U+05BE maqaf); `normalitza(s: string): string` (treu vocals, maqaf i guionet → espai, espais col·lapsats, `trim`); `iguals(a: string, b: string): boolean`; `teComprovar(s: string): boolean`; `senseComprovar(s: string): string` (treu `⁇` i l'espai sobrant).

- [ ] **Pas 1: tests que fallen.**
  ```ts
  expect(treuVocals('כִּיתָּה')).toBe('כיתה')
  expect(treuVocals('בִּדְרוֹם־אֲמֶרִיקָה')).toBe('בדרום־אמריקה')
  expect(iguals('בַּבַּיִת', 'בבית')).toBe(true)
  expect(iguals('דרום-אמריקה', 'דְּרוֹם־אֲמֶרִיקָה')).toBe(true)
  expect(iguals(' אני  גר ', 'אני גר')).toBe(true)
  expect(iguals('בבית', 'לבית')).toBe(false)
  expect(teComprovar('מִבְּרָזִיל ⁇?')).toBe(true)
  expect(senseComprovar('מִבְּרָזִיל ⁇?')).toBe('מִבְּרָזִיל?')
  ```
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar `hebreu.ts` i `tipus.ts`.
- [ ] **Pas 4:** `npm test` → PASS.
- [ ] **Pas 5:** commit «feat: tipus del contingut i utilitats d'hebreu».

### Tasca 3: lectors del dossier

**Fitxers:**
- Crear: `scripts/dossier/vocabulari.ts`, `scripts/dossier/pagina.ts`
- Test: `scripts/dossier/*.test.ts`, amb fixtures copiades tal qual a `scripts/dossier/fixtures/` (`pag-08.md`, `pag-28.md`, `u05-vocabulari.tsv`)

**Interfícies:**
- Produeix: `llegeixVocabulari(tsv: string): Paraula[]` i `llegeixPagina(md: string, nom: string): Pagina`, amb `type Pagina = { nom: string; paginaOriginal: number; titol: { he: string; ca: string }; blocs: { titol?: { text: string; perComprovar: boolean }; linies: { text: string; perComprovar: boolean }[] }[]; vocabulariMarge: { text: string; perComprovar: boolean }[] }`. `titol` surt del camp `titol:` del frontmatter (hebreu abans de « — », català després).
- Regles del TSV: ignorar les línies `#`; camp 1 = hebreu, separat en `hebreu` + `formes` per ` / ` o `, `; camp 2 = significat, amb la transliteració a l'últim parèntesi (abans del primer `;` que hi hagi dins); camp 3 = pàgina; camp 4 = etiquetes. `funcio = true` si les etiquetes inclouen `pronom`, `particula`, `preposicio`, `interrogatiu` o `conjuncio` (el constructor completa la llista revisant els TSV). `id` = `<unitat>-<índex>`.
- Regles de la pàgina: cada callout `> [!hebreu]` és un bloc, amb el títol del darrer `## ` anterior (sense `⁇`, i `perComprovar` si en tenia); cada fila de taula és una línia; text = primera columna sense `⁇`; `perComprovar` si qualsevol de les dues columnes en té. Les línies `[il·lustració: …]` i el blockquote de la nota de transcripció s'ignoren. El bloc «Vocabulari (marge)» va a `vocabulariMarge`.

- [ ] **Pas 1: tests que fallen.**
  - `llegeixVocabulari(u05)[0]` → `{ hebreu: 'יֵשׁ', translit: 'yesh', ca: 'hi ha', pagina: 'pag-28', perComprovar: false }`.
  - Una entrada `תַּלְמִיד / תַּלְמִידָה` → `hebreu: 'תַּלְמִיד'`, `formes: ['תַּלְמִידָה']`, `translit: 'talmid / talmida'`.
  - `llegeixPagina(pag08).blocs[1].linies[7]` → `perComprovar: true` i text sense `⁇` (el `⁇` només és a la segona columna).
  - `llegeixPagina(pag28).blocs[0]`: `titol.perComprovar` → `true`, 20 línies, la primera `איפה אתה גר, רוברטו?` i la darrera `ככה-ככה.`; `titol.he` → `בָּאוּלְפָּן בְּקִיבּוּץ דָּן`.
  - `llegeixPagina(pag08).vocabulariMarge[1].perComprovar` → `true`.
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar els dos lectors.
- [ ] **Pas 4:** `npm test` → PASS. Passar els dos lectors per les 58 pàgines i els 10 TSV reals (`DOSSIER=… npx tsx scripts/dossier/prova.ts`): cap excepció, 325 paraules, i el recompte de `⁇` coincideix amb `grep -o "⁇" pag-*.md | wc -l` (cada línia compta un cop, encara que en tingui més d'un).
- [ ] **Pas 5:** commit «feat: lectors del dossier (vocabulari i pàgines)».

### Tasca 4: capa curada i generador de contingut

**Fitxers:**
- Crear: `contingut/unitats.yaml` (número, títol, color, pàgines i fitxers de vocabulari de cada unitat, segons § 5.3 del disseny), `contingut/u01.yaml` … `u10.yaml` (de moment buits, excepte el que facin servir els tests), `scripts/genera-contingut.ts`, `scripts/valida.ts`
- Test: `scripts/genera-contingut.test.ts`, `scripts/valida.test.ts`
- Sortida: `public/contingut/index.json`, `public/contingut/u01.json` … `u10.json`

**Interfícies:**
- Consumeix: lectors de la tasca 3, `treuVocals`, `iguals`.
- Produeix: `npm run contingut`; `combina(unitat: UnitatBase, pagines: Pagina[], vocab: Paraula[], curat: Curat): Unitat`; `valida(u: Unitat, curat: Curat): Error[]`.
- Format de `uNN.yaml`:
  ```yaml
  icones: { "u05-3": house }            # id de paraula → nom Phosphor o "propia:<fitxer>.svg"
  textos:
    pag-28:
      tipus: dialeg
      personatges: [Entrevistador, Roberto]
      qui: [0, 1, 0, 1, ...]              # índex de personatge per línia (si no hi és, alternen)
      vocals: { 0: "אֵיפֹה אַתָּה גָּר, רוֹבֶּרְטוֹ?", ... }   # índex de línia → text amb vocals
      ca: { 0: "On vius, Roberto?", ... }
  gramatica: [ { id, titol, explicacio, exemples: [ { u, n, ca, extra } ] } ]
  exercicis: [ ... ]                     # forma de la tasca 2, sense camp id: el genera el combinador
  extres: { vocabulari: [ ... ] }       # paraules noves, sempre extra: true
  ```
- Errors de validació (el generador surt amb codi 1 i els llista): vocals que no coincideixen (`!iguals(n, u)`, missatge amb pàgina i línia); exercici que cita una línia o paraula `perComprovar`; icona que no és a la llista de Phosphor ni a `public/imatges/`; `correcta` fora de rang; material de `extres` sense `extra: true`.

- [ ] **Pas 1: tests que fallen.**
  - `combina` amb la fixture de la pàg. 28 i un `curat` amb `vocals: {0: 'אֵיפֹה אַתָּה גָּר, רוֹבֶּרְטוֹ?'}` → `textos[0].linies[0].text` = `{ u: 'איפה אתה גר, רוברטו?', n: 'אֵיפֹה…', extraVocals: true }`.
  - `valida` amb `vocals: {0: 'אֵיפֹה אַתָּה גָּרָה'}` → un error que conté «pag-28» i «línia 1».
  - `valida` amb un exercici `forat` amb `origen: 'pag-08 ex. 1.8'` → error «per comprovar».
  - `valida` amb `icones: {"u05-3": "no-existeix"}` → error.
  - Una paraula de `extres` sense `extra` → error.
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar `combina`, `valida` i el CLI.
- [ ] **Pas 4:** `npm test` → PASS; `npm run contingut` genera els deu JSON (només amb el contingut del vault) sense errors.
- [ ] **Pas 5:** commit «feat: generador de contingut amb validació».

### Tasca 5: generador d'àudio

**Fitxers:**
- Crear: `scripts/genera-audio.ts`
- Test: `scripts/genera-audio.test.ts`
- Sortida: `public/audio/*.m4a` (al repositori: cal que vagin a Pages), i el camp `audio` omplert als JSON

**Interfícies:**
- Consumeix: els JSON de la tasca 4.
- Produeix: `npm run audio`; `clauAudio(text: string, velocitat: 'normal' | 'lent'): string` (sha1 de `Carmit|<velocitat>|<text>`, 12 caràcters hex, `.m4a`); `itemsAudibles(u: Unitat): { text: string; desti: Paraula | Linia }[]`.
- El text que es diu és `n` si n'hi ha, i si no `u`. Velocitats: `say -v Carmit -r 170` (normal) i `-r 110` (lent), a `.aiff` temporal i `afconvert -f m4af -d aac` a `public/audio/`. Si el fitxer ja existeix, no es torna a generar.

- [ ] **Pas 1: tests que fallen.** `clauAudio` és determinista i diferent per a cada velocitat; `itemsAudibles` d'una unitat amb una línia `perComprovar` no la inclou; una línia amb `n` fa servir `n`.
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar.
- [ ] **Pas 4:** `npm test` → PASS; `npm run audio` per a la u01; escoltar-ne tres fitxers (`afplay`) i comprovar que és Carmit i que se sent bé.
- [ ] **Pas 5:** commit «feat: generador d'àudio amb Carmit».

### Tasca 6: progrés i repetició espaiada

**Fitxers:**
- Crear: `src/progres/srs.ts`, `src/progres/magatzem.ts`
- Test: `src/progres/*.test.ts`

**Interfícies:**
- Produeix:
  ```ts
  type Fitxa = { caixa: number; venc: number; encerts: number; errors: number } // venc = ms epoch
  type Progres = { versio: 1; fitxes: Record<string, Fitxa>; vist: Record<string, number>; darrera?: { unitat: string; pas: string } }
  respon(p: Progres, id: string, encert: boolean, ara: number): Progres  // pur
  pendents(p: Progres, ara: number): string[]                          // vençudes, primer les més antigues
  interface Magatzem { llegeix(): Progres; desa(p: Progres): void; disponible: boolean }
  magatzemLocal(clau = 'ulpan:progres'): Magatzem
  exporta(p: Progres): string; importa(json: string): Progres          // importa llança ErrorImportacio
  ```
- Caixes de Leitner amb intervals `[0, 1, 2, 4, 8, 16, 32]` dies: un encert puja una caixa (màxim 6) i un error torna a la caixa 1. (L'algorisme és decisió del constructor segons el disseny; aquest queda fixat aquí.)

- [ ] **Pas 1: tests que fallen.**
  - `respon(buit, 'a', true, T)` → caixa 1, venc T + 1 dia; dos encerts més → caixa 3, venc + 4 dies; un error → caixa 1.
  - `pendents` retorna només les fitxes amb `venc <= ara`, ordenades.
  - `magatzemLocal` amb un `localStorage` que llança error → `disponible: false`, `llegeix()` retorna un progrés buit, `desa` no llança.
  - Amb JSON corrupte a `localStorage` → progrés buit, i el valor corrupte es copia a `ulpan:progres:corrupte` (no es perd).
  - `importa('{"versio":2}')` i `importa('no és json')` → `ErrorImportacio`; `importa(exporta(p))` → igual a `p`.
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar.
- [ ] **Pas 4:** `npm test` → PASS.
- [ ] **Pas 5:** commit «feat: progrés local i repetició espaiada».

### Tasca 7: carcassa de l'app, inici i unitat

**Fitxers:**
- Crear: `src/app.tsx` (substituir), `src/rutes.ts`, `src/estil/*.css`, `src/peces/{Hebreu,BotoSo,TargetaParaula,Marques}.tsx`, `src/pantalles/{Inici,Unitat,Vocabulari}.tsx`, `src/preferencies.ts`, `public/fonts/*`
- Test: `src/pantalles/*.test.tsx`, `src/peces/*.test.tsx`

**Interfícies:**
- Consumeix: JSON de `public/contingut/`, `Magatzem`, `pendents`.
- Produeix: rutes amb hash `#/`, `#/u/<id>`, `#/u/<id>/vocabulari`, `#/u/<id>/gramatica/<n>`, `#/u/<id>/exercicis`, `#/u/<id>/text/<pag>`, `#/repas`, `#/alefat` (pàgina de consulta amb la taula de la pàg. 1), `#/ajustos`; `<Hebreu valor={Hebreu} />` (mostra `u` o `n` segons la preferència `vocals`, i `quadrada` o `cursiva` segons `lletra`); `<BotoSo audio={Audio | undefined} />` (toc: velocitat normal; toc llarg o segon botó «lent»: velocitat lenta); `<Marques extra perComprovar />`; `usePreferencies(): { vocals: boolean; lletra: 'quadrada' | 'cursiva'; set… }`.
- Aspecte: el de `app-maquetes.html` (pantalles 1 i 3). Targeta de paraula com al § 7 del disseny. `#/ajustos` porta els botons d'exportar i importar el progrés.

- [ ] **Pas 1: tests que fallen.**
  - `Inici` amb 3 fitxes vençudes mostra «3 per repassar» i la llista de deu unitats amb el seu color.
  - `TargetaParaula` mostra quadrada amb vocals, cursiva sense vocals, transliteració, català; sense `icona` mostra el plafó sense imatge; amb `funcio: true` no mostra cap plafó.
  - `BotoSo` sense `audio`, o quan l'element `<audio>` dispara `error`, queda `disabled` i no llança.
  - `Hebreu` amb `vocals: false` mostra `u`; amb `true`, `n` (o `u` si no n'hi ha); amb `extraVocals` i les vocals visibles, porta la marca «extra».
  - Un element `perComprovar` mostra «⁇ per comprovar» i no té botó de so.
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar.
- [ ] **Pas 4:** `npm test` → PASS; `npm run dev` i mirar-ho al navegador a 390 px i a 1440 px (iframes, sense redimensionar el navegador).
- [ ] **Pas 5:** commit «feat: inici, unitat i targeta de paraula».

### Tasca 8: exercicis, gramàtica i repàs ràpid

**Fitxers:**
- Crear: `src/exercicis/{Forat,Construir,Conjugar,Comprensio,Autocorreccio,TriaImatge}.tsx`, `src/exercicis/sessio.ts`, `src/pantalles/{Gramatica,Exercicis,Repas}.tsx`
- Test: `src/exercicis/*.test.ts(x)`

**Interfícies:**
- Consumeix: `Unitat`, `Progres`, `respon`, `pendents`, `iguals`.
- Produeix: `type Pas = { tipus: 'paraula-nova' | 'tria-imatge' | 'imatge-paraula' | 'so-paraula' | Exercici['tipus']; ref: string }`; `sessioUnitat(u: Unitat, p: Progres): Pas[]` (paraules no vistes en tandes de 5, després exercicis de la unitat barrejats); `sessioRepas(unitats: Unitat[], p: Progres, ara: number, minuts: number): Pas[]` (vençudes primer; 5 minuts ≈ 20 passos); `opcionsDistractores(correcta: Paraula, totes: Paraula[], n = 3): Paraula[]` (de la mateixa unitat si n'hi ha prou, mai paraules de funció a `tria-imatge`).
- Tots els exercicis responen amb `onRespon(encert: boolean)`, i els que són de text comparen amb `iguals`. `Construir` posa les fitxes de dreta a esquerra i en té una que sobra (la defineix el YAML). `Autocorreccio` mostra el model i dos botons, «L'he encertat» / «M'he equivocat».

- [ ] **Pas 1: tests que fallen.**
  - `sessioRepas` no inclou mai un id `perComprovar`, ni a les respostes ni als distractors.
  - `sessioRepas(…, 5)` retorna com a màxim 20 passos, primer els vençuts.
  - `opcionsDistractores` no repeteix la correcta ni retorna paraules de funció per a `tria-imatge`.
  - `Forat`: triar l'opció correcta crida `onRespon(true)` i mostra `retro`.
  - `Construir`: tocar les fitxes en l'ordre bo i «Comprova» → `onRespon(true)`; la fitxa que sobra a la línia → `false`.
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar.
- [ ] **Pas 4:** `npm test` → PASS; fer una sessió de repàs sencera al navegador.
- [ ] **Pas 5:** commit «feat: exercicis, gramàtica i repàs ràpid».

### Tasca 9: converses

**Fitxers:**
- Crear: `src/conversa/reproductor.ts`, `src/pantalles/Conversa.tsx`
- Test: `src/conversa/*.test.ts(x)`

**Interfícies:**
- Consumeix: `Text`, `BotoSo`, preferències.
- Produeix: `type Mode = { tipus: 'escoltar' } | { tipus: 'repetir' } | { tipus: 'personatge'; jo: number }`; `passos(t: Text, m: Mode): { linia: number; accio: 'sona' | 'silenci' }[]`; durada del silenci = durada de l'àudio de la línia × 1,3 + 1 s.
- Hi ha una sola veu hebrea (Carmit): els personatges es distingeixen per la posició i el color de la bombolla, no per la veu. (Canvi respecte al § 6.4 del disseny, que deia «si n'hi ha més d'una».)

- [ ] **Pas 1: tests que fallen.**
  - `repetir` → cada línia `sona` i després `silenci`.
  - `personatge`, `jo: 1` → les línies de l'altre `sona`; les meves només `silenci`.
  - Una línia `perComprovar` → no sona ni té silenci; es mostra amb la marca.
  - A la pantalla, en mode personatge, les meves línies estan amagades fins que es toca «Mostra el meu torn».
- [ ] **Pas 2:** `npm test` → FAIL.
- [ ] **Pas 3:** implementar (l'aspecte, el de la pantalla 6 de les maquetes).
- [ ] **Pas 4:** `npm test` → PASS; provar el diàleg de la pàg. 28 en els tres modes.
- [ ] **Pas 5:** commit «feat: converses (escoltar, repetir, fer de personatge)».

### Tasca 10: contingut de la unitat 1

**Fitxers:**
- Modificar: `contingut/u01.yaml`; afegir `public/imatges/*.svg` si cal

- [ ] **Pas 1:** icones per a cada paraula de la u01 que no sigui de funció; per a les que no tenen icona a Phosphor, SVG propi de 256×256 amb el traç de Phosphor duotone (gruix 16, segona capa amb opacitat 0,2); si no es fa ara, se'n deixa la icona buida.
- [ ] **Pas 2:** gramàtica a partir de `unitats/u01-presentacions.md`: un punt per secció, explicació de dues línies com a màxim, exemples del dossier primer i els extra marcats.
- [ ] **Pas 3:** vocals de cada línia de diàleg i exercici (pàg. 02-09), verificades paraula per paraula amb els TSV del dossier i amb Pealim/Logeion; cap paraula dubtosa: si n'hi ha alguna, es deixa sense `n` i es llista per a l'autor.
- [ ] **Pas 4:** exercicis 1 i 2 del dossier en forma interactiva (pàg. 8: `forat` amb pronoms; pàg. 9: el que toqui), amb les solucions; més exercicis extra dels cinc tipus, fins a uns 25 per unitat.
- [ ] **Pas 5:** `npm run contingut && npm run audio` sense errors; recórrer la unitat 1 sencera al navegador.
- [ ] **Pas 6:** commit «content: unitat 1».

### Tasca 11: funcionament sense connexió i GitHub Pages

**Fitxers:**
- Modificar: `vite.config.ts` (afegir `vite-plugin-pwa`, que precarrega `contingut/`, `fonts/` i `imatges/`, i l'àudio en memòria cau mentre es fa servir)
- Crear: `public/manifest.webmanifest`, `public/icona-*.png`, `.github/workflows/pages.yml`

- [ ] **Pas 1:** PWA amb nom «Hebreu del màster», `start_url` relativa i icona del tema.
- [ ] **Pas 2:** workflow: `npm ci && npm test && BASE=/ulpan/ npm run build`, i publicar `dist/` amb `actions/deploy-pages`. Els JSON i l'àudio van al repositori, perquè CI no pot llegir el vault ni executar `say`.
- [ ] **Pas 3:** confirmar amb l'autor abans de crear el repositori públic i de fer el primer push (`gh repo create jmganyet/ulpan --public`).
- [ ] **Pas 4:** comprovar `https://jmganyet.github.io/ulpan/` al navegador; després, sense connexió, tornar a carregar i fer una sessió de repàs.
- [ ] **Pas 5:** commit «build: PWA i GitHub Pages».

### Tasca 12: app de Mac amb Tauri

**Fitxers:**
- Crear: `src-tauri/` (amb `npm run tauri init`), scripts `tauri:dev` i `tauri:build`

- [ ] **Pas 1:** Rust no hi és instal·lat. Demanar a l'autor que l'instal·li amb `rustup` (o el seu permís per fer-ho).
- [ ] **Pas 2:** `tauri init` amb `frontendDist: ../dist`, `devUrl: http://localhost:5173`, identificador `cat.ganyet.ulpan`, finestra de 1100×760.
- [ ] **Pas 3:** `npm run tauri:dev`: comprovar que sonen els `.m4a` dins la WebView, que es carreguen les fonts i que el progrés es desa entre dues obertures.
- [ ] **Pas 4:** `npm run tauri:build`; deixar l'`.app` a `/Applications` amb el permís de l'autor.
- [ ] **Pas 5:** commit «build: app de Mac amb Tauri».

### Tasca 13: contingut de les unitats 2 a 10

- [ ] **Passos:** el procediment de la tasca 10, una unitat per commit («content: unitat N»), en l'ordre del temari. Després de cada unitat: `npm run contingut && npm run audio && npm test`, i el push publica a Pages.
