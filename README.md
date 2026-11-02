# Pantalla Focus

Pantalla Focus és una aplicació web educativa per observar hàbits digitals, practicar habilitats cognitives, explorar quatre mons interactius, estudiar amb targetes i conversar amb FocusIA.

## Què hi ha implementat

- **Diari de 7 dies:** temps de pantalla introduït manualment, son, concentració, estat d’ànim, exercici, circumstàncies i reflexions.
- **Experiment de 7 dies:** progrés real a partir del diari + set reptes diaris marcables + resum de dades.
- **Evolució:** gràfics calculats només amb dades guardades al navegador.
- **Quatre proves cognitives:** atenció, memòria numèrica, memòria de paraules i seqüència visual, amb nivells i historial.
- **Quatre jocs 2D interactius:** memòria visual, atenció, memòria verbal i orientació/planificació. Tots tenen pantalla d’introducció, personatge, mapa, inventari, puntuació, dificultat, pausa/sortida, controls de teclat i controls tàctils.
- **FocusIA:** backend Node.js amb API real, historial de conversa local, context de resultats, càrrega d’imatges i missatges d’error clars.
- **Targetes d’estudi:** creació, categories i repàs local.
- **Exportació:** JSON i CSV.
- **PWA:** manifest i service worker per instal·lació al dispositiu quan el navegador ho permet.
- **Privacitat:** les dades de l’activitat es guarden localment; les imatges no es guarden permanentment al backend.

Els resultats cognitius i els jocs són activitats de pràctica. **No són proves clíniques, no diagnostiquen i no determinen la intel·ligència o la salut.**

## Requisits

- Node.js 20 o superior per al backend.
- Navegador modern: Safari iOS, Chrome Android/Chromebook, Chrome/Edge/Firefox a ordinador o Safari a macOS.
- Per a FocusIA: una clau d’API del proveïdor configurat.

## Executar localment

```bash
npm install
cp .env.example .env
npm start
```

Si vols que el mateix Node serveixi també el frontend:

```env
SERVE_FRONTEND=true
PORT=3000
```

Després obre:

```text
http://localhost:3000
```

Per separar frontend i backend durant desenvolupament, deixa `SERVE_FRONTEND=false` i serveix els fitxers estàtics amb qualsevol servidor web. A Preferències, indica la URL del backend.

## FocusIA real

La clau **mai** va al JavaScript del navegador.

Al fitxer `.env`:

```env
OPENAI_API_KEY=la_teva_clau
OPENAI_MODEL=gpt-5.5
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000
SERVE_FRONTEND=false
```

Reinicia el backend després de modificar `.env`.

Quan la clau no està configurada, FocusIA **no simula una resposta**: mostra que el backend no està configurat.

El backend:

- manté la clau al servidor;
- limita peticions per IP;
- limita imatges a 5 MB;
- accepta JPG, PNG i WEBP;
- valida origen CORS;
- utilitza Helmet;
- no desa les imatges;
- envia a FocusIA només el context necessari per a la consulta;
- incorpora dades recents de diari, proves, jocs i experiment quan l’usuari demana una anàlisi.

La API pot generar costos segons el proveïdor i el model utilitzat.

## GitHub Pages + backend Node

GitHub Pages només serveix fitxers estàtics. **No executa `server.mjs`.**

### Frontend

Puja a GitHub:

- `index.html`
- `styles.css`
- `app.js`
- `games-enhanced.js`
- `manifest.webmanifest`
- `sw.js`

Activa GitHub Pages des de la configuració del repositori.

### Backend

Desplega:

- `server.mjs`
- `package.json`
- `.env` (com a variables secretes del proveïdor, no al repositori)

en un servei que executi Node.js.

Configura:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=...
ALLOWED_ORIGINS=https://EL_TEU_USUARI.github.io
PORT=3000
SERVE_FRONTEND=false
```

A Pantalla Focus → Preferències, desa la URL HTTPS del backend, per exemple:

```text
https://el-teu-backend.example.com
```

No copiïs mai la clau d’API a GitHub Pages, `app.js` ni `index.html`.

## Actualitzar l’aplicació

1. Modifica els fitxers del repositori.
2. Fes commit i push.
3. GitHub Pages publicarà la nova versió.
4. Si canvies el backend, torna a desplegar-lo i comprova `/api/health`.
5. Si canvies fitxers del service worker, incrementa la versió de `CACHE` a `sw.js`.

## Dades i còpies de seguretat

La informació de l’aplicació es desa a `localStorage` del navegador. Això significa:

- no hi ha sincronització automàtica entre dispositius;
- canviar de navegador o esborrar les dades del navegador pot eliminar l’historial local;
- utilitza **Exportar dades** per crear una còpia;
- la sincronització entre iPhone i Chromebook requeriria comptes i un backend de dades addicional, que aquesta versió no implementa.

## Proves de qualitat realitzades en aquesta entrega

S’ha fet una revisió estàtica del projecte original i s’han corregit els punts principals del flux de jocs:

- el botó d’entrada dels jocs queda connectat a un únic gestor;
- cada joc té una introducció abans d’iniciar-se;
- els quatre modes tenen objectius diferents;
- el moviment funciona amb WASD/fletxes i controls tàctils;
- inventari, puntuació i final de partida actualitzen l’estat;
- els resultats de les partides es guarden a les dades locals;
- FocusIA no respon de manera falsa quan no hi ha backend;
- la clau d’API només existeix al servidor;
- s’ha afegit PWA bàsica.

**Important:** en aquesta sessió he pogut fer revisió de codi, sintaxi i integració, però l’entorn no permet fer una prova de navegador real contra aquest fitxer local ni disposa de la teva clau privada d’OpenAI. Per això no afirmo que FocusIA estigui connectat a una API real en aquesta entrega. Quan configuris `OPENAI_API_KEY`, comprova `/api/health` i fes una consulta des de la pantalla de FocusIA.

## Funcions que encara requeririen infraestructura addicional

- Comptes d’usuari i sincronització segura entre dispositius.
- Mesurament automàtic del temps de pantalla del sistema operatiu; un web normal no té accés fiable a aquesta dada a iOS/Android.
- Autenticació i quota d’usuari per a FocusIA en producció.
- Analítica de rendiment del backend.
- Sistema de notificacions push.
- Publicació en un domini propi.

