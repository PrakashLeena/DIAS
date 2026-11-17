'use client';

// Interactive stage hero — ported 1:1 from /_design/ui_kits/website/StageHero.jsx.
// Changes: text comes from lib/i18n/home-ui.js (Tamil/English) merged with the
// admin's 3D Design settings (lib/stage-design.js), the background is a 4-photo
// slideshow whose first slide is the interactive stage, and browser-only values
// (window size) are read after mount for server rendering.
import React from 'react';
import { Dock, SegmentedControl, ChoiceChip, InspectCard, CursorBadge, Button } from './ds';
import { STAGE_IMG, SLIDES, HOTSPOTS } from '@/lib/stage-design';

const PULSE = { valance: [31, 13], archL: [12, 30], chandR: [78, 36], seat: [50.5, 67], floor: [63, 94] };
const SLIDE_MS = 6500;

const LIGHT = [
  { value: 'bright', icon: 'Sun' },
  { value: 'candle', icon: 'Flame' },
  { value: 'golden', icon: 'Sunset' },
];
const LIGHT_FX = {
  bright: { filter: 'brightness(1.04) saturate(1.04)', overlay: 'none', blend: 'normal', glow: .5, cursor: .22 },
  candle: { filter: 'brightness(.56) saturate(1.18) contrast(1.08)', overlay: 'radial-gradient(ellipse at 50% 62%, rgba(255,170,80,.22), rgba(30,10,4,.4) 85%)', blend: 'multiply', glow: 1, cursor: .34 },
  golden: { filter: 'brightness(.93) saturate(1.22) sepia(.16)', overlay: 'linear-gradient(180deg, rgba(255,186,96,.34), rgba(255,120,40,.2))', blend: 'soft-light', glow: .78, cursor: .28 },
};
const GLOWS = [
  ...[[66, 372], [100, 388], [132, 410], [165, 428], [197, 444], [1093, 452], [1127, 437], [1163, 420], [1200, 398], [1243, 378]].map(p => [...p, 3.4]),
  [300, 266, 9], [652, 318, 9], [1000, 262, 9],
  ...[[472, 418], [530, 383], [587, 334], [718, 334], [768, 388], [808, 412]].map(p => [...p, 2.4]),
  [432, 642, 6], [906, 644, 6],
];

const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
function buildMasks(d, W, H) {
  const rose = [], turf = [], seat = [], val = [];
  const kx = 1280 / W, ky = 720 / H;
  for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
    const i = (py * W + px) * 4, r = d[i], g = d[i + 1], b = d[i + 2], x = px * kx, y = py * ky;
    if (y >= (x > 1075 ? 140 : 162) && y <= 588) { const m = r - Math.max(g, b); if (r > 105 && m > 45 && g < 130) rose.push(i, clamp01((m - 45) / 45)); }
    if (y >= 598) { const m = g - Math.max(r, b); if (m > 18) turf.push(i, clamp01((m - 18) / 25)); }
    if (x >= 500 && x <= 820 && y >= 462 && y <= 596) { const c = r - b; if (r > 140 && g > 115 && c > 28 && c < 120 && r - g < 45) seat.push(i, clamp01((c - 28) / 18)); }
    if (y <= 168 && x >= 148 && x <= 1145) { if (r > 80 && r - g > 40 && r - b > 10) val.push(i, clamp01((r - g - 40) / 30)); }
  }
  return { rose: Float32Array.from(rose), turf: Float32Array.from(turf), seat: Float32Array.from(seat), val: Float32Array.from(val) };
}
function recolor(out, src, list, T, ref) {
  if (!T) return;
  for (let k = 0; k < list.length; k += 2) {
    const i = list[k], w = list[k + 1];
    const L = .299 * src[i] + .587 * src[i + 1] + .114 * src[i + 2];
    const s = Math.min(1.25, Math.max(.25, .45 + .55 * L / ref));
    out[i] = src[i] + (T[0] * s - src[i]) * w; out[i + 1] = src[i + 1] + (T[1] * s - src[i + 1]) * w; out[i + 2] = src[i + 2] + (T[2] * s - src[i + 2]) * w;
  }
}

