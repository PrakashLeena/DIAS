export default function SectionHead({ eyebrow, title, intro, center = false, as: Tag = 'h2', light = false, className = '' }) {
  return (
    <div className={`mb-10 max-w-2xl sm:mb-12 ${center ? 'mx-auto text-center' : ''} ${className}`}>
      {eyebrow && <p className={`eyebrow ${light ? '!text-gold-300' : ''}`}>{eyebrow}</p>}
      <Tag className={`h-section ${light ? '!text-[#FFF8EC]' : ''}`}>{title}</Tag>
      {intro && <p className={`mt-4 text-[17px] font-light ${light ? 'text-[color:var(--text-on-dark-muted)]' : 'text-ink-500'}`}>{intro}</p>}
    </div>
  );
}
