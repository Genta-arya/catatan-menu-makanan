import { getAISettings } from './storage';
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

// Clean and extract JSON from model responses (which may include reasoning or markdown)
function extractJSON<T>(text: string): T | null {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch {
    /* continue */
  }

  try {
    // 2. Remove markdown code fences ```json ... ```
    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
    return JSON.parse(cleaned);
  } catch {
    /* continue */
  }

  try {
    // 3. Find first { and last }
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

async function call9RouterChat(messages: Array<{ role: string; content: string }>, maxTokens = 2500): Promise<string> {
  const settings = await getAISettings();
  const url = `${settings.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const payload = {
    model: settings.model || 'CODING-FREE',
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
    stream: false,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`9Router Error (${response.status}): ${errText}`);
  }

  const rawText = await response.text();

  // 1. Check if response is Server-Sent Events (SSE) format
  if (rawText.includes('data: ') && (rawText.includes('"delta"') || rawText.includes('[DONE]'))) {
    let accumulated = '';
    const lines = rawText.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const chunk = JSON.parse(jsonStr);
        const delta = chunk.choices?.[0]?.delta;
        if (delta?.content) accumulated += delta.content;
      } catch {
        /* skip invalid chunk */
      }
    }
    if (accumulated.trim()) return accumulated;
  }

  // 2. Standard JSON response
  let data: any;
  try {
    data = JSON.parse(rawText);
  } catch {
    const start = rawText.indexOf('{');
    const end = rawText.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      data = JSON.parse(rawText.substring(start, end + 1));
    } else {
      throw new Error(`Gagal membaca respon 9Router: ${rawText.slice(0, 200)}`);
    }
  }

  const message = data.choices?.[0]?.message;
  if (!message) {
    throw new Error('Tidak ada respon dari model 9Router.');
  }

  // Model might return content or reasoning
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

  const rawResult = await call9RouterChat([
    { role: 'system', 'content': 'Kamu selalu menjawab HANYA dalam JSON valid tanpa markdown.' },
    { role: 'user', content: prompt },
  ]);

  const parsed = extractJSON<AIRecipeResult>(rawResult);
  if (!parsed || !parsed.title) {
    throw new Error('Format respon AI tidak dapat dibaca sebagai resep. Silakan coba kembali.');
  }

  // Sanitize
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

  const rawResult = await call9RouterChat([
    { role: 'system', 'content': 'Kamu selalu menjawab HANYA dalam JSON valid tanpa markdown.' },
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
