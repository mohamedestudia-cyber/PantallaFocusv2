/* Pantalla Focus · quatre jocs 2D funcionals, tàctils i teclat */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const menu = $('#game-menu');
  const container = $('#game-container');
  const host = $('#game-canvas-wrap');
  if (!menu || !container || !host) return;

  const modes = {
    memory: {
      name: 'Bosc de la memòria', tag: 'MEMÒRIA VISUAL', avatar: '🧭',
      desc: 'Explora un bosc lluminós i recorda on has vist els símbols abans que desapareguin.',
      skill: 'Memòria visual i espacial',
      life: 'Recordar ubicacions, formes i detalls pot ser útil quan estudies, busques objectes o segueixes instruccions.',
      goal: 'Recorda i recupera 6 símbols.', tip: 'Primer observa. Després els símbols quedaran ocults: confia en el mapa mental.'
    },
    focus: {
      name: 'Ciutat de la concentració', tag: 'ATENCIÓ I CONCENTRACIÓ', avatar: '🤖',
      desc: 'Mou-te per una ciutat tecnològica, troba els senyals correctes i ignora els distractors.',
      skill: 'Atenció selectiva i sostinguda',
      life: 'Mantenir un objectiu mentre filtres estímuls irrellevants és útil quan estudies o treballes.',
      goal: 'Recull tots els senyals ◆ i evita els distractors.', tip: 'Els ◆ són objectius. Els altres símbols resten punts.'
    },
    words: {
      name: 'Arxipèlag de paraules', tag: 'MEMÒRIA VERBAL', avatar: '🧠',
      desc: 'Visita illes, observa vocabulari durant uns segons i després recupera les paraules que recordis.',
      skill: 'Memòria verbal i recuperació',
      life: 'Recuperar paraules i idees després d’un interval és útil per estudiar, explicar conceptes i recordar informació.',
      goal: 'Memoritza 8 paraules i recupera’n tantes com puguis.', tip: 'Durant la fase d’observació pots explorar; després hauràs de recordar.'
    },
    maze: {
      name: 'Laberint de les estrelles', tag: 'ORIENTACIÓ I PLANIFICACIÓ', avatar: '🚀',
      desc: 'Planifica una ruta per un laberint futurista, recull cristalls i arriba al portal.',
      skill: 'Orientació espacial i planificació',
      life: 'Planificar passos, anticipar obstacles i ajustar una ruta ajuda a resoldre problemes quotidians.',
      goal: 'Recull 3 cristalls i arriba al portal.', tip: 'Mira el minimapa, planifica i avança sense córrer.'
    }
  };

  let mode = 'memory', difficulty = 1;
  let canvas, ctx, mini, mctx, world;
  let running = false, paused = false, raf = 0, timer = 0;
  let startAt = 0, score = 0, hits = 0, misses = 0;
  let map = [], items = [], bag = [], player = { x: 1, y: 1 };
  let words = [], wordObserveUntil = 0, wordPhase = 'observe';
  let gameToken = 0;

  const CSS = `
  #pf-world{position:relative;min-height:650px;border-radius:24px;overflow:hidden;background:#06101d;color:#effaff;border:1px solid #2c526a;box-shadow:0 25px 80px #0008}
  #pf-canvas{display:block;width:100%;height:560px;touch-action:none;background:#071523}
  .pf-hud{position:absolute;top:12px;left:12px;right:12px;display:grid;grid-template-columns:auto 1fr auto auto auto;gap:8px;align-items:start;z-index:3}
  .pf-chip{background:#061422ee;border:1px solid #6de6ff55;border-radius:13px;padding:8px 11px;font-size:10px;backdrop-filter:blur(10px);min-width:90px}.pf-chip b{display:block;color:#7ceaff;font-size:14px;margin-top:2px}
  .pf-exit{border:1px solid #77e6ff55;background:#0b263ce8;color:#fff;border-radius:11px;padding:9px 12px;font-weight:800;min-height:42px;cursor:pointer}.pf-exit.danger{border-color:#ff8f8f66;background:#2b1620e8}
  .pf-tip{position:absolute;top:73px;left:50%;transform:translateX(-50%);max-width:72%;text-align:center;background:#061421e8;border:1px solid #77e6ff44;border-radius:14px;padding:9px 13px;font-size:11px;z-index:2}
  .pf-bag{position:absolute;left:12px;bottom:12px;background:#061422e8;border:1px solid #77e6ff44;border-radius:13px;padding:9px 11px;font-size:11px;z-index:3;max-width:45%}
  .pf-map{position:absolute;right:12px;bottom:12px;width:112px;height:112px;background:#061422ee;border:1px solid #77e6ff55;border-radius:14px;padding:5px;z-index:3}.pf-map canvas{width:100%;height:100%}
  .pf-controls{position:absolute;left:50%;bottom:15px;transform:translateX(-50%);display:grid;grid-template-columns:repeat(3,48px);grid-template-rows:repeat(2,48px);gap:6px;z-index:4}.pf-controls button{border:1px solid #7be7ff66;background:#0b263ce8;color:#fff;border-radius:12px;min-width:48px;min-height:48px;font-size:18px;touch-action:manipulation;cursor:pointer}.pf-controls [data-m=up]{grid-column:2}.pf-controls [data-m=left]{grid-column:1;grid-row:2}.pf-controls [data-m=down]{grid-column:2;grid-row:2}.pf-controls [data-m=right]{grid-column:3;grid-row:2}.pf-controls #pf-action{display:none}
  .pf-overlay{position:absolute;inset:0;background:#020a13e9;backdrop-filter:blur(12px);display:grid;place-items:center;padding:18px;text-align:center;z-index:10}.pf-overlay.hidden{display:none}
  .pf-card{max-width:720px;width:100%;background:linear-gradient(145deg,#112d47,#091626);border:1px solid #6de7ff66;border-radius:25px;padding:25px;box-shadow:0 25px 90px #000b}.pf-avatar{font-size:62px;animation:pf-bob 2s ease-in-out infinite;filter:drop-shadow(0 0 18px #6deaff77)}
  .pf-card h2{font-size:clamp(24px,5vw,38px);margin:8px}.pf-card p{color:#c2d5e4;line-height:1.55}.pf-benefit{background:#081a2b;border:1px solid #5ddfff33;border-radius:15px;padding:13px;margin:14px 0;text-align:left}.pf-benefit p{margin:5px 0 12px}.pf-primary{background:linear-gradient(100deg,#18b8c5,#7469f7);border:0;color:white;padding:14px 24px;border-radius:14px;font-weight:900;cursor:pointer;min-height:48px}
  .pf-intro-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:15px 0}.pf-step{padding:12px;border-radius:15px;background:#081a2b;border:1px solid #5ddfff2d;min-height:105px}.pf-step b{display:block;color:#7ceaff;margin-bottom:5px}.pf-step span{font-size:28px;display:block;margin-bottom:6px}.pf-progress{height:7px;background:#102a40;border-radius:99px;overflow:hidden;margin:13px 0}.pf-progress i{display:block;height:100%;width:33%;background:linear-gradient(90deg,#19d3c5,#806cff);animation:pf-progress 2.2s ease-in-out infinite}.pf-step{animation:pf-step 4.8s ease-in-out infinite}.pf-step:nth-child(2){animation-delay:1.6s}.pf-step:nth-child(3){animation-delay:3.2s}
  .pf-word-input{width:min(460px,100%);background:#071624;border:1px solid #4b7184;color:#fff;border-radius:10px;padding:12px;font-size:16px}.pf-word-grid{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:14px 0}.pf-word-grid button{background:#102a42;border:1px solid #5ddfff55;color:#fff;border-radius:10px;padding:10px 12px;cursor:pointer}.pf-word-grid button.selected{background:#18b8c5;color:#02121a}.pf-result{font-size:18px;font-weight:800}.pf-countdown{font-size:30px;font-weight:900;color:#7ceaff}
  @keyframes pf-bob{50%{transform:translateY(-10px) rotate(4deg)}} @keyframes pf-step{0%,100%{transform:translateY(0);border-color:#5ddfff2d}18%,30%{transform:translateY(-4px);border-color:#6de7ff99;box-shadow:0 8px 28px #19d3c522}45%{transform:translateY(0);border-color:#5ddfff2d}} @keyframes pf-progress{50%{width:90%}}
  @media(max-width:720px){#pf-world{min-height:690px}.pf-hud{grid-template-columns:1fr 1fr auto}.pf-chip:nth-child(3){grid-column:1}.pf-tip{top:112px;max-width:88%}.pf-bag{max-width:54%;bottom:15px}.pf-map{width:86px;height:86px}.pf-controls{bottom:14px}.pf-controls button{min-width:46px;min-height:46px}.pf-intro-grid{grid-template-columns:1fr}.pf-card{padding:18px}.pf-card p{font-size:14px}}
  @media(prefers-reduced-motion:reduce){.pf-avatar,.pf-progress i,.pf-step{animation:none}}
  `;
  const style = document.createElement('style'); style.textContent = CSS; document.head.append(style);

  function makeWorld() {
    world = document.createElement('div');
    world.id = 'pf-world';
    world.innerHTML = `
      <canvas id="pf-canvas" aria-label="Món de joc interactiu"></canvas>
      <div class="pf-hud">
        <div class="pf-chip">PUNTUACIÓ<b id="pf-score">0</b></div>
        <div class="pf-chip">MISSIÓ<b id="pf-goal">—</b></div>
        <div class="pf-chip">TEMPS<b id="pf-time">00:00</b></div>
        <button class="pf-exit" id="pf-pause" type="button">PAUSA</button>
        <button class="pf-exit danger" id="pf-exit" type="button">SORTIR</button>
      </div>
      <div class="pf-tip" id="pf-tip"></div>
      <div class="pf-bag">🎒 <b>INVENTARI</b> <span id="pf-items">—</span></div>
      <div class="pf-map"><canvas id="pf-mini" width="180" height="180" aria-label="Minimapa"></canvas></div>
      <div class="pf-controls" aria-label="Controls tàctils">
        <button type="button" data-m="up" aria-label="Amunt">↑</button>
        <button type="button" data-m="left" aria-label="Esquerra">←</button>
        <button type="button" data-m="down" aria-label="Avall">↓</button>
        <button type="button" data-m="right" aria-label="Dreta">→</button>
      </div>
      <div class="pf-overlay" id="pf-pause-overlay" hidden>
        <div class="pf-card"><div class="pf-avatar">⏸️</div><h2>Partida en pausa</h2><p>La partida està aturada. Pots reprendre-la sense perdre el progrés.</p><button class="pf-primary" id="pf-resume" type="button">REPRENDRE →</button></div>
      </div>
      <div class="pf-overlay" id="pf-overlay">
        <div class="pf-card">
          <div class="pf-avatar" id="pf-avatar">🧭</div>
          <div class="pf-tag" id="pf-tag"></div>
          <h2 id="pf-title"></h2>
          <p id="pf-desc"></p>
          <div class="pf-intro-grid">
            <div class="pf-step"><span>👀</span><b>1 · Observa</b><small>Entén la missió i el món.</small></div>
            <div class="pf-step"><span>🧭</span><b>2 · Explora</b><small>Mou el personatge i completa objectius.</small></div>
            <div class="pf-step"><span>🏆</span><b>3 · Millora</b><small>Rep puntuació i revisa el resultat.</small></div>
          </div>
          <div class="pf-progress"><i></i></div>
          <div class="pf-benefit"><b>🧠 Què treballa?</b><p id="pf-help"></p><b>🌱 Per a què pot servir?</b><p id="pf-life"></p></div>
          <p id="pf-goalintro"></p>
          <button class="pf-primary" id="pf-start" type="button">COMENÇAR LA MISSIÓ →</button>
        </div>
      </div>`;
    host.replaceChildren(world);
    canvas = $('#pf-canvas', world); ctx = canvas.getContext('2d');
    mini = $('#pf-mini', world); mctx = mini.getContext('2d');
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function key(x, y) { return `${x},${y}`; }
  function inBounds(x, y) { return y >= 0 && y < map.length && x >= 0 && x < map[0].length; }
  function reachable(startX = 1, startY = 1) {
    const seen = new Set([key(startX, startY)]), q = [[startX, startY]];
    for (let i = 0; i < q.length; i++) {
      const [x, y] = q[i];
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx = x + dx, ny = y + dy, k = key(nx, ny);
        if (inBounds(nx, ny) && map[ny][nx] === 0 && !seen.has(k)) { seen.add(k); q.push([nx, ny]); }
      }
    }
    return seen;
  }
  function makeMap() {
    const n = 17;
    map = Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => (x === 0 || y === 0 || x === n - 1 || y === n - 1) ? 1 : 0));
    const density = difficulty === 3 ? .18 : difficulty === 2 ? .11 : .06;
    for (let y = 2; y < n - 2; y++) for (let x = 2; x < n - 2; x++) if (Math.random() < density) map[y][x] = 1;
    map[1][1] = map[1][2] = map[2][1] = 0;
    map[n - 2][n - 2] = 0;
    const seen = reachable();
    // Never allow the generated obstacles to trap the player or the goal.
    for (let y = 1; y < n - 1; y++) for (let x = 1; x < n - 1; x++) {
      if (!seen.has(key(x, y))) map[y][x] = 0;
    }
  }
  function freeCell(used = new Set()) {
    const cells = [];
    for (let y = 1; y < map.length - 1; y++) for (let x = 1; x < map.length - 1; x++) {
      if (map[y][x] === 0 && !used.has(key(x, y)) && !(x === player.x && y === player.y)) cells.push({ x, y });
    }
    return cells.length ? cells[Math.floor(Math.random() * cells.length)] : { x: 2, y: 2 };
  }
  function setup() {
    clearTimeout(timer); cancelAnimationFrame(raf);
    makeMap(); player = { x: 1, y: 1 }; score = 0; hits = 0; misses = 0; bag = []; items = []; words = []; wordPhase = 'observe';
    const used = new Set([key(1,1)]);
    if (mode === 'memory') {
      shuffle(['◆','✦','●','⬟','✚','★','⬢','✿']).slice(0, 6).forEach((s, id) => { const p = freeCell(used); used.add(key(p.x,p.y)); items.push({ ...p, s, kind:'memory', id }); });
      wordObserveUntil = performance.now() + 6500 - (difficulty - 1) * 700;
    } else if (mode === 'focus') {
      const targetCount = 6 + difficulty;
      for (let i = 0; i < targetCount; i++) { const p = freeCell(used); used.add(key(p.x,p.y)); items.push({ ...p, s:'◆', kind:'target' }); }
      for (let i = 0; i < 8 + difficulty * 2; i++) { const p = freeCell(used); used.add(key(p.x,p.y)); items.push({ ...p, s:['●','■','▲','✚'][i % 4], kind:'distractor' }); }
    } else if (mode === 'words') {
      const banks = [
        ['calma','planeta','brúixola','muntanya','llum','oceà','llibre','camí'],
        ['atenció','memòria','finestra','cascada','jardí','estrella','pont','silenci'],
        ['cervell','energia','projecte','música','biblioteca','núvol','rellotge','bosc']
      ];
      words = shuffle([...banks[Math.floor(Math.random()*banks.length)]]);
      words.forEach((s, id) => { const p = freeCell(used); used.add(key(p.x,p.y)); items.push({ ...p, s:s.toUpperCase(), word:s, kind:'word', id }); });
      wordObserveUntil = performance.now() + 7000 - (difficulty - 1) * 1000;
    } else {
      const portal = { x: map.length - 2, y: map.length - 2, s:'🌀', kind:'portal' };
      used.add(key(portal.x, portal.y));
      for (let i = 0; i < 3; i++) { const p = freeCell(used); used.add(key(p.x,p.y)); items.push({ ...p, s:'💠', kind:'crystal' }); }
      items.push(portal);
    }
    updateHud();
  }
  function updateHud() {
    $('#pf-score').textContent = score;
    $('#pf-items').textContent = bag.length ? bag.join(' ') : '—';
    $('#pf-goal').textContent = modes[mode].goal;
  }
  function setTip(t) { $('#pf-tip').textContent = t; }
  function move(dx, dy) {
    if (!running || paused) return;
    const x = player.x + dx, y = player.y + dy;
    if (!inBounds(x,y) || map[y][x]) { setTip('Camí bloquejat. Busca una altra ruta.'); return; }
    player = { x, y };
    const idx = items.findIndex(o => o.x === x && o.y === y);
    if (idx < 0) return;
    const o = items[idx];
    if (mode === 'maze' && o.kind === 'portal') { if (hits >= 3) finish('Has recollit els 3 cristalls i has arribat al portal.'); else setTip('El portal encara necessita 3 cristalls.'); return; }
    if (mode === 'focus' && o.kind === 'distractor') { score = Math.max(0, score - 8); misses++; items.splice(idx,1); setTip('Distractor! Torna a buscar els ◆.'); updateHud(); return; }
    if (mode === 'memory' && performance.now() < wordObserveUntil) { setTip('Encara estàs en fase d’observació. Recorda les ubicacions.'); return; }
    if (mode === 'words') { setTip('La fase de memòria verbal és automàtica: observa i després recupera.'); return; }
    items.splice(idx,1); bag.push(o.s); hits++; score += mode === 'maze' ? 20 : 10; updateHud(); checkWin();
  }
  function checkWin() {
    if (mode === 'memory' && hits >= 6) finish('Has recuperat tots els símbols del bosc.');
    if (mode === 'focus' && hits >= 6 + difficulty) finish('Has localitzat tots els senyals objectiu mantenint el focus.');
    if (mode === 'maze' && hits >= 3) setTip('Tres cristalls! Ara busca el portal 🌀.');
  }
  function showWordsRecall() {
    if (!running || wordPhase === 'recall') return;
    wordPhase = 'recall'; running = false; clearTimeout(timer); cancelAnimationFrame(raf);
    const choices = shuffle([...words, 'teclat','riu','foc','tren','paper','fusta']).slice(0, 14);
    $('#pf-overlay').hidden = false;
    $('#pf-title').textContent = 'Recuperació de paraules';
    $('#pf-desc').textContent = 'Selecciona totes les paraules que recordis. Després comprovaré la resposta automàticament.';
    $('#pf-help').textContent = modes.words.skill;
    $('#pf-life').textContent = modes.words.life;
    $('#pf-goalintro').innerHTML = `<div class="pf-word-grid">${choices.map(w => `<button type="button" data-word="${w}">${w}</button>`).join('')}</div><button type="button" class="pf-primary" id="pf-check-words">COMPROVAR RECORDS →</button>`;
    $('#pf-avatar').textContent = '🧠'; $('#pf-tag').textContent = 'FASE FINAL';
    $$('.pf-word-grid button', $('#pf-overlay')).forEach(b => b.addEventListener('click', () => b.classList.toggle('selected')));
    $('#pf-check-words').onclick = () => {
      const selected = new Set($$('.pf-word-grid button.selected', $('#pf-overlay')).map(b => b.dataset.word));
      const correct = words.filter(w => selected.has(w)).length;
      const wrong = [...selected].filter(w => !words.includes(w)).length;
      score = Math.max(0, correct * 15 - wrong * 5); hits = correct; misses = wrong;
      finish(`Has recordat ${correct} de ${words.length} paraules.`, { keepOverlay:true });
    };
  }
  function checkWordTimer() {
    if (mode === 'memory' && performance.now() >= wordObserveUntil) setTip('Ara estan ocults. Mou-te i recupera els símbols que recordis.');
    if (mode === 'words' && performance.now() >= wordObserveUntil) showWordsRecall();
  }
  function finish(message, opts = {}) {
    running = false; paused = false; clearTimeout(timer); cancelAnimationFrame(raf);
    const duration = Math.max(1, Math.round((performance.now() - startAt) / 1000));
    $('#pf-overlay').hidden = false;
    $('#pf-avatar').textContent = '🏆'; $('#pf-tag').textContent = 'MISSIÓ COMPLETADA'; $('#pf-title').textContent = 'Molt bé!';
    $('#pf-desc').textContent = message; $('#pf-help').textContent = modes[mode].skill; $('#pf-life').textContent = modes[mode].life;
    $('#pf-goalintro').textContent = `Puntuació ${score} · ${duration} s · ${hits} encerts · ${misses} errors`;
    if (!opts.keepOverlay) $('#pf-start').textContent = 'TORNAR A JUGAR →';
    else $('#pf-start').textContent = 'TORNAR A JUGAR →';
    $('#pf-start').onclick = startRun;
    if (window.PF?.data) {
      const r = { id: Date.now().toString(36), mode:modes[mode].name, score, duration, hits, misses, level:difficulty, date:new Date().toISOString().slice(0,10), at:new Date().toISOString() };
      window.PF.data.games.push(r); window.PF.addActivity('game','Partida completada',`${modes[mode].name} · ${score} punts`); window.PF.save(); window.PF.refreshGameHistory();
    }
  }
  function renderIntro() {
    const m = modes[mode];
    $('#pf-avatar').textContent = m.avatar; $('#pf-tag').textContent = m.tag; $('#pf-title').textContent = m.name;
    $('#pf-desc').textContent = m.desc; $('#pf-help').textContent = m.skill; $('#pf-life').textContent = m.life;
    $('#pf-goalintro').textContent = `Objectiu: ${m.goal} · Dificultat: ${difficulty === 1 ? 'exploració' : difficulty === 2 ? 'estàndard' : 'desafiament'}`;
    $('#pf-start').textContent = 'COMENÇAR LA MISSIÓ →'; $('#pf-start').onclick = startRun; $('#pf-overlay').hidden = false;
  }
  function startRun() {
    gameToken++; const token = gameToken;
    setup(); running = true; paused = false; startAt = performance.now();
    $('#pf-overlay').hidden = true; $('#pf-pause-overlay').hidden = true; $('#pf-pause').textContent = 'PAUSA'; setTip(modes[mode].tip);
    resize();
    draw();
  }
  function resize() {
    const rect = canvas.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr)); canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0); mini.width = mini.height = 180;
  }
  function draw() {
    const w = canvas.clientWidth || 800, h = canvas.clientHeight || 560, n = map.length;
    const cs = Math.min((w - 30) / n, (h - 30) / n), ox = (w - cs*n)/2, oy = (h - cs*n)/2;
    const palettes = {memory:['#081c2b','#12394a','#66e5ff'],focus:['#07151c','#123e37','#65ffd5'],words:['#151026','#3a285b','#c59bff'],maze:['#11100a','#3e3519','#ffd56b']};
    const [bg,floor,accent] = palettes[mode]; ctx.clearRect(0,0,w,h); ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
    for(let y=0;y<n;y++) for(let x=0;x<n;x++) { ctx.fillStyle=map[y][x]?'#142233':floor; ctx.fillRect(ox+x*cs+1,oy+y*cs+1,cs-2,cs-2); if(!map[y][x]){ctx.strokeStyle=accent+'22';ctx.strokeRect(ox+x*cs+2,oy+y*cs+2,cs-4,cs-4);} }
    const now = performance.now();
    items.forEach(o => {
      let visible = true;
      if (mode === 'memory' && now >= wordObserveUntil) visible = false;
      if (mode === 'words' && wordPhase === 'observe' && now >= wordObserveUntil) visible = false;
      if (visible) { ctx.font=`${Math.max(15,cs*.45)}px sans-serif`;ctx.textAlign='center';ctx.fillStyle=accent;ctx.shadowColor=accent;ctx.shadowBlur=14;ctx.fillText(o.s,ox+(o.x+.5)*cs,oy+(o.y+.68)*cs);ctx.shadowBlur=0; }
    });
    ctx.font=`${Math.max(19,cs*.6)}px sans-serif`;ctx.textAlign='center';ctx.fillText(mode==='focus'?'🤖':mode==='maze'?'🚀':'🧭',ox+(player.x+.5)*cs,oy+(player.y+.7)*cs);
    const ms=180/n; mctx.clearRect(0,0,180,180);mctx.fillStyle='#07111d';mctx.fillRect(0,0,180,180);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){mctx.fillStyle=map[y][x]?'#324457':'#64d7cf';mctx.fillRect(x*ms,y*ms,Math.max(1,ms-1),Math.max(1,ms-1));}
    items.forEach(o=>{if(o.kind==='portal'||o.kind==='crystal'){mctx.fillStyle=o.kind==='portal'?'#fff':'#ffd56b';mctx.fillRect(o.x*ms,o.y*ms,Math.max(2,ms),Math.max(2,ms));}});
    mctx.fillStyle='#fff';mctx.fillRect(player.x*ms,player.y*ms,Math.max(2,ms),Math.max(2,ms));
    $('#pf-time').textContent = new Date(Math.max(0,now-startAt)).toISOString().slice(14,19);
    checkWordTimer();
    if (running && !paused) raf=requestAnimationFrame(draw);
  }
  function togglePause() {
    if (!running && !paused) return;
    paused = !paused; $('#pf-pause').textContent = paused ? 'REPRENDRE' : 'PAUSA'; $('#pf-pause-overlay').hidden = !paused;
    if (!paused) { startAt += performance.now() - (pauseAt || performance.now()); draw(); }
    else pauseAt = performance.now();
  }
  let pauseAt = 0;
  function exit() { gameToken++; running=false;paused=false;clearTimeout(timer);cancelAnimationFrame(raf);$('#pf-pause-overlay').hidden=true;container.classList.add('hidden');menu.classList.remove('hidden'); }

  makeWorld();
  $$('[data-m]', world).forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.m;move(m==='left'?-1:m==='right'?1:0,m==='up'?-1:m==='down'?1:0);}));
  document.addEventListener('keydown', e => {
    if (!running || paused || !container || container.classList.contains('hidden')) return;
    const k=e.key.toLowerCase(); if(['arrowup','w'].includes(k)){e.preventDefault();move(0,-1);} else if(['arrowdown','s'].includes(k)){e.preventDefault();move(0,1);} else if(['arrowleft','a'].includes(k)){e.preventDefault();move(-1,0);} else if(['arrowright','d'].includes(k)){e.preventDefault();move(1,0);} else if(k==='escape'){exit();}
  });
  $('#pf-pause',world).addEventListener('click',togglePause); $('#pf-resume',world).addEventListener('click',togglePause); $('#pf-exit',world).addEventListener('click',exit);
  $$('.mode-card').forEach(b=>b.addEventListener('click',()=>{mode={free:'memory',attention:'focus',sequence:'words',maze:'maze'}[b.dataset.mode]||'memory';$$('.mode-card').forEach(x=>x.classList.toggle('selected',x===b));renderIntro();}));
  $('#game-difficulty').addEventListener('change',()=>{difficulty=Math.max(1,Math.min(3,Number($('#game-difficulty').value)||1));renderIntro();});
  $('#launch-game').addEventListener('click',e=>{e.preventDefault();difficulty=Math.max(1,Math.min(3,Number($('#game-difficulty').value)||1));menu.classList.add('hidden');container.classList.remove('hidden');renderIntro();},{capture:true});
  window.addEventListener('resize',()=>{if(running)resize();});
  renderIntro();
})();
