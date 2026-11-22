import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import type { ShoppingItem } from '../../types/recipe';
import { getShoppingList, saveShoppingList } from '../../services/storage';
import { toast } from '../../utils/toast';

export const ShoppingManager: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'bahan' | 'bumbu'>('bahan');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadShopping();
  }, []);

  const loadShopping = async () => {
    const data = await getShoppingList();
    setItems(data);
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

    const newItem: ShoppingItem = {
      id: 'shop-' + Date.now().toString(),
      name: newItemName.trim(),
      amount: newItemAmount.trim() || undefined,
      isChecked: false,
      category: newItemCategory,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    await saveShoppingList(updated);

    setNewItemName('');
    setNewItemAmount('');
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

  const handleClearAll = async () => {
    if (confirm('Kosongkan semua daftar belanja?')) {
      setItems([]);
      await saveShoppingList([]);
    }
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

  const totalCount = items.length;
  const completedCount = items.filter((i) => i.isChecked).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const bahanItems = items.filter((i) => i.category === 'bahan');
  const bumbuItems = items.filter((i) => i.category === 'bumbu');

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
        <h3 className="font-bold text-sage-900 text-sm flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-sage-600" />
          <span>Tambah Item Belanja Cepat</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <input
            type="text"
            required
            placeholder="Nama barang (misal: Telur Puyuh, Masako, Tempe)..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-6 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-sm text-sage-900"
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
            className="sm:col-span-1 px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-5 h-5 shrink-0" />
            <span className="sm:hidden text-xs font-bold">Tambah ke Daftar</span>
          </button>
        </div>
      </form>

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
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.isChecked
                    ? 'bg-sage-50/70 border-sage-200 opacity-60 text-sage-400'
                    : 'bg-white border-sage-200 hover:border-sage-400 text-sage-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.isChecked ? (
                    <CheckCircle2 className="w-5 h-5 text-sage-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-sage-300 shrink-0" />
                  )}
                  <div>
                    <span className={`text-sm font-medium ${item.isChecked ? 'line-through' : ''}`}>
                      {item.name}
                    </span>
                    {item.sourceRecipeTitle && (
                      <span className="text-[10px] text-sage-400 block">
                        Dari: {item.sourceRecipeTitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.amount && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sage-100 text-sage-800">
                      {item.amount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="p-1 text-sage-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  item.isChecked
                    ? 'bg-sage-50/70 border-sage-200 opacity-60 text-sage-400'
                    : 'bg-white border-sage-200 hover:border-amber-400 text-sage-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.isChecked ? (
                    <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-sage-300 shrink-0" />
                  )}
                  <div>
                    <span className={`text-sm font-medium ${item.isChecked ? 'line-through' : ''}`}>
                      {item.name}
                    </span>
                    {item.sourceRecipeTitle && (
                      <span className="text-[10px] text-sage-400 block">
                        Dari: {item.sourceRecipeTitle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.amount && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      {item.amount}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="p-1 text-sage-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-sage-400 italic py-2">Belum ada bumbu tercatat.</p>
        )}
      </div>

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
    </div>
  );
};
