'use client';

// Home hero: the original photo slider, with the headline centred.
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { homeUi } from '@/lib/i18n/home-ui';
import { BRAND } from '@/lib/seo';

const SLIDES = [1, 2, 3, 4].map((n) => `/images/image-slider/slide-0${n}.webp`);
const SLIDE_MS = 6500;

export default function HomeHero() {
  const [slide, setSlide] = useState(0);
  const hero = homeUi.ta.hero;
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="stages" aria-label="Home" className="relative flex items-center justify-center overflow-hidden bg-ink-900" style={{ height: '100vh', minHeight: 600 }}>
      {SLIDES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          quality={75}
          priority={i === 0}
          draggable={false}
          className={`sd-slide${slide === i ? ' sd-slide-on' : ''}`}
          style={{ objectFit: 'cover', opacity: slide === i ? 1 : 0, pointerEvents: 'none' }}
        />
      ))}
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(20,8,10,.62), rgba(20,8,10,.35) 70%), linear-gradient(0deg, rgba(20,8,10,.6), transparent 35%)' }} />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pt-28 text-center" style={{ color: 'var(--text-on-dark)' }}>
        <p className="sd-hero-deco sd-hero-eyebrow mb-3.5 text-[12px] font-medium uppercase tracking-[.22em]" style={{ color: 'var(--gold-300)' }}>
          {hero.eyebrow}
        </p>
        <h1 className="sd-hero-title sd-hero-deco m-0 text-[clamp(44px,6vw,88px)] leading-none" style={{ color: 'var(--text-on-dark)', fontWeight: 500 }}>
          {hero.title[0]}
          <i style={{ color: 'var(--flame-200)' }}>{hero.title[1]}</i>
          <span className="mt-4 block font-sans text-[clamp(15px,2vw,19px)] font-medium leading-snug tracking-wide" style={{ color: 'var(--gold-300)' }}>
            {BRAND.ta} · மன்னார் மாவட்டம்
            <span className="block text-[0.85em] font-normal opacity-90">{BRAND.en} — Panthal &amp; decoration, Mannar District</span>
          </span>
        </h1>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn btn-gold" onClick={() => go('categories')}>
            சேவைகளைப் பார்க்க <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <button type="button" className="btn btn-glass" onClick={() => go('reviews')}>
            மதிப்புரைகள்
          </button>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-2" aria-hidden>
        {SLIDES.map((_, i) => (
          <span key={i} className="h-1.5 rounded-full transition-all duration-500" style={{ width: slide === i ? 28 : 8, background: slide === i ? 'var(--gold-300)' : 'rgba(255,248,236,.4)' }} />
        ))}
      </div>
    </section>
  );
}
