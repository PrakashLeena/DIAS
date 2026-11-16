import { Search, SlidersHorizontal } from 'lucide-react';
import { tr } from '@/lib/i18n/config';

/** Plain GET form — works without JavaScript and keeps filter URLs shareable/crawlable. */
export default function ProductFilters({ action, categories, lang, dict, values, hideCategory = false }) {
  return (
    <form action={action} method="get" className="grid gap-3 rounded-xl border bg-white p-4 shadow-1 sm:grid-cols-2 lg:grid-cols-[2fr_1.3fr_1fr_1fr_1.3fr_auto] lg:items-end" style={{ borderColor: 'var(--border-subtle)' }} role="search">
      <div>
        <label htmlFor="q" className="field-label">{dict.common.search}</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" aria-hidden />
          <input id="q" name="q" type="search" defaultValue={values.q} placeholder={dict.products.searchPlaceholder} className="field !pl-9" maxLength={80} />
        </div>
      </div>
      {!hideCategory && (
        <div>
          <label htmlFor="category" className="field-label">{dict.products.category}</label>
          <select id="category" name="category" defaultValue={values.category} className="field">
            <option value="">{dict.products.allCategories}</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug}>
                {tr(c.name, lang)}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="min" className="field-label">{dict.products.minPrice}</label>
        <input id="min" name="min" type="number" min="0" inputMode="numeric" defaultValue={values.min} className="field" />
      </div>
      <div>
        <label htmlFor="max" className="field-label">{dict.products.maxPrice}</label>
        <input id="max" name="max" type="number" min="0" inputMode="numeric" defaultValue={values.max} className="field" />
      </div>
      <div>
        <label htmlFor="sort" className="field-label">{dict.products.sort}</label>
        <select id="sort" name="sort" defaultValue={values.sort} className="field">
          {Object.entries(dict.products.sortOptions).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary w-full lg:w-auto">
        <SlidersHorizontal className="h-4 w-4" /> {dict.products.filter}
      </button>
    </form>
  );
}
