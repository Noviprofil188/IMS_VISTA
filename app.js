/* ══════════════════════════════════════
   VOĆNA IGRA — app.js
   ══════════════════════════════════════ */

/* ── LEBDEĆE VOĆE U POZADINI ─────────── */
(function () {
  const fruits = ['🍓','🍎','🍊','🍋','🍇','🍉','🍌','🍒','🍑','🥝','🍍','🥭'];
  const bg = document.getElementById('fruit-bg');
  for (let i = 0; i < 22; i++) {
    const el = document.createElement('div');
    el.className = 'fb';
    el.textContent = fruits[Math.floor(Math.random() * fruits.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (1.5 + Math.random() * 2) + 'rem';
    el.style.animationDuration = (12 + Math.random() * 18) + 's';
    el.style.animationDelay = (-Math.random() * 20) + 's';
    bg.appendChild(el);
  }
})();

/* ══════════════════════════════════════
   STANJE APLIKACIJE
   ══════════════════════════════════════ */
let totalPts  = 0;
let roundPts  = 0;
let curGame   = null;
let curLevel  = 'easy';
let timerOn   = false;
let ttsOn     = true;
let killGame  = () => {};
let timerIv   = null;

const ROUNDS  = { easy: 5, hard: 8 };
const TIMESEC = { easy: 22, hard: 14 };

function getRounds() { return ROUNDS[curLevel]; }
function getTime()   { return TIMESEC[curLevel]; }

/* ══════════════════════════════════════
   POSTAVKE
   ══════════════════════════════════════ */
function setTheme(dark) {
  document.body.classList.toggle('dark', dark);
}

function setTimerPref(on) {
  timerOn = on;
  document.getElementById('tlabel').textContent = on ? 'Uključen' : 'Isključen';
}

function setTtsPref(on) {
  ttsOn = on;
  document.getElementById('ttslabel').textContent = on ? 'Uključen' : 'Isključen';
  if (!on && window.speechSynthesis) speechSynthesis.cancel();
}

function setLevel(lv) {
  curLevel = lv;
  document.getElementById('btn-easy').className = 'lvl-btn' + (lv === 'easy' ? ' easy-on' : '');
  document.getElementById('btn-hard').className = 'lvl-btn' + (lv === 'hard' ? ' hard-on' : '');
}

/* ══════════════════════════════════════
   NAVIGACIJA
   ══════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  document.getElementById('hud').classList.toggle('on', id !== 'start');
  document.getElementById('hud-pts').textContent = totalPts;
}

function goHome()    { clearT(); killGame(); showScreen('start'); }
function playAgain() { startGame(curGame); }

/* ══════════════════════════════════════
   TEXT-TO-SPEECH
   ══════════════════════════════════════ */
function tts(t) {
  if (!ttsOn || !window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t);
  u.lang = 'hr-HR';
  u.rate = 0.88;
  speechSynthesis.speak(u);
}
function ttsInstr() {
  tts(document.getElementById('instr-box').textContent);
}

/* ══════════════════════════════════════
   ZVUK (beep)
   ══════════════════════════════════════ */
function beep(ok) {
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const o  = ac.createOscillator();
    const g  = ac.createGain();
    o.connect(g);
    g.connect(ac.destination);
    o.frequency.value = ok ? 700 : 300;
    o.type = 'sine';
    g.gain.setValueAtTime(0.13, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.45);
    o.start();
    o.stop(ac.currentTime + 0.45);
  } catch (e) {}
}

/* ══════════════════════════════════════
   POVRATNA INFORMACIJA (toast)
   ══════════════════════════════════════ */
let fbT = null;

function feedback(ok) {
  const toast = document.getElementById('fb-toast');
  toast.textContent = ok ? '✅ Bravo! 🎉' : '🔄 Pokušaj opet!';
  toast.className = 'fb-toast show' + (ok ? '' : ' bad');
  beep(ok);
  if (ok) burst();
  if (fbT) clearTimeout(fbT);
  fbT = setTimeout(() => toast.classList.remove('show'), ok ? 1000 : 700);
}

/* Pogrešan odgovor — taj gumb se blokira, ostali ostaju klikabilni */
function markWrong(btn) {
  btn.classList.add('wrong');
  btn.setAttribute('disabled', '');
  setTimeout(() => btn.classList.remove('wrong'), 600);
  feedback(false);
}

/* ══════════════════════════════════════
   ČESTICE I KONFETI
   ══════════════════════════════════════ */
function burst() {
  const cols = ['#ff8c00','#ff5fa0','#4caf50','#f1c40f','#9b59b6','#2980b9'];
  for (let i = 0; i < 20; i++) {
    const p   = document.createElement('div');
    p.className = 'particle';
    const a   = Math.random() * Math.PI * 2;
    const d   = 80 + Math.random() * 120;
    p.style.cssText = `left:50vw;top:50vh;
      width:${6 + Math.random() * 9}px;
      height:${6 + Math.random() * 9}px;
      background:${cols[Math.floor(Math.random() * cols.length)]};
      --tx:${Math.cos(a) * d}px;
      --ty:${Math.sin(a) * d}px;
      --dur:${0.5 + Math.random() * 0.5}s;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

function confetti(n) {
  const cols = ['#ff8c00','#ff5fa0','#4caf50','#f1c40f','#9b59b6','#2980b9','#1abc9c'];
  for (let i = 0; i < n; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.style.cssText = `
        position:fixed;
        left:${Math.random() * 100}vw;
        top:-20px;
        width:${8 + Math.random() * 10}px;
        height:${8 + Math.random() * 10}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '4px'};
        background:${cols[Math.floor(Math.random() * cols.length)]};
        z-index:300; pointer-events:none;
        animation:pfly ${1.1 + Math.random() * 0.8}s ease forwards;
        animation-delay:${Math.random() * 0.4}s;
        --tx:${(Math.random() - 0.5) * 180}px;
        --ty:${90 + Math.random() * 70}vh;
        --dur:${1.1 + Math.random() * 0.8}s;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 2400);
    }, i * 20);
  }
}

