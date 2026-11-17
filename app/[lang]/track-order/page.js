import { Suspense } from 'react';
import { getDictionary } from '@/lib/i18n';
import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import TrackOrder from '@/components/tracking/TrackOrder';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/track-order', title: dict.track.title, description: dict.track.intro, settings: await getSettings() });
}

export default async function TrackOrderPage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return (
    <>
      <PageHeader eyebrow={dict.nav.track} title={dict.track.title} intro={dict.track.intro} />
      <section className="container py-10 sm:py-14">
        <Suspense fallback={<div className="mx-auto h-40 max-w-3xl animate-pulse rounded-xl bg-white" />}>
          <TrackOrder />
        </Suspense>
      </section>
    </>
  );
}
