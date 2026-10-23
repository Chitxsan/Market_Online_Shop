(() => {
  "use strict";

  const config = window.BIRTHDAY_CONFIG || {};
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  const pageShell = $("#pageShell");
  const experience = $("#experience");
  const openingPanel = $("#openingPanel");
  const giftButton = $("#giftButton");
  const revealPanel = $("#birthdayReveal");
  const finalePanel = $("#finalePanel");
  const typedHeading = $("#typedHeading");
  const typedMessage = $("#typedMessage");
  const toast = $("#toast");
  const canvas = $("#celebrationCanvas");
  let opened = false;
  let toastTimer;

  function applyPersonalization() {
    const colors = config.colors || {};
    for (const [key, variable] of [["rose", "--rose"], ["lavender", "--lavender"], ["sky", "--sky"], ["ink", "--ink"]]) {
      if (typeof colors[key] === "string" && colors[key]) document.documentElement.style.setProperty(variable, colors[key]);
    }
    const name = String(config.name || "Your Birthday Girl").trim();
    $("#birthdayHeading").setAttribute("aria-label", `Happy Birthday, ${name}`);
    $("#portraitFrame").setAttribute("aria-label", `Portrait of ${name}`);
    $(".portrait-caption").innerHTML = `${escapeHtml(name)} <span aria-hidden="true">♡</span>`;
    if (config.photo) {
      const photo = document.createElement("img");
      photo.className = "portrait-photo";
      photo.alt = `A portrait of ${name}`;
      photo.src = config.photo;
      photo.addEventListener("load", () => { $("#portraitArt").hidden = true; }, { once: true });
      photo.addEventListener("error", () => { photo.remove(); showToast("The photo could not be loaded, so the illustrated portrait is here instead."); }, { once: true });
      $("#portraitFrame").prepend(photo);
    }
    $("#loveNote").textContent = config.extraLove || "You make every day a little brighter just by being you. 💗";
    typedHeading.dataset.text = `Happy Birthday, ${name}! 💖🎂`;
    typedMessage.dataset.text = config.message || "I hope today brings you all the happiness, love, and laughter you deserve. Keep shining, beautiful. 💕✨";
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), duration);
  }

  function typeText(element, text, speed) {
    element.textContent = "";
    if (reducedMotion) { element.textContent = text; return; }
    let index = 0;
    const typeNext = () => {
      if (index >= text.length) return;
      element.textContent += text[index++];
      window.setTimeout(typeNext, text[index - 1] === "\n" ? speed * 5 : speed);
    };
    typeNext();
  }

  function openSurprise() {
    if (opened) return;
    opened = true;
    giftButton.disabled = true;
    giftButton.classList.add("is-opening");
    pageShell.classList.add("is-revealed");
    playChime([659, 784, 988], .08);
    launchCelebration(150);
    window.setTimeout(() => {
      openingPanel.classList.add("is-leaving");
      window.setTimeout(() => {
        openingPanel.hidden = true;
        revealPanel.hidden = false;
        requestAnimationFrame(() => {
          revealPanel.classList.add("is-entering", "is-visible");
          typeText(typedHeading, typedHeading.dataset.text, 48);
          window.setTimeout(() => typeText(typedMessage, typedMessage.dataset.text, 13), 500);
          launchCelebration(80);
        });
      }, reducedMotion ? 10 : 470);
    }, reducedMotion ? 10 : 530);
  }

  $("#giftButton").addEventListener("click", openSurprise);
  $("#openCta").addEventListener("click", openSurprise);

  $$(".secret-orb").forEach((button) => button.addEventListener("click", () => {
    $("#secretResult").textContent = button.dataset.message;
    playChime([880, 1175], .045);
  }));

  $("#loveButton").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const note = $("#loveNote");
    const willOpen = note.hidden;
    note.hidden = !willOpen;
    button.setAttribute("aria-expanded", String(willOpen));
    button.innerHTML = willOpen ? "A Little More Love <span aria-hidden=\"true\">💗</span>" : "Keep this love note tucked away <span aria-hidden=\"true\">💌</span>";
    if (willOpen) playChime([698, 880], .05);
  });

  const candles = $$(".candle");
  candles.forEach((candle, index) => candle.addEventListener("click", () => {
    if (candle.classList.contains("is-out")) return;
    candle.classList.add("is-out");
    candle.setAttribute("aria-label", `Candle ${index + 1} is blown out`);
    playChime([523 - index * 55], .055);
    const stillLit = candles.filter((item) => !item.classList.contains("is-out")).length;
    if (!stillLit) {
      $("#wishMessage").textContent = "Your wish is on its way to the stars. ✨";
      launchCelebration(58);
      showToast("Wish made! May it come true. ✨");
    } else {
      $("#wishMessage").textContent = `${stillLit} little ${stillLit === 1 ? "flame" : "flames"} left to blow out…`;
    }
  }));

  function showFinale() {
    if (finalePanel.hidden) {
      revealPanel.hidden = true;
      finalePanel.hidden = false;
      requestAnimationFrame(() => finalePanel.classList.add("is-entering"));
    }
    pageShell.classList.add("is-revealed");
    launchCelebration(125);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  $("#finaleButton").addEventListener("click", showFinale);
  $("#returnButton").addEventListener("click", () => {
    finalePanel.hidden = true;
    revealPanel.hidden = false;
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });
  $("#finaleCelebrate").addEventListener("click", () => {
    launchCelebration(180);
    playChime([659, 784, 988, 1318], .06);
    showToast("A little more birthday magic, just for you! 🎉");
  });
  $("#celebrateButton").addEventListener("click", () => {
    launchCelebration(180);
    playChime([659, 784, 988, 1318], .06);
    showToast("Happy birthday! Let the magic begin! 🎉");
  });

  // One canvas and short bursts keep celebration effects light on mobile devices.
  const context2d = canvas.getContext("2d");
  let particles = [];
  let frameId = 0;
  let canvasWidth = 0;
  let canvasHeight = 0;
  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = Math.round(canvasWidth * ratio);
    canvas.height = Math.round(canvasHeight * ratio);
    context2d.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();

  function launchCelebration(amount = 120) {
    if (reducedMotion) return;
    const colors = ["#f295b4", "#b4a3e0", "#9ed5e5", "#f4d68f", "#fff2fa", "#e9a9cd"];
    for (let i = 0; i < amount; i++) {
      particles.push({
        x: canvasWidth * (.2 + Math.random() * .6), y: canvasHeight * (.26 + Math.random() * .27),
        vx: (Math.random() - .5) * 8, vy: -2 - Math.random() * 7, gravity: .13 + Math.random() * .13,
        size: 3 + Math.random() * 5, rotation: Math.random() * 6, spin: (Math.random() - .5) * .2,
        color: colors[Math.floor(Math.random() * colors.length)], life: 80 + Math.random() * 75,
        heart: Math.random() > .76
      });
    }
    const fireworkBursts = Math.max(2, Math.round(amount / 65));
    for (let burst = 0; burst < fireworkBursts; burst++) {
      const originX = canvasWidth * (.18 + Math.random() * .64);
      const originY = canvasHeight * (.12 + Math.random() * .31);
      const color = colors[Math.floor(Math.random() * colors.length)];
      const sparks = 18;
      for (let spark = 0; spark < sparks; spark++) {
        const angle = (Math.PI * 2 * spark) / sparks;
        const speed = 1.4 + Math.random() * 2.6;
        particles.push({
          x: originX, y: originY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          gravity: .025, size: 1.6 + Math.random() * 1.5, rotation: 0, spin: 0,
          color, life: 34 + Math.random() * 17, heart: false, firework: true
        });
      }
    }
    if (particles.length > 420) particles = particles.slice(-420);
    if (!frameId) frameId = requestAnimationFrame(drawCelebration);
  }
  function drawCelebration() {
    context2d.clearRect(0, 0, canvasWidth, canvasHeight);
    particles = particles.filter((particle) => particle.life > 0 && particle.y < canvasHeight + 30);
    for (const particle of particles) {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.vx *= .992;
      particle.rotation += particle.spin;
      particle.life -= 1;
      context2d.save();
      context2d.translate(particle.x, particle.y);
      context2d.rotate(particle.rotation);
      context2d.globalAlpha = Math.min(1, particle.life / 22);
      context2d.fillStyle = particle.color;
      if (particle.heart) {
        context2d.font = `${particle.size * 4}px Georgia`;
        context2d.textAlign = "center";
        context2d.fillText("♥", 0, 0);
      } else if (particle.firework) {
        context2d.beginPath();
        context2d.arc(0, 0, particle.size, 0, Math.PI * 2);
        context2d.fill();
      } else {
        context2d.fillRect(-particle.size / 2, -particle.size * .7, particle.size, particle.size * 1.4);
      }
      context2d.restore();
    }
    if (particles.length) frameId = requestAnimationFrame(drawCelebration);
    else { context2d.clearRect(0, 0, canvasWidth, canvasHeight); frameId = 0; }
  }

  // Optional music starts only after the user asks. A local file can be set in birthday-config.js;
  // the built-in fallback is a quiet, slowly changing instrumental chord loop.
  let audioContext;
  let musicGain;
  let musicTimer;
  let musicNotes = [];
  let musicPlaying = false;
  let audioFile;
  let usingFile = false;
  const chords = [[261.63, 329.63, 392, 493.88], [220, 261.63, 329.63, 392], [174.61, 220, 261.63, 349.23], [196, 246.94, 293.66, 392]];
  let chordIndex = 0;

  function ensureAudio() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!audioContext && AudioCtor) audioContext = new AudioCtor();
    if (audioContext && !musicGain) {
      musicGain = audioContext.createGain();
      musicGain.gain.value = 0;
      musicGain.connect(audioContext.destination);
    }
    return Boolean(audioContext && musicGain);
  }

  function scheduleChord() {
    if (!audioContext || !musicGain || !musicPlaying) return;
    const now = audioContext.currentTime;
    const chord = chords[chordIndex++ % chords.length];
    chord.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const voice = audioContext.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      voice.gain.setValueAtTime(0, now);
      voice.gain.linearRampToValueAtTime(index === 0 ? .13 : .052, now + 1.5);
      voice.gain.setValueAtTime(index === 0 ? .13 : .052, now + 3.1);
      voice.gain.linearRampToValueAtTime(0, now + 4.1);
      oscillator.connect(voice).connect(musicGain);
      oscillator.start(now);
      oscillator.stop(now + 4.2);
    });
  }

  function startSynthMusic() {
    if (!ensureAudio()) { showToast("This browser does not support background music."); return false; }
    audioContext.resume();
    musicPlaying = true;
    musicGain.gain.cancelScheduledValues(audioContext.currentTime);
    musicGain.gain.setTargetAtTime(.24, audioContext.currentTime, .8);
    scheduleChord();
    musicTimer = window.setInterval(scheduleChord, 3900);
    return true;
  }

  function stopSynthMusic() {
    musicPlaying = false;
    window.clearInterval(musicTimer);
    if (audioContext && musicGain) musicGain.gain.setTargetAtTime(0, audioContext.currentTime, .2);
  }

  function updateMusicButton(active) {
    $("#musicToggle").setAttribute("aria-pressed", String(active));
    $("#musicToggle").setAttribute("aria-label", active ? "Pause birthday music" : "Turn birthday music on");
    $("#musicLabel").textContent = active ? "Music on" : "Music off";
  }

  $("#musicToggle").addEventListener("click", async () => {
    if (musicPlaying) {
      if (usingFile && audioFile) audioFile.pause(); else stopSynthMusic();
      musicPlaying = false;
      updateMusicButton(false);
      return;
    }
    const source = String(config.music?.src || "").trim();
    if (source) {
      if (!audioFile) {
        audioFile = new Audio(source);
        audioFile.loop = true;
        audioFile.volume = .35;
      }
      try {
        await audioFile.play();
        usingFile = true;
        musicPlaying = true;
      } catch {
        usingFile = false;
        if (!musicPlaying) musicPlaying = startSynthMusic();
        showToast("Using the soft instrumental while the selected audio file is unavailable.");
      }
    } else {
      usingFile = false;
      musicPlaying = startSynthMusic();
    }
    updateMusicButton(musicPlaying);
  });

  function playChime(notes, volume = .07) {
    if (!ensureAudio()) return;
    audioContext.resume();
    const start = audioContext.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start + index * .08);
      gain.gain.setValueAtTime(0, start + index * .08);
      gain.gain.linearRampToValueAtTime(volume, start + index * .08 + .018);
      gain.gain.exponentialRampToValueAtTime(.001, start + index * .08 + .58);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start + index * .08);
      oscillator.stop(start + index * .08 + .62);
    });
  }

  applyPersonalization();
})();
