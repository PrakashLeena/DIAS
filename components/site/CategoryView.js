'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSite } from './SiteProvider';
import { Bi, Photo } from './ui';
import { Stepper } from './ActionBar';
import { CallButtons, WhatsAppButton } from './Contact';
import HowToOrder from './HowToOrder';
import { NAV_ICONS } from './icons';

/** Display label of an item: "Design N" for numbered galleries, otherwise its own name. */
export function itemLabel(cat, item, index) {
  if (cat.numbered) {
    const p = cat.numberPrefix || { ta: '', en: '' };
    return { ta: `${p.ta} ${index + 1}`.trim(), en: `${p.en} ${index + 1}`.trim() };
  }
  return item.name;
}

export default function CategoryView({ category: cat }) {
  const [lightbox, setLightbox] = useState(null);
  const [subId, setSubId] = useState(null);
  const sub = cat.mode === 'sub' ? cat.subs.find((s) => s.id === subId) : null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-6">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-maroon-600">
        ◂ முகப்பு / Home
      </Link>

      <div className="mb-6 flex items-center gap-3.5">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-maroon-900 text-3xl text-gold-300 shadow-2" aria-hidden>{(() => { const I = NAV_ICONS[cat.id]; return I ? <I className="h-7 w-7" strokeWidth={1.5} /> : cat.emoji; })()}</span>
        <h1 className="text-[clamp(22px,4vw,34px)]">
          <Bi n={cat.name} />
        </h1>
      </div>

      {cat.mode !== 'contact' && <HowToOrder compact className="mb-6" />}

      {cat.mode === 'contact' && <ContactNotice cat={cat} />}

      {cat.mode === 'selector' && <SelectorCard cat={cat} />}

      {cat.mode === 'sub' && !sub && (
        <div className="grid gap-4 sm:grid-cols-2">
          {cat.subs.map((s) => (
            <button key={s.id} type="button" onClick={() => setSubId(s.id)} className="card group flex items-center gap-4 p-4 text-left transition-shadow hover:shadow-3">
              <span className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl">
                <Photo src={s.image} emoji={s.emoji} sizes="120px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-2xl" aria-hidden>{s.emoji}</span>
                <Bi n={s.name} className="text-lg font-semibold text-ink-900" />
                <span className="mt-1 block text-[13px] text-maroon-600">{s.items.length} வகைகள் / items ▸</span>
              </span>
            </button>
          ))}
          {!cat.subs.length && <Empty />}
        </div>
      )}

      {cat.mode === 'sub' && sub && (
        <>
          <button type="button" onClick={() => setSubId(null)} className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-maroon-600">
            ◂ பிரிவுகள் / Sub-categories
          </button>
          <h2 className="mb-4 text-xl">
            {sub.emoji} <Bi n={sub.name} className="inline" />
          </h2>
          <ItemGrid cat={cat} items={sub.items} subId={sub.id} onZoom={setLightbox} />
        </>
      )}

      {(cat.mode === 'items' || cat.mode === 'selector' || cat.mode === 'contact') && (
        <ItemGrid cat={cat} items={cat.items} onZoom={setLightbox} selectable={cat.mode === 'items'} />
      )}

      {cat.note?.ta || cat.note?.en ? (cat.mode === 'contact' ? null : <NoteBox note={cat.note} />) : null}

      <Lightbox item={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}

function Empty() {
  return <p className="rounded-xl bg-champagne-100 p-6 text-center text-ink-500">விரைவில் / Coming soon</p>;
}

function NoteBox({ note }) {
  return (
    <aside className="mt-8 rounded-2xl border-2 border-gold-500 bg-gradient-to-br from-[#FFF6DC] to-champagne-100 p-5 shadow-1" role="note">
      <p className="mb-1 text-xl" aria-hidden>📌</p>
      {note.ta && <p className="text-[16px] font-medium leading-relaxed text-ink-900">{note.ta}</p>}
      {note.en && <p className="mt-2 text-[14.5px] leading-relaxed text-ink-700">{note.en}</p>}
    </aside>
  );
}

function ContactNotice({ cat }) {
  const msg = `வணக்கம்! / Hello! I would like to enquire about: ${cat.name.ta} (${cat.name.en})`;
  return (
    <section className="mb-8 rounded-2xl border-2 border-gold-500 bg-gradient-to-br from-[#FFF6DC] to-champagne-100 p-5 shadow-2" role="note">
      <p className="text-2xl" aria-hidden>📞</p>
      {cat.note.ta && <p className="mt-1 text-[17px] font-semibold leading-relaxed text-ink-900">{cat.note.ta}</p>}
      {cat.note.en && <p className="mt-1.5 text-[15px] leading-relaxed text-ink-700">{cat.note.en}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <CallButtons />
        <WhatsAppButton message={msg} className="min-h-[46px]">
          <span className="text-left leading-tight">
            <span className="block text-[11px] font-medium opacity-90">வாட்ஸ்அப் / Chat on</span>
            <span className="block">WhatsApp</span>
          </span>
        </WhatsAppButton>
      </div>
    </section>
  );
}

/** Quantity selector for categories like Chairs (preset buttons) and Buffet Set (1–18 dropdown). */
function SelectorCard({ cat }) {
  const { setLine, removeLine, qtyOf } = useSite();
  const key = `${cat.id}:*`;
  const qty = qtyOf(key);
  const s = cat.selector;
  const choose = (n) => {
    if (!n) return removeLine(key);
    setLine({ key, catId: cat.id, catEmoji: cat.emoji, catName: cat.name, label: cat.name, qty: n, unit: s.unit, showQty: true, adjustable: false });
  };
  const rangeOptions = Array.from({ length: Math.max(0, s.max - s.min + 1) }, (_, i) => s.min + i);

  return (
    <section className="mb-8 rounded-2xl border bg-white p-5 shadow-2" style={{ borderColor: 'var(--border-gold)' }}>
      <h2 className="text-lg">
        எண்ணிக்கையைத் தேர்வு செய்க <span className="text-[13px] font-normal text-ink-500">/ Select quantity {s.unit?.en ? `(${s.unit.en})` : ''}</span>
      </h2>
      {s.type === 'preset' ? (
        <div className="mt-3 flex flex-wrap gap-2.5" role="radiogroup" aria-label="Quantity">
          {s.options.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={qty === n}
              onClick={() => choose(qty === n ? 0 : n)}
              className={`min-h-[48px] min-w-[76px] rounded-full border-2 px-5 text-[17px] font-bold transition-colors ${qty === n ? 'border-maroon-600 bg-maroon-600 text-white' : 'border-champagne-200 bg-champagne-100 text-ink-900 hover:border-gold-500'}`}
            >
              {n}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-3 max-w-xs">
          <label htmlFor={`sel-${cat.id}`} className="sr-only">
            Count
          </label>
          <select id={`sel-${cat.id}`} className="field !text-[17px] font-semibold" value={qty || ''} onChange={(e) => choose(Number(e.target.value))}>
            <option value="">— தேர்வு செய்க / Select —</option>
            {rangeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      )}
      <p className="mt-3 text-[14px]" aria-live="polite">
        {qty ? (
          <span className="font-semibold text-[#1a7d43]">
            ✓ {qty} {s.unit?.ta} / {s.unit?.en} — பட்டியலில் சேர்க்கப்பட்டது / added to your list
          </span>
        ) : (
          <span className="text-ink-500">தேர்வு செய்தவுடன் பட்டியலில் சேரும் / Choose a number to add it to your list.</span>
        )}
      </p>
    </section>
  );
}

function ItemGrid({ cat, items, subId, onZoom, selectable = true }) {
  const { setLine, removeLine, qtyOf } = useSite();
  if (!items.length) return cat.mode === 'sub' || cat.mode === 'items' ? <Empty /> : null;

  const grouped = !cat.numbered && items.some((i) => i.group?.ta || i.group?.en);
  let lastGroup = null;

  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {items.map((item, index) => {
        const label = itemLabel(cat, item, index);
        const key = `${cat.id}:${subId || '-'}:${item.id}`;
        const qty = selectable ? qtyOf(key) : 0;
        const gKey = `${item.group?.ta}|${item.group?.en}`;
        const showGroup = grouped && gKey !== lastGroup && (item.group?.ta || item.group?.en);
        lastGroup = gKey;
        const toggle = (q) =>
          q <= 0
            ? removeLine(key)
            : setLine({ key, catId: cat.id, catEmoji: cat.emoji, catName: cat.name, label, qty: q, adjustable: cat.qtyStepper, showQty: false });
        return (
          <div key={item.id} className="contents">
            {showGroup && (
              <h2 className="col-span-full mt-3 border-b-2 border-gold-500/50 pb-1.5 text-lg first:mt-0">
                <Bi n={item.group} />
              </h2>
            )}
            <article className={`card flex flex-col ${qty ? 'ring-2 ring-maroon-600' : ''}`}>
              <button type="button" onClick={() => item.image && onZoom({ src: item.image, label })} className="relative block aspect-[4/3] w-full bg-champagne-100" aria-label={item.image ? `Enlarge ${label.en || label.ta}` : undefined} disabled={!item.image}>
                <Photo src={item.image} emoji={cat.mode === 'sub' ? cat.subs.find((s) => s.id === subId)?.emoji || cat.emoji : cat.emoji} alt={label.en || label.ta} />
                {qty > 0 && <span className="absolute right-2 top-2 rounded-full bg-maroon-600 px-2.5 py-0.5 text-[12px] font-bold text-white">✓</span>}
              </button>
              {(label.ta || label.en) && (
                <div className="px-3 pt-2.5 text-[15px] font-semibold text-ink-900">
                  <Bi n={label} />
                </div>
              )}
              {selectable && (
                <div className="mt-auto p-3">
                  {!qty ? (
                    <button type="button" onClick={() => toggle(1)} className="btn btn-primary btn-sm w-full">
                      தேர்வு செய் / Select
                    </button>
                  ) : cat.qtyStepper ? (
                    <div className="flex items-center justify-between gap-2">
                      <Stepper qty={qty} onChange={toggle} />
                      <button type="button" onClick={() => removeLine(key)} className="text-[12.5px] text-[#B3122E] underline">
                        நீக்கு
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => removeLine(key)} className="btn btn-secondary btn-sm w-full !border-maroon-600 !text-maroon-600">
                      ✓ தேர்வு செய்யப்பட்டது / Selected
                    </button>
                  )}
                </div>
              )}
              {!selectable && <div className="pb-2.5" />}
            </article>
          </div>
        );
      })}
    </div>
  );
}

function Lightbox({ item, onClose }) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [item, onClose]);
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.src} alt={item.label.en || item.label.ta} className="max-h-[80vh] max-w-full rounded-xl object-contain" />
      <p className="mt-3 text-center text-white">{item.label.ta} {item.label.en && `· ${item.label.en}`}</p>
      <button type="button" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl text-white" onClick={onClose} aria-label="Close">
        ✕
      </button>
    </div>
  );
}
