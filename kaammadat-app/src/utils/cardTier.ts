export type CardTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond' | 'Platinum' | 'Heroic' | 'Grandmaster';

export const CARD_TIERS: CardTier[] = [
  'Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum', 'Heroic', 'Grandmaster'
];

export function getAutomaticCardTier(createdAt?: string): CardTier {
  if (!createdAt) return 'Bronze';
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 30) return 'Bronze';
  if (days <= 90) return 'Silver';
  if (days <= 180) return 'Gold';
  if (days <= 365) return 'Diamond';
  if (days <= 730) return 'Platinum';
  if (days <= 1095) return 'Heroic';
  return 'Grandmaster';
}

export function getEffectiveCardTier(user: { createdAt?: string; cardOverride?: string }): CardTier {
  if (user.cardOverride && CARD_TIERS.includes(user.cardOverride as CardTier)) {
    return user.cardOverride as CardTier;
  }
  return getAutomaticCardTier(user.createdAt);
}

export const CARD_STYLES: Record<CardTier, { bg: string; text: string; border: string; discount: string; emoji: string }> = {
  Bronze:      { bg: 'from-orange-800 to-orange-700',     text: 'text-orange-100',  border: 'border-orange-600',  discount: '1%',  emoji: '🟫' },
  Silver:      { bg: 'from-gray-400 to-gray-300',          text: 'text-gray-900',    border: 'border-gray-300',    discount: '3%',  emoji: '⬜' },
  Gold:        { bg: 'from-yellow-500 to-yellow-400',      text: 'text-yellow-950',  border: 'border-yellow-300',  discount: '5%',  emoji: '🟡' },
  Diamond:     { bg: 'from-cyan-500 to-blue-400',          text: 'text-white',       border: 'border-cyan-300',    discount: '8%',  emoji: '💎' },
  Platinum:    { bg: 'from-slate-300 to-slate-200',        text: 'text-slate-900',   border: 'border-slate-400',   discount: '12%', emoji: '🔵' },
  Heroic:      { bg: 'from-purple-700 to-purple-500',      text: 'text-white',       border: 'border-purple-400',  discount: '18%', emoji: '🟣' },
  Grandmaster: { bg: 'from-red-700 via-gray-900 to-red-800', text: 'text-red-100',  border: 'border-red-500',     discount: '25%', emoji: '👑' },
};
