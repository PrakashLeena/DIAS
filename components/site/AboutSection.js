import { BRAND, MANNAR_AREAS } from '@/lib/seo';

/** Visible, readable introduction with the business name, services and service area (good for search engines and customers). */
export default function AboutSection() {
  const services = [
    'திருமண & மணமேடை அலங்காரம் (wedding & stage decoration)',
    'துணி & தகர பந்தல் (cloth and tin sheet canopies)',
    'ஆலய / கோவில் திருவிழா பந்தல் (church feast & kovil festival panthal)',
    'மின்விளக்கு, ஒலி அமைப்பு (lighting and sound system)',
    'கதிரைகள், சமையல் பாத்திரங்கள், பஃபே செட் (chairs, cooking vessels, buffet sets)',
    'நுழைவாயில் அலங்காரம், புகை இயந்திரம், வாகன வாடகை (entrance décor, smoke machine, vehicle hire)',
  ];
  return (
    <section id="about" className="mx-auto max-w-[1000px] px-4 py-12" aria-labelledby="about-title">
      <h2 id="about-title" className="text-center text-[clamp(22px,3.6vw,32px)]">
        மன்னார் மாவட்டம் முழுவதும் உங்கள் நம்பிக்கையான பந்தல் சேவை
        <span className="mt-1 block text-[0.55em] font-normal text-ink-500">Trusted panthal &amp; event decoration service across Mannar District</span>
      </h2>
      <p className="mx-auto mt-5 max-w-3xl text-center text-[15.5px] leading-relaxed text-ink-700">
        <strong>{BRAND.ta}</strong> ({BRAND.en}) — {BRAND.tagline}. திருமணம், பிறந்தநாள், மஞ்சள் நீராட்டு விழா, வீடு குடிபுகுதல், ஆலய திருவிழா மற்றும் இறுதி நிகழ்வுகளுக்குத் தேவையான பந்தல், மேடை அலங்காரம் மற்றும் உபகரணங்களை
        வங்காலையிலிருந்து மன்னார் மாவட்டம் முழுவதும் — மன்னார் நகரம், பேசாலை, தலைமன்னார், முருங்கன், மடு, அடம்பன், நானாட்டான், முசலி — வழங்குகிறோம்.
      </p>
      <p className="mx-auto mt-3 max-w-3xl text-center text-[14.5px] leading-relaxed text-ink-500">
        {BRAND.en} (also known as Watson / Watsan / Vatshan Panthal Sevai) provides canopy and pandal rental, stage backdrops, lighting, sound and event equipment for weddings, birthdays, puberty ceremonies, housewarmings,
        church feasts and kovil festivals across the whole of Mannar District, Sri Lanka — from our base in Vankalai to Mannar Town, Pesalai, Thalaimannar, Murunkan, Madhu, Adampan, Nanattan and Musali.
      </p>
      <ul className="mx-auto mt-6 grid max-w-3xl gap-2 text-[14.5px] text-ink-700 sm:grid-cols-2">
        {services.map((s) => (
          <li key={s} className="flex gap-2 rounded-lg bg-champagne-100/70 px-3 py-2">
            <span className="text-gold-700" aria-hidden>✦</span>
            <span>{s}</span>
          </li>
        ))}
      </ul>

      <div id="service-area" className="mx-auto mt-10 max-w-3xl">
        <h3 className="text-center text-[clamp(18px,2.6vw,24px)]">
          சேவை வழங்கும் பகுதிகள் <span className="text-[0.7em] font-normal text-ink-500">/ Areas we serve in Mannar District</span>
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {MANNAR_AREAS.map((a) => (
            <div key={a.ds.en} className="rounded-xl border bg-white p-3.5" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-[14.5px] font-semibold text-maroon-700">
                {a.ds.ta} <span className="font-normal text-ink-500">/ {a.ds.en}</span>
              </p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-700">{a.places.map(([en, ta]) => `${ta} (${en})`).join(' · ')}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
