'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Loader2, MessageSquareText, ShieldCheck, Check, X, CircleDot } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';
import useMoney from '@/hooks/useMoney';
import { tr } from '@/lib/i18n/config';
import { formatDate } from '@/utils/format';
import { ORDER_ID_REGEX } from '@/lib/constants';
import StatusBadge from '@/components/ui/StatusBadge';

function Timeline({ order, dict, lang }) {
  const t = dict.track.timeline;
  const at = (s) => order.history.find((h) => h.status === s)?.at;
  const cancelled = order.status === 'cancelled';
  const order_ = ['pending', 'accepted', 'completed'];
  const reached = cancelled ? 1 : order_.indexOf(order.status) + 1; // number of steps after "placed"
  const steps = [
    { key: 'placed', label: t.placed, date: order.createdAt, done: true },
    { key: 'pending', label: t.pending, date: at('pending') || order.createdAt, done: reached >= 1 },
    ...(cancelled
      ? [{ key: 'cancelled', label: t.cancelled, date: at('cancelled'), done: true, cancelled: true }]
      : [
          { key: 'accepted', label: t.accepted, date: at('accepted'), done: reached >= 2 },
          { key: 'completed', label: t.completed, date: at('completed'), done: reached >= 3 },
        ]),
  ];
  const currentIdx = cancelled ? steps.length - 1 : reached;

  return (
    <ol className="relative grid gap-6 sm:grid-cols-4 sm:gap-2" aria-label={dict.track.status}>
      {steps.map((s, i) => {
        const current = i === currentIdx;
        return (
          <li key={s.key} className="relative flex gap-4 sm:flex-col sm:items-center sm:text-center">
            {i < steps.length - 1 && (
              <span aria-hidden className={`absolute left-[19px] top-10 h-[calc(100%-8px)] w-0.5 sm:left-[calc(50%+24px)] sm:top-[19px] sm:h-0.5 sm:w-[calc(100%-48px)] ${steps[i + 1].done ? (steps[i + 1].cancelled ? 'bg-danger/50' : 'bg-gold-500') : 'bg-champagne-200'}`} />
            )}
            <span
              className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                s.cancelled ? 'border-danger bg-danger text-white' : s.done ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-champagne-200 bg-white text-ink-300'
              } ${current && !s.cancelled ? 'ring-4 ring-gold-500/30' : ''}`}
            >
              {s.cancelled ? <X className="h-5 w-5" /> : s.done ? <Check className="h-5 w-5" /> : <CircleDot className="h-4 w-4" />}
            </span>
            <div>
              <p className={`text-[15px] font-medium ${s.cancelled ? 'text-danger' : s.done ? 'text-ink-900' : 'text-ink-300'}`}>{s.label}</p>
              {s.date && s.done && <p className="text-[12.5px] text-ink-500">{formatDate(s.date, lang)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default function TrackOrder() {
  const { lang, dict } = useLang();
  const money = useMoney();
  const params = useSearchParams();
  const t = dict.track;
  const [value, setValue] = useState((params.get('id') || '').toUpperCase());
  const [state, setState] = useState({ loading: false, error: '', order: null });

  const lookup = useCallback(
    async (id) => {
      const orderId = id.trim().toUpperCase();
      if (!ORDER_ID_REGEX.test(orderId)) return setState({ loading: false, error: t.invalid, order: null });
      setState({ loading: true, error: '', order: null });
      try {
        const res = await fetch('/api/orders/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
        const data = await res.json().catch(() => ({}));
        if (res.ok) return setState({ loading: false, error: '', order: data });
        const msg = res.status === 429 ? t.rateLimited : res.status === 404 ? t.notFound : res.status === 400 ? t.invalid : dict.checkout.errors.generic;
        setState({ loading: false, error: msg, order: null });
      } catch {
        setState({ loading: false, error: dict.checkout.errors.generic, order: null });
      }
    },
    [t, dict]
  );

  useEffect(() => {
    const id = params.get('id');
    if (id) lookup(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order = state.order;

  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          lookup(value);
        }}
        className="rounded-xl border bg-white p-5 shadow-2 sm:p-7"
        style={{ borderColor: 'var(--border-subtle)' }}
        role="search"
      >
        <label htmlFor="orderId" className="field-label">
          {t.label}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="orderId"
            value={value}
            onChange={(e) => setValue(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 20))}
            placeholder={t.placeholder}
            autoComplete="off"
            spellCheck={false}
            className="field flex-1 font-mono text-[17px] tracking-wider"
            aria-invalid={state.error ? 'true' : 'false'}
            aria-describedby="track-msg"
          />
          <button type="submit" className="btn btn-primary" disabled={state.loading}>
            {state.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {state.loading ? t.tracking : t.button}
          </button>
        </div>
        <p id="track-msg" className={state.error ? 'field-error' : 'field-hint'} role={state.error ? 'alert' : undefined}>
          {state.error || t.privacyNote}
        </p>
      </form>

      {order && (
        <article className="mt-8 overflow-hidden rounded-xl bg-white shadow-3" aria-live="polite">
          <header className="flex flex-col gap-4 bg-ink-900 px-6 py-6 text-[#FFF8EC] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-[12px] uppercase tracking-[.2em] text-gold-300">{t.label}</p>
              <p className="mt-1 font-mono text-[22px] font-semibold tracking-wider">{order.orderId}</p>
            </div>
            <span className="self-start rounded-full bg-white p-0.5 sm:self-auto">
              <StatusBadge status={order.status} label={dict.status[order.status]} size="lg" />
            </span>
          </header>
          <div className="px-6 py-7 sm:px-8">
            <Timeline order={order} dict={dict} lang={lang} />

            {order.status === 'cancelled' && <p className="mt-6 rounded-md bg-danger/10 p-4 text-[14px] text-danger">{t.cancelledNote}</p>}

            {order.adminMessage && (
              <div className="mt-6 rounded-lg border-l-4 border-gold-500 bg-champagne-100 p-4">
                <p className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider text-gold-700 [:lang(ta)_&]:normal-case">
                  <MessageSquareText className="h-4 w-4" /> {t.messageFromUs}
                </p>
                <p className="mt-1.5 whitespace-pre-line text-[15px] text-ink-900">{order.adminMessage}</p>
              </div>
            )}

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                [t.customerName, order.customerName],
                [t.eventDate, formatDate(order.eventDate, lang)],
                [t.rentalPeriod, `${formatDate(order.rentalStartDate, lang)} – ${formatDate(order.rentalEndDate, lang)}`],
                [t.bookingDate, formatDate(order.createdAt, lang)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-ivory-50 px-4 py-3">
                  <dt className="text-[12.5px] text-ink-500">{k}</dt>
                  <dd className="font-medium text-ink-900">{v}</dd>
                </div>
              ))}
            </dl>

            <h2 className="mt-8 text-2xl">{t.summary}</h2>
            <ul className="mt-3 divide-y rounded-lg border" style={{ borderColor: 'var(--border-subtle)' }}>
              {order.items.map((i, k) => (
                <li key={k} className="flex justify-between gap-4 px-4 py-3 text-[15px]">
                  <span>
                    {i.itemType === 'package' && <span className="badge mr-2 bg-gold-500/15 !px-2 !py-0 text-[10.5px] text-gold-700">{dict.cart.package}</span>}
                    {tr(i.name, lang)} <span className="text-ink-500">× {i.quantity}</span>
                  </span>
                  <span className="whitespace-nowrap font-medium">{money(i.lineTotal)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 bg-ivory-50 px-4 py-3">
                <span className="font-medium">{dict.common.estimatedTotal}</span>
                <span className="font-display text-2xl font-semibold text-maroon-600">{money(order.totalAmount)}</span>
              </li>
            </ul>
            <p className="mt-4 flex items-center gap-2 text-[12.5px] text-ink-500">
              <ShieldCheck className="h-4 w-4" /> {t.privacyNote}
            </p>
          </div>
        </article>
      )}
    </div>
  );
}
