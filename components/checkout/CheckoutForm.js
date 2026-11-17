'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, ArrowRight, Info, Loader2, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LangContext';
import useMoney from '@/hooks/useMoney';
import { tr } from '@/lib/i18n/config';
import { customerSchema, eventSchema, EVENT_TYPES } from '@/lib/validators';
import SmartImage from '@/components/ui/SmartImage';
import { QuantityStepper } from '@/components/cart/AddToOrder';

const formSchema = z.object({ customer: customerSchema, event: eventSchema, website: z.string().optional() });

function todayStr() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function Field({ id, label, error, hint, required, optionalLabel, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label} {required ? <span className="text-danger" aria-hidden>*</span> : optionalLabel ? <span className="font-normal text-ink-300">({optionalLabel})</span> : null}
      </label>
      {children}
      {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CheckoutForm() {
  const { lang, dict, href } = useLang();
  const money = useMoney();
  const router = useRouter();
  const cart = useCart();
  const t = dict.checkout;
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [issues, setIssues] = useState([]);
  const submittedRef = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
    defaultValues: {
      customer: { fullName: '', phone: '', email: '', address: '', city: '', locationReference: '' },
      event: { eventType: '', eventDate: '', rentalStartDate: '', rentalEndDate: '', venue: '', instructions: '' },
      website: '',
    },
  });

  // Prefill from the homepage estimator ("Get an exact quote").
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('wd_estimate');
      if (!raw) return;
      const est = JSON.parse(raw);
      if (EVENT_TYPES.includes(est.eventType)) setValue('event.eventType', est.eventType);
      if (typeof est.note === 'string') setValue('event.instructions', est.note.slice(0, 500));
      sessionStorage.removeItem('wd_estimate');
    } catch {}
  }, [setValue]);

  const [start, end, address] = useWatch({ control, name: ['event.rentalStartDate', 'event.rentalEndDate', 'customer.address'] });
  const items = useMemo(() => cart.items.map((i) => ({ type: i.type, id: i.id, quantity: i.quantity })), [cart.items]);
  const itemsKey = JSON.stringify(items);

  // Live server quote: authoritative prices + availability for the chosen dates.
  useEffect(() => {
    if (!cart.hydrated || !items.length) {
      setQuote(null);
      return;
    }
    const validDates = /^\d{4}-\d{2}-\d{2}$/.test(start || '') && /^\d{4}-\d{2}-\d{2}$/.test(end || '') && end >= start;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setQuoting(true);
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, rentalStartDate: validDates ? start : undefined, rentalEndDate: validDates ? end : undefined, source: cart.source }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (res.ok) setQuote(data);
        else if (data?.details?.unavailable) setQuote({ unavailable: data.details.unavailable });
      } catch {
        /* ignore aborted requests */
      } finally {
        setQuoting(false);
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey, start, end, cart.hydrated, cart.source]);

  const errMsg = (e) => (e?.message ? t.errors[e.message] || e.message : undefined);
  const aria = (e, id) => ({ 'aria-invalid': e ? 'true' : 'false', 'aria-describedby': e ? `${id}-error` : `${id}-hint` });

  const onSubmit = async (values) => {
    if (submittedRef.current) return;
    setSubmitError(null);
    setIssues([]);
    if (!items.length) return setSubmitError(t.errors.emptyCart);
    submittedRef.current = true;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, items, source: cart.source, language: lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.orderId) {
        try {
          sessionStorage.setItem('wd_last_order', JSON.stringify({ orderId: data.orderId, totalAmount: data.totalAmount, eventDate: values.event.eventDate }));
        } catch {}
        cart.clear();
        router.push(href(`/order-confirmation?id=${encodeURIComponent(data.orderId)}`));
        return;
      }
      submittedRef.current = false;
      if (res.status === 429) setSubmitError(t.errors.rateLimited);
      else if (data?.error === 'insufficientStock') {
        setIssues(data.details?.issues || []);
        setSubmitError(t.errors.unavailable);
      } else if (data?.error === 'itemUnavailable') setSubmitError(t.errors.itemUnavailable);
      else if (data?.error === 'emptyCart') setSubmitError(t.errors.emptyCart);
      else setSubmitError(t.errors.generic);
    } catch {
      submittedRef.current = false;
      setSubmitError(t.errors.generic);
    }
  };

  if (cart.hydrated && !cart.items.length) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border bg-white p-10 text-center shadow-1">
        <ShoppingBag className="mx-auto h-12 w-12 text-champagne-600" strokeWidth={1.3} />
        <p className="mt-4 text-lg text-ink-700">{dict.cart.empty}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href={href('/packages')} className="btn btn-primary">
            {dict.common.explorePackages}
          </Link>
          <Link href={href('/products')} className="btn btn-secondary">
            {dict.common.exploreProducts}
          </Link>
        </div>
      </div>
    );
  }

  const lines = quote?.lines;
  const fallbackTotal = cart.items.reduce((s, i) => s + (i.snapshot?.price || 0) * i.quantity, 0);
  const lineFor = (i) => lines?.find((l) => l.itemType === i.type && l.refId === i.id);
  const unavailableIds = new Set((quote?.unavailable || []).map((u) => u.id));
  const stockIssues = issues.length ? issues : quote?.availability?.issues || [];
  const today = todayStr();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
      <div className="flex min-w-0 flex-col gap-8">
        {/* Customer */}
        <fieldset className="rounded-xl border bg-white p-5 shadow-1 sm:p-7" style={{ borderColor: 'var(--border-subtle)' }}>
          <legend className="sr-only">{t.customer}</legend>
          <h2 className="mb-5 text-[28px] [:lang(ta)_&]:text-[21px]" aria-hidden>
            1. {t.customer}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="fullName" label={t.fields.fullName} required error={errMsg(errors.customer?.fullName)}>
              <input id="fullName" autoComplete="name" className="field" {...register('customer.fullName')} {...aria(errors.customer?.fullName, 'fullName')} />
            </Field>
            <Field id="phone" label={t.fields.phone} required error={errMsg(errors.customer?.phone)}>
              <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className="field" {...register('customer.phone')} {...aria(errors.customer?.phone, 'phone')} />
            </Field>
            <Field id="email" label={t.fields.email} optionalLabel={dict.common.optional} error={errMsg(errors.customer?.email)} className="sm:col-span-2">
              <input id="email" type="email" autoComplete="email" className="field" {...register('customer.email')} {...aria(errors.customer?.email, 'email')} />
            </Field>
            <Field id="address" label={t.fields.address} required error={errMsg(errors.customer?.address)} className="sm:col-span-2">
              <textarea id="address" rows={2} autoComplete="street-address" className="field" {...register('customer.address')} {...aria(errors.customer?.address, 'address')} />
            </Field>
            <Field id="city" label={t.fields.city} required error={errMsg(errors.customer?.city)}>
              <input id="city" autoComplete="address-level2" className="field" {...register('customer.city')} {...aria(errors.customer?.city, 'city')} />
            </Field>
            <Field id="locationReference" label={t.fields.locationReference} required hint={t.fields.locationHint} error={errMsg(errors.customer?.locationReference)}>
              <input id="locationReference" className="field" placeholder={t.fields.locationHint} {...register('customer.locationReference')} {...aria(errors.customer?.locationReference, 'locationReference')} />
            </Field>
          </div>
        </fieldset>

        {/* Event */}
        <fieldset className="rounded-xl border bg-white p-5 shadow-1 sm:p-7" style={{ borderColor: 'var(--border-subtle)' }}>
          <legend className="sr-only">{t.event}</legend>
          <h2 className="mb-5 text-[28px] [:lang(ta)_&]:text-[21px]" aria-hidden>
            2. {t.event}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="eventType" label={t.fields.eventType} required error={errMsg(errors.event?.eventType)}>
              <select id="eventType" className="field" {...register('event.eventType')} {...aria(errors.event?.eventType, 'eventType')}>
                <option value="">{t.selectPlaceholder}</option>
                {EVENT_TYPES.map((k) => (
                  <option key={k} value={k}>
                    {t.eventTypes[k]}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="eventDate" label={t.fields.eventDate} required error={errMsg(errors.event?.eventDate)}>
              <input id="eventDate" type="date" min={today} className="field" {...register('event.eventDate')} {...aria(errors.event?.eventDate, 'eventDate')} />
            </Field>
            <Field id="rentalStartDate" label={t.fields.rentalStart} required error={errMsg(errors.event?.rentalStartDate)}>
              <input id="rentalStartDate" type="date" min={today} className="field" {...register('event.rentalStartDate')} {...aria(errors.event?.rentalStartDate, 'rentalStartDate')} />
            </Field>
            <Field id="rentalEndDate" label={t.fields.rentalEnd} required error={errMsg(errors.event?.rentalEndDate)}>
              <input id="rentalEndDate" type="date" min={start || today} className="field" {...register('event.rentalEndDate')} {...aria(errors.event?.rentalEndDate, 'rentalEndDate')} />
            </Field>
            <Field id="venue" label={t.fields.venue} required hint={t.fields.venueHint} error={errMsg(errors.event?.venue)} className="sm:col-span-2">
              <textarea id="venue" rows={2} className="field" {...register('event.venue')} {...aria(errors.event?.venue, 'venue')} />
              <button type="button" className="mt-1.5 text-[13px] text-maroon-600 hover:underline disabled:opacity-40" disabled={!address} onClick={() => setValue('event.venue', address, { shouldValidate: true })}>
                {t.fields.sameAsAddress}
              </button>
            </Field>
            <Field id="instructions" label={t.fields.instructions} optionalLabel={dict.common.optional} hint={t.fields.instructionsHint} error={errMsg(errors.event?.instructions)} className="sm:col-span-2">
              <textarea id="instructions" rows={3} className="field" placeholder={t.fields.instructionsHint} {...register('event.instructions')} />
            </Field>
          </div>
          {/* Honeypot for bots — hidden from people and assistive tech */}
          <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
          </div>
        </fieldset>
      </div>

      {/* Summary */}
      <aside className="min-w-0 overflow-hidden rounded-xl bg-white shadow-2 ring-1 ring-[color:var(--border-subtle)] lg:sticky lg:top-24" aria-labelledby="order-summary">
        <div className="bg-ink-900 px-6 py-5 text-[#FFF8EC]">
          <h2 id="order-summary" className="text-[26px] !text-[#FFF8EC] [:lang(ta)_&]:text-[20px]">
            3. {t.summary}
          </h2>
          {quote?.rentalDays && start && end && (
            <p className="mt-1 text-[13px] text-[color:var(--text-on-dark-muted)]">
              {t.rentalDays}: {quote.rentalDays}
            </p>
          )}
        </div>
        <ul className="max-h-[46vh] divide-y overflow-y-auto px-5" style={{ borderColor: 'var(--border-subtle)' }}>
          {cart.items.map((i) => {
            const line = lineFor(i);
            const name = tr(line?.name || i.snapshot?.name, lang);
            return (
              <li key={`${i.type}-${i.id}`} className={`flex gap-3 py-4 ${unavailableIds.has(i.id) ? 'opacity-50' : ''}`}>
                <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-champagne-100">
                  <SmartImage src={line?.image || i.snapshot?.image} alt="" sizes="64px" quality={60} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {i.type === 'package' && <span className="badge mb-0.5 bg-gold-500/15 !px-2 !py-0 text-[10.5px] text-gold-700">{dict.cart.package}</span>}
                      <p className="text-[14.5px] font-medium leading-snug text-ink-900">{name}</p>
                    </div>
                    <button type="button" onClick={() => cart.removeItem(i.type, i.id)} className="rounded-full p-1 text-ink-500 hover:bg-champagne-100 hover:text-danger" aria-label={`${dict.common.remove}: ${name}`}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <QuantityStepper value={i.quantity} onChange={(v) => cart.setQuantity(i.type, i.id, Math.max(i.snapshot?.minQty || 1, v))} min={i.snapshot?.minQty || 1} size="sm" />
                    <span className="text-right text-[14px] font-semibold text-ink-900">
                      {money(line ? line.lineTotal : (i.snapshot?.price || 0) * i.quantity)}
                      <span className="block text-[11.5px] font-normal text-ink-500">
                        {money(line?.unitPrice ?? i.snapshot?.price)} / {dict.common[line?.pricingUnit || i.snapshot?.pricingUnit || 'per_item']}
                      </span>
                    </span>
                  </div>
                  {i.type === 'package' && line?.components?.length > 0 && (
                    <details className="mt-2 text-[12.5px] text-ink-500">
                      <summary className="cursor-pointer text-maroon-600">{dict.packages.included}</summary>
                      <ul className="mt-1 space-y-0.5 pl-2">
                        {line.components.map((c) => (
                          <li key={c.product}>
                            {c.quantity} × {tr(c.name, lang)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t bg-ivory-50 px-6 py-5" style={{ borderColor: 'var(--border-subtle)' }}>
          {stockIssues.length > 0 && (
            <div className="mb-4 rounded-md bg-danger/10 p-3 text-[13px] text-danger" role="alert">
              <p className="flex items-center gap-2 font-medium">
                <AlertTriangle className="h-4 w-4" /> {t.errors.unavailable}
              </p>
              <ul className="mt-1 list-disc pl-6">
                {stockIssues.map((s) => (
                  <li key={s.productId}>
                    {tr(s.name, lang)} — {t.errors.availableOnly}: {s.available}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {quote?.unavailable?.length > 0 && (
            <p className="mb-4 rounded-md bg-danger/10 p-3 text-[13px] text-danger" role="alert">
              {t.errors.itemUnavailable}
            </p>
          )}
          <div className="flex items-baseline justify-between">
            <span className="text-[14px] text-ink-700">{dict.common.estimatedTotal}</span>
            <span className="flex items-center gap-2 font-display text-[36px] font-semibold leading-none text-maroon-600">
              {quoting && <Loader2 className="h-4 w-4 animate-spin text-ink-300" aria-label={dict.common.loading} />}
              {money(quote?.totalAmount ?? fallbackTotal)}
            </span>
          </div>
          <p className="mt-3 flex gap-2 text-[12.5px] text-ink-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {t.note}
          </p>
          {submitError && !stockIssues.length && (
            <p className="mt-3 rounded-md bg-danger/10 p-3 text-[13px] text-danger" role="alert">
              {submitError}
            </p>
          )}
          <button type="submit" disabled={isSubmitting || !cart.items.length} className="btn btn-primary btn-lg mt-5 w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> {t.placing}
              </>
            ) : (
              <>
                {t.placeOrder} <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
          <Link href={href('/custom-package')} className="mt-3 block text-center text-[13px] text-maroon-600 hover:underline">
            {dict.cart.edit}
          </Link>
        </div>
      </aside>
    </form>
  );
}
