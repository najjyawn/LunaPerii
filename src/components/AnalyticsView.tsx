import React from 'react';
import { PeriodCycle, DailyLog, CycleSettings } from '../types/cycle';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/cycleCalculations';

interface AnalyticsViewProps {
  cycles: PeriodCycle[];
  logs: Record<string, DailyLog>;
  settings: CycleSettings;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  cycles,
  logs,
  settings
}) => {
  // Compute average cycle length and period length
  const totalCycles = cycles.length;
  const avgCycleLength = totalCycles > 0
    ? Math.round(cycles.reduce((acc, c) => acc + (c.cycleLength || settings.cycleLength), 0) / totalCycles)
    : settings.cycleLength;

  const avgPeriodLength = totalCycles > 0
    ? Math.round(cycles.reduce((acc, c) => acc + (c.periodLength || settings.periodLength), 0) / totalCycles)
    : settings.periodLength;

  // Regularity score (standard deviation of cycle lengths)
  const cycleLengths = cycles.map((c) => c.cycleLength || settings.cycleLength);
  const variance = cycleLengths.reduce((acc, val) => acc + Math.pow(val - avgCycleLength, 2), 0) / (totalCycles || 1);
  const stdDev = Math.sqrt(variance);
  const regularity = stdDev <= 2 ? 'Sangat Teratur' : stdDev <= 4 ? 'Cukup Teratur' : 'Bervariasi';

  // Aggregate symptoms
  const symptomCounts: Record<string, number> = {};
  Object.values(logs).forEach((log) => {
    log.symptoms?.forEach((sym) => {
      symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
    });
  });

  const symptomLabels: Record<string, string> = {
    cramps: 'Kram Perut',
    headache: 'Sakit Kepala',
    bloating: 'Perut Kembung',
    breast_tenderness: 'Payudara Nyeri',
    backache: 'Sakit Pinggang',
    acne: 'Jerawat',
    cravings: 'Ngidam Manis',
    insomnia: 'Sulit Tidur',
    fatigue: 'Lemas Badan',
    nausea: 'Mual'
  };

  const sortedSymptoms = Object.entries(symptomCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Cycle Length */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">
            Rata-rata Siklus
          </div>
          <div className="text-3xl font-extrabold text-slate-800 font-display tabular-nums">
            {avgCycleLength} <span className="text-sm font-medium text-slate-500">Hari</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Rentang normal sehat: 21 - 35 hari
          </p>
          <div className="absolute right-3 bottom-3 opacity-10">
            <Calendar className="w-16 h-16 text-rose-500" />
          </div>
        </div>

        {/* Card 2: Period Duration */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">
            Rata-rata Lama Haid
          </div>
          <div className="text-3xl font-extrabold text-slate-800 font-display tabular-nums">
            {avgPeriodLength} <span className="text-sm font-medium text-slate-500">Hari</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Rentang umum haid normal: 3 - 7 hari
          </p>
          <div className="absolute right-3 bottom-3 opacity-10">
            <Heart className="w-16 h-16 text-rose-500" />
          </div>
        </div>

        {/* Card 3: Regularity */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">
            Tingkat Keteraturan
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-display flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
            <span>{regularity}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Variasi siklusmu berada dalam batas ideal.
          </p>
        </div>
      </div>

      {/* Past Cycles History Chart */}
      <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-display">
              Riwayat Panjang Siklus Terakhir
            </h3>
            <p className="text-xs text-slate-500">
              Visualisasi durasi siklus dan lama menstruasi dari waktu ke waktu
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {cycles.map((cycle, idx) => {
            const cycleDuration = cycle.cycleLength || settings.cycleLength;
            const periodDuration = cycle.periodLength || settings.periodLength;
            const widthPercent = Math.min(100, Math.round((cycleDuration / 40) * 100));

            return (
              <div key={cycle.id || idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">
                    Mulai: {formatIndonesianDate(cycle.startDate)}
                  </span>
                  <span className="text-slate-500 font-semibold tabular-nums">
                    {cycleDuration} Hari ({periodDuration} hari haid)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-xl overflow-hidden flex items-center p-1">
                  {/* Period days portion */}
                  <div
                    style={{ width: `${(periodDuration / cycleDuration) * 100}%` }}
                    className="bg-rose-500 h-full rounded-lg text-white text-[10px] flex items-center justify-center font-bold"
                    title={`${periodDuration} hari haid`}
                  >
                    Haid
                  </div>
                  {/* Remaining cycle days */}
                  <div className="flex-1 bg-rose-100/60 h-full rounded-r-lg" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequent Symptoms & Body Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 font-display mb-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Pola Gejala yang Sering Muncul</span>
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Catatan dari jurnal harian tubuhmu
          </p>

          {sortedSymptoms.length > 0 ? (
            <div className="space-y-2.5">
              {sortedSymptoms.map(([key, count]) => (
                <div key={key} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-rose-50/50">
                  <span className="font-semibold text-slate-700">
                    {symptomLabels[key] || key}
                  </span>
                  <span className="font-bold text-rose-600 bg-white px-2 py-0.5 rounded-lg border border-rose-100 tabular-nums">
                    {count}x dicatat
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              Belum banyak gejala tercatat. Catat gejalamu setiap hari di tab Beranda!
            </div>
          )}
        </div>

        {/* 4 Hormonal Phases Educational Card */}
        <div className="bg-gradient-to-br from-rose-50/70 via-pink-50/50 to-purple-50/60 rounded-3xl p-6 border border-rose-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 font-display mb-1 flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-600" />
            <span>Panduan 4 Musim Hormon Wanita</span>
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            Memahami ritme alami tubuhmu
          </p>

          <div className="space-y-2.5 text-xs">
            <div className="p-2.5 bg-white/90 rounded-2xl border border-rose-100">
              <span className="font-bold text-rose-600">1. Musim Dingin (Haid):</span> Estrogen & progesteron di titik terendah. Tubuh butuh istirahat, kehangatan, dan makanan bergizi.
            </div>
            <div className="p-2.5 bg-white/90 rounded-2xl border border-amber-100">
              <span className="font-bold text-amber-600">2. Musim Semi (Folikular):</span> Estrogen naik. Otak tajam, mood ceria, stamina meningkat drastis!
            </div>
            <div className="p-2.5 bg-white/90 rounded-2xl border border-purple-100">
              <span className="font-bold text-purple-600">3. Musim Panas (Ovulasi):</span> Hormon LH memuncak. Kulit cerah bercahaya, komunikasi lancar, dan daya tarik memuncak.
            </div>
            <div className="p-2.5 bg-white/90 rounded-2xl border border-orange-100">
              <span className="font-bold text-orange-600">4. Musim Gugur (Luteal):</span> Progesteron naik lalu turun. Wajar ingin me-time, ngemil, dan refleksi diri.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
