'use client';

import { useRef, useState } from 'react';
import { BiInput, Check, ImageField, blankL, move, uid, uploadImage } from './fields';

export const newItem = () => ({ id: `i${uid()}`, name: blankL(), image: '', group: blankL() });
export const newSub = () => ({ id: `s${uid()}`, emoji: '📦', name: blankL(), image: '', items: [] });
export const newCategory = () => ({
  id: `cat-${uid()}`,
  emoji: '✨',
  name: blankL(),
  image: '',
  mode: 'items',
  numbered: false,
  numberPrefix: blankL(),
  qtyStepper: true,
  selector: { type: 'preset', options: [], min: 1, max: 18, unit: blankL() },
  note: blankL(),
  items: [],
  subs: [],
});

const MODES = [
  ['items', 'Select items — photos with a Select button (sizes, designs…)'],
  ['sub', 'Sub-categories — buttons that open their own item lists'],
  ['selector', 'Photos + one quantity selector (Chairs, Buffet Set)'],
  ['contact', 'Photos + “contact the owner” notice (Sound, Vehicle)'],
];

function IconBtn({ onClick, disabled, label, children, danger }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className={`grid h-9 w-9 place-items-center rounded-lg border bg-white text-[15px] disabled:opacity-30 ${danger ? 'text-[#B3122E] hover:bg-[#FBE7EA]' : 'hover:bg-champagne-100'}`} style={{ borderColor: 'var(--border-strong)' }}>
      {children}
    </button>
  );
}

export function ItemsEditor({ items, onChange, numbered, prefix, emoji, itemNoun = 'item' }) {
  const bulk = useRef(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const patch = (i, p) => onChange(items.map((it, k) => (k === i ? { ...it, ...p } : it)));

  const bulkUpload = async (files) => {
    setError('');
    const added = [];
    try {
      let n = 0;
      for (const f of files) {
        setBusy(`Uploading ${++n}/${files.length}…`);
        added.push({ ...newItem(), image: await uploadImage(f) });
      }
    } catch (err) {
      setError(err.message);
    }
    if (added.length) onChange([...items, ...added]);
    setBusy('');
    if (bulk.current) bulk.current.value = '';
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={() => onChange([...items, newItem()])}>
          + Add {itemNoun}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => bulk.current?.click()} disabled={!!busy}>
          ⬆ Upload photos (one {itemNoun} per photo)
        </button>
        <input ref={bulk} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => e.target.files?.length && bulkUpload([...e.target.files])} />
        {busy && <span className="text-sm text-ink-500">{busy}</span>}
        <span className="ml-auto text-[13px] text-ink-500">{items.length} {itemNoun}s</span>
      </div>
      {error && <p className="mb-2 text-sm text-[#B3122E]">{error}</p>}
      {!items.length && <p className="rounded-lg bg-champagne-100 p-4 text-center text-sm text-ink-500">No {itemNoun}s yet.</p>}
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={it.id} className="grid gap-3 rounded-xl border bg-white p-3 sm:grid-cols-[150px_1fr_auto]" style={{ borderColor: 'var(--border-subtle)' }}>
            <ImageField compact value={it.image} emoji={emoji} onChange={(image) => patch(i, { image })} />
            <div className="min-w-0 space-y-2.5">
              {numbered ? (
                <p className="rounded-lg bg-champagne-100 px-3 py-2 text-[14px] font-semibold text-ink-900">
                  {`${prefix.ta} ${i + 1}`.trim()} <span className="font-normal text-ink-500">/ {`${prefix.en} ${i + 1}`.trim()}</span>
                  <span className="ml-2 text-[12px] font-normal text-ink-500">(auto-numbered by position)</span>
                </p>
              ) : (
                <>
                  <BiInput label="Name / பெயர்" value={it.name} onChange={(name) => patch(i, { name })} />
                  <BiInput label="Group heading (optional) / குழு தலைப்பு" value={it.group} onChange={(group) => patch(i, { group })} placeholder="e.g. Dome Panthal" />
                </>
              )}
            </div>
            <div className="flex gap-1.5 sm:flex-col">
              <IconBtn label="Move up" onClick={() => onChange(move(items, i, -1))} disabled={i === 0}>↑</IconBtn>
              <IconBtn label="Move down" onClick={() => onChange(move(items, i, 1))} disabled={i === items.length - 1}>↓</IconBtn>
              <IconBtn label="Delete" danger onClick={() => confirm(`Delete this ${itemNoun}?`) && onChange(items.filter((_, k) => k !== i))}>🗑</IconBtn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SubsEditor({ subs, onChange }) {
  const patch = (i, p) => onChange(subs.map((s, k) => (k === i ? { ...s, ...p } : s)));
  return (
    <div className="space-y-4">
      <button type="button" className="btn btn-primary btn-sm" onClick={() => onChange([...subs, newSub()])}>
        + Add sub-category
      </button>
      {subs.map((s, i) => (
        <div key={s.id} className="rounded-xl border-2 bg-[#FFFBF2] p-4" style={{ borderColor: 'var(--border-gold)' }}>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="flex-1 text-base">
              {s.emoji} {s.name.ta || s.name.en || 'New sub-category'}
            </h4>
            <IconBtn label="Move up" onClick={() => onChange(move(subs, i, -1))} disabled={i === 0}>↑</IconBtn>
            <IconBtn label="Move down" onClick={() => onChange(move(subs, i, 1))} disabled={i === subs.length - 1}>↓</IconBtn>
            <IconBtn label="Delete sub-category" danger onClick={() => confirm('Delete this sub-category and all its items?') && onChange(subs.filter((_, k) => k !== i))}>🗑</IconBtn>
          </div>
          <div className="mb-4 grid gap-3 sm:grid-cols-[90px_1fr_auto]">
            <div>
              <label className="field-label" htmlFor={`se-${s.id}`}>Emoji</label>
              <input id={`se-${s.id}`} className="field text-center text-xl" value={s.emoji} maxLength={8} onChange={(e) => patch(i, { emoji: e.target.value })} />
            </div>
            <BiInput label="Sub-category name" value={s.name} onChange={(name) => patch(i, { name })} />
            <ImageField label="Button photo" value={s.image} emoji={s.emoji} onChange={(image) => patch(i, { image })} />
          </div>
          <ItemsEditor items={s.items} onChange={(items) => patch(i, { items })} emoji={s.emoji} numbered={false} prefix={blankL()} />
        </div>
      ))}
    </div>
  );
}

function PresetInput({ options, onChange }) {
  const [raw, setRaw] = useState(options.join(', '));
  return (
    <div>
      <label className="field-label" htmlFor="presets">Preset quantities (comma separated)</label>
      <input
        id="presets"
        className="field"
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(e.target.value.split(/[\s,]+/).map(Number).filter((n) => Number.isInteger(n) && n > 0));
        }}
        placeholder="100, 150, 200, 250, 400, 500"
        inputMode="numeric"
      />
    </div>
  );
}

