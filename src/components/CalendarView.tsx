import React, { useState } from 'react';
import { 
  addDays, 
  formatDateToISO, 
  parseISODate, 
  INDONESIAN_MONTHS, 
  INDONESIAN_DAYS_SHORT,
  predictUpcomingCycles 
} from '../utils/cycleCalculations';
import { DailyLog, PeriodCycle, CycleSettings } from '../types/cycle';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Calendar as CalendarIcon, 
  Plus, 
  Droplet,
  Heart
} from 'lucide-react';

interface CalendarViewProps {
  cycles: PeriodCycle[];
  logs: Record<string, DailyLog>;
  settings: CycleSettings;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onOpenLogModal: (date: string) => void;
  onAddPeriodStart: (date: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  cycles,
  logs,
  settings,
  selectedDate,
  onSelectDate,
  onOpenLogModal,
  onAddPeriodStart
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Generate days in month grid
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0: (day + 6) % 7
  const adjustedFirstDay = (firstDayIndex + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Find latest cycle for predictions
  const sortedCycles = [...cycles].sort((a, b) => 
    parseISODate(b.startDate).getTime() - parseISODate(a.startDate).getTime()
  );
  const latestCycle = sortedCycles[0];
  const upcomingPredictions = latestCycle 
    ? predictUpcomingCycles(latestCycle.startDate, settings.cycleLength, settings.periodLength, settings.lutealLength, 6)
    : [];

  const todayStr = formatDateToISO(new Date());

  // Function to classify date
  const getDateStatus = (iso: string) => {
    const log = logs[iso];
    const isLoggedPeriod = log?.isPeriod || (log?.flow && log.flow !== 'none');

    // Check if within actual logged cycles
    let isHistoricalPeriod = isLoggedPeriod;
    if (!isHistoricalPeriod) {
      for (const c of cycles) {
        const start = parseISODate(c.startDate);
        const end = c.endDate ? parseISODate(c.endDate) : addDays(start, c.periodLength - 1);
        const cur = parseISODate(iso);
        if (cur >= start && cur <= end) {
          isHistoricalPeriod = true;
          break;
        }
      }
    }

    // Check predictions
    let isPredictedPeriod = false;
    let isPredictedOvulation = false;
    let isPredictedFertile = false;

    for (const pred of upcomingPredictions) {
      const cur = parseISODate(iso);
      const pStart = parseISODate(pred.startDate);
      const pEnd = parseISODate(pred.endDate);
      const fStart = parseISODate(pred.fertileStart);
      const fEnd = parseISODate(pred.fertileEnd);
      const ovDate = parseISODate(pred.ovulationDate);

      if (cur >= pStart && cur <= pEnd) {
        isPredictedPeriod = true;
      }
      if (cur.getTime() === ovDate.getTime()) {
        isPredictedOvulation = true;
      }
      if (cur >= fStart && cur <= fEnd) {
        isPredictedFertile = true;
      }
    }

    return {
      isPeriod: isHistoricalPeriod,
      isPredictedPeriod,
      isOvulation: isPredictedOvulation,
      isFertile: isPredictedFertile,
      hasSymptoms: log && ((log.moods?.length ?? 0) > 0 || (log.symptoms?.length ?? 0) > 0)
    };
  };

  const selectedStatus = getDateStatus(selectedDate);
  const selectedLog = logs[selectedDate];

  return (
    <div className="w-full space-y-6">
      {/* Month Navigation Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
              Kalender Siklus
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 font-display">
              {INDONESIAN_MONTHS[month]} {year}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              aria-label="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonthDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              Bulan Ini
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              aria-label="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
            <div
              key={day}
              className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Days from previous month */}
          {Array.from({ length: adjustedFirstDay }).map((_, idx) => {
            const dayNum = daysInPrevMonth - adjustedFirstDay + idx + 1;
            return (
              <div
                key={`prev-${idx}`}
                className="h-12 sm:h-14 rounded-2xl p-1 text-slate-300 text-xs flex flex-col items-center justify-center opacity-40"
              >
                {dayNum}
              </div>
            );
          })}

          {/* Days in current month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = selectedDate === iso;
            const isToday = todayStr === iso;
            const status = getDateStatus(iso);

            let bgStyle = 'bg-slate-50/50 hover:bg-rose-50/50 text-slate-700';
            let borderStyle = 'border-transparent';

            if (status.isPeriod) {
              bgStyle = 'bg-rose-500 text-white font-bold shadow-xs';
            } else if (status.isPredictedPeriod) {
              bgStyle = 'bg-rose-50 text-rose-700 border-dashed border-rose-300';
            } else if (status.isOvulation) {
              bgStyle = 'bg-purple-100 text-purple-900 font-bold border-purple-300';
            } else if (status.isFertile) {
              bgStyle = 'bg-violet-50 text-violet-800 border-violet-200';
            }

            if (isSelected) {
              borderStyle = 'ring-2 ring-rose-500 ring-offset-2';
            } else if (isToday) {
              borderStyle = 'ring-2 ring-amber-400';
            }

            return (
              <button
                key={iso}
                onClick={() => onSelectDate(iso)}
                className={`relative h-12 sm:h-14 rounded-2xl p-1 flex flex-col items-center justify-between border transition-all cursor-pointer ${bgStyle} ${borderStyle}`}
              >
                <span className="text-xs font-semibold">{dayNum}</span>

                {/* Micro indicators */}
                <div className="flex items-center gap-0.5 mt-auto mb-0.5">
                  {status.isPeriod && (
                    <span className="text-[10px] leading-none">🩸</span>
                  )}
                  {status.isOvulation && (
                    <span className="text-[10px] leading-none">🌸</span>
                  )}
                  {status.hasSymptoms && !status.isPeriod && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span>Haid (Menstruasi)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-100 border border-dashed border-rose-300 inline-block" />
            <span>Prediksi Haid</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-200 border border-purple-400 inline-block" />
            <span>Puncak Ovulasi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-violet-100 border border-violet-300 inline-block" />
            <span>Masa Subur</span>
          </div>
        </div>
      </div>

      {/* Selected Day Quick Inspector & Action */}
      <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-rose-500 mb-0.5">Detail Tanggal Terpilih:</div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800">
            {new Date(parseISODate(selectedDate)).toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {selectedStatus.isPeriod
              ? 'Tercatat sebagai hari menstruasi (aliran darah aktif).'
              : selectedStatus.isOvulation
              ? 'Prediksi hari ovulasi - sel telur dilepaskan.'
              : selectedStatus.isFertile
              ? 'Jendela masa subur wanita.'
              : selectedStatus.isPredictedPeriod
              ? 'Perkiraan jadwal menstruasi berikutnya.'
              : 'Fase reguler siklus bulanan.'}
          </p>

          {selectedLog && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selectedLog.flow && selectedLog.flow !== 'none' && (
                <span className="text-[11px] bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-medium">
                  Aliran: {selectedLog.flow}
                </span>
              )}
              {selectedLog.moods?.map((m) => (
                <span
                  key={m}
                  className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-medium"
                >
                  Mood: {m}
                </span>
              ))}
              {selectedLog.symptoms?.map((s) => (
                <span
                  key={s}
                  className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onOpenLogModal(selectedDate)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Catat / Edit Gejala</span>
          </button>

          {!selectedStatus.isPeriod && (
            <button
              onClick={() => onAddPeriodStart(selectedDate)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Tandai awal haid baru di tanggal ini"
            >
              <Droplet className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>Mulai Haid Hari Ini</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
