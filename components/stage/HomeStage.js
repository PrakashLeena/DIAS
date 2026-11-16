'use client';

// Homepage composition from /_design/ui_kits/website/index.html:
// StageHero → Packages → Estimator → Gallery → Testimonials → Booking.
import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useLang } from '@/contexts/LangContext';
import useMoney from '@/hooks/useMoney';
import { homeUi } from '@/lib/i18n/home-ui';
import { resolveStageDesign, stageOptions, applyStageText, ELEMENT_KEYS } from '@/lib/stage-design';
import StageHero from './StageHero';
import { Packages, Estimator, Gallery, Testimonials, Booking } from './Sections';

export default function HomeStage({ packages, addons, gallery, testimonials, stageDesign }) {
  const { lang, dict, settings, href } = useLang();
  // 3D Design settings from Admin → 3D Design (names, visibility, colour options).
  const design = React.useMemo(() => resolveStageDesign(stageDesign), [stageDesign]);
  const options = React.useMemo(() => stageOptions(design), [design]);
  const enabled = React.useMemo(() => Object.fromEntries(ELEMENT_KEYS.map((k) => [k, design.elements[k].enabled])), [design]);
  const t = React.useMemo(() => applyStageText(homeUi[lang], design, lang), [design, lang]);
  const money = useMoney();
  const router = useRouter();
  const cart = useCart();
  const [pkg, setPkg] = React.useState(packages[1]?._id || packages[0]?._id);
  const [flora, setFlora] = React.useState(options.flora[0].v);
  const [tourSignal, setTourSignal] = React.useState(0);

  const go = React.useCallback((id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - (id === 'stages' ? 0 : 80), behavior: 'smooth' });
  }, []);

  // The navbar's "3D Customizer" link starts the guided tour.
  React.useEffect(() => {
    const onTour = () => { go('stages'); setTourSignal(s => s + 1); };
    window.addEventListener('wd:tour', onTour);
    if (window.location.hash === '#tour') onTour();
    return () => window.removeEventListener('wd:tour', onTour);
  }, [go]);

  const brandName = settings.companyName?.[lang] || settings.companyName?.en || '';
  const parts = brandName.split(' ');
  const brand = lang === 'en' && parts.length > 1 ? [parts.slice(0, -1).join(' '), parts.at(-1)] : [brandName];

  // "Get an exact quote": the estimate becomes a real order request in the basket.
  const onQuote = ({ pkg: P, addons: extra, fn, guests, flora: fl }) => {
    cart.addItem({ type: 'package', id: P._id, quantity: 1, snapshot: { name: P.name, price: P.packagePrice, pricingUnit: 'per_event', image: P.coverImage, slug: P.slug } });
    for (const a of extra) cart.addItem({ type: 'product', id: a._id, quantity: 1, snapshot: { name: a.name, price: a.rentalPrice, pricingUnit: a.pricingUnit, image: a.images?.[0] || '', slug: a.slug, minQty: 1 } });
    try {
      sessionStorage.setItem('wd_estimate', JSON.stringify({ eventType: fn, note: `${t.estimator.guests}: ${guests} · ${t.estimator.florals}: ${t.flora[fl]}` }));
    } catch {}
    router.push(href('/checkout'));
  };

  return (
    <>
      <StageHero t={t} brand={brand} flora={flora} setFlora={setFlora} onBook={() => go('booking')} onPackages={() => go('packages')} tourSignal={tourSignal} options={options} enabled={enabled} />
      <Packages t={t} lang={lang} packages={packages} money={money} catLabels={dict.packages.categories} href={href} onSelect={(id) => { setPkg(id); go('estimator'); }} />
      <Estimator t={t} lang={lang} packages={packages} addons={addons} money={money} pkg={pkg} setPkg={setPkg} flora={flora} setFlora={setFlora} floraOptions={options.flora} onQuote={onQuote} />
      <Gallery t={t} lang={lang} items={gallery} />
      <Testimonials t={t} lang={lang} items={testimonials} />
      <Booking t={t} lang={lang} flora={flora} />
    </>
  );
}
