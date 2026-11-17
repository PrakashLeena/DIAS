'use client';

// Stage Décor design-system components, ported 1:1 from /_design/components.
// Only change: <Icon> uses tree-shaken lucide-react imports instead of the Lucide CDN.
import React from 'react';
import {
  ArrowRight, Check, Star, X, ChevronDown, Layers, Theater, Flower2, Lightbulb, Sparkles, Lamp, Armchair, Sun, Flame, Sunset,
  Sprout, RectangleHorizontal, RotateCcw, Orbit, CalendarHeart, Ruler, Box, User, Phone, Calendar, MapPin, Users, Send,
} from 'lucide-react';

const ICONS = { ArrowRight, Check, Star, X, ChevronDown, Layers, Theater, Flower2, Lightbulb, Sparkles, Lamp, Armchair, Sun, Flame, Sunset, Sprout, RectangleHorizontal, RotateCcw, Orbit, CalendarHeart, Ruler, Box, User, Phone, Calendar, MapPin, Users, Send };

export function Icon({ name, size = 18, strokeWidth = 1.6, color = 'currentColor', style }) {
  const C = ICONS[name];
  if (!C) return null;
  return <C width={size} height={size} strokeWidth={strokeWidth} color={color} style={{ flexShrink: 0, display: 'block', ...style }} aria-hidden="true" />;
}

const V = {
  primary: { bg: 'var(--maroon-600)', bgH: 'var(--maroon-700)', fg: 'var(--text-on-dark)', bd: 'transparent' },
  gold: { bg: 'linear-gradient(180deg,var(--gold-300),var(--gold-500))', bgH: 'linear-gradient(180deg,#F6DC90,#C99B38)', fg: 'var(--ink-900)', bd: 'rgba(156,116,38,.5)' },
  secondary: { bg: 'transparent', bgH: 'var(--champagne-100)', fg: 'var(--ink-900)', bd: 'var(--border-strong)' },
  ghost: { bg: 'transparent', bgH: 'rgba(142,27,58,.07)', fg: 'var(--maroon-600)', bd: 'transparent' },
  glass: { bg: 'rgba(255,248,236,.12)', bgH: 'rgba(255,248,236,.22)', fg: 'var(--text-on-dark)', bd: 'var(--border-glass)' },
};
const S = { sm: { h: 36, px: 16, fs: 12 }, md: { h: 46, px: 24, fs: 13 }, lg: { h: 56, px: 32, fs: 14 } };
export function Button({ variant = 'primary', size = 'md', icon, iconRight, disabled, fullWidth, children, onClick, type = 'button', style }) {
  const [h, setH] = React.useState(false);
  const [p, setP] = React.useState(false);
  const v = V[variant] || V.primary, s = S[size] || S.md;
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setP(false); }} onMouseDown={() => setP(true)} onMouseUp={() => setP(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, height: s.h, padding: '0 ' + s.px + 'px', width: fullWidth ? '100%' : undefined,
        borderRadius: 'var(--radius-pill)', border: '1px solid ' + v.bd, background: h && !disabled ? v.bgH : v.bg, color: v.fg,
        fontFamily: 'var(--font-sans)', fontSize: s.fs, fontWeight: 500, letterSpacing: 'var(--ls-button, .08em)', textTransform: 'uppercase', whiteSpace: 'nowrap',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1, transform: p && !disabled ? 'scale(.97)' : 'none',
        backdropFilter: variant === 'glass' ? 'blur(14px)' : undefined, WebkitBackdropFilter: variant === 'glass' ? 'blur(14px)' : undefined,
        boxShadow: variant === 'gold' && h && !disabled ? 'var(--glow-gold)' : 'none',
        transition: 'background var(--dur-fast), box-shadow var(--dur-base), transform var(--dur-fast)', ...style }}>
      {icon && <Icon name={icon} size={s.fs + 5} />}{children}{iconRight && <Icon name={iconRight} size={s.fs + 5} />}
    </button>
  );
}

