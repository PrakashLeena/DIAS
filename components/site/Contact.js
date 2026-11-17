'use client';

import { Phone } from 'lucide-react';
import { useSite } from './SiteProvider';
import { WhatsAppIcon } from './icons';
import { GREETING, prettyPhone, telHref, waHref } from '@/lib/contact';

/** One "Call" button per owner phone number — each is a direct tel: link. */
export function CallButtons({ className = '', btnClass = '', label = true }) {
  const { contact } = useSite();
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {contact.phones.map((p) => (
        <a key={p} href={telHref(p)} className={`btn btn-call ${btnClass}`}>
          <Phone className="h-4 w-4 shrink-0" aria-hidden />
          <span className="leading-tight">
            {label && <span className="block text-[11px] font-medium opacity-80">அழைக்க / Call</span>}
            <span className="block">{prettyPhone(p)}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

/** Opens WhatsApp to the owner with an optional prefilled message. */
export function WhatsAppButton({ message = GREETING, className = '', children }) {
  const { contact } = useSite();
  return (
    <a href={waHref(contact.whatsapp, message)} target="_blank" rel="noopener noreferrer" className={`btn btn-whatsapp ${className}`}>
      <WhatsAppIcon className="h-5 w-5" />
      {children || (
        <span className="leading-tight">
          <span className="block">WhatsApp</span>
        </span>
      )}
    </a>
  );
}
