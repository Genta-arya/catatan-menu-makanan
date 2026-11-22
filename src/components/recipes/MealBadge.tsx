import React from 'react';
import { Sunrise, Sun, Moon } from 'lucide-react';
import type { MealType } from '../../types/recipe';

interface MealBadgeProps {
  type: MealType;
  size?: 'sm' | 'md';
}

export const MealBadge: React.FC<MealBadgeProps> = ({ type, size = 'md' }) => {
  const isSmall = size === 'sm';

  switch (type) {
    case 'pagi':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-orange-100 text-orange-800 border border-orange-200 ${
            isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
          title="Menu Sarapan Pagi"
        >
          <Sunrise className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Pagi</span>
        </span>
      );
    case 'siang':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200 ${
            isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
          title="Menu Makan Siang"
        >
          <Sun className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Siang</span>
        </span>
      );
    case 'malam':
      return (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 ${
            isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
          }`}
          title="Menu Makan Malam"
        >
          <Moon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          <span>Malam</span>
        </span>
      );
    default:
      return null;
  }
};