/* ══════════════════════════════════════
   NAPREDAK I BODOVI
   ══════════════════════════════════════ */
function setProgress(r, total) {
  document.getElementById('prog-fill').style.width = (r / total * 100) + '%';
  document.getElementById('g-round').textContent = `Krug ${r} / ${total}`;
}

function addPts(n) {
  roundPts  += n;
  totalPts  += n;
  document.getElementById('hud-pts').textContent = totalPts;
}

/* ══════════════════════════════════════
   TAJMER
   ══════════════════════════════════════ */
function clearT() {
  clearInterval(timerIv);
  timerIv = null;
  document.getElementById('hud-timer').classList.remove('on', 'urg');
  document.getElementById('tbar-wrap').style.display = 'none';
}

function startT(secs, onExpire) {
  clearT();
  if (!timerOn) return;
  let left = secs;
  const ht = document.getElementById('hud-timer');
  const hs = document.getElementById('hud-time');
  const bw = document.getElementById('tbar-wrap');
  const bf = document.getElementById('tbar-fill');
  ht.classList.add('on');
  bw.style.display = 'block';
  hs.textContent   = left;
  bf.style.width   = '100%';
  timerIv = setInterval(() => {
    left--;
    hs.textContent = left;
    bf.style.width = (left / secs * 100) + '%';
    if (left <= 5) ht.classList.add('urg');
    if (left <= 0) { clearT(); onExpire && onExpire(); }
  }, 1000);
}

/* ══════════════════════════════════════
   ZAVRŠNI EKRAN
   ══════════════════════════════════════ */
function showEnd() {
  clearT();
  const ratio = roundPts / (getRounds() * 2);
  const s     = ratio > 0.8 ? 3 : ratio > 0.4 ? 2 : 1;
  const msgs  = [
    'Svaka čast! Pokušaj opet za više zvjezdica! 💪',
    'Odlično! Još malo i bit ćeš prvak! 🌟',
    'Savršeno! Ti si šampion! 🏆'
  ];
  document.getElementById('end-title').textContent = s === 3 ? '🏆 Savršeno!' : '🍓 Bravo!';
  document.getElementById('end-stars').innerHTML   = '⭐'.repeat(s) + '☆'.repeat(3 - s);
  document.getElementById('end-pts').textContent   = `+${roundPts} ⭐ zvjezdica skupljeno!`;
  document.getElementById('end-msg').textContent   = msgs[s - 1];
  if (s === 3) confetti(55); else confetti(18);
  tts(msgs[s - 1]);
  showScreen('end');
}