const BT = {
  gold: ['rgba(212,168,69,.16)', 'var(--gold-700)', 'rgba(212,168,69,.4)'],
  maroon: ['var(--maroon-100)', 'var(--maroon-700)', 'transparent'],
  neutral: ['var(--champagne-100)', 'var(--ink-700)', 'var(--border-subtle)'],
  success: ['rgba(62,142,79,.12)', 'var(--success-600)', 'transparent'],
  glass: ['rgba(255,248,236,.14)', 'var(--text-on-dark)', 'var(--border-glass)'],
};
export function Badge({ tone = 'gold', icon, children, style }) {
  const [bg, fg, bd] = BT[tone] || BT.gold;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 12px', borderRadius: 'var(--radius-pill)', background: bg, color: fg, border: '1px solid ' + bd,
      fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', whiteSpace: 'nowrap', ...style }}>
      {icon && <Icon name={icon} size={13} />}{children}
    </span>
  );
}

export function IconButton({ icon, label, variant = 'glass', size = 44, active, onClick, style }) {
  const [h, setH] = React.useState(false);
  const glass = variant === 'glass';
  const bg = active ? (glass ? 'rgba(242,210,122,.28)' : 'var(--champagne-200)') : h ? (glass ? 'rgba(255,248,236,.2)' : 'var(--champagne-100)') : (glass ? 'rgba(255,248,236,.08)' : variant === 'light' ? 'var(--white)' : 'transparent');
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width: size, height: size, borderRadius: '50%', display: 'inline-grid', placeItems: 'center', cursor: 'pointer', padding: 0,
        border: '1px solid ' + (glass ? (active ? 'var(--border-gold)' : 'var(--border-glass)') : 'var(--border-subtle)'),
        background: bg, color: glass ? (active ? 'var(--gold-300)' : 'var(--text-on-dark)') : 'var(--ink-900)', transition: 'background var(--dur-fast), border-color var(--dur-fast)', ...style }}>
      <Icon name={icon} size={Math.round(size * .42)} />
    </button>
  );
}

export function ChoiceChip({ label, swatch, selected, onClick, tone = 'light' }) {
  const [h, setH] = React.useState(false);
  const dark = tone === 'dark';
  const sw = Array.isArray(swatch) ? swatch : swatch ? [swatch] : [];
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} aria-pressed={!!selected}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10, height: 40, padding: sw.length ? '0 16px 0 6px' : '0 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 14, whiteSpace: 'nowrap',
        border: '1px solid ' + (selected ? 'var(--gold-500)' : dark ? 'var(--border-glass)' : 'var(--border-strong)'),
        background: selected ? (dark ? 'rgba(242,210,122,.2)' : 'rgba(212,168,69,.12)') : h ? (dark ? 'rgba(255,248,236,.12)' : 'var(--champagne-100)') : (dark ? 'rgba(255,248,236,.04)' : 'var(--white)'),
        color: dark ? 'var(--text-on-dark)' : 'var(--ink-900)', boxShadow: selected ? '0 0 16px rgba(242,190,80,.25)' : 'none', transition: 'all var(--dur-fast)' }}>
      {sw.length > 0 && <span style={{ display: 'flex' }}>{sw.map((c, i) => <span key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: c, marginLeft: i ? -9 : 0, border: '2px solid ' + (dark ? 'rgba(30,17,20,.6)' : 'var(--white)') }}></span>)}</span>}
      {label}
    </button>
  );
}

