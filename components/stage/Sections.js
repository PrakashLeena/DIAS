'use client';

// Homepage sections — ported 1:1 from /_design/ui_kits/website/Sections.jsx.
// Layout and styling are unchanged; content comes from MongoDB (packages,
// add-on products, gallery, testimonials) and the booking form saves real enquiries.
import React from 'react';
import Image from 'next/image';
import { PackageCard, TestimonialCard, Input, Select, Switch, Slider, ChoiceChip, SegmentedControl, Button, Badge, Icon } from './ds';

const wrap = { maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 clamp(20px,4vw,40px)' };
const eyebrowStyle = { fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gold-700)', fontWeight: 500 };
const h2Style = { margin: '10px 0 0', fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(36px,4.4vw,56px)', lineHeight: 1.06, color: 'var(--ink-900)', textWrap: 'balance' };

function SectionHead({ eyebrow, title, intro, center }) {
  return (
    <div style={{ maxWidth: 640, margin: center ? '0 auto 48px' : '0 0 48px', textAlign: center ? 'center' : 'left' }}>
      <div style={eyebrowStyle}>{eyebrow}</div>
      <h2 className="sd-h2" style={h2Style}>{title}</h2>
      {intro && <p style={{ margin: '16px 0 0', fontSize: 18, fontWeight: 300, color: 'var(--ink-500)', textWrap: 'pretty' }}>{intro}</p>}
    </div>
  );
}

const pick = (o, lang) => (o ? o[lang] || o.en || o.ta || '' : '');

// Decorative kolam/mandala ornament for the featured packages backdrop.
function Mandala({ size, style }) {
  const petals = Array.from({ length: 16 }, (_, i) => i * 22.5);
  return (
    <svg aria-hidden="true" viewBox="-100 -100 200 200" width={size} height={size} style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
      <g fill="none" stroke="currentColor" strokeWidth=".7">
        <circle r="96" /><circle r="90" strokeDasharray="2 4" /><circle r="62" /><circle r="30" /><circle r="12" />
        {petals.map(a => <path key={a} transform={`rotate(${a})`} d="M0-30C12-46 12-66 0-88C-12-66-12-46 0-30Z" />)}
        {petals.map(a => <path key={'s' + a} transform={`rotate(${a + 11.25})`} d="M0-62C6-70 6-78 0-84C-6-78-6-70 0-62Z" />)}
        {petals.map(a => <circle key={'d' + a} transform={`rotate(${a})`} cy="-96" r="2.2" fill="currentColor" />)}
        {petals.slice(0, 8).map(a => <path key={'i' + a} transform={`rotate(${a * 2})`} d="M0-12C5-18 5-24 0-30C-5-24-5-18 0-12Z" />)}
      </g>
    </svg>
  );
}

function Ornament() {
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18, color: 'var(--gold-500)' }}>
      <span style={{ width: 56, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-500))' }}></span>
      <svg width="34" height="14" viewBox="0 0 34 14"><path d="M17 1l5 6-5 6-5-6z" fill="currentColor" /><circle cx="5" cy="7" r="2" fill="currentColor" opacity=".6" /><circle cx="29" cy="7" r="2" fill="currentColor" opacity=".6" /></svg>
      <span style={{ width: 56, height: 1, background: 'linear-gradient(90deg, var(--gold-500), transparent)' }}></span>
    </div>
  );
}