/* ══════════════════════════════════════
   POMOĆNA FUNKCIJA — miješanje
   ══════════════════════════════════════ */
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ══════════════════════════════════════
   POKRETANJE IGRE
   ══════════════════════════════════════ */
function startGame(name) {
  clearT();
  killGame();
  curGame  = name;
  roundPts = 0;
  showScreen('game');
  const titles = {
    fruit:   '🍎 Što je ovo voće?',
    animal:  '🐘 Koja životinja?',
    color:   '🎨 Pogodi boju',
    memory:  '🃏 Memory',
    letter:  '🔤 Početno slovo',
    missing: '🔍 Što je nestalo?'
  };
  document.getElementById('g-title').textContent = titles[name];
  ({ fruit: gameFruit, animal: gameAnimal, color: gameColor,
     memory: gameMemory, letter: gameLetter, missing: gameMissing }[name])();
}

/* ══════════════════════════════════════
   IGRA 1 — ŠTO JE OVO VOĆE?
   ══════════════════════════════════════ */
const FRUITS = [
  { e: '🍎', l: 'Jabuka' },    { e: '🍊', l: 'Naranča' },
  { e: '🍋', l: 'Limun' },     { e: '🍇', l: 'Grožđe' },
  { e: '🍉', l: 'Lubenica' },  { e: '🍌', l: 'Banana' },
  { e: '🍒', l: 'Trešnja' },   { e: '🍑', l: 'Breskva' },
  { e: '🥝', l: 'Kivi' },      { e: '🍍', l: 'Ananas' },
  { e: '🥭', l: 'Mango' },     { e: '🍓', l: 'Jagoda' },
  { e: '🍐', l: 'Kruška' },    { e: '🍈', l: 'Dinja' },
];

function gameFruit() {
  shuffle(FRUITS);
  const total = getRounds();
  let round = 0;

  function next() {
    if (round >= total) { showEnd(); return; }
    const item = FRUITS[round % FRUITS.length];
    round++;
    setProgress(round - 1, total);

    const dist    = shuffle(FRUITS.filter(f => f.e !== item.e)).slice(0, curLevel === 'easy' ? 2 : 3);
    const choices = shuffle([item, ...dist]);

    document.getElementById('instr-box').textContent = 'Koje je ovo voće?';
    tts('Koje je ovo voće?');

    const panel = document.getElementById('game-panel');
    panel.innerHTML = `<div class="big-emoji">${item.e}</div><div class="choices-wrap" id="cw"></div>`;
    startT(getTime(), () => next());

    const cw = document.getElementById('cw');
    choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className  = 'choice-btn';
      btn.innerHTML  = `<span class="clbl">${ch.l}</span>`;
      btn.style.fontSize = '1.2rem';
      btn.style.padding  = '18px 24px';
      btn.onclick = () => {
        if (btn.disabled) return;
        if (ch.e === item.e) {
          clearT();
          cw.querySelectorAll('.choice-btn').forEach(b => b.setAttribute('disabled', ''));
          btn.classList.add('correct');
          addPts(2); feedback(true);
          setTimeout(next, 900);
        } else {
          markWrong(btn);
        }
      };
      cw.appendChild(btn);
    });
  }

  killGame = () => {};
  next();
}

/* ══════════════════════════════════════
   IGRA 2 — KOJA ŽIVOTINJA?
   ══════════════════════════════════════ */
const ANIMALS = [
  { e: '🐘', l: 'Slon',      hint: 'Ima dugački surlu i velika je!' },
  { e: '🦁', l: 'Lav',       hint: 'Kralj životinja, grmi u džungli!' },
  { e: '🐬', l: 'Dupin',     hint: 'Živi u moru i voli skakati!' },
  { e: '🐧', l: 'Pingvin',   hint: 'Ne leti, ali puno pliva!' },
  { e: '🦒', l: 'Žirafa',    hint: 'Ima najduži vrat na svijetu!' },
  { e: '🐊', l: 'Krokodil',  hint: 'Zelena je i živi u rijeci!' },
  { e: '🦓', l: 'Zebra',     hint: 'Ima crno-bijele pruge!' },
  { e: '🐸', l: 'Žaba',      hint: 'Skače i voli bare!' },
  { e: '🦜', l: 'Papiga',    hint: 'Zna ponavljati što kažeš!' },
  { e: '🐼', l: 'Panda',     hint: 'Crno-bijela i jede bambus!' },
  { e: '🦊', l: 'Lisica',    hint: 'Narančasta je i lukava!' },
  { e: '🐢', l: 'Kornjača',  hint: 'Nosi kućicu na leđima!' },
];

