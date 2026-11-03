// Formats d'id:
//   Text    -> `pag-NN-bK`        (bloc K de la pàgina NN)
//   Linia   -> `pag-NN-bK-lJ`     (J, base 0)
//   Paraula -> `uNN-<index>`
// `linies` dels exercicis: ids de Linia/Paraula que fa servir; la validació
// rebutja els exercicis que referencien elements «per comprovar».

export type Audio = { normal: string; lent: string } // noms de fitxer dins public/audio/

export type Hebreu = { u: string; n?: string; extraVocals?: boolean } // u = com al dossier; n = amb vocals

export type Paraula = {
  id: string; hebreu: string; formes?: string[]; translit: string; ca: string; pagina: string
  icona?: string; funcio: boolean; extra: boolean; perComprovar: boolean; audio?: Audio
}

// subratllat: mots de la línia que el dossier subratlla (sense etiquetes; el text ja no en porta).
// nota: nota del transcriptor en català (R25): sense àudio, es mostra com a nota, no com a hebreu.
export type Linia = {
  id: string; qui?: string; text: Hebreu; ca?: string; perComprovar: boolean; extra?: boolean; audio?: Audio
  subratllat?: string[]; nota?: boolean
}

export type Text = {
  id: string; pagina: string; titol: Hebreu & { ca: string; perComprovar: boolean }
  tipus: 'dialeg' | 'text'; personatges?: string[]; linies: Linia[]
}

export type PuntGramatica = { id: string; titol: string; explicacio: string; exemples: Linia[]; extra: boolean }

type Base = { id: string; origen: string; extra: boolean; linies?: string[] } // origen = "pag-08 ex. 1.3" o "extra"

export type Exercici =
  | (Base & { tipus: 'forat'; frase: Hebreu; opcions: string[]; correcta: number; retro: string })
  | (Base & { tipus: 'construir'; ca: string; fitxes: string[]; ordre: number[] })
  | (Base & { tipus: 'conjugar'; base: Hebreu; demana: string; opcions: string[]; correcta: number })
  | (Base & { tipus: 'comprensio'; text: string; pregunta: string; opcions: string[]; correcta: number })
  | (Base & { tipus: 'autocorreccio'; enunciat: Hebreu; model: Hebreu })

export type Unitat = {
  id: string; num: number; titol: string; color: string; pagines: string[]
  vocabulari: Paraula[]; gramatica: PuntGramatica[]; textos: Text[]; exercicis: Exercici[]
}