export default function CategoryEditor({ cat, index, count, open, onToggle, onChange, onMove, onDelete }) {
  const patch = (p) => onChange({ ...cat, ...p });
  const patchSel = (p) => patch({ selector: { ...cat.selector, ...p } });
  const itemCount = cat.mode === 'sub' ? cat.subs.reduce((n, s) => n + s.items.length, 0) : cat.items.length;

  return (
    <section className="card" aria-label={cat.name.en || cat.name.ta}>
      <div className="flex items-center gap-3 p-3">
        <span className="relative grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-champagne-100 text-2xl">
          {cat.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cat.image} alt="" className="h-full w-full object-cover" />
          ) : (
            cat.emoji
          )}
        </span>
        <button type="button" onClick={onToggle} className="min-w-0 flex-1 text-left" aria-expanded={open}>
          <span className="block truncate text-[16px] font-semibold text-ink-900">
            {cat.emoji} {cat.name.ta || '(no Tamil name)'}
          </span>
          <span className="block truncate text-[13px] text-ink-500">
            {cat.name.en || '(no English name)'} · {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
        </button>
        <IconBtn label="Move up" onClick={() => onMove(-1)} disabled={index === 0}>↑</IconBtn>
        <IconBtn label="Move down" onClick={() => onMove(1)} disabled={index === count - 1}>↓</IconBtn>
        <IconBtn label="Delete category" danger onClick={() => confirm(`Delete category "${cat.name.en || cat.name.ta}" and everything inside it?`) && onDelete()}>🗑</IconBtn>
        <button type="button" onClick={onToggle} className="btn btn-secondary btn-sm">
          {open ? 'Close ▴' : 'Edit ▾'}
        </button>
      </div>

      {open && (
        <div className="space-y-6 border-t p-4" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="grid gap-4 sm:grid-cols-[90px_1fr_auto]">
            <div>
              <label className="field-label" htmlFor={`em-${cat.id}`}>Emoji / ஐகான்</label>
              <input id={`em-${cat.id}`} className="field text-center text-2xl" value={cat.emoji} maxLength={8} onChange={(e) => patch({ emoji: e.target.value })} />
            </div>
            <BiInput label="Category name / பெயர்" value={cat.name} onChange={(name) => patch({ name })} />
            <ImageField label="Button photo / படம்" value={cat.image} emoji={cat.emoji} onChange={(image) => patch({ image })} />
          </div>

          <div>
            <label className="field-label" htmlFor={`mode-${cat.id}`}>What happens inside this category?</label>
            <select id={`mode-${cat.id}`} className="field" value={cat.mode} onChange={(e) => patch({ mode: e.target.value })}>
              {MODES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>

          {cat.mode === 'items' && (
            <div className="space-y-2.5 rounded-xl bg-champagne-100/60 p-3">
              <Check checked={cat.numbered} onChange={(numbered) => patch({ numbered })}>
                Number the photos automatically (Design 1, Design 2, …) / எண்ணிடு
              </Check>
              {cat.numbered && <BiInput label="Number label" value={cat.numberPrefix} onChange={(numberPrefix) => patch({ numberPrefix })} placeholder="Design" />}
              <Check checked={cat.qtyStepper} onChange={(qtyStepper) => patch({ qtyStepper })}>
                Let customers choose a quantity (+ / −) for each selected item
              </Check>
            </div>
          )}

          {cat.mode === 'selector' && (
            <div className="space-y-3 rounded-xl bg-champagne-100/60 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="field-label" htmlFor={`st-${cat.id}`}>Selector type</label>
                  <select id={`st-${cat.id}`} className="field" value={cat.selector.type} onChange={(e) => patchSel({ type: e.target.value })}>
                    <option value="preset">Preset buttons (e.g. 100, 150, 200 …)</option>
                    <option value="range">Dropdown from a minimum to a maximum (e.g. 1–18)</option>
                  </select>
                </div>
                {cat.selector.type === 'preset' ? (
                  <PresetInput options={cat.selector.options} onChange={(options) => patchSel({ options })} />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="field-label" htmlFor={`mn-${cat.id}`}>Minimum</label>
                      <input id={`mn-${cat.id}`} type="number" min={0} className="field" value={cat.selector.min} onChange={(e) => patchSel({ min: Math.max(0, parseInt(e.target.value, 10) || 0) })} />
                    </div>
                    <div>
                      <label className="field-label" htmlFor={`mx-${cat.id}`}>Maximum</label>
                      <input id={`mx-${cat.id}`} type="number" min={1} className="field" value={cat.selector.max} onChange={(e) => patchSel({ max: Math.max(1, parseInt(e.target.value, 10) || 1) })} />
                    </div>
                  </div>
                )}
              </div>
              <BiInput label="Unit name (e.g. chairs / sets)" value={cat.selector.unit} onChange={(unit) => patchSel({ unit })} />
            </div>
          )}

          <BiInput
            label={cat.mode === 'contact' ? 'Notice shown to customers (contact the owner)' : 'Note box shown below the photos (optional)'}
            value={cat.note}
            onChange={(note) => patch({ note })}
            textarea
            rows={3}
          />

          <div>
            <h3 className="mb-3 text-lg">
              {cat.mode === 'sub' ? '📂 Sub-categories' : cat.mode === 'selector' || cat.mode === 'contact' ? '🖼 Showcase photos' : cat.numbered ? '🖼 Designs / photos' : '📋 Items'}
            </h3>
            {cat.mode === 'sub' ? (
              <SubsEditor subs={cat.subs} onChange={(subs) => patch({ subs })} />
            ) : (
              <ItemsEditor
                items={cat.items}
                onChange={(items) => patch({ items })}
                numbered={cat.mode === 'items' && cat.numbered}
                prefix={cat.numberPrefix}
                emoji={cat.emoji}
                itemNoun={cat.mode === 'items' && !cat.numbered ? 'item' : 'photo'}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
