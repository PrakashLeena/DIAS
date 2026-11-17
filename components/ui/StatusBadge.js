import { CheckCircle2, Clock3, XCircle, PartyPopper } from 'lucide-react';

const STYLES = {
  pending: { cls: 'bg-[#C98A16]/12 text-[#8a5d0b] ring-[#C98A16]/30', Icon: Clock3 },
  accepted: { cls: 'bg-[#3E8E4F]/12 text-[#2c6a3a] ring-[#3E8E4F]/30', Icon: CheckCircle2 },
  cancelled: { cls: 'bg-[#B3122E]/10 text-[#B3122E] ring-[#B3122E]/25', Icon: XCircle },
  completed: { cls: 'bg-[#5A6E8C]/12 text-[#3f5170] ring-[#5A6E8C]/30', Icon: PartyPopper },
};

export default function StatusBadge({ status, label, size = 'md' }) {
  const s = STYLES[status] || STYLES.pending;
  const Icon = s.Icon;
  return (
    <span className={`badge ring-1 ${s.cls} ${size === 'lg' ? '!px-4 !py-1.5 !text-sm' : ''}`}>
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden />
      {label || status}
    </span>
  );
}
