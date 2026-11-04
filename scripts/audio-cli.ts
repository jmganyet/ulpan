// Ús: npm run audio [-- u01]  → genera l'àudio que falta (opcionalment d'una sola unitat) i refà el contingut
// Requisits: macOS (`say`, `afconvert`), ffmpeg i edge-tts (`uv tool install edge-tts`) per a les veus dels diàlegs.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import type { Unitat } from '../src/contingut/tipus'
import { generaAudio, itemsAudibles } from './genera-audio'

const arrel = process.cwd()
const filtre = process.argv[2]
const dirContingut = join(arrel, 'public/contingut')
const dirAudio = join(arrel, 'public/audio')

// Cal el JSON base (npm run contingut) per saber què és audible.
execFileSync('npx', ['tsx', 'scripts/contingut-cli.ts'], { stdio: 'inherit' })
const fitxers = readdirSync(dirContingut).filter((f) => /^u\d+\.json$/.test(f) && (!filtre || f === `${filtre}.json`))
if (!fitxers.length) { console.error(`Cap unitat coincideix amb «${filtre}».`); process.exit(1) }
const items = fitxers.flatMap((f) => itemsAudibles(JSON.parse(readFileSync(join(dirContingut, f), 'utf8')) as Unitat))
const t0 = Date.now()
const r = await generaAudio(items, dirAudio)
console.log(`Àudio: ${r.generats} generats, ${r.existents} ja existents (${((Date.now() - t0) / 1000).toFixed(1)} s)`)
execFileSync('npx', ['tsx', 'scripts/contingut-cli.ts'], { stdio: 'inherit' })
