'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, ShoppingBag, Languages, ArrowRight } from 'lucide-react';
import { homeUi } from '@/lib/i18n/home-ui';
import { useLang } from '@/contexts/LangContext';
import { useCart } from '@/contexts/CartContext';
import { stripLocale, localePath, tr } from '@/lib/i18n/config';

export default function Header() {
  const { lang, dict, settings, href } = useLang();
  const { count, hydrated } = useCart();
  const router = useRouter();
  const pathname = usePathname() || '/';
  const basePath = stripLocale(pathname);
  const isHome = basePath === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Homepage (design): glass over the stage, solid once past the hero. Other pages: solid after 40px.
    const onScroll = () => setScrolled(window.scrollY > (isHome ? window.innerHeight - 90 : 40));
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHome]);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [open]);

  const glass = !scrolled && !open;
  const links = [
    ['/packages', dict.nav.packages],
    ['/products', dict.nav.products],
    ['/custom-package', dict.nav.builder],
    ['/gallery', dict.nav.gallery],
    ['/about', dict.nav.about],
    ['/contact', dict.nav.contact],
  ];
  const otherLang = lang === 'ta' ? 'en' : 'ta';
  const switchHref = localePath(otherLang, basePath);
  const isActive = (p) => basePath === p || basePath.startsWith(`${p}/`);
  const brand = tr(settings.companyName, lang);
  const hn = homeUi[lang].nav;
  // Homepage navbar links from the design: Stages · 3D Customizer · Packages · Gallery.
  const homeLinks = [['stages', hn.stages], ['tour', hn.customizer], ['packages', hn.packages], ['gallery', hn.gallery]];
  const goSection = (e, id) => {
    e.preventDefault();
    setOpen(false);
    if (id === 'stages') return router.push(href(settings.stagesPath || '/categories'));
    if (id === 'tour') return window.dispatchEvent(new Event('wd:tour'));
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - (id === 'stages' ? 0 : 80), behavior: 'smooth' });
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        {dict.common.skipToContent}
      </a>
      <div className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4 sm:px-6">
        <nav
          aria-label="Main"
          className={`mx-auto flex h-[60px] max-w-[1240px] items-center gap-3 rounded-full pl-5 pr-2 transition-colors duration-300 sm:h-16 sm:pl-7 ${
            glass ? 'glass text-[#FFF8EC] shadow-glass' : 'border bg-ivory-100/95 text-ink-900 shadow-2 backdrop-blur-md'
          }`}
          style={glass ? undefined : { borderColor: 'var(--border-subtle)' }}
        >
          <Link href={href('/')} className={`flex min-w-0 shrink items-center gap-2 ${isHome ? '' : 'xl:shrink-0'}`} aria-label={brand}>
            {settings.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={settings.logo} alt="" className="h-9 w-9 rounded-full object-cover" />
            ) : null}
            <span className={`truncate font-display text-[22px] font-semibold leading-none sm:text-[26px] ${glass ? 'text-flame-200' : 'text-maroon-600'}`}>
              {lang === 'ta' ? <span className="text-[18px] sm:text-[21px]">{brand}</span> : brand}
            </span>
          </Link>

          <span className="flex-1" />

          {isHome && (
            <ul className="hidden shrink-0 items-center gap-1 md:flex [:lang(ta)_&]:hidden [:lang(ta)_&]:lg:flex [:lang(ta)_&]:gap-0">
              {homeLinks.map(([id, label]) => (
                <li key={id}>
                  <a href={id === 'stages' ? href(settings.stagesPath || '/categories') : `#${id}`} onClick={(e) => goSection(e, id)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-[14px] tracking-[.04em] transition-colors [:lang(ta)_&]:px-2.5 [:lang(ta)_&]:text-[13px] [:lang(ta)_&]:tracking-normal ${glass ? 'hover:bg-white/10' : 'hover:bg-champagne-100'}`}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          <ul className={`hidden items-center gap-0.5 ${isHome ? '' : 'xl:flex'}`}>
            {links.map(([p, label], i) => (
              <li key={p} className={i >= 4 ? 'hidden 2xl:block' : undefined}>
                <Link
                  href={href(p)}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-[14px] tracking-wide transition-colors [:lang(ta)_&]:px-2.5 [:lang(ta)_&]:text-[13px] ${
                    isActive(p) ? (glass ? 'bg-white/15' : 'bg-champagne-100 text-maroon-700') : glass ? 'hover:bg-white/10' : 'hover:bg-champagne-100'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={switchHref}
            hrefLang={otherLang}
            lang={otherLang}
            className={`flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-medium ${glass ? 'hover:bg-white/10' : 'hover:bg-champagne-100'}`}
            aria-label={`${dict.nav.language}: ${dict.meta.switchTo}`}
            prefetch={false}
          >
            <Languages className="h-4 w-4" aria-hidden />
            <span>{dict.meta.switchTo}</span>
          </Link>

          <Link
            href={href('/checkout')}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full ${glass ? 'hover:bg-white/10' : 'hover:bg-champagne-100'}`}
            aria-label={`${dict.nav.myOrder} (${hydrated ? count : 0})`}
          >
            <ShoppingBag className="h-5 w-5" aria-hidden />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[11px] font-semibold text-ink-900">{count}</span>
            )}
          </Link>

          {isHome ? (
            <a href="#booking" onClick={(e) => goSection(e, 'booking')} className="btn btn-gold btn-sm hidden !h-[42px] shrink-0 whitespace-nowrap md:inline-flex">
              {hn.book} <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <Link href={href('/track-order')} className="btn btn-gold btn-sm hidden !h-10 whitespace-nowrap md:inline-flex">
              {dict.nav.track}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`flex h-10 w-10 items-center justify-center rounded-full 2xl:hidden ${glass ? 'hover:bg-white/10' : 'hover:bg-champagne-100'}`}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? dict.nav.close : dict.nav.menu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {open && (
          <div id="mobile-menu" className="mx-auto mt-2 max-h-[calc(100dvh-90px)] max-w-[1240px] overflow-y-auto rounded-xl border bg-ivory-50 p-3 shadow-3 2xl:hidden" style={{ borderColor: 'var(--border-subtle)' }}>
            <ul className="flex flex-col">
              {[['/', dict.nav.home], ...links, ['/categories', dict.nav.categories], ['/track-order', dict.nav.track]].map(([p, label]) => (
                <li key={p}>
                  <Link href={href(p)} className={`block rounded-md px-4 py-3 text-[16px] ${isActive(p) && p !== '/' ? 'bg-champagne-100 text-maroon-700' : 'text-ink-900 hover:bg-champagne-100'}`}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {!isHome && <div aria-hidden className="h-0" />}
    </>
  );
}
