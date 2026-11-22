export type MealType = 'pagi' | 'siang' | 'malam';

export interface IngredientItem {
  id: string;
  name: string;
  amount?: string;
  image?: string; // base64 or url
}

export interface SeasoningItem {
  id: string;
  name: string;
  amount?: string;
  image?: string; // base64 or url
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  mealTypes: MealType[]; // e.g. ['pagi'], ['pagi', 'siang'], ['malam']
  category: string;      // e.g. 'Tumisan', 'Sup & Kuah', 'Gorengan', 'Olahan Telur', 'Sayuran', 'Lauk Utama'
  images: string[];      // Up to 5 dish images
  ingredients: IngredientItem[];
  seasonings: SeasoningItem[];
  steps: string[];
  prepTime?: number;     // minutes
  cookTime?: number;     // minutes
  servings?: number;     // portions
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanDay {
  date: string;          // YYYY-MM-DD
  pagiRecipeId?: string;
  siangRecipeId?: string;
  malamRecipeId?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: string;
  isChecked: boolean;
  category: 'bahan' | 'bumbu' | 'lainnya';
  sourceRecipeTitle?: string;
}

export interface UserSettings {
  defaultServings: number;
  spiciness: 'tidak-pedas' | 'sedang' | 'pedas';
  cookingStyle: 'rumahan' | 'praktis' | 'sehat';
  cloudSync: boolean;
}

// Backward compatibility alias if needed
export type AISettings = UserSettings;
