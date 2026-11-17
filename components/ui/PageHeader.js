// Compact page banner used on inner pages (sits below the floating navbar).
export default function PageHeader({ eyebrow, title, intro, children }) {
  return (
    <header className="relative overflow-hidden bg-ink-900 pb-14 pt-32 text-[#FFF8EC] sm:pb-16 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.18]" style={{ background: 'radial-gradient(60% 80% at 80% 0%, #D4A845 0%, transparent 60%)' }} />
      <div className="container relative">
        {eyebrow && <p className="eyebrow !text-gold-300">{eyebrow}</p>}
        <h1 className="mt-2 max-w-3xl text-[clamp(34px,5vw,60px)] !text-[#FFF8EC] [:lang(ta)_&]:text-[clamp(28px,4vw,46px)]">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-[17px] font-light text-[color:var(--text-on-dark-muted)]">{intro}</p>}
        {children}
      </div>
    </header>
  );
}
