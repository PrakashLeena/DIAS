import Link from 'next/link';
import { getDictionary, localePath } from '@/lib/i18n';
import { getSettings, getPackages } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import PackageCard from '@/components/packages/PackageCard';
import { BuilderCta } from '@/components/home/Sections';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/packages', title: dict.packages.title, description: dict.packages.intro, settings: await getSettings() });
}

export default async function PackagesPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const all = await getPackages();
  const settings = await getSettings();
  const cats = [...new Set(all.map((p) => p.category))];
  const active = cats.includes(sp?.type) ? sp.type : '';
  const packages = active ? all.filter((p) => p.category === active) : all;
  const base = localePath(lang, '/packages');

  return (
    <>
      <PageHeader eyebrow={dict.nav.packages} title={dict.packages.title} intro={dict.packages.intro} />
      <section className="container py-10 sm:py-14">
        {cats.length > 1 && (
          <nav className="mb-8 flex flex-wrap gap-2" aria-label={dict.products.category}>
            {['', ...cats].map((c) => (
              <Link key={c || 'all'} href={c ? `${base}?type=${c}` : base} className={`badge !px-4 !py-2 !text-sm ring-1 ${active === c ? 'bg-maroon-600 text-white ring-maroon-600' : 'bg-white text-ink-700 ring-[color:var(--border-strong)] hover:bg-champagne-100'}`} aria-current={active === c ? 'page' : undefined}>
                {c ? dict.packages.categories[c] : dict.common.all}
              </Link>
            ))}
          </nav>
        )}
        {packages.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => (
              <PackageCard key={p._id} pkg={p} lang={lang} dict={dict} currency={settings.currency} featured={p.isFeatured && packages.length > 2 && p === packages[1]} />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed bg-white p-10 text-center text-ink-500">{dict.common.noResults}</p>
        )}
      </section>
      <BuilderCta lang={lang} dict={dict} />
    </>
  );
}
