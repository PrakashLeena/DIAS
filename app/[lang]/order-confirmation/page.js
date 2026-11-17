import { Suspense } from 'react';
import { getDictionary } from '@/lib/i18n';
import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import OrderConfirmation from '@/components/checkout/OrderConfirmation';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/order-confirmation', title: dict.confirmation.title, settings: await getSettings(), noIndex: true });
}

export default async function OrderConfirmationPage() {
  return (
    <section className="min-h-[80vh] bg-champagne-100/60 pb-16 pt-28 sm:pt-32">
      <div className="container">
        <Suspense fallback={<div className="mx-auto h-96 max-w-2xl animate-pulse rounded-xl bg-white" />}>
          <OrderConfirmation />
        </Suspense>
      </div>
    </section>
  );
}
