import lottie from 'lottie-web/build/player/lottie_light';
import animationData from '../assets/claude-intro.json';

/* second launch card: plays the supplied Lottie (logo + wordmark) when the card appears; any key or click skips it */
export function initializeClaudeIntro() {
  const box = document.getElementById('claudeAnim');
  const boot = document.getElementById('boot');
  if (!box || !boot) return;
  let anim;
  try {
    anim = lottie.loadAnimation({ container: box, renderer: 'svg', loop: false, autoplay: false, animationData, rendererSettings: { preserveAspectRatio: 'xMidYMid meet' } });
  } catch (e) { boot.classList.add('nolottie'); return }
  const start = () => { if (anim && !boot.classList.contains('skip')) { anim.setSpeed(1.4); anim.playSegments([0, 100], true) } };
  const wait = Math.max(0, 1900 - performance.now());
  setTimeout(start, wait);
  const stop = () => { if (anim) { anim.destroy(); anim = null } };
  setTimeout(stop, wait + 4200);
}
