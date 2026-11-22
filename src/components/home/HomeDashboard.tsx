import React, { useState, useEffect } from 'react';
import {
  Sunrise,
  Sun,
  Moon,
  Plus,
  Sparkles,
  BookOpen,
  Calendar,
  ShoppingCart,
  ArrowRight,
  Utensils,
  Clock,
} from 'lucide-react';
import type { Recipe, MealPlanDay } from '../../types/recipe';
import { getRecipes, getMealPlans, getShoppingList } from '../../services/storage';
import { MealBadge } from '../recipes/MealBadge';

export const HomeDashboard: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [todayPlan, setTodayPlan] = useState<MealPlanDay | null>(null);
  const [shoppingCount, setShoppingCount] = useState(0);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const [r, p, s] = await Promise.all([
      getRecipes(),
      getMealPlans(),
      getShoppingList(),
    ]);

    setRecipes(r);
    const todayStr = new Date().toISOString().slice(0, 10);
    setTodayPlan(p[todayStr] || null);
    setShoppingCount(s.filter((i) => !i.isChecked).length);
  };

  const pagiRecipe = recipes.find((r) => r.id === todayPlan?.pagiRecipeId);
  const siangRecipe = recipes.find((r) => r.id === todayPlan?.siangRecipeId);
  const malamRecipe = recipes.find((r) => r.id === todayPlan?.malamRecipeId);

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-700 via-sage-600 to-sage-800 text-white p-6 sm:p-10 shadow-sage-lg">
        {/* Background Decorative Circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sage-900/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-sage-100 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-sage-200" />
              <span>AI Combo: CODING-FREE</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-xs font-semibold text-emerald-100 border border-emerald-400/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Database: MySQL VPS (Active)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Hari ini mau masak apa, Koki?
          </h1>

          <p className="text-sage-100/90 text-xs sm:text-sm leading-relaxed">
            Kelola buku resep keluarga, pisahkan bahan dan bumbu dapur, rencanakan jadwal makan mingguan, serta manfaatkan AI 9Router untuk meracik ide masakan baru.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="/resep"
              className="px-5 py-2.5 rounded-xl bg-white text-sage-800 hover:bg-sage-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-sage-600" />
              <span>Buka Katalog Menu</span>
            </a>
            <a
              href="/planner"
              className="px-5 py-2.5 rounded-xl bg-sage-800/60 hover:bg-sage-800 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Jadwal Makan Minggu Ini</span>
            </a>
          </div>
        </div>
      </div>

      {/* Quick KPI Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        <a
          href="/resep"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-sage-200 shadow-sage-sm hover:border-sage-300 transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold mb-2">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-sage-500 font-semibold uppercase tracking-wider block">
              Total Menu Tersimpan
            </span>
            <span className="font-extrabold text-lg sm:text-2xl text-sage-950 mt-0.5 block">
              {recipes.length} Resep
            </span>
          </div>
        </a>

        <a
          href="/planner"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-sage-200 shadow-sage-sm hover:border-sage-300 transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-sage-500 font-semibold uppercase tracking-wider block">
              Menu Hari Ini
            </span>
            <span className="font-extrabold text-lg sm:text-2xl text-sage-950 mt-0.5 block">
              {[pagiRecipe, siangRecipe, malamRecipe].filter(Boolean).length} / 3 Jadwal
            </span>
          </div>
        </a>

        <a
          href="/belanja"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-sage-200 shadow-sage-sm hover:border-sage-300 transition-all flex flex-col justify-between"
        >
          <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold mb-2">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs text-sage-500 font-semibold uppercase tracking-wider block">
              Perlu Dibeli
            </span>
            <span className="font-extrabold text-lg sm:text-2xl text-sage-950 mt-0.5 block">
              {shoppingCount} Item
            </span>
          </div>
        </a>
      </div>

      {/* Menu Hari Ini Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-sage-950">
              Menu Masakan Hari Ini
            </h2>
            <p className="text-sage-600 text-xs sm:text-sm">
              Jadwal makanan keluarga untuk {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
            </p>
          </div>
          <a
            href="/planner"
            className="text-xs sm:text-sm font-bold text-sage-600 hover:text-sage-800 flex items-center gap-1"
          >
            <span>Ubah Jadwal</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pagi */}
          <div className="bg-white rounded-2xl border border-sage-200 p-4 sm:p-5 shadow-sage-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full">
                  <Sunrise className="w-3.5 h-3.5 text-orange-500" />
                  <span>Sarapan Pagi</span>
                </span>
              </div>
              {pagiRecipe ? (
                <div>
                  <h4 className="font-bold text-sage-950 text-base line-clamp-1">{pagiRecipe.title}</h4>
                  <p className="text-xs text-sage-500 line-clamp-2 mt-1">{pagiRecipe.description || 'Pilihan sarapan berenergi.'}</p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-sage-400 italic">Belum dijadwalkan.</p>
                </div>
              )}
            </div>
            <a
              href="/planner"
              className="w-full py-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-700 text-xs font-bold text-center block transition-colors"
            >
              {pagiRecipe ? 'Lihat Detail' : '+ Pasang Menu Pagi'}
            </a>
          </div>

          {/* Siang */}
          <div className="bg-white rounded-2xl border border-sage-200 p-4 sm:p-5 shadow-sage-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Makan Siang</span>
                </span>
              </div>
              {siangRecipe ? (
                <div>
                  <h4 className="font-bold text-sage-950 text-base line-clamp-1">{siangRecipe.title}</h4>
                  <p className="text-xs text-sage-500 line-clamp-2 mt-1">{siangRecipe.description || 'Pilihan santap siang istimewa.'}</p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-sage-400 italic">Belum dijadwalkan.</p>
                </div>
              )}
            </div>
            <a
              href="/planner"
              className="w-full py-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-700 text-xs font-bold text-center block transition-colors"
            >
              {siangRecipe ? 'Lihat Detail' : '+ Pasang Menu Siang'}
            </a>
          </div>

          {/* Malam */}
          <div className="bg-white rounded-2xl border border-sage-200 p-4 sm:p-5 shadow-sage-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-800 bg-indigo-100 px-2.5 py-1 rounded-full">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Makan Malam</span>
                </span>
              </div>
              {malamRecipe ? (
                <div>
                  <h4 className="font-bold text-sage-950 text-base line-clamp-1">{malamRecipe.title}</h4>
                  <p className="text-xs text-sage-500 line-clamp-2 mt-1">{malamRecipe.description || 'Pilihan santap malam hangat.'}</p>
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-xs text-sage-400 italic">Belum dijadwalkan.</p>
                </div>
              )}
            </div>
            <a
              href="/planner"
              className="w-full py-2 rounded-xl bg-sage-50 hover:bg-sage-100 text-sage-700 text-xs font-bold text-center block transition-colors"
            >
              {malamRecipe ? 'Lihat Detail' : '+ Pasang Menu Malam'}
            </a>
          </div>
        </div>
      </div>

      {/* Featured Recipe: Resep Oseng Tempe Puyuh */}
      {recipes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-sage-950">
                Resep Masakan Pilihan
              </h2>
              <p className="text-sage-600 text-xs sm:text-sm">
                Inspirasi masakan rumahan lezat dan praktis
              </p>
            </div>
            <a
              href="/resep"
              className="text-xs sm:text-sm font-bold text-sage-600 hover:text-sage-800 flex items-center gap-1"
            >
              <span>Semua Resep ({recipes.length})</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200 shadow-sage-sm overflow-hidden p-5 sm:p-6 flex flex-col md:flex-row gap-6 items-center">
            <img
              src={recipes[0].images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
              alt={recipes[0].title}
              className="w-full md:w-64 aspect-[4/3] rounded-2xl object-cover shadow-sm shrink-0"
            />
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap gap-1.5">
                {recipes[0].mealTypes.map((t) => (
                  <MealBadge key={t} type={t} size="sm" />
                ))}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sage-100 text-sage-800">
                  {recipes[0].category}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-sage-950">
                {recipes[0].title}
              </h3>
              <p className="text-xs sm:text-sm text-sage-600 line-clamp-2">
                {recipes[0].description}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-sage-700">
                <span>{recipes[0].ingredients.length} Bahan Utama</span>
                <span>•</span>
                <span>{recipes[0].seasonings.length} Bumbu</span>
                <span>•</span>
                <span>{(recipes[0].prepTime || 0) + (recipes[0].cookTime || 0)} Menit</span>
              </div>
              <div className="pt-1">
                <a
                  href="/resep"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <span>Buka Catatan Resep</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
