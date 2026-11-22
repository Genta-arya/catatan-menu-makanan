export function parseMinutes(val: any): number {
  if (typeof val === 'number') {
    return isNaN(val) ? 0 : Math.round(val);
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/,/g, '.').trim();
    const match = cleaned.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }
  return 0;
}

export function getTotalCookingTime(prep?: any, cook?: any): number {
  return parseMinutes(prep) + parseMinutes(cook);
}

export const CATEGORY_PRESETS = [
  'Tumisan',
  'Sup & Kuah',
  'Gorengan',
  'Bakaran / Panggang',
  'Kukusan',
  'Olahan Nasi',
  'Olahan Mie & Pasta',
  'Sayuran',
  'Sambal & Saus',
  'Lauk Utama',
  'Camilan & Kudapan',
] as const;
