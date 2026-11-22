import { get, set } from 'idb-keyval';
import type { Recipe, MealPlanDay, ShoppingItem, AISettings } from '../types/recipe';

const RECIPES_KEY = 'menu_makanan_recipes';
const MEAL_PLANS_KEY = 'menu_makanan_mealplans';
const SHOPPING_KEY = 'menu_makanan_shopping';
const AI_SETTINGS_KEY = 'menu_makanan_ai_settings';

// VPS MySQL API Endpoint
export const VPS_API_BASE = 'https://router.mgentaarya.my.id/api/menu';

export const DEFAULT_AI_SETTINGS: AISettings = {
  baseUrl: 'https://router.mgentaarya.my.id/v1',
  apiKey: 'sk-e9a813ca4d8d749d-3buibr-909d375d',
  model: 'CODING-FREE',
};

// Initial Indonesian Home Dishes (Preloaded in VPS MySQL)
export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'resep-oseng-tempe-puyuh',
    title: 'Resep Oseng Tempe Puyuh',
    description: 'Menu favorit keluarga praktis dan lezat, perpaduan gurih tempe dan telur puyuh dengan bumbu rempah manis pedas.',
    category: 'Tumisan',
    mealTypes: ['siang', 'malam'],
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
    ],
    ingredients: [
      { id: '1', name: 'Telur puyuh', amount: '15 butir (rebus dan kupas)' },
      { id: '2', name: 'Tempe', amount: '1 papan (potong dadu, goreng setengah matang)' },
      { id: '3', name: 'Bawang merah', amount: '6 siung (iris tipis)' },
      { id: '4', name: 'Bawang putih', amount: '4 siung (iris tipis)' },
      { id: '5', name: 'Cabe rawit', amount: '8 buah (iris serong)' },
      { id: '6', name: 'Cabe keriting', amount: '5 buah (iris serong)' },
      { id: '7', name: 'Cabe ijo besar', amount: '3 buah (iris serong)' },
      { id: '8', name: 'Lengkuas', amount: '2 cm (memarkan)' },
      { id: '9', name: 'Daun jeruk', amount: '3 lembar (sobek)' },
      { id: '10', name: 'Daun salam', amount: '2 lembar' },
    ],
    seasonings: [
      { id: 's1', name: 'Masako / Kaldu bubuk', amount: '1 sdt', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80' },
      { id: 's2', name: 'Lada bubuk', amount: '1/2 sdt' },
      { id: 's3', name: 'Kecap manis', amount: '2-3 sdm', image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=400&auto=format&fit=crop&q=80' },
      { id: 's4', name: 'Saus sambal', amount: '1 sdm' },
      { id: 's5', name: 'Garam & Gula pasir', amount: 'Secukupnya' },
    ],
    steps: [
      'Rebus telur puyuh hingga matang, lalu rendam di air dingin dan kupas bersih.',
      'Potong dadu tempe, lalu goreng setengah matang agar teksturnya kenyal gurih.',
      'Tumis irisan bawang merah dan bawang putih hingga harum wangi.',
      'Masukkan lengkuas, daun jeruk, daun salam, serta aneka irisan cabe (rawit, keriting, cabe ijo). Aduk hingga layu.',
      'Masukkan telur puyuh dan tempe goreng, aduk rata dengan bumbu tumisan.',
      'Bumbui dengan Masako, lada bubuk, kecap manis, saus sambal, garam, dan gula. Beri sedikit air (sekitar 50 ml) agar bumbu meresap.',
      'Masak dengan api sedang hingga kuah menyusut dan bumbu terkaramelisasi gurih.',
      'Koreksi rasa, angkat dan sajikan selagi hangat dengan nasi pulen.',
    ],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    notes: 'Bisa ditambahkan petai atau buncis untuk variasi tekstur renyah.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'resep-nasi-goreng-kampung',
    title: 'Nasi Goreng Kampung Spesial',
    description: 'Sarapan praktis khas nusantara dengan aroma terasi dan telur ceplok gurih.',
    category: 'Olahan Nasi',
    mealTypes: ['pagi'],
    images: [
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop&q=80',
    ],
    ingredients: [
      { id: '1', name: 'Nasi putih dingin', amount: '2 piring' },
      { id: '2', name: 'Telur ayam', amount: '2 butir' },
      { id: '3', name: 'Daun bawang', amount: '1 batang (iris)' },
      { id: '4', name: 'Bawang merah', amount: '5 siung' },
      { id: '5', name: 'Bawang putih', amount: '3 siung' },
      { id: '6', name: 'Cabe rawit merah', amount: '5 buah' },
    ],
    seasonings: [
      { id: 's1', name: 'Terasi bakar', amount: '1/2 sdt' },
      { id: 's2', name: 'Kecap asin / Ikan', amount: '1 sdm' },
      { id: 's3', name: 'Kaldu bubuk & Garam', amount: 'Secukupnya' },
    ],
    steps: [
      'Haluskan bawang merah, bawang putih, cabe rawit, dan terasi.',
      'Panaskan minyak, orak-arik telur hingga matang, sisihkan di tepi wajan.',
      'Tumis bumbu halus hingga harum dan matang.',
      'Masukkan nasi putih, aduk cepat dengan api besar hingga bumbu tercampur rata.',
      'Bumbui dengan kecap asin dan kaldu bubuk. Masukkan daun bawang menjelang diangkat.',
    ],
    prepTime: 10,
    cookTime: 10,
    servings: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'resep-sayur-sop-daging',
    title: 'Sayur Sop Daging Bening Segar',
    description: 'Kuah bening gurih kaldu sapi dengan aneka sayuran segar, menyehatkan untuk makan malam keluarga.',
    category: 'Sup & Kuah',
    mealTypes: ['malam'],
    images: [
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80',
    ],
    ingredients: [
      { id: '1', name: 'Daging sapi sandung lamur', amount: '300 gram (potong dadu)' },
      { id: '2', name: 'Wortel', amount: '2 buah (iris bulat)' },
      { id: '3', name: 'Kentang', amount: '2 buah (potong dadu)' },
      { id: '4', name: 'Kol', amount: '100 gram (potong kasar)' },
      { id: '5', name: 'Buncis', amount: '5 batang (potong 3 cm)' },
      { id: '6', name: 'Daun seledri & bawang', amount: '2 batang' },
    ],
    seasonings: [
      { id: 's1', name: 'Bawang putih geprek', amount: '5 siung' },
      { id: 's2', name: 'Pala bubuk', amount: '1/4 sdt' },
      { id: 's3', name: 'Lada bubuk & Garam', amount: 'Secukupnya' },
      { id: 's4', name: 'Bawang goreng', amount: 'Untuk taburan' },
    ],
    steps: [
      'Rebus daging sapi hingga empuk, buang buih kaldu yang mengapung.',
      'Tumis bawang putih geprek hingga harum, masukkan ke dalam air rebusan daging.',
      'Masukkan kentang dan wortel, masak hingga setengah empuk.',
      'Masukkan buncis dan kol, bumbui dengan lada, pala, dan garam.',
      'Sesaat sebelum diangkat, masukkan daun seledri dan daun bawang.',
      'Sajikan dengan taburan bawang goreng harum.',
    ],
    prepTime: 20,
    cookTime: 35,
    servings: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper to safely get from IDB with fallback
async function getStorageItem<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const val = await get(key);
    if (val !== undefined && val !== null) return val as T;
  } catch (e) {
    console.warn(`IDB read error for ${key}, checking localStorage:`, e);
  }

  try {
    const local = localStorage.getItem(key);
    if (local) return JSON.parse(local) as T;
  } catch {
    /* ignore */
  }

  return defaultValue;
}

