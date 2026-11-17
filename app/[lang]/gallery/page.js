import Link from 'next/link';
import { getDictionary, localePath } from '@/lib/i18n';
import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import GalleryGrid from '@/components/gallery/GalleryGrid';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/gallery', title: dict.galleryPage.title, description: dict.galleryPage.intro, settings: await getSettings() });
}

export default async function GalleryPage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const dict = getDictionary(lang);
  const settings = await getSettings();
  const all = settings.gallery || [];
  const cats = ['tent', 'stage', 'lighting'].filter((c) => all.some((g) => g.category === c));
  const active = cats.includes(sp?.type) ? sp.type : '';
  const items = active ? all.filter((g) => g.category === active) : all;
  const base = localePath(lang, '/gallery');

  return (
    <>
      <PageHeader eyebrow={dict.home.gallery.eyebrow} title={dict.galleryPage.title} intro={dict.galleryPage.intro} />
      <section className="container py-10 sm:py-14">
        {cats.length > 1 && (
          <nav className="mb-8 flex flex-wrap gap-2">
            {['', ...cats].map((c) => (
              <Link key={c || 'all'} href={c ? `${base}?type=${c}` : base} aria-current={active === c ? 'page' : undefined} className={`badge !px-4 !py-2 !text-sm ring-1 ${active === c ? 'bg-maroon-600 text-white ring-maroon-600' : 'bg-white text-ink-700 ring-[color:var(--border-strong)] hover:bg-champagne-100'}`}>
                {dict.galleryPage.filters[c || 'all']}
              </Link>
            ))}
          </nav>
        )}
        {items.length ? <GalleryGrid items={items} /> : <p className="text-center text-ink-500">{dict.common.noResults}</p>}
      </section>
    </>
  );
}
