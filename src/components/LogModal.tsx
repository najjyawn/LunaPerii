import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  DailyLog, 
  FlowIntensity, 
  MoodType, 
  SymptomType, 
  MucusType 
} from '../types/cycle';
import { formatIndonesianDate } from '../utils/cycleCalculations';
import { 
  X, 
  Heart, 
  Droplet, 
  Smile, 
  Activity, 
  Coffee, 
  Pill, 
  Check, 
  Sparkles,
  FileText
} from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  initialLog?: DailyLog;
  onSaveLog: (log: DailyLog) => void;
}

const FLOW_OPTIONS: { id: FlowIntensity; label: string; desc: string; icon: string }[] = [
  { id: 'none', label: 'Tidak Haid', desc: 'Bersih', icon: '⚪' },
  { id: 'spotting', label: 'Bercak', desc: 'Sangat sedikit', icon: '💧' },
  { id: 'light', label: 'Ringan', desc: '1-2 pembalut/hari', icon: '🩸' },
  { id: 'medium', label: 'Sedang', desc: '3-4 pembalut/hari', icon: '🩸🩸' },
  { id: 'heavy', label: 'Deras', desc: '> 4 pembalut/hari', icon: '🩸🩸🩸' }
];

const MOOD_OPTIONS: { id: MoodType; label: string; emoji: string }[] = [
  { id: 'happy', label: 'Gembira', emoji: '😊' },
  { id: 'calm', label: 'Tenang', emoji: '😌' },
  { id: 'loving', label: 'Penuh Cinta', emoji: '🥰' },
  { id: 'energetic', label: 'Semangat', emoji: '✨' },
  { id: 'sensitive', label: 'Sensitif', emoji: '🥺' },
  { id: 'tired', label: 'Lelah', emoji: '🥱' },
  { id: 'crampy', label: 'Kram', emoji: '😣' },
  { id: 'irritated', label: 'Kesal', emoji: '😤' },
  { id: 'anxious', label: 'Cemas', emoji: '😰' }
];

const SYMPTOM_OPTIONS: { id: SymptomType; label: string; icon: string }[] = [
  { id: 'cramps', label: 'Kram Perut', icon: '💥' },
  { id: 'headache', label: 'Sakit Kepala', icon: '🤕' },
  { id: 'bloating', label: 'Perut Kembung', icon: '🎈' },
  { id: 'breast_tenderness', label: 'Payudara Nyeri', icon: '🌸' },
  { id: 'backache', label: 'Sakit Pinggang', icon: '⚡' },
  { id: 'acne', label: 'Muncul Jerawat', icon: '✨' },
  { id: 'cravings', label: 'Ngidam Manis', icon: '🍫' },
  { id: 'insomnia', label: 'Sulit Tidur', icon: '🌙' },
  { id: 'nausea', label: 'Mual', icon: '🤢' },
  { id: 'fatigue', label: 'Lemas Badan', icon: '💤' }
];

const MUCUS_OPTIONS: { id: MucusType; label: string; desc: string }[] = [
  { id: 'dry', label: 'Kering', desc: 'Tidak ada cairan' },
  { id: 'sticky', label: 'Lengket', desc: 'Kental putih' },
  { id: 'creamy', label: 'Krimi', desc: 'Lembut seperti lotion' },
  { id: 'watery', label: 'Cair Bening', desc: 'Basah & licin' },
  { id: 'egg_white', label: 'Putih Telur', desc: 'Elastis (Paling Subur)' }
];

