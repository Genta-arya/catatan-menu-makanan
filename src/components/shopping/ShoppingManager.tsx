import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Share2,
  Check,
  Sparkles,
  Utensils,
  Layers,
  ChefHat,
  Filter,
} from 'lucide-react';
import type { ShoppingItem, Recipe } from '../../types/recipe';
import { getShoppingList, saveShoppingList, getRecipes } from '../../services/storage';
import { toast } from '../../utils/toast';
import { ConfirmModal } from '../ui/ConfirmModal';

export const ShoppingManager: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'bahan' | 'bumbu'>('bahan');
  const [newItemRecipeTitle, setNewItemRecipeTitle] = useState<string>('');
  const [isCustomRecipe, setIsCustomRecipe] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [groupBy, setGroupBy] = useState<'category' | 'recipe'>('recipe');
  const [selectedRecipeFilter, setSelectedRecipeFilter] = useState<string>('all');

  useEffect(() => {
    loadShopping();
    loadRecipes();
  }, []);

  const loadShopping = async () => {
    const data = await getShoppingList();
    setItems(data);
  };

  const loadRecipes = async () => {
    const data = await getRecipes();
    setRecipes(data);
  };

  const handleToggle = async (id: string) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    );
    setItems(updated);
    await saveShoppingList(updated);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const sourceTitle = newItemRecipeTitle.trim() || undefined;

    const newItem: ShoppingItem = {
      id: 'shop-' + Date.now().toString(),
      name: newItemName.trim(),
      amount: newItemAmount.trim() || undefined,
      isChecked: false,
      category: newItemCategory,
      sourceRecipeTitle: sourceTitle,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    await saveShoppingList(updated);

    setNewItemName('');
    setNewItemAmount('');
    toast.success(`"${newItem.name}" ditambahkan ke daftar belanja!`);
  };

  const handleDeleteItem = async (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
    await saveShoppingList(updated);
  };

  const handleClearCompleted = async () => {
    const updated = items.filter((i) => !i.isChecked);
    setItems(updated);
    await saveShoppingList(updated);
  };

  const handleClearAll = () => {
    setShowClearAllModal(true);
  };

  const confirmClearAll = async () => {
    setShowClearAllModal(false);
    setItems([]);
    await saveShoppingList([]);
    toast.info('Seluruh daftar belanja telah dikosongkan.');
  };

  // Copy to WhatsApp
  const handleCopyWhatsApp = () => {
    if (items.length === 0) return;

    let text = `🛒 *DAFTAR BELANJA PASAR / SUPERMARKET*\n`;
    text += `Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}\n\n`;

    const bahanList = items.filter((i) => i.category === 'bahan');
    const bumbuList = items.filter((i) => i.category === 'bumbu');

    if (bahanList.length > 0) {
      text += `*🥩 BAHAN UTAMA:*\n`;
      bahanList.forEach((item) => {
        text += `${item.isChecked ? '✅' : '⬜'} ${item.name} ${item.amount ? `(${item.amount})` : ''}\n`;
      });
      text += `\n`;
    }

    if (bumbuList.length > 0) {
      text += `*🌶️ BUMBU & REMPAH:*\n`;
      bumbuList.forEach((item) => {
        text += `${item.isChecked ? '✅' : '⬜'} ${item.name} ${item.amount ? `(${item.amount})` : ''}\n`;
      });
      text += `\n`;
    }

    text += `_Dibuat dengan Dapur Radha App_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Daftar belanja berhasil disalin untuk WhatsApp!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Unique list of source recipe titles from items
  const uniqueRecipeTitles = useMemo(() => {
    const titles = new Set<string>();
    items.forEach((item) => {
      if (item.sourceRecipeTitle) {
        titles.add(item.sourceRecipeTitle);
      }
    });
    return Array.from(titles);
  }, [items]);

  // Filtered items based on selectedRecipeFilter
  const filteredItems = useMemo(() => {
    if (selectedRecipeFilter === 'all') return items;
    if (selectedRecipeFilter === '__custom__') {
      return items.filter((i) => !i.sourceRecipeTitle);
    }
    return items.filter((i) => i.sourceRecipeTitle === selectedRecipeFilter);
  }, [items, selectedRecipeFilter]);

  // Group items by Recipe
  const recipeGroups = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    filteredItems.forEach((item) => {
      const groupKey = item.sourceRecipeTitle || 'Belanjaan Umum / Tambahan';
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
    });
    return groups;
  }, [filteredItems]);

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.isChecked).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const bahanItems = filteredItems.filter((i) => i.category === 'bahan');
  const bumbuItems = filteredItems.filter((i) => i.category === 'bumbu');

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-sage-950">
            Daftar Belanjaan Pasar
          </h1>
          <p className="text-sage-600 text-xs sm:text-sm mt-1">
            Checklist bahan dan bumbu dapur yang perlu dibeli saat ke pasar atau supermarket.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={handleCopyWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 shadow-sm transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Tersalin!' : 'Salin ke WhatsApp'}</span>
            </button>
          )}

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="px-3 py-2 rounded-xl bg-white hover:bg-sage-100 border border-sage-200 text-sage-700 text-xs font-semibold shadow-sage-sm transition-colors"
            >
              Hapus Selesai
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-sage-200 shadow-sage-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-sage-800">
            <span>Kemajuan Belanja</span>
            <span>
              {completedCount} dari {totalCount} barang ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-sage-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Form Input Item Cepat */}
      <form onSubmit={handleAddItem} className="bg-white p-4 sm:p-5 rounded-2xl border border-sage-200 shadow-sage-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sage-900 text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-sage-600" />
            <span>Tambah Item Belanja Cepat</span>
          </h3>
          <span className="text-[11px] text-sage-500 hidden sm:inline">Bisa ditentukan untuk menu apa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <input
            type="text"
            required
            placeholder="Nama barang (misal: Telur Puyuh, Masako, Tempe)..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-5 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-sm text-sage-900"
          />
          <input
            type="text"
            placeholder="Jumlah/takaran (misal: 1/2 kg)"
            value={newItemAmount}
            onChange={(e) => setNewItemAmount(e.target.value)}
            className="sm:col-span-3 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-sm text-sage-900"
          />
          <select
            value={newItemCategory}
            onChange={(e: any) => setNewItemCategory(e.target.value)}
            className="sm:col-span-2 px-3 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-xs font-semibold text-sage-800 cursor-pointer"
          >
            <option value="bahan">🥩 Bahan</option>
            <option value="bumbu">🌶️ Bumbu</option>
          </select>
          <button
            type="submit"
            className="sm:col-span-2 px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Set untuk Menu Apa */}
        <div className="pt-2 border-t border-sage-100 flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
          <span className="font-semibold text-sage-700 shrink-0 flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-sage-500" />
            <span>Untuk Menu Masakan:</span>
          </span>

          {!isCustomRecipe ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <select
                value={newItemRecipeTitle}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setIsCustomRecipe(true);
                    setNewItemRecipeTitle('');
                  } else {
                    setNewItemRecipeTitle(e.target.value);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-sage-300 bg-sage-50/50 text-xs text-sage-800 font-medium outline-none cursor-pointer"
              >
                <option value="">(Belanjaan Umum / Tanpa Menu Khusus)</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.title}>
                    🍲 {r.title}
                  </option>
                ))}
                {uniqueRecipeTitles
                  .filter((t) => !recipes.some((r) => r.title === t))
                  .map((t) => (
                    <option key={t} value={t}>
                      🍲 {t}
                    </option>
                  ))}
                <option value="__custom__">✨ Ketik Nama Menu Baru...</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0 animate-fadeIn">
              <input
                type="text"
                autoFocus
                placeholder="Ketik nama menu (misal: Sop Buntut, Sayur Asem)..."
                value={newItemRecipeTitle}
                onChange={(e) => setNewItemRecipeTitle(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl border-2 border-sage-500 text-xs text-sage-900 outline-none bg-white shadow-2xs font-medium"
              />
              <button
                type="button"
                onClick={() => {
                  setIsCustomRecipe(false);
                  setNewItemRecipeTitle('');
                }}
                className="px-2.5 py-1.5 rounded-xl border border-sage-200 text-sage-600 hover:bg-sage-100 text-[11px] font-semibold shrink-0"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Control Bar: View Grouping & Filter */}
      {items.length > 0 && (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-sage-200 shadow-sage-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Group Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-sage-100/70 rounded-xl border border-sage-200/80 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setGroupBy('recipe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                groupBy === 'recipe'
                  ? 'bg-white text-sage-900 shadow-xs'
                  : 'text-sage-600 hover:text-sage-900'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Kelompokkan per Menu ({Object.keys(recipeGroups).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setGroupBy('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                groupBy === 'category'
                  ? 'bg-white text-sage-900 shadow-xs'
                  : 'text-sage-600 hover:text-sage-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Bahan vs Bumbu</span>
            </button>
          </div>

          {/* Filter per Menu */}
          {uniqueRecipeTitles.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-sage-400 shrink-0" />
              <select
                value={selectedRecipeFilter}
                onChange={(e) => setSelectedRecipeFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-sage-200 bg-sage-50 text-xs font-semibold text-sage-800 outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">Semua Menu ({items.length} item)</option>
                {uniqueRecipeTitles.map((t) => (
                  <option key={t} value={t}>
                    🍲 {t}
                  </option>
                ))}
                {items.some((i) => !i.sourceRecipeTitle) && (
                  <option value="__custom__">📦 Belanjaan Umum</option>
                )}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Items Section: Either Grouped by Recipe OR Grouped by Category */}
      {groupBy === 'recipe' ? (
        <div className="space-y-4">
          {Object.keys(recipeGroups).length > 0 ? (
            Object.entries(recipeGroups).map(([recipeTitle, groupItems]) => {
              const groupTotal = groupItems.length;
              const groupDone = groupItems.filter((i) => i.isChecked).length;
              const isGroupAllDone = groupDone === groupTotal;

              return (
                <div
                  key={recipeTitle}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-sage-200 shadow-sage-sm space-y-3"
                >
                  {/* Recipe Group Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage-100 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center shrink-0">
                        <ChefHat className="w-4 h-4 text-sage-700" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-sage-500 block">
                          Bahan Belanja untuk Menu
                        </span>
                        <h3 className="font-extrabold text-sage-950 text-base sm:text-lg truncate">
                          {recipeTitle}
                        </h3>
                        <span className="text-[11px] text-sage-500 font-medium">
                          {groupDone} dari {groupTotal} bahan terbeli
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={async () => {
                          const allChecked = !isGroupAllDone;
                          const groupIds = new Set(groupItems.map((i) => i.id));
                          const updated = items.map((i) =>
                            groupIds.has(i.id) ? { ...i, isChecked: allChecked } : i
                          );
                          setItems(updated);
                          await saveShoppingList(updated);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sage-50 hover:bg-sage-100 border border-sage-200 text-sage-700 transition-colors"
                      >
                        {isGroupAllDone ? 'Batal Centang Semua' : 'Centang Semua'}
                      </button>
                    </div>
                  </div>

                  {/* List of items in this recipe */}
                  <div className="space-y-2">
                    {groupItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                          item.isChecked
                            ? 'bg-sage-50/70 border-sage-200 opacity-60 text-sage-400'
                            : item.category === 'bumbu'
                            ? 'bg-white border-sage-200 hover:border-amber-400 text-sage-900 shadow-xs'
                            : 'bg-white border-sage-200 hover:border-sage-400 text-sage-900 shadow-xs'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0 text-sage-400">
                          {item.isChecked ? (
                            <CheckCircle2
                              className={`w-5 h-5 ${
                                item.category === 'bumbu' ? 'text-amber-600' : 'text-sage-600'
                              }`}
                            />
                          ) : (
                            <Circle className="w-5 h-5 text-sage-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-3">
                          <div className="min-w-0 flex-1 flex items-baseline gap-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                item.category === 'bumbu'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sage-100 text-sage-800'
                              }`}
                            >
                              {item.category === 'bumbu' ? '🌶️ Bumbu' : '🥩 Bahan'}
                            </span>
                            <span
                              className={`text-sm font-medium leading-snug break-words ${
                                item.isChecked ? 'line-through text-sage-400' : 'text-sage-900'
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 max-w-full">
                            {item.amount && (
                              <span
                                className={`text-xs font-semibold px-2.5 py-1 rounded-lg break-words max-w-full leading-relaxed border ${
                                  item.category === 'bumbu'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                    : 'bg-sage-100 text-sage-800 border-sage-200/60'
                                }`}
                              >
                                {item.amount}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(item.id);
                              }}
                              className="p-1.5 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Hapus dari daftar belanja"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-sage-200 text-center space-y-2">
              <p className="text-sm font-bold text-sage-800">Daftar belanja masih kosong</p>
              <p className="text-xs text-sage-500">
                Gunakan tombol "Tambah Bahan ke Daftar Belanja" di halaman resep atau masukkan item belanja cepat di atas.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Items Section: Bahan Utama */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sage-200 shadow-sage-sm space-y-3">
            <h3 className="font-bold text-sage-900 text-base flex items-center gap-2 border-b border-sage-100 pb-2">
              <Utensils className="w-4 h-4 text-sage-600" />
              <span>Bahan Utama ({bahanItems.length})</span>
            </h3>

            {bahanItems.length > 0 ? (
              <div className="space-y-2">
                {bahanItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      item.isChecked
                        ? 'bg-sage-50/70 border-sage-200 opacity-60 text-sage-400'
                        : 'bg-white border-sage-200 hover:border-sage-400 text-sage-900 shadow-xs'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0 text-sage-400">
                      {item.isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-sage-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-sage-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-medium leading-snug break-words ${item.isChecked ? 'line-through text-sage-400' : 'text-sage-900'}`}>
                          {item.name}
                        </span>
                        {item.sourceRecipeTitle && (
                          <span className="text-[11px] text-sage-500 block break-words mt-0.5">
                            🍲 Untuk menu: <strong>{item.sourceRecipeTitle}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 max-w-full">
                        {item.amount && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-sage-100 text-sage-800 break-words max-w-full leading-relaxed border border-sage-200/60">
                            {item.amount}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="p-1.5 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Hapus dari daftar belanja"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sage-400 italic py-2">Belum ada bahan utama.</p>
            )}
          </div>

          {/* Items Section: Bumbu & Rempah */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sage-200 shadow-sage-sm space-y-3">
            <h3 className="font-bold text-sage-900 text-base flex items-center gap-2 border-b border-sage-100 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Bumbu & Rempah ({bumbuItems.length})</span>
            </h3>

            {bumbuItems.length > 0 ? (
              <div className="space-y-2">
                {bumbuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggle(item.id)}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      item.isChecked
                        ? 'bg-sage-50/70 border-sage-200 opacity-60 text-sage-400'
                        : 'bg-white border-sage-200 hover:border-amber-400 text-sage-900 shadow-xs'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0 text-amber-500">
                      {item.isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-sage-300" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-3">
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-medium leading-snug break-words ${item.isChecked ? 'line-through text-sage-400' : 'text-sage-900'}`}>
                          {item.name}
                        </span>
                        {item.sourceRecipeTitle && (
                          <span className="text-[11px] text-sage-500 block break-words mt-0.5">
                            🍲 Untuk menu: <strong>{item.sourceRecipeTitle}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 max-w-full">
                        {item.amount && (
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 break-words max-w-full leading-relaxed">
                            {item.amount}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                          }}
                          className="p-1.5 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Hapus dari daftar belanja"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-sage-400 italic py-2">Belum ada bumbu tercatat.</p>
            )}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="text-center pt-2">
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline"
          >
            Kosongkan Seluruh Daftar Belanja
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearAllModal}
        title="Kosongkan Daftar Belanja"
        message="Yakin ingin mengosongkan seluruh daftar belanja? Semua item bahan dan bumbu akan dihapus."
        confirmText="Kosongkan Semua"
        cancelText="Batal"
        variant="danger"
        onConfirm={confirmClearAll}
        onCancel={() => setShowClearAllModal(false)}
      />
    </div>
  );
};
