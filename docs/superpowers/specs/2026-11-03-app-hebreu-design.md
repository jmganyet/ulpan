---
tipus: nota
resum: "Disseny d'una app per estudiar el dossier d'hebreu del màster (UB) unitat per unitat: vocabulari amb imatges a l'estil Drops, gramàtica, verbs i converses de situació amb àudio, per a Mac (Tauri) i navegador (GitHub Pages)."
---
# App d'hebreu del curs del màster: disseny

Data: 2026-11-03 · Estat: esborrany per aprovar

## 1. Intenció

L'autor estudia hebreu modern al màster de la UB amb un dossier de fotocòpies d'un mètode d'ulpan (pàg. 10-66), ja transcrit pàgina a pàgina i agrupat en deu unitats a `Studia/grammateion/hebreu/curs-master/dossier/`. Vol una app que li permeti treballar aquest temari gradualment, pas a pas i amb mètode, en qualsevol lloc i en sessions que van de pocs minuts a una hora.

La referència d'experiència és Drops: visual, tàctil, ràpida, amb so i amb repetició espaiada. Però Drops només fa vocabulari, i aquí cal també gramàtica, verbs i converses.

Èxit: que l'app sigui el lloc on l'autor repassa i consolida el que veu a classe, fins que ja no la necessiti perquè sap hebreu.

## 2. Objectius

- Vocabulari de les deu unitats, amb imatge, so, quadrada, cursiva, transliteració i català.
- Gramàtica i verbs de cada unitat: explicació curta i exercicis interactius.
- Converses de situació del dossier per escoltar i repetir.
- Pronunciació: escoltar i repetir (veu sintètica en hebreu).
- Funcionar al Mac com a app i en qualsevol navegador (també al mòbil).

## 3. No-objectius

- Ensenyar l'alefat: l'autor ja llegeix quadrada i cursiva. No hi ha curs de lletres ni exercicis de caligrafia.
- Avaluar la pronunciació de l'autor (reconeixement de veu): només escoltar i repetir.
- Sincronitzar el progrés entre aparells (de moment). Vegeu § 9.
- Escriure hebreu amb teclat com a mecànica principal: tot es fa tocant i arrossegant.

## 4. Anti-objectius (el que la faria fracassar encara que funcionés)

- Que s'aparti del temari: el dossier (el PDF) mana en l'ordre, el vocabulari i la gramàtica.
- Que bloquegi l'autor: el ritme el marca ell, mai l'app.
- Que sigui lenta o carregada: una estona de cinc minuts ha de començar en un toc.
- Que doni per bo hebreu incorrecte: cap forma, vocal o traducció inventada sense verificar.

## 5. Contingut

### 5.1. Font i autoritat

- Font: les transcripcions `dossier/pag-NN.md`, les fitxes `dossier/unitats/uNN-*.md` (gramàtica), `uNN-vocabulari.md/.tsv` (vocabulari, 325 entrades) i les notes de context. Mana el PDF (`dossier/hebreu-dossier-curs-master.pdf`) i les imatges `dossier/pagines/pag-NN.png`: si una transcripció no hi coincideix, guanya la imatge.
- Les transcripcions tenen uns 137 `⁇` i estat `transcrit-pendent-revisio`. Els resol l'autor amb la professora, al vault; el constructor no els toca. El vault és l'única font: el contingut de l'app es genera a partir dels fitxers del dossier amb un script que es pot tornar a executar cada cop que l'autor en resolgui. Mentrestant, una línia o una paraula amb `⁇` surt a l'app amb una marca de «per comprovar», sense àudio i fora dels exercicis i del repàs. (Decisió de l'autor, 2026-11-03; el tractament a l'app és decisió de disseny.)
- Morfologia i vocals de tot material afegit: validades amb fonts externes (Pealim per als verbs, diccionari) abans d'entrar.

### 5.2. Ampliacions

Es pot afegir material que no és al dossier sempre que sigui del mateix tema de la unitat: més exemples, mots del mateix camp, formes que el dossier no dona, frases noves per als exercicis. Tot aquest material porta una marca discreta («extra») perquè l'autor distingeixi el temari del que no ho és. (Decisió de disseny, no demanada per l'autor; es pot treure.)

### 5.3. Estructura

Deu unitats, en l'ordre del dossier:

1. Presentacions (pàg. 10-17)
2. Demostratius i família (18-22)
3. On vius i què fas (23-27)
4. Possessió i salutacions (28-35)
5. Anar i venir (36-40)
6. A la classe (41-47)
7. Saps hebreu? (48-51)
8. L'infinitiu i els verbs modals (52-57)
9. Per què i si (58-62)
10. El passat de לִהְיוֹת (63-66)

La taula de l'alefat (pag-01) hi pot ser com a pàgina de consulta, no com a lliçó.

## 6. Com es fa servir

### 6.1. Ritme

L'app segueix l'ordre del temari però no bloqueja res: totes les unitats estan obertes. Mostra on és l'autor i què té fluix (per unitat i per tipus de contingut), i proposa per on continuar.

### 6.2. Dues velocitats (proposta de disseny)

- Estona curta (minuts): repàs a l'estil Drops de tot el que ja s'ha tocat (paraules, formes verbals, frases curtes), amb repetició espaiada: el que es falla torna abans, el que se sap torna més tard. Comença en un toc.
- Sessió llarga (fins a una hora): treballar una unitat en l'ordre del dossier: text o diàleg amb àudio, explicació de cada punt de gramàtica, exercicis.

### 6.3. Tipus d'exercici

L'autor els vol tots:

