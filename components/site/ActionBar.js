'use client';

// Sticky bottom bar (always visible) + the selection-list sheet.
// WhatsApp: formats the whole selection into one message and opens wa.me to the owner.
// Call: direct tel: links to the owner's numbers.
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Phone } from 'lucide-react';
import { useSite } from './SiteProvider';
import { Bi } from './ui';
import { CallButtons } from './Contact';
import HowToOrder from './HowToOrder';
import { WhatsAppIcon } from './icons';
import { GREETING, buildOrderMessage, prettyPhone, telHref, waHref } from '@/lib/contact';

function useWhatsAppHref() {
  const { contact, lines, site, note } = useSite();
  const text = lines.length ? buildOrderMessage(lines, { siteName: site.name, note }) : GREETING;
  return waHref(contact.whatsapp, text);
}

export default function ActionBar() {
  const { lines, setSheetOpen, contact, clear } = useSite();
  const confirmClear = () => window.confirm('தேர்ந்தெடுத்த அனைத்தையும் அழிக்கவா? / Clear your entire selection?') && clear();
  const href = useWhatsAppHref();
  const count = lines.length;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 shadow-[0_-8px_24px_rgba(30,17,20,.12)] backdrop-blur" style={{ borderColor: 'var(--border-subtle)' }} role="region" aria-label="Order actions">
        <div className="mx-auto max-w-[1200px] px-3 pb-2.5 pt-2">
          <div className={`mb-2 items-center gap-2 ${count ? 'flex' : 'hidden sm:flex'}`}>
            <button type="button" onClick={() => setSheetOpen(true)} className="flex min-w-0 flex-1 items-center justify-between rounded-lg bg-champagne-100 px-3 py-1.5 text-left text-[13.5px] font-medium text-ink-900">
              <span className="truncate">
                {count ? `தேர்வு / Selected: ${count}` : 'எதுவும் தேர்வு செய்யப்படவில்லை / Nothing selected yet'}
              </span>
              <span className="ml-2 shrink-0 text-maroon-600">பட்டியல் ▸</span>
            </button>
            {count > 0 && (
              <button type="button" onClick={confirmClear} className="btn btn-danger btn-sm shrink-0 !min-h-[34px]" aria-label="Clear entire order">
                ✕ அழி / Clear
              </button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!count) {
                  e.preventDefault();
                  setSheetOpen(true);
                }
              }}
              className="btn btn-whatsapp min-h-[50px] w-full !whitespace-normal !px-3 text-[14px] sm:flex-[2]"
            >
              <WhatsAppIcon className="h-6 w-6" />
              <span className="text-left leading-tight">
                <span className="block">வாட்ஸ்அப் மூலம் ஆர்டர் அனுப்புக{count ? ` (${count})` : ''}</span>
                <span className="block text-[11.5px] font-medium opacity-90">Send Selected Items via WhatsApp</span>
              </span>
            </a>
            <CallGroup phones={contact.phones} />
          </div>
        </div>
      </div>
      <SelectionSheet whatsappHref={href} />
    </>
  );
}

/**
 * Call buttons in the bottom bar. One or two numbers: a button per number.
 * Three or more: they no longer fit side by side on a phone, so below the `lg`
 * breakpoint they collapse into one "Call" button that opens a list of all numbers.
 */
