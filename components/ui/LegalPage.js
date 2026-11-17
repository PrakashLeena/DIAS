import PageHeader from '@/components/ui/PageHeader';
import { tr } from '@/lib/i18n/config';

export default function LegalPage({ content, settings, lang, updated }) {
  const fill = (s) =>
    s
      .replaceAll('{company}', tr(settings.companyName, lang))
      .replaceAll('{phone}', settings.phone || '—')
      .replaceAll('{email}', settings.email || '—');
  return (
    <>
      <PageHeader title={content.title} />
      <article className="container max-w-3xl py-12 sm:py-16">
        <div className="prose-body">
          {content.sections.map(([h, p]) => (
            <section key={h}>
              <h2>{h}</h2>
              <p>{fill(p)}</p>
            </section>
          ))}
        </div>
        {updated && <p className="mt-10 text-sm text-ink-500">{updated}</p>}
      </article>
    </>
  );
}
