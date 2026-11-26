'use client';

// Original floating pill navigation (glass over the hero, solid ivory after scrolling),
// with the company name centred and the 11 category links in a second pill underneath
// that drifts sideways slowly and can also be scrolled by hand.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ClipboardList, Phone } from 'lucide-react';
import { useSite } from './SiteProvider';
import { NAV_ICONS } from './icons';
import { telHref } from '@/lib/contact';

const DECO = { fontFamily: 'var(--font-tamil-deco), var(--font-tamil-serif), serif', fontWeight: 400 };
const SPEED = 26; // px per second

export default function Header() {
  const { categories, site, contact, lines, setSheetOpen } = useSite();
  const pathname = usePathname() || '/';
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [loop, setLoop] = useState(false);
  const rail = useRef(null);

  useEffect(() => {
    // Home: glass over the hero, solid once past it. Other pages: solid after 40px.
    const onScroll = () => setScrolled(window.scrollY > (isHome ? window.innerHeight - 140 : 40));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHome]);

  // Only repeat the list (for a seamless loop) when it is wider than the bar.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const measure = () => {
      const copies = loop ? 2 : 1;
      setLoop(el.scrollWidth / copies > el.clientWidth + 4);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [categories, loop]);

  // Slow automatic sideways drift; pauses while the visitor hovers / touches / scrolls it.
  useEffect(() => {
    const el = rail.current;
    if (!el || !loop || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last = performance.now();
    let pos = el.scrollLeft;
    let hold = 0;
    const pause = (ms = 2500) => (hold = performance.now() + ms);
    const events = ['pointerenter', 'pointerdown', 'wheel', 'touchstart', 'focusin'];
    events.forEach((e) => el.addEventListener(e, () => pause(e === 'pointerenter' || e === 'focusin' ? 60000 : 2500), { passive: true }));
    const resume = () => pause(1200);
    el.addEventListener('pointerleave', resume);
    el.addEventListener('focusout', resume);

    const tick = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const period = el.scrollWidth / 2;
      if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft; // the visitor moved it
      if (now > hold) pos += SPEED * dt;
      if (pos >= period) pos -= period;
      if (pos < 0) pos += period;
      if (Math.abs(el.scrollLeft - pos) > 0.4) el.scrollLeft = pos;
    };
    const timer = setInterval(() => tick(performance.now()), 33);
    return () => clearInterval(timer);
  }, [loop]);

  const glass = !scrolled;
  const pill = glass ? 'glass text-[#FFF8EC] shadow-glass' : 'border bg-ivory-100/95 text-ink-900 shadow-2 backdrop-blur-md';
  const hover = glass ? 'hover:bg-white/10' : 'hover:bg-champagne-100';
  const pillBorder = glass ? undefined : { borderColor: 'var(--border-subtle)' };

  const renderLink = (c, copy) => {
    const active = pathname === `/category/${c.id}`;
    const Icon = NAV_ICONS[c.id];
    return (
      <li key={`${copy}-${c.id}`} className="shrink-0 pr-0.5" aria-hidden={copy ? 'true' : undefined}>
        <Link
          href={`/category/${c.id}`}
          tabIndex={copy ? -1 : undefined}
          aria-current={active ? 'page' : undefined}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[16.5px] tracking-wide transition-colors sm:py-1.5 sm:text-[14px] [:lang(ta)_&]:px-3 [:lang(ta)_&]:text-[16px] [:lang(ta)_&]:tracking-normal sm:[:lang(ta)_&]:px-2.5 sm:[:lang(ta)_&]:text-[13px] ${
            active ? (glass ? 'bg-white/15' : 'bg-champagne-100 text-maroon-700') : hover
          }`}
        >
          {Icon && <Icon className="h-[18px] w-[18px] shrink-0 opacity-80 sm:h-4 sm:w-4" aria-hidden />}
          {c.name.ta}
        </Link>
      </li>
    );
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
        <div className={`relative mx-auto flex h-[66px] max-w-[1240px] items-center justify-between gap-1 sm:gap-2 rounded-full px-2 transition-colors duration-300 sm:h-[76px] sm:px-3 ${pill}`} style={pillBorder}>
          {/* [logo] [company name, centred] [call] [list] */}
          <Link href="/" className="shrink-0" aria-label={`${site.name.ta} — home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={`${site.name.ta} logo`} width={640} height={311} className="h-[40px] w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,.35)] sm:h-[60px]" />
          </Link>
          <Link href="/" className="min-w-0 flex-1 px-1 text-center sm:pointer-events-none sm:absolute sm:left-1/2 sm:top-1/2 sm:flex-none sm:-translate-x-1/2 sm:-translate-y-1/2 sm:px-0" tabIndex={-1} aria-hidden="true">
            <span className={`block truncate text-[16px] leading-tight min-[400px]:text-[18px] sm:overflow-visible sm:whitespace-nowrap sm:text-[27px] ${glass ? 'text-flame-200' : 'text-maroon-600'}`} style={DECO}>
              {site.name.ta}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <a href={telHref(contact.phones[0])} className="btn btn-gold btn-sm !h-[42px] shrink-0 whitespace-nowrap !px-3 sm:!px-4" aria-label="Call owner">
              <Phone className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">அழைக்க / Call</span>
            </a>
            <button type="button" onClick={() => setSheetOpen(true)} className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${hover}`} aria-label={`Open selection list (${lines.length})`}>
              <ClipboardList className="h-5 w-5" aria-hidden />
              {lines.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-semibold text-ink-900">{lines.length}</span>
              )}
            </button>
          </div>
        </div>

        <nav aria-label="Categories" className={`mx-auto mt-2 max-w-[1240px] rounded-full px-2 transition-colors duration-300 ${pill}`} style={pillBorder}>
          <ul ref={rail} className="flex overflow-x-auto py-1.5 scrollbar-none [-webkit-mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
            {categories.map((c) => renderLink(c, ''))}
            {loop && categories.map((c) => renderLink(c, 'dup'))}
          </ul>
        </nav>
      </div>
      {!isHome && <div aria-hidden className="h-[146px] sm:h-[152px]" />}
    </>
  );
}