export function Input({ label, placeholder, value, defaultValue, onChange, type = 'text', icon, hint, error, multiline, rows = 4, disabled, name, required, min, autoComplete, inputMode }) {
  const [f, setF] = React.useState(false);
  const bd = error ? 'var(--danger-600)' : f ? 'var(--gold-500)' : 'var(--border-strong)';
  const common = { name, placeholder, value, defaultValue, disabled, required, min, autoComplete, inputMode, 'aria-invalid': error ? 'true' : undefined, onChange: e => onChange && onChange(e.target.value, e), onFocus: () => setF(true), onBlur: () => setF(false),
    style: { flex: 1, minWidth: 0, border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 16, color: 'var(--ink-900)', padding: multiline ? '14px 0' : 0, resize: 'vertical', fontWeight: 300, boxShadow: 'none' } };
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-sans)' }}>
      {label && <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-700)' }}>{label}</span>}
      <span style={{ display: 'flex', alignItems: multiline ? 'flex-start' : 'center', gap: 10, minHeight: multiline ? 0 : 50, padding: '0 16px', borderRadius: 'var(--radius-sm)', background: disabled ? 'var(--champagne-100)' : 'var(--white)',
        border: '1px solid ' + bd, boxShadow: f ? '0 0 0 4px var(--focus-ring)' : 'none', transition: 'box-shadow var(--dur-fast), border-color var(--dur-fast)' }}>
        {icon && <span style={{ color: 'var(--ink-500)', paddingTop: multiline ? 15 : 0 }}><Icon name={icon} size={18} /></span>}
        {multiline ? <textarea rows={rows} {...common} /> : <input type={type} {...common} />}
      </span>
      {(error || hint) && <span style={{ fontSize: 13, color: error ? 'var(--danger-600)' : 'var(--ink-500)' }}>{error || hint}</span>}
    </label>
  );
}

export function Select({ label, options = [], value, defaultValue, onChange, icon, hint, name }) {
  const [f, setF] = React.useState(false);
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'var(--font-sans)' }}>
      {label && <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-700)' }}>{label}</span>}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 16px', borderRadius: 'var(--radius-sm)', background: 'var(--white)',
        border: '1px solid ' + (f ? 'var(--gold-500)' : 'var(--border-strong)'), boxShadow: f ? '0 0 0 4px var(--focus-ring)' : 'none', transition: 'box-shadow var(--dur-fast)' }}>
        {icon && <span style={{ color: 'var(--ink-500)' }}><Icon name={icon} size={18} /></span>}
        <select name={name} value={value} defaultValue={defaultValue} onChange={e => onChange && onChange(e.target.value, e)} onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ flex: 1, minWidth: 0, appearance: 'none', WebkitAppearance: 'none', border: 0, outline: 0, background: 'transparent', font: 'inherit', fontSize: 16, fontWeight: 300, color: 'var(--ink-900)', cursor: 'pointer', paddingRight: 24, boxShadow: 'none' }}>
          {options.map(o => { const v = typeof o === 'string' ? o : o.value; const l = typeof o === 'string' ? o : o.label; return <option key={v} value={v}>{l}</option>; })}
        </select>
        <span style={{ position: 'absolute', right: 14, pointerEvents: 'none', color: 'var(--ink-500)' }}><Icon name="ChevronDown" size={18} /></span>
      </span>
      {hint && <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>{hint}</span>}
    </label>
  );
}

export function Switch({ checked, onChange, label, description, disabled }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1, fontFamily: 'var(--font-sans)' }}>
      {(label || description) && <span style={{ display: 'flex', flexDirection: 'column' }}>
        {label && <span style={{ fontSize: 15, color: 'var(--ink-900)' }}>{label}</span>}
        {description && <span style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 300 }}>{description}</span>}
      </span>}
      <span role="switch" aria-checked={!!checked} tabIndex={disabled ? -1 : 0} onClick={() => !disabled && onChange && onChange(!checked)} onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), !disabled && onChange && onChange(!checked))}
        style={{ position: 'relative', width: 46, height: 26, flexShrink: 0, borderRadius: 999, background: checked ? 'var(--maroon-600)' : 'var(--champagne-400)', transition: 'background var(--dur-base)' }}>
        <span style={{ position: 'absolute', top: 3, left: checked ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: checked ? 'var(--gold-300)' : 'var(--white)', boxShadow: 'var(--shadow-1)', transition: 'left var(--dur-base) var(--ease-out)' }}></span>
      </span>
    </label>
  );
}

export function Slider({ label, min = 0, max = 100, step = 1, value, onChange, format }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: 'var(--font-sans)' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-700)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--maroon-600)', fontWeight: 600 }}>{format ? format(value) : value}</span>
      </span>
      <span style={{ position: 'relative', height: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 4, background: 'var(--champagne-200)' }}></span>
        <span style={{ position: 'absolute', left: 0, width: pct + '%', height: 4, borderRadius: 4, background: 'linear-gradient(90deg,var(--gold-500),var(--maroon-600))' }}></span>
        <span style={{ position: 'absolute', left: 'calc(' + pct + '% - 11px)', width: 22, height: 22, borderRadius: '50%', background: 'var(--white)', border: '2px solid var(--gold-500)', boxShadow: 'var(--shadow-2)', pointerEvents: 'none' }}></span>
        <input type="range" min={min} max={max} step={step} value={value} aria-label={label} onChange={e => onChange && onChange(Number(e.target.value))}
          style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', margin: 0 }} />
      </span>
    </label>
  );
}

