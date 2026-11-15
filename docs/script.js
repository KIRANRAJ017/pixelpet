// =========================================================
// PIXEL PET WEBSITE — INTERACTIVE PLAYGROUND SCRIPT
// =========================================================

(function () {
  'use strict';

  // State
  let currentCharacter = 'mochi';
  let currentPalette = 'mint';
  let currentState = 'idle'; // 'idle', 'happy', 'surprised'
  let currentFrame = 0;
  let stateTimeout = null;

  const speechQuotes = [
    'oh hi',
    'u have snacks?',
    'nice desktop',
    'just vibing...',
    'can i live here?',
    'no thoughts. just pixels.',
    'tap me again :3',
    'click click click!'
  ];

  // DOM Elements
  const heroSprite = document.getElementById('heroSprite');
  const heroPetBtn = document.getElementById('heroPetBtn');
  const speechBubble = document.getElementById('speechBubble');
  const bubbleText = document.getElementById('bubbleText');
  const adoptCards = document.querySelectorAll('.adopt-card');
  const heroPetBox = document.getElementById('heroPetBox');

  // Update Sprite Image Source
  function updateSpriteSource() {
    if (!heroSprite) return;
    const src = `./assets/pets/${currentCharacter}/${currentPalette}/${currentState}.png`;
    heroSprite.src = src;
  }

  // Animation Frame Loop
  function tickFrame() {
    currentFrame = (currentFrame + 1) % 4;
    if (heroSprite) {
      // 128px width per frame
      heroSprite.style.left = `-${currentFrame * 128}px`;
    }
  }

  // Start 250ms frame timer
  const frameInterval = setInterval(tickFrame, 220);

  // Set Speech Bubble Text
  function setBubbleMessage(text) {
    if (!bubbleText || !speechBubble) return;
    bubbleText.textContent = text;
    speechBubble.style.animation = 'none';
    // Trigger DOM reflow to restart animation
    void speechBubble.offsetWidth;
    speechBubble.style.animation = 'bounceBubble 3s ease-in-out infinite';
  }

  // Random Speech Bubble Cycle
  function scheduleNextBubble() {
    const delay = Math.floor(Math.random() * 4000) + 5000;
    setTimeout(() => {
      // Only change if currently in idle state
      if (currentState === 'idle') {
        const quote = speechQuotes[Math.floor(Math.random() * speechQuotes.length)];
        setBubbleMessage(quote);
      }
      scheduleNextBubble();
    }, delay);
  }
  scheduleNextBubble();

  // Trigger Reaction (Happy / Surprised)
  function triggerPetReaction() {
    if (stateTimeout) {
      clearTimeout(stateTimeout);
    }

    const nextState = Math.random() < 0.75 ? 'happy' : 'surprised';
    currentState = nextState;
    currentFrame = 0;
    updateSpriteSource();

    // Spawn tiny heart or star particle
    spawnParticle();

    // Reaction speech
    const reactions = ['yay! ♥', 'hehee!', '✨ sparkle ✨', 'woah! :O', 'warm pixels~'];
    const chosen = reactions[Math.floor(Math.random() * reactions.length)];
    setBubbleMessage(chosen);

    // Return to idle after 1.5s
    stateTimeout = setTimeout(() => {
      currentState = 'idle';
      currentFrame = 0;
      updateSpriteSource();
    }, 1500);
  }

  // Particle Effect
  function spawnParticle() {
    if (!heroPetBox) return;
    const particle = document.createElement('div');
    const isHeart = Math.random() < 0.6;
    particle.textContent = isHeart ? '♥' : '✦';
    particle.style.position = 'absolute';
    particle.style.left = `${Math.floor(Math.random() * 60) + 34}px`;
    particle.style.top = '30px';
    particle.style.fontSize = isHeart ? '20px' : '16px';
    particle.style.color = isHeart ? '#FF6B6B' : '#F2C66D';
    particle.style.pointerEvents = 'none';
    particle.style.fontFamily = 'monospace';
    particle.style.zIndex = '30';
    particle.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    particle.style.opacity = '1';

    heroPetBox.appendChild(particle);

    setTimeout(() => {
      particle.style.transform = `translateY(-40px) scale(1.3) rotate(${Math.floor(Math.random() * 40) - 20}deg)`;
      particle.style.opacity = '0';
    }, 20);

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 850);
  }

  // Click on Hero Pet
  if (heroPetBtn) {
    heroPetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      triggerPetReaction();
    });
  }

  // Adoption Card Clicks
  adoptCards.forEach((card) => {
    card.addEventListener('click', () => {
      adoptCards.forEach((c) => {
        c.classList.remove('active');
        c.setAttribute('aria-checked', 'false');
      });

      card.classList.add('active');
      card.setAttribute('aria-checked', 'true');

      const char = card.getAttribute('data-character');
      const palette = card.getAttribute('data-palette');
      const bubble = card.getAttribute('data-bubble');

      if (char) currentCharacter = char;
      if (palette) currentPalette = palette;

      triggerPetReaction();
      if (bubble) {
        setBubbleMessage(bubble);
      }
    });
  });

  // Smooth scroll for nav anchors
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Configure Download Button link based on environment
  const directDownloadBtn = document.getElementById('directDownloadBtn');
  if (directDownloadBtn) {
    if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Local dev testing
      directDownloadBtn.setAttribute('href', '../release/Pixel Pet Setup 1.0.0.exe');
    } else {
      // Production hosted on GitHub Pages
      directDownloadBtn.setAttribute('href', 'https://github.com/KIRANRAJ017/pixelpet/releases/download/v1.0.0/Pixel.Pet.Setup.1.0.0.exe');
    }
    directDownloadBtn.addEventListener('click', () => {
      console.log('Initiating Pixel Pet installer download...');
    });
  }

  // Initial load
  updateSpriteSource();
})();
