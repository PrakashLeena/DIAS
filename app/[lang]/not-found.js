'use client';

import Link from 'next/link';
import { useLang } from '@/contexts/LangContext';

export default function NotFound() {
  const { dict, href } = useLang();
  return (
    <section className="flex min-h-[70vh] items-center bg-ivory-50 pt-28">
      <div className="container text-center">
        <p className="font-display text-[96px] leading-none text-gold-500">404</p>
        <h1 className="mt-4 text-4xl">{dict.notFound?.title || 'Page not found'}</h1>
        <p className="mx-auto mt-3 max-w-md font-light text-ink-500">{dict.notFound?.text}</p>
        <Link href={href('/')} className="btn btn-primary mt-8">
          {dict.notFound?.home || 'Home'}
        </Link>
      </div>
    </section>
  );
}
