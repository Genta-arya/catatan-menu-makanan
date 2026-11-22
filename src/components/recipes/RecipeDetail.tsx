import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Users,
  Edit3,
  Trash2,
  ShoppingCart,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Share2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Recipe } from '../../types/recipe';
import { MealBadge } from './MealBadge';
import { saveShoppingList, getShoppingList } from '../../services/storage';
import { toast } from '../../utils/toast';

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({
  recipe,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [shoppingNotice, setShoppingNotice] = useState<string | null>(null);

  const images =
    recipe.images && recipe.images.length > 0
      ? recipe.images
      : ['https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80'];

  const toggleIngredient = (id: string) => {
    setCheckedIngredients((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleAddToShopping = async () => {
    const currentList = await getShoppingList();
    const newItems = [
      ...recipe.ingredients.map((ing) => ({
        id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: ing.name,
        amount: ing.amount,
        isChecked: false,
        category: 'bahan' as const,
        sourceRecipeTitle: recipe.title,
      })),
      ...recipe.seasonings.map((sea) => ({
        id: 'shop-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: sea.name,
        amount: sea.amount,
        isChecked: false,
        category: 'bumbu' as const,
        sourceRecipeTitle: recipe.title,
      })),
    ];

    await saveShoppingList([...currentList, ...newItems]);
    toast.success(`Bahan & bumbu ${recipe.title} ditambahkan ke Daftar Belanja!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-sage-100 border border-sage-200 text-sage-800 text-sm font-semibold shadow-sage-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Katalog</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-sage-100 border border-sage-200 text-sage-800 text-sm font-semibold shadow-sage-sm flex items-center gap-1.5 transition-colors"
            title="Edit Resep"
          >
            <Edit3 className="w-4 h-4 text-sage-600" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            onClick={onDelete}
            className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-red-600 text-sm font-semibold shadow-sage-sm flex items-center gap-1.5 transition-colors"
            title="Hapus Resep"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Hapus</span>
          </button>
        </div>
      </div>

      {shoppingNotice && (
        <div className="p-3.5 bg-sage-100 text-sage-800 rounded-xl border border-sage-300 text-sm font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
          <span>{shoppingNotice}</span>
        </div>
      )}

      {/* Main Card with Images & Header */}
      <div className="bg-white rounded-3xl border border-sage-200 shadow-sage-md overflow-hidden">
        {/* Gallery Carousel */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] bg-sage-900 overflow-hidden group">
          <img
            src={images[activeImageIndex]}
            alt={recipe.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Carousel Arrows if > 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Indicator dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeImageIndex ? 'bg-white w-4' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-4 left-4 flex gap-1.5">
            {recipe.mealTypes.map((type) => (
              <MealBadge key={type} type={type} />
            ))}
          </div>

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-sage-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {recipe.category}
          </div>
        </div>

        {/* Thumbnail Selector (if multiple images) */}
        {images.length > 1 && (
          <div className="p-3 bg-sage-50/50 border-b border-sage-200 flex gap-2 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  idx === activeImageIndex ? 'border-sage-600 scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Header Details */}
        <div className="p-6 sm:p-8 space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-sage-950">
              {recipe.title}
            </h1>
            {recipe.description && (
              <p className="text-sage-700 text-sm sm:text-base mt-2 leading-relaxed">
                {recipe.description}
              </p>
            )}
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
            <div className="bg-sage-50 p-3 rounded-2xl border border-sage-200 text-center">
              <span className="text-[10px] sm:text-xs text-sage-500 font-semibold uppercase tracking-wider block">
                Total Waktu
              </span>
              <span className="font-bold text-sage-900 text-base sm:text-lg flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-4 h-4 text-sage-500" />
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} Menit
              </span>
            </div>

            <div className="bg-sage-50 p-3 rounded-2xl border border-sage-200 text-center">
              <span className="text-[10px] sm:text-xs text-sage-500 font-semibold uppercase tracking-wider block">
                Porsi
              </span>
              <span className="font-bold text-sage-900 text-base sm:text-lg flex items-center justify-center gap-1 mt-0.5">
                <Users className="w-4 h-4 text-sage-500" />
                {recipe.servings || 4} Orang
              </span>
            </div>

            <div className="bg-sage-50 p-3 rounded-2xl border border-sage-200 text-center">
              <span className="text-[10px] sm:text-xs text-sage-500 font-semibold uppercase tracking-wider block">
                Komponen
              </span>
              <span className="font-bold text-sage-900 text-base sm:text-lg flex items-center justify-center gap-1 mt-0.5">
                <Sparkles className="w-4 h-4 text-sage-500" />
                {recipe.ingredients.length + recipe.seasonings.length} Macam
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={handleAddToShopping}
              className="px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Tambah Bahan ke Daftar Belanja</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Bahan vs Bumbu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Bahan Utama */}
        <div className="bg-white p-6 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
          <div className="flex items-center justify-between border-b border-sage-100 pb-3">
            <h3 className="font-bold text-sage-900 text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sage-500"></span>
              Bahan Utama ({recipe.ingredients.length})
            </h3>
            <span className="text-xs text-sage-500 font-medium">Klik jika sudah siap</span>
          </div>

          <div className="space-y-2.5">
            {recipe.ingredients.map((ing) => {
              const isChecked = !!checkedIngredients[ing.id];
              return (
                <div
                  key={ing.id}
                  onClick={() => toggleIngredient(ing.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-sage-50 border-sage-200 opacity-60 line-through text-sage-400'
                      : 'bg-white border-sage-200 hover:border-sage-300 text-sage-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isChecked ? (
                      <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                    ) : (
                      <Circle className="w-4 h-4 text-sage-300 shrink-0" />
                    )}
                    <span className="font-medium text-sm">{ing.name}</span>
                  </div>
                  {ing.amount && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sage-100 text-sage-800 shrink-0">
                      {ing.amount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Bumbu & Rempah (Lengkap dengan Foto Bumbu) */}
        <div className="bg-white p-6 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
          <div className="flex items-center justify-between border-b border-sage-100 pb-3">
            <h3 className="font-bold text-sage-900 text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Bumbu & Rempah ({recipe.seasonings.length})
            </h3>
            <span className="text-xs text-sage-500 font-medium">Lengkap dengan gambar</span>
          </div>

          <div className="space-y-2.5">
            {recipe.seasonings.map((sea) => {
              const isChecked = !!checkedIngredients[sea.id];
              return (
                <div
                  key={sea.id}
                  onClick={() => toggleIngredient(sea.id)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isChecked
                      ? 'bg-sage-50 border-sage-200 opacity-60 line-through text-sage-400'
                      : 'bg-white border-sage-200 hover:border-sage-300 text-sage-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Bumbu Photo Thumbnail */}
                    {sea.image ? (
                      <img
                        src={sea.image}
                        alt={sea.name}
                        className="w-10 h-10 rounded-lg object-cover border border-sage-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-sage-600 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-sage-300 shrink-0" />
                      )}
                      <span className="font-medium text-sm">{sea.name}</span>
                    </div>
                  </div>

                  {sea.amount && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                      {sea.amount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Langkah-langkah Memasak (Interactive Checklist) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sage-100 pb-3">
          <h3 className="font-bold text-sage-900 text-lg">
            Langkah-Langkah Memasak
          </h3>
          <span className="text-xs text-sage-500 font-medium">
            Centang langkah yang sudah selesai
          </span>
        </div>

        <div className="space-y-3.5">
          {recipe.steps.map((step, idx) => {
            const isDone = !!checkedSteps[idx];
            return (
              <div
                key={idx}
                onClick={() => toggleStep(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isDone
                    ? 'bg-sage-50/70 border-sage-200 opacity-60'
                    : 'bg-white border-sage-200 hover:border-sage-300 shadow-sm'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    isDone
                      ? 'bg-sage-400 text-white'
                      : 'bg-sage-600 text-white shadow-sm'
                  }`}
                >
                  {idx + 1}
                </span>

                <p
                  className={`text-sm leading-relaxed ${
                    isDone ? 'line-through text-sage-400' : 'text-sage-800'
                  }`}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Catatan Tambahan Koki */}
      {recipe.notes && (
        <div className="bg-sage-50 p-6 rounded-2xl border border-sage-200 shadow-sage-sm">
          <h4 className="font-bold text-sage-900 text-sm flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-sage-600" />
            Tips dari Koki
          </h4>
          <p className="text-sage-700 text-sm leading-relaxed">
            {recipe.notes}
          </p>
        </div>
      )}
    </div>
  );
};
