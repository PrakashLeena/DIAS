'use client';

import Link from 'next/link';
import { useSite } from './SiteProvider';
import { Bi, Photo } from './ui';
import HowToOrder from './HowToOrder';
import { NAV_ICONS } from './icons';

/** Home-page grid of the main categories: big thumbnail + emoji badge + Tamil / English name. */
export default function CategoryGrid() {
  const { categories } = useSite();
  return (
    <section id="categories" className="mx-auto max-w-[1200px] px-4 py-10" aria-labelledby="cat-title">
      <h2 id="cat-title" className="mb-1 text-center text-[clamp(24px,4vw,36px)]">
        எங்கள் சேவைகள் <span className="text-[0.55em] font-normal text-ink-500">/ Our Services</span>
      </h2>
      <p className="mb-7 text-center text-ink-500">தேவையான பிரிவைத் தேர்வு செய்யுங்கள் · Choose a category to browse and select items</p>
      <HowToOrder className="mx-auto mb-8 max-w-3xl" />
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {categories.map((c, i) => (
          <Link key={c.id} href={`/category/${c.id}`} className="card group flex flex-col transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-3">
            <span className="relative block aspect-[4/3] overflow-hidden">
              <Photo src={c.image} Icon={NAV_ICONS[c.id]} emoji={c.emoji} alt={c.name.en || c.name.ta} priority={i < 4} className="transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" aria-hidden />
            </span>
            <span className="flex flex-1 flex-col justify-center px-3.5 py-3">
              <Bi n={c.name} className="text-[16px] font-semibold leading-snug text-ink-900" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
