import React, { useState, useEffect } from 'react';
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
  LogOut,
  User,
} from 'lucide-react';
import { SettingsModal } from '../settings/SettingsModal';
import { logout, isAuthenticated } from '../../services/auth';

interface NavbarProps {
  currentPath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath = '/' }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const isLoginPage = currentPath === '/login' || currentPath === '/login/';

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
          <a href={isLoginPage ? '/login' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-sage-600 text-white flex items-center justify-center shadow-sage-sm group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-sage-950 block leading-tight">
                Dapur Radha
              </span>
              <span className="text-[10px] text-sage-500 font-semibold uppercase tracking-wider block">
                Catatan Menu Makanan
              </span>
            </div>
          </a>

          {!isLoginPage && (
            <>
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

              {/* Right Actions: User Badge, Settings, Logout & Mobile Toggle */}
              <div className="flex items-center gap-2">
                {isLoggedIn && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-sage-100/80 rounded-xl border border-sage-200 text-xs font-bold text-sage-800">
                    <div className="w-5 h-5 rounded-full bg-sage-600 text-white flex items-center justify-center text-[10px]">
                      R
                    </div>
                    <span>Radha</span>
                  </div>
                )}

                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-2.5 rounded-xl hover:bg-sage-100 border border-sage-200 text-sage-700 shadow-sage-sm transition-colors"
                  title="Preferensi & Pengaturan"
                >
                  <Settings className="w-4 h-4 text-sage-600" />
                </button>

                {isLoggedIn && (
                  <button
                    onClick={() => logout()}
                    className="p-2.5 rounded-xl hover:bg-red-50 border border-red-200 text-red-600 shadow-sage-sm transition-colors"
                    title="Keluar dari Akun"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}

                {/* Mobile Menu Toggle Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2.5 rounded-xl hover:bg-sage-100 border border-sage-200 text-sage-700"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Dropdown Menu */}
        {!isLoginPage && isMobileMenuOpen && (
          <div className="md:hidden border-t border-sage-200 bg-white p-4 space-y-2 shadow-lg animate-fadeIn">
            {isLoggedIn && (
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-sage-100 px-2">
                <div className="flex items-center gap-2 text-sm font-bold text-sage-800">
                  <div className="w-7 h-7 rounded-full bg-sage-600 text-white flex items-center justify-center text-xs">
                    R
                  </div>
                  <span>Hai, Radha!</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            )}
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