export function Dock({ children, style }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: 8, borderRadius: 999, background: 'rgba(30,17,20,.5)', backdropFilter: 'blur(18px) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      border: '1px solid var(--border-glass)', boxShadow: 'var(--shadow-glass)', color: 'var(--text-on-dark)', ...style }}>
      {React.Children.toArray(children).map((c, i) => <React.Fragment key={i}>{i > 0 && <span style={{ width: 1, alignSelf: 'stretch', margin: '6px 2px', background: 'var(--border-glass)' }}></span>}{c}</React.Fragment>)}
    </div>
  );
}

export function SegmentedControl({ options = [], value, onChange, tone = 'dark', size = 'md' }) {
  const dark = tone === 'dark', h = size === 'sm' ? 34 : 40;
  return (
    <div role="radiogroup" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 2, padding: 3, borderRadius: 999, background: dark ? 'rgba(255,248,236,.08)' : 'var(--champagne-100)', border: '1px solid ' + (dark ? 'var(--border-glass)' : 'var(--border-subtle)') }}>
      {options.map(o => { const v = o.value ?? o, l = o.label ?? o, on = v === value; return (
        <button key={v} type="button" role="radio" aria-checked={on} onClick={() => onChange && onChange(v)} title={o.title || l}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 7, height: h - 6, padding: o.label === '' ? '0 10px' : '0 14px', borderRadius: 999, border: 0, cursor: 'pointer', fontFamily: 'var(--font-sans)', fontSize: 13, whiteSpace: 'nowrap',
            background: on ? (dark ? 'linear-gradient(180deg,var(--gold-300),var(--gold-500))' : 'var(--white)') : 'transparent', color: on ? 'var(--ink-900)' : dark ? 'var(--text-on-dark)' : 'var(--ink-700)',
            boxShadow: on ? 'var(--shadow-1)' : 'none', transition: 'background var(--dur-fast)' }}>
          {o.icon && <Icon name={o.icon} size={15} />}{l}
        </button>); })}
    </div>
  );
}

export function GlassPanel({ tone = 'dark', radius = 'var(--radius-lg)', padding = 24, children, style }) {
  const dark = tone === 'dark';
  return (
    <div style={{ background: dark ? 'var(--surface-glass)' : 'var(--surface-glass-light)', backdropFilter: 'blur(var(--blur-glass)) saturate(140%)', WebkitBackdropFilter: 'blur(18px) saturate(140%)',
      border: '1px solid ' + (dark ? 'var(--border-glass)' : 'rgba(255,255,255,.7)'), borderRadius: radius, padding, boxShadow: 'var(--shadow-glass)', color: dark ? 'var(--text-on-dark)' : 'var(--ink-900)', ...style }}>
      {children}
    </div>
  );
}

export function InspectCard({ eyebrow, title, description, image, children, footer, onClose, closeLabel = 'Close', style }) {
  return (
    <GlassPanel padding={0} style={{ width: 360, maxWidth: '100%', overflow: 'hidden', ...style }}>
      {image && <div style={{ height: 150, background: 'url(' + image + ') center/cover' }}></div>}
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            {eyebrow && <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gold-300)', fontWeight: 500, marginBottom: 6 }}>{eyebrow}</div>}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1.05, fontWeight: 500 }}>{title}</div>
          </div>
          {onClose && <IconButton icon="X" label={closeLabel} size={36} onClick={onClose} />}
        </div>
        {description && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: 'var(--text-on-dark-muted)', fontWeight: 300 }}>{description}</p>}
        {children}
        {footer && <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 14 }}>{footer}</div>}
      </div>
    </GlassPanel>
  );
}