function gameAnimal() {
  shuffle(ANIMALS);
  const total = getRounds();
  let round = 0;

  function next() {
    if (round >= total) { showEnd(); return; }
    const item = ANIMALS[round % ANIMALS.length];
    round++;
    setProgress(round - 1, total);

    const dist    = shuffle(ANIMALS.filter(a => a.e !== item.e)).slice(0, curLevel === 'easy' ? 2 : 3);
    const choices = shuffle([item, ...dist]);

    document.getElementById('instr-box').textContent = item.hint;
    tts(item.hint);

    const panel = document.getElementById('game-panel');
    panel.innerHTML = `<div class="choices-wrap" id="cw"></div>`;
    startT(getTime(), () => next());

    const cw = document.getElementById('cw');
    choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.innerHTML = `${ch.e}<span class="clbl">${ch.l}</span>`;
      btn.onclick = () => {
        if (btn.disabled) return;
        if (ch.e === item.e) {
          clearT();
          cw.querySelectorAll('.choice-btn').forEach(b => b.setAttribute('disabled', ''));
          btn.classList.add('correct');
          addPts(2); feedback(true);
          setTimeout(next, 900);
        } else {
          markWrong(btn);
        }
      };
      cw.appendChild(btn);
    });
  }

  killGame = () => {};
  next();
}

/* ══════════════════════════════════════
   IGRA 3 — POGODI BOJU
   ══════════════════════════════════════ */
const COLORS = [
  { l: 'Crvena',     hex: '#e74c3c' },
  { l: 'Plava',      hex: '#2980b9' },
  { l: 'Žuta',       hex: '#f1c40f' },
  { l: 'Zelena',     hex: '#27ae60' },
  { l: 'Narančasta', hex: '#e67e22' },
  { l: 'Ljubičasta', hex: '#9b59b6' },
  { l: 'Ružičasta',  hex: '#ff5fa0' },
  { l: 'Smeđa',      hex: '#8B4513' },
  { l: 'Crna',       hex: '#2c3e50' },
  { l: 'Bijela',     hex: '#ecf0f1', border: true },
];

