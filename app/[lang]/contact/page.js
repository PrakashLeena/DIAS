import { Phone, MessageCircle, Mail, MapPin, Clock, ExternalLink } from 'lucide-react';
import { getDictionary, tr } from '@/lib/i18n';
import { getSettings } from '@/services/catalog';
import { buildMetadata } from '@/lib/seo';
import { telLink, whatsappLink } from '@/utils/format';
import PageHeader from '@/components/ui/PageHeader';
import { Facebook, Instagram, Youtube, TikTok } from '@/components/ui/SocialIcons';

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  return buildMetadata({ lang, path: '/contact', title: dict.contact.title, description: dict.contact.intro, settings: await getSettings() });
}

export default async function ContactPage({ params }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp || s.phone, dict.contact.whatsappText, s.phoneCountryCode);
  const cards = [
    s.phone && { Icon: Phone, label: dict.contact.phone, value: s.phone, href: telLink(s.phone), cta: dict.common.call },
    wa && { Icon: MessageCircle, label: dict.contact.whatsapp, value: s.whatsapp || s.phone, href: wa, cta: dict.common.whatsapp, external: true },
    s.email && { Icon: Mail, label: dict.contact.email, value: s.email, href: `mailto:${s.email}`, cta: dict.common.email },
    tr(s.address, lang) && { Icon: MapPin, label: dict.contact.address, value: tr(s.address, lang), href: s.mapLink, cta: s.mapLink ? dict.contact.map : null, external: true },
    tr(s.businessHours, lang) && { Icon: Clock, label: dict.contact.hours, value: tr(s.businessHours, lang) },
  ].filter(Boolean);
  const social = [
    ['Facebook', s.social?.facebook, Facebook],
    ['Instagram', s.social?.instagram, Instagram],
    ['YouTube', s.social?.youtube, Youtube],
    ['TikTok', s.social?.tiktok, TikTok],
  ].filter(([, u]) => u);

  return (
    <>
      <PageHeader eyebrow={dict.home.contact.eyebrow} title={dict.contact.title} intro={dict.contact.intro} />
      <section className="container py-12 sm:py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ Icon, label, value, href, cta, external }) => (
            <div key={label} className="card flex flex-col p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-100 text-maroon-600">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h2 className="mt-4 text-[22px] [:lang(ta)_&]:text-[18px]">{label}</h2>
              <p className="mt-1 flex-1 break-words text-[16px] text-ink-700">{value}</p>
              {href && cta && (
                <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="btn btn-secondary btn-sm mt-4 self-start">
                  {cta} {external && <ExternalLink className="h-3.5 w-3.5" />}
                </a>
              )}
            </div>
          ))}
        </div>

        {social.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink-500">{dict.footer.follow}:</span>
            {social.map(([name, url, Icon]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                <Icon /> {name}
              </a>
            ))}
          </div>
        )}

        {s.mapEmbedUrl && (
          <div className="mt-10 overflow-hidden rounded-xl border shadow-1" style={{ borderColor: 'var(--border-subtle)' }}>
            <iframe src={s.mapEmbedUrl} title={dict.contact.map} className="h-[420px] w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        )}
      </section>
    </>
  );
}