export function TestimonialCard({ quote, name, event, rating = 5 }) {
  return (
    <figure style={{ margin: 0, minWidth: 0, overflowWrap: 'anywhere', padding: 32, background: 'var(--surface-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 20, boxShadow: 'var(--shadow-1)' }}>
      <div style={{ display: 'flex', gap: 3, color: 'var(--gold-500)' }} aria-label={`${rating}/5`}>{Array.from({ length: rating }).map((_, i) => <Icon key={i} name="Star" size={16} style={{ fill: 'var(--gold-500)' }} />)}</div>
      <blockquote style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.3, color: 'var(--ink-900)', fontStyle: 'italic', textWrap: 'pretty' }}>“{quote}”</blockquote>
      <figcaption style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 'auto' }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink-900)' }}>{name}</span>
        {event && <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>{event}</span>}
      </figcaption>
    </figure>
  );
}

export function CursorBadge({ label, icon = 'Sparkles', visible = true, x, y, style }) {
  const pos = x != null ? { position: 'fixed', left: x, top: y, transform: 'translate(18px,18px) scale(' + (visible ? 1 : .6) + ')', pointerEvents: 'none', zIndex: 60 } : {};
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px 0 6px', borderRadius: 999, background: 'rgba(30,17,20,.55)', backdropFilter: 'blur(14px) saturate(150%)', WebkitBackdropFilter: 'blur(14px) saturate(150%)',
      border: '1px solid var(--border-gold)', color: 'var(--text-on-dark)', fontFamily: 'var(--font-sans)', fontSize: 13, letterSpacing: '.04em', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,.3)',
      opacity: visible ? 1 : 0, transition: 'opacity var(--dur-fast), transform var(--dur-base) var(--ease-out)', transformOrigin: 'top left', ...pos, ...style }}>
      <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg,var(--gold-300),var(--gold-500))', color: 'var(--ink-900)' }}><Icon name={icon} size={14} /></span>
      {label}
    </div>
  );
}

export function PackageCard({ image, tier, name, price, priceNote, features = [], featured, badge, cta = 'Enquire', onSelect, href }) {
  const [h, setH] = React.useState(false);
  return (
    <article onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', flexDirection: 'column', background: featured ? 'var(--ink-900)' : 'var(--surface-card)', color: featured ? 'var(--text-on-dark)' : 'var(--ink-900)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        border: '1px solid ' + (featured ? 'rgba(212,168,69,.45)' : 'var(--border-subtle)'), boxShadow: h ? 'var(--shadow-3)' : 'var(--shadow-1)', transform: h ? 'translateY(-4px)' : 'none', transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base)' }}>
      <div style={{ position: 'relative', aspectRatio: '4/3', background: image ? 'url(' + image + ') center/cover' : 'var(--champagne-200)', overflow: 'hidden' }}>
        {badge && <Badge tone={featured ? 'gold' : 'neutral'} style={{ position: 'absolute', top: 16, left: 16, background: featured ? 'rgba(30,17,20,.7)' : 'rgba(255,255,255,.9)', color: featured ? 'var(--gold-300)' : undefined }}>{badge}</Badge>}
      </div>
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>
        <div>
          {tier && <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: featured ? 'var(--gold-300)' : 'var(--gold-700)', fontWeight: 500 }}>{tier}</div>}
          <h3 style={{ margin: '6px 0 0', fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1.1, fontWeight: 500, color: 'inherit' }}>{href ? <a href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{name}</a> : name}</h3>
        </div>
        {price && <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, color: featured ? 'var(--gold-300)' : 'var(--maroon-600)' }}>{price}</span>{priceNote && <span style={{ fontSize: 13, opacity: .7 }}>{priceNote}</span>}</div>}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {features.map(f => <li key={f} style={{ display: 'flex', gap: 10, fontSize: 15, fontWeight: 300, lineHeight: 1.4 }}><span style={{ color: featured ? 'var(--gold-300)' : 'var(--gold-500)', paddingTop: 1 }}><Icon name="Check" size={16} /></span>{f}</li>)}
        </ul>
        <Button variant={featured ? 'gold' : 'secondary'} fullWidth iconRight="ArrowRight" onClick={onSelect}>{cta}</Button>
      </div>
    </article>
  );
}