function gameColor() {
  shuffle(COLORS);
  const total = getRounds();
  let round = 0;

  function next() {
    if (round >= total) { showEnd(); return; }
    const item = COLORS[round % COLORS.length];
    round++;
    setProgress(round - 1, total);

    const dist    = shuffle(COLORS.filter(c => c.l !== item.l)).slice(0, curLevel === 'easy' ? 3 : 5);
    const choices = shuffle([item, ...dist]);

    document.getElementById('instr-box').textContent = `Klikni boju: ${item.l}`;
    tts('Klikni boju ' + item.l);

    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
      <div style="font-size:1.7rem;font-weight:900;color:var(--text)">${item.l}</div>
      <div class="color-row" id="crow"></div>`;
    startT(getTime(), () => next());

    const crow = document.getElementById('crow');
    choices.forEach(ch => {
      const sw = document.createElement('div');
      sw.className      = 'color-swatch';
      sw.style.background = ch.hex;
      if (ch.border) sw.style.border = '3px solid #ccc';
      sw.title = ch.l;
      sw.onclick = () => {
        if (sw.classList.contains('disabled-sw')) return;
        if (ch.l === item.l) {
          clearT();
          crow.querySelectorAll('.color-swatch').forEach(s => s.classList.add('disabled-sw'));
          sw.classList.add('correct');
          addPts(2); feedback(true);
          setTimeout(next, 900);
        } else {
          sw.classList.add('wrong', 'disabled-sw');
          setTimeout(() => sw.classList.remove('wrong'), 600);
          feedback(false);
        }
      };
      crow.appendChild(sw);
    });
  }

  killGame = () => {};
  next();
}

/* ══════════════════════════════════════
   IGRA 4 — MEMORY
   ══════════════════════════════════════ */
function gameMemory() {
  document.getElementById('instr-box').textContent = 'Spoji iste parove kartica! 🃏';
  tts('Spoji iste parove kartica!');

  const easyPairs = ['🍎','🍊','🍋','🐘','🦁','🐬'];
  const hardPairs = ['🍎','🍊','🍋','🐘','🦁','🐬','🦒','🍓'];
  const pool  = curLevel === 'easy' ? easyPairs : hardPairs;
  const cards = shuffle([...pool, ...pool]);

  let flipped = [], matched = 0, lock = false;
  setProgress(0, pool.length);

  const panel = document.getElementById('game-panel');
  panel.innerHTML = `<div class="mem-grid cols4" id="mgrid"></div>`;
  const grid = document.getElementById('mgrid');

  cards.forEach(val => {
    const card = document.createElement('div');
    card.className   = 'mem-card';
    card.dataset.val = val;
    card.innerHTML   = `<div class="mfront">❓</div><div class="mback">${val}</div>`;
    card.onclick = () => {
      if (lock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
      card.classList.add('flipped');
      flipped.push(card);
      if (flipped.length === 2) {
        lock = true;
        if (flipped[0].dataset.val === flipped[1].dataset.val) {
          flipped[0].classList.add('matched');
          flipped[1].classList.add('matched');
          matched++;
          setProgress(matched, pool.length);
          flipped = []; lock = false;
          addPts(2); feedback(true);
          if (matched === pool.length) setTimeout(showEnd, 700);
        } else {
          setTimeout(() => {
            flipped[0].classList.add('wrong-flip');
            flipped[1].classList.add('wrong-flip');
            setTimeout(() => {
              flipped.forEach(c => c.classList.remove('flipped', 'wrong-flip'));
              flipped = []; lock = false;
            }, 350);
          }, 800);
        }
      }
    };
    grid.appendChild(card);
  });

  killGame = () => { lock = true; };
}

/* ══════════════════════════════════════
   IGRA 5 — POČETNO SLOVO
   ══════════════════════════════════════ */
const LETTER_DATA = [
  { e: '🍎', l: 'Jabuka',    letter: 'J' },
  { e: '🍊', l: 'Naranča', letter: 'N' },
  { e: '🍋', l: 'Limun',     letter: 'L' },
  { e: '🍇', l: 'Grožđe',   letter: 'G' },
  { e: '🍉', l: 'Lubenica',  letter: 'L' },
  { e: '🍌', l: 'Banana',    letter: 'B' },
  { e: '🐘', l: 'Slon',      letter: 'S' },
  { e: '🦁', l: 'Lav',       letter: 'L' },
  { e: '🐬', l: 'Dupin',     letter: 'D' },
  { e: '🦒', l: 'Žirafa',    letter: 'Ž' },
  { e: '🐸', l: 'Žaba',      letter: 'Ž' },
  { e: '🍓', l: 'Jagoda',    letter: 'J' },
  { e: '🍐', l: 'Kruška',    letter: 'K' },
  { e: '🐼', l: 'Panda',     letter: 'P' },
  { e: '🦊', l: 'Lisica',    letter: 'L' },
  { e: '🐢', l: 'Kornjača',  letter: 'K' },
];

const ALL_LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','U','V','Z','Ž'];

function gameLetter() {
  shuffle(LETTER_DATA);
  const total = getRounds();
  let round = 0;

  function next() {
    if (round >= total) { showEnd(); return; }
    const item = LETTER_DATA[round % LETTER_DATA.length];
    round++;
    setProgress(round - 1, total);

    const distL   = shuffle(ALL_LETTERS.filter(l => l !== item.letter)).slice(0, curLevel === 'easy' ? 3 : 5);
    const choices = shuffle([item.letter, ...distL]);

    document.getElementById('instr-box').textContent = `Kojim slovom počinje: ${item.l}?`;
    tts('Kojim slovom počinje ' + item.l + '?');

    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
      <div class="big-emoji">${item.e}</div>
      <div style="font-size:1.2rem;font-weight:800;color:var(--text2)">${item.l}</div>
      <div class="letter-grid" id="lgrid"></div>`;
    startT(getTime(), () => next());

    const lgrid = document.getElementById('lgrid');
    choices.forEach(ch => {
      const btn = document.createElement('button');
      btn.className  = 'letter-btn';
      btn.textContent = ch;
      btn.onclick = () => {
        if (btn.disabled) return;
        if (ch === item.letter) {
          clearT();
          lgrid.querySelectorAll('.letter-btn').forEach(b => b.setAttribute('disabled', ''));
          btn.classList.add('correct');
          addPts(2); feedback(true);
          setTimeout(next, 900);
        } else {
          markWrong(btn);
        }
      };
      lgrid.appendChild(btn);
    });
  }

  killGame = () => {};
  next();
}

