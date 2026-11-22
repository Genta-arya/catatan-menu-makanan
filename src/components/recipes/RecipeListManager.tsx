import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Sparkles,
  Sunrise,
  Sun,
  Moon,
  UtensilsCrossed,
  Download,
  Upload,
} from 'lucide-react';
import type { Recipe, MealType } from '../../types/recipe';
import { RecipeCard } from './RecipeCard';
import { RecipeDetail } from './RecipeDetail';
import { RecipeForm } from './RecipeForm';
import {
  getRecipes,
  saveRecipe,
  deleteRecipe,
  exportAllData,
  importAllData,
} from '../../services/storage';
import { toast } from '../../utils/toast';
import { parseMinutes } from '../../utils/recipeHelper';
import { ConfirmModal } from '../ui/ConfirmModal';

export const RecipeListManager: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [selectedMealType, setSelectedMealType] = useState<MealType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'az' | 'fastest'>('newest');

  // Navigation / Modal views
  const [viewState, setViewState] = useState<'list' | 'detail' | 'create' | 'edit'>('list');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleteRecipeId, setDeleteRecipeId] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setIsLoading(true);
    const data = await getRecipes();
    setRecipes(data);
    setIsLoading(false);
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.category) set.add(r.category);
    });
    return Array.from(set);
  }, [recipes]);

  // Filtered & Sorted Recipes
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((r) => {
        // 1. Meal Type Filter
        if (selectedMealType !== 'all') {
          if (!r.mealTypes.includes(selectedMealType)) return false;
        }

        // 2. Category Filter
        if (selectedCategory !== 'all') {
          if (r.category !== selectedCategory) return false;
        }

        // 3. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q);
          const matchIng = r.ingredients.some((i) => i.name.toLowerCase().includes(q));
          const matchSea = r.seasonings.some((s) => s.name.toLowerCase().includes(q));
          return matchTitle || matchDesc || matchIng || matchSea;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'az') return a.title.localeCompare(b.title);
        if (sortBy === 'fastest') {
          const timeA = parseMinutes(a.prepTime) + parseMinutes(a.cookTime);
          const timeB = parseMinutes(b.prepTime) + parseMinutes(b.cookTime);
          return timeA - timeB;
        }
        // Newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [recipes, selectedMealType, selectedCategory, searchQuery, sortBy]);

  // Handlers
  const handleSelectRecipe = (r: Recipe) => {
    setSelectedRecipe(r);
    setViewState('detail');
  };

  const handleSaveRecipe = async (recipe: Recipe) => {
    await saveRecipe(recipe);
    await loadRecipes();
    setSelectedRecipe(recipe);
    setViewState('detail');
    toast.success('Catatan resep masakan berhasil disimpan!');
  };

  const handleDeleteRecipe = async (id: string) => {
    setDeleteRecipeId(id);
  };

  const confirmDelete = async () => {
    if (!deleteRecipeId) return;
    const id = deleteRecipeId;
    setDeleteRecipeId(null);
    await deleteRecipe(id);
    await loadRecipes();
    setViewState('list');
    setSelectedRecipe(null);
    toast.info('Catatan resep telah dihapus.');
  };

  const handleExport = async () => {
    const json = await exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catatan-menu-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('Cadangan data berhasil diunduh!');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        const ok = await importAllData(reader.result);
        if (ok) {
          toast.success('Data resep berhasil diimpor!');
          await loadRecipes();
        } else {
          toast.error('Format file JSON tidak valid.');
        }
      }
    };
    reader.readAsText(file);
  };

  // Render detail view
  if (viewState === 'detail' && selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        onBack={() => setViewState('list')}
        onEdit={() => setViewState('edit')}
        onDelete={() => handleDeleteRecipe(selectedRecipe.id)}
      />
    );
  }

  // Render create or edit view
  if (viewState === 'create') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-sage-950">Catat Menu Masakan Baru</h2>
        <RecipeForm
          onSave={handleSaveRecipe}
          onCancel={() => setViewState('list')}
        />
      </div>
    );
  }

  if (viewState === 'edit' && selectedRecipe) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-sage-950">Edit Resep Masakan</h2>
        <RecipeForm
          initialRecipe={selectedRecipe}
          onSave={handleSaveRecipe}
          onCancel={() => setViewState('detail')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-sage-950">
            Catatan Menu Masakan
          </h1>
          <p className="text-sage-600 text-xs sm:text-sm mt-1">
            Daftar global semua ide resep, terstruktur dengan bahan, bumbu & waktu makan.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewState('create')}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sage-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Menu</span>
          </button>

          <button
            onClick={handleExport}
            title="Backup Data ke JSON"
            className="p-2.5 rounded-xl bg-white hover:bg-sage-100 border border-sage-200 text-sage-700 shadow-sage-sm transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            title="Restore Data dari JSON"
            className="p-2.5 rounded-xl bg-white hover:bg-sage-100 border border-sage-200 text-sage-700 shadow-sage-sm transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* FILTER TAB BAR: Semua | Pagi | Siang | Malam */}
      <div className="flex items-center gap-1.5 p-1.5 bg-sage-100/70 backdrop-blur-md rounded-2xl border border-sage-200 overflow-x-auto">
        <button
          onClick={() => setSelectedMealType('all')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
            selectedMealType === 'all'
              ? 'bg-white text-sage-900 shadow-sm border border-sage-200'
              : 'text-sage-600 hover:text-sage-900'
          }`}
        >
          <span>Semua Menu</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sage-200 text-sage-800">
            {recipes.length}
          </span>
        </button>

        <button
          onClick={() => setSelectedMealType('pagi')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
            selectedMealType === 'pagi'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-sage-700 hover:bg-orange-50'
          }`}
        >
          <Sunrise className="w-4 h-4" />
          <span>Pagi</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMealType === 'pagi' ? 'bg-orange-700 text-white' : 'bg-orange-100 text-orange-800'}`}>
            {recipes.filter((r) => r.mealTypes.includes('pagi')).length}
          </span>
        </button>

        <button
          onClick={() => setSelectedMealType('siang')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
            selectedMealType === 'siang'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-sage-700 hover:bg-amber-50'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Siang</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMealType === 'siang' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'}`}>
            {recipes.filter((r) => r.mealTypes.includes('siang')).length}
          </span>
        </button>

        <button
          onClick={() => setSelectedMealType('malam')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 ${
            selectedMealType === 'malam'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-sage-700 hover:bg-indigo-50'
          }`}
        >
          <Moon className="w-4 h-4" />
          <span>Malam</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedMealType === 'malam' ? 'bg-indigo-800 text-white' : 'bg-indigo-100 text-indigo-800'}`}>
            {recipes.filter((r) => r.mealTypes.includes('malam')).length}
          </span>
        </button>
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-sage-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari masakan, bumbu, atau bahan (misal: Tempe, Masako)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sage-200 bg-white focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-xs sm:text-sm text-sage-900 transition-all shadow-sage-sm"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-sage-200 bg-white text-xs sm:text-sm font-semibold text-sage-800 outline-none focus:border-sage-500 shadow-sage-sm cursor-pointer"
          >
            <option value="newest">Terbaru Ditambahkan</option>
            <option value="az">Nama A - Z</option>
            <option value="fastest">Waktu Tercepat</option>
          </select>
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-sage-800 text-white shadow-sm'
                : 'bg-white border border-sage-200 text-sage-700 hover:border-sage-400'
            }`}
          >
            Semua Olahan
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-sage-800 text-white shadow-sm'
                  : 'bg-white border border-sage-200 text-sage-700 hover:border-sage-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Recipe Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
          <p className="text-sage-500 text-xs sm:text-sm mt-3 font-medium">Memuat catatan menu...</p>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} onClick={() => handleSelectRecipe(r)} />
          ))}
        </div>
      ) : (
        <div className="py-16 px-4 bg-white rounded-3xl border border-sage-200 text-center space-y-4 shadow-sage-sm">
          <div className="w-14 h-14 rounded-2xl bg-sage-100 text-sage-600 flex items-center justify-center mx-auto">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-sage-900 text-base sm:text-lg">
              Tidak ada menu ditemukan
            </h3>
            <p className="text-sage-500 text-xs sm:text-sm max-w-sm mx-auto mt-1">
              {searchQuery || selectedCategory !== 'all' || selectedMealType !== 'all'
                ? 'Coba ubah kata kunci pencarian atau reset filter di atas.'
                : 'Mulai tambahkan resep masakan favorit Anda atau gunakan bantuan AI.'}
            </p>
          </div>
          <button
            onClick={() => setViewState('create')}
            className="px-5 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Resep Pertama</span>
          </button>
        </div>
      )}

      {/* Confirmation Modal for Recipe Deletion */}
      <ConfirmModal
        isOpen={!!deleteRecipeId}
        title="Hapus Resep Masakan"
        message="Yakin ingin menghapus catatan resep ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Resep"
        cancelText="Batal"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteRecipeId(null)}
      />
    </div>
  );
};