async function setStorageItem<T>(key: string, value: T): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await set(key, value);
  } catch (e) {
    console.warn(`IDB write error for ${key}:`, e);
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota exceptions */
  }
}

// Check VPS MySQL database health
export async function checkVpsDbStatus(): Promise<{ connected: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${VPS_API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      return { connected: true, message: `MySQL VPS Aktif (${data.database})` };
    }
    return { connected: false, message: `Server error (${res.status})` };
  } catch (err: any) {
    return { connected: false, message: 'Offline / Mode Lokal' };
  }
}

// Recipes CRUD with VPS MySQL sync
export async function getRecipes(): Promise<Recipe[]> {
  // 1. Try fetching live from VPS MySQL first
  try {
    if (typeof window !== 'undefined') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${VPS_API_BASE}/recipes`, { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          // Cache to IDB
          await setStorageItem(RECIPES_KEY, json.data);
          return json.data;
        }
      }
    }
  } catch {
    // Silently fall back to cached local storage
  }

  // 2. Fall back to local IndexedDB
  const recipes = await getStorageItem<Recipe[]>(RECIPES_KEY, []);
  if (recipes.length === 0) {
    await setStorageItem(RECIPES_KEY, INITIAL_RECIPES);
    return INITIAL_RECIPES;
  }
  return recipes;
}

export async function getRecipeById(id: string): Promise<Recipe | undefined> {
  const recipes = await getRecipes();
  return recipes.find((r) => r.id === id);
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const recipes = await getRecipes();
  const index = recipes.findIndex((r) => r.id === recipe.id);
  const now = new Date().toISOString();

  let updatedRecipe: Recipe;
  if (index >= 0) {
    updatedRecipe = { ...recipe, updatedAt: now };
    recipes[index] = updatedRecipe;
  } else {
    updatedRecipe = {
      ...recipe,
      createdAt: recipe.createdAt || now,
      updatedAt: now,
    };
    recipes.unshift(updatedRecipe);
  }

  // Save to local cache
  await setStorageItem(RECIPES_KEY, recipes);

  // Sync to VPS MySQL asynchronously
  try {
    fetch(`${VPS_API_BASE}/recipes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRecipe),
    }).catch((err) => console.warn('Sync to VPS MySQL failed:', err));
  } catch (e) {
    console.warn('Sync recipe error:', e);
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await getRecipes();
  const filtered = recipes.filter((r) => r.id !== id);
  await setStorageItem(RECIPES_KEY, filtered);

  // Sync delete to VPS MySQL
  try {
    fetch(`${VPS_API_BASE}/recipes/${id}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Sync delete to VPS MySQL failed:', err));
  } catch (e) {
    console.warn('Sync delete recipe error:', e);
  }
}

// Meal Plans
export async function getMealPlans(): Promise<Record<string, MealPlanDay>> {
  // Try fetching from VPS
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`${VPS_API_BASE}/meal-plans`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const map: Record<string, MealPlanDay> = {};
          json.data.forEach((p: any) => {
            map[p.day] = {
              date: p.day,
              dayName: p.dayName,
              meals: p.meals || {},
              notes: p.notes,
            };
          });
          await setStorageItem(MEAL_PLANS_KEY, map);
          return map;
        }
      }
    }
  } catch {
    /* fallback to local */
  }

  return await getStorageItem<Record<string, MealPlanDay>>(MEAL_PLANS_KEY, {});
}

export async function saveMealPlan(plan: MealPlanDay): Promise<void> {
  const plans = await getMealPlans();
  plans[plan.date] = plan;
  await setStorageItem(MEAL_PLANS_KEY, plans);

  // Sync to VPS MySQL
  try {
    const list = Object.values(plans).map((p) => ({
      day: p.date,
      dayName: p.dayName,
      meals: p.meals,
      notes: p.notes,
    }));
    fetch(`${VPS_API_BASE}/meal-plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(list),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

// Shopping List
export async function getShoppingList(): Promise<ShoppingItem[]> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch(`${VPS_API_BASE}/shopping`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          await setStorageItem(SHOPPING_KEY, json.data);
          return json.data;
        }
      }
    }
  } catch {
    /* fallback to local */
  }

  return await getStorageItem<ShoppingItem[]>(SHOPPING_KEY, []);
}

