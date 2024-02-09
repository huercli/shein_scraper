# Guia didàctica
## Primers passos, conseguir les dades
Obrir Chrome.

Anar a github, explicar què és:
    Un repositori per a projectes de programació de codi obert. Similar a drive però enfocat a la col·laboració entre programadors.

Buscar l'usuari huercli o el projecte shein_scraper. Explicar què és un scraper:
    Un programa que recorre una pàgina web agafant dades de forma massiva. No és il·legal, sempre i quant les dades que agafes siguen públiques, però sí pot ser de mala educació ja que podem acabar fent moltes peticions a la pàgina per segon i ens poden bloquejar.

Un cop a la pàgina del projecte (https://github.com/huercli/shein_scraper), copiar el codi a shein_scrapper.js i anar a la pàgina de shein europa (eur.shein.com). Anar dins d'alguna categoria, per exemple Men's Fashion > View all (https://eur.shein.com/RecommendSelection/Men-Fashion-sc-017172963.html).

Obrir l'inspector de la pàgina (ctrl+shift+i) o click dret > inspect. Seleccionar la consola i pegar el codi de shein_scrapper.js, enter per a executar. Poden haver-hi problemes, com que shein ens bloqueje o ens faci fer un captcha, en el primer cas reiniciar el navegador o entrar en Incògnit, en el segón fer el captcha i reintentar la execució.

Si res funciona, agafar el fitxer shein_data.csv del repositori de github, l'execució deuria acabar amb una descàrrega d'un fitxer similar.

## Importar les dades a Excel
Excel deuria poder obrir el csv directament, explicar què és un csv.
    Comma Separated Value és un tipus de fitxer de text en el que les dades es separen amb una coma o algun tipus de delimitador. En aquest utilitzem un punt i coma (per si de cas hi haguès una coma al nom del producte, o perquè excel utilitza la coma per a separar la part decimal).

## Histograma dels descomptes
A la pròpia pàgina de Shein tenim moltes opcions per a filtrar i ordenar, però ninguna per als descomptes. El primer que anem a fer és vore quants descomptes hi han de cada valor. Anem a utilitzar la funció CONTAR.SI(rango, criterio), Creem una llista del 0-100 i una funció CONTAR.SI per a cada valor. Per a veure millor els valor anem a utilitzar el format condicional per a posar barres als valors.

## Restaurar els preus originals
Volem afegir una columna amb els preus originals abans del descompte, si el preu original és x, el preu amb descompte és x - x * "descompte"/100 = "preu descomptat". Preu original és: "preu descomptat" / (1 - "descompte"/100). El descompte és un percentatge per tant s'ha de dividir entre 100.
Anar amb compte ja que excel ESPAÑA utiliza , en comptes de . per a separar la part decimal dels nombres.
Per a emplenar la columna sencera podem fer doble click al auto-fill handle (d'on arrastrem per a fer autofill).

## Generar un histograma amb els preus originals
Esta vegada ho farem insertant una gràfica. A gráficos > otros buscarem histograma. Insertarem i seleccionarem la nova columna.

## Secret link
El codi ha generat un article fals, pots trobar-lo amb la següent pista:
    El seu preu original és igual a la mitjana dels preus originals, el deu preu descomptat no té part decimal, el seu descompte és únic i al seu nom conté la paraula "me".

El seu link et portarà a una imatge, si me l'ensenyes guanyes in smint.
L'article fals només és generarà si hi han més de 1000 articles a les dades.
