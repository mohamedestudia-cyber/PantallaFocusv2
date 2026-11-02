# Verificació de Pantalla Focus

## Verificacions automàtiques fetes

- Sintaxi JavaScript comprovada amb `node --check` per a `app.js`, `games-enhanced.js` i `server.mjs`.
- IDs estàtics duplicats comprovats: cap duplicat a `index.html`.
- El sistema de jocs genera els elements del món abans d'afegir els seus esdeveniments.
- Els quatre modes comparteixen un únic controlador d'entrada i tenen controls tàctils + teclat.
- Els mapes generats eliminen cel·les inaccessibles per evitar quedar atrapat per obstacles aleatoris.
- Els resultats de les partides es desa a `window.PF.data.games` i es persisteixen amb el sistema de dades existent.
- FocusIA comprova `/api/health` abans d'informar de l'estat de connexió.
- La clau d'OpenAI només s'utilitza al backend.

## Prova manual recomanada abans de publicar

### Jocs

Per a cada joc:

1. Obre **Jocs**.
2. Selecciona el mode.
3. Comprova que apareix la pantalla animada d'explicació.
4. Prem **COMENÇAR LA MISSIÓ**.
5. Prova fletxes/WASD.
6. Prova els quatre controls tàctils.
7. Prem **PAUSA** i després **REPRENDRE**.
8. Completa o abandona la partida.
9. Revisa **Historial de partides**.

### FocusIA

1. Executa el backend amb un `.env` que contingui `OPENAI_API_KEY`.
2. Comprova `GET /api/health`: ha de retornar `configured: true`.
3. Serveix el frontend des del backend o indica la URL HTTPS del backend a **Preferències**.
4. Envia una pregunta en català.
5. Prova una imatge JPG/PNG/WEBP si el model configurat admet entrada visual.
6. Comprova un error amb el backend aturat: la interfície ha de mostrar un missatge clar i no inventar cap resposta.

## Limitacions que no es poden validar sense infraestructura externa

- Una clau real d'OpenAI i saldo/permisos del projecte.
- CORS amb el domini GitHub Pages final.
- Comportament físic d'un iPhone, Android o Chromebook concret.
- Sincronització entre dispositius, perquè aquesta versió utilitza dades locals.