function CallGroup({ phones }) {
  const many = phones.length > 2;
  const [open, setOpen] = useState(false);
  const root = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={`relative flex min-w-0 gap-2 ${many ? 'sm:flex-1 lg:flex-[1.6]' : 'sm:flex-1'}`}>
      {phones.map((p) => (
        <a
          key={p}
          href={telHref(p)}
          className={`btn btn-call min-h-[46px] min-w-0 flex-1 !px-2 sm:min-h-[50px] ${many ? 'hidden lg:inline-flex' : ''}`}
          aria-label={`Call ${p}`}
        >
          <Phone className="h-4 w-4 shrink-0" aria-hidden />
          <span className="text-left leading-tight">
            <span className="hidden text-[11px] font-medium opacity-80 sm:block">அழைக்க / Call</span>
            <span className="block whitespace-nowrap text-[13.5px]">{prettyPhone(p)}</span>
          </span>
        </a>
      ))}

      {many && (
        <>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-haspopup="true"
            className="btn btn-call min-h-[46px] w-full !px-3 sm:min-h-[50px] lg:hidden"
          >
            <Phone className="h-4 w-4 shrink-0" aria-hidden />
            <span className="leading-tight">அழைக்க / Call ({phones.length})</span>
            <span aria-hidden className={`text-[11px] transition-transform ${open ? 'rotate-180' : ''}`}>▲</span>
          </button>
          {open && (
            <ul className="absolute inset-x-0 bottom-full mb-2 space-y-1.5 rounded-2xl border bg-white p-2 shadow-3 lg:hidden" style={{ borderColor: 'var(--border-subtle)' }}>
              {phones.map((p, i) => (
                <li key={p}>
                  <a href={telHref(p)} onClick={() => setOpen(false)} className="btn btn-call min-h-[48px] w-full justify-between !px-4">
                    <span className="inline-flex items-center gap-2.5">
                      <Phone className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="whitespace-nowrap text-[15px] font-semibold">{prettyPhone(p)}</span>
                    </span>
                    <span className="text-[11.5px] font-medium opacity-75">அழைக்க {i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function SelectionSheet({ whatsappHref }) {
  const { sheetOpen, setSheetOpen, lines, setLine, removeLine, clear, note, setNote, contact } = useSite();

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e) => e.key === 'Escape' && setSheetOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [sheetOpen, setSheetOpen]);

  if (!sheetOpen) return null;

  const groups = [];
  for (const l of lines) {
    let g = groups.find((x) => x.catId === l.catId);
    if (!g) groups.push((g = { ...l, lines: [] }));
    g.lines.push(l);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Selection list">
      <button type="button" className="absolute inset-0 bg-ink-900/60" onClick={() => setSheetOpen(false)} aria-label="Close" />
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-3xl bg-ivory-100 shadow-3 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
          <h2 className="text-lg">
            🧾 தேர்ந்தெடுத்த பொருட்கள் <span className="text-[13px] font-normal text-ink-500">/ Your selection</span>
          </h2>
          <button type="button" onClick={() => setSheetOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-champagne-100 text-lg" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!lines.length ? (
            <div className="py-8 text-center">
              <p className="text-4xl" aria-hidden>🛒</p>
              <p className="mt-2 font-medium text-ink-900">எந்த பொருளும் தேர்வு செய்யப்படவில்லை</p>
              <p className="text-sm text-ink-500">Nothing selected yet — open a category and tap “Select”.</p>
              <a href={waHref(contact.whatsapp, GREETING)} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm font-semibold text-maroon-600 underline">
                தேர்வு இல்லாமல் அரட்டை / Chat without a selection
              </a>
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map((g) => (
                <section key={g.catId}>
                  <Link href={`/category/${g.catId}`} onClick={() => setSheetOpen(false)} className="mb-1.5 flex items-center gap-2 text-[14px] font-semibold text-maroon-600">
                    <span aria-hidden>{g.catEmoji}</span> {g.catName.ta} <span className="font-normal text-ink-500">({g.catName.en})</span>
                  </Link>
                  <ul className="divide-y rounded-xl border bg-white" style={{ borderColor: 'var(--border-subtle)' }}>
                    {g.lines.map((l) => (
                      <li key={l.key} className="flex items-center gap-3 px-3 py-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
                        <Bi n={l.label} className="min-w-0 flex-1 text-[15px] font-medium text-ink-900" />
                        {l.adjustable ? (
                          <Stepper qty={l.qty} onChange={(q) => setLine({ ...l, qty: q })} />
                        ) : (
                          <span className="rounded-full bg-champagne-100 px-2.5 py-1 text-[13px] font-semibold text-ink-900">
                            {l.showQty ? `${l.qty} ${l.unit?.en || ''}` : '1'}
                          </span>
                        )}
                        <button type="button" onClick={() => removeLine(l.key)} className="grid h-8 w-8 place-items-center rounded-full text-[#B3122E] hover:bg-[#FBE7EA]" aria-label="Remove">
                          🗑
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              <HowToOrder compact />
              <div>
                <label htmlFor="order-note" className="field-label">
                  பெயர் / நிகழ்வு தேதி (விருப்பம்) · Your name / event date (optional)
                </label>
                <textarea id="order-note" rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} className="field" placeholder="e.g. Kumar – 25 Dec, Jaffna" />
              </div>
              <button type="button" onClick={() => window.confirm('தேர்ந்தெடுத்த அனைத்தையும் அழிக்கவா? / Clear your entire selection?') && clear()} className="btn btn-danger btn-sm w-full">
                ✕ முழு ஆர்டரையும் அழி / Clear entire order
              </button>
            </div>
          )}
        </div>

        <div className="space-y-2 border-t px-5 py-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <a
            href={lines.length ? whatsappHref : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!lines.length}
            className={`btn btn-whatsapp min-h-[54px] w-full ${lines.length ? '' : 'pointer-events-none opacity-50'}`}
          >
            <WhatsAppIcon className="h-6 w-6" />
            <span className="text-left leading-tight">
              <span className="block">வாட்ஸ்அப் மூலம் ஆர்டர் அனுப்புக</span>
              <span className="block text-[12px] font-medium opacity-90">Send Selected Items via WhatsApp</span>
            </span>
          </a>
          <CallButtons className="[&>a]:flex-1" />
        </div>
      </div>
    </div>
  );
}

/** Quantity stepper; going below 1 removes the line from the selection. */
export function Stepper({ qty, onChange, max = 9999, block = false }) {
  return (
    <div className={`items-center rounded-full border bg-white ${block ? 'flex h-10 w-full justify-between' : 'inline-flex'}`} style={{ borderColor: 'var(--border-strong)' }}>
      <button type="button" onClick={() => onChange(Math.max(0, qty - 1))} className="grid h-9 w-9 place-items-center text-lg font-bold text-maroon-600" aria-label="Decrease quantity">
        −
      </button>
      <span className="min-w-[2.25rem] text-center text-[15px] font-semibold text-ink-900" aria-live="polite">
        {qty}
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, qty + 1))} className="grid h-9 w-9 place-items-center text-lg font-bold text-maroon-600" aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
