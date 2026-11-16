import { Phone, MessageCircle } from 'lucide-react';
import { telLink, whatsappLink } from '@/utils/format';

/** Sticky WhatsApp + call buttons (pure links, no JavaScript). */
export default function FloatingContact({ settings, dict }) {
  const wa = whatsappLink(settings.whatsapp || settings.phone, dict.contact.whatsappText, settings.phoneCountryCode);
  const tel = telLink(settings.phone);
  if (!wa && !tel) return null;
  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-3 sm:bottom-6 sm:right-6">
      {tel && (
        <a href={tel} aria-label={dict.common.call} className="flex h-12 w-12 items-center justify-center rounded-full bg-maroon-600 text-white shadow-3 transition-transform hover:scale-105">
          <Phone className="h-5 w-5" />
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={dict.common.whatsapp} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-3 transition-transform hover:scale-105">
          <MessageCircle className="h-6 w-6" />
        </a>
      )}
    </div>
  );
}
