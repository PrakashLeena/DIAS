// Cloud-curtain + pandal-decorator preloader (server component).
// The overlay HTML is part of the server response, so it is on screen from the very first
// paint, before any JavaScript loads. PreloaderController (client) drives the progress bar
// and opens the clouds once the page has loaded.
//
// Shown once per browser tab session; skipped for repeat page loads and for visitors who
// prefer reduced motion. A visitor can tap "Skip" after ~1 second.
import { PRELOADER_HTML } from './preloader-markup';
import PreloaderController from './PreloaderController';

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Runs during HTML parsing, before the overlay is drawn: decides skip / lock scroll.
// Also unlocks scrolling after 9 s no matter what, in case the page's JS fails.
const BOOT = `(function(){var d=document.documentElement;try{var s=sessionStorage.getItem('wp-seen')==='1'||window.matchMedia('(prefers-reduced-motion: reduce)').matches;d.classList.add(s?'wp-skip':'wp-lock');}catch(e){d.classList.add('wp-lock');}setTimeout(function(){d.classList.remove('wp-lock');},9000);})();`;

export default function Preloader({ name }) {
  const html = PRELOADER_HTML.replace('__NAME_TA__', esc(name?.ta || 'வட்ஷன் பந்தல் சேவை')).replace('__NAME_EN__', esc(name?.en || 'Watson Panthal Sevai'));
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      <noscript>
        <style>{'#watson-preloader{display:none!important}'}</style>
      </noscript>
      <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: html }} />
      <PreloaderController />
    </>
  );
}