export const LogModal: React.FC<LogModalProps> = ({
  isOpen,
  onClose,
  date,
  initialLog,
  onSaveLog
}) => {
  const [flow, setFlow] = useState<FlowIntensity>(initialLog?.flow || 'none');
  const [moods, setMoods] = useState<MoodType[]>(initialLog?.moods || []);
  const [symptoms, setSymptoms] = useState<SymptomType[]>(initialLog?.symptoms || []);
  const [waterGlasses, setWaterGlasses] = useState<number>(initialLog?.waterGlasses || 6);
  const [mucus, setMucus] = useState<MucusType | undefined>(initialLog?.mucus);
  const [tookPill, setTookPill] = useState<boolean>(initialLog?.tookPill || false);
  const [hadSex, setHadSex] = useState<boolean>(initialLog?.hadSex || false);
  const [notes, setNotes] = useState<string>(initialLog?.notes || '');

  useEffect(() => {
    if (initialLog) {
      setFlow(initialLog.flow || 'none');
      setMoods(initialLog.moods || []);
      setSymptoms(initialLog.symptoms || []);
      setWaterGlasses(initialLog.waterGlasses || 6);
      setMucus(initialLog.mucus);
      setTookPill(initialLog.tookPill || false);
      setHadSex(initialLog.hadSex || false);
      setNotes(initialLog.notes || '');
    } else {
      setFlow('none');
      setMoods([]);
      setSymptoms([]);
      setWaterGlasses(6);
      setMucus(undefined);
      setTookPill(false);
      setHadSex(false);
      setNotes('');
    }
  }, [initialLog, date, isOpen]);

  if (!isOpen) return null;

  const toggleMood = (id: MoodType) => {
    setMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleSymptom = (id: SymptomType) => {
    setSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedLog: DailyLog = {
      date,
      isPeriod: flow !== 'none',
      flow,
      moods,
      symptoms,
      waterGlasses,
      mucus,
      tookPill,
      hadSex,
      notes
    };

    onSaveLog(updatedLog);

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#f43f5e', '#fda4af', '#f472b6', '#fed7aa']
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-rose-100"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/50">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Jurnal Kesehatan & Gejala</span>
            </div>
            <h2 className="text-lg font-bold text-slate-800 font-display">
              {formatIndonesianDate(date)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-rose-100/60 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSave} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* Section 1: Aliran Haid (Flow) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Aliran Darah Haid (Menstruasi)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {FLOW_OPTIONS.map((opt) => {
                const isSelected = flow === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFlow(opt.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-500 border-rose-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 hover:border-rose-200 text-slate-700'
                    }`}
                  >
                    <span className="text-lg mb-1">{opt.icon}</span>
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-rose-100' : 'text-slate-400'
                      }`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Suasana Hati (Moods) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              2. Suasana Hati & Mood (Pilih yang dirasakan)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((opt) => {
                const isSelected = moods.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleMood(opt.id)}
                    className={`py-2 px-3 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-100/90 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Gejala Fisik */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              3. Gejala Fisik Tubuh
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map((opt) => {
                const isSelected = symptoms.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleSymptom(opt.id)}
                    className={`py-2 px-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-rose-100 border-rose-300 text-rose-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Hidrasi Air Putih */}
          <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-sky-500 fill-sky-400" />
                Asupan Air Putih ({waterGlasses} Gelas)
              </span>
              <span className="text-xs font-medium text-sky-700">
                Target: 8 gelas (2 Liter)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap mt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isFilled = num <= waterGlasses;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWaterGlasses(num === waterGlasses ? num - 1 : num)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isFilled
                        ? 'bg-sky-500 text-white shadow-xs scale-105'
                        : 'bg-white border border-sky-200 text-sky-300 hover:bg-sky-100'
                    }`}
                    title={`${num} Gelas`}
                  >
                    <Droplet className="w-4 h-4 fill-current" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Cairan Serviks (Subur Check) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              4. Karakteristik Cairan Serviks (Opsional)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MUCUS_OPTIONS.map((opt) => {
                const isSelected = mucus === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMucus(isSelected ? undefined : opt.id)}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-100 border-purple-300 text-purple-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Pil & Keintiman Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTookPill(!tookPill)}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                tookPill
                  ? 'bg-teal-50 border-teal-300 text-teal-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  tookPill ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Pill className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Minum Vitamin/Pil</div>
                <div className="text-[10px] text-slate-500">
                  {tookPill ? 'Sudah diminum' : 'Belum diminum'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHadSex(!hadSex)}
              className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                hadSex
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  hadSex ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold">Aktivitas Intim</div>
                <div className="text-[10px] text-slate-500">
                  {hadSex ? 'Tercatat' : 'Tidak ada'}
                </div>
              </div>
            </button>
          </div>

          {/* Section 7: Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Catatan Pribadi Hari Ini
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ceritakan harimu, makanan yang kamu konsumsi, atau hal khusus yang dirasakan..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Sticky footer submit button inside modal */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Catatan Hari Ini</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
