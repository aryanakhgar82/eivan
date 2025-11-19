
/* Super Complete app.js */
const WIN_TARGET = 5;
const TIMER_SECONDS = 15;
let pool = [...QUESTIONS].sort(()=>Math.random()-0.5);
let currentIndex = 0, asked = 0, streak = 0;
let timer = null, remaining = TIMER_SECONDS, waiting=false;
let soundOn = true;

// DOM
const startBtn = document.getElementById('startBtn');
const howBtn = document.getElementById('howBtn');
const qTotal = document.getElementById('qTotal');
const qTotal2 = document.getElementById('qTotal2');
const qIndex = document.getElementById('qIndex');
const questionText = document.getElementById('questionText');
const choicesEl = document.getElementById('choices');
const quizArea = document.getElementById('quizArea');
const timerBar = document.getElementById('timerBar');
const timerText = document.getElementById('timerText');
const streakDisplay = document.getElementById('streakDisplay');
const progressFill = document.getElementById('progressFill');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');
const winModal = document.getElementById('winModal');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const playAgain = document.getElementById('playAgain');
const bestStreakEl = document.getElementById('bestStreak');
const leaderboardList = document.getElementById('leaderboardList');
const soundToggle = document.getElementById('soundToggle');
const fullscreenBtn = document.getElementById('fullscreenBtn');

// UI init
qTotal && (qTotal.innerText = pool.length);
qTotal2 && (qTotal2.innerText = pool.length);
bestStreakEl && (bestStreakEl.innerText = localStorage.getItem('q_best') || 0);
renderLeaderboard();

// Sound (simple audio using WebAudio API tones)
let audioCtx = null;
function beep(freq, time=0.08, type='sine') {
  if(!soundOn) return;
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
  o.connect(g); g.connect(audioCtx.destination);
  o.start(); o.stop(audioCtx.currentTime + time);
}

// particle background
(function initCanvas(){
  const canvas = document.getElementById('bgCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles=[];
  function resize(){ w = canvas.width = innerWidth; h = canvas.height = innerHeight; particles = []; for(let i=0;i<80;i++){ particles.push({x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-0.5)*0.6, vy:(Math.random()-0.5)*0.6, r:1+Math.random()*2}); } }
  function draw(){
    ctx.clearRect(0,0,w,h);
    for(let p of particles){
      p.x += p.vx; p.y += p.vy;
      if(p.x<0) p.x=w; if(p.x>w) p.x=0; if(p.y<0) p.y=h; if(p.y>h) p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  addEventListener('resize', resize);
  resize(); draw();
})();

// helpers
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]} return a }

function renderLeaderboard(){
  const data = JSON.parse(localStorage.getItem('q_scores')||'[]');
  leaderboardList.innerHTML='';
  data.slice(0,10).forEach(item=>{
    const li = document.createElement('li');
    li.innerText = item.name + ' — ' + item.score;
    leaderboardList.appendChild(li);
  });
}

// game logic
function startGame(){
  pool = shuffle([...QUESTIONS]);
  currentIndex = 0; asked=0; streak=0; waiting=false;
  updateStreak();
  quizArea.classList.remove('hidden');
  renderQuestion();
}

startBtn && startBtn.addEventListener('click', ()=>{ startGame(); });
howBtn && howBtn.addEventListener('click', ()=>{ alert('هدف: ۵ پاسخ صحیح پشت‌سرهم. هر سوال ۱۵ ثانیه.'); });

function renderQuestion(){
  if(currentIndex >= pool.length) currentIndex = 0;
  const item = pool[currentIndex];
  qIndex && (qIndex.innerText = asked+1);
  questionText.innerText = item.q;
  choicesEl.innerHTML='';
  waiting=false; nextBtn.disabled=true;
  remaining = TIMER_SECONDS; updateTimerVisual();
  item.choices.forEach((c,i)=>{
    const b = document.createElement('button');
    b.className='choice'; b.innerText = c; b.dataset.index=i;
    b.addEventListener('click', onChoose);
    choicesEl.appendChild(b);
  });
  startTimer();
}

function updateStreak(){ streakDisplay && (streakDisplay.innerText = streak); progressFill && (progressFill.style.width = Math.min(100,(streak/WIN_TARGET)*100)+'%'); }

