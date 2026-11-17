'use client';

// Admin → 3D Design: manage the elements of the homepage 3D stage
// ("3D வடிவமைப்பு") — names, hover labels, detail cards, lighting-mode names,
// visibility and the colour options offered for each element.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, BilingualField, Alert, Toggle, apiFetch, errorText } from './ui';
import { STAGE_IMG, HOTSPOTS, ELEMENT_KEYS, PANEL_KEYS, LIGHT_KEYS, OPTION_GROUPS, MAX_OPTIONS, defaultStageDesign } from '@/lib/stage-design';

const ELEMENT_PANEL = Object.fromEntries(HOTSPOTS.map((h) => [h.key, h.panel]));

export default function StageDesignForm({ initial }) {
  const { t, lang } = useAdmin();
  const s = t.stageDesign;
  const router = useRouter();
  const [form, setForm] = useState(() => structuredClone(initial));
  const [state, setState] = useState({ busy: false, error: '', ok: '' });

  const update = (fn) =>
    setForm((f) => {
      const next = structuredClone(f);
      fn(next);
      return next;
    });

  const save = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', ok: '' });
    try {
      const { item } = await apiFetch('/api/admin/stage-design', { method: 'PUT', body: form });
      setForm(item);
      setState({ busy: false, error: '', ok: t.common.saved });
      router.refresh();
    } catch (err) {
      setState({ busy: false, error: errorText(err, t), ok: '' });
    }
  };

  const restore = () => {
    if (window.confirm(s.restoreConfirm)) setForm(defaultStageDesign());
  };

  const addOption = (g) =>
    update((f) => {
      const list = f.options[g];
      if (list.length >= MAX_OPTIONS) return;
      let n = list.length + 1;
      while (list.some((o) => o.v === `c${n}`)) n++;
      list.push({ v: `c${n}`, enabled: true, color: '#D4A845', accent: g === 'seat' || g === 'floor' ? '' : '#FDFAF4', label: { ta: '', en: '' } });
    });

  const numberOf = (key) => ELEMENT_KEYS.indexOf(key) + 1;
  const pickL = (o) => o?.[lang] || o?.en || '';

  return (
    <form onSubmit={save} className="space-y-6">
      <Card title={s.preview}>
        <div className="relative mx-auto aspect-video w-full max-w-4xl overflow-hidden rounded-md bg-ink-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={STAGE_IMG} alt="" className="absolute inset-0 h-full w-full object-cover" />
          {HOTSPOTS.map((h) => {
            const on = form.elements[h.key].enabled;
            return (
              <div
                key={h.id}
                title={pickL(form.elements[h.key].name)}
                className="absolute flex items-start justify-start"
                style={{
                  left: h.box.x + '%',
                  top: h.box.y + '%',
                  width: h.box.w + '%',
                  height: h.box.h + '%',
                  zIndex: h.z,
                  borderRadius: h.radius,
                  border: on ? '1.5px solid rgba(242,210,122,.95)' : '1.5px dashed rgba(255,255,255,.55)',
                  background: on ? 'rgba(242,210,122,.10)' : 'rgba(30,17,20,.35)',
                }}
              >
                <span className={`m-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${on ? 'bg-gold-300 text-ink-900' : 'bg-white/70 text-ink-700'}`}>{numberOf(h.key)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-ink-500">{s.previewHint}</p>
      </Card>

      <Card title={s.elements}>
        <ul className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {ELEMENT_KEYS.map((k) => {
            const el = form.elements[k];
            return (
              <li key={k} className="grid gap-4 py-5 first:pt-0 last:pb-0 lg:grid-cols-[220px_1fr]">
                <div className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500/20 text-[13px] font-semibold text-gold-700">{numberOf(k)}</span>
                  <div className="space-y-2">
                    <p className="font-medium text-ink-900">{pickL(el.name)}</p>
                    <p className="text-[12.5px] text-ink-500">{s.panelNames[ELEMENT_PANEL[k]]}</p>
                    <Toggle id={`el-${k}`} checked={el.enabled} onChange={(v) => update((f) => (f.elements[k].enabled = v))} label={s.show} />
                  </div>
                </div>
                <div className="grid gap-4">
                  <BilingualField label={s.name} value={el.name} maxLength={80} onChange={(v) => update((f) => (f.elements[k].name = v))} />
                  <BilingualField label={s.action} value={el.action} maxLength={60} onChange={(v) => update((f) => (f.elements[k].action = v))} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {OPTION_GROUPS.map((g) => {
        const list = form.options[g];
        const twoTone = g === 'flora' || g === 'valance';
        return (
          <Card
            key={g}
            title={`${s.options} — ${s.groups[g]}`}
            actions={
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => addOption(g)} disabled={list.length >= MAX_OPTIONS}>
                <Plus className="h-4 w-4" /> {s.addColor}
              </button>
            }
          >
            <ul className="grid gap-3 xl:grid-cols-2">
              {list.map((o, i) => (
                <li key={o.v} className={`flex flex-wrap items-start gap-3 rounded-md border p-3 ${o.enabled ? '' : 'opacity-60'}`} style={{ borderColor: 'var(--border-subtle)' }}>
                  <span
                    aria-hidden
                    className="mt-1 h-10 w-10 shrink-0 rounded-full border-2"
                    style={{ borderColor: 'var(--border-strong)', background: twoTone ? `linear-gradient(135deg, ${o.color} 50%, ${o.accent || '#FDFAF4'} 50%)` : o.color }}
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input className="field !min-h-[36px] !py-1 text-[13px]" lang="ta" placeholder={`${s.label} (TA)`} maxLength={40} value={o.label.ta} onChange={(e) => update((f) => (f.options[g][i].label.ta = e.target.value))} />
                      <input className="field !min-h-[36px] !py-1 text-[13px]" placeholder={`${s.label} (EN)`} maxLength={40} value={o.label.en} onChange={(e) => update((f) => (f.options[g][i].label.en = e.target.value))} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-ink-700">
                      {i === 0 && <span className="rounded bg-champagne-100 px-2 py-1 text-[12px]">{s.original}</span>}
                      <label className="flex items-center gap-1.5">
                        {s.color}
                        <input type="color" className="h-8 w-10 cursor-pointer rounded border" value={o.color} onChange={(e) => update((f) => (f.options[g][i].color = e.target.value.toUpperCase()))} />
                      </label>
                      {twoTone && (
                        <label className="flex items-center gap-1.5">
                          {s.accent}
                          <input type="color" className="h-8 w-10 cursor-pointer rounded border" value={o.accent || '#FDFAF4'} onChange={(e) => update((f) => (f.options[g][i].accent = e.target.value.toUpperCase()))} />
                        </label>
                      )}
                      {i > 0 && <Toggle id={`opt-${g}-${o.v}`} checked={o.enabled} onChange={(v) => update((f) => (f.options[g][i].enabled = v))} label={s.show} />}
                    </div>
                  </div>
                  {i > 0 && (
                    <button type="button" className="rounded-md p-2 text-danger hover:bg-danger/10" aria-label={t.common.remove} onClick={() => update((f) => f.options[g].splice(i, 1))}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        );
      })}

      <Card title={s.panels}>
        <div className="grid gap-6">
          {PANEL_KEYS.map((k) => (
            <fieldset key={k} className="grid gap-3 rounded-md border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <legend className="px-1 text-[13px] font-semibold text-ink-900">{s.panelNames[k]}</legend>
              <BilingualField label={s.panelTitle} value={form.panels[k].title} maxLength={60} onChange={(v) => update((f) => (f.panels[k].title = v))} />
              <BilingualField label={s.panelDesc} value={form.panels[k].description} multiline rows={3} maxLength={500} onChange={(v) => update((f) => (f.panels[k].description = v))} />
            </fieldset>
          ))}
        </div>
      </Card>

      <Card title={s.lights}>
        <div className="grid gap-6">
          {LIGHT_KEYS.map((k) => (
            <fieldset key={k} className="grid gap-3 rounded-md border p-4" style={{ borderColor: 'var(--border-subtle)' }}>
              <legend className="px-1 text-[13px] font-semibold text-ink-900">{s.lightNames[k]}</legend>
              <BilingualField label={s.lightShort} value={form.lights[k].short} maxLength={30} onChange={(v) => update((f) => (f.lights[k].short = v))} />
              <BilingualField label={s.lightLong} value={form.lights[k].long} maxLength={80} onChange={(v) => update((f) => (f.lights[k].long = v))} />
            </fieldset>
          ))}
        </div>
      </Card>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6" style={{ borderColor: 'var(--border-subtle)' }}>
        <button type="submit" className="btn btn-primary" disabled={state.busy}>
          {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {state.busy ? t.common.saving : t.common.save}
        </button>
        <button type="button" className="btn btn-secondary" onClick={restore}>
          <RotateCcw className="h-4 w-4" /> {s.restore}
        </button>
        <div className="min-w-0 flex-1">
          <Alert kind="error">{state.error}</Alert>
          <Alert kind="ok">{state.ok}</Alert>
        </div>
      </div>
    </form>
  );
}
