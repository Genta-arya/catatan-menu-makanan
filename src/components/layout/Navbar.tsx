import React, { useState } from 'react';
import {
  UtensilsCrossed,
  BookOpen,
  Calendar,
  ShoppingCart,
  Sparkles,
  Settings,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { SettingsModal } from '../settings/SettingsModal';

interface NavbarProps {
  currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath = '/' }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/resep', label: 'Katalog Menu', icon: BookOpen },
    { href: '/planner', label: 'Meal Planner', icon: Calendar },
    { href: '/belanja', label: 'Daftar Belanja', icon: ShoppingCart },
    { href: '/inspirasi', label: 'Inspirasi AI', icon: Sparkles },
  ];

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-sage-200 shadow-sage-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-sage-600 text-white flex items-center justify-center shadow-sage-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-sage-950 block leading-tight">
                DapurSage
              </span>
              <span className="text-[10px] text-sage-500 font-semibold uppercase tracking-wider block">
                Catatan Menu Makanan
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                    active
                      ? 'bg-sage-100 text-sage-900 border border-sage-300/60 shadow-sm'
                      : 'text-sage-600 hover:text-sage-900 hover:bg-sage-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-sage-600' : 'text-sage-400'}`} />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>

          {/* Right Actions: Settings & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl hover:bg-sage-100 border border-sage-200 text-sage-700 shadow-sage-sm transition-colors"
              title="Pengaturan 9Router AI"
            >
              <Settings className="w-4 h-4 text-sage-600" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl hover:bg-sage-100 border border-sage-200 text-sage-700"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-sage-200 bg-white p-4 space-y-1 shadow-lg animate-fadeIn">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? 'bg-sage-100 text-sage-900 border border-sage-300'
                      : 'text-sage-600 hover:bg-sage-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-sage-500" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};