export function Packages({ t, lang, packages, money, catLabels, onSelect, href }) {
  if (!packages.length) return null;
  return (
    <section id="packages" data-screen-label="Packages" className="sd-featured" style={{ padding: 'var(--space-12) 0' }}>
      <Mandala size={520} style={{ top: -170, right: -160, color: 'rgba(196,152,72,.22)' }} />
      <Mandala size={380} style={{ bottom: -150, left: -140, color: 'rgba(168,36,74,.12)' }} />
      <span aria-hidden="true" className="sd-featured-glow" style={{ top: '18%', left: '8%' }}></span>
      <span aria-hidden="true" className="sd-featured-glow" style={{ bottom: '12%', right: '10%', animationDelay: '-4s' }}></span>
      <div style={{ ...wrap, position: 'relative' }}>
        <div style={{ marginBottom: 48 }}>
          <span className="sd-featured-eyebrow">{t.packages.eyebrow}</span>
          <h2 className="sd-h2" style={{ ...h2Style, maxWidth: 680 }}>{t.packages.title}</h2>
          <Ornament />
          <p style={{ margin: '16px 0 0', maxWidth: 640, fontSize: 18, fontWeight: 300, color: 'var(--ink-500)', textWrap: 'pretty' }}>{t.packages.intro}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))', gap: 24, alignItems: 'stretch' }}>
          {packages.map((p, i) => {
            const items = p.items.filter(it => it.product);
            const features = items.slice(0, 5).map(it => `${it.quantity} × ${pick(it.product.name, lang)}`);
            if (items.length > 5) features.push(`+ ${items.length - 5} ${t.packages.more}`);
            return (
              <PackageCard key={p._id} image={p.coverImage} tier={`${t.packages.tier} 0${i + 1}`} name={pick(p.name, lang)} href={href(`/packages/${p.slug}`)}
                featured={i === 1} badge={catLabels[p.category]} features={features}
                price={money(p.packagePrice)} priceNote={t.packages.from} cta={t.packages.cta} onSelect={() => onSelect(p._id)} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Estimator({ t, lang, packages, addons, money, pkg, setPkg, flora, setFlora, floraOptions, onQuote }) {
  const [guests, setGuests] = React.useState(350);
  const [fn, setFn] = React.useState('wedding');
  const [tent, setTent] = React.useState(false);
  const [light, setLight] = React.useState(true);
  const [walk, setWalk] = React.useState(false);
  const P = packages.find(p => p._id === pkg) || packages[0];
  if (!P) return null;
  const tentIncluded = P.hasTent;
  const lines = [
    [pick(P.name, lang), P.packagePrice],
    ...(tent && !tentIncluded && addons.tent ? [[pick(addons.tent.name, lang), addons.tent.rentalPrice]] : []),
    ...(light && addons.light ? [[pick(addons.light.name, lang), addons.light.rentalPrice]] : []),
    ...(walk && addons.walk ? [[pick(addons.walk.name, lang), addons.walk.rentalPrice]] : []),
  ];
  const total = lines.reduce((a, l) => a + l[1], 0);
  const fnOptions = Object.entries(t.functions).map(([value, label]) => ({ value, label }));
  const quote = () => onQuote({ pkg: P, addons: [tent && !tentIncluded && addons.tent, light && addons.light, walk && addons.walk].filter(Boolean), fn, guests, flora });

  return (
    <section id="estimator" data-screen-label="Estimator" style={{ padding: 'var(--space-12) 0', background: 'var(--surface-sunken)' }}>
      <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: 48, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          <SectionHead eyebrow={t.estimator.eyebrow} title={t.estimator.title} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><span style={{ ...eyebrowStyle, color: 'var(--ink-700)', letterSpacing: '.14em' }}>{t.estimator.package}</span>
              <SegmentedControl tone="light" value={P._id} onChange={setPkg} options={packages.map(p => ({ value: p._id, label: pick(p.name, lang) }))} /></div>
            <Select label={t.estimator.function} value={fn} onChange={setFn} options={fnOptions} />
            <Slider label={t.estimator.guests} min={50} max={1000} step={25} value={guests} onChange={setGuests} format={v => v + ' ' + t.estimator.guestsUnit} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}><span style={{ ...eyebrowStyle, color: 'var(--ink-700)', letterSpacing: '.14em' }}>{t.estimator.florals}</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{floraOptions.map(o => <ChoiceChip key={o.v} label={t.flora[o.v]} swatch={o.sw} selected={flora === o.v} onClick={() => setFlora(o.v)} />)}</div></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: 24, background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
              {addons.tent && <Switch label={tentIncluded ? t.estimator.tentIncluded : t.estimator.tent} description={t.estimator.tentDesc} checked={tent || tentIncluded} disabled={tentIncluded} onChange={setTent} />}
              {addons.light && <Switch label={t.estimator.light} description={t.estimator.lightDesc} checked={light} onChange={setLight} />}
              {addons.walk && <Switch label={t.estimator.walk} description={t.estimator.walkDesc} checked={walk} onChange={setWalk} />}
            </div>
          </div>
        </div>
        <aside style={{ position: 'sticky', top: 100, minWidth: 0, background: 'var(--ink-900)', color: 'var(--text-on-dark)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-3)' }}>
          <div style={{ height: 180, background: 'url(' + (P.coverImage || '/images/image-slider/slide-01.webp') + ') center/cover' }}></div>
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><span style={{ ...eyebrowStyle, color: 'var(--gold-300)' }}>{t.functions[fn]} · {guests} {t.estimator.guestsUnit}</span><Badge tone="glass">{t.estimator.estimate}</Badge></div>
            <div>{lines.map(([l, v]) => <div key={l} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--border-glass)', fontSize: 15, fontWeight: 300 }}><span>{l}</span><span style={{ whiteSpace: 'nowrap' }}>{money(v)}</span></div>)}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}><span style={{ fontSize: 14, color: 'var(--text-on-dark-muted)' }}>{t.estimator.total}</span><span style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 600, color: 'var(--gold-300)', lineHeight: 1 }}>{money(total)}</span></div>
            <Button variant="gold" fullWidth iconRight="ArrowRight" onClick={quote} disabled={!P.isAvailable}>{t.estimator.cta}</Button>
            <span style={{ fontSize: 13, color: 'var(--text-on-dark-muted)', textAlign: 'center' }}>{t.estimator.note}</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

export function Gallery({ t, lang, items }) {
  if (!items.length) return null;
  return (
    <section id="gallery" data-screen-label="Gallery" style={{ padding: 'var(--space-12) 0 0', background: 'var(--surface-page)' }}>
      <div style={wrap}>
        <SectionHead eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(180px,40vw),1fr))', gap: 16 }}>
          {items.map((g, i) => <figure key={g._id || i} style={{ margin: 0 }}><div style={{ position: 'relative', aspectRatio: '4/5', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--champagne-200)' }}><Image src={g.url} alt={pick(g.caption, lang)} fill sizes="(max-width: 640px) 50vw, 200px" quality={60} style={{ objectFit: 'cover' }} /></div><figcaption style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-500)' }}>{pick(g.caption, lang)}</figcaption></figure>)}
        </div>
      </div>
    </section>
  );
}

// Infinite right-to-left scroll: the list is repeated until it is wider than the
// screen, then drawn twice so the first card follows straight after the last.
function Marquee({ items, lang }) {
  const base = [];
  while (base.length < Math.max(6, items.length)) base.push(...items);
  const cards = (copy) => base.map((x, i) => (
    <div key={copy + '-' + i} className="sd-marquee-item" aria-hidden={copy === 'b' || i >= items.length ? 'true' : undefined}>
      <TestimonialCard quote={pick(x.quote, lang)} name={x.name} event={pick(x.event, lang)} rating={x.rating || 5} />
    </div>
  ));
  return (
    <div className="sd-marquee" style={{ '--marquee-dur': base.length * 10 + 's' }}>
      <div className="sd-marquee-track">{cards('a')}{cards('b')}</div>
    </div>
  );
}

export function Testimonials({ t, lang, items }) {
  if (!items.length) return null;
  return (
    <section id="testimonials" data-screen-label="Testimonials" style={{ padding: 'var(--space-12) 0', background: 'var(--surface-page)' }}>
      <div style={wrap}>
        <SectionHead eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} center />
      </div>
      <Marquee items={items} lang={lang} />
    </section>
  );
}

const emptyForm = { name: '', phone: '', eventDate: '', eventType: 'wedding', venue: '', guests: '', notes: '', website: '' };

export function Booking({ t, lang, flora }) {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState({ busy: false, msg: '' });
  const b = t.booking;
  const steps = [['CalendarHeart', ...b.steps[0]], ['Ruler', ...b.steps[1]], ['Box', ...b.steps[2]]];
  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const today = React.useMemo(() => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }, []);

  const submit = async e => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = true;
    if (!/^\+?[0-9\s-]{9,16}$/.test(form.phone.trim())) errs.phone = true;
    if (!form.eventDate || form.eventDate < today) errs.eventDate = true;
    setErrors(errs);
    if (Object.keys(errs).length) return setStatus({ busy: false, msg: b.error });
    setStatus({ busy: true, msg: '' });
    try {
      const res = await fetch('/api/enquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, guests: form.guests ? Number(form.guests) : undefined, flora, language: lang }) });
      if (res.ok) { setSent(true); setForm(emptyForm); setStatus({ busy: false, msg: '' }); return; }
      setStatus({ busy: false, msg: res.status === 429 ? b.rateLimited : res.status === 400 ? b.error : b.failed });
    } catch {
      setStatus({ busy: false, msg: b.failed });
    }
  };

  return (
    <section id="booking" data-screen-label="Booking" style={{ padding: 'var(--space-12) 0', background: 'var(--maroon-900)', color: 'var(--text-on-dark)' }}>
      <div style={{ ...wrap, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(320px,100%),1fr))', gap: 56, alignItems: 'start' }}>
        <div>
          <div style={{ ...eyebrowStyle, color: 'var(--gold-300)' }}>{b.eyebrow}</div>
          <h2 className="sd-h2" style={{ ...h2Style, color: 'var(--text-on-dark)' }}>{b.title}</h2>
          <p style={{ margin: '16px 0 36px', fontSize: 18, fontWeight: 300, color: 'var(--text-on-dark-muted)', maxWidth: 460 }}>{b.intro}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>{steps.map(([ic, st, d], i) => <div key={st} style={{ display: 'flex', gap: 18 }}>
            <span style={{ width: 48, height: 48, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', border: '1px solid var(--border-gold)', color: 'var(--gold-300)' }}><Icon name={ic} size={20} /></span>
            <div><div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500 }}>{i + 1}. {st}</div><div style={{ fontSize: 15, fontWeight: 300, color: 'var(--text-on-dark-muted)' }}>{d}</div></div></div>)}</div>
        </div>
        <form onSubmit={submit} noValidate style={{ background: 'var(--ivory-100)', color: 'var(--ink-900)', borderRadius: 'var(--radius-xl)', padding: 'clamp(24px,4vw,40px)', boxShadow: 'var(--shadow-3)', minWidth: 0 }}>
          {sent ? <div role="status" style={{ textAlign: 'center', padding: '48px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <span style={{ width: 64, height: 64, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'rgba(62,142,79,.12)', color: 'var(--success-600)' }}><Icon name="Check" size={30} /></span>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500 }}>{b.successTitle}</div>
            <p style={{ margin: 0, color: 'var(--ink-500)', fontWeight: 300 }}>{b.successText}</p>
            <Button variant="secondary" size="sm" onClick={() => setSent(false)}>{b.again}</Button>
          </div> : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))', gap: 20 }}>
            <Input label={b.name} placeholder={b.namePh} icon="User" value={form.name} onChange={set('name')} error={errors.name ? ' ' : undefined} autoComplete="name" required />
            <Input label={b.phone} type="tel" placeholder={b.phonePh} icon="Phone" value={form.phone} onChange={set('phone')} error={errors.phone ? ' ' : undefined} autoComplete="tel" inputMode="tel" required />
            <Input label={b.date} type="date" icon="Calendar" value={form.eventDate} onChange={set('eventDate')} min={today} error={errors.eventDate ? ' ' : undefined} required />
            <Select label={b.fn} value={form.eventType} onChange={set('eventType')} options={Object.entries(t.functions).map(([value, label]) => ({ value, label }))} />
            <Input label={b.venue} placeholder={b.venuePh} icon="MapPin" value={form.venue} onChange={set('venue')} />
            <Input label={b.guests} type="number" placeholder={b.guestsPh} icon="Users" value={form.guests} onChange={set('guests')} min="1" inputMode="numeric" />
            <div style={{ gridColumn: '1/-1' }}><Input label={b.notes} placeholder={b.notesPh} multiline rows={3} value={form.notes} onChange={set('notes')} /></div>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={e => set('website')(e.target.value)} style={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }} />
            {status.msg && <p role="alert" style={{ gridColumn: '1/-1', margin: 0, fontSize: 14, color: 'var(--danger-600)' }}>{status.msg}</p>}
            <div style={{ gridColumn: '1/-1' }}><Button variant="primary" type="submit" fullWidth size="lg" iconRight="Send" disabled={status.busy}>{status.busy ? b.sending : b.submit}</Button></div>
          </div>}
        </form>
      </div>
    </section>
  );
}
