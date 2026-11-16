import { Tent, Warehouse, Crown, Table2, Armchair, CookingPot, Flower2, Package, Lightbulb, UtensilsCrossed, Sparkles } from 'lucide-react';

export const CATEGORY_ICONS = {
  'tent-large': Warehouse,
  tent: Tent,
  stage: Crown,
  table: Table2,
  chair: Armchair,
  cooking: CookingPot,
  decoration: Flower2,
  lighting: Lightbulb,
  tableware: UtensilsCrossed,
  other: Package,
  sparkles: Sparkles,
};

export default function CategoryIcon({ name, className = 'h-6 w-6', strokeWidth = 1.6 }) {
  const Icon = CATEGORY_ICONS[name] || Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
