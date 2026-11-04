// Sons breus i fluixos d'encert i d'error, sintetitzats amb Web Audio (sense fitxers).

type Nota = { freq: number; fins?: number; inici: number; durada: number; forma: OscillatorType; volum: number }

// Encert: dues notes ascendents curtes (mi5 → la5). Error: una nota greu que baixa una mica.
const ENCERT: Nota[] = [
  { freq: 659.25, inici: 0, durada: 0.09, forma: 'sine', volum: 0.12 },
  { freq: 880, inici: 0.08, durada: 0.14, forma: 'sine', volum: 0.12 },
]
const ERROR: Nota[] = [
  { freq: 220, fins: 185, inici: 0, durada: 0.2, forma: 'triangle', volum: 0.12 },
]

let context: AudioContext | null = null

function obteContext(): AudioContext | null {
  if (context) return context
  const Ctor = (globalThis as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
    ?? (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  context = new Ctor()
  return context
}

function toca(ctx: AudioContext, n: Nota): void {
  const t0 = ctx.currentTime + n.inici
  const osc = ctx.createOscillator()
  const guany = ctx.createGain()
  osc.type = n.forma
  osc.frequency.setValueAtTime(n.freq, t0)
  if (n.fins) osc.frequency.exponentialRampToValueAtTime(n.fins, t0 + n.durada)
  // Atac i caiguda suaus perquè no faci clic.
  guany.gain.setValueAtTime(0.0001, t0)
  guany.gain.exponentialRampToValueAtTime(n.volum, t0 + 0.015)
  guany.gain.exponentialRampToValueAtTime(0.0001, t0 + n.durada)
  osc.connect(guany).connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + n.durada + 0.02)
}

/** Fa sonar el so d'encert o d'error. Mai no llança: si el navegador no té àudio, no sona. */
export function sonaResposta(encert: boolean): void {
  try {
    const ctx = obteContext()
    if (!ctx) return
    const notes = encert ? ENCERT : ERROR
    // Chrome i Safari creen el context aturat: cal esperar que es desperti abans de programar les notes.
    if (ctx.state === 'running') notes.forEach((n) => toca(ctx, n))
    else void ctx.resume().then(() => notes.forEach((n) => toca(ctx, n))).catch(() => {})
  } catch {
    // sense àudio: res
  }
}

/** Ms entre el so d'encert i la paraula dita en veu alta (perquè no es trepitgin). */
export const RETARD_ENCERT = 450
