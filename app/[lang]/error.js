'use client';

import { useEffect } from 'react';
import { useLang } from '@/contexts/LangContext';

export default function Error({ error, reset }) {
  const { dict } = useLang();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-[70vh] items-center pt-28">
      <div className="container text-center">
        <h1 className="text-4xl">{dict.errorPage?.title}</h1>
        <p className="mt-3 font-light text-ink-500">{dict.errorPage?.text}</p>
        <button type="button" onClick={reset} className="btn btn-primary mt-8">
          {dict.common?.retry}
        </button>
      </div>
    </section>
  );
}
