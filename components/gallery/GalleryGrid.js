'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { tr } from '@/lib/i18n/config';

export default function GalleryGrid({ items }) {
  const { lang, dict } = useLang();
  const [open, setOpen] = useState(-1);
  const close = useCallback(() => setOpen(-1), []);
  const step = useCallback((d) => setOpen((i) => (i + d + items.length) % items.length), [items.length]);

  useEffect(() => {
    if (open < 0) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, step]);

  return (
    <>
      <ul className="columns-2 gap-3 sm:gap-4 md:columns-3 lg:columns-4">
        {items.map((g, i) => (
          <li key={g._id || g.url} className="mb-3 break-inside-avoid sm:mb-4">
            <button type="button" onClick={() => setOpen(i)} className="group relative block w-full overflow-hidden rounded-lg bg-champagne-100" aria-label={tr(g.caption, lang) || dict.galleryPage.title}>
              <Image src={g.url} alt={tr(g.caption, lang) || ''} width={600} height={i % 3 === 0 ? 750 : 600} sizes="(max-width: 768px) 50vw, 25vw" quality={60} className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>

      {open >= 0 && items[open] && (
        <div role="dialog" aria-modal="true" aria-label={tr(items[open].caption, lang)} className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-900/95 p-4" onClick={close}>
          <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full p-2 text-white hover:bg-white/10" aria-label={dict.nav.close}>
            <X className="h-7 w-7" />
          </button>
          <button type="button" onClick={(e) => (e.stopPropagation(), step(-1))} className="absolute left-2 rounded-full p-2 text-white hover:bg-white/10 sm:left-6" aria-label={dict.common.prev}>
            <ChevronLeft className="h-8 w-8" />
          </button>
          <figure className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image src={items[open].url} alt={tr(items[open].caption, lang) || ''} fill sizes="100vw" quality={85} className="object-contain" />
            {tr(items[open].caption, lang) && <figcaption className="absolute inset-x-0 -bottom-8 text-center text-sm text-white/80">{tr(items[open].caption, lang)}</figcaption>}
          </figure>
          <button type="button" onClick={(e) => (e.stopPropagation(), step(1))} className="absolute right-2 rounded-full p-2 text-white hover:bg-white/10 sm:right-6" aria-label={dict.common.next}>
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </>
  );
}
