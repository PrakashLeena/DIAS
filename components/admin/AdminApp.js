'use client';

// Admin Panel (நிர்வாகப் பகுதி): categories & items, photos, contact numbers and reviews.
// Everything is edited in one content tree and saved with a single "Save" button.
import { useEffect, useMemo, useState } from 'react';
import CategoryEditor, { NewCategoryDialog } from './CategoryEditor';
import { BiInput, MoreMenu, apiJson, move } from './fields';
import { Stars } from '../site/ui';

// [id, icon, short label (phones), full label, Tamil]
const TABS = [
  ['categories', '🗂', 'Categories', 'Categories & Items', 'வகைகள் & பொருட்கள்'],
  ['contact', '📞', 'Contact', 'Contact Info', 'தொடர்பு'],
  ['reviews', '⭐', 'Reviews', 'Reviews', 'மதிப்புரைகள்'],
];

export default function AdminApp({ initialContent, initialReviews, adminName }) {
  const [content, setContent] = useState(initialContent);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initialContent));
  const [tab, setTab] = useState('categories');
  const [openId, setOpenId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [reviews, setReviews] = useState(initialReviews);
  const [status, setStatus] = useState({ busy: false, msg: '', ok: true });

  const dirty = useMemo(() => JSON.stringify(content) !== savedJson, [content, savedJson]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const save = async () => {
    setStatus({ busy: true, msg: '', ok: true });
    try {
      await apiJson('/api/admin/content', { method: 'PUT', body: JSON.stringify(content) });
      setSavedJson(JSON.stringify(content));
      setStatus({ busy: false, ok: true, msg: 'Saved ✓ சேமிக்கப்பட்டது' });
      setTimeout(() => setStatus((s) => (s.ok ? { ...s, msg: '' } : s)), 4000);
    } catch (err) {
      setStatus({ busy: false, ok: false, msg: err.message });
    }
  };

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const setCats = (fn) => setContent((c) => ({ ...c, categories: fn(c.categories) }));
  const setContact = (p) => setContent((c) => ({ ...c, contact: { ...c.contact, ...p } }));

  const createCategory = (c) => {
    setCats((list) => [...list, c]);
    setOpenId(c.id);
    setAdding(false);
    setTimeout(() => document.querySelector(`[data-cat-id="${c.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try {
      await apiJson(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      setReviews((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      setStatus({ busy: false, ok: false, msg: err.message });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-ink-900 text-[#FFF8EC] shadow-2" style={{ borderColor: 'rgba(255,255,255,.1)' }}>
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <h1 className="!text-[#FFE9B0] text-lg">நிர்வாகப் பகுதி <span className="text-sm font-normal text-[#FFF8EC]/70">/ Admin Dashboard</span></h1>
            <p className="truncate text-[12.5px] text-[#FFF8EC]/60">{adminName}</p>
          </div>
          {dirty && <span className="hidden rounded-full bg-gold-500/20 px-3 py-1 text-[12.5px] font-medium text-gold-300 sm:inline">● Unsaved changes</span>}
          <button type="button" onClick={save} disabled={!dirty || status.busy} className="btn btn-call btn-sm" title={dirty ? 'Publish your changes to the website' : 'No changes to save'}>
            {dirty && <span className="h-2 w-2 rounded-full bg-maroon-600 sm:hidden" aria-label="Unsaved changes" />}
            {status.busy ? 'Saving…' : 'Save / சேமி'}
          </button>
          <MoreMenu
            tone="dark"
            label="More: view site, logout"
            items={[
              { label: 'View site ↗', href: '/' },
              { label: 'Logout', onClick: logout, danger: true },
            ]}
          />
        </div>
        {/* Phones: three equal tabs with short labels, so all of them are always visible. */}
        <nav className="mx-auto grid max-w-4xl grid-cols-3 gap-1 px-2 sm:flex sm:px-3" aria-label="Admin sections">
          {TABS.map(([id, icon, short, en, ta]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              aria-current={tab === id ? 'page' : undefined}
              className={`flex min-w-0 items-center justify-center gap-1.5 rounded-t-lg px-2 py-2.5 text-[13.5px] font-semibold sm:shrink-0 sm:px-4 sm:py-2 sm:text-[14px] ${tab === id ? 'bg-[#F6F1E7] text-ink-900' : 'text-[#FFF8EC]/80 hover:bg-white/10'}`}
            >
              <span aria-hidden>{icon}</span>
              <span className="truncate sm:hidden">{short}</span>
              <span className="hidden sm:inline">
                {en} <span className="font-normal opacity-70">· {ta}</span>
              </span>
            </button>
          ))}
        </nav>
      </header>

      {status.msg && (
        <div className="mx-auto mt-3 max-w-4xl px-4">
          <p role={status.ok ? 'status' : 'alert'} className={`rounded-lg px-3 py-2 text-sm ${status.ok ? 'bg-[#E6F4EA] text-[#1a7d43]' : 'bg-[#FBE7EA] text-[#B3122E]'}`}>
            {status.msg}
          </p>
        </div>
      )}

      <main className="mx-auto max-w-4xl px-4 py-6">
        {tab === 'categories' && (
          <div className="space-y-4">
            <p className="rounded-xl bg-white p-4 text-[14px] text-ink-700 shadow-1">
              Add, rename, reorder or delete the main categories shown in the navigation bar and home page. Open a category to change its photos, items, sizes and quantity options.
              <strong className="mt-1 block">Remember to press “Save” — changes go live on the website only after saving.</strong>
            </p>
            {content.categories.map((cat, i) => (
              <CategoryEditor
                key={cat.id}
                cat={cat}
                index={i}
                count={content.categories.length}
                open={openId === cat.id}
                onToggle={() => setOpenId(openId === cat.id ? null : cat.id)}
                onChange={(next) => setCats((list) => list.map((c) => (c.id === cat.id ? next : c)))}
                onMove={(d) => setCats((list) => move(list, i, d))}
                onDelete={() => setCats((list) => list.filter((c) => c.id !== cat.id))}
              />
            ))}
            <button type="button" onClick={() => setAdding(true)} className="btn btn-primary w-full sm:w-auto">
              + Add new category / புதிய வகை
            </button>
          </div>
        )}

        {tab === 'contact' && (
          <div className="card max-w-2xl space-y-5 p-5">
            <BiInput label="Business name / நிறுவனப் பெயர்" value={content.site.name} onChange={(name) => setContent((c) => ({ ...c, site: { ...c.site, name } }))} />
            <div>
              <label className="field-label" htmlFor="wa">WhatsApp number (orders are sent here) / வாட்ஸ்அப் எண்</label>
              <input id="wa" className="field" value={content.contact.whatsapp} onChange={(e) => setContact({ whatsapp: e.target.value })} inputMode="tel" placeholder="+94751318809" />
              <p className="mt-1 text-[12.5px] text-ink-500">Include the country code, e.g. +94751318809.</p>
            </div>
            <div>
              <span className="field-label">Owner phone numbers for “Call” buttons (max 4) / அழைப்பு எண்கள்</span>
              <div className="space-y-2">
                {content.contact.phones.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="field" value={p} inputMode="tel" aria-label={`Phone ${i + 1}`} placeholder="0760004755" onChange={(e) => setContact({ phones: content.contact.phones.map((x, k) => (k === i ? e.target.value : x)) })} />
                    <button
                      type="button"
                      className="btn btn-danger !h-[46px] !w-[46px] shrink-0 !px-0"
                      aria-label={`Remove phone number ${i + 1}`}
                      title="Remove this number"
                      disabled={content.contact.phones.length <= 1}
                      onClick={() => setContact({ phones: content.contact.phones.filter((_, k) => k !== i) })}
                    >
                      <span aria-hidden>✕</span>
                    </button>
                  </div>
                ))}
              </div>
              {content.contact.phones.length < 4 && (
                <button type="button" className="btn btn-secondary btn-sm mt-2" onClick={() => setContact({ phones: [...content.contact.phones, ''] })}>
                  + Add number
                </button>
              )}
            </div>
            <p className="text-[13px] text-ink-500">Press “Save” (top) to publish these details.</p>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3">
            <p className="rounded-xl bg-white p-4 text-[14px] text-ink-700 shadow-1">Customer reviews appear on the home page immediately. Delete inappropriate ones here (deleting is instant, no Save needed).</p>
            {!reviews.length && <p className="rounded-xl bg-white p-6 text-center text-ink-500">No reviews yet.</p>}
            {reviews.map((r) => (
              <article key={r.id} className="card flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-ink-900">{r.name}</strong>
                    <Stars value={r.rating} size={15} />
                    {r.createdAt && <span className="text-[12px] text-ink-500">{new Date(r.createdAt).toLocaleDateString('en-GB')}</span>}
                  </div>
                  <p className="mt-1 break-words text-[14.5px]">{r.message}</p>
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteReview(r.id)}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
      {adding && <NewCategoryDialog onClose={() => setAdding(false)} onCreate={createCategory} existingIds={content.categories.map((c) => c.id)} />}
    </div>
  );
}
