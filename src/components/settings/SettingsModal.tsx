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
} from 'lucide-react';
import type { AISettings } from '../../types/recipe';
import { getAISettings, saveAISettings } from '../../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AISettings>({
    baseUrl: 'https://router.mgentaarya.my.id/v1',
    apiKey: 'sk-e9a813ca4d8d749d-3buibr-909d375d',
    model: 'kc/nvidia/nemotron-3-ultra-550b-a55b:free',
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    const s = await getAISettings();
    setSettings(s);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveAISettings(settings);
    alert('Pengaturan 9Router AI berhasil disimpan!');
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
                Pengaturan AI 9Router
              </h3>
              <p className="text-xs text-sage-500">
                Konfigurasi API gateway 9Router milik Anda
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-sage-400 hover:text-sage-700">
            <X className="w-5 h-5" />
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
              <span>Target Model AI</span>
            </label>
            <input
              type="text"
              required
              placeholder="kc/nvidia/nemotron-3-ultra-550b-a55b:free"
              value={settings.model}
              onChange={(e) => setSettings({ ...settings, model: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-sage-300 focus:border-sage-500 outline-none text-xs sm:text-sm font-mono text-sage-900"
            />
            <span className="text-[10px] text-sage-400 mt-1 block">
              Rekomendasi model aktif: kc/nvidia/nemotron-3-ultra-550b-a55b:free atau openrouter/nvidia/nemotron-3-ultra-550b-a55b:free
            </span>
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
              <span>Tes Koneksi</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sage-700 hover:bg-sage-100 text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
