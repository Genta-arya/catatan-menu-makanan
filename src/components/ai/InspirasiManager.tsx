import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Shuffle,
  ArrowRight,
  Clock,
  Utensils,
  RefreshCw,
  AlertCircle,
  Check,
} from 'lucide-react';
import type { Recipe, MealType } from '../../types/recipe';
import { getRecipes } from '../../services/storage';
import { generateRecipeWithAI } from '../../services/aiService';
import { MealBadge } from '../recipes/MealBadge';

export const InspirasiManager: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<MealType | 'all'>('all');
  const [randomRecipe, setRandomRecipe] = useState<Recipe | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // AI Generator state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiDishIdea, setAiDishIdea] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const list = await getRecipes();
    setRecipes(list);
    if (list.length > 0) {
      setRandomRecipe(list[0]);
    }
  };

  const spinRandom = () => {
    const candidates = selectedMealType === 'all'
      ? recipes
      : recipes.filter((r) => r.mealTypes.includes(selectedMealType));

    if (candidates.length === 0) {
      alert('Tidak ada resep untuk kategori waktu makan ini.');
      return;
    }

    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = candidates[Math.floor(Math.random() * candidates.length)];
      setRandomRecipe(rand);
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiError(null);
    setAiDishIdea(null);

    try {
      const result = await generateRecipeWithAI(aiPrompt.trim());
      setAiDishIdea(result);
    } catch (err: any) {
      setAiError(err.message || 'Gagal terhubung dengan Asisten AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-sage-950">
          Inspirasi & Rekomendasi Menu
        </h1>
        <p className="text-sage-600 text-xs sm:text-sm mt-1">
          Bimbang mau masak apa hari ini? Gunakan pengacak menu atau tanyakan ide kreatif ke Asisten Koki AI.
        </p>
      </div>

      {/* Feature 1: Roulette Acak Resep dari Koleksi */}
      <div className="bg-white rounded-3xl border border-sage-200 shadow-sage-md p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold">
              <Shuffle className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-sage-900 text-base sm:text-lg">
                Pengacak Menu Masakan Hari Ini
              </h2>
              <p className="text-xs text-sage-500">
                Pilih waktu makan lalu putar pengacak untuk memilih menu dari katalog.
              </p>
            </div>
          </div>

          {/* Filter Waktu */}
          <div className="flex items-center gap-1.5 bg-sage-50 p-1 rounded-xl border border-sage-200">
            {(['all', 'pagi', 'siang', 'malam'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  selectedMealType === type
                    ? 'bg-sage-700 text-white shadow-sm'
                    : 'text-sage-600 hover:text-sage-900'
                }`}
              >
                {type === 'all' ? 'Semua' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Random Card */}
        {randomRecipe ? (
          <div className="bg-gradient-to-br from-sage-50 to-sage-100/50 rounded-2xl border border-sage-200 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-48 aspect-video sm:aspect-square rounded-xl overflow-hidden shadow-sm shrink-0">
              <img
                src={randomRecipe.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                alt={randomRecipe.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                {randomRecipe.mealTypes.map((t) => (
                  <MealBadge key={t} type={t} size="sm" />
                ))}
                <span className="text-xs font-bold text-sage-700 bg-white px-2.5 py-0.5 rounded-full border border-sage-200">
                  {randomRecipe.category}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-sage-900">
                {randomRecipe.title}
              </h3>

              <p className="text-xs sm:text-sm text-sage-600 line-clamp-2">
                {randomRecipe.description || 'Pilihan lezat dan praktis untuk dihidangkan hari ini.'}
              </p>

              <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-sage-700 pt-1">
                <span className="flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-sage-500" />
                  {randomRecipe.ingredients.length} Bahan
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sage-500" />
                  {(randomRecipe.prepTime || 0) + (randomRecipe.cookTime || 0)} Menit
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-sage-500 text-center py-8">
            Belum ada resep yang tersimpan.
          </p>
        )}

        <div className="flex justify-center">
          <button
            onClick={spinRandom}
            disabled={isSpinning || recipes.length === 0}
            className="px-8 py-3.5 rounded-2xl bg-sage-600 hover:bg-sage-700 active:scale-95 text-white font-extrabold text-sm sm:text-base shadow-sage-md flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Shuffle className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Mengacak Menu...' : '🎲 Acak Menu Sekarang!'}</span>
          </button>
        </div>
      </div>

      {/* Feature 2: Tanya Asisten AI */}
      <div className="bg-white rounded-3xl border border-sage-200 shadow-sage-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-sage-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-sage-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-sage-900 text-base sm:text-lg">
              Tanya Asisten Koki AI
            </h2>
            <p className="text-xs text-sage-500">
              Ketikkan bahan yang ada di kulkas Anda, AI akan meracikkan ide menu masakan lengkap.
            </p>
          </div>
        </div>

        <form onSubmit={handleAskAI} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              required
              placeholder="Contoh: Saya punya tempe, telur puyuh, cabe rawit, bumbu kecap..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 shadow-sage-sm"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiPrompt.trim()}
              className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isAiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Meracik...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Buat Resep</span>
                </>
              )}
            </button>
          </div>
        </form>

        {aiError && (
          <div className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {/* AI Result Presentation */}
        {aiDishIdea && (
          <div className="p-6 bg-sage-50/80 rounded-2xl border border-sage-300 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-sage-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider block">
                  Rekomendasi Asisten Koki AI
                </span>
                <h3 className="text-xl font-extrabold text-sage-950 mt-0.5">
                  {aiDishIdea.title}
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sage-200 text-sage-800">
                {aiDishIdea.category}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-sage-200">
                <h4 className="font-bold text-xs text-sage-800 uppercase tracking-wider mb-2">
                  Bahan Utama
                </h4>
                <ul className="text-xs text-sage-700 space-y-1">
                  {aiDishIdea.ingredients.map((ing: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>• {ing.name}</span>
                      <span className="text-sage-500 font-medium">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl border border-sage-200">
                <h4 className="font-bold text-xs text-sage-800 uppercase tracking-wider mb-2">
                  Bumbu & Rempah
                </h4>
                <ul className="text-xs text-sage-700 space-y-1">
                  {aiDishIdea.seasonings.map((sea: any, i: number) => (
                    <li key={i} className="flex justify-between">
                      <span>• {sea.name}</span>
                      <span className="text-sage-500 font-medium">{sea.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-sage-200">
              <h4 className="font-bold text-xs text-sage-800 uppercase tracking-wider mb-2">
                Langkah Pembuatan
              </h4>
              <ol className="text-xs text-sage-700 space-y-1.5 list-decimal list-inside">
                {aiDishIdea.steps.map((st: string, i: number) => (
                  <li key={i}>{st}</li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
