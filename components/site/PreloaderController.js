'use client';

import { useEffect } from 'react';

const ANIM_MS = 4000; // length of the pandal build-up animation
const MAX_MS = 8000; // never keep visitors waiting longer than this, even on a slow connection
const SKIP_AFTER_MS = 1200;
const STEPS = [
  [24, 'பந்தல் தூண்கள் எழுகின்றன…'],
  [50, 'மெரூன் & தங்க விதானம் விரிகிறது…'],
  [78, 'மாவிலைத் தோரணம் கட்டப்படுகிறது…'],
  [96, 'விளக்குகள் ஏற்றப்படுகின்றன…'],
  [101, 'உங்கள் விழா தயார்!'],
];
const message = (p) => STEPS.find(([max]) => p < max)[1];

export default function PreloaderController() {
  useEffect(() => {
    const html = document.documentElement;
    const root = document.getElementById('watson-preloader');
    if (!root || html.classList.contains('wp-skip')) {
      html.classList.remove('wp-lock');
      root?.classList.add('is-gone');
      return;
    }
    if (root.classList.contains('is-revealing')) return; // already opened (dev strict-mode re-run)

    const bar = document.getElementById('preloader-progress-bar');
    const pct = document.getElementById('preloader-percent');
    const txt = document.getElementById('preloader-status-text');
    const skip = document.getElementById('preloader-skip');

    let loaded = document.readyState === 'complete';
    let done = false;
    let raf = 0;
    let shown = -1;
    const timers = [];
    const onLoad = () => (loaded = true);

    const set = (p) => {
      if (p === shown) return;
      shown = p;
      if (bar) bar.style.transform = `scaleX(${p / 100})`;
      if (pct) pct.textContent = `${p}%`;
      if (txt) txt.textContent = message(p);
    };

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(raf);
      set(100);
      root.classList.add('is-revealing');
      html.classList.remove('wp-lock');
      try {
        sessionStorage.setItem('wp-seen', '1');
      } catch {}
      timers.push(
        setTimeout(() => {
          root.classList.add('is-hidden');
          timers.push(setTimeout(() => root.classList.add('is-gone'), 950));
        }, 1050),
      );
    };

    // performance.now() counts from the start of the page load, which is when the CSS
    // animation started too, so the bar stays in step with the drawing.
    const tick = () => {
      const now = performance.now();
      const ratio = Math.min(now / (ANIM_MS - 200), 1);
      let p = Math.round((1 - Math.pow(1 - ratio, 2.1)) * 100);
      if (!loaded) p = Math.min(p, 94);
      set(p);
      if (now > SKIP_AFTER_MS) skip?.classList.add('is-on');
      if ((now >= ANIM_MS && loaded) || now >= MAX_MS) return finish();
      raf = requestAnimationFrame(tick);
    };

    const onKey = (e) => e.key === 'Escape' && finish();
    window.addEventListener('load', onLoad);
    document.addEventListener('keydown', onKey);
    skip?.addEventListener('click', finish);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('load', onLoad);
      document.removeEventListener('keydown', onKey);
      skip?.removeEventListener('click', finish);
    };
  }, []);

  return null;
}
