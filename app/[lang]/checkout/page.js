import { getDictionary } from '@/lib/i18n';
import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import CheckoutForm from '@/components/checkout/CheckoutForm';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/checkout', title: dict.checkout.title, description: dict.checkout.intro, settings: await getSettings(), noIndex: true });
}

export default async function CheckoutPage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return (
    <>
      <PageHeader eyebrow={dict.cart.title} title={dict.checkout.title} intro={dict.checkout.intro} />
      <section className="container py-10 sm:py-14">
        <CheckoutForm />
      </section>
    </>
  );
}
