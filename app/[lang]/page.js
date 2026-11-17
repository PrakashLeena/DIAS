// Homepage — UI from the Stage Décor design (/_design/ui_kits/website), data from MongoDB.
import { getSettings, getPackages, getHomeAddons } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import HomeStage from '@/components/stage/HomeStage';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const settings = await getSettings();
  return buildMetadata({ lang, path: '/', settings });
}

export default async function HomePage() {
  const [settings, featured, all, addons] = await Promise.all([getSettings(), getPackages({ featuredOnly: true }), getPackages(), getHomeAddons()]);
  // Design shows three package tiers: featured packages first, topped up with the rest.
  const packages = [...featured, ...all.filter((p) => !featured.some((f) => f._id === p._id))].slice(0, 3);

  return (
    <HomeStage
      packages={packages}
      addons={addons}
      gallery={(settings.gallery || []).slice(0, 6)}
      testimonials={settings.testimonials || []}
      stageDesign={settings.stageDesign || null}
    />
  );
}
