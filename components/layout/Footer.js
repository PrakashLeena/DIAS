import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react';
import { Facebook, Instagram, Youtube, TikTok } from '@/components/ui/SocialIcons';
import { localePath, tr } from '@/lib/i18n/config';
import { telLink, whatsappLink } from '@/utils/format';

export default function Footer({ lang, dict, settings }) {
  const href = (p) => localePath(lang, p);
  const brand = tr(settings.companyName, lang);
  const wa = whatsappLink(settings.whatsapp || settings.phone, dict.contact.whatsappText, settings.phoneCountryCode);
  const social = [
    ['facebook', settings.social?.facebook, Facebook],
    ['instagram', settings.social?.instagram, Instagram],
    ['youtube', settings.social?.youtube, Youtube],
    ['tiktok', settings.social?.tiktok, TikTok],
  ].filter(([, url]) => url);

  return (
    <footer className="bg-ink-900 text-[color:var(--text-on-dark-muted)]">
      <div className="container grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <p className="font-display text-[28px] font-semibold leading-tight text-flame-200">{brand}</p>
          <p className="mt-1 text-sm text-gold-300/80">{tr(settings.companyName, lang === 'ta' ? 'en' : 'ta')}</p>
          <p className="mt-4 text-[15px] font-light">{dict.footer.about}</p>
          {social.length > 0 && (
            <div className="mt-5 flex gap-2" aria-label={dict.footer.follow}>
              {social.map(([k, url, Icon]) => (
                <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full border text-gold-300 hover:bg-white/5" style={{ borderColor: 'var(--border-gold)' }} aria-label={k}>
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <nav aria-label={dict.footer.quickLinks}>
          <p className="mb-4 font-display text-xl text-[#FFF8EC]">{dict.footer.quickLinks}</p>
          <ul className="space-y-2 text-[15px]">
            {[
              ['/packages', dict.nav.packages],
              ['/products', dict.nav.products],
              ['/categories', dict.nav.categories],
              ['/custom-package', dict.nav.builder],
              ['/gallery', dict.nav.gallery],
              ['/track-order', dict.nav.track],
            ].map(([p, l]) => (
              <li key={p}>
                <Link href={href(p)} className="hover:text-gold-300">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={dict.nav.about}>
          <p className="mb-4 font-display text-xl text-[#FFF8EC]">{brand}</p>
          <ul className="space-y-2 text-[15px]">
            {[
              ['/about', dict.nav.about],
              ['/contact', dict.nav.contact],
              ['/privacy-policy', dict.footer.privacy],
              ['/terms', dict.footer.terms],
            ].map(([p, l]) => (
              <li key={p}>
                <Link href={href(p)} className="hover:text-gold-300">
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="not-italic">
          <p className="mb-4 font-display text-xl text-[#FFF8EC]">{dict.footer.contactUs}</p>
          <ul className="space-y-3 text-[15px]">
            {settings.phone && (
              <li>
                <a href={telLink(settings.phone)} className="flex items-start gap-3 hover:text-gold-300">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-gold-300" aria-hidden /> {settings.phone}
                </a>
              </li>
            )}
            {wa && (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:text-gold-300">
                  <MessageCircle className="mt-1 h-4 w-4 shrink-0 text-gold-300" aria-hidden /> {dict.common.whatsapp}
                </a>
              </li>
            )}
            {settings.email && (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-start gap-3 break-all hover:text-gold-300">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-gold-300" aria-hidden /> {settings.email}
                </a>
              </li>
            )}
            {tr(settings.address, lang) && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold-300" aria-hidden /> <span>{tr(settings.address, lang)}</span>
              </li>
            )}
            {tr(settings.businessHours, lang) && (
              <li className="flex items-start gap-3">
                <Clock className="mt-1 h-4 w-4 shrink-0 text-gold-300" aria-hidden /> <span>{tr(settings.businessHours, lang)}</span>
              </li>
            )}
          </ul>
        </address>
      </div>
      <div className="border-t" style={{ borderColor: 'rgba(255,232,190,.12)' }}>
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-[13px] sm:flex-row">
          <p>
            © {new Date().getFullYear()} {brand}. {dict.footer.rights}
          </p>
          <p className="text-[color:var(--text-on-dark-muted)]/70">{tr(settings.tagline, lang)}</p>
        </div>
      </div>
    </footer>
  );
}
