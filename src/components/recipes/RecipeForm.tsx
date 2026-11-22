import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  ClipboardPaste,
  Clock,
  Users,
  Check,
  Sunrise,
  Sun,
  Moon,
  AlertCircle,
  Camera,
  X,
  Video,
  Play,
  Youtube,
  ExternalLink,
} from 'lucide-react';
import type { Recipe, MealType, IngredientItem, SeasoningItem } from '../../types/recipe';
import { generateRecipeWithAI, parseRawRecipeWithAI } from '../../services/aiService';
import { toast } from '../../utils/toast';
import { processAndUploadImage } from '../../utils/imageUpload';
import { parseVideoUrl } from '../../utils/videoHelper';
import { parseMinutes, CATEGORY_PRESETS } from '../../utils/recipeHelper';

interface RecipeFormProps {
  initialRecipe?: Partial<Recipe>;
  onSave: (recipe: Recipe) => void;
  onCancel?: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialRecipe,
  onSave,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [category, setCategory] = useState(initialRecipe?.category || 'Tumisan');
  const [mealTypes, setMealTypes] = useState<MealType[]>(
    initialRecipe?.mealTypes || ['siang']
  );
  const [images, setImages] = useState<string[]>(initialRecipe?.images || []);

  const [ingredients, setIngredients] = useState<IngredientItem[]>(
    initialRecipe?.ingredients || [
      { id: '1', name: '', amount: '' },
      { id: '2', name: '', amount: '' },
    ]
  );

  const [seasonings, setSeasonings] = useState<SeasoningItem[]>(
    initialRecipe?.seasonings || [
      { id: '1', name: '', amount: '' },
      { id: '2', name: '', amount: '' },
    ]
  );

  const [steps, setSteps] = useState<string[]>(
    initialRecipe?.steps || ['']
  );

  const [prepTime, setPrepTime] = useState<number>(parseMinutes(initialRecipe?.prepTime) || 15);
  const [cookTime, setCookTime] = useState<number>(parseMinutes(initialRecipe?.cookTime) || 20);
  const [servings, setServings] = useState<number>(Number(initialRecipe?.servings) || 4);
  const [notes, setNotes] = useState(initialRecipe?.notes || '');
  const [videoUrl, setVideoUrl] = useState(initialRecipe?.videoUrl || '');

  const parsedVideo = parseVideoUrl(videoUrl);

