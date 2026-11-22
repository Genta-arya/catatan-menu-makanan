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
  BookmarkPlus,
  BookOpen,
} from 'lucide-react';
import type { Recipe, MealType } from '../../types/recipe';
import { getRecipes, saveRecipe } from '../../services/storage';
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
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const list = await getRecipes();
    setRecipes(list);
    if (list.length > 0 && !randomRecipe) {
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
    setIsSaved(false);

    try {
      const result = await generateRecipeWithAI(aiPrompt.trim());
      setAiDishIdea(result);
    } catch (err: any) {
      setAiError(err.message || 'Gagal terhubung dengan Asisten AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSaveToCatalog = async () => {
    if (!aiDishIdea) return;
    setIsSaving(true);
    try {
      const newRecipe: Recipe = {
        id: `resep-${Date.now()}`,
        title: aiDishIdea.title,
        description: aiDishIdea.notes || `Resep kreasi asisten AI dari bahan pilihan Anda.`,
        category: aiDishIdea.category || 'Lauk Utama',
        mealTypes: Array.isArray(aiDishIdea.mealTypes) && aiDishIdea.mealTypes.length > 0
          ? aiDishIdea.mealTypes
          : ['siang'],
        servings: Number(aiDishIdea.servings) || 4,
        prepTime: Number(aiDishIdea.prepTime) || 15,
        cookTime: Number(aiDishIdea.cookTime) || 20,
        images: [
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        ],
        ingredients: (aiDishIdea.ingredients || []).map((ing: any, idx: number) => ({
          id: `ing-${Date.now()}-${idx}`,
          name: ing.name,
          amount: ing.amount || '',
        })),
        seasonings: (aiDishIdea.seasonings || []).map((sea: any, idx: number) => ({
          id: `sea-${Date.now()}-${idx}`,
          name: sea.name,
          amount: sea.amount || '',
        })),
        steps: aiDishIdea.steps || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveRecipe(newRecipe);
      setIsSaved(true);
      await loadRecipes();
    } catch (err: any) {
      alert('Gagal menyimpan resep: ' + err.message);
    } finally {
      setIsSaving(false);
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
                Roulette Menu Acak
              </h2>
              <p className="text-xs text-sage-500">
                Pusing mau masak apa? Biarkan roda acak menentukan menu hari ini!
              </p>
            </div>
          </div>

          {/* Meal filter pills */}
          <div className="flex items-center gap-1.5 p-1 bg-sage-50 rounded-2xl border border-sage-200 text-xs">
            {(['all', 'pagi', 'siang', 'malam'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all capitalize ${
                  selectedMealType === type
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'text-sage-600 hover:text-sage-900'
                }`}
              >
                {type === 'all' ? 'Semua' : type}
              </button>
            ))}
          </div>
        </div>

        {/* Selected random recipe presentation */}
        {randomRecipe ? (
          <div className="p-6 bg-gradient-to-br from-sage-50 to-sage-100/50 rounded-3xl border border-sage-200 flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-48 h-40 rounded-2xl overflow-hidden shadow-sage-sm shrink-0">
              <img
                src={randomRecipe.images[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                alt={randomRecipe.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                {randomRecipe.mealTypes.map((t) => (
                  <MealBadge key={t} type={t} size="sm" />
                ))}
                <span className="text-xs text-sage-600 font-semibold px-2.5 py-0.5 rounded-full bg-sage-200">
                  {randomRecipe.category}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-sage-950">
                {randomRecipe.title}
              </h3>
              <p className="text-xs text-sage-600 line-clamp-2">
                {randomRecipe.description}
              </p>

              <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-sage-700 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-sage-500" />
                  {(randomRecipe.prepTime || 10) + (randomRecipe.cookTime || 20)} Menit
                </span>
                <span className="flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-sage-500" />
                  {randomRecipe.ingredients.length} Bahan • {randomRecipe.seasonings.length} Bumbu
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
              <button
                onClick={spinRandom}
                disabled={isSpinning}
                className="px-6 py-3 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sage-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                <Shuffle className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Mengacak...' : 'Putar Lagi!'}</span>
              </button>

              <a
                href="/resep"
                className="px-4 py-2 rounded-xl bg-white hover:bg-sage-100 border border-sage-300 text-sage-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Lihat Resep</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-sage-400 text-xs">
            Belum ada resep yang tersimpan di katalog.
          </div>
        )}
      </div>

      {/* Feature 2: Tanya Asisten Koki AI */}
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <input
              type="text"
              required
              placeholder="Contoh: Saya punya tempe, telur puyuh, cabe rawit, bumbu kecap..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 px-4 py-3.5 rounded-2xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 shadow-sage-sm"
            />
            <button
              type="submit"
              disabled={isAiLoading || !aiPrompt.trim()}
              className="px-6 py-3.5 rounded-2xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-sage-sm shrink-0"
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

        {/* AI Result Presentation Card */}
        {aiDishIdea && (
          <div className="p-6 bg-sage-50/80 rounded-3xl border border-sage-300 space-y-5 animate-fadeIn">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-sage-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-sage-500 uppercase tracking-wider block">
                  Rekomendasi Asisten Koki AI
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-sage-950 mt-0.5">
                  {aiDishIdea.title}
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sage-200 text-sage-800">
                {aiDishIdea.category || 'Lauk Utama'}
              </span>
            </div>

            {/* Ingredients & Seasonings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-sage-200 shadow-sm">
                <h4 className="font-bold text-xs text-sage-800 uppercase tracking-wider mb-2 pb-1 border-b border-sage-100 flex items-center justify-between">
                  <span>Bahan Utama</span>
                  <span className="text-[10px] text-sage-400 font-semibold">{aiDishIdea.ingredients?.length || 0} item</span>
                </h4>
                <ul className="text-xs text-sage-700 space-y-1.5">
                  {aiDishIdea.ingredients?.map((ing: any, i: number) => (
                    <li key={i} className="flex justify-between items-center gap-2">
                      <span className="font-medium">• {ing.name}</span>
                      <span className="text-sage-500 text-[11px] shrink-0">{ing.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-sage-200 shadow-sm">
                <h4 className="font-bold text-xs text-sage-800 uppercase tracking-wider mb-2 pb-1 border-b border-sage-100 flex items-center justify-between">
                  <span>Bumbu & Rempah</span>
                  <span className="text-[10px] text-sage-400 font-semibold">{aiDishIdea.seasonings?.length || 0} item</span>
                </h4>
                <ul className="text-xs text-sage-700 space-y-1.5">
                  {aiDishIdea.seasonings?.map((sea: any, i: number) => (
                    <li key={i} className="flex justify-between items-center gap-2">
                      <span className="font-medium">• {sea.name}</span>
                      <span className="text-sage-500 text-[11px] shrink-0">{sea.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Cooking steps */}
            <div className="bg-white p-4 rounded-2xl border border-sage-200 shadow-sm">
              <h4 className="font-bold text-xs text-sage-800 uppercase tracking-wider mb-2 pb-1 border-b border-sage-100">
                Langkah Pembuatan
              </h4>
              <ol className="text-xs text-sage-700 space-y-2 list-decimal list-inside leading-relaxed">
                {aiDishIdea.steps?.map((st: string, i: number) => (
                  <li key={i} className="pl-1">{st}</li>
                ))}
              </ol>
            </div>

            {/* Action Bar: Save Directly to Recipe Catalog */}
            <div className="pt-4 border-t border-sage-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 p-4 rounded-2xl">
              <div className="text-xs">
                {isSaved ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Resep ini telah tersimpan di Katalog Menu Anda!
                  </span>
                ) : (
                  <span className="text-sage-600 font-medium">
                    Suka dengan resep ini? Simpan langsung ke daftar menu masakan Anda.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {isSaved ? (
                  <a
                    href="/resep"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sage-700 hover:bg-sage-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Lihat di Katalog Menu →</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveToCatalog}
                    disabled={isSaving}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sage-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan ke Menu...</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus className="w-4 h-4" />
                        <span>Simpan ke List Menu</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
