'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, Plus, X, ArrowUp } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, BilingualField, Alert, apiFetch, errorText } from './ui';
import ImageUploader, { uploadFile } from './ImageUploader';

const L = (v) => ({ ta: v?.ta || '', en: v?.en || '' });

export default function SettingsForm({ initial }) {
  const { t } = useAdmin();
  const s = t.settings;
  const router = useRouter();
  const [form, setForm] = useState(() => ({
    companyName: L(initial.companyName),
    tagline: L(initial.tagline),
    logo: initial.logo || '',
    phone: initial.phone || '',
    whatsapp: initial.whatsapp || '',
    email: initial.email || '',
    address: L(initial.address),
    businessHours: L(initial.businessHours),
    mapEmbedUrl: initial.mapEmbedUrl || '',
    mapLink: initial.mapLink || '',
    social: { facebook: '', instagram: '', youtube: '', tiktok: '', ...(initial.social || {}) },
    currency: { code: initial.currency?.code || 'LKR', symbol: initial.currency?.symbol || 'Rs.' },
    phoneCountryCode: initial.phoneCountryCode || '94',
    hero: { heading: L(initial.hero?.heading), subheading: L(initial.hero?.subheading), videoUrl: initial.hero?.videoUrl || '', posterUrl: initial.hero?.posterUrl || '' },
    about: { title: L(initial.about?.title), body: L(initial.about?.body), image: initial.about?.image || '' },
    gallery: (initial.gallery || []).map((g) => ({ url: g.url, caption: L(g.caption), category: g.category || 'stage' })),
    testimonials: (initial.testimonials || []).map((x) => ({ name: x.name, event: L(x.event), quote: L(x.quote), rating: x.rating || 5 })),
  }));
  const [state, setState] = useState({ busy: false, error: '', ok: '' });
  const [videoBusy, setVideoBusy] = useState(false);

  const set = (path, value) =>
    setForm((f) => {
      const next = structuredClone(f);
      const keys = path.split('.');
      let o = next;
      keys.slice(0, -1).forEach((k) => (o = o[k]));
      o[keys.at(-1)] = value;
      return next;
    });

  const save = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', ok: '' });
    try {
      await apiFetch('/api/admin/settings', { method: 'PUT', body: form });
      setState({ busy: false, error: '', ok: t.common.saved });
      router.refresh();
    } catch (err) {
      setState({ busy: false, error: errorText(err, t), ok: '' });
    }
  };

  const text = (path, label, props = {}) => (
    <label>
      <span className="field-label">{label}</span>
      <input className="field" value={path.split('.').reduce((o, k) => o?.[k], form) ?? ''} onChange={(e) => set(path, e.target.value)} {...props} />
    </label>
  );

  const uploadVideo = async (file) => {
    setVideoBusy(true);
    try {
      set('hero.videoUrl', await uploadFile(file));
    } catch (err) {
      setState((st) => ({ ...st, error: err.message }));
    } finally {
      setVideoBusy(false);
    }
  };

  const saveBar = (
    <div className="sticky bottom-0 z-20 -mx-4 flex items-center gap-3 border-t bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8" style={{ borderColor: 'var(--border-subtle)' }}>
      <button type="submit" disabled={state.busy} className="btn btn-primary">
        {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {state.busy ? t.common.saving : t.common.save}
      </button>
      <Alert kind="error">{state.error}</Alert>
      <Alert kind="ok">{state.ok}</Alert>
    </div>
  );

  return (
    <form onSubmit={save} className="flex flex-col gap-6">
      <Card title={s.company}>
        <div className="flex flex-col gap-4">
          <BilingualField label={s.companyName} value={form.companyName} onChange={(v) => set('companyName', v)} />
          <BilingualField label={s.tagline} value={form.tagline} onChange={(v) => set('tagline', v)} />
          <ImageUploader label={s.logo} multiple={false} value={form.logo} onChange={(v) => set('logo', v)} />
        </div>
      </Card>

      <Card title={s.contact}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {text('phone', s.phone, { type: 'tel' })}
          {text('whatsapp', s.whatsapp, { type: 'tel' })}
          {text('email', s.email, { type: 'email' })}
          {text('phoneCountryCode', s.countryCode, { inputMode: 'numeric', maxLength: 4 })}
          {text('currency.code', s.currencyCode, { maxLength: 3 })}
          {text('currency.symbol', s.currencySymbol, { maxLength: 6 })}
        </div>
        <div className="mt-4 flex flex-col gap-4">
          <BilingualField label={s.address} value={form.address} onChange={(v) => set('address', v)} multiline rows={2} />
          <BilingualField label={s.hours} value={form.businessHours} onChange={(v) => set('businessHours', v)} />
          <div className="grid gap-4 md:grid-cols-2">
            {text('mapLink', s.mapLink, { placeholder: 'https://maps.app.goo.gl/…' })}
            {text('mapEmbedUrl', s.mapEmbed, { placeholder: 'https://www.google.com/maps/embed?pb=…' })}
          </div>
        </div>
      </Card>

      <Card title={s.social}>
        <div className="grid gap-4 sm:grid-cols-2">
          {['facebook', 'instagram', 'youtube', 'tiktok'].map((k) => (
            <div key={k}>{text(`social.${k}`, k[0].toUpperCase() + k.slice(1), { placeholder: 'https://' })}</div>
          ))}
        </div>
      </Card>

      <Card title={s.hero}>
        <div className="flex flex-col gap-4">
          <BilingualField label={s.heroHeading} value={form.hero.heading} onChange={(v) => set('hero.heading', v)} />
          <BilingualField label={s.heroSub} value={form.hero.subheading} onChange={(v) => set('hero.subheading', v)} multiline rows={2} />
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <span className="field-label">{s.heroVideo}</span>
              <input className="field" value={form.hero.videoUrl} onChange={(e) => set('hero.videoUrl', e.target.value)} placeholder="/videos/hero.mp4" />
              <label className="btn btn-secondary btn-sm mt-2 cursor-pointer">
                {videoBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />} {videoBusy ? t.common.uploading : t.common.upload}
                <input type="file" accept="video/mp4,video/webm" hidden onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />
              </label>
              {form.hero.videoUrl && <video src={form.hero.videoUrl} className="mt-3 aspect-video w-full rounded-md bg-ink-900 object-cover" muted controls preload="metadata" />}
            </div>
            <ImageUploader label={s.heroPoster} multiple={false} value={form.hero.posterUrl} onChange={(v) => set('hero.posterUrl', v)} />
          </div>
          <p className="field-hint">{s.featuredNote}</p>
        </div>
      </Card>

      <Card title={s.about}>
        <div className="flex flex-col gap-4">
          <BilingualField label={s.aboutTitle} value={form.about.title} onChange={(v) => set('about.title', v)} />
          <BilingualField label={s.aboutBody} value={form.about.body} onChange={(v) => set('about.body', v)} multiline rows={6} />
          <ImageUploader label={s.aboutImage} multiple={false} value={form.about.image} onChange={(v) => set('about.image', v)} />
        </div>
      </Card>

      <Card title={`${s.gallery} (${form.gallery.length})`}>
        <ImageUploader
          value={[]}
          max={60}
          onChange={(urls) => set('gallery', [...form.gallery, ...urls.map((url) => ({ url, caption: { ta: '', en: '' }, category: 'stage' }))])}
        />
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {form.gallery.map((g, i) => (
            <li key={g.url + i} className="flex gap-3 rounded-md border p-3" style={{ borderColor: 'var(--border-subtle)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.url} alt="" className="h-20 w-24 shrink-0 rounded object-cover" loading="lazy" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <input className="field !min-h-[34px] !py-1 text-[13px]" lang="ta" placeholder={`${s.caption} (TA)`} value={g.caption.ta} onChange={(e) => set(`gallery.${i}.caption.ta`, e.target.value)} />
                  <input className="field !min-h-[34px] !py-1 text-[13px]" placeholder={`${s.caption} (EN)`} value={g.caption.en} onChange={(e) => set(`gallery.${i}.caption.en`, e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <select className="field !min-h-[34px] !py-1 text-[13px]" value={g.category} onChange={(e) => set(`gallery.${i}.category`, e.target.value)} aria-label={s.galleryCategory}>
                    {['tent', 'stage', 'lighting', 'other'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {i > 0 && (
                    <button type="button" className="rounded p-1.5 hover:bg-champagne-100" aria-label="Move up" onClick={() => set('gallery', [...form.gallery.slice(0, i - 1), g, form.gallery[i - 1], ...form.gallery.slice(i + 1)])}>
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  )}
                  <button type="button" className="rounded p-1.5 text-danger hover:bg-danger/10" aria-label={t.common.remove} onClick={() => set('gallery', form.gallery.filter((_, k) => k !== i))}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card
        title={s.testimonials}
        actions={
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => set('testimonials', [...form.testimonials, { name: '', event: { ta: '', en: '' }, quote: { ta: '', en: '' }, rating: 5 }])}>
            <Plus className="h-4 w-4" /> {s.addTestimonial}
          </button>
        }
      >
        <div className="flex flex-col gap-4">
          {form.testimonials.map((x, i) => (
            <div key={i} className="relative flex flex-col gap-3 rounded-md border bg-ivory-50 p-4 pr-12" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
                <label>
                  <span className="field-label">{s.tName}</span>
                  <input className="field" value={x.name} onChange={(e) => set(`testimonials.${i}.name`, e.target.value)} />
                </label>
                <label>
                  <span className="field-label">{s.tRating}</span>
                  <select className="field" value={x.rating} onChange={(e) => set(`testimonials.${i}.rating`, Number(e.target.value))}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} ★
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <BilingualField label={s.tEvent} value={x.event} onChange={(v) => set(`testimonials.${i}.event`, v)} />
              <BilingualField label={s.tQuote} value={x.quote} onChange={(v) => set(`testimonials.${i}.quote`, v)} multiline rows={2} />
              <button type="button" className="absolute right-3 top-3 rounded-full p-1.5 text-danger hover:bg-danger/10" aria-label={t.common.remove} onClick={() => set('testimonials', form.testimonials.filter((_, k) => k !== i))}>
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>
      {saveBar}
    </form>
  );
}
