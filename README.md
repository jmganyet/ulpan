# Ulpan

Aplicació web per aprendre hebreu a partir del dossier del màster: vocabulari amb vocals,
diàlegs, exercicis i repàs, amb àudio generat per endavant i progrés desat al navegador.

- `npm install` instal·la les dependències.
- `npm run dev` arrenca el servidor de desenvolupament.
- `npm test` executa les proves (Vitest, una sola passada).
- `npm run build` genera el web a `dist/` (`BASE=/ulpan/` per desplegar en un subdirectori).

## Fer-la servir en aquest Mac

1. `npm run local` construeix l'app i la serveix a `http://localhost:4173`.
2. Obre `http://localhost:4173` al Chrome.
3. Menú → «Instal·la Hebreu del màster…». S'obre en una finestra pròpia i, després de la primera visita, funciona sense connexió; l'àudio es desa a mesura que se sent.
