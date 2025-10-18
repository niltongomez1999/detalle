const messages = [
  "Ana Karina: tu sonrisa importa, aunque hoy cueste sacarla.",
  "Eres más fuerte de lo que crees; un paso a la vez está bien.",
  "Si quieres reír, tengo las peores (mejores) bromas listas para ti 😊.",
  "Mereces cariño y pausa: tómate tu tiempo, yo te acompaño.",
  "Las nubes también pasan; guarda este momento y déjalo suavizarse.",
  "Piensa en algo pequeñito que te guste: lo merece tu día.",
];

const finalLetter = `No prometo arreglarlo todo, pero sí prometo escuchar, intentar sacarte una sonrisa con una tontería y acompañarte sin prisa. Eres valiosa y tu risa, cuando llegue, será preciosa.

- Nilton`;

const envelopesContainer = document.getElementById('envelopes');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const confettiContainer = document.getElementById('confetti');
const finishSound = document.getElementById('finishSound');
const finalModal = document.getElementById('finalModal');
const closeModal = document.getElementById('closeModal');
const surprise = document.getElementById('surprise');
const closeSurprise = document.getElementById('closeSurprise');

let current = 0;
let envelopeEls = [];
let running = false; // indica que la secuencia está en ejecución
let paused = false;
let stopped = false;
let heartsInterval = null; // id del interval para corazones infinitos

function createEnvelopes(){
  envelopesContainer.innerHTML = '';
  envelopeEls = [];

  // crear una capa final (la carta) y varias capas encima
  const total = messages.length + 1;
  // emojis reutilizables para las capas
  const emojis = ['😊','🌷','🌟','🌼','💌'];

  for(let i=0;i<total;i++){
    const el = document.createElement('div');
    el.className = 'envelope locked';
    el.setAttribute('tabindex','0');
    el.dataset.idx = i;

    const msg = document.createElement('div');
    msg.className = 'message';

    if(i < messages.length){
      msg.textContent = messages[messages.length - 1 - i]; // mostrar en orden inverso para stacking
    } else {
      // carta final
      msg.innerHTML = `<div class="final-message">${finalLetter.replace(/\n/g,'<br>')}</div>`;
    }

    // agregar emoji pequeño para cada capa
    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    emoji.textContent = emojis[i % emojis.length];
  el.appendChild(msg);
  el.appendChild(emoji);

    // escuchar click/tecla
    el.addEventListener('click', () => openEnvelope(i));
    el.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') openEnvelope(i); });

    envelopesContainer.appendChild(el);
    envelopeEls.push(el);
  }
}

function openEnvelope(i){
  // solo permitir abrir la capa superior (current)
  const topIndex = current; // el primer elemento creado está arriba (data-idx 0)
  if(i !== topIndex) return; // sólo la capa superior

  const el = envelopeEls[i];
  el.classList.add('opened');
  el.classList.remove('locked');

  current++;

  // si abrimos la carta final, preguntar por nombre y personalizar
  if(i === envelopeEls.length - 1){
    // carta final abierta
      // carta final abierta (nombre ya insertado en template)
      const finalDiv = el.querySelector('.final-message');
      if(finalDiv){
        // opcional: dejar marcador para que el remitente lo cambie manualmente
        finalDiv.innerHTML = finalDiv.innerHTML.replace(/\(tu nombre\)/g, '(tu nombre)');
      }
    startBtn.disabled = false;
  } else {
    // no auto-open aquí; la secuencia controla el flujo (startSequence)
  }
}

function sleep(ms){ return new Promise(r=>setTimeout(r,ms)); }

function startSequence(){
  startBtn.disabled = true;
  resetBtn.disabled = false;
  current = 0;
  createEnvelopes();
  // Secuencia: abrir cada capa, mostrar 2s, desaparecer y continuar
  paused = false;
  stopped = false;
  running = true;
  (async function run(){
    while(current < envelopeEls.length && !stopped){
      while(paused && !stopped) await sleep(120);
      if(stopped) break;
      const idx = current;
      openEnvelope(idx);
      // mostrar mensaje 5s (respetando pausa)
      let elapsed = 0;
      while(elapsed < 5000 && !stopped){
        if(!paused){ await sleep(120); elapsed += 120; }
        else { await sleep(120); }
      }
      if(stopped) break;
      const el = envelopeEls[idx];
      if(el){
        el.classList.add('done');
        setTimeout(()=>{ try{ el.style.display = 'none'; }catch(e){} }, 420);
      }
    }
    if(!stopped){ playConfetti(); playFinishSound(); }
    if(!stopped){ playHearts(); }
    // iniciar corazones infinitos (generar periódicamente)
    if(!stopped){
      if(heartsInterval) clearInterval(heartsInterval);
      heartsInterval = setInterval(()=>{
        // generar algunos corazones al azar
        playHearts();
      }, 1200);
    }
    if(!stopped && finalModal){ finalModal.classList.add('show'); finalModal.setAttribute('aria-hidden','false'); }
    startBtn.disabled = false;
    running = false;
  })();
}