export async function saveShoppingList(items: ShoppingItem[]): Promise<void> {
  await setStorageItem(SHOPPING_KEY, items);

  // Sync to VPS MySQL
  try {
    fetch(`${VPS_API_BASE}/shopping`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

// AI Settings
export async function getAISettings(): Promise<AISettings> {
  return await getStorageItem<AISettings>(AI_SETTINGS_KEY, DEFAULT_AI_SETTINGS);
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  await setStorageItem(AI_SETTINGS_KEY, settings);
}

// Export & Import
export async function exportAllData(): Promise<string> {
  const [recipes, mealPlans, shopping, aiSettings] = await Promise.all([
    getRecipes(),
    getMealPlans(),
    getShoppingList(),
    getAISettings(),
  ]);

  const payload = {
    appName: 'Catatan Menu Makanan',
    database: 'MySQL 51.79.152.173 (db_catatan_menu)',
    exportedAt: new Date().toISOString(),
    version: '2.0',
    data: { recipes, mealPlans, shopping, aiSettings },
  };

  return JSON.stringify(payload, null, 2);
}

export async function importAllData(jsonStr: string): Promise<boolean> {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.data) return false;

    if (Array.isArray(parsed.data.recipes)) {
      await setStorageItem(RECIPES_KEY, parsed.data.recipes);
      // Push each recipe to VPS MySQL
      parsed.data.recipes.forEach((r: Recipe) => {
        fetch(`${VPS_API_BASE}/recipes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(r),
        }).catch(() => {});
      });
    }
    if (parsed.data.mealPlans) {
      await setStorageItem(MEAL_PLANS_KEY, parsed.data.mealPlans);
    }
    if (Array.isArray(parsed.data.shopping)) {
      await setStorageItem(SHOPPING_KEY, parsed.data.shopping);
      fetch(`${VPS_API_BASE}/shopping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data.shopping),
      }).catch(() => {});
    }
    if (parsed.data.aiSettings) {
      await setStorageItem(AI_SETTINGS_KEY, parsed.data.aiSettings);
    }
    return true;
  } catch (e) {
    console.error('Import failed:', e);
    return false;
  }
}
