import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Check,
  Users,
  Flame,
  ChefHat,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import type { UserSettings } from '../../types/recipe';
import {
  getUserSettings,
  saveUserSettings,
  exportAllData,
  importAllData,
  checkVpsDbStatus,
} from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>({
    defaultServings: 2,
    spiciness: 'sedang',
    cookingStyle: 'rumahan',
    cloudSync: true,
  });

  const [dbStatus, setDbStatus] = useState<string>('Memeriksa koneksi...');
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      checkDatabase();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const s = await getUserSettings();
    setSettings(s);
  };

  const checkDatabase = async () => {
    const res = await checkVpsDbStatus();
    setDbStatus(res.connected ? 'Cloud Database Terhubung (Aktif)' : 'Mode Penyimpanan Lokal');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveUserSettings(settings);
    alert('Preferensi berhasil disimpan!');
    onClose();
  };

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dapur-radha-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengekspor data.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const ok = await importAllData(content);
      if (ok) {
        setImportStatus('Data berhasil dipulihkan!');
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        alert('File cadangan tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-sage-300 space-y-5 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sage-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <Settings className="w-5 h-5 text-sage-700" />
            </div>
            <div>
              <h3 className="font-extrabold text-sage-950 text-base">
                Pengaturan Aplikasi
              </h3>
              <p className="text-xs text-sage-500 font-medium">
                Preferensi memasak & penyimpanan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-sage-400 hover:text-sage-700 hover:bg-sage-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cloud Sync Status Card */}
        <div className="p-3.5 rounded-2xl bg-sage-50/80 border border-sage-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div>
              <span className="text-xs font-bold text-sage-900 block">Penyimpanan Cloud</span>
              <span className="text-[11px] text-sage-600 block">{dbStatus}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage-200 text-sage-800">
            Auto-Sync
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Default Servings */}
          <div>
            <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-sage-500" />
              <span>Porsi Acuan Resep (Default)</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 4, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSettings({ ...settings, defaultServings: num })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    settings.defaultServings === num
                      ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                      : 'bg-white border-sage-200 text-sage-700 hover:bg-sage-50'
                  }`}
                >
                  {num} Porsi
                </button>
              ))}
            </div>
          </div>

          {/* Spiciness Level */}
          <div>
            <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-sage-500" />
              <span>Selera Tingkat Kepedasan</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'tidak-pedas', label: 'Biasa' },
                { id: 'sedang', label: 'Sedang' },
                { id: 'pedas', label: 'Pedas Mantap' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, spiciness: item.id as any })}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                    settings.spiciness === item.id
                      ? 'bg-sage-600 text-white border-sage-600 shadow-sm'
                      : 'bg-white border-sage-200 text-sage-700 hover:bg-sage-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Chef Style */}
          <div>
            <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ChefHat className="w-3.5 h-3.5 text-sage-500" />
              <span>Gaya Kreasi Asisten AI</span>
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'rumahan', title: 'Masakan Rumahan Nusantara', desc: 'Rempah gurih kaya rasa khas keluarga' },
                { id: 'praktis', title: 'Praktis & Cepat', desc: 'Langkah ringkas di bawah 20 menit' },
                { id: 'sehat', title: 'Menu Sehat & Seimbang', desc: 'Rendah minyak, tinggi serat & gizi' },
              ].map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSettings({ ...settings, cookingStyle: style.id as any })}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    settings.cookingStyle === style.id
                      ? 'bg-sage-50/90 border-sage-500 text-sage-950 font-semibold'
                      : 'bg-white border-sage-200 text-sage-700 hover:bg-sage-50/50'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold block">{style.title}</span>
                    <span className="text-[10px] text-sage-500 block">{style.desc}</span>
                  </div>
                  {settings.cookingStyle === style.id && (
                    <Check className="w-4 h-4 text-sage-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Backup & Restore Data */}
          <div className="pt-2 border-t border-sage-100">
            <span className="block text-[11px] font-bold text-sage-600 uppercase tracking-wider mb-2">
              Cadangan Data Pribadi
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExport}
                className="flex-1 py-2 px-3 rounded-xl border border-sage-300 text-sage-700 hover:bg-sage-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-sage-500" />
                <span>Unduh JSON</span>
              </button>
              <label className="flex-1 py-2 px-3 rounded-xl border border-sage-300 text-sage-700 hover:bg-sage-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-sage-500" />
                <span>Pulihkan Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>
            {importStatus && (
              <p className="text-[11px] text-emerald-600 font-bold mt-1 text-center">
                {importStatus}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-sage-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-sage-200 text-sage-600 text-xs font-semibold hover:bg-sage-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-sage-sm flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Preferensi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