function resetAll(){
  startBtn.disabled = false;
  resetBtn.disabled = false;
  // stop any running sequence
  if(running){ stopped = true; running = false; }
  paused = false;
  // detener corazones infinitos si están activos
  if(heartsInterval){ clearInterval(heartsInterval); heartsInterval = null; }
  createEnvelopes();
}

// inicializar
createEnvelopes();

if(startBtn) startBtn.addEventListener('click', startSequence);
if(resetBtn) resetBtn.addEventListener('click', resetAll);
if(pauseBtn) pauseBtn.addEventListener('click', ()=>{
  if(!running) return;
  paused = !paused;
  pauseBtn.textContent = paused ? 'Continuar' : 'Pausa';
});
if(stopBtn) stopBtn.addEventListener('click', ()=>{
  // signal the running sequence to stop
  stopped = true;
  running = false;
  paused = false;
  if(pauseBtn) pauseBtn.textContent = 'Pausa';
  // limpiar corazones infinitos
  if(heartsInterval){ clearInterval(heartsInterval); heartsInterval = null; }
});

if(closeModal){
  closeModal.addEventListener('click', ()=>{
    if(finalModal){ finalModal.classList.remove('show'); finalModal.setAttribute('aria-hidden','true'); }
    // mostrar sorpresa pequeña
    if(surprise){ surprise.classList.add('show'); surprise.setAttribute('aria-hidden','false'); }
    // pequeño confetti de celebración
    playConfetti();
  });
}

if(closeSurprise){
  closeSurprise.addEventListener('click', ()=>{
    if(surprise){ surprise.classList.remove('show'); surprise.setAttribute('aria-hidden','true'); }
    // si el botón tiene data-href, ir a esa página
    try{
      const href = closeSurprise.getAttribute('data-href') || closeSurprise.dataset.href;
      if(href){ window.open(href, '_blank'); return; }
    }catch(e){}
    // volver al inicio: reiniciar la interfaz y poner foco en Empezar
    try{ resetAll(); }catch(e){}
    try{ startBtn.focus(); window.scrollTo({top:0,behavior:'smooth'}); }catch(e){}
  });
}

// accesibilidad: permitir abrir capas con swipe en móviles
let touchStartY = null;
if(envelopesContainer){
  envelopesContainer.addEventListener('touchstart', (e)=>{ touchStartY = e.changedTouches[0].clientY; });
  envelopesContainer.addEventListener('touchend', (e)=>{
  if(!touchStartY) return;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if(dy < -30){ // swipe up -> abrir
    const topIndex = current;
    if(topIndex < envelopeEls.length) openEnvelope(topIndex);
  }
  touchStartY = null;
  });
}
// nota: la personalización de nombre puede implementarse si se desea (prompt o campo),
// se omitió aquí para mantener la interfaz simple.

// --- confetti simple ---
function playConfetti(){
  if(!confettiContainer) return;
  // crear piezas simples
  const colors = ['#ff5c93','#ffd166','#6ee7b7','#9ad0f5','#f6b3ff'];
  for(let i=0;i<40;i++){
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.background = colors[i % colors.length];
    piece.style.left = (Math.random()*100) + '%';
    piece.style.top = (-5 - Math.random()*10) + '%';
    piece.style.transform = `rotate(${Math.random()*360}deg)`;
    piece.style.width = (6 + Math.random()*10) + 'px';
    piece.style.height = (8 + Math.random()*12) + 'px';
    piece.style.animationDuration = (1400 + Math.random()*1200) + 'ms';
    confettiContainer.appendChild(piece);
    // limpiar después
    setTimeout(()=> piece.remove(), 3000);
  }
}

function playFinishSound(){
  try{
    if(finishSound){ finishSound.currentTime = 0; finishSound.play(); }
  }catch(e){ /* autoplay restrictions may block sound; it's okay */ }
}

function playHearts(){
  if(!confettiContainer) return;
  const colors = ['#ff5c93','#ff7aa2','#ffb3c6'];
  // hearts from bottom (floatUp)
  for(let i=0;i<12;i++){
    const h = document.createElement('div');
    h.className = 'heart-piece heart-up';
    h.textContent = '❤';
    h.style.left = (10 + Math.random()*80) + '%';
    h.style.bottom = '-10%';
    h.style.color = colors[i % colors.length];
    const dur = 2000 + Math.random()*1800;
    h.style.animationDuration = dur + 'ms';
    confettiContainer.appendChild(h);
    setTimeout(()=> h.remove(), dur + 300);
  }
  // hearts from top (floatDown)
  for(let i=0;i<10;i++){
    const h = document.createElement('div');
    h.className = 'heart-piece heart-down';
    h.textContent = '❤';
    h.style.left = (5 + Math.random()*90) + '%';
    h.style.top = '-5%';
    h.style.color = colors[(i+1) % colors.length];
    const dur = 1800 + Math.random()*1600;
    h.style.animationDuration = dur + 'ms';
    confettiContainer.appendChild(h);
    setTimeout(()=> h.remove(), dur + 300);
  }
}
