'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save, AlertTriangle } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import { SEO_KEYWORDS_PLACEHOLDER } from '@/lib/site-defaults';
import { Card, BilingualField, Alert, apiFetch, errorText } from './ui';
import ImageUploader from './ImageUploader';

const L = (v) => ({ ta: v?.ta || '', en: v?.en || '' });

export default function SeoForm({ initial }) {
  const { t } = useAdmin();
  const router = useRouter();
  const [seo, setSeo] = useState({
    siteTitle: L(initial?.siteTitle),
    metaDescription: L(initial?.metaDescription),
    keywords: L(initial?.keywords),
    ogImage: initial?.ogImage || '',
    googleVerification: initial?.googleVerification || '',
  });
  const [state, setState] = useState({ busy: false, error: '', ok: '' });
  const set = (k, v) => setSeo((s) => ({ ...s, [k]: v }));
  const placeholderActive = [seo.keywords.ta, seo.keywords.en].some((k) => k.includes(SEO_KEYWORDS_PLACEHOLDER));

  const save = async (e) => {
    e.preventDefault();
    setState({ busy: true, error: '', ok: '' });
    try {
      await apiFetch('/api/admin/settings', { method: 'PUT', body: { seo } });
      setState({ busy: false, error: '', ok: t.common.saved });
      router.refresh();
    } catch (err) {
      setState({ busy: false, error: errorText(err, t), ok: '' });
    }
  };

  return (
    <form onSubmit={save} className="flex max-w-4xl flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-5">
          <BilingualField label={t.seo.siteTitle} value={seo.siteTitle} onChange={(v) => set('siteTitle', v)} maxLength={120} />
          <BilingualField label={t.seo.description} value={seo.metaDescription} onChange={(v) => set('metaDescription', v)} multiline rows={3} maxLength={320} />
          <div>
            <BilingualField label={t.seo.keywords} value={seo.keywords} onChange={(v) => set('keywords', v)} multiline rows={3} maxLength={1000} />
            <p className="field-hint">{t.seo.keywordsHint}</p>
            {placeholderActive && (
              <p className="mt-2 flex items-center gap-2 rounded-md bg-warning/10 px-3 py-2 text-[13px] text-[#8a5d0b]">
                <AlertTriangle className="h-4 w-4" /> {SEO_KEYWORDS_PLACEHOLDER}
              </p>
            )}
          </div>
          <ImageUploader label={t.seo.ogImage} multiple={false} value={seo.ogImage} onChange={(v) => set('ogImage', v)} />
          <label>
            <span className="field-label">{t.seo.verification}</span>
            <input className="field" value={seo.googleVerification} onChange={(e) => set('googleVerification', e.target.value)} />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={state.busy} className="btn btn-primary">
              {state.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {t.common.save}
            </button>
            <Alert kind="error">{state.error}</Alert>
            <Alert kind="ok">{state.ok}</Alert>
          </div>
        </div>
      </Card>
    </form>
  );
}