1. Conjugar: es mostra una forma i cal tocar la que correspon a una altra persona, gènere o nombre.
2. Construir frases: paraules desordenades per col·locar en ordre.
3. Triar la forma: frase amb un forat i tres o quatre opcions (p. ex. בַּבַּיִת / לַבַּיִת / הַבַּיְתָה).
4. Explicació curta: una pantalla amb la regla i dos o tres exemples amb àudio, abans dels exercicis.
5. Diàleg: escoltar i llegir el diàleg i respondre preguntes de comprensió.

A més, les targetes de vocabulari (hebreu ↔ català ↔ imatge ↔ so) i els exercicis del dossier (תרגיל 1-33) en versió interactiva, amb més del mateix estil. El dossier no porta solucions: les escriu el constructor, amb les opcions errònies, i passen pel mateix control que la resta de l'hebreu (§ 5.1). Un exercici obert es converteix en tancat si es pot; si no, queda en mode d'autocorrecció (fas l'exercici, veus la resposta model i et puntues tu). (Decisió de disseny.)

### 6.4. Converses de situació

Els diàlegs del dossier, només escoltar i repetir:

- Escoltar el diàleg sencer amb el text (quadrada o cursiva, a triar) i la traducció a demanda.
- Repetir frase per frase: l'app diu la frase i deixa un silenci per repetir-la.
- Fer de personatge (proposta de disseny): l'autor tria un personatge; l'app diu les rèpliques dels altres i deixa el silenci per a les seves; el text es pot amagar.

### 6.5. Pronunciació i àudio

Veu sintètica en hebreu, però generada per endavant: els àudios es fan al Mac amb les veus hebrees del sistema (`say`) i es desen com a fitxers dins l'app. Així el so és igual a tots els aparells, funciona sense connexió i no depèn que el mòbil tingui veu hebrea (molts no en tenen). Escoltar a velocitat normal i lenta. Només hi ha una veu hebrea al Mac (Carmit, comprovat el 2026-11-03): els personatges es distingeixen per la posició i el color de la bombolla. Sense reconeixement de veu. (Decisió de disseny, arran de la revisió.)

## 7. Aspecte

- Targeta de paraula (maqueta vista i acceptada): imatge a dalt; a sota la paraula en quadrada amb vocals (FrankRuehl CLM), en cursiva sense vocals (Gveret Levin; totes dues fonts a `dossier/eines/fonts/`, llicències Culmus i OFL), la transliteració en cursiva, el català i el botó de so.
- Imatges, triades per l'autor sobre maqueta: icona de Phosphor (duotone) en blanc sobre un plafó de color sòlid. Quan una paraula no té icona (persones, gentilicis, institucions, «família»…), un dibuix fet a mida amb el mateix traç i estil, de manera que no se'n noti la diferència.
- Els dibuixos a mida els fa el constructor en SVG, amb el traç de Phosphor. Mentre no hi siguin, la targeta porta el plafó de color sense imatge, i això no atura la unitat. L'autor no aprova icona per icona; marca les que no li agradin. (Decisió de disseny.)
- Paraules de funció (מִי, זֶה, שֶׁל, אִם…) sense imatge: s'aprenen en frases amb àudio. (Decisió de disseny.)
- Color del plafó per unitat, perquè en un repàs barrejat se sàpiga d'on ve cada paraula. (Decisió de disseny.)
- Text hebreu en quadrada i en cursiva a tot arreu on tingui sentit, per no perdre la lectura de cap de les dues.
- Vocals (decisió de l'autor): el vocabulari les porta sempre, com al dossier. Els diàlegs, els textos i els exercicis surten sense vocals, com al dossier, amb un botó per mostrar-les. Aquestes vocals les afegeix el constructor (no són al dossier): es verifiquen com qualsevol ampliació (§ 5.2) i porten la marca «extra». L'àudio es genera a partir de la versió vocalitzada, que la veu sintètica llegeix millor. (Això darrer és decisió de disseny.)

### 7.1. Maquetes

Sis pantalles vistes i acceptades per l'autor com a punt de partida (2026-11-03), a `app-maquetes.html` (fragment HTML; les fonts són a `dossier/eines/fonts/`): inici, repàs ràpid a l'estil Drops, explicació curta, triar la forma, construir frases i conversa fent de personatge. Es tornaran a iterar quan l'app funcioni.

## 8. Plataforma

- Un sol codi web estàtic.
- App de Mac empaquetada amb Tauri (cal instal·lar Rust; no hi ha cap projecte Tauri previ en aquest Mac).
- La mateixa app publicada a GitHub Pages, en un repositori públic del compte de l'autor, amb el contingut del dossier inclòs. Al mòbil s'obre al navegador i es pot afegir a la pantalla d'inici; ha de funcionar sense connexió un cop carregada.
- Contingut publicat en obert: decisió explícita de l'autor (2026-11-03), sabent que el dossier són fotocòpies d'un mètode publicat.
- Com que l'àudio són fitxers generats per endavant, dins Tauri només cal comprovar que es reprodueixin els `.m4a`.

## 9. Progrés

Desat localment a cada aparell, sense sincronització. Botons per exportar el progrés a un fitxer i importar-lo en un altre aparell. Les dades de progrés s'han de guardar de manera que més endavant s'hi pugui afegir sincronització amb un servidor sense refer l'app.

## 10. El que queda en mans del constructor

- Nom de l'app i del repositori.
- Format intern del contingut (un fitxer per unitat generat a partir dels `.md`/`.tsv` del dossier) i l'eina que el genera.
- L'algorisme de repetició espaiada.
- Framework web (o cap) i el detall visual, dins de l'estil de la maqueta.
- Quantes ampliacions per unitat.
