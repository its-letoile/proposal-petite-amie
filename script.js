// State variables
let noCount = 0;
let ouiScale = 1.0;
let isMusicPlaying = true; // Enabled by default
let audioCtx = null;
let musicInterval = null;
let musicStarted = false;

// DOM Elements
const btnOui = document.getElementById('btn-oui');
const btnNon = document.getElementById('btn-non');
const dynamicSubtitle = document.getElementById('dynamic-subtitle');
const pleadingText = document.getElementById('pleading-text');
const mainGif = document.getElementById('main-gif');
const celebrationGif = document.getElementById('celebration-gif');
const stickersContainer = document.getElementById('stickers-container');
const musicToggle = document.getElementById('music-toggle');
const celebrationModal = document.getElementById('celebration-modal');
const btnReplay = document.getElementById('btn-replay');

// Strictly verified existing local reaction header GIFs
const headerGifs = [
  "./gifs/bubu-propose.gif",
  "./gifs/bubu-sad0.gif",
  "./gifs/bubu-sad1.gif",
  "./gifs/bubu-sad2.gif",
  "./gifs/bubu-sad3.gif",
  "./gifs/cat-crying.gif",
  "./gifs/cat-angry.gif",
  "./gifs/cat-wink.gif",
  "./gifs/cat-flower.gif",
  "./gifs/cat-heart.gif",
  "./gifs/cat-happy.gif"
];

// Strictly verified existing local sticker GIFs popping on "NON"
const stickerGifs = [
  "./gifs/bubu-happy0.gif",
  "./gifs/bubu-happy1.gif",
  "./gifs/bubu-happy2.gif",
  "./gifs/sticker-hugging.gif",
  "./gifs/sticker-dance.gif",
  "./gifs/sticker-happy.gif",
  "./gifs/sticker-heartcat.gif",
  "./gifs/sticker-lovecat.gif",
  "./gifs/sticker-cat-blink.gif",
  "./gifs/sticker-flower-grow.gif",
  "./gifs/cat-flower.gif",
  "./gifs/cat-heart.gif",
  "./gifs/cat-wink.gif"
];

// Safety fallback for main GIF if any image fails to load
if (mainGif) {
  mainGif.onerror = function() {
    this.onerror = null;
    this.src = "./gifs/bubu-propose.gif";
  };
}

if (celebrationGif) {
  celebrationGif.onerror = function() {
    this.onerror = null;
    this.src = "./gifs/bubu-happy1.gif";
  };
}

// Funny pleading messages
const pleadingPhrases = [
  "Attends... Tu as vraiment essayé de cliquer sur Non ?! 😱",
  "Regarde la taille du bouton OUI, il t'attend ! 👀✨",
  "Oups ! Le bouton NON s'est enfui ! 🏃💨",
  "Tu es sûre ? Pense à nos futurs chats et nos gâteaux ! 🐱🍰",
  "Le OUI devient de plus en plus gros par amour ! 💕",
  "Même Bubu & Dudu te demandent de dire OUI ! 🌸💍",
  "Allez, ne fais pas la timide ! 💖",
  "Tu n'as plus aucune chance d'échapper au OUI ! 🔥✨",
  "C'est la journée internationale des petites amies, dis OUI ! 🌹😍",
  "Je sais que tu veux dire OUI ! 🥰✨"
];

// --- Audio Effects via Web Audio API ---
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playChordStep(chords, chordIdx) {
  if (!isMusicPlaying || !audioCtx) return;
  const currentChord = chords[chordIdx % chords.length];
  currentChord.forEach((note, nIdx) => {
    setTimeout(() => {
      if (!isMusicPlaying || !audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = note * 1.5;
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.log("Audio synth error", e);
      }
    }, nIdx * 160);
  });
}

