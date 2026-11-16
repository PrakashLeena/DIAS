'use client';

import { useState } from 'react';
import SmartImage from '@/components/ui/SmartImage';

export default function ProductGallery({ images = [], alt }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [''];
  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-champagne-100 shadow-2">
        <SmartImage src={list[active]} alt={alt} sizes="(max-width: 1024px) 100vw, 50vw" preload={active === 0} quality={75} />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto scrollbar-none">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-20 w-24 shrink-0 overflow-hidden rounded-md ring-2 transition ${i === active ? 'ring-gold-500' : 'ring-transparent opacity-75 hover:opacity-100'}`}
              aria-label={`${alt} ${i + 1}`}
              aria-pressed={i === active}
            >
              <SmartImage src={src} alt="" sizes="96px" quality={60} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
