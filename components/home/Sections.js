import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, ShieldCheck, Receipt, Clock3, MousePointerClick, ClipboardList, PhoneCall, Sparkles, Star, Phone, MessageCircle, MapPin, Mail } from 'lucide-react';
import SectionHead from '@/components/ui/SectionHead';
import CategoryIcon from '@/components/ui/CategoryIcon';
import Reveal from '@/components/ui/Reveal';
import { localePath, tr } from '@/lib/i18n/config';
import { telLink, whatsappLink } from '@/utils/format';

export function CategoryGrid({ categories, lang, dict, heading = true }) {
  return (
    <div>
      {heading && <SectionHead eyebrow={dict.home.categories.eyebrow} title={dict.home.categories.title} intro={dict.home.categories.intro} />}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {categories.map((c, i) => (
          <li key={c._id}>
            <Reveal delay={Math.min(i * 0.04, 0.3)}>
              <Link
                href={localePath(lang, `/categories/${c.slug}`)}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-lg bg-ink-900 p-4 text-[#FFF8EC] shadow-1 transition-shadow hover:shadow-3 sm:aspect-[5/4] sm:p-5"
              >
                {c.image && <Image src={c.image} alt="" fill sizes="(max-width: 640px) 50vw, 25vw" quality={60} className="object-cover opacity-55 transition-transform duration-700 ease-out group-hover:scale-105" />}
                <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-900/90 via-ink-900/30 to-transparent" />
                <span className="relative mb-auto flex h-10 w-10 items-center justify-center rounded-full border text-gold-300 backdrop-blur-sm" style={{ borderColor: 'var(--border-gold)' }}>
                  <CategoryIcon name={c.icon} className="h-5 w-5" />
                </span>
                <span className="relative font-display text-[22px] leading-tight [:lang(ta)_&]:text-[17px]">{tr(c.name, lang)}</span>
                <span className="relative mt-0.5 text-[12.5px] text-[color:var(--text-on-dark-muted)]">
                  {c.productCount} {dict.categoriesPage.count}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WhyUs({ dict }) {
  const icons = [Users, ShieldCheck, Receipt, Clock3];
  return (
    <section className="section bg-champagne-100" aria-labelledby="why-title">
      <div className="container">
        <SectionHead eyebrow={dict.home.why.eyebrow} title={<span id="why-title">{dict.home.why.title}</span>} center />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.why.items.map((it, i) => {
            const Icon = icons[i % icons.length];
            return (
              <Reveal key={it.title} delay={i * 0.06} className="card p-7">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-100 text-maroon-600">
                  <Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden />
                </span>
                <h3 className="mt-5 text-[24px] [:lang(ta)_&]:text-[19px]">{it.title}</h3>
                <p className="mt-2 text-[15px] font-light text-ink-500">{it.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks({ dict }) {
  const icons = [MousePointerClick, ClipboardList, PhoneCall, Sparkles];
  return (
    <section className="section bg-maroon-900 text-[#FFF8EC]" aria-labelledby="how-title">
      <div className="container">
        <SectionHead eyebrow={dict.home.how.eyebrow} title={<span id="how-title">{dict.home.how.title}</span>} light center />
        <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {dict.home.how.steps.map((s, i) => {
            const Icon = icons[i];
            return (
              <li key={s.title} className="relative text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border text-gold-300" style={{ borderColor: 'var(--border-gold)' }}>
                  <Icon className="h-6 w-6" strokeWidth={1.6} aria-hidden />
                </span>
                <p className="mt-4 font-display text-[15px] tracking-[.2em] text-gold-300">0{i + 1}</p>
                <h3 className="mt-1 text-[26px] !text-[#FFF8EC] [:lang(ta)_&]:text-[20px]">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[240px] text-[15px] font-light text-[color:var(--text-on-dark-muted)]">{s.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function Testimonials({ testimonials, lang, dict }) {
  if (!testimonials?.length) return null;
  return (
    <section className="section" aria-labelledby="testimonials-title">
      <div className="container">
        <SectionHead eyebrow={dict.home.testimonials.eyebrow} title={<span id="testimonials-title">{dict.home.testimonials.title}</span>} center />
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.slice(0, 6).map((t, i) => (
            <Reveal key={t._id || i} delay={i * 0.06} as="figure" className="card flex flex-col p-7">
              <div className="flex gap-0.5 text-gold-500" aria-label={`${t.rating || 5}/5`}>
                {Array.from({ length: t.rating || 5 }).map((_, k) => (
                  <Star key={k} className="h-4 w-4 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 font-display text-[21px] italic leading-snug text-ink-900 [:lang(ta)_&]:not-italic [:lang(ta)_&]:text-[16px]">“{tr(t.quote, lang)}”</blockquote>
              <figcaption className="mt-5 border-t pt-4" style={{ borderColor: 'var(--border-subtle)' }}>
                <p className="font-medium text-ink-900">{t.name}</p>
                <p className="text-sm text-ink-500">{tr(t.event, lang)}</p>
              </figcaption>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryPreview({ gallery, lang, dict }) {
  if (!gallery?.length) return null;
  const items = gallery.slice(0, 8);
  return (
    <section className="section" aria-labelledby="gallery-title">
      <div className="container">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHead eyebrow={dict.home.gallery.eyebrow} title={<span id="gallery-title">{dict.home.gallery.title}</span>} className="!mb-0" />
          <Link href={localePath(lang, '/gallery')} className="btn btn-secondary self-start sm:self-auto">
            {dict.home.gallery.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {items.map((g, i) => (
            <figure key={g._id || i} className={`relative overflow-hidden rounded-lg bg-champagne-100 ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[4/5]'}`}>
              <Image src={g.url} alt={tr(g.caption, lang) || dict.home.gallery.title} fill sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'} quality={60} className="object-cover transition-transform duration-700 ease-out hover:scale-105" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BuilderCta({ lang, dict }) {
  return (
    <section className="section bg-ivory-50">
      <div className="container">
        <div className="relative overflow-hidden rounded-xl bg-ink-900 p-8 text-[#FFF8EC] shadow-3 sm:p-12 lg:p-16">
          <Image src="/images/tents/tents-08.webp" alt="" fill sizes="100vw" quality={60} className="object-cover opacity-30" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-ink-900/30" />
          <div className="relative max-w-xl">
            <p className="eyebrow !text-gold-300">{dict.home.builder.eyebrow}</p>
            <h2 className="h-section !text-[#FFF8EC]">{dict.home.builder.title}</h2>
            <p className="mt-4 text-[17px] font-light text-[color:var(--text-on-dark-muted)]">{dict.home.builder.text}</p>
            <Link href={localePath(lang, '/custom-package')} className="btn btn-gold btn-lg mt-8">
              {dict.home.builder.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ContactBlock({ settings, lang, dict }) {
  const wa = whatsappLink(settings.whatsapp || settings.phone, dict.contact.whatsappText, settings.phoneCountryCode);
  const tel = telLink(settings.phone);
  return (
    <section className="section bg-champagne-100" aria-labelledby="contact-title">
      <div className="container grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHead eyebrow={dict.home.contact.eyebrow} title={<span id="contact-title">{dict.home.contact.title}</span>} intro={dict.home.contact.intro} className="!mb-8" />
          <div className="flex flex-col gap-3 sm:flex-row">
            {tel && (
              <a href={tel} className="btn btn-primary btn-lg">
                <Phone className="h-4 w-4" /> {dict.common.call}
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-lg border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5a]">
                <MessageCircle className="h-4 w-4" /> {dict.common.whatsapp}
              </a>
            )}
            <Link href={localePath(lang, '/contact')} className="btn btn-secondary btn-lg">
              {dict.nav.contact}
            </Link>
          </div>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {settings.phone && (
            <li className="rounded-xl border bg-white p-6 shadow-1">
              <Phone className="h-5 w-5 text-gold-700" aria-hidden />
              <p className="mt-3 text-sm text-ink-500">{dict.contact.phone}</p>
              <a href={tel} className="text-lg font-medium text-ink-900">{settings.phone}</a>
            </li>
          )}
          {settings.email && (
            <li className="rounded-xl border bg-white p-6 shadow-1">
              <Mail className="h-5 w-5 text-gold-700" aria-hidden />
              <p className="mt-3 text-sm text-ink-500">{dict.contact.email}</p>
              <a href={`mailto:${settings.email}`} className="break-all text-lg font-medium text-ink-900">{settings.email}</a>
            </li>
          )}
          {tr(settings.address, lang) && (
            <li className="rounded-xl border bg-white p-6 shadow-1 sm:col-span-2">
              <MapPin className="h-5 w-5 text-gold-700" aria-hidden />
              <p className="mt-3 text-sm text-ink-500">{dict.contact.address}</p>
              <p className="text-lg text-ink-900">{tr(settings.address, lang)}</p>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