function startTimer(){
  stopTimer();
  timerText.innerText = remaining;
  timerBar.style.width = '100%';
  timer = setInterval(()=>{
    remaining -= 0.2;
    if(remaining <= 0){
      clearInterval(timer); remaining=0; timerText.innerText=0; timerBar.style.width='0%'; handleTimeout(); return;
    }
    timerText.innerText = Math.ceil(remaining);
    timerBar.style.width = Math.max(0,(remaining/TIMER_SECONDS)*100) + '%';
  },200);
}

function stopTimer(){ if(timer){ clearInterval(timer); timer=null; } }

function handleTimeout(){
  Array.from(choicesEl.children).forEach(ch=>ch.disabled=true);
  const item = pool[currentIndex];
  const correctBtn = Array.from(choicesEl.children).find(ch=>Number(ch.dataset.index)===item.a);
  if(correctBtn) correctBtn.classList.add('correct');
  streak = 0; updateStreak();
  waiting=true; nextBtn.disabled=false; asked += 1;
  beep(220,0.12,'sine');
}

function onChoose(e){
  if(waiting) return;
  stopTimer();
  const btn = e.currentTarget; const chosen = Number(btn.dataset.index);
  const item = pool[currentIndex];
  Array.from(choicesEl.children).forEach(ch=>ch.disabled=true);
  if(chosen === item.a){
    btn.classList.add('correct'); streak += 1; updateStreak(); beep(880,0.08,'sine');
    if(streak >= WIN_TARGET){ showWin(); return; }
  } else {
    btn.classList.add('wrong'); const correctBtn = Array.from(choicesEl.children).find(ch=>Number(ch.dataset.index)===item.a); if(correctBtn) correctBtn.classList.add('correct');
    streak = 0; updateStreak(); beep(200,0.12,'sine');
  }
  waiting=true; nextBtn.disabled=false; asked += 1;
}

nextBtn && nextBtn.addEventListener('click', ()=>{ currentIndex += 1; renderQuestion(); });
restartBtn && restartBtn.addEventListener('click', ()=>{ startGame(); });

function showWin(){
  stopTimer(); winModal.classList.remove('hidden'); quizArea.classList.add('hidden');
  const prev = Number(localStorage.getItem('q_best')||0); if(streak>prev){ localStorage.setItem('q_best',streak); bestStreakEl.innerText = streak; }
}

playAgain && playAgain.addEventListener('click', ()=>{ winModal.classList.add('hidden'); startGame(); });
saveScoreBtn && saveScoreBtn.addEventListener('click', ()=>{
  const name = prompt('نام خود را وارد کنید برای ذخیره رکورد:','بازیکن');
  if(!name) return;
  const arr = JSON.parse(localStorage.getItem('q_scores')||'[]'); arr.unshift({name: name, score: streak, date: Date.now()}); localStorage.setItem('q_scores', JSON.stringify(arr)); renderLeaderboard(); winModal.classList.add('hidden'); startGame();
});

// sound toggle
soundToggle && soundToggle.addEventListener('click', ()=>{ soundOn = !soundOn; soundToggle.setAttribute('aria-pressed', String(soundOn)); soundToggle.textContent = soundOn ? '🔊' : '🔈'; });

// fullscreen toggle
fullscreenBtn && fullscreenBtn.addEventListener('click', ()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen().catch(()=>{});
});

// keyboard shortcuts: 1-4 to pick, n for next, r for restart
document.addEventListener('keydown', (e)=>{
  if(!quizArea || quizArea.classList.contains('hidden')) return;
  if(['1','2','3','4'].includes(e.key)){
    const idx = Number(e.key)-1; const btn = choicesEl.children[idx]; if(btn) btn.click();
  } else if(e.key.toLowerCase() === 'n'){ nextBtn && nextBtn.click(); }
  else if(e.key.toLowerCase() === 'r'){ restartBtn && restartBtn.click(); }
});

// init
window.addEventListener('load', ()=>{ qTotal && (qTotal.innerText = pool.length); qTotal2 && (qTotal2.innerText = pool.length); updateStreak(); renderLeaderboard(); });
