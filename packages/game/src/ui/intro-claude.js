import lottie from 'lottie-web/build/player/lottie_light';
import animationData from '../assets/claude-intro.json';

/* second launch card: the supplied Lottie (logo + wordmark). It is built at start-up and played by core/boot.js when the card appears */
let anim = null;

export function initializeClaudeIntro() {
  const box = document.getElementById('claudeAnim');
  const boot = document.getElementById('boot');
  if (!box || !boot || boot.classList.contains('skip')) return;
  try {
    anim = lottie.loadAnimation({ container: box, renderer: 'svg', loop: false, autoplay: false, animationData, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
  } catch { boot.classList.add('nolottie') }
}

export function playClaudeIntro() {
  if (!anim) return;
  anim.setSpeed(1.4); anim.playSegments([0, 100], true);
  setTimeout(() => { if (anim) { anim.destroy(); anim = null } }, 4200);
}
