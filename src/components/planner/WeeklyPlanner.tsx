import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ShoppingCart,
  Sunrise,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import type { Recipe, MealPlanDay } from '../../types/recipe';
import {
  getRecipes,
  getMealPlans,
  saveMealPlan,
  getShoppingList,
  saveShoppingList,
} from '../../services/storage';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export const WeeklyPlanner: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<Record<string, MealPlanDay>>({});
  const [weekOffset, setWeekOffset] = useState(0);

  // Modal to choose recipe
  const [activeSlot, setActiveSlot] = useState<{
    date: string;
    slot: 'pagi' | 'siang' | 'malam';
  } | null>(null);

  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [r, p] = await Promise.all([getRecipes(), getMealPlans()]);
    setRecipes(r);
    setMealPlans(p);
  };

  // Compute 7 days of the current viewed week
  const currentDays = React.useMemo(() => {
    const today = new Date();
    // Monday as start of week
    const dayOfWeek = today.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday + weekOffset * 7);

    return DAYS.map((name, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dateStr = d.toISOString().slice(0, 10);
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
      const isToday = dateStr === new Date().toISOString().slice(0, 10);
      return { name, dateStr, label: `${dayNum} ${monthName}`, isToday };
    });
  }, [weekOffset]);

  const handleAssignRecipe = async (recipeId: string) => {
    if (!activeSlot) return;
    const { date, slot } = activeSlot;
    const existing = mealPlans[date] || { date };

    const updated: MealPlanDay = {
      ...existing,
      [`${slot}RecipeId`]: recipeId,
    };

    await saveMealPlan(updated);
    setMealPlans((prev) => ({ ...prev, [date]: updated }));
    setActiveSlot(null);
  };

  const handleRemoveRecipe = async (date: string, slot: 'pagi' | 'siang' | 'malam') => {
    const existing = mealPlans[date];
    if (!existing) return;

    const updated = { ...existing };
    delete updated[`${slot}RecipeId`];

    await saveMealPlan(updated);
    setMealPlans((prev) => ({ ...prev, [date]: updated }));
  };

  // Add all ingredients of this week to shopping list
  const handleExportToShopping = async () => {
    const activeDates = currentDays.map((d) => d.dateStr);
    const recipeIds = new Set<string>();

    activeDates.forEach((date) => {
      const plan = mealPlans[date];
      if (plan) {
        if (plan.pagiRecipeId) recipeIds.add(plan.pagiRecipeId);
        if (plan.siangRecipeId) recipeIds.add(plan.siangRecipeId);
        if (plan.malamRecipeId) recipeIds.add(plan.malamRecipeId);
      }
    });

    if (recipeIds.size === 0) {
      alert('Belum ada menu yang dijadwalkan pada minggu ini.');
      return;
    }

    const currentShopping = await getShoppingList();
    const newItems: any[] = [];

    recipeIds.forEach((id) => {
      const recipe = recipes.find((r) => r.id === id);
      if (recipe) {
        recipe.ingredients.forEach((ing) => {
          newItems.push({
            id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: ing.name,
            amount: ing.amount,
            isChecked: false,
            category: 'bahan',
            sourceRecipeTitle: recipe.title,
          });
        });
        recipe.seasonings.forEach((sea) => {
          newItems.push({
            id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            name: sea.name,
            amount: sea.amount,
            isChecked: false,
            category: 'bumbu',
            sourceRecipeTitle: recipe.title,
          });
        });
      }
    });

    await saveShoppingList([...currentShopping, ...newItems]);
    setNotice(`Berhasil menambahkan bahan dari ${recipeIds.size} menu ke Daftar Belanja!`);
    setTimeout(() => setNotice(null), 3500);
  };

  const getRecipe = (id?: string) => recipes.find((r) => r.id === id);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-sage-950">
            Jadwal Menu Mingguan (Meal Planner)
          </h1>
          <p className="text-sage-600 text-xs sm:text-sm mt-1">
            Rencanakan menu harian Anda agar tidak bingung mau masak apa setiap harinya.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Week navigator */}
          <div className="flex items-center gap-1 bg-white border border-sage-200 rounded-xl p-1 shadow-sage-sm">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 hover:bg-sage-100 rounded-lg text-sage-700"
              title="Minggu Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-xs font-bold text-sage-800 hover:bg-sage-100 rounded-lg"
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 hover:bg-sage-100 rounded-lg text-sage-700"
              title="Minggu Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportToShopping}
            className="px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sage-sm transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim Bahan ke Belanjaan</span>
            <span className="sm:hidden">Belanja</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3.5 bg-sage-100 text-sage-800 rounded-xl border border-sage-300 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Grid 7 Days */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {currentDays.map((day) => {
          const plan = mealPlans[day.dateStr] || { date: day.dateStr };
          const pagiRecipe = getRecipe(plan.pagiRecipeId);
          const siangRecipe = getRecipe(plan.siangRecipeId);
          const malamRecipe = getRecipe(plan.malamRecipeId);

          return (
            <div
              key={day.dateStr}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between shadow-sage-sm transition-all ${
                day.isToday
                  ? 'bg-sage-50/80 border-sage-400 ring-2 ring-sage-300/50'
                  : 'bg-white border-sage-200'
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-sage-100 pb-2 mb-3 text-center">
                <span className="font-extrabold text-sm text-sage-900 block">
                  {day.name}
                </span>
                <span className={`text-[11px] font-semibold ${day.isToday ? 'text-sage-700 font-bold' : 'text-sage-500'}`}>
                  {day.label} {day.isToday && '• Hari ini'}
                </span>
              </div>

              {/* 3 Slots: Pagi, Siang, Malam */}
              <div className="space-y-3 flex-1">
                {/* 1. Pagi Slot */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-orange-800">
                    <span className="flex items-center gap-1">
                      <Sunrise className="w-3 h-3 text-orange-500" /> Pagi
                    </span>
                  </div>
                  {pagiRecipe ? (
                    <div className="p-2 bg-orange-50/80 border border-orange-200 rounded-xl text-xs flex items-center justify-between group">
                      <span className="font-semibold text-orange-950 truncate">{pagiRecipe.title}</span>
                      <button
                        onClick={() => handleRemoveRecipe(day.dateStr, 'pagi')}
                        className="text-orange-400 hover:text-red-500 p-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        title="Hapus menu pagi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSlot({ date: day.dateStr, slot: 'pagi' })}
                      className="w-full py-2 px-2 border border-dashed border-sage-200 hover:border-orange-300 rounded-xl text-[11px] text-sage-400 hover:text-orange-700 hover:bg-orange-50/40 flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> <span>Pilih</span>
                    </button>
                  )}
                </div>

                {/* 2. Siang Slot */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-800">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> Siang
                    </span>
                  </div>
                  {siangRecipe ? (
                    <div className="p-2 bg-amber-50/80 border border-amber-200 rounded-xl text-xs flex items-center justify-between group">
                      <span className="font-semibold text-amber-950 truncate">{siangRecipe.title}</span>
                      <button
                        onClick={() => handleRemoveRecipe(day.dateStr, 'siang')}
                        className="text-amber-400 hover:text-red-500 p-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        title="Hapus menu siang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSlot({ date: day.dateStr, slot: 'siang' })}
                      className="w-full py-2 px-2 border border-dashed border-sage-200 hover:border-amber-300 rounded-xl text-[11px] text-sage-400 hover:text-amber-700 hover:bg-amber-50/40 flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> <span>Pilih</span>
                    </button>
                  )}
                </div>

                {/* 3. Malam Slot */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-800">
                    <span className="flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-500" /> Malam
                    </span>
                  </div>
                  {malamRecipe ? (
                    <div className="p-2 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs flex items-center justify-between group">
                      <span className="font-semibold text-indigo-950 truncate">{malamRecipe.title}</span>
                      <button
                        onClick={() => handleRemoveRecipe(day.dateStr, 'malam')}
                        className="text-indigo-400 hover:text-red-500 p-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        title="Hapus menu malam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSlot({ date: day.dateStr, slot: 'malam' })}
                      className="w-full py-2 px-2 border border-dashed border-sage-200 hover:border-indigo-300 rounded-xl text-[11px] text-sage-400 hover:text-indigo-700 hover:bg-indigo-50/40 flex items-center justify-center gap-1 transition-all"
                    >
                      <Plus className="w-3 h-3" /> <span>Pilih</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Selection Modal */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sage-300 space-y-4">
            <div className="flex items-center justify-between border-b border-sage-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sage-950 text-base">
                  Pilih Menu Masakan
                </h3>
                <p className="text-xs text-sage-600">
                  Untuk waktu {activeSlot.slot.toUpperCase()} pada tanggal {activeSlot.date}
                </p>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-sage-400 hover:text-sage-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {recipes.map((r) => {
                const isMatch = r.mealTypes.includes(activeSlot.slot);
                return (
                  <div
                    key={r.id}
                    onClick={() => handleAssignRecipe(r.id)}
                    className="p-3 rounded-2xl border border-sage-200 hover:border-sage-400 hover:bg-sage-50 cursor-pointer flex items-center gap-3 transition-all"
                  >
                    <img
                      src={r.images?.[0] || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400'}
                      alt={r.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-sage-900 truncate">{r.title}</h4>
                        {isMatch && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-sage-200 text-sage-800 shrink-0">
                            Cocok
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-sage-500 mt-0.5">
                        {r.category} • {r.ingredients.length} bahan
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