export default function StageHero({ t, brand, onBook, onPackages, tourSignal, flora, setFlora, options, enabled }) {
  const { flora: FLORA, seat: SEAT, floor: FLOOR, valance: VALANCE } = options;
  const spots = React.useMemo(() => HOTSPOTS.filter(h => enabled[h.key] !== false), [enabled]);
  const heroRef = React.useRef(), stageRef = React.useRef(), camRef = React.useRef(), canvasRef = React.useRef(), badgeRef = React.useRef();
  const data = React.useRef(null);
  const [progress, setProgress] = React.useState(6);
  const [ready, setReady] = React.useState(false);
  const [hover, setHover] = React.useState(null);
  const [focus, setFocus] = React.useState(null);
  const [light, setLight] = React.useState('bright');
  const [seat, setSeat] = React.useState(SEAT[0].v);
  const [floor, setFloor] = React.useState(FLOOR[0].v);
  const [valance, setValance] = React.useState(VALANCE[0].v);
  const [slide, setSlide] = React.useState(0);
  const [tour, setTour] = React.useState(false);
  const [compact, setCompact] = React.useState(false);
  const [mobile, setMobile] = React.useState(false);
  const motion = React.useRef({ mx: 0, my: 0, cx: 0, cy: 0, tx: 0, ty: 0, ts: 1.06, x: 0, y: 0, s: 1.06, init: false });

  React.useEffect(() => {
    const img = new Image(); img.src = STAGE_IMG;
    const t = setInterval(() => setProgress(p => p < 38 ? p + 4 : p), 60);
    img.onload = () => {
      clearInterval(t); setProgress(55);
      setTimeout(() => {
        const c = canvasRef.current; if (!c) return;
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, c.width, c.height);
        data.current = { ctx, src: new Uint8ClampedArray(id.data), id, masks: buildMasks(id.data, c.width, c.height) };
        setProgress(100); setTimeout(() => setReady(true), 650);
      }, 40);
    };
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    const D = data.current; if (!D) return;
    const out = D.id.data; out.set(D.src);
    const T = (list, v) => (list.find(f => f.v === v) || list[0]).T;
    recolor(out, D.src, D.masks.rose, T(FLORA, flora), 76);
    recolor(out, D.src, D.masks.turf, T(FLOOR, floor), 125);
    recolor(out, D.src, D.masks.seat, T(SEAT, seat), 175);
    recolor(out, D.src, D.masks.val, T(VALANCE, valance), 72);
    D.ctx.putImageData(D.id, 0, 0);
  }, [flora, floor, seat, valance, progress, FLORA, FLOOR, SEAT, VALANCE]);

  // Background slideshow: preload the other photos once the stage is ready, then
  // cross-fade every few seconds. Inspecting an element or the guided tour pins
  // the interactive stage (slide 1), whose hotspots match that photo only.
  React.useEffect(() => { if (ready) SLIDES.slice(1).forEach(src => { const i = new Image(); i.src = src; }); }, [ready]);
  React.useEffect(() => {
    if (!ready || focus || tour) return;
    const id = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [ready, focus, tour]);
  React.useEffect(() => { if (focus || tour) setSlide(0); }, [focus, tour]);
  const onStage = slide === 0;

  const computeTarget = React.useCallback((hs) => {
    const M = motion.current, hero = heroRef.current, st = stageRef.current; if (!hero || !st) return;
    const VW = hero.clientWidth, VH = hero.clientHeight, W = st.offsetWidth, H = st.offsetHeight, offL = (VW - W) / 2, offT = (VH - H) / 2;
    if (!hs) { M.ts = 1.06; M.tx = -(M.ts - 1) * W / 2; M.ty = -(M.ts - 1) * H / 2; return; }
    const s = hs.zoom, px = (hs.box.x + hs.box.w / 2) / 100 * W, py = (hs.box.y + hs.box.h / 2) / 100 * H;
    const narrow = VW < 640, right = (hs.box.x + hs.box.w / 2) < 50;
    const fx = narrow ? .5 : right ? .3 : .7, fy = narrow ? .32 : .5;
    let tx = fx * VW - offL - s * px, ty = fy * VH - offT - s * py;
    tx = Math.min(-offL, Math.max(VW - offL - s * W, tx)); ty = Math.min(-offT, Math.max(VH - offT - s * H, ty));
    M.ts = s; M.tx = tx; M.ty = ty;
  }, []);

  React.useEffect(() => { computeTarget(HOTSPOTS.find(h => h.id === focus)); }, [focus, computeTarget]);

  React.useEffect(() => {
    let raf;
    const size = () => { setCompact(window.innerWidth < 900); setMobile(window.innerWidth < 640); };
    const onResize = () => { size(); computeTarget(HOTSPOTS.find(h => h.id === focus)); };
    size();
    window.addEventListener('resize', onResize);
    const M = motion.current;
    if (!M.init) { computeTarget(null); M.x = M.tx; M.y = M.ty; M.init = true; }
    const loop = () => {
      M.cx += (M.mx - M.cx) * .06; M.cy += (M.my - M.cy) * .06;
      M.x += (M.tx - M.x) * .075; M.y += (M.ty - M.y) * .075; M.s += (M.ts - M.s) * .075;
      const k = focus ? .35 : 1;
      if (camRef.current) camRef.current.style.transform = `translate3d(${M.x - M.cx * 16 * k}px,${M.y - M.cy * 10 * k}px,0) scale(${M.s})`;
      if (stageRef.current) stageRef.current.style.transform = `translate(-50%,-50%) rotateY(${M.cx * 1.3 * k}deg) rotateX(${-M.cy * .9 * k}deg)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, [focus, computeTarget]);

  React.useEffect(() => {
    if (!tour) return;
    const seq = ['seat', 'archL', 'chandC', 'floor', 'valance'].filter(id => spots.some(h => h.id === id));
    if (!seq.length) return;
    let i = 0; setFocus(seq[0]);
    const t = setInterval(() => { i = (i + 1) % seq.length; setFocus(seq[i]); }, 3400);
    return () => clearInterval(t);
  }, [tour, spots]);
  React.useEffect(() => { if (tourSignal) setTour(true); }, [tourSignal]);
  React.useEffect(() => { const k = e => { if (e.key === 'Escape') { setFocus(null); setTour(false); } }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);

  const onMove = e => {
    const r = heroRef.current.getBoundingClientRect(), M = motion.current;
    M.mx = ((e.clientX - r.left) / r.width - .5) * 2; M.my = ((e.clientY - r.top) / r.height - .5) * 2;
    heroRef.current.style.setProperty('--lx', (e.clientX - r.left) + 'px'); heroRef.current.style.setProperty('--ly', (e.clientY - r.top) + 'px');
    if (badgeRef.current) badgeRef.current.style.transform = `translate(${e.clientX + 18}px,${e.clientY + 18}px)`;
  };
  const pick = (id, e) => { e.stopPropagation(); setTour(false); setFocus(id); setHover(null); };
  const reset = () => { setFocus(null); setTour(false); };
  const fx = LIGHT_FX[light];
  const hs = HOTSPOTS.find(h => h.id === focus);
  const hovered = HOTSPOTS.find(h => h.id === hover);
  const panel = hs && t.panels[hs.panel];
  const cardRight = hs && (hs.box.x + hs.box.w / 2) < 50;

  const chips = hs && {
    seat: SEAT.map(o => <ChoiceChip key={o.v} tone="dark" label={t.seat[o.v]} swatch={o.sw} selected={seat === o.v} onClick={() => setSeat(o.v)} />),
    florals: FLORA.map(o => <ChoiceChip key={o.v} tone="dark" label={t.flora[o.v]} swatch={o.sw} selected={flora === o.v} onClick={() => setFlora(o.v)} />),
    lighting: LIGHT.map(o => <ChoiceChip key={o.value} tone="dark" label={t.light[o.value][1]} selected={light === o.value} onClick={() => setLight(o.value)} />),
    floor: FLOOR.map(o => <ChoiceChip key={o.v} tone="dark" label={t.floor[o.v]} swatch={o.sw} selected={floor === o.v} onClick={() => setFloor(o.v)} />),
    drapes: VALANCE.map(o => <ChoiceChip key={o.v} tone="dark" label={t.valance[o.v]} swatch={o.sw} selected={valance === o.v} onClick={() => setValance(o.v)} />),
  }[hs.panel];

  return (
    <section id="stages" data-screen-label="Hero stage" ref={heroRef} onMouseMove={onMove} onPointerDown={e => e.pointerType === 'touch' && onMove(e)} onPointerMove={e => e.pointerType === 'touch' && onMove(e)} onClick={reset}
      style={{ position: 'relative', height: '100vh', minHeight: 600, overflow: 'hidden', background: 'var(--ink-900)', perspective: '1600px', touchAction: 'pan-y' }}>
      <div ref={stageRef} style={{ position: 'absolute', left: '50%', top: '50%', width: 'max(100%, 177.78vh)', aspectRatio: '16/9', minWidth: 1066, transformStyle: 'preserve-3d', willChange: 'transform', transform: 'translate(-50%,-50%)' }}>
        <div ref={camRef} style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', willChange: 'transform' }}>
          <canvas ref={canvasRef} role="img" aria-label={t.hotspots.archC[1]} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', filter: fx.filter, transition: 'filter 900ms var(--ease-out)' }}></canvas>
          {SLIDES.slice(1).map((src, i) => { const on = slide === i + 1; return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={ready ? src : undefined} alt="" aria-hidden="true" draggable={false} className={'sd-slide' + (on ? ' sd-slide-on' : '')}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none', opacity: on ? 1 : 0, filter: fx.filter }} />); })}
          <div style={{ position: 'absolute', inset: 0, background: fx.overlay, mixBlendMode: fx.blend, transition: 'opacity 900ms', pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen', opacity: onStage ? fx.glow : 0, transition: 'opacity 1400ms' }}>
            {GLOWS.map(([x, y, s], i) => <span key={i} className={'sd-flicker' + (s > 8 && (hover || '').startsWith('chand') ? ' sd-sway' : '')} style={{ position: 'absolute', left: (x / 12.8) + '%', top: (y / 7.2) + '%', width: s + '%', aspectRatio: '1', transform: 'translate(-50%,-50%)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,226,160,.95) 0%, rgba(255,186,90,.45) 30%, rgba(255,150,60,0) 70%)', animationDelay: (i * 0.37 % 2) + 's' }}></span>)}
          </div>
          {onStage && spots.map(h => { const on = hover === h.id || focus === h.id; return (
            <div key={h.id} onMouseEnter={() => setHover(h.id)} onMouseLeave={() => setHover(v => v === h.id ? null : v)} onClick={e => pick(h.id, e)}
              style={{ position: 'absolute', left: h.box.x + '%', top: h.box.y + '%', width: h.box.w + '%', height: h.box.h + '%', zIndex: h.z, cursor: 'none', borderRadius: h.radius,
                boxShadow: on ? '0 0 0 1.5px rgba(242,210,122,.85), 0 0 30px 6px rgba(242,190,80,.35), inset 0 0 40px rgba(255,220,150,.18)' : '0 0 0 0 transparent',
                background: on ? 'rgba(255,226,170,.05)' : 'transparent', transition: 'box-shadow 320ms var(--ease-out), background 320ms' }}></div>); })}
          {!focus && ready && onStage && Object.entries(PULSE).filter(([id]) => spots.some(h => h.id === id)).map(([id, [x, y]]) => <span key={id} className="sd-pulse" style={{ position: 'absolute', left: x + '%', top: y + '%', zIndex: 6, pointerEvents: 'none', opacity: hover ? 0 : 1, transition: 'opacity 300ms' }}></span>)}
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(circle 260px at var(--lx,50%) var(--ly,50%), rgba(255,214,150,${fx.cursor}), transparent 70%)`, mixBlendMode: 'screen' }}></div>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 120% 90% at 50% 45%, transparent 55%, rgba(20,8,10,.55) 100%)' }}></div>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(90deg, rgba(20,8,10,.72) 0%, rgba(20,8,10,.35) 30%, transparent 52%), linear-gradient(0deg, rgba(20,8,10,.55), transparent 32%)', opacity: focus ? 0 : 1, transition: 'opacity 600ms' }}></div>
      <div className="sd-mobile-scrim" style={{ opacity: focus ? 0 : 1 }}></div>

      <div style={{ position: 'absolute', left: 'clamp(20px,5vw,72px)', bottom: compact ? 132 : 140, maxWidth: 560, color: 'var(--text-on-dark)', opacity: focus || !ready ? 0 : 1, transform: focus || !ready ? 'translateY(16px)' : 'none', transition: 'opacity 700ms var(--ease-out), transform 700ms var(--ease-out)', pointerEvents: focus ? 'none' : 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="sd-hero-deco sd-hero-eyebrow" style={{ fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gold-300)', fontWeight: 500, marginBottom: 14 }}>{t.hero.eyebrow}</div>
        <h1 className="sd-hero-title sd-hero-deco" style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'clamp(44px,6vw,88px)', lineHeight: 1.0, letterSpacing: '-.01em', textWrap: 'balance', color: 'var(--text-on-dark)' }}>{t.hero.title[0]}<i style={{ color: 'var(--flame-200)' }}>{t.hero.title[1]}</i></h1>
        <p style={{ margin: '18px 0 26px', fontSize: 17, fontWeight: 300, lineHeight: 1.55, color: 'var(--text-on-dark-muted)', maxWidth: 440 }}>{t.hero.intro}</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Button variant="gold" iconRight="ArrowRight" onClick={onBook}>{t.hero.book}</Button><Button variant="glass" onClick={onPackages}>{t.hero.packages}</Button></div>
      </div>

      {hs && <div key={hs.id} className="sd-card-in" onClick={e => e.stopPropagation()}
        style={{ position: 'absolute', zIndex: 20, ...(mobile ? { left: 12, right: 12, bottom: 96 } : { top: '50%', transform: 'translateY(-50%)', [cardRight ? 'right' : 'left']: 'clamp(20px,4vw,64px)' }) }}>
        <InspectCard eyebrow={panel[0]} title={t.hotspots[hs.key][1]} description={panel[1]} onClose={reset} closeLabel={t.hero.close} style={mobile ? { width: '100%' } : null}
          footer={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><span style={{ fontSize: 13, color: 'var(--text-on-dark-muted)' }}>{t.hero.includedIn}</span><Button variant="gold" size="sm" onClick={onBook}>{t.hero.addToQuote}</Button></div>}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{chips}</div>
        </InspectCard>
      </div>}

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, display: 'flex', justifyContent: 'center', zIndex: 25, padding: '0 12px', opacity: ready ? 1 : 0, transition: 'opacity 700ms 200ms' }} onClick={e => e.stopPropagation()}>
        <Dock style={{ maxWidth: '100%', overflowX: 'auto' }}>
          <SegmentedControl value={light} onChange={setLight} options={LIGHT.map(o => ({ ...o, label: compact ? '' : t.light[o.value][0], title: t.light[o.value][1] }))} />
        </Dock>
      </div>

      <div ref={badgeRef} style={{ position: 'fixed', left: 0, top: 0, zIndex: 80, pointerEvents: 'none' }}>
        <CursorBadge label={hovered ? t.hotspots[hovered.key][0] : ''} icon={hovered ? hovered.icon : 'Sparkles'} visible={!!hovered && hover !== focus} />
      </div>

      {!ready && <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'var(--ink-900)', display: 'grid', placeItems: 'center', opacity: progress >= 100 ? 0 : 1, transition: 'opacity 600ms 100ms' }}>
        <div style={{ width: 260, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--flame-200)', fontWeight: 600 }}>{brand[0]}{brand[1] && <> <i style={{ fontWeight: 500 }}>{brand[1]}</i></>}</div>
          <div style={{ marginTop: 22, height: 2, background: 'rgba(255,248,236,.12)', borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg,var(--gold-700),var(--gold-300))', transition: 'width 400ms var(--ease-out)' }}></div></div>
          <div style={{ marginTop: 12, fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--text-on-dark-muted)' }}>{t.hero.loading} · {Math.round(progress)}%</div>
        </div>
      </div>}
    </section>
  );
}