  // AI Modal States
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showRawPasteModal, setShowRawPasteModal] = useState(false);
  const [rawText, setRawText] = useState('');

  // Handle Multi-MealType toggle
  const toggleMealType = (type: MealType) => {
    if (mealTypes.includes(type)) {
      if (mealTypes.length === 1) return; // Keep at least one
      setMealTypes(mealTypes.filter((t) => t !== type));
    } else {
      setMealTypes([...mealTypes, type]);
    }
  };

  // Dish Images handling (Max 5, auto-compressed and uploaded to VPS)
  const handleDishImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 5 - images.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    setIsUploadingImage(true);
    toast.info(`Mengompres dan mengunggah ${filesToProcess.length} foto masakan...`);

    try {
      const uploadedUrls: string[] = [];
      for (const file of filesToProcess) {
        const url = await processAndUploadImage(file, 'resep');
        uploadedUrls.push(url);
      }
      setImages((prev) => [...prev, ...uploadedUrls].slice(0, 5));
      toast.success(`${uploadedUrls.length} foto masakan berhasil disimpan!`);
    } catch (err: any) {
      toast.error('Gagal mengunggah foto: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const removeDishImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Ingredients handling
  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const updateIngredient = (index: number, field: keyof IngredientItem, value: string) => {
    const next = [...ingredients];
    next[index] = { ...next[index], [field]: value };
    setIngredients(next);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Seasonings handling (with image support!)
  const addSeasoning = () => {
    setSeasonings([...seasonings, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const updateSeasoning = (index: number, field: keyof SeasoningItem, value: string) => {
    const next = [...seasonings];
    next[index] = { ...next[index], [field]: value };
    setSeasonings(next);
  };

  const handleSeasoningImageUpload = async (index: number, file: File) => {
    toast.info('Mengompres dan mengunggah foto bumbu...');
    try {
      const url = await processAndUploadImage(file, 'bumbu');
      updateSeasoning(index, 'image', url);
      toast.success('Foto bumbu berhasil disimpan!');
    } catch (err: any) {
      toast.error('Gagal mengunggah foto bumbu: ' + (err.message || 'Terjadi kesalahan'));
    }
  };

  const removeSeasoning = (index: number) => {
    setSeasonings(seasonings.filter((_, i) => i !== index));
  };

  // Steps handling
  const addStep = () => {
    setSteps([...steps, '']);
  };

  const updateStep = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    setSteps(next);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // AI Helper: Auto Generate
  const handleAIGenerate = async () => {
    if (!title.trim()) {
      setAiError('Ketikkan judul masakan terlebih dahulu sebelum menekan AI Generate.');
      return;
    }
    setAiError(null);
    setIsAiLoading(true);

    try {
      const generated = await generateRecipeWithAI(title.trim());
      setTitle(generated.title);
      setCategory(generated.category);
      if (generated.mealTypes && generated.mealTypes.length > 0) {
        setMealTypes(generated.mealTypes);
      }
      setIngredients(
        generated.ingredients.map((ing, idx) => ({
          id: (idx + 1).toString(),
          name: ing.name,
          amount: ing.amount || '',
        }))
      );
      setSeasonings(
        generated.seasonings.map((sea, idx) => ({
          id: (idx + 1).toString(),
          name: sea.name,
          amount: sea.amount || '',
        }))
      );
      setSteps(generated.steps.length > 0 ? generated.steps : ['']);
      setPrepTime(parseMinutes(generated.prepTime) || 15);
      setCookTime(parseMinutes(generated.cookTime) || 20);
      setServings(Number(generated.servings) || 4);
      if (generated.notes) setNotes(generated.notes);
    } catch (err: any) {
      setAiError(err.message || 'Gagal generate dengan AI. Silakan coba sesaat lagi.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Helper: Parse Raw Text
  const handleAIParse = async () => {
    if (!rawText.trim()) return;
    setAiError(null);
    setIsAiLoading(true);

    try {
      const parsed = await parseRawRecipeWithAI(rawText.trim());
      setTitle(parsed.title);
      setCategory(parsed.category);
      if (parsed.mealTypes && parsed.mealTypes.length > 0) {
        setMealTypes(parsed.mealTypes);
      }
      setIngredients(
        parsed.ingredients.map((ing, idx) => ({
          id: (idx + 1).toString(),
          name: ing.name,
          amount: ing.amount || '',
        }))
      );
      setSeasonings(
        parsed.seasonings.map((sea, idx) => ({
          id: (idx + 1).toString(),
          name: sea.name,
          amount: sea.amount || '',
        }))
      );
      setSteps(parsed.steps.length > 0 ? parsed.steps : ['']);
      setPrepTime(parseMinutes(parsed.prepTime) || 15);
      setCookTime(parseMinutes(parsed.cookTime) || 20);
      setServings(Number(parsed.servings) || 4);
      if (parsed.notes) setNotes(parsed.notes);
      if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
      setShowRawPasteModal(false);
      setRawText('');
    } catch (err: any) {
      setAiError(err.message || 'Gagal memproses teks.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning('Nama masakan tidak boleh kosong!');
      return;
    }

    const cleanIngredients = ingredients.filter((i) => i.name.trim().length > 0);
    const cleanSeasonings = seasonings.filter((s) => s.name.trim().length > 0);
    const cleanSteps = steps.filter((s) => s.trim().length > 0);

    const recipe: Recipe = {
      id: initialRecipe?.id || 'resep-' + Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      category: category.trim() || 'Lauk Utama',
      mealTypes,
      images,
      ingredients: cleanIngredients,
      seasonings: cleanSeasonings,
      steps: cleanSteps,
      prepTime: parseMinutes(prepTime),
      cookTime: parseMinutes(cookTime),
      servings: Number(servings) || 2,
      notes: notes.trim(),
      videoUrl: videoUrl.trim() || undefined,
      createdAt: initialRecipe?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(recipe);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Top Banner AI Tools */}
      <div className="bg-gradient-to-r from-sage-50 to-sage-100 p-4 sm:p-5 rounded-2xl border border-sage-300 shadow-sage-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-500 text-white flex items-center justify-center shadow-sm shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sage-900 text-sm sm:text-base">
              Bantuan Asisten AI
            </h4>
            <p className="text-sage-600 text-xs sm:text-sm">
              Ketikkan judul resep lalu tekan auto-generate, atau paste teks mentah resep Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            disabled={isAiLoading}
            onClick={handleAIGenerate}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAiLoading ? 'Menyusun...' : 'AI Auto-Fill'}</span>
          </button>
          <button
            type="button"
            disabled={isAiLoading}
            onClick={() => setShowRawPasteModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-sage-50 text-sage-800 font-medium text-xs sm:text-sm border border-sage-300 flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <ClipboardPaste className="w-4 h-4 text-sage-600" />
            <span>Paste Teks</span>
          </button>
        </div>
      </div>

      {aiError && (
        <div className="p-3.5 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {/* 1. Basic Info */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-sage-200 shadow-sage-sm space-y-5">
        <h3 className="font-bold text-sage-900 text-lg border-b border-sage-100 pb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold">
            1
          </span>
          Informasi Utama Menu
        </h3>

        <div>
          <label className="block text-xs font-semibold text-sage-700 uppercase tracking-wider mb-1.5">
            Nama Masakan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Resep Oseng Tempe Puyuh"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sage-900 font-medium text-base transition-all"
          />
        </div>

        {/* Waktu Makan (Pagi, Siang, Malam - Multi Select) */}
        <div>
          <label className="block text-xs font-semibold text-sage-700 uppercase tracking-wider mb-2">
            Kategori Waktu Makan (Bisa pilih lebih dari satu)
          </label>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => toggleMealType('pagi')}
              className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                mealTypes.includes('pagi')
                  ? 'bg-orange-50 border-orange-400 text-orange-800 shadow-sm'
                  : 'bg-white border-sage-200 text-sage-500 hover:border-sage-300'
              }`}
            >
              <Sunrise className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="truncate">Pagi</span>
              {mealTypes.includes('pagi') && <Check className="w-3.5 h-3.5 ml-1 hidden sm:inline" />}
            </button>

            <button
              type="button"
              onClick={() => toggleMealType('siang')}
              className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                mealTypes.includes('siang')
                  ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm'
                  : 'bg-white border-sage-200 text-sage-500 hover:border-sage-300'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">Siang</span>
              {mealTypes.includes('siang') && <Check className="w-3.5 h-3.5 ml-1 hidden sm:inline" />}
            </button>

            <button
              type="button"
              onClick={() => toggleMealType('malam')}
              className={`py-2.5 sm:py-3 px-2 sm:px-3 rounded-xl border font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
                mealTypes.includes('malam')
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-800 shadow-sm'
                  : 'bg-white border-sage-200 text-sage-500 hover:border-sage-300'
              }`}
            >
              <Moon className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="truncate">Malam</span>
              {mealTypes.includes('malam') && <Check className="w-3.5 h-3.5 ml-1 hidden sm:inline" />}
            </button>
          </div>
        </div>

        {/* Jenis / Kategori Masakan (Badge) */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <label className="block text-xs font-semibold text-sage-700 uppercase tracking-wider">
              Jenis / Kategori Masakan (Badge) <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-sage-500">Klik badge cepat atau ketik jenis kustom</span>
          </div>

          {/* Quick Preset Badges */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-sage-50/50 rounded-2xl border border-sage-200/60">
            {CATEGORY_PRESETS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  category === cat
                    ? 'bg-sage-600 text-white shadow-sm ring-2 ring-sage-300'
                    : 'bg-white hover:bg-sage-100 text-sage-800 border border-sage-200'
                }`}
              >
                <span>{cat}</span>
                {category === cat && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            ))}
          </div>

          <input
            type="text"
            required
            placeholder="Atau ketik jenis olahan kustom (misal: Olahan Mie, Gulai, dsb)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sage-900 text-sm font-medium transition-all"
          />
        </div>

        {/* Porsi & Waktu Masak (Persiapan + Memasak) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs font-semibold text-sage-700 uppercase tracking-wider mb-1.5">
              Porsi Sajian
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={servings}
                onChange={(e) => setServings(Number(e.target.value) || 1)}
                className="w-full pl-4 pr-14 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sage-900 text-sm transition-all font-medium"
              />
              <span className="absolute right-4 top-2.5 text-xs text-sage-500 font-medium">Orang</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage-700 uppercase tracking-wider mb-1.5">
              Waktu Persiapan
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value) || 0)}
                className="w-full pl-3 sm:pl-4 pr-12 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sage-900 text-sm transition-all font-medium"
              />
              <span className="absolute right-3 sm:right-4 top-2.5 text-xs text-sage-500 font-medium">menit</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-sage-700 uppercase tracking-wider mb-1.5">
              Waktu Memasak
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value) || 0)}
                className="w-full pl-3 sm:pl-4 pr-12 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sage-900 text-sm transition-all font-medium"
              />
              <span className="absolute right-3 sm:right-4 top-2.5 text-xs text-sage-500 font-medium">menit</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-sage-700 uppercase tracking-wider mb-1.5">
            Deskripsi Singkat
          </label>
          <textarea
            rows={2}
            placeholder="Ceritakan keistimewaan rasa masakan ini..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sage-900 text-sm transition-all"
          />
        </div>
      </div>

      {/* 2. Upload Hingga 5 Foto Masakan */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sage-100 pb-3">
          <h3 className="font-bold text-sage-900 text-base sm:text-lg flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold">
              2
            </span>
            Foto Masakan (Maksimal 5)
          </h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sage-100 text-sage-800">
            {images.length}/5
          </span>
        </div>

        {/* Image Grid Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-sage-300 group shadow-sm bg-sage-100">
              <img src={img} alt={`Foto masakan ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeDishImage(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Hapus foto ini"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {idx === 0 && (
                <div className="absolute bottom-1.5 left-1.5 bg-sage-800/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-sm">
                  Sampul Utama
                </div>
              )}
            </div>
          ))}

          {/* Upload Button Slot */}
          {images.length < 5 && (
            <label className="aspect-square rounded-2xl border-2 border-dashed border-sage-300 hover:border-sage-500 bg-sage-50/50 hover:bg-sage-100/50 flex flex-col items-center justify-center cursor-pointer transition-all p-3 text-center">
              {isUploadingImage ? (
                <>
                  <div className="w-6 h-6 border-2 border-sage-500 border-t-transparent rounded-full animate-spin mb-1" />
                  <span className="text-xs font-semibold text-sage-700">Mengunggah...</span>
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-sage-500 mb-1" />
                  <span className="text-xs font-semibold text-sage-700">Tambah Foto</span>
                  <span className="text-[10px] text-sage-500">Bisa drag / browse</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploadingImage}
                className="hidden"
                onChange={handleDishImageUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* 3. Section Video Tutorial (YouTube, TikTok, Instagram) */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sage-100 pb-3">
          <div>
            <h3 className="font-bold text-sage-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>Link Video Tutorial (Opsional)</span>
            </h3>
            <p className="text-xs text-sage-600 mt-0.5">
              Tautkan video memasak dari YouTube, TikTok, atau Instagram agar bisa diputar langsung di detail resep.
            </p>
          </div>
          {parsedVideo && (
            <span
              className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs ${
                parsedVideo.platform === 'youtube'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : parsedVideo.platform === 'tiktok'
                  ? 'bg-slate-900 text-white'
                  : parsedVideo.platform === 'instagram'
                  ? 'bg-pink-100 text-pink-800 border border-pink-200'
                  : 'bg-sage-100 text-sage-800 border border-sage-200'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{parsedVideo.label} Terdeteksi</span>
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sage-400">
              <Video className="w-5 h-5" />
            </div>
            <input
              type="url"
              placeholder="Contoh: https://youtube.com/watch?v=... atau https://tiktok.com/@... atau https://instagram.com/reel/..."
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sage-900 text-sm transition-all"
            />
            {videoUrl && (
              <button
                type="button"
                onClick={() => setVideoUrl('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sage-400 hover:text-red-500 transition-colors"
                title="Hapus tautan video"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Live Preview Embed for YouTube */}
          {parsedVideo?.embedUrl && (
            <div className="mt-3 p-3.5 bg-sage-50 rounded-2xl border border-sage-200 space-y-2">
              <span className="text-xs font-bold text-sage-700 flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-red-600" />
                Preview Pemutar Video YouTube:
              </span>
              <div className="relative aspect-video w-full max-w-md mx-auto rounded-xl overflow-hidden border border-sage-300 bg-black shadow-sm">
                <iframe
                  src={parsedVideo.embedUrl}
                  title="Preview Video Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* Hint for TikTok / Instagram */}
          {parsedVideo && (parsedVideo.platform === 'tiktok' || parsedVideo.platform === 'instagram') && (
            <div className="p-3 bg-sage-50 rounded-xl border border-sage-200 text-xs text-sage-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sage-500 shrink-0"></span>
              <span>
                Link {parsedVideo.label} valid! Tombol tonton langsung akan otomatis muncul pada halaman detail menu.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Section Bahan Utama */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-sage-100 pb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-sage-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold shrink-0">
                4
              </span>
              <span>Daftar Bahan Utama</span>
            </h3>
            <p className="text-xs text-sage-600 mt-0.5">
              Bahan masakan pokok (contoh: Tempe, Telur Puyuh, Daging, Sayuran).
            </p>
          </div>
          <button
            type="button"
            onClick={addIngredient}
            className="self-start sm:self-auto shrink-0 px-3.5 py-2 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Bahan</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {ingredients.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3 bg-sage-50/60 rounded-2xl border border-sage-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 transition-all"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="w-5 text-center text-xs text-sage-400 font-bold shrink-0">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  placeholder="Nama Bahan (misal: Telur Puyuh)"
                  value={item.name}
                  onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 bg-white transition-all font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pl-7 sm:pl-0 sm:w-56 shrink-0">
                <input
                  type="text"
                  placeholder="Takaran (misal: 15 butir)"
                  value={item.amount || ''}
                  onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(idx)}
                  className="p-2.5 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                  title="Hapus baris"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Section Bumbu (Lengkap dengan Gambar Bumbu) */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-sage-100 pb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-sage-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold shrink-0">
                5
              </span>
              <span>Daftar Bumbu & Rempah (Ada Foto Bumbu)</span>
            </h3>
            <p className="text-xs text-sage-600 mt-0.5">
              Bumbu dapur, saus, rempah-rempah lengkap dengan opsi upload foto kemasan/bumbu.
            </p>
          </div>
          <button
            type="button"
            onClick={addSeasoning}
            className="self-start sm:self-auto shrink-0 px-3.5 py-2 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Bumbu</span>
          </button>
        </div>

        <div className="space-y-3">
          {seasonings.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 bg-sage-50/60 rounded-2xl border border-sage-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 transition-all"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="w-5 text-center text-xs text-sage-400 font-bold shrink-0 hidden sm:inline">
                  {idx + 1}.
                </span>

                {/* Seasoning thumbnail / upload button */}
                <div className="relative shrink-0">
                  {item.image ? (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-sage-300 shadow-2xs">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => updateSeasoning(idx, 'image', '')}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
                        title="Hapus foto bumbu"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <label
                      className="w-12 h-12 rounded-xl border border-dashed border-sage-300 hover:border-sage-500 bg-white flex flex-col items-center justify-center cursor-pointer transition-colors shadow-2xs"
                      title="Upload foto bumbu ini"
                    >
                      <ImageIcon className="w-4 h-4 text-sage-400" />
                      <span className="text-[8px] text-sage-500 font-medium">Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSeasoningImageUpload(idx, file);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Nama Bumbu input */}
                <input
                  type="text"
                  placeholder="Nama Bumbu (misal: Masako, Saus Sambal)"
                  value={item.name}
                  onChange={(e) => updateSeasoning(idx, 'name', e.target.value)}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 bg-white transition-all font-medium"
                />
              </div>

              {/* Takaran & Hapus button */}
              <div className="flex items-center gap-2 pl-[58px] sm:pl-0 sm:w-56 shrink-0">
                <input
                  type="text"
                  placeholder="Takaran (misal: 1 sachet, 2 sdm)"
                  value={item.amount || ''}
                  onChange={(e) => updateSeasoning(idx, 'amount', e.target.value)}
                  className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => removeSeasoning(idx)}
                  className="p-2.5 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                  title="Hapus baris"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Langkah Memasak */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-sage-200 shadow-sage-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-sage-100 pb-3">
          <div className="min-w-0">
            <h3 className="font-bold text-sage-900 text-base sm:text-lg flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-sage-200 text-sage-800 text-xs flex items-center justify-center font-bold shrink-0">
                6
              </span>
              <span>Langkah-Langkah Memasak</span>
            </h3>
            <p className="text-xs text-sage-600 mt-0.5">
              Urutan cara memasak yang jelas dan mudah dipraktikkan.
            </p>
          </div>
          <button
            type="button"
            onClick={addStep}
            className="self-start sm:self-auto shrink-0 px-3.5 py-2 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Langkah</span>
          </button>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-full bg-sage-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-2">
                {idx + 1}
              </span>
              <textarea
                rows={2}
                placeholder={`Langkah ke-${idx + 1}...`}
                value={step}
                onChange={(e) => updateStep(idx, e.target.value)}
                className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 focus:ring-2 focus:ring-sage-200 outline-none text-sm text-sage-900 transition-all font-medium"
              />
              <button
                type="button"
                onClick={() => removeStep(idx)}
                className="p-2.5 text-sage-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 mt-1"
                title="Hapus langkah"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Catatan Koki */}
      <div className="bg-white p-4 sm:p-7 rounded-3xl border border-sage-200 shadow-sage-sm space-y-3">
        <h3 className="font-bold text-sage-900 text-base flex items-center gap-2">
          Tips / Catatan Tambahan (Opsional)
        </h3>
        <textarea
          rows={2}
          placeholder="Misal: Tambahkan petai atau buncis untuk sensasi renyah..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-sm text-sage-900"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-sage-300 hover:bg-sage-100 text-sage-700 font-semibold text-sm transition-colors text-center"
          >
            Batal
          </button>
        )}
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white font-bold text-sm shadow-sage-md transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Simpan Catatan Menu</span>
        </button>
      </div>

      {/* Modal Paste Raw Text AI */}
      {showRawPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sage-300 space-y-4">
            <div className="flex items-center justify-between border-b border-sage-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-sage-900">
                <ClipboardPaste className="w-5 h-5 text-sage-600" />
                <span>Ekstrak Resep Otomatis (AI)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowRawPasteModal(false)}
                className="text-sage-400 hover:text-sage-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-sage-600">
              Paste teks resep mentah dari WhatsApp, Instagram, atau blog. Asisten AI akan otomatis memisahkan nama masakan, bahan, bumbu, dan langkah memasaknya.
            </p>

            <textarea
              rows={8}
              placeholder="Contoh:&#10;Resep Oseng Tempe Puyuh&#10;Bahan: Telur puyuh, tempe...&#10;Bumbu: Masako, kecap, saus sambal..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full p-3 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-xs font-mono text-sage-900"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRawPasteModal(false)}
                className="px-4 py-2 rounded-xl text-sage-700 hover:bg-sage-100 text-sm font-semibold"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={isAiLoading || !rawText.trim()}
                onClick={handleAIParse}
                className="px-5 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAiLoading ? 'Memproses AI...' : 'Ekstrak Resep'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};
