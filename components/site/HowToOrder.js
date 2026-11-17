// Bilingual instructions: how to send the order details through WhatsApp.
export default function HowToOrder({ compact = false, className = '' }) {
  const steps = [
    ['ஒவ்வொரு பிரிவையும் திறந்து தேவையான பொருட்களில் “தேர்வு செய்” அழுத்தவும்.', 'Open a category and tap “Select” on the items you need.'],
    ['கீழே உள்ள “வாட்ஸ்அப் மூலம் ஆர்டர் அனுப்புக” பொத்தானை அழுத்தவும்.', 'Tap the “Send Selected Items via WhatsApp” button at the bottom.'],
    ['தேர்ந்தெடுத்த பொருட்கள், அளவு, எண்ணிக்கை அடங்கிய செய்தி வாட்ஸ்அப்பில் தானாகத் தயாராகத் திறக்கும் — அதில் “Send” ஐ அழுத்தி எங்களுக்கு அனுப்புங்கள்.', 'WhatsApp opens with your items, sizes and quantities already typed — just press “Send” to deliver it to us.'],
  ];
  return (
    <aside className={`rounded-2xl border-2 border-gold-500 bg-gradient-to-br from-[#FFF6DC] to-champagne-100 p-4 text-left shadow-1 sm:p-5 ${className}`} role="note" aria-label="How to order">
      <h3 className="text-[17px]">
        ஆர்டர் செய்வது எப்படி? <span className="text-[13px] font-normal text-ink-500">/ How to send your order on WhatsApp</span>
      </h3>
      <ol className="mt-3 space-y-2.5">
        {steps.map(([ta, en], i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-maroon-600 text-[13px] font-semibold text-[#FFF8EC]">{i + 1}</span>
            <span className="min-w-0 text-[14.5px] leading-snug">
              <span className="block font-medium text-ink-900">{ta}</span>
              {!compact && <span className="block text-ink-700">{en}</span>}
            </span>
          </li>
        ))}
      </ol>
      {!compact && (
        <p className="mt-3 text-[13px] text-ink-700">
          விருப்பமானால் பெயர் / நிகழ்வு தேதியைப் பட்டியலில் சேர்க்கலாம். · You can also add your name / event date in the selection list before sending.
        </p>
      )}
    </aside>
  );
}
