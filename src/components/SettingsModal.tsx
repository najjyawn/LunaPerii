import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CycleSettings, PeriodCycle } from '../types/cycle';
import { X, Settings, Shield, RefreshCw, User, Calendar, Check } from 'lucide-react';
import { formatDateToISO, formatIndonesianDate } from '../utils/cycleCalculations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CycleSettings;
  onSaveSettings: (settings: CycleSettings) => void;
  onResetData: () => void;
  latestPeriodDate: string;
  onUpdateLatestPeriodDate: (newDate: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetData,
  latestPeriodDate,
  onUpdateLatestPeriodDate
}) => {
  const [userName, setUserName] = useState(settings.userName || 'Bella');
  const [cycleLength, setCycleLength] = useState(settings.cycleLength || 28);
  const [periodLength, setPeriodLength] = useState(settings.periodLength || 5);
  const [lutealLength, setLutealLength] = useState(settings.lutealLength || 14);
  const [discreetMode, setDiscreetMode] = useState(settings.discreetMode || false);
  const [lastPeriodInput, setLastPeriodInput] = useState(latestPeriodDate);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      userName: userName.trim() || 'Teman Luna',
      cycleLength: Number(cycleLength),
      periodLength: Number(periodLength),
      lutealLength: Number(lutealLength),
      discreetMode
    });

    if (lastPeriodInput && lastPeriodInput !== latestPeriodDate) {
      onUpdateLatestPeriodDate(lastPeriodInput);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-rose-100 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 font-display">
                Pengaturan Siklus & Profil
              </h2>
              <p className="text-xs text-slate-500">Sesuaikan prediksi dengan ritme tubuhmu</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* User Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-rose-500" />
              Nama Panggilan
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Contoh: Bella"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
              required
            />
          </div>

          {/* Last Period Start Date */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              Tanggal Awal Menstruasi Terakhir
            </label>
            <input
              type="date"
              value={lastPeriodInput}
              onChange={(e) => setLastPeriodInput(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 font-medium"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Saat ini: {formatIndonesianDate(latestPeriodDate)}
            </span>
          </div>

          {/* Cycle Length Slider */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
              <span>Panjang Siklus Rata-rata</span>
              <span className="text-rose-600 font-bold tabular-nums">{cycleLength} Hari</span>
            </div>
            <input
              type="range"
              min="21"
              max="40"
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>21 hari (Pendek)</span>
              <span>28 hari (Standar)</span>
              <span>40 hari (Panjang)</span>
            </div>
          </div>

          {/* Period Duration Slider */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
              <span>Lama Darah Haid Keluar</span>
              <span className="text-rose-600 font-bold tabular-nums">{periodLength} Hari</span>
            </div>
            <input
              type="range"
              min="2"
              max="9"
              value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2 hari</span>
              <span>5 hari (Umum)</span>
              <span>9 hari</span>
            </div>
          </div>

          {/* Privacy Discreet Mode Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-purple-900">Mode Privasi (Samarkan Layar)</div>
                <div className="text-[11px] text-purple-700 leading-tight">
                  Sembunyikan angka detail siklus saat di tempat umum
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={discreetMode}
              onChange={(e) => setDiscreetMode(e.target.checked)}
              className="w-4 h-4 accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Reset Demo Data Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset semua riwayat dan kembali ke data contoh bawaan?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset ke Data Demo Awal</span>
            </button>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-semibold shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