/* ══════════════════════════════════════
   IGRA 6 — ŠTO JE NESTALO?
   ══════════════════════════════════════ */
const MISSING_SETS = [
  [{ e:'🍎',l:'Jabuka'   }, { e:'🍊',l:'Naranča' }, { e:'🍋',l:'Limun'   }, { e:'🍇',l:'Grožđe'   }],
  [{ e:'🐘',l:'Slon'     }, { e:'🦁',l:'Lav'       }, { e:'🐬',l:'Dupin'   }, { e:'🐧',l:'Pingvin'  }],
  [{ e:'🍓',l:'Jagoda'   }, { e:'🍌',l:'Banana'    }, { e:'🍒',l:'Trešnja' }, { e:'🥝',l:'Kivi'     }],
  [{ e:'🦒',l:'Žirafa'   }, { e:'🐸',l:'Žaba'      }, { e:'🦓',l:'Zebra'   }, { e:'🐼',l:'Panda'    }],
  [{ e:'🍑',l:'Breskva'  }, { e:'🍍',l:'Ananas'    }, { e:'🥭',l:'Mango'   }, { e:'🍐',l:'Kruška'   }],
  [{ e:'🦊',l:'Lisica'   }, { e:'🐢',l:'Kornjača'  }, { e:'🦜',l:'Papiga'  }, { e:'🦔',l:'Jež'      }],
];

function gameMissing() {
  shuffle(MISSING_SETS);
  const total = getRounds();
  let round = 0;

  function next() {
    if (round >= total) { showEnd(); return; }
    round++;
    setProgress(round - 1, total);

    const set     = shuffle([...MISSING_SETS[(round - 1) % MISSING_SETS.length]]);
    const hi      = Math.floor(Math.random() * set.length);
    const missing = set[hi];
    const allObjs = MISSING_SETS.flat();
    const dist    = shuffle(allObjs.filter(o => o.e !== missing.e)).slice(0, curLevel === 'easy' ? 2 : 3);
    const choices = shuffle([missing, ...dist]);

    document.getElementById('instr-box').textContent = 'Koji predmet je nestao? 🔍';
    tts('Koji predmet je nestao?');

    const panel = document.getElementById('game-panel');
    panel.innerHTML = `
      <div style="font-size:.95rem;font-weight:800;color:var(--text2)">Zapamti:</div>
      <div class="obj-row" id="objrow">
        ${set.map((o, i) => `
          <div class="obj-box" id="ob${i}">
            <span class="oe">${o.e}</span>
            <span class="ol">${o.l}</span>
          </div>`).join('')}
      </div>
      <div id="qa"></div>`;

    const delay = curLevel === 'easy' ? 2200 : 1400;
    startT(getTime(), () => next());

    setTimeout(() => {
      document.getElementById('ob' + hi)?.classList.add('gone');
      const qa = document.getElementById('qa');
      if (!qa) return;
      qa.innerHTML = '<div style="font-size:.95rem;font-weight:800;color:var(--text2)">Što je nestalo? 👇</div>';
      const cw = document.createElement('div');
      cw.className = 'choices-wrap';
      choices.forEach(ch => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = `${ch.e}<span class="clbl">${ch.l}</span>`;
        btn.onclick = () => {
          if (btn.disabled) return;
          if (ch.e === missing.e) {
            clearT();
            cw.querySelectorAll('.choice-btn').forEach(b => b.setAttribute('disabled', ''));
            btn.classList.add('correct');
            addPts(2); feedback(true);
            setTimeout(next, 900);
          } else {
            markWrong(btn);
          }
        };
        cw.appendChild(btn);
      });
      qa.appendChild(cw);
    }, delay);
  }

  killGame = () => {};
  next();
}
