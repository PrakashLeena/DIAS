'use client';

import Link from 'next/link';
import { useSite } from './SiteProvider';
import { CallButtons, WhatsAppButton } from './Contact';
import { WriteGoogleReviewLink } from './Reviews';

export default function Footer() {
  const { site } = useSite();
  return (
    <footer className="bg-maroon-900 py-10 text-[#FFF8EC]">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-4 text-center">
        <p className="font-display text-2xl font-semibold">
          {site.name.ta} <span className="text-base font-normal text-[#FFF8EC]/70">· {site.name.en}</span>
        </p>
        <p className="text-sm text-[#FFF8EC]/75">உடனடித் தொடர்புக்கு / Contact the owner directly</p>
        <div className="flex flex-wrap justify-center gap-2">
          <CallButtons className="justify-center" />
          <WhatsAppButton className="min-h-[46px]">
            <span className="text-left leading-tight">
              <span className="block text-[11px] font-medium opacity-90">வாட்ஸ்அப் / Chat on</span>
              <span className="block">WhatsApp</span>
            </span>
          </WhatsAppButton>
        </div>
        <WriteGoogleReviewLink className="btn btn-glass btn-sm" />
        <Link href="/rating" className="text-[13.5px] font-medium text-gold-300 underline">
          மதிப்புரைகள் / Customer reviews
        </Link>
        <Link href="/admin" className="mt-2 text-[12.5px] text-[#FFF8EC]/50 underline hover:text-[#FFF8EC]">
          நிர்வாகம் / Admin
        </Link>
      </div>
    </footer>
  );
}
