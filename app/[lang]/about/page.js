import Image from 'next/image';
import Link from 'next/link';
import { Award, Handshake, Heart, ArrowRight } from 'lucide-react';
import { getDictionary, localePath, tr } from '@/lib/i18n';
import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader';
import { WhyUs, HowItWorks } from '@/components/home/Sections';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const settings = await getSettings();
  return buildMetadata({ lang, path: '/about', title: dict.nav.about, description: tr(settings.about?.body, lang).slice(0, 160) || dict.footer.about, settings, image: settings.about?.image });
}

export default async function AboutPage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const settings = await getSettings();
  const body = tr(settings.about?.body, lang) || dict.footer.about;
  const icons = [Award, Handshake, Heart];

  return (
    <>
      <PageHeader eyebrow={dict.about.eyebrow} title={tr(settings.about?.title, lang) || dict.about.title} />
      <section className="section">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-3">
            <Image src={settings.about?.image || '/images/tents/tents-15.webp'} alt={tr(settings.companyName, lang)} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">{tr(settings.companyName, lang)}</p>
            <h2 className="h-section">{dict.about.title}</h2>
            <div className="prose-body mt-5">
              {body.split(/\n{2,}/).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={localePath(lang, '/packages')} className="btn btn-primary">
                {dict.common.explorePackages} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={localePath(lang, '/contact')} className="btn btn-secondary">
                {dict.nav.contact}
              </Link>
            </div>
          </div>
        </div>
        <div className="container mt-16 grid gap-5 md:grid-cols-3">
          {dict.about.values.map((v, i) => {
            const Icon = icons[i];
            return (
              <div key={v.title} className="card p-7">
                <Icon className="h-7 w-7 text-gold-700" strokeWidth={1.5} aria-hidden />
                <h3 className="mt-4 text-[26px] [:lang(ta)_&]:text-[20px]">{v.title}</h3>
                <p className="mt-2 font-light text-ink-500">{v.text}</p>
              </div>
            );
          })}
        </div>
      </section>
      <WhyUs dict={dict} />
      <HowItWorks dict={dict} />
    </>
  );
}
