import { getUserSettings, VPS_API_BASE } from './storage';
import type { Recipe, MealType } from '../types/recipe';

export interface AIRecipeResult {
  title: string;
  category: string;
  mealTypes: MealType[];
  ingredients: Array<{ name: string; amount?: string }>;
  seasonings: Array<{ name: string; amount?: string }>;
  steps: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  notes?: string;
}

// Clean and extract JSON from model responses (handles reasoning or markdown wrappers)
function extractJSON<T>(text: string): T | null {
  try {
    return JSON.parse(text);
  } catch {
    /* continue */
  }

  try {
    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
    return JSON.parse(cleaned);
  } catch {
    /* continue */
  }

  try {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.substring(firstBrace, lastBrace + 1);
      return JSON.parse(candidate);
    }
  } catch {
    /* continue */
  }

  return null;
}

// Call AI via secure backend proxy (Server manages credentials, zero client API key exposure)
async function callAIChat(messages: Array<{ role: string; content: string }>, maxTokens = 2500): Promise<string> {
  const settings = await getUserSettings();

  // Inject user preference context
  const enrichedMessages = [...messages];
  if (settings.cookingStyle || settings.spiciness) {
    const userPrefNote = `Preferensi Pengguna: Gaya masakan '${settings.cookingStyle || 'rumahan'}', tingkat kepedasan '${settings.spiciness || 'sedang'}', porsi acuan ${settings.defaultServings || 2} porsi.`;
    if (enrichedMessages[0]?.role === 'system') {
      enrichedMessages[0].content += `\n${userPrefNote}`;
    }
  }

  const chatUrl = `${VPS_API_BASE}/chat`;

  const response = await fetch(chatUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: enrichedMessages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Asisten AI sedang sibuk (${response.status}). Silakan coba beberapa saat lagi.`);
  }

  const jsonResponse = await response.json();
  const completionData = jsonResponse.data || jsonResponse;

  const message = completionData.choices?.[0]?.message;
  if (!message) {
    throw new Error('Tidak ada respon dari Asisten AI.');
  }

  const output = message.content || message.reasoning || '';
  if (!output) {
    throw new Error('Respon AI kosong.');
  }

  return output;
}

export async function generateRecipeWithAI(dishName: string, hint?: string): Promise<AIRecipeResult> {
  const prompt = `Kamu adalah asisten koki profesional masakan rumahan Indonesia.
Tugas: Buat resep lengkap dan terstruktur untuk masakan: "${dishName}".
${hint ? `Catatan/Preferensi: ${hint}` : ''}

PENTING: Pisahkan dengan jelas antara BAHAN UTAMA (ingredients) dan BUMBU (seasonings)!
Kategori waktu makan (mealTypes) bisa lebih dari satu jika cocok: 'pagi', 'siang', dan/atau 'malam'.

Kembalikan HANYA JSON murni (valid JSON) sesuai skema berikut tanpa teks obrolan apapun:
{
  "title": "${dishName}",
  "category": "Tumisan / Sup & Kuah / Gorengan / Olahan Nasi / Sayuran / Lauk Utama",
  "mealTypes": ["pagi", "siang"],
  "ingredients": [
    {"name": "Nama Bahan Utama", "amount": "Takaran (misal: 1 papan, 250 gram)"}
  ],
  "seasonings": [
    {"name": "Nama Bumbu / Rempah", "amount": "Takaran (misal: 5 siung iris, 2 sdm)"}
  ],
  "steps": [
    "Langkah 1...",
    "Langkah 2...",
    "Langkah 3..."
  ],
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "notes": "Tips memasak agar lebih gurih dan nikmat"
}`;

  const rawResult = await callAIChat([
    { role: 'system', content: 'Kamu selalu menjawab HANYA dalam JSON valid tanpa markdown.' },
    { role: 'user', content: prompt },
  ]);

  const parsed = extractJSON<AIRecipeResult>(rawResult);
  if (!parsed || !parsed.title) {
    throw new Error('Format respon AI tidak dapat dibaca sebagai resep. Silakan coba kembali.');
  }

  return {
    title: parsed.title || dishName,
    category: parsed.category || 'Lauk Utama',
    mealTypes: Array.isArray(parsed.mealTypes) && parsed.mealTypes.length > 0 ? parsed.mealTypes : ['siang'],
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    seasonings: Array.isArray(parsed.seasonings) ? parsed.seasonings : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    prepTime: Number(parsed.prepTime) || 15,
    cookTime: Number(parsed.cookTime) || 20,
    servings: Number(parsed.servings) || 4,
    notes: parsed.notes || '',
  };
}

export async function parseRawRecipeWithAI(rawRecipeText: string): Promise<AIRecipeResult> {
  const prompt = `Ekstrak dan rapikan teks resep mentah berikut ke dalam format data terstruktur.
Teks Resep Mentah:
"""
${rawRecipeText}
"""

Tugas Anda:
1. Ambil Judul masakan.
2. Identifikasi kategori waktu makan yang cocok: pilih dari ['pagi', 'siang', 'malam'] (bisa lebih dari satu).
3. PISAHKAN DENGAN TEGAS antara BAHAN UTAMA (ingredients) dan BUMBU (seasonings).
4. Buat daftar langkah memasak berurutan yang rapi.

Kembalikan HANYA JSON murni (valid JSON) sesuai skema berikut tanpa tambahan markdown atau teks lain:
{
  "title": "Judul Resep",
  "category": "Kategori masakan",
  "mealTypes": ["pagi", "siang"],
  "ingredients": [
    {"name": "Bahan", "amount": "Takaran"}
  ],
  "seasonings": [
    {"name": "Bumbu", "amount": "Takaran"}
  ],
  "steps": [
    "Langkah 1..."
  ],
  "prepTime": 15,
  "cookTime": 20,
  "servings": 4,
  "notes": "Catatan tambahan"
}`;

  const rawResult = await callAIChat([
    { role: 'system', content: 'Kamu selalu menjawab HANYA dalam JSON valid tanpa markdown.' },
    { role: 'user', content: prompt },
  ]);

  const parsed = extractJSON<AIRecipeResult>(rawResult);
  if (!parsed || !parsed.title) {
    throw new Error('AI tidak berhasil mengurai teks resep ini. Pastikan teks memuat bahan dan bumbu.');
  }

  return {
    title: parsed.title,
    category: parsed.category || 'Aneka Masakan',
    mealTypes: Array.isArray(parsed.mealTypes) && parsed.mealTypes.length > 0 ? parsed.mealTypes : ['siang', 'malam'],
    ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
    seasonings: Array.isArray(parsed.seasonings) ? parsed.seasonings : [],
    steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    prepTime: Number(parsed.prepTime) || 15,
    cookTime: Number(parsed.cookTime) || 25,
    servings: Number(parsed.servings) || 4,
    notes: parsed.notes || '',
  };
}
