'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Copy, Check, MessageCircle, Search } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import { whatsappLink } from '@/utils/format';
import { ORDER_ID_REGEX } from '@/lib/constants';
import StatusBadge from '@/components/ui/StatusBadge';

export default function OrderConfirmation() {
  const { dict, href, settings } = useLang();
  const params = useSearchParams();
  const raw = (params.get('id') || '').toUpperCase();
  const orderId = ORDER_ID_REGEX.test(raw) ? raw : '';
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const t = dict.confirmation;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
    } catch {
      const el = document.createElement('textarea');
      el.value = orderId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!orderId) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-10 text-center shadow-1">
        <p className="text-ink-700">{t.notFound}</p>
        <Link href={href('/track-order')} className="btn btn-primary mt-6">
          {t.track}
        </Link>
      </div>
    );
  }

  const wa = whatsappLink(settings.whatsapp || settings.phone, `${t.whatsappText} ${orderId}`, settings.phoneCountryCode);

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-xl bg-white text-center shadow-3">
      <div className="bg-ink-900 px-6 py-10 text-[#FFF8EC] sm:px-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-[#7fd08f]">
          <CheckCircle2 className="h-9 w-9" strokeWidth={1.6} />
        </span>
        <h1 className="mt-5 text-[clamp(28px,4vw,42px)] !text-[#FFF8EC] [:lang(ta)_&]:text-[clamp(22px,3vw,30px)]">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-md font-light text-[color:var(--text-on-dark-muted)]">{t.subtitle}</p>
      </div>
      <div className="px-6 py-8 sm:px-10">
        <p className="eyebrow">{t.orderId}</p>
        <div className="mx-auto mt-3 flex max-w-md flex-col items-stretch gap-3 sm:flex-row">
          <output className="flex-1 select-all rounded-lg border-2 border-dashed border-gold-500 bg-champagne-100 px-4 py-4 font-mono text-[22px] font-semibold tracking-wider text-maroon-700 sm:text-[26px]" aria-live="polite">
            {orderId}
          </output>
          <button type="button" onClick={copy} className="btn btn-secondary sm:!h-auto">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copied ? dict.common.copied : dict.common.copy}
          </button>
        </div>
        <p className="mt-3 text-[13.5px] text-ink-500">{t.keepSafe}</p>
        <div className="mt-6 flex justify-center">
          <StatusBadge status="pending" label={dict.status.pending} size="lg" />
        </div>
        <p className="mt-3 text-[14px] text-ink-500">{t.status}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={href(`/track-order?id=${orderId}`)} className="btn btn-primary">
            <Search className="h-4 w-4" /> {t.track}
          </Link>
          {mounted && wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5a]">
              <MessageCircle className="h-4 w-4" /> {t.whatsapp}
            </a>
          )}
          <Link href={href('/')} className="btn btn-secondary">
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
