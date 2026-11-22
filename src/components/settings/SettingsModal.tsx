import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Check,
  AlertCircle,
  Key,
  Globe,
  Cpu,
  RefreshCw,
  ShieldCheck,
  Database,
} from 'lucide-react';
import type { AISettings } from '../../types/recipe';
import { getAISettings, saveAISettings, checkVpsDbStatus } from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>({
    baseUrl: 'https://router.mgentaarya.my.id/v1',
    apiKey: 'sk-e9a813ca4d8d749d-3buibr-909d375d',
    model: 'CODING-FREE',
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Memeriksa database...',
  });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      checkDb();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const s = await getAISettings();
    setSettings(s);
  };

  const checkDb = async () => {
    const res = await checkVpsDbStatus();
    setDbStatus(res);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAISettings(settings);
    alert('Pengaturan 9Router AI & Database berhasil disimpan!');
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Menghubungkan ke 9Router...');

    try {
      const url = `${settings.baseUrl.replace(/\/+$/, '')}/models`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const modelCount = data.data?.length || 0;
        setTestStatus('success');
        setTestMessage(`Koneksi Sukses! Terhubung ke 9Router (${modelCount} model tersedia).`);
      } else {
        const errText = await res.text();
        setTestStatus('error');
        setTestMessage(`Gagal (${res.status}): ${errText.slice(0, 100)}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(`Error: ${err.message || 'Tidak dapat menghubungi server 9Router'}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-sage-300 space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-sage-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sage-950 text-base">
                Pengaturan AI 9Router & Database
              </h3>
              <p className="text-xs text-sage-500 font-medium">
                Konfigurasi Combo AI & Database VPS
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

        {/* Database Status Card */}
        <div className="p-3.5 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${dbStatus.connected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
              <Database className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-sage-900 block">Database MySQL Server</span>
              <span className="text-[11px] text-sage-600 block">{dbStatus.message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={checkDb}
            className="text-[11px] font-bold text-sage-700 hover:text-sage-950 underline px-2 py-1"
          >
            Cek Lagi
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sage-500" />
              <span>Base URL 9Router</span>
            </label>
            <input
              type="url"
              required
              value={settings.baseUrl}
              onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-xs sm:text-sm font-mono text-sage-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-sage-500" />
              <span>API Key</span>
            </label>
            <input
              type="password"
              required
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-xs sm:text-sm font-mono text-sage-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sage-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-sage-500" />
              <span>Target Model / Combo AI</span>
            </label>
            <input
              type="text"
              required
              placeholder="CODING-FREE"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-xs sm:text-sm font-mono text-sage-900 font-bold"
            />
            {/* Model Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, model: 'CODING-FREE' })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  settings.model === 'CODING-FREE'
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
              >
                ✨ CODING-FREE (Combo)
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, model: 'kc/nvidia/nemotron-3-ultra-550b-a55b:free' })}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  settings.model === 'kc/nvidia/nemotron-3-ultra-550b-a55b:free'
                    ? 'bg-sage-600 text-white shadow-sm'
                    : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                }`}
              >
                Nemotron Ultra (Free)
              </button>
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testStatus === 'testing'
                  ? 'bg-sage-50 border-sage-200 text-sage-700'
                  : testStatus === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 animate-spin shrink-0" />}
              {testStatus === 'success' && <ShieldCheck className="w-4 h-4 shrink-0 text-green-600" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />}
              <span>{testMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="px-3.5 py-2 rounded-xl bg-sage-100 hover:bg-sage-200 text-sage-800 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Tes Koneksi 9Router</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-sage-200 text-sage-600 text-xs font-semibold hover:bg-sage-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-sage-sm flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Simpan</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
