import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Heart,
} from 'lucide-react';
import { login } from '../../services/auth';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (res.success) {
        window.location.href = '/';
      } else {
        setError(res.message || 'Username atau password salah.');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-sage-600 text-white items-center justify-center shadow-sage-md mb-2 animate-bounce">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-sage-950 tracking-tight">
            Dapur Radha
          </h1>
          <p className="text-sm text-sage-600 font-medium">
            Catatan Menu Makanan & Meal Planner Cerdas
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-7 sm:p-8 border border-sage-200/80 shadow-sage-lg space-y-6">
          <div className="border-b border-sage-100 pb-3">
            <h2 className="font-extrabold text-lg text-sage-900">
              Selamat Datang Kembali!
            </h2>
            <p className="text-xs text-sage-500 mt-0.5">
              Silakan masuk untuk mengakses resep dan jadwal menu Anda.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sage-500" />
                <span>Username</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-sage-300 focus:border-sage-600 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 transition-all font-medium"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sage-500" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-sage-300 focus:border-sage-600 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 pr-11 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full py-3.5 px-4 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-sage-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dapur Radha'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick hint pill */}
          <div className="pt-2 border-t border-sage-100 flex items-center justify-center gap-1 text-[11px] text-sage-500 font-medium">
            <Heart className="w-3.5 h-3.5 text-sage-400 fill-sage-400" />
            <span>Resep spesial penuh cinta dari Dapur Radha</span>
          </div>
        </div>
      </div>
    </div>
  );
};