function startMusicLoop() {
  if (musicInterval) clearInterval(musicInterval);
  const chords = [
    [261.63, 329.63, 392.00], // C
    [220.00, 261.63, 329.63], // Am
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66]  // G
  ];
  let stepIndex = 0;
  
  playChordStep(chords, stepIndex++);

  musicInterval = setInterval(() => {
    if (!isMusicPlaying || !audioCtx) return;
    playChordStep(chords, stepIndex++);
  }, 1200);
}

function startAudioOnUserGesture() {
  if (musicStarted) return;
  initAudio();
  if (isMusicPlaying) {
    startMusicLoop();
    musicStarted = true;
  }
}

function toggleBackgroundMusic() {
  initAudio();
  if (isMusicPlaying) {
    isMusicPlaying = false;
    musicToggle.classList.remove('playing');
    if (musicInterval) clearInterval(musicInterval);
  } else {
    isMusicPlaying = true;
    musicToggle.classList.add('playing');
    startMusicLoop();
    musicStarted = true;
  }
}

musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  toggleBackgroundMusic();
});

try {
  initAudio();
  if (audioCtx && audioCtx.state === 'running') {
    startMusicLoop();
    musicStarted = true;
  }
} catch (e) {
  console.log("Autoplay blocked on load, waiting for gesture", e);
}

['pointerdown', 'touchstart', 'click', 'mousemove', 'scroll', 'keydown'].forEach(evtType => {
  window.addEventListener(evtType, startAudioOnUserGesture, { passive: true });
});

function playPopSound() {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.log("Audio play blocked", e);
  }
}

function playVictoryChime() {
  try {
    initAudio();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = audioCtx.currentTime + (index * 0.12);
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  } catch (e) {
    console.log("Victory audio error", e);
  }
}

// --- Move NON Button safely within viewport ---
function dodgeNonButton(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  startAudioOnUserGesture();
  noCount++;
  playPopSound();
  
  if (navigator.vibrate) {
    navigator.vibrate(40);
  }

  btnNon.classList.add('evasive');

  const btnWidth = btnNon.offsetWidth || 100;
  const btnHeight = btnNon.offsetHeight || 40;
  const padding = 20;

  const maxX = window.innerWidth - btnWidth - padding;
  const maxY = window.innerHeight - btnHeight - padding;

  const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
  const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

  btnNon.style.left = `${randomX}px`;
  btnNon.style.top = `${randomY}px`;

  // Grow the OUI button!
  ouiScale += 0.35;
  btnOui.style.transform = `scale(${ouiScale})`;
  btnOui.style.boxShadow = `0 12px ${30 + noCount * 5}px rgba(255, 0, 85, ${Math.min(0.9, 0.4 + noCount * 0.08)})`;

  // Update dynamic text
  const phrase = pleadingPhrases[noCount % pleadingPhrases.length];
  pleadingText.innerHTML = phrase;

  // Change main header GIF dynamically
  const idx = noCount % headerGifs.length;
  if (mainGif) {
    mainGif.src = headerGifs[idx];
  }

  // Spawn 2 to 3 verified cute animated GIF stickers on EVERY press!
  spawnSticker();
  spawnSticker();
  if (noCount % 2 === 0) {
    spawnSticker();
  }
}

btnNon.addEventListener('mouseenter', dodgeNonButton);
btnNon.addEventListener('touchstart', dodgeNonButton, { passive: false });
btnNon.addEventListener('click', dodgeNonButton);

