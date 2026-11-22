import React from 'react';
import { Home, BookOpen, Calendar, ShoppingCart, Sparkles } from 'lucide-react';

interface BottomNavProps {
  currentPath?: string;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath = '/' }) => {
  const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/resep', label: 'Resep', icon: BookOpen },
    { href: '/planner', label: 'Planner', icon: Calendar },
    { href: '/belanja', label: 'Belanja', icon: ShoppingCart },
    { href: '/inspirasi', label: 'Inspirasi', icon: Sparkles },
  ];

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sage-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              active
                ? 'text-sage-800 font-extrabold scale-105'
                : 'text-sage-400 hover:text-sage-600'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                active ? 'bg-sage-100 text-sage-700' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
};