// --- Spawn Verified Cute Animated GIF Stickers ---
function spawnSticker() {
  const sticker = document.createElement('img');
  const stickerIdx = Math.floor(Math.random() * stickerGifs.length);
  const randomGif = stickerGifs[stickerIdx];

  sticker.onerror = function() {
    this.onerror = null;
    this.src = "./gifs/bubu-happy0.gif";
  };

  sticker.src = randomGif;
  sticker.className = 'spawned-sticker';
  
  const size = Math.floor(Math.random() * 45) + 75; // 75px to 120px
  sticker.style.width = `${size}px`;
  sticker.style.height = `${size}px`;

  const posX = Math.random() * (window.innerWidth - size - 20) + 10;
  const posY = Math.random() * (window.innerHeight - size - 20) + 10;
  const rotation = Math.floor(Math.random() * 40) - 20;

  sticker.style.left = `${posX}px`;
  sticker.style.top = `${posY}px`;
  sticker.style.setProperty('--rot', `${rotation}deg`);

  sticker.addEventListener('click', () => {
    playPopSound();
    sticker.style.transform = 'scale(1.4) rotate(15deg)';
    setTimeout(() => {
      sticker.remove();
    }, 200);
  });

  stickersContainer.appendChild(sticker);
}

// --- OUI Button Click (Success Celebration) ---
btnOui.addEventListener('click', () => {
  startAudioOnUserGesture();
  playVictoryChime();
  
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#ff477e', '#ff0055', '#ffd166', '#ffffff']
    });
    
    setTimeout(() => {
      confetti({
        particleCount: 90,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffccd5', '#ff477e', '#fff']
      });
      confetti({
        particleCount: 90,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffccd5', '#ff477e', '#fff']
      });
    }, 250);
  }

  celebrationModal.classList.remove('hidden');
});

// Replay Game
btnReplay.addEventListener('click', () => {
  noCount = 0;
  ouiScale = 1.0;
  btnOui.style.transform = 'scale(1)';
  btnOui.style.boxShadow = '0 8px 24px rgba(255, 0, 85, 0.4)';
  
  btnNon.classList.remove('evasive');
  btnNon.style.left = 'auto';
  btnNon.style.top = 'auto';

  pleadingText.innerHTML = 'Appuie sur <strong>OUI</strong> pour me rendre le plus heureux ! 🥰';
  if (mainGif) mainGif.src = headerGifs[0];
  
  stickersContainer.innerHTML = '';
  celebrationModal.classList.add('hidden');
});

// --- Canvas Hearts & Petals Background ---
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class HeartParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height + Math.random() * 40;
    this.size = Math.random() * 14 + 10;
    this.speedY = Math.random() * 1.5 + 0.8;
    this.speedX = Math.sin(Math.random() * Math.PI) * 0.8;
    this.opacity = Math.random() * 0.6 + 0.3;
    this.color = Math.random() > 0.4 ? '#ff75a0' : '#ffb3c6';
    this.rotation = Math.random() * 360;
    this.rotSpeed = (Math.random() - 0.5) * 1.5;
  }

  update() {
    this.y -= this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotSpeed;
    if (this.y < -30) {
      this.reset();
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    const topCurveHeight = this.size * 0.3;
    ctx.beginPath();
    ctx.moveTo(0, topCurveHeight);
    ctx.bezierCurveTo(0, 0, -this.size / 2, 0, -this.size / 2, topCurveHeight);
    ctx.bezierCurveTo(-this.size / 2, (this.size + topCurveHeight) / 2, 0, this.size, 0, this.size);
    ctx.bezierCurveTo(0, this.size, this.size / 2, (this.size + topCurveHeight) / 2, this.size / 2, topCurveHeight);
    ctx.bezierCurveTo(this.size / 2, 0, 0, 0, 0, topCurveHeight);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

function initParticles() {
  particles = [];
  const count = Math.floor(window.innerWidth / 25);
  for (let i = 0; i < count; i++) {
    particles.push(new HeartParticle());
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

window.addEventListener('pointerdown', (e) => {
  if (e.target.tagName !== 'BUTTON' && !e.target.closest('.proposal-card') && !e.target.closest('.celebration-card')) {
    for (let i = 0; i < 5; i++) {
      const p = new HeartParticle();
      p.x = e.clientX;
      p.y = e.clientY;
      p.speedY = (Math.random() - 0.5) * 3;
      p.speedX = (Math.random() - 0.5) * 3;
      particles.push(p);
      if (particles.length > 60) particles.shift();
    }
  }
});
